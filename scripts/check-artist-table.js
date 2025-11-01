/**
 * artist 테이블 구조 확인
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function checkArtistTable() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('📋 Checking artist table structure...\n')

  // Try both table names
  for (const tableName of ['artist', 'artists']) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      console.log(`✅ Found table: ${tableName}`)
      console.log('Columns:', Object.keys(data).join(', '))
      console.log('\nSample data:')
      console.log(JSON.stringify(data, null, 2))
      break
    } else if (error && error.code !== 'PGRST116') {
      console.log(`❌ Error checking ${tableName}:`, error.message)
    }
  }
}

checkArtistTable()

