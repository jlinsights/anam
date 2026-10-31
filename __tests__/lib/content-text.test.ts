import { sanitizeText } from '@/lib/airtable'
import { parseBirthYear, realText } from '@/lib/content-text'

describe('parseBirthYear', () => {
  it('Airtable 이름 칸의 (b.1955) 표기에서 연도를 읽는다', () => {
    expect(parseBirthYear('', '芽南 裵玉永 (b.1955)')).toBe(1955)
  })

  it('출생 연도 칸이 있으면 그것을 먼저 쓴다', () => {
    expect(parseBirthYear('1955', '芽南 裵玉永 (b.1960)')).toBe(1955)
  })

  it('연도를 찾지 못하면 지어내지 않고 비워 둔다', () => {
    expect(parseBirthYear('', '芽南 裵玉永')).toBeUndefined()
  })
})

describe('realText', () => {
  it('Airtable 템플릿 자리 채움 문구는 빈 값으로 바꾼다', () => {
    expect(realText('작품 설명 혹은 평론')).toBe('')
    expect(realText(' 작가의 글 ')).toBe('')
  })

  it('실제 내용은 그대로 둔다', () => {
    expect(realText('먹의 번짐으로 그린 강변')).toBe('먹의 번짐으로 그린 강변')
    expect(realText(undefined)).toBe('')
  })
})

describe('sanitizeText', () => {
  it('제어 문자는 지우고 줄바꿈은 남긴다', () => {
    expect(sanitizeText('소개\r\n\n* 동양철학박사\u0000')).toBe(
      '소개\n\n* 동양철학박사'
    )
  })
})
