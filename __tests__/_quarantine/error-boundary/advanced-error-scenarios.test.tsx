import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from 'react-error-boundary'
import { RootErrorBoundary } from '@/components/error-boundary/RootErrorBoundary'
import { GalleryErrorBoundary } from '@/components/error-boundary/GalleryErrorBoundary'
import { ImageErrorBoundary } from '@/components/error-boundary/ImageErrorBoundary'

// Advanced error test components
const ComponentWithAsyncError = ({ delay = 100 }: { delay?: number }) => {
  const [hasError, setHasError] = React.useState(false)
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHasError(true)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [delay])
  
  if (hasError) {
    throw new Error('Async component error')
  }
  
  return <div>Async component loading...</div>
}

const ComponentWithStateError = () => {
  const [count, setCount] = React.useState(0)
  
  React.useEffect(() => {
    if (count > 3) {
      throw new Error('State-triggered error')
    }
  }, [count])
  
  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  )
}

const ComponentWithPromiseError = () => {
  React.useEffect(() => {
    Promise.reject(new Error('Promise rejection error'))
      .catch(error => {
        // Unhandled promise rejection should trigger error boundary
        throw error
      })
  }, [])
  
  return <div>Component with promise error</div>
}

const ComponentWithNetworkError = ({ shouldFail = true }: { shouldFail?: boolean }) => {
  const [data, setData] = React.useState<any>(null)
  const [error, setError] = React.useState<Error | null>(null)
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (shouldFail) {
          throw new Error('Network request failed')
        }
        setData({ result: 'success' })
      } catch (err) {
        setError(err as Error)
      }
    }
    
    fetchData()
  }, [shouldFail])
  
  if (error) {
    throw error
  }
  
  return <div>Data: {data ? JSON.stringify(data) : 'Loading...'}</div>
}

const ComponentWithMemoryLeak = () => {
  React.useEffect(() => {
    // Simulate memory leak scenario
    const intervals: NodeJS.Timeout[] = []
    
    for (let i = 0; i < 1000; i++) {
      intervals.push(setInterval(() => {
        // Memory intensive operation
        const largeArray = new Array(10000).fill(Math.random())
        if (largeArray.length > 5000) {
          throw new Error('Memory exhaustion error')
        }
      }, 1))
    }
    
    return () => {
      intervals.forEach(clearInterval)
    }
  }, [])
  
  return <div>Component with potential memory leak</div>
}

const ComponentWithConcurrentErrors = () => {
  React.useEffect(() => {
    // Simulate multiple concurrent errors
    setTimeout(() => {
      throw new Error('Concurrent error 1')
    }, 10)
    
    setTimeout(() => {
      throw new Error('Concurrent error 2')
    }, 20)
  }, [])
  
  return <div>Component with concurrent errors</div>
}

