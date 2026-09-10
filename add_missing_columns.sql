-- JALANKAN SCRIPT INI DI SUPABASE SQL EDITOR
-- Ini akan menambahkan semua kolom yang diperlukan untuk fitur pengiriman

ALTER TABLE public.surat_jalan
ADD COLUMN IF NOT EXISTS catatan_delivery TEXT,
ADD COLUMN IF NOT EXISTS penerima_nama VARCHAR(255),
ADD COLUMN IF NOT EXISTS penerima_signature TEXT,
ADD COLUMN IF NOT EXISTS bukti_foto_url TEXT,
ADD COLUMN IF NOT EXISTS bukti_latitude TEXT,
ADD COLUMN IF NOT EXISTS bukti_longitude TEXT,
ADD COLUMN IF NOT EXISTS bukti_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pengirim_signature TEXT;

