import { NextRequest, NextResponse } from 'next/server'

interface PerformanceAnalyticsData {
  metrics: Record<string, number>
  userAgent: string
  viewport: { width: number; height: number }
  deviceInfo: {
    memory?: number
    cores?: number
    deviceType?: 'mobile' | 'tablet' | 'desktop'
  }
  networkInfo: {
    connectionType?: string
    effectiveType?: string
    downlink?: number
    rtt?: number
  }
  pageInfo: {
    url: string
    referrer?: string
    loadTime?: number
  }
  timestamp: number
  sessionId: string
}

interface PerformanceAlert {
  id: string
  type: string
  severity: string
  metric: string
  value: number
  threshold: number
  message: string
  timestamp: number
  url: string
  userAgent: string
}

interface BudgetViolation {
  budget: string
  allocated: number
  actual: number
  percentage: number
  url: string
  timestamp: number
  userAgent: string
}

// In-memory storage for demo purposes
// In production, you'd use a proper database or analytics service
const performanceData: PerformanceAnalyticsData[] = []
const performanceAlerts: PerformanceAlert[] = []
const budgetViolations: BudgetViolation[] = []

// Performance thresholds for server-side analysis
const PERFORMANCE_THRESHOLDS = {
  LCP_GOOD: 2500,
  LCP_POOR: 4000,
  FID_GOOD: 100,
  FID_POOR: 300,
  CLS_GOOD: 0.1,
  CLS_POOR: 0.25,
  FCP_GOOD: 1800,
  FCP_POOR: 3000,
  TTFB_GOOD: 800,
  TTFB_POOR: 1800,
  INP_GOOD: 200,
  INP_POOR: 500
}

// Performance budgets
const PERFORMANCE_BUDGETS = {
  GALLERY_LOAD_TIME: 2000,
  ARTWORK_DETAIL_LOAD: 1500,
  SEARCH_RESPONSE: 300,
  FILTER_RESPONSE: 200,
  IMAGE_LOAD_BUDGET: 3000,
  THUMBNAIL_LOAD_BUDGET: 500,
  MODAL_OPEN_BUDGET: 150
}

function analyzePerformanceData(data: PerformanceAnalyticsData): {
  score: number
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  // Analyze Core Web Vitals
  if (data.metrics.lcp) {
    if (data.metrics.lcp > PERFORMANCE_THRESHOLDS.LCP_POOR) {
      score -= 25
      issues.push(`Poor LCP: ${data.metrics.lcp}ms`)
      recommendations.push('Optimize Largest Contentful Paint by improving server response times and optimizing critical resources')
    } else if (data.metrics.lcp > PERFORMANCE_THRESHOLDS.LCP_GOOD) {
      score -= 10
      issues.push(`Needs improvement LCP: ${data.metrics.lcp}ms`)
      recommendations.push('Consider optimizing images and critical CSS for better LCP')
    }
  }

  if (data.metrics.inp) {
    if (data.metrics.inp > PERFORMANCE_THRESHOLDS.INP_POOR) {
      score -= 25
      issues.push(`Poor INP: ${data.metrics.inp}ms`)
      recommendations.push('Optimize JavaScript execution and reduce main thread blocking')
    } else if (data.metrics.inp > PERFORMANCE_THRESHOLDS.INP_GOOD) {
      score -= 10
      issues.push(`Needs improvement INP: ${data.metrics.inp}ms`)
      recommendations.push('Consider code splitting and optimizing event handlers')
    }
  }

  if (data.metrics.cls !== undefined) {
    if (data.metrics.cls > PERFORMANCE_THRESHOLDS.CLS_POOR) {
      score -= 25
      issues.push(`Poor CLS: ${data.metrics.cls}`)
      recommendations.push('Fix layout shifts by reserving space for images and dynamic content')
    } else if (data.metrics.cls > PERFORMANCE_THRESHOLDS.CLS_GOOD) {
      score -= 10
      issues.push(`Needs improvement CLS: ${data.metrics.cls}`)
      recommendations.push('Consider adding size attributes to images and optimize font loading')
    }
  }

  // Analyze gallery-specific metrics
  if (data.metrics.artworkListLoadTime && data.metrics.artworkListLoadTime > PERFORMANCE_BUDGETS.GALLERY_LOAD_TIME) {
    score -= 15
    issues.push(`Slow gallery loading: ${data.metrics.artworkListLoadTime}ms`)
    recommendations.push('Implement virtual scrolling and optimize image loading strategy')
  }

  if (data.metrics.searchResponseTime && data.metrics.searchResponseTime > PERFORMANCE_BUDGETS.SEARCH_RESPONSE) {
    score -= 10
    issues.push(`Slow search response: ${data.metrics.searchResponseTime}ms`)
    recommendations.push('Implement search debouncing and result caching')
  }

  if (data.metrics.imageLoadingTime && data.metrics.imageLoadingTime > PERFORMANCE_BUDGETS.IMAGE_LOAD_BUDGET) {
    score -= 10
    issues.push(`Slow image loading: ${data.metrics.imageLoadingTime}ms`)
    recommendations.push('Optimize image formats and implement progressive loading')
  }

  // Device-specific recommendations
  if (data.deviceInfo.deviceType === 'mobile') {
    if (data.metrics.lcp && data.metrics.lcp > PERFORMANCE_THRESHOLDS.LCP_GOOD) {
      recommendations.push('Consider mobile-specific optimizations for slower networks')
    }
  }

  // Network-specific recommendations
  if (data.networkInfo.effectiveType === '3g' || data.networkInfo.effectiveType === 'slow-2g') {
    recommendations.push('Implement adaptive loading for slower connections')
    recommendations.push('Consider offering a lightweight version for slow networks')
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations
  }
}

