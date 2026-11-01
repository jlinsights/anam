import { render, screen } from '@testing-library/react'
import { ArtistBio } from '@/components/artist/ArtistBio'

describe('ArtistBio', () => {
  it('이력은 별표 없이 목록으로, 문단은 따로 그린다', () => {
    const { container } = render(
      <ArtistBio bio={'호 / 芽南\n\n첫 문단입니다.\n\n둘째 문단입니다.\n\n* 동양철학박사\n* 초대작가'} />
    )
    const list = screen.getByRole('list', { name: '주요 이력' })
    expect(list.querySelectorAll('li')).toHaveLength(2)
    expect(container.querySelectorAll('p')).toHaveLength(3)
    expect(container.textContent).not.toMatch(/\*/)
  })
})
