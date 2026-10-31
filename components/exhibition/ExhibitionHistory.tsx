import Link from 'next/link'
import { exhibitionHistory } from '@/lib/exhibition-history'

interface ExhibitionHistoryProps {
  exhibitions?: readonly string[]
}

// 작가 데이터(/api/artist → Supabase, 원본은 Airtable "전시이력")의 실제 전시 이력.
// fallback 에는 전시가 없으므로 실제 기록이 없으면 섹션을 그리지 않는다. 꾸며 낸 "다가오는 전시" 대신 쓴다 (DESIGN.md: 먹선 2px, 금색은 한 번)
export function ExhibitionHistory({ exhibitions }: ExhibitionHistoryProps) {
  const entries = exhibitionHistory(exhibitions)
  if (entries.length === 0) return null

  const years = entries
    .map((entry) => entry.year)
    .filter((year): year is number => year !== null)
  const span =
    years.length > 0 ? `${Math.min(...years)}–${Math.max(...years)}` : ''

  return (
    // /exhibition 은 /#exhibition 으로 넘어오므로 이 id 로 받는다
    <section
      id='exhibition'
      aria-labelledby='exhibition-history-title'
      className='bg-paper text-ink'
    >
      <div className='max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 border-t-2 border-ink pt-10'>
          <header className='lg:col-span-4'>
            <h2
              id='exhibition-history-title'
              className='font-display font-bold text-3xl md:text-4xl tracking-[-0.02em]'
            >
              전시 이력
            </h2>
            <p className='mt-4 font-body text-sm text-ink-light tabular-nums'>
              {span && `${span} · `}
              {entries.length}회
            </p>
            <Link
              href='/artist'
              className='mt-8 inline-flex items-center gap-2 font-body text-sm underline underline-offset-4 hover:text-ink-light transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'
            >
              작가 소개
              <span aria-hidden='true'>→</span>
            </Link>
          </header>

          <ol className='lg:col-span-8 border-t border-stone'>
            {entries.map((entry, index) => (
              <li
                key={`${entry.year}-${entry.title}`}
                className='grid grid-cols-[4.5rem_1fr] sm:grid-cols-[5.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-5 border-b border-stone'
              >
                <span className='font-body text-sm text-ink-light tabular-nums'>
                  {entry.year ?? ''}
                </span>
                <span className='font-display text-lg md:text-xl leading-snug inline-flex items-baseline gap-3'>
                  {index === 0 && (
                    <span
                      aria-hidden='true'
                      className='inline-block w-2 h-2 bg-gold translate-y-[-0.15em]'
                    />
                  )}
                  {entry.title}
                </span>
                {entry.kind && (
                  <span className='col-start-2 sm:col-start-auto font-body text-sm text-ink-light'>
                    {entry.kind}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
