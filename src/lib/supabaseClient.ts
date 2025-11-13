// supabaseClient.ts / .js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://canshtwgrkhcoxgqnbzt.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhbnNodHdncmtoY3hncW5ienQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc2Mjk5NzU2MCwiZXhwIjoyMDc4NTczNTYwfQ.oqUj9k6TvOL9rjqPClvCi53pB4TGB2EZejhcuPCCHh4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
