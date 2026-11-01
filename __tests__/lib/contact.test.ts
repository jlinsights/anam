import { ARTIST_EMAIL, mailtoHref } from '@/lib/contact'

// 글자 수 제한(slice·maxLength)은 UTF-16 단위로 자르므로 이모지가 반쪽(외톨이 서로게이트)으로 남을 수 있다.
// encodeURIComponent 는 그 반쪽에서 URIError 를 던져 /contact 렌더링 전체가 실패했다(Codex 리뷰 #27)
describe('mailtoHref', () => {
  it('반쪽 이모지가 섞여도 예외 없이 링크를 만든다', () => {
    const halfEmoji = '😀'.slice(0, 1)
    expect(() =>
      mailtoHref({ subject: `제목${halfEmoji}`, message: `내용${halfEmoji}` })
    ).not.toThrow()
  })

  it('온전한 이모지와 한글은 그대로 담는다', () => {
    const href = mailtoHref({ subject: '도산가 😀', message: '안녕하세요' })
    expect(href.startsWith(`mailto:${ARTIST_EMAIL}?`)).toBe(true)
    expect(decodeURIComponent(href.split('subject=')[1].split('&')[0])).toBe(
      '도산가 😀'
    )
  })

  it('제목이 비면 기본 제목을 쓴다', () => {
    expect(mailtoHref()).toContain(
      `subject=${encodeURIComponent('아남 갤러리 문의')}`
    )
  })
})
