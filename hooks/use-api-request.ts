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
    retryDelay = 1000
  } = options

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
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
    try {
      // Cancel any existing request
      cleanup()

      // Create new abort controller
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      // Check if component is still mounted
      if (!mountedRef.current) {
        return null
      }

      setState(prev => ({ ...prev, loading: true, error: null }))

      const data = await requestFn(signal)

      // Check if request was cancelled or component unmounted
      if (signal.aborted || !mountedRef.current) {
        return null
      }

      setState({
        data,
        loading: false,
        error: null
      })

      retryCountRef.current = 0
      return data

    } catch (error) {
      // Check if component is still mounted
      if (!mountedRef.current) {
        return null
      }

      // Handle AbortError (request was cancelled)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was cancelled')
        return null
      }

      // Handle other errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))

      // Retry logic
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++
        console.log(`Retrying request (attempt ${retryCountRef.current}/${retryAttempts})`)
        
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        
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
    setState(prev => ({
      ...prev,
      loading: false,
      error: null
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
      error: null
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
    reset
  }
}

/**
 * Specialized hook for fetching data from API endpoints
 */
export function useFetch<T>(
  url: string,
  options: RequestInit & UseApiRequestOptions = {}
): UseApiRequestReturn<T> {
  const { immediate, revalidateOnFocus, retryAttempts, retryDelay, ...fetchOptions } = options

  const requestFn = useCallback(async (signal: AbortSignal): Promise<T> => {
    const response = await fetch(url, {
      ...fetchOptions,
      signal
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json()
      return result.data ?? result
    }

    return response.text() as unknown as T
  }, [url, fetchOptions])

  return useApiRequest(requestFn, {
    immediate,
    revalidateOnFocus,
    retryAttempts,
    retryDelay
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
  const requestFn = useCallback(async (signal: AbortSignal): Promise<T> => {
    const results = await Promise.all(
      Object.entries(requests).map(async ([key, fn]) => {
        const result = await fn(signal)
        return [key, result]
      })
    )

    return Object.fromEntries(results) as T
  }, [requests])

  return useApiRequest(requestFn, options)
}