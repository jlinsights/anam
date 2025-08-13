'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { captureError } from '@/lib/error-logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  apiContext?: string // 어떤 API 관련 컴포넌트인지 구분
}

interface State {
  hasError: boolean
  error?: Error
  errorId?: string
  isRetrying: boolean
}

export class ApiErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 5
  private retryDelays = [1000, 2000, 4000, 8000, 16000] // Exponential backoff

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, isRetrying: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `api_error_${Date.now()}`,
      isRetrying: false
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorContext = {
      component: 'ApiErrorBoundary',
      apiContext: this.props.apiContext || 'unknown',
      errorId: this.state.errorId,
      retryCount: this.retryCount,
      errorBoundary: 'api',
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      networkStatus: typeof window !== 'undefined' && 'navigator' in window 
        ? (navigator as any).onLine 
        : true
    }

    console.error('API Error Boundary caught an error:', {
      error,
      errorInfo,
      context: errorContext
    })

    // Send to error tracking service
    captureError(error, errorContext)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = async () => {
    if (this.retryCount < this.maxRetries && !this.state.isRetrying) {
      this.setState({ isRetrying: true })
      
      const delay = this.retryDelays[this.retryCount] || 16000
      console.log(`API retry attempt ${this.retryCount + 1}/${this.maxRetries} after ${delay}ms delay`)
      
      // Wait for exponential backoff delay
      await new Promise(resolve => setTimeout(resolve, delay))
      
      this.retryCount++
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorId: undefined,
        isRetrying: false 
      })
    }
  }

  handleReset = () => {
    this.retryCount = 0
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorId: undefined,
      isRetrying: false 
    })
    window.location.reload()
  }

  getErrorMessage = () => {
    const { apiContext } = this.props
    const { error } = this.state
    
    // Network-related errors
    if (error?.message.includes('fetch') || error?.message.includes('network')) {
      return {
        title: '네트워크 연결 오류',
        description: '인터넷 연결을 확인하고 다시 시도해 주세요.'
      }
    }
    
    // Timeout errors
    if (error?.message.includes('timeout')) {
      return {
        title: '서버 응답 시간 초과',
        description: '서버가 응답하지 않습니다. 잠시 후 다시 시도해 주세요.'
      }
    }
    
    // API-specific errors
    switch (apiContext) {
      case 'artworks':
        return {
          title: '작품 데이터를 불러올 수 없습니다',
          description: '작품 정보를 가져오는 중 문제가 발생했습니다.'
        }
      case 'artist':
        return {
          title: '작가 정보를 불러올 수 없습니다',
          description: '작가 프로필을 가져오는 중 문제가 발생했습니다.'
        }
      case 'exhibitions':
        return {
          title: '전시 정보를 불러올 수 없습니다',
          description: '전시 데이터를 가져오는 중 문제가 발생했습니다.'
        }
      default:
        return {
          title: '데이터를 불러올 수 없습니다',
          description: 'API 서버와 통신 중 문제가 발생했습니다.'
        }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const canRetry = this.retryCount < this.maxRetries
      const { title, description } = this.getErrorMessage()
      const isOffline = typeof window !== 'undefined' && !navigator.onLine

      return (
        <div className="min-h-[50vh] bg-paper flex items-center justify-center p-zen-lg">
          <motion.div
            className="max-w-lg text-center space-y-zen-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto border-4 border-ink bg-paper-warm flex items-center justify-center">
              <span className="text-3xl">
                {isOffline ? '📡' : '⚠️'}
              </span>
            </div>

            {/* Error Message */}
            <div className="space-y-zen-xs">
              <h1 className="font-calligraphy font-bold text-2xl text-ink">
                {title}
              </h1>
              <p className="font-display text-ink-light leading-relaxed">
                {description}
                <br />
                {isOffline && (
                  <span className="text-red-600 font-medium">
                    현재 오프라인 상태입니다. 인터넷 연결을 확인해 주세요.
                  </span>
                )}
              </p>
            </div>

            {/* Error ID for support */}
            {this.state.errorId && (
              <div className="text-xs text-ink-light bg-paper-warm border border-ink/20 p-zen-xs rounded">
                오류 ID: {this.state.errorId}
              </div>
            )}

            {/* Retry Progress */}
            {this.state.isRetrying && (
              <div className="text-sm text-ink-light">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-ink border-t-transparent rounded-full"></div>
                  <span>다시 시도 중...</span>
                </div>
              </div>
            )}

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-stone-100 p-zen-sm border border-ink/20 text-xs">
                <summary className="cursor-pointer font-bold text-red-600 mb-zen-xs">
                  개발자 정보 (Development Only)
                </summary>
                <pre className="whitespace-pre-wrap text-gray-700 overflow-auto max-h-32">
                  API Context: {this.props.apiContext || 'unknown'}
                  {'\n'}
                  Retry Count: {this.retryCount}/{this.maxRetries}
                  {'\n'}
                  Online Status: {typeof window !== 'undefined' ? navigator.onLine : 'unknown'}
                  {'\n\n'}
                  {this.state.error.name}: {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-zen-sm justify-center">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className="
                    px-zen-lg py-zen-sm
                    bg-ink text-paper font-display font-bold
                    hover:bg-gold hover:text-ink
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300
                    border-2 border-ink
                    focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
                  "
                >
                  {this.state.isRetrying 
                    ? '다시 시도 중...' 
                    : `다시 시도 (${this.maxRetries - this.retryCount}회 남음)`
                  }
                </button>
              )}

              <button
                onClick={this.handleReset}
                disabled={this.state.isRetrying}
                className="
                  px-zen-lg py-zen-sm
                  bg-paper border-2 border-ink text-ink font-display font-bold
                  hover:bg-ink hover:text-paper
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2
                "
              >
                새로고침
              </button>

              <Link
                href="/#gallery"
                className="
                  inline-block text-center px-zen-lg py-zen-sm
                  bg-paper-warm border-2 border-gold text-ink font-display font-bold
                  hover:bg-gold hover:text-ink
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
                "
              >
                홈으로 돌아가기
              </Link>
            </div>

            {/* Network Status Indicator */}
            {isOffline && (
              <div className="bg-red-50 border border-red-200 p-zen-sm rounded text-sm text-red-800">
                오프라인 상태입니다. 네트워크 연결을 확인한 후 다시 시도해 주세요.
              </div>
            )}

            {/* Help Text */}
            <p className="text-sm text-ink-light">
              문제가 계속되면{' '}
              <Link 
                href="/contact" 
                className="text-gold hover:text-ink transition-colors focus:outline-none focus:underline"
              >
                문의하기
              </Link>
              를 통해 알려주세요.
            </p>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// API-specific fallback component for inline errors
export function ApiErrorFallback({ 
  error, 
  resetError,
  apiContext = 'data',
  compact = false
}: { 
  error: Error
  resetError: () => void
  apiContext?: string
  compact?: boolean
}) {
  const getContextMessage = () => {
    switch (apiContext) {
      case 'artworks':
        return '작품 목록을 불러올 수 없습니다'
      case 'artist':
        return '작가 정보를 불러올 수 없습니다'
      case 'exhibitions':
        return '전시 정보를 불러올 수 없습니다'
      default:
        return '데이터를 불러올 수 없습니다'
    }
  }

  if (compact) {
    return (
      <div className="flex items-center justify-center p-zen-md bg-paper-warm border border-ink/20 rounded">
        <div className="text-center space-y-zen-xs">
          <p className="font-display text-ink-light text-sm">
            {getContextMessage()}
          </p>
          <button
            onClick={resetError}
            className="
              px-zen-sm py-zen-xs text-xs
              bg-ink text-paper font-display
              hover:bg-gold hover:text-ink
              transition-all duration-300
              border border-ink
              focus:outline-none focus:ring-1 focus:ring-gold
            "
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[300px] flex items-center justify-center p-zen-md bg-paper-warm border-2 border-ink/20">
      <div className="max-w-md text-center space-y-zen-sm">
        <div className="w-16 h-16 mx-auto border-2 border-ink bg-paper flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        
        <div className="space-y-zen-xs">
          <h3 className="font-display font-bold text-ink text-lg">
            {getContextMessage()}
          </h3>
          <p className="font-display text-ink-light text-sm">
            서버와 통신 중 문제가 발생했습니다.
          </p>
        </div>

        <button
          onClick={resetError}
          className="
            px-zen-md py-zen-sm text-sm
            bg-ink text-paper font-display
            hover:bg-gold hover:text-ink
            transition-all duration-300
            border border-ink
            focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
          "
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}