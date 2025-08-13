'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '@/hooks/use-pwa'
import { cn } from '@/lib/utils'

interface PWASettingsProps {
  className?: string
}

export function PWASettings({ className }: PWASettingsProps) {
  const {
    isInstalled,
    cacheSize,
    clearCache,
    getCacheSize,
    requestNotificationPermission,
    precacheContent,
    updateCacheSize,
    networkSpeed
  } = usePWA()

  const [isOpen, setIsOpen] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [cachingEnabled, setCachingEnabled] = useState(true)
  const [backgroundSync, setBackgroundSync] = useState(true)
  const [isClearing, setIsClearing] = useState(false)
  const [storageQuota, setStorageQuota] = useState<{
    quota: number
    usage: number
    percentage: number
  } | null>(null)

  useEffect(() => {
    // 알림 권한 상태 확인
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    // 로컬 스토리지에서 설정 불러오기
    const savedCachingEnabled = localStorage.getItem('pwa-caching-enabled')
    const savedBackgroundSync = localStorage.getItem('pwa-background-sync')
    
    if (savedCachingEnabled !== null) {
      setCachingEnabled(JSON.parse(savedCachingEnabled))
    }
    if (savedBackgroundSync !== null) {
      setBackgroundSync(JSON.parse(savedBackgroundSync))
    }

    // 스토리지 할당량 확인
    checkStorageQuota()
  }, [])

  const checkStorageQuota = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        const quota = estimate.quota || 0
        const usage = estimate.usage || 0
        const percentage = quota > 0 ? (usage / quota) * 100 : 0

        setStorageQuota({ quota, usage, percentage })
      } catch (error) {
        console.error('Failed to get storage quota:', error)
      }
    }
  }

  const handleNotificationToggle = async () => {
    if (notificationPermission === 'granted') {
      // 알림이 이미 허용된 경우 - 비활성화는 브라우저 설정에서 해야 함
      alert('알림을 비활성화하려면 브라우저 설정에서 변경해주세요.')
    } else {
      const granted = await requestNotificationPermission()
      if (granted) {
        setNotificationPermission('granted')
      }
    }
  }

  const handleCachingToggle = (enabled: boolean) => {
    setCachingEnabled(enabled)
    localStorage.setItem('pwa-caching-enabled', JSON.stringify(enabled))
    
    if (!enabled) {
      // 캐싱 비활성화 시 기존 캐시 정리
      handleClearCache(false)
    }
  }

  const handleBackgroundSyncToggle = (enabled: boolean) => {
    setBackgroundSync(enabled)
    localStorage.setItem('pwa-background-sync', JSON.stringify(enabled))
  }

  const handleClearCache = async (selective: boolean = true) => {
    setIsClearing(true)
    try {
      await clearCache(selective)
      await updateCacheSize()
      await checkStorageQuota()
    } catch (error) {
      console.error('Failed to clear cache:', error)
    } finally {
      setIsClearing(false)
    }
  }

  const handlePrecacheGallery = async () => {
    try {
      // 갤러리 페이지들을 사전 캐싱
      const urls = [
        '/gallery',
        '/artist',
        '/api/artworks',
        '/api/artist'
      ]
      
      await precacheContent(urls)
      await updateCacheSize()
      await checkStorageQuota()
      
      alert('갤러리 콘텐츠가 오프라인용으로 저장되었습니다!')
    } catch (error) {
      console.error('Failed to precache gallery:', error)
      alert('캐싱 중 오류가 발생했습니다.')
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const getNetworkSpeedText = (speed: string) => {
    switch (speed) {
      case 'fast':
        return '빠름 (4G)'
      case 'slow':
        return '느림 (3G)'
      default:
        return '알 수 없음'
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors z-40",
          className
        )}
        title="PWA 설정"
      >
        ⚙️
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              PWA 설정
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* 앱 상태 */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                앱 상태
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">설치 상태:</span>
                  <span className={cn(
                    "font-medium",
                    isInstalled ? "text-green-600" : "text-gray-500"
                  )}>
                    {isInstalled ? '설치됨' : '브라우저'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">네트워크:</span>
                  <span className="font-medium">
                    {getNetworkSpeedText(networkSpeed)}
                  </span>
                </div>
              </div>
            </div>

            {/* 알림 설정 */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                알림
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    새로운 전시회 및 작품 알림
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    상태: {notificationPermission === 'granted' ? '허용됨' : 
                           notificationPermission === 'denied' ? '차단됨' : '미설정'}
                  </p>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  disabled={notificationPermission === 'denied'}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-medium",
                    notificationPermission === 'granted'
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600",
                    notificationPermission === 'denied' && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {notificationPermission === 'granted' ? '활성화됨' : '허용하기'}
                </button>
              </div>
            </div>

            {/* 캐싱 설정 */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                오프라인 캐싱
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      오프라인 콘텐츠 저장
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      인터넷 없이도 갤러리 이용 가능
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cachingEnabled}
                      onChange={(e) => handleCachingToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      백그라운드 동기화
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      오프라인 시 폼 데이터 자동 전송
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={backgroundSync}
                      onChange={(e) => handleBackgroundSyncToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* 스토리지 정보 */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                저장소 사용량
              </h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 dark:text-gray-400">앱 캐시:</span>
                    <span className="font-medium">{formatBytes(cacheSize)}</span>
                  </div>
                  {storageQuota && (
                    <>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600 dark:text-gray-400">전체 사용량:</span>
                        <span className="font-medium">{formatBytes(storageQuota.usage)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(storageQuota.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                        <span>{storageQuota.percentage.toFixed(1)}% 사용됨</span>
                        <span>할당량: {formatBytes(storageQuota.quota)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrecacheGallery}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                  >
                    갤러리 다운로드
                  </button>
                  <button
                    onClick={() => handleClearCache(true)}
                    disabled={isClearing}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    {isClearing ? '정리 중...' : '일부 정리'}
                  </button>
                  <button
                    onClick={() => handleClearCache(false)}
                    disabled={isClearing}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 disabled:opacity-50"
                  >
                    전체 정리
                  </button>
                </div>
              </div>
            </div>

            {/* 도움말 */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                도움말
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>• <strong>갤러리 다운로드:</strong> 오프라인에서도 작품 감상 가능</p>
                <p>• <strong>일부 정리:</strong> 오래된 캐시만 삭제</p>
                <p>• <strong>전체 정리:</strong> 모든 캐시 데이터 삭제</p>
                <p>• <strong>백그라운드 동기화:</strong> 오프라인 시 폼 데이터를 큐에 저장 후 온라인 시 자동 전송</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}