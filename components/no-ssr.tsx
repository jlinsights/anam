'use client'

import { useEffect, useState } from 'react'

interface NoSSRProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * NoSSR 컴포넌트 - 클라이언트에서만 렌더링되는 컴포넌트
 * 브라우저 확장 프로그램이나 동적 콘텐츠로 인한 hydration mismatch를 방지
 */
export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
