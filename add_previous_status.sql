ALTER TABLE public.surat_jalan
ADD COLUMN IF NOT EXISTS previous_status VARCHAR(50);
