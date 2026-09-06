DROP POLICY IF EXISTS "Supir can view assigned Surat Jalan" ON public.surat_jalan;
DROP POLICY IF EXISTS "Supir can update assigned Surat Jalan" ON public.surat_jalan;

CREATE POLICY "Supir can view assigned Surat Jalan" 
ON public.surat_jalan 
FOR SELECT 
USING (supir_id = auth.uid());

CREATE POLICY "Supir can update assigned Surat Jalan" 
ON public.surat_jalan 
FOR UPDATE 
USING (supir_id = auth.uid())
WITH CHECK (supir_id = auth.uid());
