'use client'

import { useState, useEffect } from 'react'
import { usePWA, useOfflineStatus, useNetworkInfo } from '@/hooks/use-pwa'
import { cn } from '@/lib/utils'

interface OfflineIndicatorProps {
  className?: string
  showNetworkSpeed?: boolean
  showCacheSize?: boolean
}

export function OfflineIndicator({ 
  className, 
  showNetworkSpeed = false, 
  showCacheSize = false 
}: OfflineIndicatorProps) {
  const { 
    isOffline, 
    networkSpeed, 
    cacheSize, 
    updatePromptVisible,
    applyUpdate,
    dismissUpdate,
    isUpdating
  } = usePWA()
  
  const [showDetails, setShowDetails] = useState(false)
  const [lastOnline, setLastOnline] = useState<Date | null>(null)

  useEffect(() => {
    if (!isOffline) {
      setLastOnline(new Date())
    }
  }, [isOffline])

  // 캐시 크기를 읽기 쉬운 형태로 변환
  const formatCacheSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  // 네트워크 속도 표시
  const getNetworkSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast':
        return '🚀'
      case 'slow':
        return '🐌'
      default:
        return '❓'
    }
  }

  if (!isOffline && !updatePromptVisible && !showNetworkSpeed && !showCacheSize) {
    return null
  }

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50", className)}>
      {/* 오프라인 상태 표시 */}
      {isOffline && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <span>📡</span>
            <span>오프라인 상태</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="ml-2 text-xs underline hover:no-underline"
            >
              {showDetails ? '간단히' : '자세히'}
            </button>
          </div>
          
          {showDetails && (
            <div className="mt-2 text-xs opacity-90">
              <p>캐시된 콘텐츠를 사용 중입니다</p>
              {lastOnline && (
                <p>마지막 연결: {lastOnline.toLocaleTimeString('ko-KR')}</p>
              )}
              <p>인터넷 연결을 확인한 후 페이지를 새로고침하세요</p>
            </div>
          )}
        </div>
      )}

      {/* 업데이트 알림 */}
      {updatePromptVisible && (
        <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center gap-4">
            <span>🔄 새 버전이 사용 가능합니다</span>
            <div className="flex gap-2">
              <button
                onClick={applyUpdate}
                disabled={isUpdating}
                className="px-3 py-1 bg-white text-blue-500 rounded text-xs font-medium hover:bg-gray-100 disabled:opacity-50"
              >
                {isUpdating ? '업데이트 중...' : '업데이트'}
              </button>
              <button
                onClick={dismissUpdate}
                className="px-3 py-1 border border-white rounded text-xs hover:bg-white hover:bg-opacity-20"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 네트워크 및 캐시 정보 (개발용) */}
      {(showNetworkSpeed || showCacheSize) && !isOffline && (
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-1 text-center text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-center gap-4">
            {showNetworkSpeed && (
              <span className="flex items-center gap-1">
                <span>{getNetworkSpeedIcon(networkSpeed)}</span>
                <span>네트워크: {networkSpeed}</span>
              </span>
            )}
            {showCacheSize && (
              <span className="flex items-center gap-1">
                <span>💾</span>
                <span>캐시: {formatCacheSize(cacheSize)}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// PWA 설치 프롬프트 컴포넌트
export function PWAInstallPrompt() {
  const { canInstall, installPWA, isInstalled } = usePWA()
  const [isInstalling, setIsInstalling] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // 이미 설치되었거나 사용자가 무시했으면 표시하지 않음
  if (isInstalled || dismissed || !canInstall) {
    return null
  }

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      const success = await installPWA()
      if (success) {
        setDismissed(true)
      }
    } catch (error) {
      console.error('PWA 설치 실패:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    // 세션 스토리지에 저장하여 페이지 새로고침 시에도 유지
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // 페이지 로드 시 이전 무시 상태 확인
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [])

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <span className="text-2xl">📱</span>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">
            앱으로 설치하기
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            아남 서예 갤러리를 홈 화면에 추가하여 앱처럼 사용하세요
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
            >
              {isInstalling ? '설치 중...' : '설치'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              나중에
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 오프라인 페이지 레이아웃 컴포넌트
export function OfflineLayout({ children }: { children: React.ReactNode }) {
  const { isOffline, networkSpeed, cacheSize } = usePWA()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <OfflineIndicator showNetworkSpeed={process.env.NODE_ENV === 'development'} />
      
      {isOffline && (
        <div className="pt-12"> {/* Offset for offline indicator */}
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-6">
                <span className="text-6xl mb-4 block">🎨</span>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  오프라인 모드
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  인터넷 연결이 없지만 캐시된 작품들을 계속 감상할 수 있습니다
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h2 className="font-medium text-gray-900 dark:text-white mb-3">
                  오프라인에서 가능한 기능
                </h2>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>✅ 이전에 본 작품 감상</li>
                  <li>✅ 작가 정보 보기</li>
                  <li>✅ 즐겨찾기한 작품 보기</li>
                  <li>❌ 새로운 작품 업데이트</li>
                  <li>❌ 문의 폼 전송</li>
                </ul>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded font-medium hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                연결 상태 다시 확인
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className={cn(isOffline && "opacity-75")}>
        {children}
      </div>
      
      <PWAInstallPrompt />
    </div>
  )
}