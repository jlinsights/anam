'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE_LINKS, isCurrent } from '@/lib/site-links'

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'

// 모든 화면 위에 붙는 머리띠. 예전에는 홈에만 머리띠가 있어 갤러리·상세·작가·문의에서
// 홈이나 작가로 가려면 맨 아래 푸터까지 내려가야 했다(갤러리 기준 약 8,000px)
export function SiteHeader() {
  const pathname = usePathname() ?? '/'
  const menu = SITE_LINKS.filter((link) => link.href !== '/contact')
  const contact = SITE_LINKS.find((link) => link.href === '/contact')

  return (
    <header className='sticky top-0 z-40 border-b border-ink/15 bg-paper'>
      <a
        href='#main-content'
        className='sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:font-body focus:text-sm focus:text-paper'
      >
        본문으로 건너뛰기
      </a>
      <div className='mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 md:px-8'>
        <Link
          href='/'
          className={`flex shrink-0 items-baseline gap-2 py-2 text-ink ${FOCUS}`}
        >
          <span className='font-display text-xl sm:text-2xl'>아남</span>
          <span className='hidden font-body text-[11px] uppercase tracking-[0.2em] text-ink-light min-[400px]:inline'>
            Gallery
          </span>
        </Link>

        <nav aria-label='주 메뉴'>
          <ul className='flex items-center gap-1 font-body text-[15px] sm:gap-2'>
            {menu.map((link) => {
              const current = isCurrent(pathname, link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current ? 'page' : undefined}
                    className={`inline-flex min-h-[44px] items-center whitespace-nowrap px-2 underline-offset-[6px] decoration-2 sm:px-3 ${
                      current
                        ? 'text-ink underline decoration-gold'
                        : 'text-ink-light hover:text-ink hover:underline hover:decoration-ink/30'
                    } ${FOCUS}`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
            {contact && (
              <li className='ml-1 sm:ml-3'>
                <Link
                  href={contact.href}
                  aria-current={
                    isCurrent(pathname, contact.href) ? 'page' : undefined
                  }
                  className={`inline-flex min-h-[40px] items-center whitespace-nowrap border-2 border-ink px-3 text-ink transition-colors hover:bg-ink hover:text-paper aria-[current=page]:bg-ink aria-[current=page]:text-paper sm:px-4 ${FOCUS}`}
                >
                  {contact.label}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
