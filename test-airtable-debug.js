require('dotenv').config({ path: '.env.local' })

async function testAirtableConnection() {
  console.log('=== Airtable 연결 디버그 ===')

  // 환경변수 확인
  console.log('환경변수 상태:')
  console.log(
    '- AIRTABLE_API_KEY:',
    process.env.AIRTABLE_API_KEY
      ? `설정됨 (${process.env.AIRTABLE_API_KEY.length}자)`
      : '설정되지 않음'
  )
  console.log(
    '- AIRTABLE_BASE_ID:',
    process.env.AIRTABLE_BASE_ID
      ? `설정됨 (${process.env.AIRTABLE_BASE_ID.length}자)`
      : '설정되지 않음'
  )

  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.error('❌ 환경변수가 설정되지 않았습니다.')
    return
  }

  try {
    // Airtable 라이브러리 로드
    const Airtable = require('airtable')
    console.log('✅ Airtable 라이브러리 로드 성공')

    // Airtable 인스턴스 생성
    const airtable = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
      requestTimeout: 15000,
      endpointUrl: 'https://api.airtable.com',
    })

    const base = airtable.base(process.env.AIRTABLE_BASE_ID)
    console.log('✅ Airtable Base 인스턴스 생성 성공')

    // 여러 테이블 이름 시도 (Artist가 올바른 테이블 이름)
    const tableNames = [
      'Artist', // 올바른 테이블 이름 (단수형)
      'artist', // 소문자 버전
      '작가', // 한글 테이블 이름
      'Table 1', // 기본 테이블 이름
      'Artworks', // 작품 테이블
      'Artwork', // 작품 테이블 (단수형)
      'artworks', // 작품 테이블 (소문자)
      'artwork', // 작품 테이블 (소문자 단수형)
    ]

    console.log('\n=== 테이블 접근 테스트 ===')

    for (const tableName of tableNames) {
      try {
        console.log(`\n🔍 "${tableName}" 테이블 접근 시도...`)

        const records = await base(tableName)
          .select({
            maxRecords: 3, // 더 많은 레코드 확인
            fields: [], // 모든 필드 가져오기
          })
          .firstPage()

        console.log(`✅ "${tableName}" 테이블 접근 성공!`)
        console.log(`- 총 레코드 수: ${records.length}`)

        if (records.length > 0) {
          records.forEach((record, index) => {
            console.log(`\n--- 레코드 ${index + 1} ---`)
            console.log(`- ID: ${record.id}`)
            console.log(
              `- 필드 키들: [${Object.keys(record.fields).join(', ')}]`
            )
            console.log(`- 필드 데이터:`)
            console.log(JSON.stringify(record.fields, null, 2))

            // 특정 필드들 확인
            const possibleNameFields = [
              'name',
              'Name',
              'NAME',
              '이름',
              '작가명',
              'artist_name',
              'artistName',
            ]
            const possibleEmailFields = [
              'email',
              'Email',
              'EMAIL',
              '이메일',
              'artist_email',
            ]
            const possiblePhoneFields = [
              'phone',
              'Phone',
              'PHONE',
              '전화번호',
              '연락처',
              'contact',
            ]
            const possibleBirthFields = [
              'birthDate',
              'birth_date',
              'Birth Date',
              '생년월일',
              '출생일',
            ]

            possibleNameFields.forEach((field) => {
              if (record.fields[field]) {
                console.log(
                  `🎯 이름 필드 발견: ${field} = ${record.fields[field]}`
                )
              }
            })

            possibleEmailFields.forEach((field) => {
              if (record.fields[field]) {
                console.log(
                  `📧 이메일 필드 발견: ${field} = ${record.fields[field]}`
                )
              }
            })

            possiblePhoneFields.forEach((field) => {
              if (record.fields[field]) {
                console.log(
                  `📞 전화번호 필드 발견: ${field} = ${record.fields[field]}`
                )
              }
            })

            possibleBirthFields.forEach((field) => {
              if (record.fields[field]) {
                console.log(
                  `🎂 생년월일 필드 발견: ${field} = ${record.fields[field]}`
                )
              }
            })
          })
        }

        return true // 성공적으로 접근한 경우 true 반환
      } catch (error) {
        console.log(`❌ "${tableName}" 테이블 접근 실패: ${error.message}`)
        if (error.statusCode) {
          console.log(`   상태 코드: ${error.statusCode}`)
        }
        continue
      }
    }

    console.log('\n❌ 모든 테이블 이름에 대한 접근이 실패했습니다.')
    console.log('\n🔧 문제 해결 방법:')
    console.log('1. Airtable Base ID가 올바른지 확인하세요')
    console.log('2. API 키에 해당 Base에 대한 접근 권한이 있는지 확인하세요')
    console.log('3. 테이블 이름이 정확한지 확인하세요')
    console.log('4. Airtable에서 해당 테이블이 존재하는지 확인하세요')
  } catch (error) {
    console.error('❌ 전체 연결 실패:', error)
    console.error('에러 세부사항:', {
      message: error.message,
      statusCode: error.statusCode,
      type: error.type,
      stack: error.stack,
    })
  }
}

// 스크립트 실행
testAirtableConnection()
