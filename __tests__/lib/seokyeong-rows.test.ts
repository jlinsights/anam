import data from '@/scripts/data/seokyeong-2026.json'
import {
  toArtworkRow,
  type SeokyeongWork,
} from '@/scripts/import-seokyeong/rows'

const works = data.works as SeokyeongWork[]
const sizes = { '62': [1800, 669], '63': [800, 1800] } as Record<
  string,
  number[]
>

describe('書境 2026 출품작 → artworks 행', () => {
  it('54점, 슬러그 anam-62 ~ anam-115 가 겹치지 않는다', () => {
    expect(works).toHaveLength(54)
    const slugs = works.map((w) => w.slug)
    expect(new Set(slugs).size).toBe(54)
    expect(slugs[0]).toBe('anam-62')
    expect(slugs[53]).toBe('anam-115')
    works.forEach((w, i) => expect(w.number).toBe(62 + i))
  })

  // 협회 표기(한지에 먹·옻칠종이에 먹)를 그대로 쓰면 갤러리 재료 칩이 기존 화선지·옻칠종이와 둘로 갈라진다
  it('재료는 갤러리의 기존 표기를 쓴다', () => {
    const media = new Set(works.map((w) => w.medium))
    expect([...media].sort()).toEqual(['옻칠종이', '화선지'])
  })

  it('데이터 파일에 연락처·주소·생년월일·가격이 없다', () => {
    const text = JSON.stringify(data)
    expect(text).not.toMatch(
      /010-\d{4}-\d{4}|@hanmail|정읍시|1955-02-23|price|가격/
    )
    works.forEach((w) =>
      expect(Object.keys(w).sort()).toEqual(
        [
          'available',
          'description',
          'dimensions',
          'medium',
          'number',
          'panels',
          'slug',
          'sourceRecordId',
          'title',
          'year',
        ].sort()
      )
    )
  })

  it('행은 실제로 만든 미리보기 파일을 가리키고 가격은 넣지 않는다', () => {
    const row = toArtworkRow(works[0], data.exhibition, sizes)
    expect(row.slug).toBe('anam-62')
    expect(row.image_path).toBe('/Images/Artworks/optimized/62/62-preview.jpg')
    expect(row.aspect_ratio).toBe('1800/669')
    expect(row.year).toBe(2026)
    expect(row.exhibition).toBe(data.exhibition)
    expect(row).not.toHaveProperty('price')
  })

  it('설명이 비면 null 로 둔다(제목을 되풀이하지 않는다)', () => {
    const empty = works.find((w) => w.description === '')!
    expect(
      toArtworkRow(empty, data.exhibition, { [String(empty.number)]: [10, 10] })
        .description
    ).toBeNull()
  })

  it('이미지 크기가 없으면 행을 만들지 않는다(깨진 칸 방지)', () => {
    expect(() => toArtworkRow(works[2], data.exhibition, sizes)).toThrow(/64/)
  })
})
