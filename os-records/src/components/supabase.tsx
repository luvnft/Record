import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://mbfreienojhaawsfxzjs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZnJlaWVub2poYWF3c2Z4empzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMTg1NDk3NywiZXhwIjoyMDI3NDMwOTc3fQ.hkkJJmCiFNGj8zLAadSCG1Iv7vsIJTXQiT_zV18O1WY')

export default supabase;