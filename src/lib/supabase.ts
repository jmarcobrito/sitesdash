import { createClient } from '@supabase/supabase-js'
import type { Lead } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<{ public: { Tables: { leads: { Row: Lead } } } }>(
  supabaseUrl,
  supabaseAnonKey
)
