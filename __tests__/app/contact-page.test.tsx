import { render, screen } from '@testing-library/react'
import ContactPage from '@/app/contact/page'

// ?artwork= 로 들어온 긴 작품명 끝의 이모지가 80자 자르기에서 반쪽이 되면 페이지가 렌더링되지 않았다(Codex 리뷰 #27)
describe('문의 페이지 ?artwork=', () => {
  it('긴 작품명 끝의 이모지가 잘려도 페이지가 그려진다', async () => {
    const artwork = `${'가'.repeat(79)}😀끝`
    const page = await ContactPage({
      searchParams: Promise.resolve({ artwork }),
    })
    render(page)
    expect(screen.getByRole('heading', { level: 1, name: '문의' })).toBeInTheDocument()
    const subject = screen.getByLabelText(/제목/) as HTMLInputElement
    expect(subject.value).toBe(`「${'가'.repeat(79)}😀」 작품 문의`)
  })
})