function detectAnomalies(data: PerformanceAnalyticsData[]): {
  anomalies: string[]
  trends: string[]
} {
  const anomalies: string[] = []
  const trends: string[] = []

  if (data.length < 10) return { anomalies, trends }

  const recent = data.slice(-10)
  const older = data.slice(-20, -10)

  // Calculate averages
  const recentLCP = recent.filter(d => d.metrics.lcp).map(d => d.metrics.lcp!)
  const olderLCP = older.filter(d => d.metrics.lcp).map(d => d.metrics.lcp!)

  if (recentLCP.length > 0 && olderLCP.length > 0) {
    const recentAvg = recentLCP.reduce((a, b) => a + b, 0) / recentLCP.length
    const olderAvg = olderLCP.reduce((a, b) => a + b, 0) / olderLCP.length
    const change = ((recentAvg - olderAvg) / olderAvg) * 100

    if (change > 20) {
      anomalies.push(`LCP degradation: ${change.toFixed(1)}% increase`)
      trends.push('Performance regression detected in LCP')
    } else if (change < -20) {
      trends.push(`LCP improvement: ${Math.abs(change).toFixed(1)}% decrease`)
    }
  }

  // Check for error rate increases
  const recentErrors = recent.filter(d => d.metrics.errorRate).map(d => d.metrics.errorRate!)
  const olderErrors = older.filter(d => d.metrics.errorRate).map(d => d.metrics.errorRate!)

  if (recentErrors.length > 0 && olderErrors.length > 0) {
    const recentErrorAvg = recentErrors.reduce((a, b) => a + b, 0) / recentErrors.length
    const olderErrorAvg = olderErrors.reduce((a, b) => a + b, 0) / olderErrors.length

    if (recentErrorAvg > olderErrorAvg * 1.5) {
      anomalies.push(`Error rate spike: ${(recentErrorAvg * 100).toFixed(2)}%`)
    }
  }

  return { anomalies, trends }
}

