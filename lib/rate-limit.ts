/**
 * Rate Limiting System
 * 
 * 메모리 기반 간단한 Rate Limiting 구현
 * 프로덕션에서는 Redis 기반 시스템 권장
 */

interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

interface RateLimitConfig {
  requests: number  // 허용 요청 수
  window: number    // 시간 창 (밀리초)
  blockDuration?: number // 차단 지속 시간 (밀리초)
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private blockedIPs = new Map<string, number>()
  
  constructor(private config: RateLimitConfig) {
    // 5분마다 정리 작업 실행
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }
  
  /**
   * Rate limit 확인 및 적용
   */
  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    
    // 차단된 IP 확인
    const blockedUntil = this.blockedIPs.get(identifier)
    if (blockedUntil && now < blockedUntil) {
      return {
        success: false,
        limit: this.config.requests,
        remaining: 0,
        resetTime: blockedUntil,
        retryAfter: Math.ceil((blockedUntil - now) / 1000)
      }
    }
    
    // 차단 시간이 지나면 해제
    if (blockedUntil && now >= blockedUntil) {
      this.blockedIPs.delete(identifier)
    }
    
    const entry = this.store.get(identifier)
    
    // 첫 요청이거나 시간 창이 지난 경우
    if (!entry || now >= entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.window,
        firstRequest: now
      }
      this.store.set(identifier, newEntry)
      
      return {
        success: true,
        limit: this.config.requests,
        remaining: this.config.requests - 1,
        resetTime: newEntry.resetTime
      }
    }
    
    // 시간 창 내에서 요청 수 증가
    entry.count++
    
    // 한도 초과 확인
    if (entry.count > this.config.requests) {
      // 차단 설정 (설정된 경우)
      if (this.config.blockDuration) {
        this.blockedIPs.set(identifier, now + this.config.blockDuration)
      }
      
      return {
        success: false,
        limit: this.config.requests,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }
    }
    
    return {
      success: true,
      limit: this.config.requests,
      remaining: this.config.requests - entry.count,
      resetTime: entry.resetTime
    }
  }
  
  /**
   * 특정 식별자의 제한 초기화
   */
  reset(identifier: string): void {
    this.store.delete(identifier)
    this.blockedIPs.delete(identifier)
  }
  
  /**
   * 만료된 항목 정리
   */
  private cleanup(): void {
    const now = Date.now()
    
    // 만료된 rate limit 항목 제거
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key)
      }
    }
    
    // 만료된 차단 항목 제거
    for (const [key, blockedUntil] of this.blockedIPs.entries()) {
      if (now >= blockedUntil) {
        this.blockedIPs.delete(key)
      }
    }
  }
  
  /**
   * 현재 상태 정보
   */
  getStats(): {
    activeEntries: number
    blockedIPs: number
    memoryUsage: number
  } {
    return {
      activeEntries: this.store.size,
      blockedIPs: this.blockedIPs.size,
      memoryUsage: JSON.stringify([...this.store.entries()]).length
    }
  }
}

// 사전 정의된 Rate Limiter 인스턴스들
export const rateLimiters = {
  // API 일반 요청: 분당 60회
  api: new RateLimiter({
    requests: 60,
    window: 60 * 1000, // 1분
    blockDuration: 5 * 60 * 1000 // 5분 차단
  }),
  
  // 검색 API: 분당 20회 (더 엄격)
  search: new RateLimiter({
    requests: 20,
    window: 60 * 1000, // 1분
    blockDuration: 2 * 60 * 1000 // 2분 차단
  }),
  
  // 컨택트 폼: 시간당 5회
  contact: new RateLimiter({
    requests: 5,
    window: 60 * 60 * 1000, // 1시간
    blockDuration: 30 * 60 * 1000 // 30분 차단
  }),
  
  // Health check: 분당 10회
  health: new RateLimiter({
    requests: 10,
    window: 60 * 1000, // 1분
  })
}

/**
 * IP 주소 추출 유틸리티
 */
export function getClientIP(request: Request): string {
  // Vercel의 실제 IP 헤더들 확인
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for')
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(',')[0].trim()
  }
  
  // Fallback
  return 'unknown'
}

/**
 * Rate limit 헤더 생성
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  }
  
  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString()
  }
  
  return headers
}

/**
 * Rate limit 미들웨어 래퍼
 */
export async function withRateLimit(
  request: Request,
  limiterName: keyof typeof rateLimiters,
  handler: () => Promise<Response>
): Promise<Response> {
  const clientIP = getClientIP(request)
  const limiter = rateLimiters[limiterName]
  
  const result = await limiter.check(clientIP)
  
  if (!result.success) {
    const headers = createRateLimitHeaders(result)
    
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
        limit: result.limit,
        resetTime: new Date(result.resetTime).toISOString()
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      }
    )
  }
  
  // 요청 처리
  const response = await handler()
  
  // Rate limit 헤더 추가
  const rateLimitHeaders = createRateLimitHeaders(result)
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}