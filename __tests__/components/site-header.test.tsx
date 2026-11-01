import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SITE_LINKS } from '@/lib/site-links'

let pathname = '/'
jest.mock('next/navigation', () => ({ usePathname: () => pathname }))

beforeEach(() => {
  pathname = '/'
})

describe('SiteHeader', () => {
  it('로고는 홈으로, 메뉴는 푸터와 같은 네 곳으로 이어진다', () => {
    render(<SiteHeader />)
    const nav = screen.getByRole('navigation', { name: '주 메뉴' })
    expect(screen.getByRole('link', { name: /아남/ })).toHaveAttribute(
      'href',
      '/'
    )
    const hrefs = within(nav)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(SITE_LINKS.map((l) => l.href))
    expect(within(nav).getByRole('link', { name: '작가' })).toBeInTheDocument()
  })

  it('작품 상세에서도 "작품"을 현재 위치로 표시한다', () => {
    pathname = '/gallery/anam-35'
    render(<SiteHeader />)
    expect(screen.getByRole('link', { name: '작품' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: '작가' })).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('본문으로 건너뛰기 링크가 첫 초점을 받는다', async () => {
    render(<SiteHeader />)
    await userEvent.tab()
    expect(
      screen.getByRole('link', { name: '본문으로 건너뛰기' })
    ).toHaveFocus()
    expect(
      screen.getByRole('link', { name: '본문으로 건너뛰기' })
    ).toHaveAttribute('href', '#main-content')
  })

  it('동작하지 않는 테마 전환 단추와 영문 메뉴를 두지 않는다', () => {
    const { container } = render(<SiteHeader />)
    expect(
      screen.queryByRole('button', { name: /테마|theme|다크/i })
    ).toBeNull()
    // 로고 "아남 GALLERY" 는 유지한다. 메뉴만 한국어로
    const nav = screen.getByRole('navigation', { name: '주 메뉴' })
    expect(nav.textContent).not.toMatch(/Gallery|Artist|Exhibition|Contact/)
    expect(container.innerHTML).not.toMatch(/dark:/)
  })
})
