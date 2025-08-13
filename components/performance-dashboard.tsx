'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Clock, 
  Eye, 
  Gauge, 
  Image, 
  Package, 
  Search, 
  Smartphone, 
  TrendingDown, 
  TrendingUp, 
  Wifi, 
  Zap 
} from 'lucide-react'
import {
  PerformanceMetrics,
  PerformanceAlert,
  BudgetExceededEvent,
  BundleAnalytics,
  UserInteraction,
  RUMData,
  advancedPerformanceMonitor,
  galleryPerformanceTracker,
  bundlePerformanceAnalyzer,
  errorCorrelationAnalyzer
} from '@/lib/performance-monitor'

interface PerformanceDashboardProps {
  className?: string
  compact?: boolean
  realTime?: boolean
}

interface DashboardData {
  metrics: PerformanceMetrics
  score: number
  alerts: PerformanceAlert[]
  bundleAnalytics: BundleAnalytics
  userJourney: UserInteraction[]
  rumData: RUMData | null
}

export function PerformanceDashboard({ 
  className = '', 
  compact = false, 
  realTime = true 
}: PerformanceDashboardProps) {
  const [data, setData] = useState<DashboardData>({
    metrics: {},
    score: 0,
    alerts: [],
    bundleAnalytics: {
      totalSize: 0,
      chunkSizes: {},
      duplicateCode: 0,
      unusedCode: 0,
      compressionRatio: 1,
      loadingPatterns: []
    },
    userJourney: [],
    rumData: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedTab, setSelectedTab] = useState<'overview' | 'vitals' | 'gallery' | 'bundle' | 'errors'>('overview')

  // Load performance data
  const loadPerformanceData = async () => {
    try {
      setIsLoading(true)
      
      const [report, bundleAnalytics, userJourney] = await Promise.all([
        advancedPerformanceMonitor.getAdvancedReport(),
        bundlePerformanceAnalyzer.analyzeBundles(),
        Promise.resolve(galleryPerformanceTracker.getUserJourney())
      ])

      const rumData = typeof window !== 'undefined' ? 
        advancedPerformanceMonitor.collectRUMData() : null

      setData({
        metrics: report.metrics,
        score: report.score,
        alerts: report.alerts,
        bundleAnalytics,
        userJourney,
        rumData
      })
      
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load performance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Real-time updates
  useEffect(() => {
    loadPerformanceData()
    
    if (realTime) {
      const interval = setInterval(loadPerformanceData, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [realTime])

  // Performance score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 75) return 'text-yellow-600 bg-yellow-100'
    if (score >= 50) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  // Alert severity color
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  // Core Web Vitals component
  const CoreWebVitals = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            LCP (Largest Contentful Paint)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.metrics.lcp ? formatDuration(data.metrics.lcp) : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">
            Target: &lt;2.5s
          </div>
          {data.metrics.lcp && (
            <Badge 
              variant={data.metrics.lcp <= 2500 ? 'default' : data.metrics.lcp <= 4000 ? 'secondary' : 'destructive'}
              className="mt-2"
            >
              {data.metrics.lcp <= 2500 ? 'Good' : data.metrics.lcp <= 4000 ? 'Needs Improvement' : 'Poor'}
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            INP (Interaction to Next Paint)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.metrics.inp ? formatDuration(data.metrics.inp) : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">
            Target: &lt;200ms
          </div>
          {data.metrics.inp && (
            <Badge 
              variant={data.metrics.inp <= 200 ? 'default' : data.metrics.inp <= 500 ? 'secondary' : 'destructive'}
              className="mt-2"
            >
              {data.metrics.inp <= 200 ? 'Good' : data.metrics.inp <= 500 ? 'Needs Improvement' : 'Poor'}
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-purple-500" />
            CLS (Cumulative Layout Shift)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.metrics.cls !== undefined ? data.metrics.cls.toFixed(3) : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">
            Target: &lt;0.1
          </div>
          {data.metrics.cls !== undefined && (
            <Badge 
              variant={data.metrics.cls <= 0.1 ? 'default' : data.metrics.cls <= 0.25 ? 'secondary' : 'destructive'}
              className="mt-2"
            >
              {data.metrics.cls <= 0.1 ? 'Good' : data.metrics.cls <= 0.25 ? 'Needs Improvement' : 'Poor'}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Gallery performance metrics
  const GalleryMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Image className="h-4 w-4 text-blue-500" />
            Gallery Load Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.metrics.artworkListLoadTime ? formatDuration(data.metrics.artworkListLoadTime) : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">Target: &lt;2s</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Search className="h-4 w-4 text-green-500" />
            Search Response
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.metrics.searchResponseTime ? formatDuration(data.metrics.searchResponseTime) : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">Target: &lt;300ms</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4 text-purple-500" />
            Image Loading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.metrics.imageLoadingTime ? formatDuration(data.metrics.imageLoadingTime) : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">Target: &lt;3s</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-500" />
            Modal Open Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.metrics.artworkModalOpenTime ? formatDuration(data.metrics.artworkModalOpenTime) : 'N/A'}
          </div>
          <div className="text-xs text-muted-foreground">Target: &lt;150ms</div>
        </CardContent>
      </Card>
    </div>
  )

  // Bundle analytics
  const BundleAnalytics = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              Total Bundle Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(data.bundleAnalytics.totalSize)}
            </div>
            <div className="text-xs text-muted-foreground">
              Budget: 1MB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              Compression Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data.bundleAnalytics.compressionRatio * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Lower is better
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Cache Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.bundleAnalytics.loadingPatterns[0]?.cacheUtilization 
                ? (data.bundleAnalytics.loadingPatterns[0].cacheUtilization * 100).toFixed(1)
                : '0'}%
            </div>
            <div className="text-xs text-muted-foreground">
              Higher is better
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Chunk Sizes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(data.bundleAnalytics.chunkSizes).map(([name, size]) => (
              <div key={name} className="flex justify-between items-center">
                <span className="text-sm font-mono">{name}</span>
                <Badge variant="outline">{formatBytes(size)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Performance alerts
  const AlertsSection = () => (
    <div className="space-y-2">
      {data.alerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No performance alerts
        </div>
      ) : (
        data.alerts.slice(0, 10).map((alert) => (
          <Card key={alert.id} className="border-l-4" style={{ borderLeftColor: getAlertColor(alert.severity) }}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <Badge className={getAlertColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium">{alert.metric}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {alert.message}
                  </p>
                  <div className="text-xs">
                    Value: {alert.value.toFixed(2)} | Threshold: {alert.threshold}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </div>
              
              {alert.actionRequired.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs font-medium mb-1">Recommended Actions:</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {alert.actionRequired.map((action, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  // User journey tracking
  const UserJourney = () => (
    <div className="space-y-2">
      {data.userJourney.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No user interactions tracked
        </div>
      ) : (
        data.userJourney.slice(-10).map((interaction, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    {interaction.type}
                  </Badge>
                  <span className="text-sm font-mono">{interaction.element}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(interaction.duration)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(interaction.timestamp).toLocaleTimeString()}
                </div>
              </div>
              
              {interaction.context && Object.keys(interaction.context).length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {JSON.stringify(interaction.context, null, 2)}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  // Device and network info
  const DeviceInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-blue-500" />
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Type:</span>
            <Badge variant="outline">{data.rumData?.deviceType || 'Unknown'}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Memory:</span>
            <span className="text-sm">{data.metrics.deviceMemory || 'Unknown'} GB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Cores:</span>
            <span className="text-sm">{data.metrics.hardwareConcurrency || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Viewport:</span>
            <span className="text-sm">
              {data.rumData ? `${data.rumData.viewport.width}×${data.rumData.viewport.height}` : 'Unknown'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-500" />
            Network Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Connection:</span>
            <Badge variant="outline">{data.metrics.connectionType || 'Unknown'}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Effective Type:</span>
            <span className="text-sm">{data.metrics.effectiveType || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Downlink:</span>
            <span className="text-sm">{data.metrics.downlink || 'Unknown'} Mbps</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">RTT:</span>
            <span className="text-sm">{data.metrics.rtt || 'Unknown'} ms</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Performance Score
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadPerformanceData} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className={`text-3xl font-bold px-3 py-1 rounded-lg ${getScoreColor(data.score)}`}>
              {data.score}
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {data.alerts.length} alerts
              </div>
              <div className="text-xs text-muted-foreground">
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time performance monitoring and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button variant="outline" onClick={loadPerformanceData} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Overall Performance Score
          </CardTitle>
          <CardDescription>
            Calculated based on Core Web Vitals and custom metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className={`text-6xl font-bold px-6 py-3 rounded-lg ${getScoreColor(data.score)}`}>
              {data.score}
            </div>
            <div className="flex-1 ml-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Active Alerts</div>
                  <div className="text-2xl font-bold text-red-600">{data.alerts.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Bundle Size</div>
                  <div className="text-lg font-semibold">{formatBytes(data.bundleAnalytics.totalSize)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'vitals', label: 'Core Web Vitals', icon: Zap },
          { id: 'gallery', label: 'Gallery Metrics', icon: Image },
          { id: 'bundle', label: 'Bundle Analysis', icon: Package },
          { id: 'errors', label: 'Alerts & Journey', icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {selectedTab === 'overview' && (
          <>
            <CoreWebVitals />
            <DeviceInfo />
          </>
        )}

        {selectedTab === 'vitals' && (
          <>
            <CoreWebVitals />
            <Card>
              <CardHeader>
                <CardTitle>Additional Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">First Contentful Paint</div>
                    <div className="text-lg font-semibold">
                      {data.metrics.fcp ? formatDuration(data.metrics.fcp) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Time to First Byte</div>
                    <div className="text-lg font-semibold">
                      {data.metrics.ttfb ? formatDuration(data.metrics.ttfb) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">DOM Interactive</div>
                    <div className="text-lg font-semibold">
                      {data.metrics.domInteractive ? formatDuration(data.metrics.domInteractive) : 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {selectedTab === 'gallery' && <GalleryMetrics />}

        {selectedTab === 'bundle' && <BundleAnalytics />}

        {selectedTab === 'errors' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Alerts</CardTitle>
                <CardDescription>
                  Recent performance issues and budget violations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertsSection />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Journey</CardTitle>
                <CardDescription>
                  Recent user interactions and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserJourney />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default PerformanceDashboard