import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://kftenaflkxthliovynnw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGVuYWZsa3h0aGxpb3Z5bm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEwNjIxNDYsImV4cCI6MjAzNjYzODE0Nn0.3H5qsajVsBtS7n9HCGZxvZGDdb69gdGa5zH2LXkMNWY')

export default supabase;