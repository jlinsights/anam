'use client'

/**
 * 🔒 Global Error Boundary with SuperClaude Pattern Integration
 * Enhanced error handling with cultural context and performance tracking
 */

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Mail, Bug } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorId: string
  errorInfo: ErrorInfo | null
  retryCount: number
  isReporting: boolean
  culturalContext?: string
}

interface GlobalErrorBoundaryProps {
  children: ReactNode
  culturalContext?: 'spring' | 'summer' | 'autumn' | 'winter' | 'eternal'
  enableReporting?: boolean
  maxRetries?: number
  fallbackComponent?: ReactNode
  className?: string
}

interface ErrorReport {
  errorId: string
  message: string
  stack?: string
  componentStack?: string
  userAgent: string
  url: string
  timestamp: string
  culturalContext?: string
  performanceMetrics?: {
    memory: number
    timing: PerformanceTiming
  }
}

export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: GlobalErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
      errorInfo: null,
      retryCount: 0,
      isReporting: false,
      culturalContext: props.culturalContext || 'eternal'
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 🎯 SuperClaude Pattern: Handle specific error types
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      // Automatically reload for chunk loading errors
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
      return {
        hasError: true,
        error,
        errorId,
        retryCount: 0
      }
    }

    return {
      hasError: true,
      error,
      errorId,
      retryCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // 🔒 Enhanced Error Logging with Context
    this.logErrorWithContext(error, errorInfo)

    // 📊 Track Error for Performance Monitoring
    this.trackErrorMetrics(error, errorInfo)

    // 📧 Report Error if Enabled
    if (this.props.enableReporting) {
      this.reportError(error, errorInfo)
    }
  }

  private logErrorWithContext(error: Error, errorInfo: ErrorInfo) {
    const context = {
      errorId: this.state.errorId,
      culturalContext: this.state.culturalContext,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack,
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null
    }

    console.group('🚨 Global Error Boundary')
    console.error('Error Details:', context)
    console.error('Original Error:', error)
    console.error('Error Info:', errorInfo)
    console.groupEnd()

    // Store in localStorage for persistence
    try {
      const errorHistory = JSON.parse(localStorage.getItem('anam-error-history') || '[]')
      errorHistory.push(context)
      // Keep only last 10 errors
      if (errorHistory.length > 10) {
        errorHistory.shift()
      }
      localStorage.setItem('anam-error-history', JSON.stringify(errorHistory))
    } catch (e) {
      console.warn('Failed to store error history:', e)
    }
  }

  private trackErrorMetrics(error: Error, errorInfo: ErrorInfo) {
    // 📊 Integration with Performance Monitoring
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          cultural_context: this.state.culturalContext,
          component_stack: errorInfo.componentStack
        }
      })
    }

    // 🎯 SuperClaude Pattern: Performance Impact Assessment
    const performanceEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (performanceEntry) {
      const errorMetrics = {
        errorId: this.state.errorId,
        loadTime: performanceEntry.loadEventEnd - performanceEntry.fetchStart,
        domContentLoaded: performanceEntry.domContentLoadedEventEnd - performanceEntry.fetchStart,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      }
      
      console.info('📊 Error Performance Context:', errorMetrics)
    }
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    if (this.state.isReporting) return

    this.setState({ isReporting: true })

    try {
      const report: ErrorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        culturalContext: this.state.culturalContext,
        performanceMetrics: {
          memory: (performance as any).memory?.usedJSHeapSize || 0,
          timing: performance.timing
        }
      }

      // Send to error reporting service (implement as needed)
      await this.sendErrorReport(report)
      
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    } finally {
      this.setState({ isReporting: false })
    }
  }

  private async sendErrorReport(report: ErrorReport) {
    // 🎯 SuperClaude Pattern: Secure Error Reporting
    const response = await fetch('/api/error-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report)
    })

    if (!response.ok) {
      throw new Error(`Error reporting failed: ${response.status}`)
    }
  }

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))

      // Clear any existing timeout
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout)
      }

      // Set timeout to reset retry count after successful render
      this.retryTimeout = setTimeout(() => {
        this.setState({ retryCount: 0 })
      }, 30000) // Reset after 30 seconds
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReportBug = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message || 'Unknown error',
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    const subject = encodeURIComponent(`Bug Report: ${errorDetails.message}`)
    const body = encodeURIComponent(`
Error ID: ${errorDetails.errorId}
URL: ${errorDetails.url}
Browser: ${errorDetails.userAgent}
Time: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
[Your description here]
    `)

    window.open(`mailto:support@anam-gallery.com?subject=${subject}&body=${body}`)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // 🎨 Cultural Context Styling
      const culturalStyles = {
        spring: 'from-spring-primary/5 to-spring-secondary/5',
        summer: 'from-summer-primary/5 to-summer-secondary/5', 
        autumn: 'from-autumn-primary/5 to-autumn-secondary/5',
        winter: 'from-winter-primary/5 to-winter-secondary/5',
        eternal: 'from-ink/5 to-gold/5'
      }

      const currentStyle = culturalStyles[this.state.culturalContext as keyof typeof culturalStyles] || culturalStyles.eternal

      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent
      }

      return (
        <div className={cn(
          'min-h-screen flex items-center justify-center p-4',
          `bg-gradient-to-br ${currentStyle}`,
          this.props.className
        )}>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white rounded-xl shadow-zen-depth max-w-lg w-full p-8 text-center"
            >
              {/* Error Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3, ease: 'backOut' }}
                className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-100"
              >
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </motion.div>

              {/* Error Title */}
              <h1 className="font-display text-2xl text-ink mb-3">
                문제가 발생했습니다
              </h1>
              
              <p className="text-ink-light mb-6 leading-relaxed">
                예상치 못한 오류가 발생했습니다. 불편을 드려 죄송합니다.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-ink-light mb-2">
                    개발자 정보
                  </summary>
                  <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-600 overflow-auto max-h-32">
                    <div><strong>Error:</strong> {this.state.error.message}</div>
                    <div><strong>ID:</strong> {this.state.errorId}</div>
                    {this.state.error.stack && (
                      <div><strong>Stack:</strong> {this.state.error.stack.split('\n')[0]}</div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Retry Button */}
                {this.state.retryCount < (this.props.maxRetries || 3) && (
                  <motion.button
                    onClick={this.handleRetry}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-ink text-paper rounded-lg font-medium transition-all duration-200 hover:bg-ink-dark hover:shadow-zen-depth"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={this.state.isReporting}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>다시 시도하기</span>
                  </motion.button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {/* Home Button */}
                  <motion.button
                    onClick={this.handleGoHome}
                    className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-ink text-ink rounded-lg font-medium transition-all duration-200 hover:bg-ink hover:text-paper"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Home className="w-4 h-4" />
                    <span>홈으로</span>
                  </motion.button>

                  {/* Report Bug Button */}
                  <motion.button
                    onClick={this.handleReportBug}
                    className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gold text-gold rounded-lg font-medium transition-all duration-200 hover:bg-gold hover:text-paper"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Bug className="w-4 h-4" />
                    <span>신고</span>
                  </motion.button>
                </div>

                {/* Reload Button */}
                <motion.button
                  onClick={this.handleReload}
                  className="w-full px-6 py-2 text-sm text-ink-light hover:text-ink transition-colors underline"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  페이지 새로고침
                </motion.button>
              </div>

              {/* Retry Count Indicator */}
              {this.state.retryCount > 0 && (
                <p className="mt-4 text-xs text-ink-light">
                  재시도 횟수: {this.state.retryCount}/{this.props.maxRetries || 3}
                </p>
              )}

              {/* Reporting Status */}
              {this.state.isReporting && (
                <p className="mt-4 text-xs text-gold">
                  오류 보고 중...
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )
    }

    return this.props.children
  }
}

export default GlobalErrorBoundary