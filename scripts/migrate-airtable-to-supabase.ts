/**
 * Airtable에서 Supabase로 데이터 마이그레이션 스크립트
 * 
 * Usage:
 *   npx tsx scripts/migrate-airtable-to-supabase.ts
 * 
 * Requirements:
 *   - Airtable credentials configured (AIRTABLE_API_KEY, AIRTABLE_BASE_ID)
 *   - Supabase credentials configured (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 *   - Supabase schema already created (run lib/supabase/schema.sql first)
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

import { fetchArtworksFromAirtable, fetchArtistFromAirtable } from '../lib/airtable'
import { createSupabaseClient } from '../lib/supabase/server'
import type { Artwork, Artist } from '../lib/types'

async function migrateArtworks() {
  console.log('🔄 Starting artwork migration from Airtable to Supabase...')

  try {
    // Fetch from Airtable
    const artworks = await fetchArtworksFromAirtable()
    if (!artworks || artworks.length === 0) {
      console.warn('⚠️ No artworks found in Airtable')
      return
    }

    console.log(`📊 Found ${artworks.length} artworks in Airtable`)

    // Connect to Supabase
    const supabase = createSupabaseClient()

    // Prepare data for insertion
    const artworksToInsert = artworks.map((artwork) => ({
      slug: artwork.slug,
      title: artwork.title,
      year: artwork.year,
      medium: artwork.medium,
      dimensions: artwork.dimensions || null,
      aspect_ratio: artwork.aspectRatio || null,
      description: artwork.description || null,
      image_url: artwork.imageUrl,
      image_url_query: artwork.imageUrlQuery || null,
      image_id: artwork.imageId || null,
      number: artwork.number?.toString() || null,
      artist_note: artwork.artistNote || null,
      featured: artwork.featured || false,
      category: artwork.category || null,
      tags: artwork.tags || [],
      price: artwork.price || null,
      available: artwork.available !== false,
      exhibition: artwork.exhibition || null,
      series: artwork.series || null,
      technique: artwork.technique || null,
      inspiration: artwork.inspiration || null,
      symbolism: artwork.symbolism || null,
      cultural_context: artwork.culturalContext || null,
    }))

    // Insert artworks (upsert based on slug to avoid duplicates)
    const { data, error } = await supabase
      .from('artworks')
      .upsert(artworksToInsert, {
        onConflict: 'slug',
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      console.error('❌ Error inserting artworks:', error)
      throw error
    }

    console.log(`✅ Successfully migrated ${data?.length || artworks.length} artworks to Supabase`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

async function migrateArtist() {
  console.log('🔄 Starting artist migration from Airtable to Supabase...')

  try {
    // Fetch from Airtable
    const artist = await fetchArtistFromAirtable()
    if (!artist) {
      console.warn('⚠️ No artist found in Airtable')
      return
    }

    console.log(`📊 Found artist: ${artist.name}`)

    // Connect to Supabase
    const supabase = createSupabaseClient()

    // Prepare data for insertion
    const artistToInsert = {
      name: artist.name,
      bio: artist.bio || null,
      statement: artist.statement || null,
      profile_image_url: artist.profileImageUrl || null,
      birth_year: artist.birthYear || null,
      education: artist.education || [],
      exhibitions: artist.exhibitions || [],
      awards: artist.awards || [],
      collections: artist.collections || [],
      website: artist.website || null,
      email: artist.email || null,
      phone: artist.phone || null,
      social_links: artist.socialLinks || {},
      birth_place: artist.birthPlace || null,
      current_location: artist.currentLocation || null,
      specialties: artist.specialties || [],
      influences: artist.influences || [],
      teaching_experience: artist.teachingExperience || [],
      publications: artist.publications || [],
      memberships: artist.memberships || [],
      philosophy: artist.philosophy || null,
      techniques: artist.techniques || [],
      materials: artist.materials || [],
    }

    // Check if artist already exists
    const { data: existing } = await supabase
      .from('artists')
      .select('id')
      .limit(1)
      .single()

    let result
    if (existing) {
      // Update existing artist
      const { data, error } = await supabase
        .from('artists')
        .update(artistToInsert)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new artist
      const { data, error } = await supabase
        .from('artists')
        .insert(artistToInsert)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    console.log(`✅ Successfully migrated artist to Supabase: ${result.name}`)
  } catch (error) {
    console.error('❌ Artist migration failed:', error)
    throw error
  }
}

async function main() {
  console.log('🚀 Starting Airtable to Supabase migration...\n')

  try {
    // Migrate artworks
    await migrateArtworks()
    console.log('')

    // Migrate artist
    await migrateArtist()
    console.log('')

    console.log('✅ Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Verify data in Supabase Dashboard')
    console.log('   2. Update environment variables if needed')
    console.log('   3. Update app code to use Supabase instead of Airtable')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
if (require.main === module) {
  main()
}

export { migrateArtworks, migrateArtist }

