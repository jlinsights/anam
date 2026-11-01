// 작가 데이터 exhibitions 의 한 줄(원본은 Airtable "전시이력", Supabase 로 이관됨)("2018 | 개인전 | 제1회 아남 배옥영 초대전")을 나눈다

export interface ExhibitionEntry {
  year: number | null
  kind: string
  title: string
}

export function parseExhibition(line: string): ExhibitionEntry | null {
  const parts = line
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length === 0) return null

  const year = /^\d{4}$/.test(parts[0]) ? Number(parts[0]) : null
  const rest = year === null ? parts : parts.slice(1)
  // "연도 | 종류 | 제목" 이 기본형. 칸이 하나뿐이면 그것을 제목으로 본다
  const [kind, ...titleParts] = rest.length > 1 ? rest : ['', ...rest]
  const title = titleParts.join(' | ')
  return title ? { year, kind, title } : null
}

// 최근 전시가 먼저 오도록. 연도를 모르는 줄은 맨 뒤에 원래 순서대로 둔다
export function exhibitionHistory(
  lines: readonly string[] = []
): ExhibitionEntry[] {
  return lines
    .map(parseExhibition)
    .filter((entry): entry is ExhibitionEntry => entry !== null)
    .map((entry, index) => ({ entry, index }))
    .sort(
      (a, b) =>
        (b.entry.year ?? -Infinity) - (a.entry.year ?? -Infinity) ||
        a.index - b.index
    )
    .map(({ entry }) => entry)
}
