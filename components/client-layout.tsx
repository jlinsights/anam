'use client'

import { useEffect, useState } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
// Remove unused providers for bundle optimization
// import { AnalyticsProvider } from '@/components/analytics-provider'
import { I18nProvider } from '@/components/i18n-provider'
// import {
//   PerformanceDashboard,
//   PerformanceFloatingButton,
// } from '@/components/performance-dashboard'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import { UIProvider } from '@/lib/store/ui-store'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setMounted(true)
    } catch (err) {
      console.error('ClientLayout mount error:', err)
      setError('레이아웃 초기화 중 오류가 발생했습니다.')
    }
  }, [])

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-background text-foreground flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-500 mb-4'>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-primary text-primary-foreground rounded'
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    )
  }

  // 서버 사이드에서는 기본 레이아웃만 렌더링
  if (!mounted) {
    return (
      <div className='min-h-screen bg-background text-foreground'>
        {children}
      </div>
    )
  }

  // 클라이언트 사이드에서는 완전한 레이아웃 렌더링
  return (
    <ErrorBoundary>
      <UIProvider>
        <ErrorBoundary>
          <I18nProvider>
            <ErrorBoundary>
              <div className='min-h-screen bg-background text-foreground'>
                {children}

                {/* PWA 기능 */}
                <ErrorBoundary>
                  <ServiceWorkerRegistration />
                </ErrorBoundary>
                <ErrorBoundary>
                  <PWAInstallPrompt />
                </ErrorBoundary>

                {/* Performance monitoring removed for bundle optimization */}
              </div>
            </ErrorBoundary>
          </I18nProvider>
        </ErrorBoundary>
      </UIProvider>
    </ErrorBoundary>
  )
}
