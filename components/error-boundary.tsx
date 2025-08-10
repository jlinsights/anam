'use client'

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
    console.error('Error stack:', error.stack)
    console.error('Component stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className='min-h-screen bg-paper flex items-center justify-center p-4'>
          <div className='max-w-md w-full text-center space-y-6'>
            <div className='flex justify-center'>
              <div className='w-16 h-16 text-red-500 flex items-center justify-center text-4xl'>⚠️</div>
            </div>

            <div className='space-y-2'>
              <h1 className='text-2xl font-bold text-ink'>
                오류가 발생했습니다
              </h1>
              <p className='text-stone'>
                예상치 못한 문제가 발생했습니다. 페이지를 새로고침하거나 홈으로
                돌아가세요.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-left'>
                <h3 className='font-semibold text-red-700 mb-2'>
                  개발자 정보:
                </h3>
                <pre className='text-xs text-red-600 whitespace-pre-wrap'>
                  {this.state.error.message}
                </pre>
                {this.state.error.stack && (
                  <pre className='text-xs text-red-500 whitespace-pre-wrap mt-2'>
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <button
                onClick={() => window.location.reload()}
                className='px-4 py-2 bg-ink text-paper rounded-lg hover:bg-stone transition-colors flex items-center justify-center gap-2'
              >
                <span>🔄</span>
                새로고침
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className='px-4 py-2 border border-ink text-ink rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2'
              >
                <span>🏠</span>
                홈으로 가기
              </button>
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
