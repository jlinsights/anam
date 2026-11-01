'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ArtworkKeyNavProps {
  previousHref: string | null
  nextHref: string | null
  /** 이웃 작품의 큰 이미지. 미리 받아 두면 이전·다음으로 넘길 때 그림이 늦게 뜨지 않는다 */
  prefetchImages?: string[]
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  )
}

// 작품 상세에서 ← → 키로 이전·다음 작품. 화면에는 아무것도 그리지 않는다
export function ArtworkKeyNav({
  previousHref,
  nextHref,
  prefetchImages = [],
}: ArtworkKeyNavProps) {
  const router = useRouter()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isTyping(event.target)) return
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return
      const href =
        event.key === 'ArrowLeft'
          ? previousHref
          : event.key === 'ArrowRight'
            ? nextHref
            : null
      if (!href) return
      event.preventDefault()
      router.push(href)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [previousHref, nextHref, router])

  const prefetchKey = prefetchImages.join('|')
  useEffect(() => {
    // 데이터 절약 모드면 1800px 이미지 두 장을 미리 받지 않는다
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean }
      }
    ).connection
    if (connection?.saveData) return
    const links = prefetchKey
      .split('|')
      .filter(Boolean)
      .map((href) => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.as = 'image'
        link.href = href
        document.head.appendChild(link)
        return link
      })
    return () => links.forEach((link) => link.remove())
  }, [prefetchKey])

  return null
}
