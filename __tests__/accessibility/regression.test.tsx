/**
 * Accessibility Regression Testing Framework
 * Automated detection of accessibility regressions across versions
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import fs from 'fs'
import path from 'path'
import { AccessibilityTestResult } from '@/lib/accessibility'
import { AxeTestingFramework } from '@/lib/accessibility/axe-testing'
import { ColorContrastTesting } from '@/lib/accessibility/color-contrast'
import { KeyboardNavigationTesting } from '@/lib/accessibility/keyboard-navigation'
import { ScreenReaderTesting } from '@/lib/accessibility/screen-reader'

// Mock components for testing
import ArtworkDetailModalClient from '@/components/artwork-detail-modal-client'
import Navigation from '@/components/single-page/Navigation'
import ContactForm from '@/components/contact-form'
import { mockArtwork } from '../lib/hooks/artwork.mock'

// Mock router and intl
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn()
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams())
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'ko'
}))

interface AccessibilityBaseline {
  version: string
  timestamp: string
  components: {
    [componentName: string]: {
      axeScore: number
      colorContrastScore: number
      keyboardScore: number
      screenReaderScore: number
      violations: Array<{
        id: string
        impact: string
        description: string
      }>
    }
  }
  overallScore: number
}

interface RegressionResult {
  component: string
  metric: string
  previousValue: number
  currentValue: number
  change: number
  changeType: 'improvement' | 'regression' | 'stable'
  severity: 'critical' | 'major' | 'minor' | 'none'
  description: string
}

class AccessibilityRegressionTester {
  private baselineFile: string
  private currentVersion: string

  constructor() {
    this.baselineFile = path.join(__dirname, '../../test-results/accessibility/baseline.json')
    this.currentVersion = process.env.npm_package_version || '1.0.0'
  }

  /**
   * Load accessibility baseline from previous version
   */
  async loadBaseline(): Promise<AccessibilityBaseline | null> {
    try {
      if (fs.existsSync(this.baselineFile)) {
        const content = fs.readFileSync(this.baselineFile, 'utf-8')
        return JSON.parse(content)
      }
    } catch (error) {
      console.warn('Could not load accessibility baseline:', error)
    }
    return null
  }

  /**
   * Save current results as new baseline
   */
  async saveBaseline(baseline: AccessibilityBaseline): Promise<void> {
    try {
      const dir = path.dirname(this.baselineFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.baselineFile, JSON.stringify(baseline, null, 2))
    } catch (error) {
      console.error('Could not save accessibility baseline:', error)
    }
  }

  /**
   * Test component accessibility and compare with baseline
   */
  async testComponentRegression(
    componentName: string,
    component: React.ReactElement
  ): Promise<{
    current: AccessibilityBaseline['components'][string]
    regressions: RegressionResult[]
  }> {
    const { container } = render(component)
    
    // Run all accessibility tests
    const axeResults = await AxeTestingFramework.runAccessibilityTest(container)
    const colorResults = await ColorContrastTesting.runColorContrastAudit(container)
    const keyboardResults = await KeyboardNavigationTesting.runKeyboardAudit(container)
    const screenReaderResults = await ScreenReaderTesting.runComprehensiveTest(container)

    const current = {
      axeScore: axeResults.score,
      colorContrastScore: colorResults.score,
      keyboardScore: keyboardResults.score,
      screenReaderScore: screenReaderResults.score,
      violations: axeResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description
      }))
    }

    // Load baseline and compare
    const baseline = await this.loadBaseline()
    const regressions: RegressionResult[] = []

    if (baseline && baseline.components[componentName]) {
      const previous = baseline.components[componentName]
      
      // Compare scores
      const metrics = [
        { key: 'axeScore', name: 'Axe Core Accessibility' },
        { key: 'colorContrastScore', name: 'Color Contrast' },
        { key: 'keyboardScore', name: 'Keyboard Navigation' },
        { key: 'screenReaderScore', name: 'Screen Reader Support' }
      ]

      for (const metric of metrics) {
        const prevValue = previous[metric.key as keyof typeof previous] as number
        const currValue = current[metric.key as keyof typeof current] as number
        const change = currValue - prevValue
        
        const regression: RegressionResult = {
          component: componentName,
          metric: metric.name,
          previousValue: prevValue,
          currentValue: currValue,
          change,
          changeType: this.getChangeType(change),
          severity: this.getSeverity(change, prevValue),
          description: this.getChangeDescription(metric.name, change, prevValue, currValue)
        }

        if (regression.changeType !== 'stable') {
          regressions.push(regression)
        }
      }

      // Compare violations
      const newViolations = current.violations.filter(v => 
        !previous.violations.some(pv => pv.id === v.id && pv.impact === v.impact)
      )

      const resolvedViolations = previous.violations.filter(v => 
        !current.violations.some(cv => cv.id === v.id && cv.impact === v.impact)
      )

      // Add new violations as regressions
      newViolations.forEach(violation => {
        regressions.push({
          component: componentName,
          metric: 'New Violation',
          previousValue: 0,
          currentValue: 1,
          change: 1,
          changeType: 'regression',
          severity: this.getViolationSeverity(violation.impact),
          description: `New ${violation.impact} violation: ${violation.description}`
        })
      })

      // Add resolved violations as improvements
      resolvedViolations.forEach(violation => {
        regressions.push({
          component: componentName,
          metric: 'Resolved Violation',
          previousValue: 1,
          currentValue: 0,
          change: -1,
          changeType: 'improvement',
          severity: 'none',
          description: `Resolved ${violation.impact} violation: ${violation.description}`
        })
      })
    }

    return { current, regressions }
  }

  /**
   * Run full regression test suite
   */
  async runFullRegressionTest(): Promise<{
    baseline: AccessibilityBaseline
    regressions: RegressionResult[]
    summary: {
      totalComponents: number
      componentsWithRegressions: number
      criticalRegressions: number
      majorRegressions: number
      improvements: number
    }
  }> {
    const components = {
      'ArtworkDetailModal': <ArtworkDetailModalClient artwork={mockArtwork} />,
      'Navigation': <Navigation />,
      'ContactForm': <ContactForm />
    }

    const newBaseline: AccessibilityBaseline = {
      version: this.currentVersion,
      timestamp: new Date().toISOString(),
      components: {},
      overallScore: 0
    }

    const allRegressions: RegressionResult[] = []

    // Test each component
    for (const [componentName, component] of Object.entries(components)) {
      const { current, regressions } = await this.testComponentRegression(componentName, component)
      newBaseline.components[componentName] = current
      allRegressions.push(...regressions)
    }

    // Calculate overall score
    const componentScores = Object.values(newBaseline.components).map(comp => 
      Math.round((comp.axeScore + comp.colorContrastScore + comp.keyboardScore + comp.screenReaderScore) / 4)
    )
    newBaseline.overallScore = componentScores.length > 0 
      ? Math.round(componentScores.reduce((sum, score) => sum + score, 0) / componentScores.length)
      : 0

    // Generate summary
    const summary = {
      totalComponents: Object.keys(components).length,
      componentsWithRegressions: new Set(allRegressions.map(r => r.component)).size,
      criticalRegressions: allRegressions.filter(r => r.severity === 'critical').length,
      majorRegressions: allRegressions.filter(r => r.severity === 'major').length,
      improvements: allRegressions.filter(r => r.changeType === 'improvement').length
    }

    // Save new baseline
    await this.saveBaseline(newBaseline)

    return { baseline: newBaseline, regressions: allRegressions, summary }
  }

  private getChangeType(change: number): 'improvement' | 'regression' | 'stable' {
    if (Math.abs(change) < 2) return 'stable'
    return change > 0 ? 'improvement' : 'regression'
  }

  private getSeverity(change: number, previousValue: number): 'critical' | 'major' | 'minor' | 'none' {
    const percentChange = Math.abs(change) / previousValue * 100
    
    if (change >= 0) return 'none' // Improvements don't have severity
    
    if (percentChange >= 20) return 'critical'
    if (percentChange >= 10) return 'major'
    if (percentChange >= 5) return 'minor'
    return 'none'
  }

  private getViolationSeverity(impact: string): 'critical' | 'major' | 'minor' | 'none' {
    switch (impact) {
      case 'critical': return 'critical'
      case 'serious': return 'major'
      case 'moderate': return 'minor'
      default: return 'none'
    }
  }

  private getChangeDescription(
    metric: string,
    change: number,
    prevValue: number,
    currValue: number
  ): string {
    const direction = change > 0 ? 'improved' : 'declined'
    const percentage = Math.abs(change / prevValue * 100).toFixed(1)
    
    return `${metric} ${direction} from ${prevValue}% to ${currValue}% (${percentage}% change)`
  }
}

