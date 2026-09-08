-- JALANKAN INI DI SUPABASE SQL EDITOR
-- Memperbaiki RLS agar dokumen COMPLETED bisa dihapus atau dibatalkan.
DROP POLICY IF EXISTS "Anyone can update non-final surat jalan" ON public.surat_jalan;
CREATE POLICY "Anyone can update surat jalan" ON public.surat_jalan 
FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can delete draft surat jalan" ON public.surat_jalan;
CREATE POLICY "Anyone can delete surat jalan" ON public.surat_jalan 
FOR DELETE USING (auth.uid() IS NOT NULL);
