import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type JobApplication = {
  id: string
  user_id: string
  company_name: string
  role_title: string
  status: 'applied' | 'interviewing' | 'offer' | 'rejected'
  deadline: string | null
  application_date: string
  notes: string | null
  created_at: string
  updated_at: string
}