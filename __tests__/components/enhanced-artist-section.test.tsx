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

  const full = {
    id: 'a1',
    name: '아남 배옥영',
    bio: '서예가',
    statement: '붓이 머무는 곳',
    philosophy: '여백을 쓴다',
    exhibitions: ['2024 개인전'],
    awards: ['대한민국미술대전 입선'],
    education: ['서예 수학'],
    techniques: ['발묵'],
  }

  // 예전에는 경력·작품 세계가 탭 뒤에 숨어 눌러야 보였다(탭 ARIA 도 없었다)
  it('소개·경력·작품 세계를 누르지 않아도 한 화면에 모두 보여 준다', () => {
    render(<EnhancedArtistSection artist={full} />)
    expect(screen.getByRole('heading', { name: '경력' })).toBeInTheDocument()
    expect(screen.getByText('2024 개인전')).toBeInTheDocument()
    expect(screen.getByText('대한민국미술대전 입선')).toBeInTheDocument()
    expect(screen.getByText('여백을 쓴다')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('디자인 체계 밖의 색·둥근 모서리·이모지·다크 클래스를 쓰지 않는다', () => {
    const { container } = render(<EnhancedArtistSection artist={full} />)
    expect(container.innerHTML).not.toMatch(
      /yellow-|amber-|rounded|dark:|shadow-lg/
    )
    expect(container.textContent).not.toMatch(/[🏆📚👥📧🌐📷]/u)
  })

  it('생년은 "b.1955" 로 쓴다("1955년생" 아님)', () => {
    render(
      <EnhancedArtistSection
        artist={{
          id: 'a1',
          name: '芽南 裵玉永',
          bio: '서예가',
          birthYear: 1955,
          exhibitions: [],
          awards: [],
          education: [],
        }}
      />
    )
    expect(screen.getByText('b.1955')).toBeInTheDocument()
    expect(screen.queryByText(/1955년생/)).toBeNull()
  })

  // 데이터 원문은 "연도 | 종류 | 제목". 예전엔 세로줄째 그대로, 오래된 것부터 보여 줬다
  it('전시 이력은 최근 것부터 연도·제목·종류로 나눠 보여 준다', () => {
    render(
      <EnhancedArtistSection
        artist={{
          ...full,
          exhibitions: [
            '2018 | 개인전 | 제1회 아남 배옥영 초대전',
            '2026 | 개인전 | 제7회 아남 배옥영 개인전',
          ],
        }}
      />
    )
    const list = screen.getByRole('list', { name: '전시 이력' })
    const items = Array.from(list.querySelectorAll('li')).map(
      (li) => li.textContent ?? ''
    )
    expect(items[0]).toMatch(/2026.*제7회 아남 배옥영 개인전.*개인전/)
    expect(items[1]).toMatch(/2018.*제1회/)
    expect(list.textContent).not.toMatch(/\|/)
  })
})
