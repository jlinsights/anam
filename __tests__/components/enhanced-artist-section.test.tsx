import { render, screen } from '@testing-library/react'
import { EnhancedArtistSection } from '@/components/single-page/EnhancedArtistSection'

// /artist 는 작가 데이터를 못 받으면 artist 없이 이 섹션을 그린다.
// 예전 기본값은 생년 1955 를 지어내 "1955년"으로 보여 줬다
describe('EnhancedArtistSection', () => {
  it('작가 데이터가 없어도 생년을 지어내지 않는다', () => {
    const { container } = render(<EnhancedArtistSection />)
    expect(container.textContent).not.toMatch(/1955/)
    expect(screen.getAllByText(/아남 배옥영/).length).toBeGreaterThan(0)
  })

  it('실제 생년이 있으면 보여 준다', () => {
    render(
      <EnhancedArtistSection
        artist={{
          id: 'a1',
          name: '아남 배옥영',
          bio: '서예가',
          birthYear: 1961,
          exhibitions: [],
          awards: [],
          education: [],
        }}
      />
    )
    expect(screen.getAllByText(/1961/).length).toBeGreaterThan(0)
  })
})
