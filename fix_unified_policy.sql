-- Menghapus policy lama
DROP POLICY IF EXISTS "Admins can do everything on Surat Jalan" ON public.surat_jalan;
DROP POLICY IF EXISTS "Supir can view assigned Surat Jalan" ON public.surat_jalan;
DROP POLICY IF EXISTS "Supir can update assigned Surat Jalan" ON public.surat_jalan;
DROP POLICY IF EXISTS "Supir can view assigned or open Surat Jalan" ON public.surat_jalan;

-- Membuat policy baru yang lebih flexible untuk sistem Grab/Unified
CREATE POLICY "Semua user terautentikasi dapat melihat Surat Jalan" 
ON public.surat_jalan 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Semua user terautentikasi dapat membuat Surat Jalan" 
ON public.surat_jalan 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Semua user terautentikasi dapat mengupdate Surat Jalan" 
ON public.surat_jalan 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
