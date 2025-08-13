'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { captureError } from '@/lib/error-logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorId?: string
  errorType?: 'javascript' | 'chunk' | 'network' | 'unknown'
}

export class RootErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 2

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Analyze error type
    let errorType: State['errorType'] = 'unknown'
    
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      errorType = 'chunk'
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      errorType = 'network'
    } else if (error.name === 'SyntaxError' || error.name === 'ReferenceError') {
      errorType = 'javascript'
    }

    return {
      hasError: true,
      error,
      errorId: `root_error_${Date.now()}`,
      errorType
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorContext = {
      component: 'RootErrorBoundary',
      errorId: this.state.errorId,
      errorType: this.state.errorType,
      retryCount: this.retryCount,
      errorBoundary: 'root',
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      referrer: typeof window !== 'undefined' ? document.referrer : 'unknown'
    }

    console.error('Root Error Boundary caught a critical error:', {
      error,
      errorInfo,
      context: errorContext
    })

    // Send to error tracking service
    captureError(error, errorContext)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // For chunk loading errors, try to reload the page automatically
    if (this.state.errorType === 'chunk' && this.retryCount === 0) {
      console.log('Chunk loading error detected, attempting automatic reload...')
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    }
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({ hasError: false, error: undefined, errorId: undefined })
      console.log(`Root error retry attempt ${this.retryCount}/${this.maxRetries}`)
    } else {
      // Force reload as last resort
      window.location.reload()
    }
  }

  handleReload = () => {
    // Clear any cached data that might be causing issues
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName)
        })
      })
    }
    
    // Clear local storage if it might be corrupted
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (e) {
      console.warn('Could not clear storage:', e)
    }
    
    window.location.reload()
  }

  getErrorMessage = () => {
    const { errorType, error } = this.state
    
    switch (errorType) {
      case 'chunk':
        return {
          title: '앱 업데이트가 필요합니다',
          description: '새로운 버전의 앱이 배포되었습니다. 페이지를 새로고침하여 업데이트해 주세요.',
          autoReload: true
        }
      case 'network':
        return {
          title: '네트워크 연결 오류',
          description: '인터넷 연결을 확인하고 다시 시도해 주세요.',
          autoReload: false
        }
      case 'javascript':
        return {
          title: '앱 실행 오류',
          description: '앱에 실행 오류가 발생했습니다. 페이지를 새로고침해 주세요.',
          autoReload: false
        }
      default:
        return {
          title: '예기치 못한 오류가 발생했습니다',
          description: '앱에 문제가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.',
          autoReload: false
        }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { title, description, autoReload } = this.getErrorMessage()
      const canRetry = this.retryCount < this.maxRetries

      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-zen-lg">
          <motion.div
            className="max-w-2xl text-center space-y-zen-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Error Icon */}
            <div className="w-24 h-24 mx-auto border-4 border-ink bg-paper-warm flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>

            {/* Error Message */}
            <div className="space-y-zen-sm">
              <h1 className="font-calligraphy font-bold text-4xl text-ink">
                {title}
              </h1>
              <p className="font-display text-ink-light text-lg leading-relaxed">
                {description}
              </p>
            </div>

            {/* Auto-reload notification */}
            {autoReload && this.retryCount === 0 && (
              <div className="bg-gold/20 border border-gold p-zen-sm rounded text-sm text-ink">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-ink border-t-transparent rounded-full"></div>
                  <span>3초 후 자동으로 새로고침됩니다...</span>
                </div>
              </div>
            )}

            {/* Error ID for support */}
            {this.state.errorId && (
              <div className="text-sm text-ink-light bg-paper-warm border border-ink/20 p-zen-sm rounded">
                오류 ID: {this.state.errorId}
                <br />
                오류 유형: {this.state.errorType}
              </div>
            )}

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-stone-100 p-zen-sm border border-ink/20 text-sm">
                <summary className="cursor-pointer font-bold text-red-600 mb-zen-sm">
                  개발자 정보 (Development Only)
                </summary>
                <pre className="whitespace-pre-wrap text-gray-700 overflow-auto max-h-48">
                  Error Type: {this.state.errorType}
                  {'\n'}
                  Retry Count: {this.retryCount}/{this.maxRetries}
                  {'\n'}
                  URL: {typeof window !== 'undefined' ? window.location.href : 'unknown'}
                  {'\n\n'}
                  {this.state.error.name}: {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-zen-md justify-center">
              {canRetry && !autoReload && (
                <button
                  onClick={this.handleRetry}
                  className="
                    px-zen-xl py-zen-md
                    bg-ink text-paper font-display font-bold text-lg
                    hover:bg-gold hover:text-ink
                    transition-all duration-300
                    border-2 border-ink
                    focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
                  "
                >
                  다시 시도 ({this.maxRetries - this.retryCount}회 남음)
                </button>
              )}

              <button
                onClick={this.handleReload}
                className="
                  px-zen-xl py-zen-md
                  bg-paper border-2 border-ink text-ink font-display font-bold text-lg
                  hover:bg-ink hover:text-paper
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2
                "
              >
                새로고침
              </button>

              <Link
                href="/"
                className="
                  inline-block text-center px-zen-xl py-zen-md
                  bg-paper-warm border-2 border-gold text-ink font-display font-bold text-lg
                  hover:bg-gold hover:text-ink
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
                "
              >
                홈으로 돌아가기
              </Link>
            </div>

            {/* Browser Compatibility Notice */}
            {this.state.errorType === 'javascript' && (
              <div className="bg-paper-warm border border-ink/20 p-zen-sm rounded text-sm text-ink-light">
                오래된 브라우저를 사용 중이시라면 최신 버전으로 업데이트해 주세요.
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
              <br />
              오류 ID와 함께 문의해 주시면 빠른 해결이 가능합니다.
            </p>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for handling unhandled promise rejections
export function useGlobalErrorHandler() {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      captureError(new Error(`Unhandled Promise Rejection: ${event.reason}`), {
        type: 'unhandledrejection',
        reason: event.reason,
        timestamp: new Date().toISOString()
      })
    })

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global JavaScript error:', event.error)
      captureError(event.error || new Error(event.message), {
        type: 'global-error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString()
      })
    })
  }
}