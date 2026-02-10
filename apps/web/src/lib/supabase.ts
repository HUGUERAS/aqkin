import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key-for-development'

// Mock mode when credentials are not available
const isMockMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY

if (isMockMode) {
  console.warn('⚠️ Running in MOCK MODE - Supabase is disabled. Configure .env for production.')
}

export const supabase: SupabaseClient = isMockMode
  ? (null as unknown as SupabaseClient) // Mock client for development
  : createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })

// Helper: Check if user is authenticated (mock returns false)
export const isAuthenticated = async () => {
  if (isMockMode) return false
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// Helper: Get current user (mock returns null)
export const getCurrentUser = async () => {
  if (isMockMode) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper: Sign out (mock does nothing)
export const signOut = async () => {
  if (isMockMode) {
    console.log('Mock sign out')
    return
  }
  await supabase.auth.signOut()
}
