import { createClient, SupabaseClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

export type { Database }

let supabaseClient: SupabaseClient<Database> | null = null

// 서버에서 공개 데이터를 읽는 클라이언트. 앱은 Supabase 를 읽기만 하므로 anon 키를 쓴다.
// artworks·artist 는 RLS "public read" 정책으로 읽기가 열려 있고 쓰기는 막혀 있다.
// RLS 를 우회하는 service_role 키는 scripts/ 의 이관 스크립트만 쓴다 — 쿼리 결함이 생겨도
// 피해가 anon 권한을 넘지 않게 하려고, anon 키가 없을 때 service_role 로 대신하지 않는다.
export function createSupabaseClient(): SupabaseClient<Database> | null {
  // Return cached client if available
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '⚠️ Supabase environment variables not configured, using fallback data sources'
    )
    console.warn(
      'To enable Supabase: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
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

// 이관 스크립트(scripts/) 전용: Airtable → Supabase 로 upsert·insert·update 하므로 RLS 를 우회하는
// service_role 키가 필요하다. 앱 코드(app·lib·hooks·components)에서는 쓰지 않는다
// (__tests__/lib/supabase-read-client.test.ts 가 막는다). 읽기 클라이언트와 캐시를 공유하지 않는다.
export function createSupabaseAdminClient(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn(
      'To write to Supabase: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
    return null
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' },
  })
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
