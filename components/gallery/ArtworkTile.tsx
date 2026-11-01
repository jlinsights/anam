import Link from 'next/link'
import type { Artwork } from '@/lib/types'
import { previewImageFor } from '@/lib/artwork-full-image'

interface ArtworkTileProps {
  artwork: Artwork
  /** 첫 화면에 보이는 칸은 바로 받는다 */
  eager?: boolean
}

// 갤러리 카드의 도장 그림자(DESIGN.md Seal Offset): hover·포커스 때만 8px 먹 그림자와 함께 4px 왼쪽 위로.
// 표구 여백 위에 잘리지 않은 작품을 앉힌 칸. 가로·세로 작품이 섞여도 칸 높이는 같고(4:5),
// 그림은 칸 안에서 제 비율 그대로 들어간다. 로딩 효과·등장 효과 없음(CLAUDE.md)
export function ArtworkTile({ artwork, eager = false }: ArtworkTileProps) {
  const preview = previewImageFor(artwork)
  const src = preview?.src ?? artwork.imageUrl
  const meta = [artwork.year ? `${artwork.year}` : '', artwork.medium ?? '']
    .filter(Boolean)
    .join(' · ')

  return (
    <Link
      href={`/gallery/${artwork.slug || artwork.id}`}
      className='group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'
    >
      <div className='flex aspect-[4/5] items-center justify-center border border-ink/15 bg-paper-warm p-3 transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:border-ink group-hover:shadow-brutal group-focus-visible:-translate-x-1 group-focus-visible:-translate-y-1 group-focus-visible:border-ink group-focus-visible:shadow-brutal motion-reduce:transform-none sm:p-4'>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- 정적 파일을 그대로 준다(images.unoptimized)
          <img
            src={src}
            width={preview?.width}
            height={preview?.height}
            alt={artwork.title}
            loading={eager ? 'eager' : 'lazy'}
            decoding='async'
            className='h-auto max-h-full w-auto max-w-full object-contain'
          />
        ) : (
          <span className='font-body text-sm text-ink-light'>
            이미지 준비 중
          </span>
        )}
      </div>
      <p className='mt-2 line-clamp-1 font-display text-[15px] font-bold text-ink sm:text-base'>
        {artwork.title}
      </p>
      {meta && (
        <p className='line-clamp-1 font-body text-xs text-ink-light tabular-nums sm:text-[13px]'>
          {meta}
        </p>
      )}
    </Link>
  )
}
