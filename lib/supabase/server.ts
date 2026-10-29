import { createClient, SupabaseClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

export type { Database }

let supabaseClient: SupabaseClient<Database> | null = null

// Create Supabase client for server-side operations
export function createSupabaseClient(): SupabaseClient<Database> | null {
  // Return cached client if available
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '⚠️ Supabase environment variables not configured, using fallback data sources'
    )
    console.warn(
      'To enable Supabase: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
    // ✅ Return null instead of throwing error to allow graceful fallback
    return null
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  })

  return supabaseClient
}

// Export for compatibility with existing imports
export { createSupabaseClient as createClient }

// Client-side Supabase client (for browser use)
export function createBrowserClient() {
  if (typeof window === 'undefined') {
    console.warn('createBrowserClient can only be used in browser context')
    return null
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase browser environment variables not configured')
    console.warn(
      'To enable Supabase: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
    // ✅ Return null instead of throwing error to allow graceful fallback
    return null
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'public',
    },
  })
}
