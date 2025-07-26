import { render, screen } from '@testing-library/react'
import { SiteHeader } from '@/components/site-header'

// Next.js의 Image 컴포넌트 모킹
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// next-intl 모킹
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations = {
      'SiteHeader.title': '묵향 서예전',
      'SiteHeader.galleryLink': '갤러리',
      'SiteHeader.artistLink': '작가 소개',
      'SiteHeader.goToHome': '홈으로 가기',
      'SiteHeader.mainNavigation': '주 메뉴',
    }
    return translations[key as keyof typeof translations] || key
  },
  useLocale: () => 'ko',
}))

describe('SiteHeader', () => {
  it('렌더링이 올바르게 되는지 확인', () => {
    render(<SiteHeader />)

    // 로고와 제목이 표시되는지 확인
    expect(screen.getByText('묵향 서예전')).toBeInTheDocument()

    // 네비게이션 링크들이 표시되는지 확인
    expect(screen.getByText('갤러리')).toBeInTheDocument()
    expect(screen.getByText('작가 소개')).toBeInTheDocument()
  })

  it('네비게이션 링크들이 올바른 href를 가지는지 확인', () => {
    render(<SiteHeader />)

    const galleryLink = screen.getByText('갤러리').closest('a')
    const artistLink = screen.getByText('작가 소개').closest('a')

    expect(galleryLink).toHaveAttribute('href', '/gallery')
    expect(artistLink).toHaveAttribute('href', '/artist')
  })

  it('접근성 속성이 올바르게 설정되어 있는지 확인', () => {
    render(<SiteHeader />)

    const homeLink = screen.getByLabelText('홈으로 가기')
    const navigation = screen.getByRole('navigation')

    expect(homeLink).toBeInTheDocument()
    expect(navigation).toHaveAttribute('aria-label', '주 메뉴')
  })

  it('테마 토글과 언어 스위처가 렌더링되는지 확인', () => {
    render(<SiteHeader />)

    // 버튼들이 존재하는지 확인 (정확한 텍스트 없이)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2) // 테마 토글 + 언어 스위처
  })
})
