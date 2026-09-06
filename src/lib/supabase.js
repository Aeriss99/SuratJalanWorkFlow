import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mqxjitwshyoebjoeahbw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeGppdHdzaHlvZWJqb2VhaGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgxMTAsImV4cCI6MjEwNDI4NDExMH0.Fn7zBrxfaTa8vZCbSfajmKIm7rJQwPgvZSs0wrnRZME'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)