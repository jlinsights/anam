'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className='min-h-screen bg-background flex items-center justify-center p-4'>
          <div className='max-w-md w-full text-center space-y-6'>
            <div className='flex justify-center'>
              <AlertTriangle className='h-16 w-16 text-destructive' />
            </div>

            <div className='space-y-2'>
              <h1 className='text-2xl font-display text-ink'>
                오류가 발생했습니다
              </h1>
              <p className='text-ink-light'>
                예상치 못한 문제가 발생했습니다. 페이지를 새로고침하거나 홈으로
                돌아가세요.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className='bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-left'>
                <h3 className='font-semibold text-destructive mb-2'>
                  개발자 정보:
                </h3>
                <pre className='text-xs text-destructive/80 whitespace-pre-wrap'>
                  {this.state.error.message}
                </pre>
              </div>
            )}

            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <Button
                onClick={() => window.location.reload()}
                variant='default'
                className='flex items-center gap-2'
              >
                <RefreshCw className='h-4 w-4' />
                새로고침
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant='outline'
                className='flex items-center gap-2'
              >
                <Home className='h-4 w-4' />
                홈으로 가기
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
