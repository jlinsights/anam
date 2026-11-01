// 작가 소개 원문(Airtable → Supabase)을 화면 구조로 나눈다.
// 원문은 빈 줄로 나뉜 블록이고, 맨 앞은 대개 "裵 玉 永 / 芽南, 春坡, 素然" 같은 이름·호 한 줄,
// 끝에는 "* " 로 시작하는 주요 이력 목록이 온다. 내용은 고치지 않고 나누기만 한다

export interface ParsedBio {
  lead: string
  paragraphs: string[]
  highlights: string[]
}

const BULLET = /^\s*[*\-•·]\s+/

// 문장이 아닌 짧은 한 줄(끝이 마침표·"다"로 끝나지 않음)만 이름 줄로 본다
function isLead(block: string): boolean {
  return (
    !block.includes('\n') &&
    block.length <= 40 &&
    !/[.。!?]$|다$/.test(block) &&
    !BULLET.test(block)
  )
}

export function parseBio(text: string | undefined): ParsedBio {
  const blocks = (text ?? '')
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join('\n')
    )
    .filter(Boolean)

  const highlights: string[] = []
  const paragraphs: string[] = []
  blocks.forEach((block) => {
    const lines = block.split('\n')
    if (lines.every((line) => BULLET.test(line))) {
      highlights.push(...lines.map((line) => line.replace(BULLET, '').trim()))
    } else {
      paragraphs.push(lines.join(' '))
    }
  })

  const lead =
    paragraphs.length > 1 && isLead(paragraphs[0]) ? paragraphs[0] : ''
  return {
    lead,
    paragraphs: lead ? paragraphs.slice(1) : paragraphs,
    highlights,
  }
}
