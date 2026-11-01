// 머리띠와 푸터가 같은 메뉴를 쓴다. 이름은 한국어 하나로 통일한다(COPY.md)
export interface SiteLink {
  href: string
  label: string
}

export const SITE_LINKS: readonly SiteLink[] = [
  { href: '/gallery', label: '작품' },
  { href: '/artist', label: '작가' },
  { href: '/#exhibition', label: '전시 이력' },
  { href: '/contact', label: '문의' },
]

// /gallery/anam-35 에서도 "작품"이 현재 위치다. 해시 링크(/#exhibition)는 현재 위치로 치지 않는다
export function isCurrent(pathname: string, href: string): boolean {
  if (href.includes('#')) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}
