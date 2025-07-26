const { getArtworks, getArtworkBySlug } = require('./lib/artworks.ts')

async function testFallback() {
  console.log('🧪 Testing fallback data functionality...\n')

  try {
    // 모든 작품 가져오기 테스트
    console.log('1. Testing getArtworks()...')
    const artworks = await getArtworks()
    console.log(`   Found ${artworks.length} artworks`)

    if (artworks.length > 0) {
      console.log('   First 3 artwork slugs:')
      artworks.slice(0, 3).forEach((artwork, index) => {
        console.log(`   ${index + 1}. ${artwork.slug}`)
      })
    }

    console.log('\n2. Testing getArtworkBySlug("heelang-grandpa-2022")...')
    const grandpaArtwork = await getArtworkBySlug('heelang-grandpa-2022')

    if (grandpaArtwork) {
      console.log('   ✅ Found artwork:', grandpaArtwork.title)
      console.log('   📅 Year:', grandpaArtwork.year)
      console.log('   🔗 Slug:', grandpaArtwork.slug)
    } else {
      console.log('   ❌ Artwork not found')
    }

    console.log('\n3. Testing other available slugs...')
    const availableSlugs = artworks.map((artwork) => artwork.slug)
    const grandpaSlugs = availableSlugs.filter(
      (slug) => slug.includes('grandpa') || slug.includes('할아버지')
    )

    if (grandpaSlugs.length > 0) {
      console.log('   Available grandpa-related slugs:')
      grandpaSlugs.forEach((slug, index) => {
        console.log(`   ${index + 1}. ${slug}`)
      })
    } else {
      console.log('   No grandpa-related slugs found')
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testFallback()
