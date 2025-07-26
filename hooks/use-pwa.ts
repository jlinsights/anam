'use client'

import { useState, useEffect } from 'react'

// PWA 설치 이벤트 타입
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// PWA 상태 타입
interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOffline: boolean
  isLoading: boolean
}

// PWA 훅
export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
    isLoading: true,
  })

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // 서비스 워커 등록
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('📦 Service Worker registered:', registration)

          // 업데이트 확인
          registration.addEventListener('updatefound', () => {
            console.log('🔄 Service Worker update found')
            const newWorker = registration.installing

            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // 새 버전 설치됨 - 사용자에게 알림
                  if (
                    confirm(
                      '새 버전이 설치되었습니다. 페이지를 새로고침하시겠습니까?'
                    )
                  ) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error)
        }
      }
    }

    registerServiceWorker()

    // PWA 설치 가능 이벤트 리스너
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setState((prev) => ({ ...prev, isInstallable: true }))
    }

    // 앱 설치 완료 이벤트
    const handleAppInstalled = () => {
      console.log('🎉 PWA installed successfully')
      setState((prev) => ({ ...prev, isInstalled: true, isInstallable: false }))
      setDeferredPrompt(null)
    }

    // 온라인/오프라인 상태 감지
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOffline: false }))
    }

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOffline: true }))
    }

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 초기 상태 설정
    setState((prev) => ({
      ...prev,
      isOffline: !navigator.onLine,
      isInstalled: checkIfInstalled(),
      isLoading: false,
    }))

    // 클린업
    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // PWA 설치 함수
  const installPWA = async (): Promise<boolean> => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        console.log('✅ PWA installation accepted')
        setState((prev) => ({ ...prev, isInstallable: false }))
        setDeferredPrompt(null)
        return true
      } else {
        console.log('❌ PWA installation dismissed')
        return false
      }
    } catch (error) {
      console.error('❌ PWA installation failed:', error)
      return false
    }
  }

  // PWA 설치 상태 확인
  const checkIfInstalled = (): boolean => {
    // 디스플레이 모드 확인
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    // 또는 navigator.standalone (Safari)
    const isSafariStandalone =
      'standalone' in window.navigator && (window.navigator as any).standalone

    return isStandalone || isSafariStandalone
  }

  // 캐시 크기 계산
  const getCacheSize = async (): Promise<number> => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        return estimate.usage || 0
      } catch (error) {
        console.error('❌ Failed to get cache size:', error)
        return 0
      }
    }
    return 0
  }

  // 캐시 정리
  const clearCache = async (): Promise<boolean> => {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      console.log('🗑️ Cache cleared successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to clear cache:', error)
      return false
    }
  }

  return {
    ...state,
    installPWA,
    getCacheSize,
    clearCache,
    canInstall: state.isInstallable && !state.isInstalled,
  }
}

// 오프라인 감지 훅
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    setIsOffline(!navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOffline
}

// 네트워크 정보 훅
export function useNetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState({
    isOnline: true,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
  })

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection

      setNetworkInfo({
        isOnline: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false,
      })
    }

    updateNetworkInfo()

    window.addEventListener('online', updateNetworkInfo)
    window.addEventListener('offline', updateNetworkInfo)

    // 연결 변경 이벤트 (지원하는 브라우저만)
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo)
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo)
      window.removeEventListener('offline', updateNetworkInfo)
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  return networkInfo
}
