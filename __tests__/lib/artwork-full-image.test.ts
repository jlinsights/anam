import {
  artworkNumber,
  fullImageFor,
  sortByNumber,
} from '@/lib/artwork-full-image'

describe('artworkNumber', () => {
  it('슬러그 "01"과 "anam-01-2024", number 칸을 모두 두 자리 번호로 읽는다', () => {
    expect(artworkNumber({ slug: '1' })).toBe('01')
    expect(artworkNumber({ slug: 'anam-38-2024' })).toBe('38')
    expect(artworkNumber({ slug: 'unknown', number: 7 })).toBe('07')
  })

  it('번호를 알 수 없으면 null', () => {
    expect(artworkNumber({ slug: 'unknown' })).toBeNull()
  })
})

describe('fullImageFor', () => {
  it('잘리지 않은 상세 이미지 경로와 실제 크기를 돌려준다', () => {
    const image = fullImageFor({ slug: '61' })
    expect(image?.src).toBe('/Images/Artworks/optimized/61/61-full.jpg')
    // 61번은 세로로 긴 족자: 정사각형으로 잘리지 않아야 한다
    expect(image!.height).toBeGreaterThan(image!.width * 3)
  })

  it('목록에 없는 번호는 null', () => {
    expect(fullImageFor({ slug: '999' })).toBeNull()
  })
})

describe('sortByNumber', () => {
  it('작품 번호 순으로 정렬하고 원본 배열은 건드리지 않는다', () => {
    const input = [
      { slug: '10' },
      { slug: '02' },
      { slug: 'x' },
      { slug: '01' },
    ]
    expect(sortByNumber(input).map((a) => a.slug)).toEqual([
      '01',
      '02',
      '10',
      'x',
    ])
    expect(input[0].slug).toBe('10')
  })
})
