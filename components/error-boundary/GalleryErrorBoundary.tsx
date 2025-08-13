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
}

export class GalleryErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `gallery_error_${Date.now()}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with context
    const errorContext = {
      component: 'GalleryErrorBoundary',
      errorId: this.state.errorId,
      retryCount: this.retryCount,
      errorBoundary: 'gallery',
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    }

    console.error('Gallery Error Boundary caught an error:', {
      error,
      errorInfo,
      context: errorContext
    })

    // Send to error tracking service
    captureError(error, errorContext)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({ hasError: false, error: undefined, errorId: undefined })
      console.log(`Gallery error retry attempt ${this.retryCount}/${this.maxRetries}`)
    } else {
      console.warn('Max retry attempts reached for gallery error')
    }
  }

  handleReset = () => {
    this.retryCount = 0
    this.setState({ hasError: false, error: undefined, errorId: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const canRetry = this.retryCount < this.maxRetries

      return (
        <div className="min-h-[60vh] bg-paper flex items-center justify-center p-zen-lg">
          <motion.div
            className="max-w-lg text-center space-y-zen-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto border-4 border-ink bg-paper-warm flex items-center justify-center">
              <span className="text-3xl">🖼️</span>
            </div>

            {/* Error Message */}
            <div className="space-y-zen-xs">
              <h1 className="font-calligraphy font-bold text-3xl text-ink">
                갤러리를 불러올 수 없습니다
              </h1>
              <p className="font-display text-ink-light leading-relaxed">
                갤러리 페이지에 문제가 발생했습니다.
                <br />
                {canRetry ? '다시 시도하거나' : '페이지를 새로고침하거나'} 잠시 후 다시 방문해 주세요.
              </p>
            </div>

            {/* Error ID for support */}
            {this.state.errorId && (
              <div className="text-xs text-ink-light bg-paper-warm border border-ink/20 p-zen-xs rounded">
                오류 ID: {this.state.errorId}
              </div>
            )}

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-stone-100 p-zen-sm border border-ink/20 text-xs">
                <summary className="cursor-pointer font-bold text-red-600 mb-zen-xs">
                  개발자 정보 (Development Only)
                </summary>
                <pre className="whitespace-pre-wrap text-gray-700 overflow-auto max-h-32">
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
                  className="
                    px-zen-lg py-zen-sm
                    bg-ink text-paper font-display font-bold
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
                onClick={this.handleReset}
                className="
                  px-zen-lg py-zen-sm
                  bg-paper border-2 border-ink text-ink font-display font-bold
                  hover:bg-ink hover:text-paper
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

// Gallery-specific fallback component for smaller errors
export function GalleryErrorFallback({ 
  error, 
  resetError,
  context = 'gallery'
}: { 
  error: Error
  resetError: () => void
  context?: string
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-zen-md bg-paper-warm border-2 border-ink/20">
      <div className="max-w-md text-center space-y-zen-sm">
        <div className="w-16 h-16 mx-auto border-2 border-ink bg-paper flex items-center justify-center">
          <span className="text-2xl">📷</span>
        </div>
        
        <div className="space-y-zen-xs">
          <h3 className="font-display font-bold text-ink text-lg">
            {context === 'image' ? '이미지를 불러올 수 없습니다' : '갤러리를 불러올 수 없습니다'}
          </h3>
          <p className="font-display text-ink-light text-sm">
            {context === 'image' 
              ? '작품 이미지 로딩 중 문제가 발생했습니다.' 
              : '갤러리 데이터 로딩 중 문제가 발생했습니다.'}
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