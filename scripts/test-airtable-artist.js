const Airtable = require('airtable')

async function testAirtableArtist() {
  try {
    console.log('Testing Airtable Artist connection...')

    // 환경 변수 확인
    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    if (!apiKey || !baseId) {
      console.error('Missing environment variables:')
      console.error('AIRTABLE_API_KEY:', apiKey ? 'Set' : 'Not set')
      console.error('AIRTABLE_BASE_ID:', baseId ? 'Set' : 'Not set')
      return
    }

    console.log('Environment variables OK')
    console.log('API Key:', apiKey.substring(0, 10) + '...')
    console.log('Base ID:', baseId)

    const base = new Airtable({ apiKey }).base(baseId)

    console.log('\nFetching Artist data from Airtable...')
    const records = await base('Artist')
      .select({
        maxRecords: 1,
      })
      .all()

    if (records.length === 0) {
      console.log('No artist data found in Airtable')
      return
    }

    const record = records[0]
    const fields = record.fields

    console.log('\n=== Artist Data from Airtable ===')
    console.log('Record ID:', record.id)
    console.log('Name:', fields.name || fields.Name || 'Not set')
    console.log('Bio:', fields.bio || fields.Bio || 'Not set')

    console.log('\n=== Education ===')
    const education = fields.education || fields.Education || ''
    if (education) {
      const educationList = education
        .toString()
        .split('\n')
        .filter((item) => item.trim().length > 0)
      educationList.forEach((item, index) => {
        console.log(`${index + 1}. ${item}`)
      })
    } else {
      console.log('No education data found')
    }

    console.log('\n=== Awards ===')
    const awards = fields.awards || fields.Awards || ''
    if (awards) {
      const awardsList = awards
        .toString()
        .split('\n')
        .filter((item) => item.trim().length > 0)
      awardsList.forEach((item, index) => {
        console.log(`${index + 1}. ${item}`)
      })
    } else {
      console.log('No awards data found')
    }

    console.log('\n=== Exhibitions ===')
    const exhibitions = fields.exhibitions || fields.Exhibitions || ''
    if (exhibitions) {
      const exhibitionsList = exhibitions
        .toString()
        .split('\n')
        .filter((item) => item.trim().length > 0)
      exhibitionsList.forEach((item, index) => {
        console.log(`${index + 1}. ${item}`)
      })
    } else {
      console.log('No exhibitions data found')
    }

    console.log('\n=== All Fields ===')
    Object.keys(fields).forEach((key) => {
      console.log(
        `${key}:`,
        typeof fields[key] === 'string' && fields[key].length > 100
          ? fields[key].substring(0, 100) + '...'
          : fields[key]
      )
    })
  } catch (error) {
    console.error('Error testing Airtable:', error.message)
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode)
    }
  }
}

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' })

testAirtableArtist()
