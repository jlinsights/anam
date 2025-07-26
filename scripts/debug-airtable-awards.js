require('dotenv').config({ path: '.env.local' })
const Airtable = require('airtable')

const apiKey = process.env.AIRTABLE_API_KEY
const baseId = process.env.AIRTABLE_BASE_ID

if (!apiKey || !baseId) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const base = Airtable.base(baseId)

async function debugAirtableAwards() {
  try {
    console.log('🔍 에어테이블 Awards 필드 상세 디버깅...')
    console.log('API Key:', apiKey.substring(0, 10) + '...')
    console.log('Base ID:', baseId)

    // Artist 테이블에서 모든 데이터 가져오기 (모든 필드)
    const records = await base('Artist').select().all()

    console.log(`\n📊 Found ${records.length} artist record(s)`)

    records.forEach((record, index) => {
      console.log(`\n🎭 Artist Record ${index + 1}:`)
      console.log('Record ID:', record.id)
      console.log('Name:', record.get('name'))
      console.log('ID field:', record.get('id'))

      // 모든 가능한 awards 관련 필드 확인
      const possibleAwardFields = [
        'awards',
        'Awards',
        'award',
        '수상경력',
        '수상',
        '상',
      ]

      console.log('\n🏆 Awards 관련 필드들:')
      possibleAwardFields.forEach((fieldName) => {
        const value = record.get(fieldName)
        console.log(`  ${fieldName}:`, value)
        if (value && Array.isArray(value)) {
          console.log(`    Type: Array, Length: ${value.length}`)
          value.forEach((item, i) => {
            console.log(`    [${i}] ${item}`)
          })
        } else if (value) {
          console.log(`    Type: ${typeof value}, Value: ${value}`)
        }
      })

      // 모든 필드 출력
      console.log('\n📋 All available fields:')
      console.log(Object.keys(record.fields))

      // Raw fields 출력
      console.log('\n🔍 Raw fields data:')
      console.log(JSON.stringify(record.fields, null, 2))
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode)
    }
    console.error('Full error:', error)
  }
}

debugAirtableAwards()
