require('dotenv').config({ path: '.env.local' })
const Airtable = require('airtable')

const apiKey = process.env.AIRTABLE_API_KEY
const baseId = process.env.AIRTABLE_BASE_ID

if (!apiKey || !baseId) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const base = Airtable.base(baseId)

async function testArtistData() {
  try {
    console.log('🎭 Artist 테이블의 모든 레코드를 확인합니다...')

    const records = await base('Artist').select().all()

    console.log(`📊 Found ${records.length} artist record(s)`)

    // 모든 레코드 확인
    records.forEach((artist, index) => {
      console.log(`\n🎨 Artist Record ${index + 1}:`)
      console.log('Name:', artist.get('name'))
      console.log('ID:', artist.get('id'))

      // 모든 필드 확인
      const fields = artist.fields
      console.log('All fields:', Object.keys(fields))

      // awards 관련 필드들 확인
      const awards = artist.get('awards')
      const Awards = artist.get('Awards')
      const award = artist.get('award')

      console.log('\n🏆 Awards related fields:')
      console.log('awards:', awards)
      console.log('Awards:', Awards)
      console.log('award:', award)

      if (awards) {
        console.log('Awards type:', typeof awards)
        console.log(
          'Awards length:',
          Array.isArray(awards) ? awards.length : 'Not an array'
        )
        if (Array.isArray(awards)) {
          awards.forEach((item, i) => {
            console.log(`  ${i + 1}. ${item}`)
          })
        }
      }
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
  }
}

testArtistData()
