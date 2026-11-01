import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'fs'
import path from 'path'
import { ContactForm } from '@/components/contact-form'

function mockFetch(status: number, body: Record<string, unknown>) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as unknown as typeof fetch
}

async function fillRequired() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/이름/), '홍길동')
  await user.type(screen.getByLabelText(/이메일/), 'v@example.com')
  await user.type(screen.getByLabelText(/^제목/), '작품 문의')
  await user.type(screen.getByLabelText(/내용/), '소장 문의드립니다.')
  return user
}

describe('ContactForm', () => {
  it('작품 상세에서 넘어온 제목을 미리 채운다', () => {
    render(<ContactForm defaultSubject='「도산가」 작품 문의' />)
    expect(screen.getByLabelText(/^제목/)).toHaveValue('「도산가」 작품 문의')
  })

  it('선택 항목만 "선택"으로 표시하고 별표를 쓰지 않는다', () => {
    const { container } = render(<ContactForm />)
    expect(container.textContent).not.toContain('*')
    expect(screen.getByLabelText(/전화번호/)).not.toBeRequired()
    // 전화번호와 문의 종류만 선택 항목이다
    expect(screen.getAllByText('선택')).toHaveLength(2)
  })

  it('보내고 나면 회신 경로를 알려 주고 입력을 비운다', async () => {
    mockFetch(200, { success: true })
    render(<ContactForm />)
    const user = await fillRequired()
    await user.click(screen.getByRole('button', { name: '문의 보내기' }))
    expect(
      await screen.findByText(/적어 주신 이메일로 회신드립니다/)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/이름/)).toHaveValue('')
  })

  it('보내기에 실패하면 작가 메일로 직접 보내는 링크를 내용과 함께 준다', async () => {
    mockFetch(503, { success: false, code: 'MAIL_NOT_CONFIGURED' })
    render(<ContactForm />)
    const user = await fillRequired()
    await user.click(screen.getByRole('button', { name: '문의 보내기' }))
    const link = await screen.findByRole('link', { name: /메일로 직접 보내기/ })
    const href = link.getAttribute('href') ?? ''
    expect(href.startsWith('mailto:anam8488@hanmail.net?')).toBe(true)
    expect(decodeURIComponent(href)).toContain('소장 문의드립니다.')
    // 실패해도 적은 내용은 지우지 않는다
    expect(screen.getByLabelText(/이름/)).toHaveValue('홍길동')
  })

  it('보내는 동안 단추를 막고 문구로 알린다 (회전 아이콘 없음)', async () => {
    let resolve: (v: unknown) => void = () => {}
    global.fetch = jest.fn(
      () => new Promise((r) => (resolve = r))
    ) as unknown as typeof fetch
    const { container } = render(<ContactForm />)
    const user = await fillRequired()
    await user.click(screen.getByRole('button', { name: '문의 보내기' }))
    expect(screen.getByRole('button', { name: '보내는 중…' })).toBeDisabled()
    expect(container.querySelector('.animate-spin')).toBeNull()
    resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '문의 보내기' })).toBeEnabled()
    )
  })

  it('다크 모드 클래스와 여백 과다 클래스를 쓰지 않는다', () => {
    const { container } = render(<ContactForm />)
    const html = container.innerHTML
    expect(html).not.toMatch(/dark:|void-breathing|contact-card-balanced/)
  })

  it('문의 종류를 고르면 제목 앞에 붙여 보낸다', async () => {
    mockFetch(200, { success: true })
    render(<ContactForm />)
    const user = await fillRequired()
    await user.click(screen.getByRole('radio', { name: '주문 제작' }))
    await user.click(screen.getByRole('button', { name: '문의 보내기' }))
    await screen.findByText(/회신드립니다/)
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
    expect(body.subject).toBe('[주문 제작] 작품 문의')
  })

  it('작품 상세에서 오면 "작품 소장"이 미리 골라져 있다', () => {
    render(<ContactForm defaultSubject='「도산가」 작품 문의' />)
    expect(screen.getByRole('radio', { name: '작품 소장' })).toBeChecked()
  })

  // 흰 한지 위 text-ink-light 는 4.75:1. 투명도를 섞으면 /60 은 2.3:1 로 AA(4.5:1) 미달(Codex 리뷰 #27)
  it('자리 표시 글자에 투명도를 섞지 않는다', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'components/contact-form.tsx'),
      'utf8'
    )
    expect(source).not.toMatch(/placeholder:text-[\w-]+\/\d+/)
  })
})
