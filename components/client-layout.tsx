'use client'

import { useEffect, useState } from 'react'
import { RootErrorBoundary, useGlobalErrorHandler } from '@/components/error-boundary/RootErrorBoundary'
import { I18nProvider } from '@/components/i18n-provider'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import { UIProvider } from '@/lib/store/ui-store'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set up global error handlers
  useGlobalErrorHandler()

  useEffect(() => {
    try {
      setMounted(true)
    } catch (err) {
      console.error('ClientLayout mount error:', err)
      setError('레이아웃 초기화 중 오류가 발생했습니다.')
    }
  }, [])

  // Error state with improved styling
  if (error) {
    return (
      <div className='min-h-screen bg-paper text-ink flex items-center justify-center p-zen-lg'>
        <div className='text-center space-y-zen-sm'>
          <div className="w-16 h-16 mx-auto border-2 border-ink bg-paper-warm flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="font-calligraphy font-bold text-2xl text-ink">
            초기화 오류
          </h1>
          <p className='text-ink-light mb-zen-sm font-display'>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className='
              px-zen-md py-zen-sm
              bg-ink text-paper font-display font-bold
              hover:bg-gold hover:text-ink
              transition-all duration-300
              border-2 border-ink
              focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
            '
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
      <div className='min-h-screen bg-paper text-ink'>
        {children}
      </div>
    )
  }

  // 클라이언트 사이드에서는 완전한 레이아웃 렌더링
  return (
    <RootErrorBoundary>
      <UIProvider>
        <RootErrorBoundary>
          <I18nProvider>
            <RootErrorBoundary>
              <div className='min-h-screen bg-paper text-ink'>
                {children}

                {/* PWA 기능 - Each wrapped in their own error boundary */}
                <RootErrorBoundary>
                  <ServiceWorkerRegistration />
                </RootErrorBoundary>
                <RootErrorBoundary>
                  <PWAInstallPrompt />
                </RootErrorBoundary>
              </div>
            </RootErrorBoundary>
          </I18nProvider>
        </RootErrorBoundary>
      </UIProvider>
    </RootErrorBoundary>
  )
}
