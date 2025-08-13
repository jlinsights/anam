'use client'

import { RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ApiErrorRecoveryProps {
  error: string | null
  onRetry: () => void
  loading?: boolean
  className?: string
  showNetworkStatus?: boolean
}

export function ApiErrorRecovery({ 
  error, 
  onRetry, 
  loading = false, 
  className = '',
  showNetworkStatus = true
}: ApiErrorRecoveryProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    onRetry()
  }

  if (!error) return null

  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            데이터를 불러올 수 없습니다
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            {error}
          </p>
          
          {showNetworkStatus && (
            <div className="flex items-center gap-2 mb-3">
              {isOnline ? (
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <Wifi className="w-3 h-3" />
                  온라인
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <WifiOff className="w-3 h-3" />
                  오프라인
                </div>
              )}
              {retryCount > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  재시도 {retryCount}회
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleRetry}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              다시 시도
            </button>
            
            {!isOnline && (
              <p className="text-xs text-red-600 dark:text-red-400 px-3 py-1.5">
                인터넷 연결을 확인해주세요
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}