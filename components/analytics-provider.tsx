'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  initGA,
  trackPageView,
  trackWebVitals,
  trackSession,
  trackError,
} from '@/lib/analytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Google Analytics 초기화
    initGA()

    // Web Vitals 추적 시작
    trackWebVitals()

    // 세션 추적 시작
    trackSession()

    // 전역 에러 핸들러 설정
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(`Unhandled Promise Rejection: ${event.reason}`))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  useEffect(() => {
    // 페이지 변경 시 추적
    trackPageView(pathname)
  }, [pathname])

  return <>{children}</>
}

// HOC 버전 (선택사항)
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AnalyticsWrappedComponent(props: P) {
    return (
      <AnalyticsProvider>
        <Component {...props} />
      </AnalyticsProvider>
    )
  }
}
