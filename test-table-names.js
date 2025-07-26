require('dotenv').config({ path: '.env.local' })
const Airtable = require('airtable')

async function testTableNames() {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID

  if (!apiKey || !baseId) {
    console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID')
    return
  }

  console.log('Testing table names...')

  const base = new Airtable({ apiKey }).base(baseId)

  // Test common table names
  const tablesToTest = [
    'Artist',
    'Artists',
    'Artworks',
    'Artwork',
    'artworks',
    'artwork',
    'Table 1',
    'Table 2',
    '작가',
    '작품',
  ]

  for (const tableName of tablesToTest) {
    try {
      console.log(`\n🔍 Testing table: "${tableName}"`)
      const records = await base(tableName)
        .select({
          maxRecords: 1,
        })
        .firstPage()

      console.log(
        `✅ Table "${tableName}" exists with ${records.length} records`
      )
      if (records.length > 0) {
        console.log(`   Fields: ${Object.keys(records[0].fields).join(', ')}`)
      }
    } catch (error) {
      console.log(`❌ Table "${tableName}" not found: ${error.message}`)
    }
  }
}

testTableNames().catch(console.error)
