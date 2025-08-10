'use client'

import { useEffect, useState } from 'react'
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
  // Performance monitoring removed for optimization

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
        <div className='min-h-screen bg-background text-foreground'>
          {children}

          {/* PWA 기능 */}
          <ServiceWorkerRegistration />
          <PWAInstallPrompt />

          {/* Performance monitoring removed for bundle optimization */}
        </div>
      </I18nProvider>
    </UIProvider>
  )
}
