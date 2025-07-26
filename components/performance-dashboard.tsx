'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Globe, 
  HardDrive, 
  Info,
  MemoryStick,
  Monitor,
  TrendingUp,
  Wifi,
  X,
  Zap
} from 'lucide-react'
import { 
  PerformanceMetrics, 
  PerformanceIssue, 
  performanceMonitor,
  generatePerformanceReport 
} from '@/lib/performance-monitor'

interface PerformanceDashboardProps {
  isVisible: boolean
  onClose: () => void
  className?: string
}

export function PerformanceDashboard({ 
  isVisible, 
  onClose, 
  className = '' 
}: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [issues, setIssues] = useState<PerformanceIssue[]>([])
  const [performanceScore, setPerformanceScore] = useState(0)
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    if (!isVisible) return

    // 성능 모니터링 시작
    performanceMonitor.startMonitoring({
      onMetricsUpdate: (newMetrics) => {
        setMetrics(newMetrics)
        setPerformanceScore(performanceMonitor.getPerformanceScore())
      },
      onPerformanceIssue: (issue) => {
        setIssues(prev => {
          // 동일한 타입의 이슈는 하나만 유지 (최신 것으로 교체)
          const filtered = prev.filter(existingIssue => 
            !(existingIssue.type === issue.type && existingIssue.metric === issue.metric)
          )
          return [...filtered, issue].slice(-10) // 최대 10개 이슈만 유지
        })
      }
    })

    setIsMonitoring(true)

    return () => {
      performanceMonitor.stopMonitoring()
      setIsMonitoring(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 75) return 'secondary'
    if (score >= 50) return 'outline'
    return 'destructive'
  }

  const formatMetricValue = (value: number | undefined, unit = 'ms', decimals = 0) => {
    if (value === undefined) return 'N/A'
    return `${value.toFixed(decimals)}${unit}`
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      default: return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-background rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold">성능 모니터링 대시보드</h2>
            {isMonitoring && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                실시간 모니터링
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* 성능 스코어 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                전체 성능 점수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getScoreColor(performanceScore)}`}>
                  {performanceScore}
                </div>
                <div className="flex-1">
                  <Progress 
                    value={performanceScore} 
                    className="h-3"
                  />
                  <Badge 
                    variant={getScoreBadgeVariant(performanceScore)} 
                    className="mt-2"
                  >
                    {performanceScore >= 90 ? '우수' : 
                     performanceScore >= 75 ? '양호' : 
                     performanceScore >= 50 ? '개선필요' : '위험'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Core Web Vitals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5" />
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <MetricRow 
                    label="LCP" 
                    value={formatMetricValue(metrics.lcp)} 
                    threshold={2500}
                    currentValue={metrics.lcp}
                    description="최대 콘텐츠 렌더링"
                  />
                  <MetricRow 
                    label="FID" 
                    value={formatMetricValue(metrics.fid)} 
                    threshold={100}
                    currentValue={metrics.fid}
                    description="첫 입력 지연"
                  />
                  <MetricRow 
                    label="CLS" 
                    value={formatMetricValue(metrics.cls, '', 3)} 
                    threshold={0.1}
                    currentValue={metrics.cls}
                    description="누적 레이아웃 변화"
                  />
                  <MetricRow 
                    label="FCP" 
                    value={formatMetricValue(metrics.fcp)} 
                    threshold={1800}
                    currentValue={metrics.fcp}
                    description="첫 콘텐츠 렌더링"
                  />
                  <MetricRow 
                    label="INP" 
                    value={formatMetricValue(metrics.inp)} 
                    threshold={200}
                    currentValue={metrics.inp}
                    description="인터랙션 응답성"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 네트워크 성능 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wifi className="h-5 w-5" />
                  네트워크 성능
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <MetricRow 
                    label="TTFB" 
                    value={formatMetricValue(metrics.ttfb)} 
                    threshold={800}
                    currentValue={metrics.ttfb}
                    description="첫 바이트 응답시간"
                  />
                  {metrics.navigationTiming && (
                    <>
                      <MetricRow 
                        label="DNS" 
                        value={formatMetricValue(metrics.navigationTiming.dns)} 
                        description="DNS 조회 시간"
                      />
                      <MetricRow 
                        label="TCP" 
                        value={formatMetricValue(metrics.navigationTiming.tcp)} 
                        description="TCP 연결 시간"
                      />
                      <MetricRow 
                        label="다운로드" 
                        value={formatMetricValue(metrics.navigationTiming.download)} 
                        description="리소스 다운로드"
                      />
                    </>
                  )}
                  {metrics.connectionType && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">연결 타입:</span>
                      <span className="font-medium">{metrics.connectionType}</span>
                    </div>
                  )}
                  {metrics.effectiveType && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">유효 속도:</span>
                      <span className="font-medium">{metrics.effectiveType}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 시스템 리소스 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Monitor className="h-5 w-5" />
                  시스템 리소스
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {metrics.deviceMemory && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MemoryStick className="h-3 w-3" />
                        디바이스 메모리:
                      </span>
                      <span className="font-medium">{metrics.deviceMemory}GB</span>
                    </div>
                  )}
                  {metrics.hardwareConcurrency && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        CPU 코어:
                      </span>
                      <span className="font-medium">{metrics.hardwareConcurrency}개</span>
                    </div>
                  )}
                  <MetricRow 
                    label="첫 인터랙션" 
                    value={formatMetricValue(metrics.firstInteraction)} 
                    description="사용자 첫 반응"
                  />
                  <MetricRow 
                    label="DOM 완료" 
                    value={formatMetricValue(metrics.domInteractive)} 
                    description="DOM 인터랙티브"
                  />
                  {metrics.fontLoadTime && (
                    <MetricRow 
                      label="폰트 로딩" 
                      value={formatMetricValue(metrics.fontLoadTime)} 
                      description="웹폰트 로딩 시간"
                    />
                  )}
                  {metrics.imageLoadTime && (
                    <MetricRow 
                      label="이미지 로딩" 
                      value={formatMetricValue(metrics.imageLoadTime)} 
                      description="이미지 로딩 시간"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 성능 이슈 */}
          {issues.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  성능 이슈 및 권장사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {issues.map((issue, index) => (
                    <div 
                      key={`${issue.type}-${issue.metric}-${index}`}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {issue.metric.toUpperCase()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(issue.value)}{issue.metric === 'cls' ? '' : 'ms'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {issue.suggestion}
                        </p>
                        {issue.resource && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            리소스: {issue.resource}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                const report = generatePerformanceReport()
                console.log('📊 Performance Report:', report)
                alert(`성능 리포트가 콘솔에 출력되었습니다.\n스코어: ${report.score}/100`)
              }}
            >
              <HardDrive className="h-4 w-4 mr-2" />
              리포트 생성
            </Button>
            <div className="text-xs text-muted-foreground">
              실시간 성능 모니터링 • 마지막 업데이트: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 메트릭 행 컴포넌트
function MetricRow({ 
  label, 
  value, 
  threshold, 
  currentValue, 
  description 
}: {
  label: string
  value: string
  threshold?: number
  currentValue?: number
  description?: string
}) {
  const getStatusColor = () => {
    if (!threshold || currentValue === undefined) return 'text-muted-foreground'
    
    if (label === 'CLS') {
      if (currentValue <= 0.1) return 'text-green-600'
      if (currentValue <= 0.25) return 'text-yellow-600'
      return 'text-red-600'
    }
    
    if (currentValue <= threshold) return 'text-green-600'
    if (currentValue <= threshold * 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex justify-between items-center text-sm">
      <div className="flex flex-col">
        <span className="font-medium">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <span className={`font-medium ${getStatusColor()}`}>
        {value}
      </span>
    </div>
  )
}

// 플로팅 성능 모니터 버튼
export function PerformanceFloatingButton({ 
  onClick 
}: { 
  onClick: () => void 
}) {
  const [score, setScore] = useState(0)

  useEffect(() => {
    const updateScore = () => {
      setScore(performanceMonitor.getPerformanceScore())
    }

    // 5초마다 스코어 업데이트
    const interval = setInterval(updateScore, 5000)
    updateScore() // 초기 업데이트

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-4 right-4 z-40 rounded-full w-14 h-14 shadow-lg ${
        score >= 90 ? 'bg-green-500 hover:bg-green-600' :
        score >= 75 ? 'bg-yellow-500 hover:bg-yellow-600' :
        score >= 50 ? 'bg-orange-500 hover:bg-orange-600' :
        'bg-red-500 hover:bg-red-600'
      }`}
      title={`성능 점수: ${score}/100`}
    >
      <div className="flex flex-col items-center">
        <Activity className="h-4 w-4 text-white" />
        <span className="text-xs text-white font-bold">{score}</span>
      </div>
    </Button>
  )
}