import Image from 'next/image'
import Link from 'next/link'
import type { Artist } from '@/lib/types'
import { exhibitionHistory } from '@/lib/exhibition-history'
import { ArtistBio } from '@/components/artist/ArtistBio'

interface EnhancedArtistSectionProps {
  artist?: Artist
}

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'

// 작가 데이터가 없을 때의 기본값. 생년 등 사실은 지어내지 않는다(예전에는 1955 를 넣어 보여 줬다)
const FALLBACK: Artist = {
  id: 'anam',
  name: '아남 배옥영',
  bio: '전통 서예의 깊이와 현대적 감각을 조화시키며, 한국 미학의 정수를 현대적 언어로 재해석하는 작업을 하고 있습니다.',
  exhibitions: [],
  awards: [],
  education: [],
}

const has = (list?: string[]): list is string[] =>
  Array.isArray(list) && list.length > 0

// 작가 소개를 한 장의 글처럼 읽게 한다. 예전에는 소개·경력·작품 세계를 탭 뒤에 숨겼고(탭 ARIA 없음),
// 노란·호박색 상자, 둥근 모서리, 그림자, 이모지 아이콘, 등장 효과가 디자인 체계 밖에 있었다
export function EnhancedArtistSection({ artist }: EnhancedArtistSectionProps) {
  const a = artist ?? FALLBACK

  const facts = [
    { label: '출생 연도', value: a.birthYear ? `${a.birthYear}년` : '' },
    { label: '출생지', value: a.birthPlace ?? '' },
    { label: '현 거주지', value: a.currentLocation ?? '' },
    {
      label: '전문 분야',
      value: has(a.specialties) ? a.specialties.join(', ') : '',
    },
  ].filter((fact) => fact.value)

  const careerBlocks = [
    { title: '학력', items: a.education },
    { title: '전시 이력', items: a.exhibitions },
    { title: '수상 경력', items: a.awards },
    { title: '작품 소장처', items: a.collections },
    { title: '출판물', items: a.publications },
  ].filter((block) => has(block.items))

  const worldBlocks = [
    { title: '예술적 영향', items: a.influences },
    { title: '주요 기법', items: a.techniques },
    { title: '사용 재료', items: a.materials },
    { title: '교육 경력', items: a.teachingExperience },
  ].filter((block) => has(block.items))

  return (
    <div className='mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 md:px-8 md:pt-14'>
      <header className='pb-10'>
        <h1 className='font-display text-3xl font-bold text-ink md:text-4xl'>
          작가 소개
        </h1>
        <div className='mt-3 h-1 w-24 bg-gold' aria-hidden='true' />
      </header>

      <div className='grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16'>
        <aside className='lg:col-span-4'>
          <div className='lg:sticky lg:top-24'>
            <div className='border-2 border-ink bg-paper-warm p-4'>
              {a.profileImageUrl ? (
                <Image
                  src={a.profileImageUrl}
                  alt={a.name}
                  width={400}
                  height={400}
                  className='h-auto w-full object-cover'
                />
              ) : (
                <div className='flex aspect-square items-center justify-center'>
                  <span className='font-display text-5xl text-ink-light'>
                    芽南
                  </span>
                </div>
              )}
            </div>

            <p className='mt-6 font-display text-2xl font-bold text-ink'>
              {a.name}
            </p>
            <p className='mt-1 font-body text-sm uppercase tracking-[0.15em] text-ink-light'>
              Anam Bae Ok Young
            </p>
            {a.birthYear && (
              <p className='mt-1 font-body text-sm text-ink-light'>
                b.{a.birthYear}
              </p>
            )}

            <ContactLinks artist={a} />

            {has(a.memberships) && (
              <div className='mt-8 border-t border-ink/15 pt-6'>
                <h2 className='font-body text-sm font-medium text-ink'>
                  소속 단체
                </h2>
                <ul className='mt-3 space-y-1.5 font-body text-sm text-ink-light'>
                  {a.memberships.map((membership) => (
                    <li key={membership}>{membership}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>

        <div className='space-y-16 lg:col-span-8'>
          <Section title='소개'>
            <ArtistBio bio={a.bio} />
            {a.statement && (
              <figure className='mt-10 max-w-[60ch] border-y border-ink/20 py-8'>
                <blockquote className='font-display text-xl leading-relaxed text-ink'>
                  {a.statement}
                </blockquote>
                <figcaption className='mt-4 font-body text-sm text-ink-light'>
                  작가의 말
                </figcaption>
              </figure>
            )}
            {facts.length > 0 && (
              <dl className='mt-10 grid max-w-[40rem] grid-cols-[7rem_1fr] border-t-2 border-ink font-body'>
                {facts.map((fact) => (
                  <div key={fact.label} className='contents'>
                    <dt className='border-b border-ink/15 py-3 text-sm text-ink-light'>
                      {fact.label}
                    </dt>
                    <dd className='border-b border-ink/15 py-3 text-ink'>
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </Section>

          {careerBlocks.length > 0 && (
            <Section title='경력'>
              <div className='space-y-10'>
                {careerBlocks.map((block) =>
                  block.title === '전시 이력' ? (
                    <ExhibitionBlock
                      key={block.title}
                      lines={block.items ?? []}
                    />
                  ) : (
                    <ListBlock
                      key={block.title}
                      title={block.title}
                      items={block.items ?? []}
                    />
                  )
                )}
              </div>
            </Section>
          )}

          {(a.philosophy || worldBlocks.length > 0) && (
            <Section title='작품 세계'>
              {a.philosophy && (
                <p className='max-w-[65ch] whitespace-pre-wrap font-body text-[17px] leading-[1.9] text-ink'>
                  {a.philosophy}
                </p>
              )}
              <div className='mt-10 space-y-10'>
                {worldBlocks.map((block) => (
                  <ListBlock
                    key={block.title}
                    title={block.title}
                    items={block.items ?? []}
                  />
                ))}
              </div>
            </Section>
          )}

          <div className='flex flex-wrap items-center gap-x-8 gap-y-4 border-t-2 border-ink pt-10'>
            <Link
              href='/gallery'
              className={`inline-flex min-h-[52px] items-center border-2 border-ink bg-ink px-8 font-body text-paper transition-colors hover:bg-paper hover:text-ink ${FOCUS}`}
            >
              작품 갤러리 보기
            </Link>
            <Link
              href='/contact'
              className={`inline-flex min-h-[44px] items-center border-b-2 border-ink font-body text-ink transition-colors hover:border-gold ${FOCUS}`}
            >
              작가에게 문의하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-label={title}>
      <h2 className='mb-6 font-display text-2xl font-bold text-ink'>{title}</h2>
      {children}
    </section>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className='mb-3 font-body text-sm font-medium text-ink-light'>
        {title}
      </h3>
      <ul className='max-w-[65ch] divide-y divide-ink/10 border-t border-ink/15 font-body text-ink'>
        {items.map((item, index) => (
          <li key={`${index}-${item}`} className='py-2.5 leading-relaxed'>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// 데이터 원문 "2018 | 개인전 | 제1회 …" 를 홈 전시 이력과 같은 규칙으로 나눠, 최근 것부터 보여 준다
function ExhibitionBlock({ lines }: { lines: string[] }) {
  const entries = exhibitionHistory(lines)
  if (entries.length === 0) return null
  return (
    <div>
      <h3
        id='artist-exhibitions-title'
        className='mb-3 font-body text-sm font-medium text-ink-light'
      >
        전시 이력
      </h3>
      <ul
        aria-labelledby='artist-exhibitions-title'
        className='max-w-[65ch] divide-y divide-ink/10 border-t border-ink/15 font-body text-ink'
      >
        {entries.map((entry, index) => (
          <li
            key={`${index}-${entry.title}`}
            className='grid grid-cols-[3.5rem_1fr] gap-x-4 py-2.5 leading-relaxed'
          >
            <span className='tabular-nums text-ink-light'>
              {entry.year ?? ''}
            </span>
            <span>
              {entry.title}
              {entry.kind && (
                <span className='ml-2 text-sm text-ink-light'>
                  {entry.kind}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContactLinks({ artist }: { artist: Artist }) {
  const links = [
    artist.email && {
      href: `mailto:${artist.email}`,
      label: artist.email,
      external: false,
    },
    artist.website && {
      href: artist.website,
      label: '웹사이트',
      external: true,
    },
    artist.socialLinks?.instagram && {
      href: `https://instagram.com/${artist.socialLinks.instagram}`,
      label: `인스타그램 @${artist.socialLinks.instagram}`,
      external: true,
    },
  ].filter(Boolean) as { href: string; label: string; external: boolean }[]

  if (links.length === 0) return null

  return (
    <ul className='mt-6 space-y-2 font-body text-sm'>
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            {...(link.external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            className={`break-all text-ink underline underline-offset-4 hover:text-ink-light ${FOCUS}`}
          >
            {link.label}
            {link.external && <span className='sr-only'> (새 창)</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}
