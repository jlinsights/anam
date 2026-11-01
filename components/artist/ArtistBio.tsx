import { useId } from 'react'
import { parseBio } from '@/lib/artist-bio'

interface ArtistBioProps {
  bio: string | undefined
  className?: string
}

// 작가 소개 원문을 이름 줄 → 문단 → 주요 이력 목록 순으로 정돈해 보여 준다(홈·/artist 공용).
// 예전에는 줄바꿈이 사라져 문단과 "* 이력"이 한 덩어리로 붙거나(홈), 별표가 그대로 보였다(/artist)
export function ArtistBio({ bio, className = '' }: ArtistBioProps) {
  const { lead, paragraphs, highlights } = parseBio(bio)
  const listId = useId()
  if (!lead && paragraphs.length === 0 && highlights.length === 0) return null

  return (
    <div className={`break-keep ${className}`}>
      {lead && (
        <p className='font-body text-sm tracking-[0.08em] text-ink-light'>
          {lead}
        </p>
      )}
      {paragraphs.length > 0 && (
        <div
          className={`max-w-[62ch] space-y-4 font-body text-base leading-[1.9] text-ink ${lead ? 'mt-5' : ''}`}
        >
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}
      {highlights.length > 0 && (
        <div className='mt-10 max-w-[62ch]'>
          <h3
            id={listId}
            className='mb-3 font-body text-sm font-medium text-ink-light'
          >
            주요 이력
          </h3>
          <ul
            aria-labelledby={listId}
            className='divide-y divide-ink/10 border-y border-ink/15 font-body text-[15px] text-ink'
          >
            {highlights.map((item, index) => (
              <li key={`${index}-${item}`} className='py-2.5 leading-relaxed'>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
