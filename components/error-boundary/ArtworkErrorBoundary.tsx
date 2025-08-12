'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ArtworkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Artwork Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-8">
          <motion.div
            className="max-w-md text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto border-4 border-ink bg-paper-warm flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="font-calligraphy font-bold text-2xl text-ink">
                작품을 불러올 수 없습니다
              </h1>
              <p className="font-display text-ink-light">
                요청하신 작품 페이지에 문제가 발생했습니다.
                <br />
                잠시 후 다시 시도해 주세요.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-stone-100 p-4 rounded border text-xs">
                <summary className="cursor-pointer font-bold text-red-600 mb-2">
                  개발자 정보 (Development Only)
                </summary>
                <pre className="whitespace-pre-wrap text-gray-700">
                  {this.state.error.name}: {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined })
                  window.location.reload()
                }}
                className="
                  px-6 py-3
                  bg-ink text-paper font-display font-bold
                  hover:bg-gold hover:text-ink
                  transition-all duration-300
                  border-2 border-ink
                "
              >
                새로고침
              </button>

              <Link
                href="/gallery"
                className="
                  inline-block text-center px-6 py-3
                  bg-paper border-2 border-ink text-ink font-display font-bold
                  hover:bg-ink hover:text-paper
                  transition-all duration-300
                "
              >
                갤러리로 돌아가기
              </Link>
            </div>

            {/* Help Text */}
            <p className="text-sm text-ink-light">
              문제가 계속되면{' '}
              <Link href="/contact" className="text-gold hover:text-ink transition-colors">
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

// Simple function component wrapper for convenience
export function ArtworkErrorFallback({ 
  error, 
  resetError 
}: { 
  error: Error
  resetError: () => void 
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <div className="w-12 h-12 mx-auto border-2 border-ink bg-paper-warm flex items-center justify-center">
          <span className="text-xl">📷</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-display font-bold text-ink">
            이미지를 불러올 수 없습니다
          </h3>
          <p className="font-display text-ink-light text-sm">
            작품 이미지 로딩 중 문제가 발생했습니다.
          </p>
        </div>

        <button
          onClick={resetError}
          className="
            px-4 py-2 text-sm
            bg-ink text-paper font-display
            hover:bg-gold hover:text-ink
            transition-all duration-300
            border border-ink
          "
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}