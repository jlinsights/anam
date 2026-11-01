// 문의를 받는 곳은 배옥영 작가 본인 메일이다. Vercel CONTACT_EMAIL 로 바꿀 수 있다
export const ARTIST_EMAIL = 'anam8488@hanmail.net'

export interface ContactDraft {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

// 글자 수 제한(slice·maxLength)은 UTF-16 단위라 이모지를 반쪽으로 남길 수 있다.
// encodeURIComponent 는 반쪽 서로게이트에서 URIError 를 던지므로 먼저 U+FFFD 로 바꾼다
const LONE_SURROGATE =
  /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g

function encodeText(value: string): string {
  return encodeURIComponent(value.replace(LONE_SURROGATE, '\uFFFD'))
}

// 온라인 전송이 안 될 때, 적은 내용을 그대로 담아 메일 앱을 연다
export function mailtoHref(draft: Partial<ContactDraft> = {}): string {
  const lines = [
    draft.message?.trim(),
    '',
    draft.name ? `이름: ${draft.name}` : '',
    draft.email ? `이메일: ${draft.email}` : '',
    draft.phone ? `전화: ${draft.phone}` : '',
  ].filter((line, i) => i < 2 || line)
  const params = [
    `subject=${encodeText(draft.subject?.trim() || '아남 갤러리 문의')}`,
  ]
  const body = lines.join('\n').trim()
  if (body) params.push(`body=${encodeText(body)}`)
  return `mailto:${ARTIST_EMAIL}?${params.join('&')}`
}
