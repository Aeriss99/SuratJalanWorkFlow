DROP POLICY IF EXISTS "Admins can do everything on Surat Jalan" ON surat_jalan;

CREATE POLICY "Admins can do everything on Surat Jalan" 
ON surat_jalan 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);
