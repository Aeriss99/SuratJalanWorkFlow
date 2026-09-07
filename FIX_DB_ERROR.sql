-- JALANKAN SCRIPT INI DI SUPABASE SQL EDITOR ANDA
-- Script ini akan mengubah kolom status dari ENUM yang kaku menjadi VARCHAR (Teks Bebas).
-- Ini akan memperbaiki error "invalid input value for enum sj_status".

-- 1. Ubah tipe kolom status di tabel surat_jalan menjadi VARCHAR
ALTER TABLE public.surat_jalan ALTER COLUMN status TYPE VARCHAR(50) USING status::text;

-- 2. Ubah tipe kolom status di tabel sj_history menjadi VARCHAR (jika ada)
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sj_history' AND column_name='status_before') THEN
    ALTER TABLE public.sj_history ALTER COLUMN status_before TYPE VARCHAR(50) USING status_before::text;
    ALTER TABLE public.sj_history ALTER COLUMN status_after TYPE VARCHAR(50) USING status_after::text;
  END IF;
END $$;

-- 3. Hapus tipe data ENUM lama agar tidak mengganggu (Opsional)
DROP TYPE IF EXISTS sj_status CASCADE;

-- 4. Pastikan file migration.sql yang berisi RLS Policy baru sudah dijalankan juga!
