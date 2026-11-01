import { parseBio } from '@/lib/artist-bio'

// 작가 소개 원문(Airtable → Supabase)은 줄바꿈으로 나뉜 이름 줄·문단·"* " 이력 목록이다.
// 예전 홈은 이를 한 문단에 붙여 "… 있습니다. * 동양철학박사 * 원광대 …" 처럼 보였다
const BIO =
  '裵 玉 永 / 芽南, 春坡, 素然\n \n전라북도 정읍에서 활동하는 현대 서예가입니다. \n\n전통 서예의 정신을 계승합니다. 해외 전시에 참여하였습니다. \n\n현대 서예의 새로운 경지를 개척합니다.\n\n* 동양철학박사\n* 원광대 강사 역임\n* 사단법인 동양서예협회 초대작가'

describe('parseBio', () => {
  it('이름 줄·문단·이력 목록으로 나눈다', () => {
    expect(parseBio(BIO)).toEqual({
      lead: '裵 玉 永 / 芽南, 春坡, 素然',
      paragraphs: [
        '전라북도 정읍에서 활동하는 현대 서예가입니다.',
        '전통 서예의 정신을 계승합니다. 해외 전시에 참여하였습니다.',
        '현대 서예의 새로운 경지를 개척합니다.',
      ],
      highlights: [
        '동양철학박사',
        '원광대 강사 역임',
        '사단법인 동양서예협회 초대작가',
      ],
    })
  })

  it('문장으로 시작하면 이름 줄로 떼지 않는다', () => {
    expect(parseBio('서예가입니다.\n\n* 박사')).toEqual({
      lead: '',
      paragraphs: ['서예가입니다.'],
      highlights: ['박사'],
    })
  })

  it('빈 값이면 모두 비운다', () => {
    expect(parseBio('  ')).toEqual({ lead: '', paragraphs: [], highlights: [] })
  })
})
