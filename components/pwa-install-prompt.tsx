'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Download, X, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    setIsStandalone(isInStandaloneMode)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      const hasDeclined = localStorage.getItem('pwa-install-declined')
      if (!hasDeclined && !isInStandaloneMode) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice

    if (choiceResult.outcome === 'accepted') {
      console.log('✅ PWA 설치 승인됨')
    } else {
      console.log('❌ PWA 설치 거부됨')
      localStorage.setItem('pwa-install-declined', 'true')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-declined', 'true')
  }

  if (isStandalone || (!deferredPrompt && !isIOS) || !showPrompt) {
    return null
  }

  return (
    <Card className='fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto shadow-2xl border-2 border-ink/20 bg-paper'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {isIOS ? (
              <Smartphone className='h-5 w-5 text-ink/60' />
            ) : (
              <Monitor className='h-5 w-5 text-ink/60' />
            )}
            <CardTitle className='text-lg'>앱 설치</CardTitle>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleDismiss}
            className='h-6 w-6 p-0'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
        <CardDescription>
          {isIOS
            ? '홈 화면에 추가하여 앱처럼 사용하세요'
            : '설치하면 더 빠르고 편리하게 작품을 감상할 수 있습니다'}
        </CardDescription>
      </CardHeader>

      <CardContent className='pt-0'>
        {isIOS ? (
          <div className='space-y-3'>
            <p className='text-sm text-ink/70'>
              Safari에서 공유 버튼 → "홈 화면에 추가"를 선택하세요
            </p>
            <Button
              onClick={handleDismiss}
              variant='outline'
              className='w-full'
            >
              확인
            </Button>
          </div>
        ) : (
          <div className='flex gap-2'>
            <Button onClick={handleInstall} className='flex-1'>
              <Download className='h-4 w-4 mr-2' />
              설치
            </Button>
            <Button onClick={handleDismiss} variant='outline'>
              나중에
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

