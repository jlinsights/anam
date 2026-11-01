// 書境 2026 출품작(scripts/data/seokyeong-2026.json)을 Supabase artworks 행으로 바꾼다.
// 데이터 파일에는 작품 정보만 둔다 — 협회 Airtable 의 연락처·주소·생년월일·가격 칸은 옮기지 않는다.

export interface SeokyeongWork {
  number: number
  slug: string
  title: string
  year: number
  dimensions: string
  medium: string
  available: boolean
  description: string
  sourceRecordId: string
  /** 협회 Airtable 첨부 id. 병풍·연작처럼 여러 장이면 왼쪽부터 순서대로 */
  panels: string[]
}

export interface SeokyeongRow {
  slug: string
  title: string
  year: number
  medium: string
  dimensions: string
  aspect_ratio: string
  description: string | null
  category: string
  available: boolean
  featured: boolean
  tags: string[]
  exhibition: string
  image_path: string
  image_url_query: string
  number: number
}

export function toArtworkRow(
  work: SeokyeongWork,
  exhibition: string,
  sizes: Record<string, number[]>
): SeokyeongRow {
  const key = String(work.number)
  const size = sizes[key]
  // 이미지가 아직 없는 작품을 올리면 갤러리에 빈 칸이 생긴다
  if (!size || size.length !== 2) {
    throw new Error(
      `작품 ${key}(${work.title})의 이미지 크기가 lib/artwork-full-sizes.json 에 없습니다`
    )
  }
  return {
    slug: work.slug,
    title: work.title,
    year: work.year,
    medium: work.medium,
    dimensions: work.dimensions,
    aspect_ratio: `${size[0]}/${size[1]}`,
    description: work.description.trim() || null,
    category: '회화',
    available: work.available,
    featured: false,
    tags: [],
    exhibition,
    image_path: `/Images/Artworks/optimized/${key}/${key}-preview.jpg`,
    image_url_query: `${work.title} calligraphy art`,
    number: work.number,
  }
}
