import { render, screen, within } from '@testing-library/react'
import { SiteFooter } from '@/components/layout/SiteFooter'

describe('SiteFooter', () => {
  it('사이트 메뉴 네 곳으로 이어진다', () => {
    render(<SiteFooter />)
    const nav = screen.getByRole('navigation', { name: '사이트 메뉴' })
    const hrefs = within(nav)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
    expect(hrefs).toEqual(['/gallery', '/artist', '/#exhibition', '/contact'])
  })

  it('연락은 문의 양식으로만 안내하고 이메일·전화번호는 싣지 않는다', () => {
    const { container } = render(<SiteFooter />)
    expect(
      screen.getByRole('link', { name: /문의 양식 열기/ })
    ).toHaveAttribute('href', '/contact')
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull()
    expect(container.querySelector('a[href^="tel:"]')).toBeNull()
    expect(container.textContent).not.toMatch(/@/)
  })

  it('저작권 연도는 올해로 자동 표시된다', () => {
    render(<SiteFooter />)
    const year = new Date().getFullYear()
    expect(
      screen.getByText(new RegExp(`© ${year} 아남 배옥영`))
    ).toBeInTheDocument()
  })

  it('외부 링크는 새 창으로 열고 그 사실을 알린다', () => {
    render(<SiteFooter />)
    const external = screen.getByRole('link', {
      name: /orientalcalligraphy\.org/,
    })
    expect(external).toHaveAttribute('target', '_blank')
    expect(external).toHaveAttribute('rel', 'noopener noreferrer')
    expect(external).toHaveTextContent('(새 창)')
  })
})
