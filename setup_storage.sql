-- JALANKAN SCRIPT INI DI SUPABASE SQL EDITOR
-- 1. Buat bucket 'bukti' jika belum ada, dan atur agar bisa diakses publik
INSERT INTO storage.buckets (id, name, public)
VALUES ('bukti', 'bukti', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Mengizinkan semua orang melihat/membaca foto bukti yang sudah diupload
DROP POLICY IF EXISTS "Public View Proof" ON storage.objects;
CREATE POLICY "Public View Proof" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'bukti');

-- 3. Mengizinkan pengguna terdaftar (supir/admin) untuk mengunggah foto
DROP POLICY IF EXISTS "Authenticated Upload Proof" ON storage.objects;
CREATE POLICY "Authenticated Upload Proof" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'bukti' AND auth.role() = 'authenticated');
