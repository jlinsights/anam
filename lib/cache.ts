/*
  Global Cache Helper (Server + Client)
  -------------------------------------
  1. In-memory cache on both server & client (Map)
  2. localStorage persistence on browser
  3. Helper to revalidate Next.js cache tag on server
*/

// 기본 캐시 지속 시간 (5분)
const DEFAULT_DURATION = 5 * 60 * 1000

type CacheEntry = {
  data: any
  timestamp: number
  duration: number
}

// 서버/클라이언트 모두 동작 가능한 메모리 캐시
const memoryCache = new Map<string, CacheEntry>()

// 브라우저 localStorage 래퍼
class LocalStorageCache {
  private isClient = typeof window !== 'undefined'

  get(key: string): any | null {
    if (!this.isClient) return null
    try {
      const raw = window.localStorage.getItem(`heelang_cache_${key}`)
      if (!raw) return null
      const parsed: CacheEntry = JSON.parse(raw)
      if (Date.now() - parsed.timestamp > parsed.duration) {
        window.localStorage.removeItem(`heelang_cache_${key}`)
        return null
      }
      return parsed.data
    } catch (_) {
      return null
    }
  }

  set(key: string, data: any, duration: number = DEFAULT_DURATION) {
    if (!this.isClient) return
    const entry: CacheEntry = { data, timestamp: Date.now(), duration }
    try {
      window.localStorage.setItem(`heelang_cache_${key}`, JSON.stringify(entry))
    } catch (_) {}
  }

  clear() {
    if (!this.isClient) return
    Object.keys(localStorage)
      .filter((k) => k.startsWith('heelang_cache_'))
      .forEach((k) => localStorage.removeItem(k))
  }
}

const localCache = new LocalStorageCache()

export function getCachedData(key: string): any | null {
  const mem = memoryCache.get(key)
  if (mem && Date.now() - mem.timestamp < mem.duration) return mem.data
  return localCache.get(key)
}

export function setCachedData(
  key: string,
  data: any,
  duration: number = DEFAULT_DURATION
): void {
  const entry: CacheEntry = { data, timestamp: Date.now(), duration }
  memoryCache.set(key, entry)
  localCache.set(key, data, duration)
}

export function clearCache(): void {
  memoryCache.clear()
  localCache.clear()
}

// Next.js 14 App Router cache revalidation helper
export async function revalidateTagSafe(tag: string) {
  if (typeof window !== 'undefined') return // 브라우저에서는 무시
  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag(tag)
  } catch (_) {
    // next/cache 불가 환경 (예: 테스트) – 조용히 무시
  }
}

export function clearCacheAndRevalidate(tag?: string): void {
  clearCache()
  if (tag) {
    revalidateTagSafe(tag)
  }
}

/* Duplicate advanced cache implementation removed */
/*
class MemoryCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private timers = new Map<string, NodeJS.Timeout>();

  set(key: string, data: any, ttlSeconds = 300) {
    // 기존 타이머 정리
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
    }

    const timestamp = Date.now();
    const ttl = ttlSeconds * 1000;
    
    this.cache.set(key, { data, timestamp, ttl });

    // TTL 타이머 설정
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);
    
    this.timers.set(key, timer);
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
      this.timers.delete(key);
    }
  }

  clear() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  size() {
    return this.cache.size;
  }

  // 만료된 캐시 정리
  cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach((key) => this.delete(key));
  }
}

// 전역 메모리 캐시 인스턴스
export const memoryCache = new MemoryCache();

// 정기적인 캐시 정리 (5분마다)
if (typeof window === "undefined") {
  setInterval(() => {
    memoryCache.cleanup();
  }, 5 * 60 * 1000);
}

// 브라우저 로컬 스토리지 캐시
export class LocalStorageCache {
  private prefix: string;

  constructor(prefix = "app_cache_") {
    this.prefix = prefix;
  }

  set(key: string, data: any, ttlSeconds = 3600) {
    if (typeof window === "undefined") return;

    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    };

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn("LocalStorage cache set failed:", error);
    }
  }

  get(key: string): any | null {
    if (typeof window === "undefined") return null;

    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      const now = Date.now();
      
      if (now - item.timestamp > item.ttl) {
        this.delete(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn("LocalStorage cache get failed:", error);
      return null;
    }
  }

  delete(key: string) {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn("LocalStorage cache delete failed:", error);
    }
  }

  clear() {
    if (typeof window === "undefined") return;
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("LocalStorage cache clear failed:", error);
    }
  }

  // 만료된 항목 정리
  cleanup() {
    if (typeof window === "undefined") return;
    
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach((storageKey) => {
        if (storageKey.startsWith(this.prefix)) {
          const itemStr = localStorage.getItem(storageKey);
          if (itemStr) {
            try {
              const item = JSON.parse(itemStr);
              if (now - item.timestamp > item.ttl) {
                localStorage.removeItem(storageKey);
              }
            } catch {
              // 파싱 에러가 있는 항목 제거
              localStorage.removeItem(storageKey);
            }
          }
        }
      });
    } catch (error) {
      console.warn("LocalStorage cache cleanup failed:", error);
    }
  }
}

// 전역 로컬 스토리지 캐시 인스턴스
export const localStorageCache = new LocalStorageCache();

// Next.js 캐시 설정 헬퍼
export const cacheConfig = {
  // 정적 자산 캐싱 (1년)
  static: {
    "Cache-Control": "public, max-age=31536000, immutable",
  },
  
  // 이미지 캐싱 (1주일)
  images: {
    "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
  },
  
  // API 응답 캐싱 (5분)
  api: {
    "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
  },
  
  // 페이지 캐싱 (1시간)
  pages: {
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=300",
  },
  
  // 캐시 무효화
  noCache: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
};

// 캐시 키 생성 헬퍼
export function generateCacheKey(...parts: string[]): string {
  return parts.filter(Boolean).join(":");
}

// 캐시된 함수 래퍼
export function withCache<T extends (...args: any[]) => any>(
  fn: T,
  ttlSeconds = 300
): T {
  return ((...args: any[]) => {
    const key = generateCacheKey(fn.name, JSON.stringify(args));
    
    // 캐시된 결과 확인
    const cached = memoryCache.get(key);
    if (cached !== null) {
      return cached;
    }
    
    // 함수 실행 및 결과 캐싱
    const result = fn(...args);
    memoryCache.set(key, result, ttlSeconds);
    
    return result;
  }) as T;
}

// 캐시된 비동기 함수 래퍼
export function withAsyncCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttlSeconds = 300
): T {
  return (async (...args: any[]) => {
    const key = generateCacheKey(fn.name, JSON.stringify(args));
    
    // 캐시된 결과 확인
    const cached = memoryCache.get(key);
    if (cached !== null) {
      return cached;
    }
    
    // 함수 실행 및 결과 캐싱
    const result = await fn(...args);
    memoryCache.set(key, result, ttlSeconds);
    
    return result;
  }) as T;
} 
*/
