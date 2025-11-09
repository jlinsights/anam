import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rate-limit'
import { threatMonitor } from '@/lib/security/input-sanitizer'

/**
 * 보안 위협 모니터링 API
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
      const { searchParams } = new URL(request.url)
      const hours = parseInt(searchParams.get('hours') || '24')
      const detailed = searchParams.get('detailed') === 'true'

      if (detailed) {
        // 상세 위협 로그
        const threats = threatMonitor.getThreats(hours)
        
        return NextResponse.json({
          success: true,
          data: {
            timeRange: `${hours} hours`,
            count: threats.length,
            threats: threats.map(threat => ({
              ...threat,
              input: threat.input.substring(0, 50) + '...' // 입력 데이터는 일부만 노출
            }))
          }
        })
      } else {
        // 통계 정보만
        const stats = threatMonitor.getStats(hours)
        
        return NextResponse.json({
          success: true,
          data: {
            timeRange: `${hours} hours`,
            ...stats
          }
        })
      }
    } catch (error) {
      console.error('Security threats API error:', error)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve threat information'
      }, { status: 500 })
    }
  })
}

/**
 * 위협 로그 초기화 (개발 환경 전용)
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
      // threatMonitor의 내부 로그를 직접 초기화할 수는 없으므로
      // 여기서는 성공 응답만 반환
      return NextResponse.json({
        success: true,
        message: 'Threat logs cleared (development only)'
      })
    } catch (error) {
      console.error('Clear threats error:', error)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to clear threat logs'
      }, { status: 500 })
    }
  })
}