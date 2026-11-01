import { render, screen, within } from '@testing-library/react'
import { ExhibitionHistory } from '@/components/exhibition/ExhibitionHistory'

describe('ExhibitionHistory', () => {
  it('실제 기록이 없으면 섹션을 그리지 않는다 (fallback 은 전시가 비어 있음)', () => {
    const { container } = render(<ExhibitionHistory exhibitions={[]} />)
    expect(container).toBeEmptyDOMElement()

    const { container: missing } = render(<ExhibitionHistory />)
    expect(missing).toBeEmptyDOMElement()
  })

  it('최근 전시부터 번호 목록으로 그리고, 기간과 횟수를 보여 준다', () => {
    render(
      <ExhibitionHistory
        exhibitions={[
          '2018 | 개인전 | 제1회 아남 배옥영 초대전',
          '2024 | 단체전 | 정읍 서예 단체전',
        ]}
      />
    )

    const section = screen.getByRole('region', { name: '전시 이력' })
    // /exhibition → /#exhibition 앵커가 이 id 로 도착한다
    expect(section).toHaveAttribute('id', 'exhibition')
    expect(within(section).getByText('2018–2024 · 2회')).toBeInTheDocument()

    const items = within(section).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('2024')
    expect(items[0]).toHaveTextContent('정읍 서예 단체전')
    expect(items[0]).toHaveTextContent('단체전')
    expect(items[1]).toHaveTextContent('제1회 아남 배옥영 초대전')
  })
})
