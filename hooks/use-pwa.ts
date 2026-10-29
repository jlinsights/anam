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
  hasUpdate: boolean
  updateAvailable: boolean
  isUpdating: boolean
  cacheSize: number
  networkSpeed: 'slow' | 'fast' | 'unknown'
}

// 서비스 워커 메시지 타입
interface ServiceWorkerMessage {
  type: 'SW_UPDATED' | 'CACHE_UPDATED' | 'OFFLINE_READY' | 'UPDATE_AVAILABLE'
  version?: string
  payload?: any
}

// PWA 훅
export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
    isLoading: true,
    hasUpdate: false,
    updateAvailable: false,
    isUpdating: false,
    cacheSize: 0,
    networkSpeed: 'unknown',
  })

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)

  const [updatePromptVisible, setUpdatePromptVisible] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    // 서비스 워커 등록 및 고급 관리
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register(
            '/sw.js',
            {
              updateViaCache: 'none', // 항상 최신 SW 확인
            }
          )
          console.log('📦 Service Worker registered:', registration)

          // 즉시 업데이트 확인
          registration.update()

          // 업데이트 감지 및 처리
          registration.addEventListener('updatefound', () => {
            console.log('🔄 Service Worker update found')
            const newWorker = registration.installing

            if (newWorker) {
              setWaitingWorker(newWorker)

              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // 새 버전이 대기 중 - 사용자에게 업데이트 옵션 제공
                    setState((prev) => ({ ...prev, updateAvailable: true }))
                    setUpdatePromptVisible(true)
                  } else {
                    // 첫 설치 완료
                    setState((prev) => ({ ...prev, hasUpdate: false }))
                    console.log(
                      '📦 Service Worker installed for the first time'
                    )
                  }
                }
              })
            }
          })

          // 활성 SW에서 메시지 수신
          navigator.serviceWorker.addEventListener('message', handleSWMessage)

          // 주기적 업데이트 확인 (1시간마다)
          setInterval(
            () => {
              registration.update()
            },
            1000 * 60 * 60
          )
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error)
        }
      }
    }

    registerServiceWorker()

    // 서비스 워커 메시지 처리
    const handleSWMessage = (event: MessageEvent<ServiceWorkerMessage>) => {
      const { type, version, payload } = event.data

      switch (type) {
        case 'SW_UPDATED':
          console.log('📱 App updated to version:', version)
          setState((prev) => ({ ...prev, hasUpdate: true, isUpdating: false }))
          break
        case 'CACHE_UPDATED':
          console.log('💾 Cache updated')
          updateCacheSize()
          break
        case 'OFFLINE_READY':
          console.log('📱 App ready for offline use')
          break
        case 'UPDATE_AVAILABLE':
          setState((prev) => ({ ...prev, updateAvailable: true }))
          setUpdatePromptVisible(true)
          break
      }
    }

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

      // 설치 완료 후 푸시 알림 권한 요청
      requestNotificationPermission()
    }

    // 온라인/오프라인 상태 감지 및 네트워크 속도 측정
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOffline: false }))
      measureNetworkSpeed()
    }

    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        isOffline: true,
        networkSpeed: 'unknown',
      }))
    }

    // 네트워크 연결 변경 감지
    const handleConnectionChange = () => {
      measureNetworkSpeed()
    }

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 네트워크 연결 상태 변경 감지
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    // 초기 상태 설정
    const initializeState = async () => {
      const cacheSize = await getCacheSize()

      setState((prev) => ({
        ...prev,
        isOffline: !navigator.onLine,
        isInstalled: checkIfInstalled(),
        isLoading: false,
        cacheSize,
      }))

      // 초기 네트워크 속도 측정
      measureNetworkSpeed()
    }

    initializeState()

    // 클린업
    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }

      navigator.serviceWorker?.removeEventListener('message', handleSWMessage)
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

  // 네트워크 속도 측정
  const measureNetworkSpeed = async () => {
    try {
      const connection = (navigator as any).connection
      if (connection) {
        const effectiveType = connection.effectiveType
        const networkSpeed =
          effectiveType === '4g'
            ? 'fast'
            : effectiveType === '3g'
              ? 'slow'
              : 'unknown'
        setState((prev) => ({ ...prev, networkSpeed }))
      }
    } catch (error) {
      console.warn('Network speed measurement failed:', error)
    }
  }

  // 캐시 크기 업데이트
  const updateCacheSize = async () => {
    const size = await getCacheSize()
    setState((prev) => ({ ...prev, cacheSize: size }))
  }

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        console.log('📱 Notification permission:', permission)
        return permission === 'granted'
      } catch (error) {
        console.warn('Failed to request notification permission:', error)
        return false
      }
    }
    return Notification.permission === 'granted'
  }

  // 앱 업데이트 적용
  const applyUpdate = async (): Promise<boolean> => {
    if (!waitingWorker) return false

    try {
      setState((prev) => ({ ...prev, isUpdating: true }))
      setUpdatePromptVisible(false)

      // 대기 중인 서비스 워커에게 메시지 전송
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })

      // 새로운 SW가 활성화될 때까지 대기
      return new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setState((prev) => ({
            ...prev,
            isUpdating: false,
            updateAvailable: false,
            hasUpdate: true,
          }))
          setWaitingWorker(null)
          resolve(true)
          // 페이지 새로고침으로 새 버전 적용
          window.location.reload()
        })
      })
    } catch (error) {
      console.error('Failed to apply update:', error)
      setState((prev) => ({ ...prev, isUpdating: false }))
      return false
    }
  }

  // 업데이트 무시
  const dismissUpdate = () => {
    setUpdatePromptVisible(false)
    setState((prev) => ({ ...prev, updateAvailable: false }))
  }

  // 캐시 크기 계산 (향상된 버전)
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

  // 스마트 캐시 정리
  const clearCache = async (selective: boolean = false): Promise<boolean> => {
    try {
      if (selective) {
        // 선택적 캐시 정리 (오래된 것만)
        const cacheNames = await caches.keys()
        const oldCaches = cacheNames.filter(
          (name) =>
            !name.includes('v2.0.0') && // 현재 버전 제외
            (name.includes('images') || name.includes('runtime'))
        )

        await Promise.all(
          oldCaches.map((cacheName) => caches.delete(cacheName))
        )
        console.log('🗑️ Old caches cleared:', oldCaches)
      } else {
        // 전체 캐시 정리
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        )
        console.log('🗑️ All caches cleared')
      }

      await updateCacheSize()
      return true
    } catch (error) {
      console.error('❌ Failed to clear cache:', error)
      return false
    }
  }

  // 오프라인 콘텐츠 사전 캐싱
  const precacheContent = async (urls: string[]): Promise<void> => {
    try {
      const cache = await caches.open('manual-cache-v1')
      await cache.addAll(urls)
      console.log('📦 Content precached:', urls)
      await updateCacheSize()
    } catch (error) {
      console.error('Failed to precache content:', error)
    }
  }

  return {
    ...state,
    installPWA,
    getCacheSize,
    clearCache,
    applyUpdate,
    dismissUpdate,
    requestNotificationPermission,
    precacheContent,
    updateCacheSize,
    canInstall: state.isInstallable && !state.isInstalled,
    updatePromptVisible,
    networkSpeed: state.networkSpeed,
    cacheSize: state.cacheSize,
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