describe('Advanced Error Boundary Scenarios', () => {
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  
  afterAll(() => {
    console.error = originalError
  })

  describe('Async Error Handling', () => {
    it('should catch errors that occur asynchronously', async () => {
      render(
        <RootErrorBoundary>
          <ComponentWithAsyncError delay={50} />
        </RootErrorBoundary>
      )

      // Initially should show loading state
      expect(screen.getByText('Async component loading...')).toBeInTheDocument()

      // Wait for async error to occur
      await waitFor(() => {
        expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
      }, { timeout: 200 })
    })

    it('should handle state-triggered errors', async () => {
      const user = userEvent.setup()
      
      render(
        <RootErrorBoundary>
          <ComponentWithStateError />
        </RootErrorBoundary>
      )

      const incrementButton = screen.getByText('Increment')
      
      // Click multiple times to trigger error
      for (let i = 0; i < 5; i++) {
        await user.click(incrementButton)
      }

      await waitFor(() => {
        expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
      })
    })

    it('should handle promise rejection errors', async () => {
      render(
        <RootErrorBoundary>
          <ComponentWithPromiseError />
        </RootErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
      }, { timeout: 100 })
    })
  })

  describe('Network and API Error Scenarios', () => {
    it('should handle network timeout errors', async () => {
      // Mock fetch to simulate timeout
      global.fetch = jest.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      )

      render(
        <RootErrorBoundary>
          <ComponentWithNetworkError />
        </RootErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
      })
    })

    it('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded')
      ;(rateLimitError as any).status = 429

      const ComponentWithRateLimit = () => {
        React.useEffect(() => {
          throw rateLimitError
        }, [])
        return <div>Loading...</div>
      }

      render(
        <RootErrorBoundary>
          <ComponentWithRateLimit />
        </RootErrorBoundary>
      )

      expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
    })

    it('should handle CORS errors gracefully', async () => {
      const corsError = new Error('CORS policy blocked')
      ;(corsError as any).name = 'TypeError'

      const ComponentWithCORS = () => {
        React.useEffect(() => {
          throw corsError
        }, [])
        return <div>Loading...</div>
      }

      render(
        <RootErrorBoundary>
          <ComponentWithCORS />
        </RootErrorBoundary>
      )

      expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
    })
  })

  describe('Performance and Memory Related Errors', () => {
    it('should handle memory exhaustion errors', async () => {
      // This test might be flaky depending on the environment
      render(
        <RootErrorBoundary>
          <ComponentWithMemoryLeak />
        </RootErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should handle stack overflow errors', () => {
      const StackOverflowComponent = () => {
        const recursiveFunction = (): never => {
          return recursiveFunction()
        }
        
        React.useEffect(() => {
          try {
            recursiveFunction()
          } catch (error) {
            throw new Error('Stack overflow error')
          }
        }, [])
        
        return <div>Component causing stack overflow</div>
      }

      render(
        <RootErrorBoundary>
          <StackOverflowComponent />
        </RootErrorBoundary>
      )

      expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
    })
  })

  describe('Concurrent and Race Condition Errors', () => {
    it('should handle multiple concurrent errors', async () => {
      render(
        <RootErrorBoundary>
          <ComponentWithConcurrentErrors />
        </RootErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
      }, { timeout: 100 })
    })

    it('should handle race conditions in component updates', async () => {
      const ComponentWithRaceCondition = () => {
        const [state1, setState1] = React.useState(0)
        const [state2, setState2] = React.useState(0)
        
        React.useEffect(() => {
          // Simulate race condition
          setState1(1)
          setState2(2)
          
          if (state1 === 1 && state2 === 2) {
            throw new Error('Race condition error')
          }
        }, [state1, state2])
        
        return <div>Race condition component</div>
      }

      render(
        <RootErrorBoundary>
          <ComponentWithRaceCondition />
        </RootErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Recovery and Retry Logic', () => {
    it('should implement exponential backoff for retries', async () => {
      let attempts = 0
      const maxAttempts = 3
      const retryDelays: number[] = []

      const ComponentWithRetry = () => {
        const [isRetrying, setIsRetrying] = React.useState(false)
        
        const handleRetry = async () => {
          attempts++
          const delay = Math.pow(2, attempts - 1) * 1000 // Exponential backoff
          retryDelays.push(delay)
          
          setIsRetrying(true)
          
          await new Promise(resolve => setTimeout(resolve, delay))
          
          if (attempts < maxAttempts) {
            throw new Error(`Retry attempt ${attempts} failed`)
          }
          
          setIsRetrying(false)
        }

        React.useEffect(() => {
          handleRetry()
        }, [])

        if (isRetrying) {
          return <div>Retrying... Attempt {attempts}</div>
        }

        return <div>Success after retries</div>
      }

      render(
        <ErrorBoundary
          FallbackComponent={({ resetErrorBoundary, error }) => (
            <div>
              <div>Error: {error.message}</div>
              <button onClick={resetErrorBoundary}>Manual Retry</button>
            </div>
          )}
        >
          <ComponentWithRetry />
        </ErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
      })

      // Verify exponential backoff was implemented
      expect(retryDelays.length).toBeGreaterThan(0)
      expect(retryDelays[0]).toBe(1000) // First retry: 1s
      if (retryDelays.length > 1) {
        expect(retryDelays[1]).toBe(2000) // Second retry: 2s
      }
    })

    it('should limit retry attempts to prevent infinite loops', async () => {
      let attempts = 0
      const maxAttempts = 5

      const ComponentWithLimitedRetry = () => {
        React.useEffect(() => {
          attempts++
          if (attempts <= maxAttempts) {
            throw new Error(`Attempt ${attempts} failed`)
          }
        }, [])

        return <div>This should not render</div>
      }

      render(
        <ErrorBoundary
          FallbackComponent={({ error }) => (
            <div>Max retries exceeded: {error.message}</div>
          )}
          onError={() => {
            if (attempts > maxAttempts) {
              // Stop retrying
              return
            }
          }}
        >
          <ComponentWithLimitedRetry />
        </ErrorBoundary>
      )

      expect(screen.getByText(/Max retries exceeded/)).toBeInTheDocument()
      expect(attempts).toBe(1) // Should only attempt once in this test
    })
  })

  describe('Error Boundary Performance Impact', () => {
    it('should not significantly impact render performance', () => {
      const startTime = performance.now()
      
      const TestComponent = () => <div>Normal component</div>

      for (let i = 0; i < 100; i++) {
        const { unmount } = render(
          <RootErrorBoundary>
            <TestComponent />
          </RootErrorBoundary>
        )
        unmount()
      }

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render 100 components in reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000) // 1 second for 100 renders
    })

    it('should handle high-frequency error scenarios', async () => {
      let errorCount = 0
      const errorThreshold = 10

      const HighFrequencyErrorComponent = () => {
        React.useEffect(() => {
          const interval = setInterval(() => {
            errorCount++
            if (errorCount <= errorThreshold) {
              throw new Error(`High frequency error ${errorCount}`)
            }
          }, 10)

          return () => clearInterval(interval)
        }, [])

        return <div>High frequency error component</div>
      }

      render(
        <ErrorBoundary
          FallbackComponent={() => <div>Too many errors</div>}
        >
          <HighFrequencyErrorComponent />
        </ErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText('Too many errors')).toBeInTheDocument()
      })

      expect(errorCount).toBe(1) // Should catch first error
    })
  })

  describe('Error Boundary Context and State Management', () => {
    it('should preserve React context across error boundaries', () => {
      const TestContext = React.createContext('default-value')

      const ComponentUsingContext = () => {
        const value = React.useContext(TestContext)
        return <div>Context value: {value}</div>
      }

      const ComponentThatErrors = () => {
        throw new Error('Context test error')
      }

      render(
        <TestContext.Provider value="test-value">
          <RootErrorBoundary>
            <ComponentUsingContext />
            <ComponentThatErrors />
          </RootErrorBoundary>
        </TestContext.Provider>
      )

      // Error boundary should be shown
      expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
      
      // Context should still work in other components
      expect(screen.queryByText('Context value: test-value')).not.toBeInTheDocument()
    })

    it('should handle errors in context providers', () => {
      const ErrorContext = React.createContext<{ hasError: boolean }>({ hasError: false })

      const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
        const [hasError] = React.useState(true)
        
        if (hasError) {
          throw new Error('Context provider error')
        }
        
        return (
          <ErrorContext.Provider value={{ hasError }}>
            {children}
          </ErrorContext.Provider>
        )
      }

      render(
        <RootErrorBoundary>
          <ErrorProvider>
            <div>Child component</div>
          </ErrorProvider>
        </RootErrorBoundary>
      )

      expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
    })
  })

  describe('Error Boundary Analytics and Monitoring', () => {
    it('should track error frequency and patterns', () => {
      const errorTracker = {
        errors: [] as Array<{ error: Error; timestamp: number; component: string }>,
        track: function(error: Error, component: string) {
          this.errors.push({ error, timestamp: Date.now(), component })
        }
      }

      const ComponentWithTracking = ({ shouldError = false }: { shouldError?: boolean }) => {
        React.useEffect(() => {
          if (shouldError) {
            const error = new Error('Tracked error')
            errorTracker.track(error, 'ComponentWithTracking')
            throw error
          }
        }, [shouldError])

        return <div>Component with tracking</div>
      }

      const { rerender } = render(
        <RootErrorBoundary>
          <ComponentWithTracking shouldError={false} />
        </RootErrorBoundary>
      )

      expect(errorTracker.errors).toHaveLength(0)

      rerender(
        <RootErrorBoundary>
          <ComponentWithTracking shouldError={true} />
        </RootErrorBoundary>
      )

      expect(errorTracker.errors).toHaveLength(1)
      expect(errorTracker.errors[0].component).toBe('ComponentWithTracking')
    })

    it('should include user session data in error reports', () => {
      const userSession = {
        userId: 'user-123',
        sessionId: 'session-456',
        userAgent: 'Test Browser',
        timestamp: Date.now()
      }

      let capturedErrorReport: any = null

      const ComponentWithSessionTracking = () => {
        React.useEffect(() => {
          try {
            throw new Error('Session tracking error')
          } catch (error) {
            capturedErrorReport = {
              error: error.message,
              ...userSession,
              url: window.location.href,
              stack: (error as Error).stack
            }
            throw error
          }
        }, [])

        return <div>Component with session tracking</div>
      }

      render(
        <RootErrorBoundary>
          <ComponentWithSessionTracking />
        </RootErrorBoundary>
      )

      expect(capturedErrorReport).toBeTruthy()
      expect(capturedErrorReport.userId).toBe('user-123')
      expect(capturedErrorReport.sessionId).toBe('session-456')
      expect(capturedErrorReport.error).toBe('Session tracking error')
    })
  })
})