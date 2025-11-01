/**
 * Supabase 테이블 구조 확인 스크립트
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function checkTableStructure() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('📋 Checking artworks table structure...\n')

  // Get one record to see its structure
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (data) {
    console.log('✅ Sample record found:')
    console.log('Columns:', Object.keys(data).join(', '))
    console.log('\nSample data:')
    console.log(JSON.stringify(data, null, 2))
  } else {
    console.log('⚠️  No records found, but table exists')
  }
}

checkTableStructure()