function generateInsights(data: PerformanceAnalyticsData[]): {
  topIssues: string[]
  recommendations: string[]
  deviceBreakdown: Record<string, number>
  networkBreakdown: Record<string, number>
} {
  const topIssues: string[] = []
  const recommendations: string[] = []
  const deviceBreakdown: Record<string, number> = {}
  const networkBreakdown: Record<string, number> = {}

  // Analyze device distribution
  data.forEach(d => {
    const deviceType = d.deviceInfo.deviceType || 'unknown'
    deviceBreakdown[deviceType] = (deviceBreakdown[deviceType] || 0) + 1
    
    const networkType = d.networkInfo.effectiveType || 'unknown'
    networkBreakdown[networkType] = (networkBreakdown[networkType] || 0) + 1
  })

  // Find common performance issues
  const slowLCP = data.filter(d => d.metrics.lcp && d.metrics.lcp > PERFORMANCE_THRESHOLDS.LCP_POOR).length
  const slowGallery = data.filter(d => d.metrics.artworkListLoadTime && d.metrics.artworkListLoadTime > PERFORMANCE_BUDGETS.GALLERY_LOAD_TIME).length
  const slowSearch = data.filter(d => d.metrics.searchResponseTime && d.metrics.searchResponseTime > PERFORMANCE_BUDGETS.SEARCH_RESPONSE).length

  if (slowLCP > data.length * 0.1) {
    topIssues.push(`${((slowLCP / data.length) * 100).toFixed(1)}% of users experience slow LCP`)
    recommendations.push('Prioritize LCP optimization across all pages')
  }

  if (slowGallery > data.length * 0.1) {
    topIssues.push(`${((slowGallery / data.length) * 100).toFixed(1)}% of users experience slow gallery loading`)
    recommendations.push('Implement virtual scrolling and image optimization')
  }

  if (slowSearch > data.length * 0.1) {
    topIssues.push(`${((slowSearch / data.length) * 100).toFixed(1)}% of users experience slow search`)
    recommendations.push('Optimize search algorithm and implement caching')
  }

  // Mobile-specific recommendations
  if (deviceBreakdown.mobile > data.length * 0.5) {
    recommendations.push('Focus on mobile performance optimizations')
    recommendations.push('Consider implementing progressive web app features')
  }

  // Network-specific recommendations
  if ((networkBreakdown['3g'] || 0) + (networkBreakdown['slow-2g'] || 0) > data.length * 0.2) {
    recommendations.push('Implement adaptive loading for slower networks')
    recommendations.push('Consider offering offline functionality')
  }

  return {
    topIssues,
    recommendations,
    deviceBreakdown,
    networkBreakdown
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle different types of performance data
    switch (body.type) {
      case 'custom-performance-metrics': {
        const analyticsData: PerformanceAnalyticsData = {
          metrics: body.data.metrics || {},
          userAgent: body.data.userAgent || '',
          viewport: body.data.viewport || { width: 0, height: 0 },
          deviceInfo: body.data.deviceInfo || {},
          networkInfo: body.data.networkInfo || {},
          pageInfo: {
            url: body.data.url || '',
            referrer: body.data.referrer,
            loadTime: body.data.loadTime
          },
          timestamp: body.data.timestamp || Date.now(),
          sessionId: body.data.sessionId || 'unknown'
        }

        // Store performance data
        performanceData.push(analyticsData)
        
        // Keep only last 1000 entries
        if (performanceData.length > 1000) {
          performanceData.splice(0, performanceData.length - 1000)
        }

        // Analyze performance
        const analysis = analyzePerformanceData(analyticsData)
        
        return NextResponse.json({
          success: true,
          analysis,
          stored: true
        })
      }

      case 'custom-performance-alert': {
        const alert: PerformanceAlert = {
          id: body.data.id || `alert-${Date.now()}`,
          type: body.data.type || 'unknown',
          severity: body.data.severity || 'medium',
          metric: body.data.metric || 'unknown',
          value: body.data.value || 0,
          threshold: body.data.threshold || 0,
          message: body.data.message || 'Performance alert',
          timestamp: body.data.timestamp || Date.now(),
          url: body.data.url || '',
          userAgent: body.data.userAgent || ''
        }

        performanceAlerts.push(alert)
        
        // Keep only last 500 alerts
        if (performanceAlerts.length > 500) {
          performanceAlerts.splice(0, performanceAlerts.length - 500)
        }

        // Log critical alerts
        if (alert.severity === 'critical') {
          console.error('🔥 Critical Performance Alert:', alert)
        }

        return NextResponse.json({
          success: true,
          alert,
          stored: true
        })
      }

      case 'custom-budget-exceeded': {
        const violation: BudgetViolation = {
          budget: body.data.budget || 'unknown',
          allocated: body.data.allocated || 0,
          actual: body.data.actual || 0,
          percentage: body.data.percentage || 0,
          url: body.data.url || '',
          timestamp: body.data.timestamp || Date.now(),
          userAgent: body.data.userAgent || ''
        }

        budgetViolations.push(violation)
        
        // Keep only last 500 violations
        if (budgetViolations.length > 500) {
          budgetViolations.splice(0, budgetViolations.length - 500)
        }

        return NextResponse.json({
          success: true,
          violation,
          stored: true
        })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown performance data type' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Performance analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to process performance data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')
    const timeRange = searchParams.get('timeRange') || '24h'

    // Calculate time filter
    const now = Date.now()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }[timeRange] || 24 * 60 * 60 * 1000

    const startTime = now - timeRangeMs

    switch (type) {
      case 'summary': {
        const filteredData = performanceData.filter(d => d.timestamp >= startTime)
        const filteredAlerts = performanceAlerts.filter(a => a.timestamp >= startTime)
        const filteredViolations = budgetViolations.filter(v => v.timestamp >= startTime)

        const { anomalies, trends } = detectAnomalies(filteredData)
        const insights = generateInsights(filteredData)

        // Calculate average performance score
        const analyses = filteredData.map(d => analyzePerformanceData(d))
        const averageScore = analyses.length > 0 
          ? analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length 
          : 0

        return NextResponse.json({
          timeRange,
          summary: {
            totalSessions: filteredData.length,
            averageScore: Math.round(averageScore),
            totalAlerts: filteredAlerts.length,
            totalViolations: filteredViolations.length,
            criticalAlerts: filteredAlerts.filter(a => a.severity === 'critical').length
          },
          insights,
          anomalies,
          trends,
          recentAlerts: filteredAlerts.slice(0, 10),
          recentViolations: filteredViolations.slice(0, 10)
        })
      }

      case 'metrics': {
        const filteredData = performanceData
          .filter(d => d.timestamp >= startTime)
          .slice(0, limit)

        return NextResponse.json({
          data: filteredData,
          count: filteredData.length,
          timeRange
        })
      }

      case 'alerts': {
        const filteredAlerts = performanceAlerts
          .filter(a => a.timestamp >= startTime)
          .slice(0, limit)

        return NextResponse.json({
          alerts: filteredAlerts,
          count: filteredAlerts.length,
          timeRange
        })
      }

      case 'violations': {
        const filteredViolations = budgetViolations
          .filter(v => v.timestamp >= startTime)
          .slice(0, limit)

        return NextResponse.json({
          violations: filteredViolations,
          count: filteredViolations.length,
          timeRange
        })
      }

      default: {
        return NextResponse.json({
          availableTypes: ['summary', 'metrics', 'alerts', 'violations'],
          parameters: {
            type: 'Type of data to retrieve',
            limit: 'Maximum number of records (default: 100)',
            timeRange: 'Time range: 1h, 24h, 7d, 30d (default: 24h)'
          }
        })
      }
    }
  } catch (error) {
    console.error('Performance analytics GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve performance data' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    switch (type) {
      case 'metrics':
        performanceData.length = 0
        break
      case 'alerts':
        performanceAlerts.length = 0
        break
      case 'violations':
        budgetViolations.length = 0
        break
      case 'all':
        performanceData.length = 0
        performanceAlerts.length = 0
        budgetViolations.length = 0
        break
      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: metrics, alerts, violations, or all' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${type} data`
    })
  } catch (error) {
    console.error('Performance analytics DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to clear performance data' },
      { status: 500 }
    )
  }
}