import fullSizes from '@/lib/artwork-full-sizes.json'
import type { Artwork } from '@/lib/types'

export interface FullImage {
  src: string
  width: number
  height: number
}

const sizes: Record<string, number[]> = fullSizes

type NumberSource = Pick<Artwork, 'slug' | 'number'>

// 작품 번호(01~61): 슬러그 "01" · "anam-01-2024" 또는 Airtable number 칸에서 읽는다
export function artworkNumber(artwork: NumberSource): string | null {
  const fromSlug =
    artwork.slug?.match(/^(\d{1,3})$/)?.[1] ??
    artwork.slug?.match(/^anam-(\d+)/)?.[1]
  const raw = fromSlug ?? (artwork.number != null ? String(artwork.number) : '')
  return /^\d+$/.test(raw) ? raw.padStart(2, '0') : null
}

// 잘리지 않은 상세용 이미지(scripts/generate-full-images.mjs)와 실제 크기
export function fullImageFor(artwork: NumberSource): FullImage | null {
  const number = artworkNumber(artwork)
  const size = number ? sizes[number] : undefined
  if (!number || !size || size.length !== 2) return null
  return {
    src: `/Images/Artworks/optimized/${number}/${number}-full.jpg`,
    width: size[0],
    height: size[1],
  }
}

// 이전·다음 이동과 "n / 전체" 표시는 작품 번호 순서를 따른다
export function sortByNumber<T extends NumberSource>(artworks: T[]): T[] {
  const key = (artwork: T) => Number(artworkNumber(artwork) ?? Infinity)
  return [...artworks].sort((a, b) => key(a) - key(b))
}
