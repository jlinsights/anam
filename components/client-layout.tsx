'use client'

import { useEffect, useState } from 'react'
import { AnalyticsProvider } from '@/components/analytics-provider'
import { I18nProvider } from '@/components/i18n-provider'
import {
  PerformanceDashboard,
  PerformanceFloatingButton,
} from '@/components/performance-dashboard'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import { UIProvider } from '@/lib/store/ui-store'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [showPerformanceDashboard, setShowPerformanceDashboard] =
    useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    <UIProvider>
      <I18nProvider>
        <AnalyticsProvider>
          <div className='min-h-screen bg-background text-foreground'>
            {children}

            {/* PWA 기능 */}
            <ServiceWorkerRegistration />
            <PWAInstallPrompt />

            {/* 성능 모니터링 플로팅 버튼 (개발 환경에서만 표시) */}
            <PerformanceFloatingButton
              onClick={() => setShowPerformanceDashboard(true)}
            />

            {/* 성능 모니터링 대시보드 */}
            <PerformanceDashboard
              isVisible={showPerformanceDashboard}
              onClose={() => setShowPerformanceDashboard(false)}
            />
          </div>
        </AnalyticsProvider>
      </I18nProvider>
    </UIProvider>
  )
}
