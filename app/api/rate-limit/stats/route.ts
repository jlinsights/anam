import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters, withRateLimit } from '@/lib/rate-limit'

/**
 * Rate Limiting 통계 조회 API
 * 개발 환경에서만 사용 가능
 */
export async function GET(request: NextRequest) {
  return withRateLimit(request, 'api', async () => {
    // 프로덕션에서는 접근 제한
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        error: 'Not available in production'
      }, { status: 403 })
    }

    try {
      const stats = {
        timestamp: new Date().toISOString(),
        rateLimiters: {
          api: rateLimiters.api.getStats(),
          search: rateLimiters.search.getStats(),
          contact: rateLimiters.contact.getStats(),
          health: rateLimiters.health.getStats()
        },
        totalMemoryUsage: Object.values(rateLimiters)
          .reduce((total, limiter) => total + limiter.getStats().memoryUsage, 0)
      }

      return NextResponse.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Rate limit stats error:', error)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve rate limit statistics'
      }, { status: 500 })
    }
  })
}

/**
 * Rate Limiting 초기화 API (개발 환경 전용)
 */
export async function DELETE(request: NextRequest) {
  return withRateLimit(request, 'api', async () => {
    // 프로덕션에서는 접근 제한
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        error: 'Not available in production'
      }, { status: 403 })
    }

    try {
      const { searchParams } = new URL(request.url)
      const limiterName = searchParams.get('limiter')
      const identifier = searchParams.get('identifier')

      if (limiterName && identifier) {
        // 특정 식별자의 rate limit 초기화
        if (limiterName in rateLimiters) {
          const limiter = rateLimiters[limiterName as keyof typeof rateLimiters]
          limiter.reset(identifier)
          
          return NextResponse.json({
            success: true,
            message: `Rate limit reset for ${identifier} in ${limiterName} limiter`
          })
        } else {
          return NextResponse.json({
            success: false,
            error: `Unknown limiter: ${limiterName}`
          }, { status: 400 })
        }
      } else if (limiterName) {
        // 특정 limiter 전체 초기화
        return NextResponse.json({
          success: false,
          error: 'Identifier required for reset operation'
        }, { status: 400 })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Limiter name required'
        }, { status: 400 })
      }
    } catch (error) {
      console.error('Rate limit reset error:', error)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to reset rate limits'
      }, { status: 500 })
    }
  })
}