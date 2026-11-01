import { fireEvent, render, screen } from '@testing-library/react'
import { ProgressiveImage } from '@/components/common/ProgressiveImage'

// 예전 ProgressiveImage 는 src 없이 그려 두고 IntersectionObserver + new Image() 미리 받기가 성공해야
// src 를 넣었다. 미리 받기가 실패하면 오류도 없이 스피너만 영원히 돌았다. 이제 브라우저 기본
// 지연 로딩(loading="lazy")에 맡긴다 — seonggok.com 과 같은 방식
describe('ProgressiveImage', () => {
  it('처음부터 src 가 있고 브라우저 지연 로딩을 쓴다 (스피너 없음)', () => {
    const { container } = render(
      <ProgressiveImage src='/Images/a-medium.jpg' alt='작품' />
    )
    const img = screen.getByRole('img', { name: '작품' })

    expect(img).toHaveAttribute('src', '/Images/a-medium.jpg')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(container.querySelector('.animate-spin, [data-src]')).toBeNull()
  })

  it('priority 면 바로 받는다', () => {
    render(<ProgressiveImage src='/a.jpg' alt='작품' priority />)
    expect(screen.getByRole('img', { name: '작품' })).toHaveAttribute(
      'loading',
      'eager'
    )
  })

  it('실패하면 fallbackSrc 로 바꾸고, 그것도 실패하면 오류를 보여 준다', () => {
    const onError = jest.fn()
    render(
      <ProgressiveImage
        src='/a-medium.jpg'
        fallbackSrc='/a-thumb.jpg'
        alt='작품'
        onError={onError}
      />
    )
    const img = screen.getByRole('img', { name: '작품' })

    fireEvent.error(img)
    expect(screen.getByRole('img', { name: '작품' })).toHaveAttribute(
      'src',
      '/a-thumb.jpg'
    )

    fireEvent.error(screen.getByRole('img', { name: '작품' }))
    expect(onError).toHaveBeenCalled()
    expect(screen.getByText('이미지를 불러올 수 없습니다')).toBeInTheDocument()
  })
})
