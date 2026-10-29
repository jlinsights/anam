// Test script to check how artist data from Airtable will be displayed
const { fetchArtist } = require('../lib/artist.ts')

async function testArtistData() {
  try {
    console.log('🔍 Fetching artist data...')
    const artist = await fetchArtist('anam-artist')

    console.log('\n📋 Artist Data Structure:')
    console.log('='.repeat(50))

    if (artist) {
      console.log(`Name: ${artist.name}`)
      console.log(`Birth Year: ${artist.birthYear || 'Not specified'}`)
      console.log(`Birth Place: ${artist.birthPlace || 'Not specified'}`)
      console.log(
        `Current Location: ${artist.currentLocation || 'Not specified'}`
      )
      console.log(`Email: ${artist.email || 'Not specified'}`)
      console.log(`Website: ${artist.website || 'Not specified'}`)

      console.log('\n📖 Biography:')
      console.log(artist.bio || 'No biography available')

      if (artist.statement) {
        console.log('\n💭 Artist Statement:')
        console.log(artist.statement)
      }

      if (artist.philosophy) {
        console.log('\n🎭 Philosophy:')
        console.log(artist.philosophy)
      }

      if (artist.education && artist.education.length > 0) {
        console.log('\n🎓 Education:')
        artist.education.forEach((edu, index) => {
          console.log(`  ${index + 1}. ${edu}`)
        })
      }

      if (artist.exhibitions && artist.exhibitions.length > 0) {
        console.log('\n🏛️ Exhibitions:')
        artist.exhibitions.forEach((exhibition, index) => {
          console.log(`  ${index + 1}. ${exhibition}`)
        })
      }

      if (artist.awards && artist.awards.length > 0) {
        console.log('\n🏆 Awards:')
        artist.awards.forEach((award, index) => {
          console.log(`  ${index + 1}. ${award}`)
        })
      }

      if (artist.collections && artist.collections.length > 0) {
        console.log('\n🏛️ Collections:')
        artist.collections.forEach((collection, index) => {
          console.log(`  ${index + 1}. ${collection}`)
        })
      }

      if (artist.specialties && artist.specialties.length > 0) {
        console.log('\n🎨 Specialties:')
        console.log(`  ${artist.specialties.join(', ')}`)
      }

      if (artist.techniques && artist.techniques.length > 0) {
        console.log('\n✍️ Techniques:')
        console.log(`  ${artist.techniques.join(', ')}`)
      }

      if (artist.materials && artist.materials.length > 0) {
        console.log('\n🖌️ Materials:')
        console.log(`  ${artist.materials.join(', ')}`)
      }

      if (artist.influences && artist.influences.length > 0) {
        console.log('\n💫 Influences:')
        console.log(`  ${artist.influences.join(', ')}`)
      }

      if (artist.teachingExperience && artist.teachingExperience.length > 0) {
        console.log('\n👥 Teaching Experience:')
        artist.teachingExperience.forEach((experience, index) => {
          console.log(`  ${index + 1}. ${experience}`)
        })
      }

      if (artist.publications && artist.publications.length > 0) {
        console.log('\n📚 Publications:')
        artist.publications.forEach((publication, index) => {
          console.log(`  ${index + 1}. ${publication}`)
        })
      }

      if (artist.memberships && artist.memberships.length > 0) {
        console.log('\n🏛️ Memberships:')
        artist.memberships.forEach((membership, index) => {
          console.log(`  ${index + 1}. ${membership}`)
        })
      }

      if (artist.socialLinks) {
        console.log('\n🔗 Social Links:')
        Object.entries(artist.socialLinks).forEach(([platform, handle]) => {
          if (handle) {
            console.log(`  ${platform}: ${handle}`)
          }
        })
      }
    } else {
      console.log('❌ No artist data found - using fallback data')
    }
  } catch (error) {
    console.error('❌ Error fetching artist data:', error.message)
    console.log('\n🔄 This is expected if Airtable is not configured')
    console.log('   The system will use fallback data instead')
  }
}

testArtistData()
