/**
 * Enhanced Caching Strategy
 * 다층 캐싱 시스템: 메모리 → localStorage → 네트워크
 */

import { CACHE_STRATEGIES } from './performance-config'

type CacheEntry<T> = {
  data: T
  timestamp: number
  expiresAt: number
  version?: string
}

type CacheOptions = {
  ttl?: number // Time to live in milliseconds
  version?: string // Cache version for invalidation
  persist?: boolean // Persist to localStorage
}

class EnhancedCache {
  private memoryCache = new Map<string, CacheEntry<any>>()
  private readonly prefix = 'anam_cache_'
  private readonly version = '1.0.0'

  /**
   * 캐시에 데이터 저장
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = CACHE_STRATEGIES.memory.artworks,
      version = this.version,
      persist = false,
    } = options

    const now = Date.now()
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      version,
    }

    // 메모리 캐시에 저장
    this.memoryCache.set(key, entry)

    // localStorage에 저장 (persist 옵션이 활성화된 경우)
    if (persist && typeof window !== 'undefined') {
      try {
        const storageKey = `${this.prefix}${key}`
        localStorage.setItem(storageKey, JSON.stringify(entry))
      } catch (error) {
        // localStorage 용량 초과 등의 경우 무시
        console.warn('Failed to persist cache to localStorage:', error)
      }
    }
  }

  /**
   * 캐시에서 데이터 조회
   */
  get<T>(key: string): T | null {
    // 먼저 메모리 캐시 확인
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.data as T
    }

    // 메모리 캐시에 없거나 만료된 경우 localStorage 확인
    if (typeof window !== 'undefined') {
      try {
        const storageKey = `${this.prefix}${key}`
        const stored = localStorage.getItem(storageKey)

        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored)

          if (this.isValid(entry)) {
            // 메모리 캐시에도 복원
            this.memoryCache.set(key, entry)
            return entry.data
          } else {
            // 만료된 항목 제거
            localStorage.removeItem(storageKey)
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error)
      }
    }

    return null
  }

  /**
   * 캐시 항목 유효성 검사
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    const now = Date.now()

    // 만료 시간 확인
    if (now > entry.expiresAt) {
      return false
    }

    // 버전 확인 (캐시 무효화)
    if (entry.version && entry.version !== this.version) {
      return false
    }

    return true
  }

  /**
   * 캐시 항목 삭제
   */
  delete(key: string): void {
    this.memoryCache.delete(key)

    if (typeof window !== 'undefined') {
      try {
        const storageKey = `${this.prefix}${key}`
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn('Failed to delete from localStorage:', error)
      }
    }
  }

  /**
   * 특정 패턴의 캐시 항목 삭제
   */
  deletePattern(pattern: string): void {
    // 메모리 캐시에서 삭제
    const keysToDelete: string[] = []
    this.memoryCache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach((key) => this.memoryCache.delete(key))

    // localStorage에서 삭제
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith(this.prefix) && key.includes(pattern)) {
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.warn('Failed to delete pattern from localStorage:', error)
      }
    }
  }

  /**
   * 모든 캐시 클리어
   */
  clear(): void {
    this.memoryCache.clear()

    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith(this.prefix)) {
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
    }
  }

  /**
   * 만료된 캐시 항목 정리
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    // 메모리 캐시 정리
    this.memoryCache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach((key) => this.memoryCache.delete(key))

    // localStorage 정리
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith(this.prefix)) {
            try {
              const stored = localStorage.getItem(key)
              if (stored) {
                const entry: CacheEntry<any> = JSON.parse(stored)
                if (now > entry.expiresAt) {
                  localStorage.removeItem(key)
                }
              }
            } catch {
              // 파싱 에러가 있는 항목 제거
              localStorage.removeItem(key)
            }
          }
        })
      } catch (error) {
        console.warn('Failed to cleanup localStorage:', error)
      }
    }
  }

  /**
   * 캐시 통계
   */
  getStats() {
    const memorySize = this.memoryCache.size
    let localStorageSize = 0

    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        localStorageSize = keys.filter((key) =>
          key.startsWith(this.prefix)
        ).length
      } catch {
        // 무시
      }
    }

    return {
      memory: {
        entries: memorySize,
      },
      localStorage: {
        entries: localStorageSize,
      },
      total: memorySize + localStorageSize,
    }
  }
}

// 전역 캐시 인스턴스
export const enhancedCache = new EnhancedCache()

// 정기적인 캐시 정리 (5분마다)
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      enhancedCache.cleanup()
    },
    5 * 60 * 1000
  )
}

/**
 * 캐시된 비동기 함수 래퍼
 * Stale-While-Revalidate 패턴 구현
 */
export async function withStaleWhileRevalidate<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // 먼저 캐시에서 조회
  const cached = enhancedCache.get<T>(key)

  if (cached) {
    // 백그라운드에서 최신 데이터 가져오기 (Stale-While-Revalidate)
    fetchFn()
      .then((data) => {
        enhancedCache.set(key, data, options)
      })
      .catch(() => {
        // 에러 발생 시 무시 (캐시된 데이터 계속 사용)
      })

    return cached
  }

  // 캐시에 없으면 네트워크에서 가져오기
  const data = await fetchFn()
  enhancedCache.set(key, data, options)

  return data
}

/**
 * 캐시된 동기 함수 래퍼
 */
export function withCacheSync<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  options: CacheOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : `${fn.name}_${JSON.stringify(args)}`

    // 캐시 확인
    const cached = enhancedCache.get<ReturnType<T>>(key)
    if (cached !== null) {
      return cached
    }

    // 함수 실행 및 결과 캐싱
    const result = fn(...args)
    enhancedCache.set(key, result, options)

    return result
  }) as T
}
