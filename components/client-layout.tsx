'use client'

import { useEffect, useState } from 'react'
import { RootErrorBoundary, useGlobalErrorHandler } from '@/components/error-boundary/RootErrorBoundary'
import { ErrorBoundary } from '@/components/error-boundary'
import { I18nProvider } from '@/components/i18n-provider'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import { UIProvider } from '@/lib/store/ui-store'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false)

  // Set up global error handlers
  useGlobalErrorHandler()

  useEffect(() => {
    setMounted(true)
    // 에러 처리는 ErrorBoundary가 담당하므로 try-catch 불필요
  }, [])

  // 서버 사이드에서는 기본 레이아웃만 렌더링
  if (!mounted) {
    return (
      <div className='min-h-screen bg-paper text-ink'>
        {children}
      </div>
    )
  }

  // 클라이언트 사이드에서는 완전한 레이아웃 렌더링
  // ✅ 개선: RootErrorBoundary는 최상위에 하나만 사용
  // ✅ 개선: PWA 기능은 독립적인 ErrorBoundary로 처리 (fallback=null로 조용히 실패)
  return (
    <RootErrorBoundary>
      <UIProvider>
        <I18nProvider>
          <div className='min-h-screen bg-paper text-ink'>
            {children}

            {/* PWA 기능 - 독립적인 ErrorBoundary로 감싸기 (fallback=null로 조용히 실패) */}
            <ErrorBoundary fallback={null}>
              <ServiceWorkerRegistration />
            </ErrorBoundary>
            <ErrorBoundary fallback={null}>
              <PWAInstallPrompt />
            </ErrorBoundary>
          </div>
        </I18nProvider>
      </UIProvider>
    </RootErrorBoundary>
  )
}
