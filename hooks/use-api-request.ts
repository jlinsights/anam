'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface UseApiRequestOptions {
  immediate?: boolean
  revalidateOnFocus?: boolean
  retryAttempts?: number
  retryDelay?: number
  timeout?: number
}

export interface UseApiRequestReturn<T> extends ApiState<T> {
  execute: () => Promise<T | null>
  cancel: () => void
  retry: () => Promise<T | null>
  reset: () => void
}

/**
 * Custom hook for API requests with built-in cancellation support
 * Provides automatic cleanup, error handling, and retry functionality
 */
export function useApiRequest<T>(
  requestFn: (signal: AbortSignal) => Promise<T>,
  options: UseApiRequestOptions = {}
): UseApiRequestReturn<T> {
  const {
    immediate = true,
    revalidateOnFocus = false,
    retryAttempts = 2,
    retryDelay = 1000,
    timeout = 10000,
  } = options

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // Execute the request
  const execute = useCallback(async (): Promise<T | null> => {
    // 이 호출의 요청 신호. catch 에서 "아직 내 요청이 최신인가"를 가르는 데 쓴다
    let signal: AbortSignal | undefined
    try {
      // Cancel any existing request
      cleanup()

      // Create new abort controller
      abortControllerRef.current = new AbortController()
      signal = abortControllerRef.current.signal

      // Check if component is still mounted
      if (!mountedRef.current) {
        return null
      }

      setState((prev) => ({ ...prev, loading: true, error: null }))

      // Set up timeout
      const requestSignal = signal
      const timeoutId = setTimeout(() => {
        if (!requestSignal.aborted) {
          abortControllerRef.current?.abort()
        }
      }, timeout)

      try {
        const data = await requestFn(requestSignal)
        clearTimeout(timeoutId)

        // Check if request was cancelled or component unmounted
        if (requestSignal.aborted || !mountedRef.current) {
          return null
        }

        setState({
          data,
          loading: false,
          error: null,
        })

        retryCountRef.current = 0
        return data
      } catch (error) {
        clearTimeout(timeoutId)
        throw error
      }
    } catch (error) {
      // 언마운트됐거나, 새 요청이 이 요청을 대체했으면(cleanup 이 컨트롤러를 바꿈) 상태를 건드리지 않는다.
      // 타임아웃은 컨트롤러를 바꾸지 않으므로 아래 타임아웃 처리로 그대로 간다
      if (
        !mountedRef.current ||
        !signal ||
        abortControllerRef.current?.signal !== signal
      ) {
        return null
      }

      // Handle AbortError (request was cancelled or timed out)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was cancelled or timed out')

        // For timeout, set error and try fallback
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Request timed out, loading fallback data...',
        }))

        return null
      }

      // Handle other errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))

      // Retry logic
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++
        console.log(
          `Retrying request (attempt ${retryCountRef.current}/${retryAttempts})`
        )

        await new Promise((resolve) => setTimeout(resolve, retryDelay))

        if (mountedRef.current) {
          return execute()
        }
      }

      return null
    }
  }, [requestFn, retryAttempts, retryDelay, cleanup])

  // Cancel the request
  const cancel = useCallback(() => {
    cleanup()
    setState((prev) => ({
      ...prev,
      loading: false,
      error: null,
    }))
  }, [cleanup])

  // Retry the request
  const retry = useCallback(async (): Promise<T | null> => {
    retryCountRef.current = 0
    return execute()
  }, [execute])

  // Reset the state
  const reset = useCallback(() => {
    cleanup()
    setState({
      data: null,
      loading: false,
      error: null,
    })
    retryCountRef.current = 0
  }, [cleanup])

  // Handle focus revalidation
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      if (!state.loading && mountedRef.current) {
        execute()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [revalidateOnFocus, state.loading, execute])

  // Execute on mount if immediate is true
  useEffect(() => {
    // 이 효과가 다시 돌 때(의존성 변경·StrictMode) 정리 함수가 false 로 바꿔 둔 값을 되돌린다.
    // 그러지 않으면 다음 요청이 "언마운트됨"으로 보고 loading 을 끝내지 못한다
    mountedRef.current = true
    if (immediate) {
      execute()
    }

    // Cleanup on unmount
    return () => {
      mountedRef.current = false
      cleanup()
    }
  }, [immediate, execute, cleanup])

  return {
    ...state,
    execute,
    cancel,
    retry,
    reset,
  }
}