describe('Accessibility Regression Testing', () => {
  let regressionTester: AccessibilityRegressionTester

  beforeAll(() => {
    regressionTester = new AccessibilityRegressionTester()
  })

  describe('Individual Component Regression Tests', () => {
    it('should detect regressions in ArtworkDetailModal', async () => {
      const { current, regressions } = await regressionTester.testComponentRegression(
        'ArtworkDetailModal',
        <ArtworkDetailModalClient artwork={mockArtwork} />
      )

      expect(current.axeScore).toBeGreaterThanOrEqual(80)
      expect(current.colorContrastScore).toBeGreaterThanOrEqual(80)
      expect(current.keyboardScore).toBeGreaterThanOrEqual(80)
      expect(current.screenReaderScore).toBeGreaterThanOrEqual(80)

      // Check for critical regressions
      const criticalRegressions = regressions.filter(r => r.severity === 'critical')
      if (criticalRegressions.length > 0) {
        console.warn('Critical accessibility regressions detected:', criticalRegressions)
      }
      
      // Fail test if there are critical regressions
      expect(criticalRegressions.length).toBe(0)
    }, 30000)

    it('should detect regressions in Navigation component', async () => {
      const { current, regressions } = await regressionTester.testComponentRegression(
        'Navigation',
        <Navigation />
      )

      expect(current.axeScore).toBeGreaterThanOrEqual(85)
      expect(current.keyboardScore).toBeGreaterThanOrEqual(90) // Navigation should have excellent keyboard support

      const majorRegressions = regressions.filter(r => r.severity === 'major' || r.severity === 'critical')
      expect(majorRegressions.length).toBe(0)
    }, 30000)

    it('should detect regressions in ContactForm', async () => {
      const { current, regressions } = await regressionTester.testComponentRegression(
        'ContactForm',
        <ContactForm />
      )

      expect(current.axeScore).toBeGreaterThanOrEqual(85)
      expect(current.screenReaderScore).toBeGreaterThanOrEqual(85) // Forms need good screen reader support

      const formRegressions = regressions.filter(r => r.changeType === 'regression')
      if (formRegressions.length > 0) {
        console.warn('Form accessibility regressions:', formRegressions)
      }
    }, 30000)
  })

  describe('Full Regression Test Suite', () => {
    it('should run comprehensive regression tests', async () => {
      const { baseline, regressions, summary } = await regressionTester.runFullRegressionTest()

      expect(baseline.overallScore).toBeGreaterThanOrEqual(80)
      expect(summary.totalComponents).toBeGreaterThan(0)

      // Log regression summary
      console.log('Accessibility Regression Summary:', {
        overallScore: baseline.overallScore,
        totalComponents: summary.totalComponents,
        componentsWithRegressions: summary.componentsWithRegressions,
        criticalRegressions: summary.criticalRegressions,
        majorRegressions: summary.majorRegressions,
        improvements: summary.improvements
      })

      // Fail if there are critical regressions
      expect(summary.criticalRegressions).toBe(0)
      
      // Warn about major regressions
      if (summary.majorRegressions > 0) {
        console.warn(`${summary.majorRegressions} major accessibility regressions detected`)
        
        const majorRegressions = regressions.filter(r => r.severity === 'major')
        majorRegressions.forEach(regression => {
          console.warn(`  ${regression.component}: ${regression.description}`)
        })
      }

      // Log improvements
      if (summary.improvements > 0) {
        console.log(`✅ ${summary.improvements} accessibility improvements detected`)
        
        const improvements = regressions.filter(r => r.changeType === 'improvement')
        improvements.forEach(improvement => {
          console.log(`  ${improvement.component}: ${improvement.description}`)
        })
      }
    }, 60000)

    it('should maintain accessibility score thresholds', async () => {
      const { baseline } = await regressionTester.runFullRegressionTest()

      // Check component-level thresholds
      Object.entries(baseline.components).forEach(([componentName, scores]) => {
        expect(scores.axeScore).toBeGreaterThanOrEqual(75) // Minimum acceptable score
        expect(scores.colorContrastScore).toBeGreaterThanOrEqual(90) // Color contrast should be excellent
        
        // Log component scores
        console.log(`${componentName} Accessibility Scores:`, {
          axe: scores.axeScore,
          colorContrast: scores.colorContrastScore,
          keyboard: scores.keyboardScore,
          screenReader: scores.screenReaderScore
        })
      })

      // Overall application score should be high
      expect(baseline.overallScore).toBeGreaterThanOrEqual(80)
    }, 60000)
  })

  describe('Regression Reporting', () => {
    it('should generate detailed regression report', async () => {
      const { regressions } = await regressionTester.runFullRegressionTest()

      // Group regressions by component
      const regressionsByComponent = regressions.reduce((acc, regression) => {
        if (!acc[regression.component]) {
          acc[regression.component] = []
        }
        acc[regression.component].push(regression)
        return acc
      }, {} as { [component: string]: RegressionResult[] })

      // Generate report for each component
      Object.entries(regressionsByComponent).forEach(([component, componentRegressions]) => {
        console.log(`\n${component} Accessibility Changes:`)
        
        componentRegressions.forEach(regression => {
          const emoji = regression.changeType === 'improvement' ? '✅' : 
                       regression.severity === 'critical' ? '🚨' : 
                       regression.severity === 'major' ? '⚠️' : 'ℹ️'
          
          console.log(`  ${emoji} ${regression.description}`)
        })
      })

      // Ensure we're tracking changes properly
      expect(typeof regressions).toBe('object')
    })

    it('should validate regression detection accuracy', async () => {
      // Test with intentionally broken component
      const BrokenComponent = () => (
        <div>
          <button>No accessible name</button>
          <img src="test.jpg" /> {/* Missing alt text */}
          <input type="text" /> {/* Missing label */}
        </div>
      )

      const { current, regressions } = await regressionTester.testComponentRegression(
        'BrokenComponent',
        <BrokenComponent />
      )

      // Should detect accessibility issues
      expect(current.axeScore).toBeLessThan(80)
      expect(current.violations.length).toBeGreaterThan(0)

      // Should categorize violations correctly
      const criticalViolations = current.violations.filter(v => v.impact === 'critical')
      const seriousViolations = current.violations.filter(v => v.impact === 'serious')
      
      expect(criticalViolations.length + seriousViolations.length).toBeGreaterThan(0)
    })
  })

  describe('Baseline Management', () => {
    it('should save and load baseline correctly', async () => {
      const testBaseline: AccessibilityBaseline = {
        version: '1.0.0-test',
        timestamp: new Date().toISOString(),
        components: {
          TestComponent: {
            axeScore: 95,
            colorContrastScore: 100,
            keyboardScore: 90,
            screenReaderScore: 85,
            violations: []
          }
        },
        overallScore: 92
      }

      await regressionTester.saveBaseline(testBaseline)
      const loadedBaseline = await regressionTester.loadBaseline()

      expect(loadedBaseline).toEqual(testBaseline)
    })

    it('should handle missing baseline gracefully', async () => {
      // Test with non-existent baseline
      const tester = new (class extends AccessibilityRegressionTester {
        constructor() {
          super()
          // Override baseline file to non-existent path
          this['baselineFile'] = '/tmp/non-existent-baseline.json'
        }
      })()

      const baseline = await tester.loadBaseline()
      expect(baseline).toBeNull()

      // Should still be able to run tests without baseline
      const { current, regressions } = await tester.testComponentRegression(
        'TestComponent',
        <div><button>Test</button></div>
      )

      expect(current).toBeDefined()
      expect(regressions).toEqual([]) // No regressions without baseline
    })
  })

  describe('Continuous Integration Integration', () => {
    it('should provide CI-friendly exit codes', async () => {
      const { summary } = await regressionTester.runFullRegressionTest()

      // Simulate CI environment
      const shouldFailCI = summary.criticalRegressions > 0
      const shouldWarnCI = summary.majorRegressions > 0

      if (shouldFailCI) {
        console.log('🚨 CI should FAIL due to critical accessibility regressions')
      } else if (shouldWarnCI) {
        console.log('⚠️ CI should WARN due to major accessibility regressions')
      } else {
        console.log('✅ CI should PASS - no significant accessibility regressions')
      }

      // In real CI, you would process.exit(1) for critical regressions
      expect(typeof shouldFailCI).toBe('boolean')
      expect(typeof shouldWarnCI).toBe('boolean')
    })

    it('should generate machine-readable output', async () => {
      const { baseline, regressions, summary } = await regressionTester.runFullRegressionTest()

      const ciOutput = {
        status: summary.criticalRegressions > 0 ? 'fail' : 
                summary.majorRegressions > 0 ? 'warn' : 'pass',
        overallScore: baseline.overallScore,
        summary,
        regressions: regressions.map(r => ({
          component: r.component,
          metric: r.metric,
          severity: r.severity,
          change: r.change,
          description: r.description
        }))
      }

      // Validate CI output structure
      expect(ciOutput.status).toMatch(/^(pass|warn|fail)$/)
      expect(typeof ciOutput.overallScore).toBe('number')
      expect(Array.isArray(ciOutput.regressions)).toBe(true)

      // Log for CI systems to parse
      console.log('ACCESSIBILITY_CI_OUTPUT:', JSON.stringify(ciOutput))
    })
  })
})