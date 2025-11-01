/**
 * Supabase 설정 확인 스크립트
 * 환경 변수와 Supabase 연결 상태를 확인합니다.
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

function checkEnvironmentVariables() {
  console.log('📋 Step 1: 환경 변수 확인\n')

  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const optionalVars = {
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'AIRTABLE_API_KEY': process.env.AIRTABLE_API_KEY,
    'AIRTABLE_BASE_ID': process.env.AIRTABLE_BASE_ID,
  }

  let allRequired = true

  // 필수 환경 변수 확인
  console.log('필수 환경 변수:')
  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      const maskedValue = key.includes('KEY') 
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value
      console.log(`  ✅ ${key}: ${maskedValue}`)
    } else {
      console.log(`  ❌ ${key}: 설정되지 않음`)
      allRequired = false
    }
  }

  console.log('\n선택적 환경 변수:')
  for (const [key, value] of Object.entries(optionalVars)) {
    if (value) {
      const maskedValue = key.includes('KEY') || key.includes('ID')
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value
      console.log(`  ✅ ${key}: ${maskedValue}`)
    } else {
      console.log(`  ⚠️  ${key}: 설정되지 않음 (fallback용)`)
    }
  }

  return allRequired
}

async function checkSupabaseConnection() {
  console.log('\n📋 Step 2: Supabase 연결 확인\n')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log('  ❌ 환경 변수가 설정되지 않아 연결을 테스트할 수 없습니다.')
      return false
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase
      .from('artworks')
      .select('count')
      .limit(1)

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('  ⚠️  연결은 성공했지만 artworks 테이블이 아직 생성되지 않았습니다.')
        console.log('     → lib/supabase/schema.sql 파일을 Supabase SQL Editor에서 실행하세요.')
        return false
      }
      console.log(`  ❌ Supabase 연결 실패: ${error.message}`)
      return false
    }

    console.log('  ✅ Supabase 연결 성공!')

    // 테이블 존재 확인
    const { data: artworksData, error: artworksError } = await supabase
      .from('artworks')
      .select('id')
      .limit(1)

    const { data: artistsData, error: artistsError } = await supabase
      .from('artists')
      .select('id')
      .limit(1)

    console.log('\n  테이블 상태:')
    
    if (!artworksError && artworksData !== null) {
      // 작품 개수 확인
      const { count } = await supabase
        .from('artworks')
        .select('*', { count: 'exact', head: true })
      
      console.log(`    ✅ artworks 테이블: 존재 (${count || 0}개 작품)`)
    } else {
      console.log('    ❌ artworks 테이블: 존재하지 않음')
    }

    if (!artistsError && artistsData !== null) {
      console.log('    ✅ artists 테이블: 존재')
    } else {
      console.log('    ❌ artists 테이블: 존재하지 않음')
    }

    return true
  } catch (error) {
    console.log(`  ❌ 연결 중 오류 발생: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Supabase 설정 확인 시작\n')
  console.log('=' .repeat(50) + '\n')

  const envOk = checkEnvironmentVariables()

  if (!envOk) {
    console.log('\n' + '='.repeat(50))
    console.log('\n❌ 필수 환경 변수가 설정되지 않았습니다.')
    console.log('\n📝 다음 단계:')
    console.log('   1. Supabase 프로젝트 생성: https://app.supabase.com')
    console.log('   2. .env.local 파일에 환경 변수 추가:')
    console.log('      NEXT_PUBLIC_SUPABASE_URL=your_project_url')
    console.log('      SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
    console.log('\n   자세한 내용은 docs/SUPABASE_MIGRATION_GUIDE.md 참조\n')
    process.exit(1)
  }

  const connectionOk = await checkSupabaseConnection()

  console.log('\n' + '='.repeat(50))

  if (connectionOk) {
    console.log('\n✅ 모든 확인 완료!')
    console.log('\n📝 다음 단계:')
    console.log('   1. 데이터 마이그레이션 실행:')
    console.log('      node scripts/migrate-airtable-to-supabase.js')
    console.log('   2. 애플리케이션 테스트:')
    console.log('      npm run dev')
  } else {
    console.log('\n⚠️  일부 설정이 완료되지 않았습니다.')
    console.log('\n📝 다음 단계:')
    console.log('   1. Supabase Dashboard → SQL Editor에서 schema.sql 실행')
    console.log('   2. 설정 확인 재실행: node scripts/check-supabase-setup.js')
    console.log('   3. 마이그레이션 실행: node scripts/migrate-airtable-to-supabase.js')
  }

  console.log('')
}

main().catch(console.error)

