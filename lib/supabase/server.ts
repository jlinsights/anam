import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Types for database tables
export interface Database {
  public: {
    Tables: {
      artworks: {
        Row: {
          id: string
          slug: string
          title: string
          year: number
          medium: string
          dimensions: string | null
          aspect_ratio: string | null
          description: string | null
          image_url: string
          image_url_query: string | null
          image_id: string | null
          number: string | null
          artist_note: string | null
          featured: boolean
          category: string | null
          tags: string[] | null
          price: number | null
          available: boolean
          exhibition: string | null
          series: string | null
          technique: string | null
          inspiration: string | null
          symbolism: string | null
          cultural_context: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['artworks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['artworks']['Row'], 'id' | 'created_at'>>
      }
      artists: {
        Row: {
          id: string
          name: string
          bio: string | null
          statement: string | null
          profile_image_url: string | null
          birth_year: number | null
          education: string[] | null
          exhibitions: string[] | null
          awards: string[] | null
          collections: string[] | null
          website: string | null
          email: string | null
          phone: string | null
          social_links: Record<string, string> | null
          birth_place: string | null
          current_location: string | null
          specialties: string[] | null
          influences: string[] | null
          teaching_experience: string[] | null
          publications: string[] | null
          memberships: string[] | null
          philosophy: string | null
          techniques: string[] | null
          materials: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['artists']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['artists']['Row'], 'id' | 'created_at'>>
      }
    }
  }
}

let supabaseClient: SupabaseClient<Database> | null = null

// Create Supabase client for server-side operations
export function createSupabaseClient(): SupabaseClient<Database> {
  // Return cached client if available
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase environment variables not configured')
    console.warn('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    throw new Error('Missing Supabase environment variables')
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  })

  return supabaseClient
}

// Export for compatibility with existing imports
export { createSupabaseClient as createClient }

// Client-side Supabase client (for browser use)
export function createBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error('createBrowserClient can only be used in browser context')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase browser environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'public'
    }
  })
}
