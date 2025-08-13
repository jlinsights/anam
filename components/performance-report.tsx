'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  BarChart3, 
  Download, 
  FileText, 
  TrendingDown, 
  TrendingUp, 
  Zap,
  Clock,
  Smartphone,
  Wifi,
  Image,
  Search,
  Package
} from 'lucide-react'

interface PerformanceReportData {
  timeRange: string
  summary: {
    totalSessions: number
    averageScore: number
    totalAlerts: number
    totalViolations: number
    criticalAlerts: number
  }
  insights: {
    topIssues: string[]
    recommendations: string[]
    deviceBreakdown: Record<string, number>
    networkBreakdown: Record<string, number>
  }
  anomalies: string[]
  trends: string[]
  recentAlerts: any[]
  recentViolations: any[]
}

interface PerformanceReportProps {
  className?: string
  timeRange?: '1h' | '24h' | '7d' | '30d'
  autoRefresh?: boolean
  refreshInterval?: number
}

export function PerformanceReport({ 
  className = '', 
  timeRange = '24h',
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}: PerformanceReportProps) {
  const [data, setData] = useState<PerformanceReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load performance report data
  const loadReportData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/performance/analytics?type=summary&timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load report: ${response.statusText}`)
      }
      
      const reportData = await response.json()
      setData(reportData)
      setLastUpdated(new Date())
    } catch (err) {
      const error = err as Error
      setError(error.message)
      console.error('Failed to load performance report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh functionality
  useEffect(() => {
    loadReportData()
    
    if (autoRefresh) {
      const interval = setInterval(loadReportData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [timeRange, autoRefresh, refreshInterval])

  // Export report functionality
  const exportReport = async (format: 'json' | 'csv') => {
    if (!data) return

    try {
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `performance-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'csv') {
        // Convert to CSV format
        const csvData = [
          ['Metric', 'Value'],
          ['Time Range', data.timeRange],
          ['Total Sessions', data.summary.totalSessions.toString()],
          ['Average Score', data.summary.averageScore.toString()],
          ['Total Alerts', data.summary.totalAlerts.toString()],
          ['Critical Alerts', data.summary.criticalAlerts.toString()],
          ['Total Violations', data.summary.totalViolations.toString()],
          ...data.insights.topIssues.map(issue => ['Top Issue', issue]),
          ...data.insights.recommendations.map(rec => ['Recommendation', rec]),
          ...data.anomalies.map(anomaly => ['Anomaly', anomaly]),
          ...data.trends.map(trend => ['Trend', trend])
        ]
        
        const csvContent = csvData.map(row => 
          row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
        ).join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `performance-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 75) return 'text-yellow-600 bg-yellow-100'
    if (score >= 50) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    if (trend.includes('improvement') || trend.includes('decrease')) {
      return <TrendingDown className="h-4 w-4 text-green-500" />
    }
    if (trend.includes('degradation') || trend.includes('increase')) {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    }
    return <BarChart3 className="h-4 w-4 text-blue-500" />
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading performance report...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Failed to load performance report</p>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button variant="outline" onClick={loadReportData} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No performance data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Report</h2>
          <p className="text-muted-foreground">
            Comprehensive performance analysis for the last {timeRange}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              Updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => exportReport('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={loadReportData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Total user sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold px-2 py-1 rounded ${getScoreColor(data.summary.averageScore)}`}>
              {data.summary.averageScore}
            </div>
            <p className="text-xs text-muted-foreground">Performance score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.summary.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">Performance alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.summary.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">Critical alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.summary.totalViolations}</div>
            <p className="text-xs text-muted-foreground">Budget exceeded</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Issues and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Top Performance Issues
            </CardTitle>
            <CardDescription>
              Most common performance problems affecting users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.insights.topIssues.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No significant performance issues detected
              </p>
            ) : (
              <div className="space-y-2">
                {data.insights.topIssues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 border rounded">
                    <Badge variant="destructive" className="text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{issue}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Optimization Recommendations
            </CardTitle>
            <CardDescription>
              Actionable steps to improve performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.insights.recommendations.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No specific recommendations at this time
              </p>
            ) : (
              <div className="space-y-2">
                {data.insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 border rounded">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trends and Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Performance Trends
            </CardTitle>
            <CardDescription>
              Patterns and changes in performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.trends.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No significant trends detected
              </p>
            ) : (
              <div className="space-y-3">
                {data.trends.map((trend, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded">
                    {getTrendIcon(trend)}
                    <span className="text-sm">{trend}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Performance Anomalies
            </CardTitle>
            <CardDescription>
              Unusual patterns requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.anomalies.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No anomalies detected
              </p>
            ) : (
              <div className="space-y-2">
                {data.anomalies.map((anomaly, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 border border-orange-200 rounded bg-orange-50">
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{anomaly}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device and Network Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              Device Breakdown
            </CardTitle>
            <CardDescription>
              Performance distribution across device types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.insights.deviceBreakdown).map(([device, count]) => {
                const percentage = ((count / data.summary.totalSessions) * 100).toFixed(1)
                return (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {device}
                      </Badge>
                      <span className="text-sm">{count} sessions</span>
                    </div>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-500" />
              Network Breakdown
            </CardTitle>
            <CardDescription>
              Performance distribution across network types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.insights.networkBreakdown).map(([network, count]) => {
                const percentage = ((count / data.summary.totalSessions) * 100).toFixed(1)
                return (
                  <div key={network} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="uppercase">
                        {network}
                      </Badge>
                      <span className="text-sm">{count} sessions</span>
                    </div>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts and Violations */}
      {(data.recentAlerts.length > 0 || data.recentViolations.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.recentAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  Recent Alerts
                </CardTitle>
                <CardDescription>
                  Latest performance alerts ({data.recentAlerts.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.recentAlerts.slice(0, 5).map((alert, index) => (
                    <div key={index} className="p-2 border rounded">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data.recentViolations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-500" />
                  Recent Violations
                </CardTitle>
                <CardDescription>
                  Latest budget violations ({data.recentViolations.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.recentViolations.slice(0, 5).map((violation, index) => (
                    <div key={index} className="p-2 border rounded">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline">
                          {violation.budget}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(violation.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">
                        Exceeded by {violation.percentage.toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default PerformanceReport