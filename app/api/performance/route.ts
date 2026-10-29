import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // 성능 데이터 검증
    if (!data.type || !data.data) {
      return NextResponse.json(
        { success: false, message: 'Invalid performance data format' },
        { status: 400 }
      )
    }

    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Data Received:', {
        type: data.type,
        timestamp: new Date().toISOString(),
        url: data.data.url,
        metrics: data.data.name
          ? `${data.data.name}: ${Math.round(data.data.value)}${data.data.name === 'CLS' ? '' : 'ms'}`
          : 'Custom metrics',
        userAgent: data.data.userAgent?.substring(0, 50) + '...',
      })
    }

    // 프로덕션 환경에서는 분석 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // 여기에 실제 분석 서비스 로직 추가
      // 예: Google Analytics, DataDog, New Relic 등
      // 예시: 로그 파일에 저장하거나 데이터베이스에 저장
      // await savePerformanceData(data)
    }

    // 성능 데이터 집계 및 분석
    const analysis = analyzePerformanceData(data)

    return createSuccessResponse(
      { analysis },
      'Performance data received successfully'
    )
  } catch (error) {
    return createErrorResponse(error, 500, 'Failed to process performance data')
  }
}

// 성능 집계 통계 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || '24h'

    // 실제 환경에서는 데이터베이스에서 조회
    const mockStats = generateMockPerformanceStats(timeframe)

    return createSuccessResponse(
      { stats: mockStats, timeframe },
      'Performance statistics retrieved successfully'
    )
  } catch (error) {
    return createErrorResponse(
      error,
      500,
      'Failed to fetch performance statistics'
    )
  }
}

// 성능 데이터 분석 함수
function analyzePerformanceData(data: any) {
  const analysis: any = {
    score: 'unknown',
    recommendations: [],
    issues: [],
  }

  if (data.type === 'web-vital') {
    const { name, value, rating } = data.data

    analysis.metric = name
    analysis.value = value
    analysis.rating = rating

    // Core Web Vitals 기준 분석
    switch (name) {
      case 'LCP':
        if (value > 4000) {
          analysis.score = 'poor'
          analysis.recommendations.push(
            '이미지 최적화 및 서버 응답 시간 개선이 필요합니다.'
          )
        } else if (value > 2500) {
          analysis.score = 'needs-improvement'
          analysis.recommendations.push(
            '이미지 lazy loading 및 CDN 사용을 고려하세요.'
          )
        } else {
          analysis.score = 'good'
        }
        break

      case 'FID':
        if (value > 300) {
          analysis.score = 'poor'
          analysis.recommendations.push(
            'JavaScript 번들 크기 줄이기 및 코드 분할이 필요합니다.'
          )
        } else if (value > 100) {
          analysis.score = 'needs-improvement'
          analysis.recommendations.push(
            '비필수 JavaScript 지연 로딩을 고려하세요.'
          )
        } else {
          analysis.score = 'good'
        }
        break

      case 'CLS':
        if (value > 0.25) {
          analysis.score = 'poor'
          analysis.recommendations.push(
            '이미지와 광고에 명시적인 크기를 설정하세요.'
          )
        } else if (value > 0.1) {
          analysis.score = 'needs-improvement'
          analysis.recommendations.push('웹폰트 로딩 최적화를 고려하세요.')
        } else {
          analysis.score = 'good'
        }
        break

      case 'FCP':
        if (value > 3000) {
          analysis.score = 'poor'
          analysis.recommendations.push(
            'CSS 및 JavaScript 최적화가 필요합니다.'
          )
        } else if (value > 1800) {
          analysis.score = 'needs-improvement'
          analysis.recommendations.push('중요한 리소스의 우선순위를 높이세요.')
        } else {
          analysis.score = 'good'
        }
        break

      case 'TTFB':
        if (value > 1800) {
          analysis.score = 'poor'
          analysis.recommendations.push('서버 성능 및 CDN 최적화가 필요합니다.')
        } else if (value > 800) {
          analysis.score = 'needs-improvement'
          analysis.recommendations.push('서버 캐싱 전략을 개선하세요.')
        } else {
          analysis.score = 'good'
        }
        break
    }
  }

  return analysis
}

// 모의 성능 통계 생성 (실제 환경에서는 DB에서 조회)
function generateMockPerformanceStats(timeframe: string) {
  return {
    overview: {
      avgLCP: 2150 + Math.random() * 500,
      avgFID: 85 + Math.random() * 30,
      avgCLS: 0.08 + Math.random() * 0.04,
      avgFCP: 1650 + Math.random() * 300,
      avgTTFB: 720 + Math.random() * 180,
      totalSessions: Math.floor(Math.random() * 1000) + 500,
      performanceScore: Math.floor(85 + Math.random() * 10),
    },
    trends: {
      daily: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        lcp: 2000 + Math.random() * 600,
        fid: 80 + Math.random() * 40,
        cls: 0.07 + Math.random() * 0.06,
        sessions: Math.floor(Math.random() * 200) + 100,
      })),
    },
    devices: {
      mobile: Math.floor(Math.random() * 40) + 45,
      desktop: Math.floor(Math.random() * 30) + 35,
      tablet: Math.floor(Math.random() * 20) + 10,
    },
    topIssues: [
      {
        metric: 'LCP',
        affectedPages: Math.floor(Math.random() * 20) + 5,
        avgValue: 2800 + Math.random() * 400,
        severity: 'warning',
      },
      {
        metric: 'CLS',
        affectedPages: Math.floor(Math.random() * 15) + 3,
        avgValue: 0.15 + Math.random() * 0.1,
        severity: 'info',
      },
    ],
  }
}
