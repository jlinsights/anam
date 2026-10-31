import { exhibitionHistory, parseExhibition } from '@/lib/exhibition-history'

describe('parseExhibition', () => {
  it('"연도 | 종류 | 제목" 을 나눈다', () => {
    expect(parseExhibition('2018 | 개인전 | 제1회 아남 배옥영 초대전')).toEqual(
      {
        year: 2018,
        kind: '개인전',
        title: '제1회 아남 배옥영 초대전',
      }
    )
  })

  it('칸이 하나뿐이면 제목으로, 빈 줄은 버린다', () => {
    expect(parseExhibition('서울 초대전')).toEqual({
      year: null,
      kind: '',
      title: '서울 초대전',
    })
    expect(parseExhibition('  ')).toBeNull()
  })
})

describe('exhibitionHistory', () => {
  it('최근 전시가 먼저, 연도 없는 줄은 맨 뒤', () => {
    const lines = [
      '2018 | 개인전 | 제1회',
      '연도 미상 전시',
      '2024 | 개인전 | 제6회',
    ]
    expect(exhibitionHistory(lines).map((e) => e.title)).toEqual([
      '제6회',
      '제1회',
      '연도 미상 전시',
    ])
    expect(lines[0]).toBe('2018 | 개인전 | 제1회')
  })

  it('없으면 빈 배열', () => {
    expect(exhibitionHistory(undefined)).toEqual([])
  })
})