/**
 * Specialized hook for fetching data from API endpoints
 */
export function useFetch<T>(
  url: string,
  options: RequestInit & UseApiRequestOptions = {}
): UseApiRequestReturn<T> {
  const {
    immediate,
    revalidateOnFocus,
    retryAttempts,
    retryDelay,
    timeout,
    ...fetchOptions
  } = options

  // fetchOptions 는 렌더마다 새 객체라 의존성에 넣으면 요청 함수가 매번 바뀌어
  // 마운트 효과가 다시 돌고 진행 중 요청이 취소된다. 최신 값만 ref 로 읽는다
  const fetchOptionsRef = useRef(fetchOptions)
  fetchOptionsRef.current = fetchOptions

  const requestFn = useCallback(
    async (signal: AbortSignal): Promise<T> => {
      try {
        const response = await fetch(url, {
          ...fetchOptionsRef.current,
          signal,
        })

        if (!response.ok) {
          console.error(
            `API error for ${url}:`,
            response.status,
            response.statusText
          )

          // For artworks API, try to use fallback data from local module
          if (url.includes('/api/artworks')) {
            console.warn('🔄 API failed, attempting to use fallback data')
            try {
              const { fallbackArtworksData } = await import('@/lib/artworks')
              return fallbackArtworksData as unknown as T
            } catch (importError) {
              console.error('Failed to import fallback data:', importError)
              throw new Error(`HTTP error! status: ${response.status}`)
            }
          }

          // For artist API, try to use fallback data
          if (url.includes('/api/artist')) {
            console.warn(
              '🔄 Artist API failed, attempting to use fallback data'
            )
            try {
              const { fallbackArtistData } = await import('@/lib/artworks')
              return fallbackArtistData as unknown as T
            } catch (importError) {
              console.error(
                'Failed to import fallback artist data:',
                importError
              )
              throw new Error(`HTTP error! status: ${response.status}`)
            }
          }

          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json()
          return result.data ?? result
        }

        return response.text() as unknown as T
      } catch (error) {
        // If it's an AbortError, re-throw it
        if ((error as Error).name === 'AbortError') {
          throw error
        }

        // For other errors on artworks endpoint, try fallback
        if (url.includes('/api/artworks')) {
          console.warn('🔄 Request failed, attempting to use fallback data')
          try {
            const { fallbackArtworksData } = await import('@/lib/artworks')
            return fallbackArtworksData as unknown as T
          } catch (importError) {
            console.error('Failed to import fallback data:', importError)
          }
        }

        // For other errors on artist endpoint, try fallback
        if (url.includes('/api/artist')) {
          console.warn(
            '🔄 Artist request failed, attempting to use fallback data'
          )
          try {
            const { fallbackArtistData } = await import('@/lib/artworks')
            return fallbackArtistData as unknown as T
          } catch (importError) {
            console.error('Failed to import fallback artist data:', importError)
          }
        }

        throw error
      }
    },
    [url]
  )

  return useApiRequest(requestFn, {
    immediate,
    revalidateOnFocus,
    retryAttempts,
    retryDelay,
    timeout,
  })
}

/**
 * Hook for multiple API requests with shared cancellation
 */
export function useMultipleApiRequests<T extends Record<string, any>>(
  requests: {
    [K in keyof T]: (signal: AbortSignal) => Promise<T[K]>
  },
  options: UseApiRequestOptions = {}
): UseApiRequestReturn<T> {
  const requestFn = useCallback(
    async (signal: AbortSignal): Promise<T> => {
      const results = await Promise.all(
        Object.entries(requests).map(async ([key, fn]) => {
          const result = await fn(signal)
          return [key, result]
        })
      )

      return Object.fromEntries(results) as T
    },
    [requests]
  )

  return useApiRequest(requestFn, options)
}
