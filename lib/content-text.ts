// 작품·작가 데이터의 글 칸을 화면에 내보내기 전에 정리한다

// Airtable(및 그 사본인 Supabase) 템플릿에 남아 있는 자리 채움 문구. 실제 내용이 아니므로 화면에 내보내지 않는다
const TEMPLATE_PLACEHOLDERS = new Set(['작품 설명 혹은 평론', '작가의 글'])

export function realText(value: string | undefined): string {
  const text = value?.trim() ?? ''
  return TEMPLATE_PLACEHOLDERS.has(text) ? '' : text
}

// Airtable에 출생 연도 칸이 없어 이름 칸의 "(b.1955)" 표기에서 읽는다. 없으면 비워 둔다
export function parseBirthYear(...sources: string[]): number | undefined {
  for (const source of sources) {
    const match = source.match(/\b(?:b\.\s*)?((?:19|20)\d{2})\b/)
    if (match) return Number(match[1])
  }
  return undefined
}
