import Link from 'next/link'
import { SITE_LINKS as links } from '@/lib/site-links'

const linkClass =
  'underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'

// 사이트 공통 푸터. 연락은 문의 페이지로 이끈다. 작가 이메일은 /contact·/artist 에 공개하고(2026-11-01 결정)
// 푸터에는 이메일·전화번호를 싣지 않는다
export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className='bg-ink text-paper'>
      <div className='max-w-7xl mx-auto px-6 md:px-8 pt-16 pb-10'>
        <div className='grid grid-cols-1 md:grid-cols-12 gap-10'>
          <div className='md:col-span-6'>
            <p className='font-display text-3xl md:text-4xl tracking-[-0.02em]'>
              芽南 裵玉永
            </p>
            <p className='mt-3 font-body text-sm'>
              아남 배옥영 · 서예가, 전라북도 정읍
            </p>
          </div>

          <nav aria-label='사이트 메뉴' className='md:col-span-3'>
            <ul className='space-y-3 font-body text-sm'>
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className='md:col-span-3 font-body text-sm'>
            <p>작품 소장·전시 문의는</p>
            <Link
              href='/contact'
              className='mt-3 inline-flex items-center gap-2 border-2 border-paper px-5 py-3 hover:bg-paper hover:text-ink transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'
            >
              문의 양식 열기
              <span aria-hidden='true'>→</span>
            </Link>
          </div>
        </div>

        <div className='mt-14 pt-6 border-t border-paper flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-body text-xs'>
          <p>© {year} 아남 배옥영. 작품 이미지의 저작권은 작가에게 있습니다.</p>
          <a
            href='https://orientalcalligraphy.org'
            className={linkClass}
            target='_blank'
            rel='noopener noreferrer'
          >
            orientalcalligraphy.org
            <span className='sr-only'> (새 창)</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
