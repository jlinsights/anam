'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { captureError } from '@/lib/error-logger'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  imageContext?: 'artwork' | 'gallery' | 'thumbnail' | 'featured'
  artworkTitle?: string
  className?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorId?: string
  isRetrying: boolean
  retryAttempts: number
}

export class ImageErrorBoundary extends Component<Props, State> {
  private maxRetries = 3
  private retryDelays = [500, 1000, 2000] // Progressive delays for image retries

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      isRetrying: false,
      retryAttempts: 0,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `image_error_${Date.now()}`,
      isRetrying: false,
      retryAttempts: 0,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorContext = {
      component: 'ImageErrorBoundary',
      imageContext: this.props.imageContext || 'unknown',
      artworkTitle: this.props.artworkTitle,
      errorId: this.state.errorId,
      retryAttempts: this.state.retryAttempts,
      errorBoundary: 'image',
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    }

    console.error('Image Error Boundary caught an error:', {
      error,
      errorInfo,
      context: errorContext,
    })

    // Send to error tracking service
    captureError(error, errorContext)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = async () => {
    if (this.state.retryAttempts < this.maxRetries && !this.state.isRetrying) {
      this.setState({ isRetrying: true })

      const delay = this.retryDelays[this.state.retryAttempts] || 2000
      console.log(
        `Image retry attempt ${this.state.retryAttempts + 1}/${this.maxRetries} after ${delay}ms delay`
      )

      // Wait for delay
      await new Promise((resolve) => setTimeout(resolve, delay))

      this.setState((prevState) => ({
        hasError: false,
        error: undefined,
        errorId: undefined,
        isRetrying: false,
        retryAttempts: prevState.retryAttempts + 1,
      }))
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorId: undefined,
      isRetrying: false,
      retryAttempts: 0,
    })
  }

  getImageIcon = () => {
    const { imageContext } = this.props
    switch (imageContext) {
      case 'artwork':
        return '🎨'
      case 'gallery':
        return '🖼️'
      case 'thumbnail':
        return '📷'
      case 'featured':
        return '⭐'
      default:
        return '🖼️'
    }
  }

  getErrorMessage = () => {
    const { imageContext, artworkTitle } = this.props

    switch (imageContext) {
      case 'artwork':
        return {
          title: '작품 이미지를 불러올 수 없습니다',
          description: artworkTitle
            ? `"${artworkTitle}" 작품의 이미지를 로드하지 못했습니다.`
            : '작품 이미지를 로드하지 못했습니다.',
        }
      case 'gallery':
        return {
          title: '갤러리 이미지를 불러올 수 없습니다',
          description: '갤러리 이미지를 로드하지 못했습니다.',
        }
      case 'thumbnail':
        return {
          title: '섬네일을 불러올 수 없습니다',
          description: '섬네일 이미지를 로드하지 못했습니다.',
        }
      case 'featured':
        return {
          title: '특집 이미지를 불러올 수 없습니다',
          description: '특집 이미지를 로드하지 못했습니다.',
        }
      default:
        return {
          title: '이미지를 불러올 수 없습니다',
          description: '이미지를 로드하지 못했습니다.',
        }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const canRetry = this.state.retryAttempts < this.maxRetries
      const { title, description } = this.getErrorMessage()
      const icon = this.getImageIcon()

      return (
        <div
          className={cn(
            'min-h-[300px] bg-paper-warm flex items-center justify-center p-zen-md border-2 border-ink/20',
            this.props.className
          )}
        >
          <motion.div
            className='max-w-sm text-center space-y-zen-sm'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Error Icon */}
            <div className='w-16 h-16 mx-auto border-2 border-ink bg-paper flex items-center justify-center'>
              <span className='text-2xl'>{icon}</span>
            </div>

            {/* Error Message */}
            <div className='space-y-zen-xs'>
              <h3 className='font-display font-bold text-ink text-lg'>
                {title}
              </h3>
              <p className='font-display text-ink-light text-sm leading-relaxed'>
                {description}
              </p>
            </div>

            {/* Error ID for support */}
            {this.state.errorId && process.env.NODE_ENV === 'development' && (
              <div className='text-xs text-ink-light bg-paper border border-ink/20 p-zen-xs rounded'>
                오류 ID: {this.state.errorId}
              </div>
            )}

            {/* Retry Progress */}
            {this.state.isRetrying && (
              <div className='text-sm text-ink-light'>
                <div className='flex items-center justify-center space-x-2'>
                  <div className='animate-spin w-4 h-4 border-2 border-ink border-t-transparent rounded-full'></div>
                  <span>이미지 다시 로드 중...</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex flex-col gap-zen-xs'>
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className='
                    px-zen-md py-zen-sm text-sm
                    bg-ink text-paper font-display
                    hover:bg-gold hover:text-ink
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300
                    border border-ink
                    focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
                  '
                >
                  {this.state.isRetrying
                    ? '다시 로드 중...'
                    : `다시 시도 (${this.maxRetries - this.state.retryAttempts}회 남음)`}
                </button>
              )}

              {!canRetry && (
                <button
                  onClick={this.handleReset}
                  className='
                    px-zen-md py-zen-sm text-sm
                    bg-paper border border-ink text-ink font-display
                    hover:bg-ink hover:text-paper
                    transition-all duration-300
                    focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2
                  '
                >
                  리셋
                </button>
              )}
            </div>

            {/* Alternative action for artwork images */}
            {this.props.imageContext === 'artwork' &&
              this.props.artworkTitle && (
                <p className='text-xs text-ink-light'>
                  작품 정보는 여전히 사용할 수 있습니다.
                </p>
              )}
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// Compact image error fallback for small components
export function ImageErrorFallback({
  error,
  resetError,
  imageContext = 'image',
  compact = false,
  className,
}: {
  error: Error
  resetError: () => void
  imageContext?: string
  compact?: boolean
  className?: string
}) {
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-paper-warm border border-ink/20 aspect-square',
          className
        )}
      >
        <div className='text-center'>
          <span className='text-2xl mb-2 block'>📷</span>
          <button
            onClick={resetError}
            className='
              px-2 py-1 text-xs
              bg-ink text-paper font-display
              hover:bg-gold hover:text-ink
              transition-all duration-300
              border border-ink
              focus:outline-none focus:ring-1 focus:ring-gold
            '
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'min-h-[200px] flex items-center justify-center bg-paper-warm border border-ink/20',
        className
      )}
    >
      <div className='text-center space-y-zen-xs'>
        <div className='w-12 h-12 mx-auto border border-ink bg-paper flex items-center justify-center'>
          <span className='text-xl'>📷</span>
        </div>

        <div className='space-y-1'>
          <h4 className='font-display font-bold text-ink text-sm'>
            이미지 로드 오류
          </h4>
          <p className='font-display text-ink-light text-xs'>
            이미지를 로드할 수 없습니다.
          </p>
        </div>

        <button
          onClick={resetError}
          className='
            px-zen-sm py-zen-xs text-xs
            bg-ink text-paper font-display
            hover:bg-gold hover:text-ink
            transition-all duration-300
            border border-ink
            focus:outline-none focus:ring-1 focus:ring-gold
          '
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
