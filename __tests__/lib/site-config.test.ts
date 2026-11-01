import { SITE_CONFIG, STRUCTURED_DATA } from '@/lib/constants/site-config'

// 사이트 메타데이터·JSON-LD 는 검색엔진에 "이 작가의 공식 계정"으로 전달된다.
// 예전에는 작가 것이 아닌 anam.com·instagram.com/anam_art·@anam_art 를 지어 넣어
// 모든 페이지의 twitter:creator 와 Person.sameAs 로 내보냈다
const FAKE = /anam\.com|anam_art/

describe('사이트 설정은 확인되지 않은 계정을 내보내지 않는다', () => {
  it('SITE_CONFIG 에 지어낸 소셜 계정이 없다', () => {
    expect(JSON.stringify(SITE_CONFIG)).not.toMatch(FAKE)
  })

  it('구조화 데이터(Person.sameAs)에 지어낸 주소가 없다', () => {
    expect(JSON.stringify(STRUCTURED_DATA)).not.toMatch(FAKE)
  })
})
