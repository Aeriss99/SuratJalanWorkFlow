import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mqxjitwshyoebjoeahbw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeGppdHdzaHlvZWJqb2VhaGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgxMTAsImV4cCI6MjEwNDI4NDExMH0.Fn7zBrxfaTa8vZCbSfajmKIm7rJQwPgvZSs0wrnRZME'
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase.from('surat_jalan').select('bukti_waktu').limit(1)
  console.log(error || 'Column exists!')
}
run()
