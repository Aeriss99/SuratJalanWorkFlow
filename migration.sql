
-- 7. Ensure nomor_dokumen is unique
ALTER TABLE public.surat_jalan DROP CONSTRAINT IF EXISTS unique_nomor_dokumen;
ALTER TABLE public.surat_jalan ADD CONSTRAINT unique_nomor_dokumen UNIQUE (nomor_dokumen);
