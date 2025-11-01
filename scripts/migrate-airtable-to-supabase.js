/**
 * Airtable에서 Supabase로 데이터 마이그레이션 스크립트 (Node.js 버전)
 * 
 * Usage:
 *   node scripts/migrate-airtable-to-supabase.js
 * 
 * Requirements:
 *   - Airtable credentials configured (AIRTABLE_API_KEY, AIRTABLE_BASE_ID)
 *   - Supabase credentials configured (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 *   - Supabase schema already created (run lib/supabase/schema.sql first)
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const Airtable = require('airtable')

async function migrateArtworks() {
  console.log('🔄 Starting artwork migration from Airtable to Supabase...')

  try {
    // Fetch from Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
      requestTimeout: 15000,
    }).base(process.env.AIRTABLE_BASE_ID)

    const records = []
    await base('Artworks')
      .select({ sort: [{ field: 'year', direction: 'desc' }] })
      .eachPage((pageRecords, fetchNextPage) => {
        records.push(...pageRecords)
        fetchNextPage()
      })

    if (!records || records.length === 0) {
      console.warn('⚠️ No artworks found in Airtable')
      return
    }

    console.log(`📊 Found ${records.length} artworks in Airtable`)

    // Connect to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Transform Airtable records to Supabase format
    const artworksToInsert = records.map((record) => {
      const fields = record.fields
      
      // Helper to get field value with multiple possible field names
      const getField = (fieldNames) => {
        for (const name of fieldNames) {
          if (fields[name] !== undefined && fields[name] !== null && fields[name] !== '') {
            return fields[name]
          }
        }
        return null
      }

      const title = getField(['title', 'Title', '제목'])
      const year = getField(['year', 'Year', '년도'])
      const number = getField(['number', 'Number', '번호', 'ID', 'id'])
      
      // Generate slug
      let slug = getField(['slug', 'Slug', 'SLUG'])
      if (!slug) {
        if (number) {
          slug = `anam-${String(number).padStart(2, '0')}`
        } else {
          slug = `anam-${String(records.indexOf(record) + 1).padStart(2, '0')}`
        }
      }

      // Clean slug if it has year suffix
      if (slug && slug.includes('-2024')) {
        const cleanSlug = slug.replace('-2024', '')
        if (/^anam-\d+$/.test(cleanSlug)) {
          slug = cleanSlug
        }
      }

      // Generate image URL based on slug
      const slugMatch = slug.match(/anam-(\d+)/)
      const imageUrl = slugMatch
        ? `/Images/Artworks/optimized/${slugMatch[1].padStart(2, '0')}/${slugMatch[1].padStart(2, '0')}-medium.jpg`
        : '/Images/Artworks/optimized/01/01-medium.jpg'

      const tagsValue = getField(['tags', 'Tags', '태그'])
      const tags = Array.isArray(tagsValue)
        ? tagsValue
        : (tagsValue ? String(tagsValue).split(/[,;|]/).map(t => t.trim()).filter(t => t.length > 0) : [])

      // Remove undefined values (Supabase doesn't like undefined)
      const artworkData = {
        slug,
        title: title || 'Untitled',
        year: year ? parseInt(year) : 2024,
        medium: getField(['medium', 'Medium', '재료']) || '화선지에 먹',
        dimensions: getField(['dimensions', 'Dimensions', '크기']) || '70 x 140 cm',
        aspect_ratio: '2/1',
        description: getField(['description', 'Description', '설명', 'desc']) || '',
        image_path: imageUrl, // 실제 테이블 컬럼명: image_path
        image_url_query: `${title || 'artwork'} calligraphy art`,
        featured: getField(['featured', 'Featured', '추천']) === true,
        available: getField(['available', 'Available', '판매여부']) !== false,
        tags: tags || [],
      }

      // Add optional fields only if they have values
      if (number) artworkData.number = String(number)
      if (getField(['artistNote', 'ArtistNote', 'artist_note', 'Artist Note', '작가노트', '작가 노트'])) {
        artworkData.artist_note = getField(['artistNote', 'ArtistNote', 'artist_note', 'Artist Note', '작가노트', '작가 노트'])
      }
      if (getField(['category', 'Category', '카테고리'])) artworkData.category = getField(['category', 'Category', '카테고리'])
      if (getField(['price'])) artworkData.price = getField(['price'])
      if (fields.exhibition) artworkData.exhibition = fields.exhibition
      if (fields.series) artworkData.series = fields.series
      if (fields.technique) artworkData.technique = fields.technique
      if (fields.inspiration) artworkData.inspiration = fields.inspiration
      if (fields.symbolism) artworkData.symbolism = fields.symbolism
      if (fields.culturalContext) artworkData.cultural_context = fields.culturalContext

      return artworkData
    })
    .filter(artwork => artwork && artwork.slug && artwork.title) // 유효한 작품만

    if (artworksToInsert.length === 0) {
      console.warn('⚠️ No valid artworks to insert')
      return
    }

    console.log(`📝 Preparing to insert ${artworksToInsert.length} artworks...`)

    // Insert artworks in batches (Supabase has limits on batch size)
    const BATCH_SIZE = 50
    const batches = []
    for (let i = 0; i < artworksToInsert.length; i += BATCH_SIZE) {
      batches.push(artworksToInsert.slice(i, i + BATCH_SIZE))
    }

    let totalInserted = 0
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`  📦 Inserting batch ${i + 1}/${batches.length} (${batch.length} artworks)...`)
      
      const { data, error } = await supabase
        .from('artworks')
        .upsert(batch, {
          onConflict: 'slug',
        })
        .select()

      if (error) {
        console.error(`❌ Error inserting batch ${i + 1}:`, error)
        throw error
      }

      totalInserted += data?.length || batch.length
      console.log(`  ✅ Batch ${i + 1} completed: ${data?.length || batch.length} artworks`)
    }

    console.log(`✅ Successfully migrated ${totalInserted} artworks to Supabase`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

async function migrateArtist() {
  console.log('🔄 Starting artist migration from Airtable to Supabase...')

  try {
    // Check if artists table exists
    const supabaseCheck = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Try both 'artists' and 'artist' table names
    let artistsTableName = 'artists'
    let { error: checkError } = await supabaseCheck
      .from('artists')
      .select('id')
      .limit(1)

    if (checkError && checkError.hint && checkError.hint.includes("'public.artist'")) {
      artistsTableName = 'artist'
      console.log('  ℹ️  테이블 이름이 "artist" (단수형)인 것으로 확인됨')
      const { error: checkError2 } = await supabaseCheck
        .from('artist')
        .select('id')
        .limit(1)
      checkError = checkError2
    }

    if (checkError && (checkError.code === 'PGRST116' || checkError.message.includes('relation') || checkError.message.includes('does not exist'))) {
      console.warn(`  ⚠️  ${artistsTableName} 테이블이 존재하지 않습니다.`)
      console.warn('  📝 artists 테이블을 생성하려면 scripts/setup-instructions.md를 참조하세요.')
      console.warn('  💡 작품 마이그레이션은 계속 진행됩니다.\n')
      return
    }
    // Fetch from Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
      requestTimeout: 15000,
    }).base(process.env.AIRTABLE_BASE_ID)

    const records = []
    await base('Artist')
      .select()
      .eachPage((pageRecords, fetchNextPage) => {
        records.push(...pageRecords)
        fetchNextPage()
      })

    if (!records || records.length === 0) {
      console.warn('⚠️ No artist found in Airtable')
      return
    }

    const record = records[0]
    const fields = record.fields

    const getField = (fieldNames) => {
      for (const name of fieldNames) {
        if (fields[name] !== undefined && fields[name] !== null && fields[name] !== '') {
          return fields[name]
        }
      }
      return null
    }

    const parseMultiline = (value) => {
      if (!value) return []
      if (typeof value === 'string') {
        return value.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      }
      if (Array.isArray(value)) {
        return value.map(item => item.toString().trim())
      }
      return [value.toString().trim()]
    }

    const parseTags = (value) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      if (typeof value === 'string') {
        return value.split(/[,;|]/).map(tag => tag.trim()).filter(tag => tag.length > 0)
      }
      return []
    }

    console.log(`📊 Found artist: ${getField(['name', 'Name', '작가명', '작가 이름']) || 'Unknown'}`)

    // Connect to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Prepare data for insertion
    const artistToInsert = {
      name: getField(['name', 'Name', '작가명', '작가 이름']) || 'Unknown Artist',
      bio: getField(['bio', 'Bio', 'biography', 'Biography', '소개', '작가 소개']) || null,
      statement: getField(['statement', 'Statement', 'artistStatement', 'Artist Statement', '작가 노트', '작가의 말']) || null,
      profile_image_url: (() => {
        const directUrl = getField(['profileImageUrl', 'ProfileImageUrl', 'profileImageURL'])
        if (directUrl && typeof directUrl === 'string' && directUrl.startsWith('http')) {
          return directUrl
        }
        const imageField = getField(['profileImage', 'Profile Image', 'profile_image', '프로필 이미지'])
        if (imageField && Array.isArray(imageField) && imageField.length > 0) {
          return imageField[0].url || '/images/artist/artist.jpg'
        }
        return '/images/artist/artist.jpg'
      })(),
      birth_year: parseInt(getField(['birthYear', 'Birth Year', '출생년도'])) || null,
      education: parseMultiline(getField(['education', 'Education', '학력'])),
      exhibitions: parseMultiline(getField(['exhibitions', 'Exhibitions', '전시이력'])),
      awards: parseMultiline(getField(['awards', 'Awards', '수상이력'])),
      collections: parseMultiline(getField(['collections', 'Collections', '수집이력'])),
      website: getField(['website', 'Website', '웹사이트', '홈페이지']) || null,
      email: getField(['email', 'Email', '이메일', '연락처']) || null,
      phone: getField(['phone', 'Phone', '전화번호', '연락처']) || null,
      // Individual social media columns (not JSONB)
      instagram: getField(['instagram', 'Instagram', '인스타그램']) || null,
      facebook: getField(['facebook', 'Facebook', '페이스북']) || null,
      twitter: getField(['twitter', 'Twitter', '트위터']) || null,
      youtube: getField(['youtube', 'YouTube', '유튜브']) || null,
      linkedin: getField(['linkedin', 'LinkedIn', '링크드인']) || null,
      birth_place: getField(['birthPlace', 'Birth Place', '출생지']) || null,
      current_location: getField(['currentLocation', 'Current Location', '현재위치']) || null,
      specialties: parseTags(getField(['specialties', 'Specialties', '전문분야'])),
      influences: parseTags(getField(['influences', 'Influences', '영향받은 작가'])),
      teaching_experience: parseMultiline(getField(['teachingExperience', 'Teaching Experience', '교육이력'])),
      publications: parseMultiline(getField(['publications', 'Publications', '출판이력'])),
      memberships: parseMultiline(getField(['memberships', 'Memberships', '소속이력'])),
      philosophy: getField(['philosophy', 'Philosophy', '철학']) || null,
      techniques: parseTags(getField(['techniques', 'Techniques', '기법'])),
      materials: parseMultiline(getField(['materials', 'Materials', '재료'])),
    }

    // Use the correct table name
    const tableName = artistsTableName || 'artists'

    // Check if artist already exists
    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .limit(1)
      .maybeSingle()

    let result
    if (existing) {
      // Update existing artist
      const { data, error } = await supabase
        .from(tableName)
        .update(artistToInsert)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new artist
      const { data, error } = await supabase
        .from(tableName)
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
    // Validate environment variables
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.error('❌ Airtable environment variables not configured')
      console.error('Please set AIRTABLE_API_KEY and AIRTABLE_BASE_ID in .env.local')
      process.exit(1)
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Supabase environment variables not configured')
      console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
      process.exit(1)
    }

    // Migrate artworks
    await migrateArtworks()
    console.log('')

    // Migrate artist
    await migrateArtist()
    console.log('')

    console.log('✅ Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Verify data in Supabase Dashboard')
    console.log('   2. Test the application: npm run dev')
    console.log('   3. Check console logs for "Loaded X artworks from Supabase"')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
if (require.main === module) {
  main()
}

module.exports = { migrateArtworks, migrateArtist }

