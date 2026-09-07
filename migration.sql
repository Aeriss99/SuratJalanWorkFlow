-- 1. Create Audit History Table
CREATE TABLE IF NOT EXISTS public.sj_history (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    sj_id UUID REFERENCES public.surat_jalan(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    status_before VARCHAR(50),
    status_after VARCHAR(50),
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add New Columns to surat_jalan
ALTER TABLE public.surat_jalan
ADD COLUMN IF NOT EXISTS penerima_nama VARCHAR(255),
ADD COLUMN IF NOT EXISTS penerima_signature TEXT,
ADD COLUMN IF NOT EXISTS catatan_delivery TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Ensure nomor_dokumen is unique
ALTER TABLE public.surat_jalan DROP CONSTRAINT IF EXISTS unique_nomor_dokumen;
ALTER TABLE public.surat_jalan ADD CONSTRAINT unique_nomor_dokumen UNIQUE (nomor_dokumen);

-- 4. Enhance RLS for Data Integrity & Transitions
ALTER TABLE public.surat_jalan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sj_history ENABLE ROW LEVEL SECURITY;

-- 5. Clean old policies
DROP POLICY IF EXISTS "Anyone can view surat jalan" ON public.surat_jalan;
DROP POLICY IF EXISTS "Anyone can insert surat jalan" ON public.surat_jalan;
DROP POLICY IF EXISTS "Anyone can update non-final surat jalan" ON public.surat_jalan;

-- 6. New Policies for Surat Jalan
-- Semua bisa melihat (karena tidak ada role)
CREATE POLICY "Anyone can view surat jalan" ON public.surat_jalan FOR SELECT USING (auth.uid() IS NOT NULL);

-- Semua bisa membuat
CREATE POLICY "Anyone can insert surat jalan" ON public.surat_jalan FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Kunci Ketat: Update hanya jika dokumen bukan COMPLETED atau CANCELLED, DAN user sedang login
-- Kita mengecek OLD.status (status saat ini di database) sebelum diubah.
CREATE POLICY "Anyone can update non-final surat jalan" ON public.surat_jalan 
FOR UPDATE USING (
    status NOT IN ('SELESAI', 'DIBATALKAN') 
    AND auth.uid() IS NOT NULL
);

-- Semua bisa delete JIKA statusnya masih DRAFT
CREATE POLICY "Anyone can delete draft surat jalan" ON public.surat_jalan 
FOR DELETE USING (
    status = 'DRAFT'
    AND auth.uid() IS NOT NULL
);

-- Policies for sj_history
CREATE POLICY "Anyone can view history" ON public.sj_history FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can insert history" ON public.sj_history FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- 7. Trigger to automatically log status changes (Alternative to frontend logging, ensures 100% audit)
CREATE OR REPLACE FUNCTION log_sj_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.sj_history (sj_id, actor_id, action, status_before, status_after, reason)
        VALUES (NEW.id, auth.uid(), 'STATUS_CHANGED', OLD.status, NEW.status, NEW.rejection_reason);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_sj_status ON public.surat_jalan;
CREATE TRIGGER trg_log_sj_status
AFTER UPDATE ON public.surat_jalan
FOR EACH ROW
EXECUTE FUNCTION log_sj_status_change();
