// Supabase 프로젝트 ANAM(rvxlibwimsdamqszibez)의 생성 타입 기반. 스키마 변경 시 재생성할 것 (뷰 Insert/Update·헬퍼 타입은 축약함).
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      artist: {
        Row: {
          awards: string[] | null
          bio: string | null
          birth_place: string | null
          birth_year: number | null
          collections: string[] | null
          created_at: string | null
          current_location: string | null
          education: string[] | null
          email: string | null
          exhibitions: string[] | null
          facebook: string | null
          id: string
          influences: string[] | null
          instagram: string | null
          linkedin: string | null
          materials: string[] | null
          memberships: string[] | null
          name: string
          philosophy: string | null
          phone: string | null
          profile_image_url: string | null
          publications: string[] | null
          specialties: string[] | null
          statement: string | null
          teaching_experience: string[] | null
          techniques: string[] | null
          twitter: string | null
          updated_at: string | null
          website: string | null
          youtube: string | null
        }
        Insert: {
          awards?: string[] | null
          bio?: string | null
          birth_place?: string | null
          birth_year?: number | null
          collections?: string[] | null
          created_at?: string | null
          current_location?: string | null
          education?: string[] | null
          email?: string | null
          exhibitions?: string[] | null
          facebook?: string | null
          id?: string
          influences?: string[] | null
          instagram?: string | null
          linkedin?: string | null
          materials?: string[] | null
          memberships?: string[] | null
          name: string
          philosophy?: string | null
          phone?: string | null
          profile_image_url?: string | null
          publications?: string[] | null
          specialties?: string[] | null
          statement?: string | null
          teaching_experience?: string[] | null
          techniques?: string[] | null
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
          youtube?: string | null
        }
        Update: {
          awards?: string[] | null
          bio?: string | null
          birth_place?: string | null
          birth_year?: number | null
          collections?: string[] | null
          created_at?: string | null
          current_location?: string | null
          education?: string[] | null
          email?: string | null
          exhibitions?: string[] | null
          facebook?: string | null
          id?: string
          influences?: string[] | null
          instagram?: string | null
          linkedin?: string | null
          materials?: string[] | null
          memberships?: string[] | null
          name?: string
          philosophy?: string | null
          phone?: string | null
          profile_image_url?: string | null
          publications?: string[] | null
          specialties?: string[] | null
          statement?: string | null
          teaching_experience?: string[] | null
          techniques?: string[] | null
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      artworks: {
        Row: {
          artist_note: string | null
          aspect_ratio: string | null
          available: boolean | null
          category: string | null
          created_at: string | null
          cultural_context: string | null
          description: string | null
          dimensions: string | null
          exhibition: string | null
          featured: boolean | null
          id: string
          image_path: string | null
          image_url_query: string | null
          inspiration: string | null
          medium: string
          number: number | null
          price: number | null
          series: string | null
          slug: string
          symbolism: string | null
          tags: string[] | null
          technique: string | null
          title: string
          updated_at: string | null
          year: number
        }
        Insert: {
          artist_note?: string | null
          aspect_ratio?: string | null
          available?: boolean | null
          category?: string | null
          created_at?: string | null
          cultural_context?: string | null
          description?: string | null
          dimensions?: string | null
          exhibition?: string | null
          featured?: boolean | null
          id?: string
          image_path?: string | null
          image_url_query?: string | null
          inspiration?: string | null
          medium?: string
          number?: number | null
          price?: number | null
          series?: string | null
          slug: string
          symbolism?: string | null
          tags?: string[] | null
          technique?: string | null
          title: string
          updated_at?: string | null
          year: number
        }
        Update: {
          artist_note?: string | null
          aspect_ratio?: string | null
          available?: boolean | null
          category?: string | null
          created_at?: string | null
          cultural_context?: string | null
          description?: string | null
          dimensions?: string | null
          exhibition?: string | null
          featured?: boolean | null
          id?: string
          image_path?: string | null
          image_url_query?: string | null
          inspiration?: string | null
          medium?: string
          number?: number | null
          price?: number | null
          series?: string | null
          slug?: string
          symbolism?: string | null
          tags?: string[] | null
          technique?: string | null
          title?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      migration_log: {
        Row: {
          id: string
          migration_date: string | null
          migration_type: string
          notes: string | null
          records_migrated: number
          source_system: string
          status: string | null
        }
        Insert: {
          id?: string
          migration_date?: string | null
          migration_type: string
          notes?: string | null
          records_migrated: number
          source_system: string
          status?: string | null
        }
        Update: {
          id?: string
          migration_date?: string | null
          migration_type?: string
          notes?: string | null
          records_migrated?: number
          source_system?: string
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      artwork_stats: {
        Row: {
          available_count: number | null
          category_count: number | null
          creation_years: number | null
          earliest_year: number | null
          featured_count: number | null
          latest_year: number | null
          total_artworks: number | null
        }
        Relationships: []
      }
      featured_artworks: {
        Row: Database['public']['Views']['latest_artworks']['Row']
        Relationships: []
      }
      latest_artworks: {
        Row: {
          artist_note: string | null
          aspect_ratio: string | null
          available: boolean | null
          category: string | null
          created_at: string | null
          cultural_context: string | null
          description: string | null
          dimensions: string | null
          exhibition: string | null
          featured: boolean | null
          id: string | null
          image_path: string | null
          image_url_query: string | null
          inspiration: string | null
          medium: string | null
          number: number | null
          price: number | null
          series: string | null
          slug: string | null
          symbolism: string | null
          tags: string[] | null
          technique: string | null
          title: string | null
          updated_at: string | null
          year: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_data_migration: {
        Args: never
        Returns: {
          row_count: number
          table_name: string
        }[]
      }
      search_artworks: {
        Args: { search_term: string }
        Returns: {
          description: string
          id: string
          medium: string
          rank: number
          slug: string
          title: string
          year: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public']

export type Tables<
  T extends keyof (PublicSchema['Tables'] & PublicSchema['Views']),
> = (PublicSchema['Tables'] & PublicSchema['Views'])[T] extends { Row: infer R }
  ? R
  : never

export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update']
