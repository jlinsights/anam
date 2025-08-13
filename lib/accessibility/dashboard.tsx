/**
 * Accessibility Compliance Dashboard
 * Real-time monitoring and reporting for WCAG 2.1 AA compliance
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Keyboard, 
  Palette, 
  Focus,
  BarChart3,
  Download,
  RefreshCw,
  Shield,
  Users,
  Monitor
} from 'lucide-react'
import { AccessibilityAuditReport, AccessibilityTestResult } from './index'

interface AccessibilityDashboardProps {
  initialReport?: AccessibilityAuditReport
  onRunAudit?: () => Promise<AccessibilityAuditReport>
  onExportReport?: (report: AccessibilityAuditReport) => void
  className?: string
}

interface AccessibilityMetrics {
  totalScore: number
  wcagLevel: 'A' | 'AA' | 'AAA'
  violations: number
  passes: number
  colorContrastIssues: number
  keyboardIssues: number
  screenReaderIssues: number
  focusIssues: number
}

export function AccessibilityDashboard({
  initialReport,
  onRunAudit,
  onExportReport,
  className = ''
}: AccessibilityDashboardProps) {
  const [report, setReport] = useState<AccessibilityAuditReport | null>(initialReport || null)
  const [isRunning, setIsRunning] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('overview')

  const metrics = useMemo((): AccessibilityMetrics | null => {
    if (!report) return null

    return {
      totalScore: report.overview.totalScore,
      wcagLevel: report.overview.wcagLevel,
      violations: report.summary.violations,
      passes: report.summary.passes,
      colorContrastIssues: report.summary.colorContrastIssues,
      keyboardIssues: report.summary.keyboardIssues,
      screenReaderIssues: report.summary.screenReaderIssues,
      focusIssues: report.sections.focusManagement.filter(f => f.issues.length > 0).length
    }
  }, [report])

  const handleRunAudit = async () => {
    if (!onRunAudit) return

    setIsRunning(true)
    try {
      const newReport = await onRunAudit()
      setReport(newReport)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to run accessibility audit:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleExportReport = () => {
    if (report && onExportReport) {
      onExportReport(report)
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 90) return 'default'
    if (score >= 70) return 'secondary'
    return 'destructive'
  }

  const getWCAGLevelColor = (level: 'A' | 'AA' | 'AAA'): string => {
    switch (level) {
      case 'AAA': return 'text-green-600'
      case 'AA': return 'text-blue-600'
      case 'A': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const renderOverview = () => {
    if (!metrics || !report) return null

    return (
      <div className="space-y-6">
        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.totalScore)}`}>
                {metrics.totalScore}%
              </div>
              <Progress value={metrics.totalScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WCAG Level</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getWCAGLevelColor(metrics.wcagLevel)}`}>
                {metrics.wcagLevel}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                WCAG 2.1 Compliance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Violations</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {metrics.violations}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Issues found
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passes</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.passes}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tests passed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Color Contrast</CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {metrics.colorContrastIssues}
                </span>
                <Badge variant={metrics.colorContrastIssues === 0 ? 'default' : 'destructive'}>
                  {metrics.colorContrastIssues === 0 ? 'Pass' : 'Issues'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keyboard Nav</CardTitle>
              <Keyboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {metrics.keyboardIssues}
                </span>
                <Badge variant={metrics.keyboardIssues === 0 ? 'default' : 'destructive'}>
                  {metrics.keyboardIssues === 0 ? 'Pass' : 'Issues'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Screen Reader</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {metrics.screenReaderIssues}
                </span>
                <Badge variant={metrics.screenReaderIssues === 0 ? 'default' : 'destructive'}>
                  {metrics.screenReaderIssues === 0 ? 'Pass' : 'Issues'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Focus Management</CardTitle>
              <Focus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {metrics.focusIssues}
                </span>
                <Badge variant={metrics.focusIssues === 0 ? 'default' : 'destructive'}>
                  {metrics.focusIssues === 0 ? 'Pass' : 'Issues'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Violations */}
        {report.sections.core.violations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Recent Violations
              </CardTitle>
              <CardDescription>
                Critical accessibility issues that need immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.sections.core.violations.slice(0, 5).map((violation, index) => (
                  <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={
                          violation.impact === 'critical' ? 'destructive' :
                          violation.impact === 'serious' ? 'destructive' :
                          violation.impact === 'moderate' ? 'secondary' : 'default'
                        }>
                          {violation.impact}
                        </Badge>
                        <span className="font-medium">{violation.id}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {violation.description}
                      </p>
                      <p className="text-xs text-blue-600">
                        {violation.nodes.length} element(s) affected
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(violation.helpUrl, '_blank')}
                    >
                      Learn More
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Prioritized improvements to enhance accessibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        rec.priority === 'critical' ? 'destructive' :
                        rec.priority === 'high' ? 'destructive' :
                        rec.priority === 'medium' ? 'secondary' : 'default'
                      }>
                        {rec.priority}
                      </Badge>
                      <span className="font-medium">{rec.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {rec.description}
                    </p>
                    <p className="text-sm font-medium">
                      Solution: {rec.solution}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderViolations = () => {
    if (!report) return null

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>All Violations</CardTitle>
            <CardDescription>
              Complete list of accessibility violations found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {report.sections.core.violations.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-600 mb-2">
                  No Violations Found!
                </h3>
                <p className="text-muted-foreground">
                  Your application meets WCAG 2.1 AA accessibility standards.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {report.sections.core.violations.map((violation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          violation.impact === 'critical' ? 'destructive' :
                          violation.impact === 'serious' ? 'destructive' :
                          violation.impact === 'moderate' ? 'secondary' : 'default'
                        }>
                          {violation.impact}
                        </Badge>
                        <h4 className="font-medium">{violation.id}</h4>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(violation.helpUrl, '_blank')}
                      >
                        Help
                      </Button>
                    </div>
                    
                    <p className="text-sm mb-3">{violation.description}</p>
                    <p className="text-sm font-medium mb-2">Fix: {violation.help}</p>
                    
                    <div className="bg-muted rounded p-3">
                      <h5 className="text-sm font-medium mb-2">
                        Affected Elements ({violation.nodes.length})
                      </h5>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {violation.nodes.slice(0, 3).map((node, nodeIndex) => (
                          <div key={nodeIndex} className="text-xs">
                            <code className="bg-background px-2 py-1 rounded">
                              {node.target.join(', ')}
                            </code>
                            {node.failureSummary && (
                              <p className="text-muted-foreground mt-1">
                                {node.failureSummary}
                              </p>
                            )}
                          </div>
                        ))}
                        {violation.nodes.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            ... and {violation.nodes.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderColorContrast = () => {
    if (!report) return null

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Contrast Analysis
            </CardTitle>
            <CardDescription>
              WCAG 2.1 AA requires 4.5:1 contrast ratio for normal text, 3:1 for large text
            </CardDescription>
          </CardHeader>
          <CardContent>
            {report.sections.colorContrast.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No color contrast issues detected
              </p>
            ) : (
              <div className="space-y-3">
                {report.sections.colorContrast.map((contrast, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: contrast.foreground }}
                          title={`Foreground: ${contrast.foreground}`}
                        />
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: contrast.background }}
                          title={`Background: ${contrast.background}`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Ratio: {contrast.ratio.toFixed(2)}:1
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contrast.size} text
                        </p>
                      </div>
                    </div>
                    <Badge variant={contrast.passes ? 'default' : 'destructive'}>
                      {contrast.level}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!report && !isRunning) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              Accessibility Dashboard
            </CardTitle>
            <CardDescription>
              Run a comprehensive accessibility audit to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleRunAudit} disabled={!onRunAudit}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Run Accessibility Audit
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accessibility Dashboard</h1>
          <p className="text-muted-foreground">
            WCAG 2.1 AA Compliance Monitoring
            {lastUpdated && (
              <span className="ml-2">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRunAudit} 
            disabled={isRunning || !onRunAudit}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Refresh'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportReport}
            disabled={!report || !onExportReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isRunning && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">Running Accessibility Audit...</p>
              <p className="text-muted-foreground">This may take a few moments</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      {report && (
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {[
            { key: 'overview', label: 'Overview', icon: Monitor },
            { key: 'violations', label: 'Violations', icon: XCircle },
            { key: 'contrast', label: 'Color Contrast', icon: Palette }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      )}

      {/* Content */}
      {report && (
        <div>
          {selectedCategory === 'overview' && renderOverview()}
          {selectedCategory === 'violations' && renderViolations()}
          {selectedCategory === 'contrast' && renderColorContrast()}
        </div>
      )}
    </div>
  )
}

export default AccessibilityDashboard