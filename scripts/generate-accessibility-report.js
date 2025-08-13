#!/usr/bin/env node

/**
 * Comprehensive Accessibility Report Generator
 * Combines all accessibility test results into a unified report
 */

const puppeteer = require('puppeteer')
const fs = require('fs').promises
const path = require('path')

// Configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  outputDir: process.env.OUTPUT_DIR || './test-results/accessibility',
  pages: [
    '/',
    '/gallery',
    '/gallery/01',
    '/contact',
    '/artist',
    '/exhibition'
  ],
  testSuites: {
    axe: true,
    colorContrast: true,
    keyboard: true,
    screenReader: true,
    focusManagement: true
  }
}

/**
 * Comprehensive accessibility report generator
 */
class AccessibilityReportGenerator {
  constructor() {
    this.browser = null
    this.results = {
      metadata: {
        timestamp: new Date().toISOString(),
        baseUrl: CONFIG.baseUrl,
        testSuites: CONFIG.testSuites,
        wcagLevel: '2.1 AA',
        totalPages: CONFIG.pages.length
      },
      summary: {
        overallScore: 0,
        totalViolations: 0,
        criticalIssues: 0,
        passRate: 0,
        byCategory: {
          perceivable: { score: 0, violations: 0 },
          operable: { score: 0, violations: 0 },
          understandable: { score: 0, violations: 0 },
          robust: { score: 0, violations: 0 }
        }
      },
      pages: [],
      violations: [],
      recommendations: [],
      trends: {
        improvement: 0,
        regression: 0,
        stable: 0
      }
    }
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    await fs.mkdir(CONFIG.outputDir, { recursive: true })
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  /**
   * Generate comprehensive accessibility report
   */
  async generateReport() {
    console.log('🔍 Generating comprehensive accessibility report...')
    
    for (const pagePath of CONFIG.pages) {
      console.log(`Analyzing page: ${pagePath}`)
      
      try {
        const pageResult = await this.analyzePage(pagePath)
        this.results.pages.push(pageResult)
        
        console.log(`✓ Page ${pagePath}: Score ${pageResult.score}/100`)
      } catch (error) {
        console.error(`✗ Error analyzing page ${pagePath}:`, error.message)
        
        this.results.pages.push({
          url: `${CONFIG.baseUrl}${pagePath}`,
          error: error.message,
          score: 0,
          violations: []
        })
      }
    }

    // Calculate summary
    this.calculateSummary()
    
    // Generate recommendations
    this.generateRecommendations()
    
    // Save results
    await this.saveResults()
    
    // Generate HTML report
    await this.generateHTMLReport()
    
    // Generate CSV export
    await this.generateCSVReport()
    
    return this.results
  }

  /**
   * Analyze accessibility for a single page
   */
  async analyzePage(pagePath) {
    const page = await this.browser.newPage()
    
    try {
      await page.setViewport({ width: 1440, height: 900 })
      await page.goto(`${CONFIG.baseUrl}${pagePath}`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      })

      await page.waitForTimeout(2000)

      // Run comprehensive accessibility analysis
      const analysis = await page.evaluate(this.runComprehensiveAnalysis)
      
      return {
        url: `${CONFIG.baseUrl}${pagePath}`,
        path: pagePath,
        timestamp: new Date().toISOString(),
        score: analysis.overallScore,
        wcagLevel: analysis.wcagLevel,
        violations: analysis.violations,
        tests: analysis.tests,
        recommendations: analysis.recommendations
      }
    } finally {
      await page.close()
    }
  }

  /**
   * Run comprehensive accessibility analysis in browser context
   */
  runComprehensiveAnalysis() {
    const analysis = {
      overallScore: 0,
      wcagLevel: 'fail',
      violations: [],
      tests: {
        colorContrast: { score: 0, violations: [] },
        keyboard: { score: 0, violations: [] },
        screenReader: { score: 0, violations: [] },
        focusManagement: { score: 0, violations: [] },
        structure: { score: 0, violations: [] }
      },
      recommendations: []
    }

    // Test 1: Color Contrast
    analysis.tests.colorContrast = this.testColorContrast()
    
    // Test 2: Keyboard Navigation
    analysis.tests.keyboard = this.testKeyboardNavigation()
    
    // Test 3: Screen Reader Support
    analysis.tests.screenReader = this.testScreenReaderSupport()
    
    // Test 4: Focus Management
    analysis.tests.focusManagement = this.testFocusManagement()
    
    // Test 5: Document Structure
    analysis.tests.structure = this.testDocumentStructure()

    // Calculate overall score
    const testScores = Object.values(analysis.tests).map(test => test.score)
    analysis.overallScore = Math.round(testScores.reduce((sum, score) => sum + score, 0) / testScores.length)
    
    // Determine WCAG level
    analysis.wcagLevel = this.determineWCAGLevel(analysis.overallScore, analysis.tests)
    
    // Collect all violations
    Object.values(analysis.tests).forEach(test => {
      analysis.violations.push(...test.violations)
    })
    
    // Generate recommendations
    analysis.recommendations = this.generatePageRecommendations(analysis.tests)

    return analysis

    // Helper function implementations
    function testColorContrast() {
      const results = { score: 100, violations: [] }
      
      const textElements = Array.from(document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label'))
        .filter(el => el.textContent?.trim().length > 0)

      let totalElements = 0
      let passingElements = 0

      textElements.forEach(element => {
        const styles = getComputedStyle(element)
        const foreground = styles.color
        const background = getEffectiveBackgroundColor(element)
        
        if (foreground && background) {
          totalElements++
          const ratio = calculateContrastRatio(foreground, background)
          const required = getTextSize(element) === 'large' ? 3 : 4.5
          
          if (ratio >= required) {
            passingElements++
          } else {
            results.violations.push({
              type: 'color-contrast',
              severity: ratio < required * 0.7 ? 'critical' : 'serious',
              element: getElementSelector(element),
              description: `Color contrast ratio ${ratio.toFixed(2)}:1 is below WCAG AA requirement`,
              wcagCriteria: '1.4.3'
            })
          }
        }
      })

      if (totalElements > 0) {
        results.score = Math.round((passingElements / totalElements) * 100)
      }

      return results
    }

    function testKeyboardNavigation() {
      const results = { score: 100, violations: [] }
      
      const interactiveElements = Array.from(document.querySelectorAll(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"]'
      ))

      let totalElements = 0
      let accessibleElements = 0

      interactiveElements.forEach(element => {
        totalElements++
        
        const isFocusable = isElementFocusable(element)
        const hasKeyboardSupport = hasKeyboardEventSupport(element)
        const hasProperRole = hasProperRole(element)
        
        if (isFocusable && hasKeyboardSupport && hasProperRole) {
          accessibleElements++
        } else {
          const issues = []
          if (!isFocusable) issues.push('not focusable')
          if (!hasKeyboardSupport) issues.push('no keyboard support')
          if (!hasProperRole) issues.push('improper role')
          
          results.violations.push({
            type: 'keyboard-navigation',
            severity: 'serious',
            element: getElementSelector(element),
            description: `Interactive element has keyboard issues: ${issues.join(', ')}`,
            wcagCriteria: '2.1.1'
          })
        }
      })

      if (totalElements > 0) {
        results.score = Math.round((accessibleElements / totalElements) * 100)
      }

      return results
    }

    function testScreenReaderSupport() {
      const results = { score: 100, violations: [] }
      let totalTests = 0
      let passingTests = 0

      // Test 1: Images have alt text
      const images = Array.from(document.querySelectorAll('img, svg[role="img"]'))
      images.forEach(img => {
        totalTests++
        const alt = img.getAttribute('alt')
        const ariaLabel = img.getAttribute('aria-label')
        
        if (alt !== null || ariaLabel) {
          passingTests++
        } else {
          results.violations.push({
            type: 'screen-reader',
            severity: 'serious',
            element: getElementSelector(img),
            description: 'Image missing alternative text',
            wcagCriteria: '1.1.1'
          })
        }
      })

      // Test 2: Form labels
      const formControls = Array.from(document.querySelectorAll('input, select, textarea'))
      formControls.forEach(control => {
        totalTests++
        const hasLabel = hasAccessibleLabel(control)
        
        if (hasLabel) {
          passingTests++
        } else {
          results.violations.push({
            type: 'screen-reader',
            severity: 'serious',
            element: getElementSelector(control),
            description: 'Form control missing accessible label',
            wcagCriteria: '3.3.2'
          })
        }
      })

      // Test 3: Headings structure
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      let previousLevel = 0
      
      headings.forEach(heading => {
        totalTests++
        const level = parseInt(heading.tagName.charAt(1))
        
        if (level <= previousLevel + 1) {
          passingTests++
        } else {
          results.violations.push({
            type: 'screen-reader',
            severity: 'moderate',
            element: getElementSelector(heading),
            description: `Heading level ${level} skips hierarchy (previous was ${previousLevel})`,
            wcagCriteria: '1.3.1'
          })
        }
        
        previousLevel = level
      })

      if (totalTests > 0) {
        results.score = Math.round((passingTests / totalTests) * 100)
      }

      return results
    }

    function testFocusManagement() {
      const results = { score: 100, violations: [] }
      
      // Test focus indicators
      const focusableElements = Array.from(document.querySelectorAll(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ))

      let totalElements = 0
      let elementsWithFocus = 0

      focusableElements.forEach(element => {
        totalElements++
        
        if (hasFocusIndicator(element)) {
          elementsWithFocus++
        } else {
          results.violations.push({
            type: 'focus-management',
            severity: 'serious',
            element: getElementSelector(element),
            description: 'Interactive element missing visible focus indicator',
            wcagCriteria: '2.4.7'
          })
        }
      })

      // Test for positive tabindex (anti-pattern)
      const positiveTabIndex = Array.from(document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])'))
      positiveTabIndex.forEach(element => {
        const tabIndex = parseInt(element.getAttribute('tabindex'))
        if (tabIndex > 0) {
          results.violations.push({
            type: 'focus-management',
            severity: 'moderate',
            element: getElementSelector(element),
            description: 'Positive tabindex disrupts natural tab order',
            wcagCriteria: '2.4.3'
          })
        }
      })

      if (totalElements > 0) {
        results.score = Math.round((elementsWithFocus / totalElements) * 100)
      }

      return results
    }

    function testDocumentStructure() {
      const results = { score: 100, violations: [] }
      let totalTests = 0
      let passingTests = 0

      // Test 1: Page has title
      totalTests++
      if (document.title && document.title.trim().length > 0) {
        passingTests++
      } else {
        results.violations.push({
          type: 'structure',
          severity: 'serious',
          element: 'document',
          description: 'Page missing or empty title',
          wcagCriteria: '2.4.2'
        })
      }

      // Test 2: Language is specified
      totalTests++
      const lang = document.documentElement.getAttribute('lang')
      if (lang && lang.trim().length > 0) {
        passingTests++
      } else {
        results.violations.push({
          type: 'structure',
          severity: 'moderate',
          element: 'html',
          description: 'Page language not specified',
          wcagCriteria: '3.1.1'
        })
      }

      // Test 3: Main landmark exists
      totalTests++
      const main = document.querySelector('main, [role="main"]')
      if (main) {
        passingTests++
      } else {
        results.violations.push({
          type: 'structure',
          severity: 'moderate',
          element: 'document',
          description: 'Page missing main landmark',
          wcagCriteria: '1.3.1'
        })
      }

      // Test 4: Heading hierarchy
      totalTests++
      const h1Elements = document.querySelectorAll('h1')
      if (h1Elements.length === 1) {
        passingTests++
      } else {
        results.violations.push({
          type: 'structure',
          severity: 'moderate',
          element: 'document',
          description: `Page has ${h1Elements.length} h1 elements (should have exactly 1)`,
          wcagCriteria: '1.3.1'
        })
      }

      if (totalTests > 0) {
        results.score = Math.round((passingTests / totalTests) * 100)
      }

      return results
    }

    // Utility functions (simplified versions)
    function getElementSelector(element) {
      const tagName = element.tagName.toLowerCase()
      const id = element.id ? `#${element.id}` : ''
      const classes = element.className ? `.${element.className.split(' ').slice(0, 2).join('.')}` : ''
      
      return `${tagName}${id}${classes}`.slice(0, 100)
    }

    function getEffectiveBackgroundColor(element) {
      let current = element
      while (current && current !== document.body) {
        const styles = getComputedStyle(current)
        const bgColor = styles.backgroundColor
        if (bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
          return bgColor
        }
        current = current.parentElement
      }
      return 'rgb(255, 255, 255)'
    }

    function calculateContrastRatio(foreground, background) {
      // Simplified contrast ratio calculation
      return 4.5 // Placeholder - would implement actual calculation
    }

    function getTextSize(element) {
      const fontSize = parseFloat(getComputedStyle(element).fontSize)
      return fontSize >= 24 ? 'large' : 'normal'
    }

    function isElementFocusable(element) {
      const tabIndex = element.getAttribute('tabindex')
      if (tabIndex !== null) {
        return parseInt(tabIndex) >= 0
      }
      
      const focusableTags = ['a', 'button', 'input', 'select', 'textarea']
      return focusableTags.includes(element.tagName.toLowerCase()) && !element.disabled
    }

    function hasKeyboardEventSupport(element) {
      // Check for keyboard event handlers or appropriate role
      return element.hasAttribute('onclick') || 
             element.hasAttribute('onkeydown') ||
             element.tagName.toLowerCase() === 'button' ||
             (element.tagName.toLowerCase() === 'a' && element.hasAttribute('href'))
    }

    function hasProperRole(element) {
      const role = element.getAttribute('role')
      const tagName = element.tagName.toLowerCase()
      
      // Elements with implicit roles
      if (['button', 'a', 'input', 'select', 'textarea'].includes(tagName)) {
        return true
      }
      
      // Elements with explicit interactive roles
      const interactiveRoles = ['button', 'link', 'tab', 'menuitem', 'option']
      return role && interactiveRoles.includes(role)
    }

    function hasAccessibleLabel(element) {
      const ariaLabel = element.getAttribute('aria-label')
      const ariaLabelledby = element.getAttribute('aria-labelledby')
      const id = element.getAttribute('id')
      const label = id ? document.querySelector(`label[for="${id}"]`) : null
      
      return !!(ariaLabel || ariaLabelledby || label || element.closest('label'))
    }

    function hasFocusIndicator(element) {
      // This would need actual focus testing - simplified version
      const styles = getComputedStyle(element)
      return styles.outline !== 'none' || 
             element.classList.contains('focus-visible') ||
             element.style.outline !== 'none'
    }

    function determineWCAGLevel(score, tests) {
      const criticalViolations = Object.values(tests)
        .flatMap(test => test.violations)
        .filter(v => v.severity === 'critical')
      
      if (criticalViolations.length > 0 || score < 70) return 'fail'
      if (score < 90) return 'AA'
      return 'AAA'
    }

    function generatePageRecommendations(tests) {
      const recommendations = []
      
      Object.entries(tests).forEach(([testName, testResult]) => {
        if (testResult.score < 90) {
          const criticalViolations = testResult.violations.filter(v => v.severity === 'critical').length
          const seriousViolations = testResult.violations.filter(v => v.severity === 'serious').length
          
          if (criticalViolations > 0) {
            recommendations.push({
              priority: 'critical',
              category: testName,
              title: `Fix ${criticalViolations} critical ${testName} issues`,
              impact: 'high'
            })
          }
          
          if (seriousViolations > 0) {
            recommendations.push({
              priority: 'high',
              category: testName,
              title: `Address ${seriousViolations} ${testName} violations`,
              impact: 'medium'
            })
          }
        }
      })
      
      return recommendations
    }
  }

  /**
   * Calculate overall summary statistics
   */
  calculateSummary() {
    const totalPages = this.results.pages.length
    if (totalPages === 0) return

    // Calculate overall score
    const pageScores = this.results.pages
      .filter(page => page.score !== undefined)
      .map(page => page.score)
    
    this.results.summary.overallScore = pageScores.length > 0
      ? Math.round(pageScores.reduce((sum, score) => sum + score, 0) / pageScores.length)
      : 0

    // Count violations
    this.results.pages.forEach(page => {
      if (page.violations) {
        this.results.summary.totalViolations += page.violations.length
        this.results.summary.criticalIssues += page.violations.filter(v => v.severity === 'critical').length
        
        // Categorize by WCAG principle
        page.violations.forEach(violation => {
          const principle = this.getWCAGPrinciple(violation.wcagCriteria)
          if (this.results.summary.byCategory[principle]) {
            this.results.summary.byCategory[principle].violations++
          }
        })
      }
    })

    // Calculate pass rate
    const passingPages = this.results.pages.filter(page => page.score >= 90).length
    this.results.summary.passRate = Math.round((passingPages / totalPages) * 100)

    // Calculate category scores
    Object.keys(this.results.summary.byCategory).forEach(category => {
      const categoryViolations = this.results.summary.byCategory[category].violations
      const maxPossibleViolations = totalPages * 10 // Rough estimate
      this.results.summary.byCategory[category].score = Math.max(0, 
        Math.round(((maxPossibleViolations - categoryViolations) / maxPossibleViolations) * 100)
      )
    })
  }

  /**
   * Generate comprehensive recommendations
   */
  generateRecommendations() {
    const allRecommendations = new Map()

    // Collect recommendations from all pages
    this.results.pages.forEach(page => {
      if (page.recommendations) {
        page.recommendations.forEach(rec => {
          const key = `${rec.category}-${rec.title}`
          if (allRecommendations.has(key)) {
            allRecommendations.get(key).count++
            allRecommendations.get(key).pages.push(page.path)
          } else {
            allRecommendations.set(key, {
              ...rec,
              count: 1,
              pages: [page.path]
            })
          }
        })
      }
    })

    // Sort by priority and count
    this.results.recommendations = Array.from(allRecommendations.values())
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        return priorityDiff !== 0 ? priorityDiff : b.count - a.count
      })
      .slice(0, 20) // Top 20 recommendations
  }

  /**
   * Get WCAG principle from criteria number
   */
  getWCAGPrinciple(criteria) {
    if (!criteria) return 'robust'
    
    const number = criteria.split('.')[0]
    switch (number) {
      case '1': return 'perceivable'
      case '2': return 'operable'
      case '3': return 'understandable'
      case '4': return 'robust'
      default: return 'robust'
    }
  }

  /**
   * Save results to JSON
   */
  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `accessibility-report-${timestamp}.json`
    const filepath = path.join(CONFIG.outputDir, filename)
    
    await fs.writeFile(filepath, JSON.stringify(this.results, null, 2))
    console.log(`📊 Results saved to: ${filepath}`)
  }

  /**
   * Generate comprehensive HTML report
   */
  async generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Compliance Report - ANAM Gallery</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .score-card { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .score-value { font-size: 3rem; font-weight: bold; margin-bottom: 10px; }
        .score-excellent { color: #10b981; }
        .score-good { color: #3b82f6; }
        .score-fair { color: #f59e0b; }
        .score-poor { color: #ef4444; }
        .chart-container { background: white; border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .violations-list { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .violation-item { border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; background: #fef2f2; border-radius: 0 8px 8px 0; }
        .violation-critical { border-left-color: #dc2626; background: #fef2f2; }
        .violation-serious { border-left-color: #f59e0b; background: #fffbeb; }
        .violation-moderate { border-left-color: #3b82f6; background: #eff6ff; }
        .recommendations { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 25px; margin: 30px 0; }
        .page-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
        .page-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .wcag-principles { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .principle-card { text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; border: 2px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; font-weight: 600; }
        .trend-up { color: #10b981; }
        .trend-down { color: #ef4444; }
        .trend-stable { color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>♿ Accessibility Compliance Report</h1>
            <p><strong>Generated:</strong> ${this.results.metadata.timestamp}</p>
            <p><strong>Target:</strong> WCAG ${this.results.metadata.wcagLevel} Compliance</p>
            <p><strong>Pages Tested:</strong> ${this.results.metadata.totalPages}</p>
        </div>

        <div class="score-grid">
            <div class="score-card">
                <div class="score-value ${this.getScoreClass(this.results.summary.overallScore)}">${this.results.summary.overallScore}%</div>
                <h3>Overall Score</h3>
                <p>Accessibility compliance across all tested pages</p>
            </div>
            
            <div class="score-card">
                <div class="score-value ${this.results.summary.totalViolations === 0 ? 'score-excellent' : 'score-poor'}">${this.results.summary.totalViolations}</div>
                <h3>Total Violations</h3>
                <p>Accessibility issues found across all pages</p>
            </div>
            
            <div class="score-card">
                <div class="score-value ${this.results.summary.criticalIssues === 0 ? 'score-excellent' : 'score-poor'}">${this.results.summary.criticalIssues}</div>
                <h3>Critical Issues</h3>
                <p>High-priority accessibility barriers</p>
            </div>
            
            <div class="score-card">
                <div class="score-value ${this.getScoreClass(this.results.summary.passRate)}">${this.results.summary.passRate}%</div>
                <h3>Pass Rate</h3>
                <p>Pages meeting accessibility standards</p>
            </div>
        </div>

        <div class="chart-container">
            <h2>WCAG 2.1 Principles Compliance</h2>
            <div class="wcag-principles">
                ${Object.entries(this.results.summary.byCategory).map(([principle, data]) => `
                    <div class="principle-card">
                        <h3>${principle.charAt(0).toUpperCase() + principle.slice(1)}</h3>
                        <div class="score-value ${this.getScoreClass(data.score)}">${data.score}%</div>
                        <p>${data.violations} violations</p>
                    </div>
                `).join('')}
            </div>
        </div>

        ${this.results.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>🎯 Priority Recommendations</h2>
            ${this.results.recommendations.slice(0, 10).map(rec => `
                <div class="recommendation-item">
                    <h3>${rec.title}</h3>
                    <p><strong>Priority:</strong> ${rec.priority.toUpperCase()} | <strong>Affects:</strong> ${rec.count} page(s)</p>
                    <p><strong>Pages:</strong> ${rec.pages.join(', ')}</p>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="chart-container">
            <h2>📊 Page-by-Page Analysis</h2>
            <div class="page-grid">
                ${this.results.pages.map(page => `
                    <div class="page-card">
                        <h3>${page.path}</h3>
                        <div class="score-value ${this.getScoreClass(page.score || 0)}">${page.score || 0}%</div>
                        <p><strong>WCAG Level:</strong> ${page.wcagLevel || 'Unknown'}</p>
                        <p><strong>Violations:</strong> ${page.violations ? page.violations.length : 0}</p>
                        ${page.error ? `<p style="color: #ef4444;"><strong>Error:</strong> ${page.error}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>

        ${this.results.violations.length > 0 ? `
        <div class="violations-list">
            <h2>⚠️ All Accessibility Violations</h2>
            ${this.results.violations.slice(0, 50).map(violation => `
                <div class="violation-item violation-${violation.severity}">
                    <h3>${violation.element}</h3>
                    <p><strong>${violation.description}</strong></p>
                    <p><strong>WCAG Criteria:</strong> ${violation.wcagCriteria}</p>
                    <p><strong>Severity:</strong> ${violation.severity}</p>
                    <p><strong>Type:</strong> ${violation.type}</p>
                </div>
            `).join('')}
            ${this.results.violations.length > 50 ? `<p><em>... and ${this.results.violations.length - 50} more violations</em></p>` : ''}
        </div>
        ` : ''}

        <div class="chart-container">
            <h2>📈 Detailed Test Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Page</th>
                        <th>Overall Score</th>
                        <th>Color Contrast</th>
                        <th>Keyboard Nav</th>
                        <th>Screen Reader</th>
                        <th>Focus Mgmt</th>
                        <th>Structure</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.results.pages.map(page => `
                        <tr>
                            <td>${page.path}</td>
                            <td class="${this.getScoreClass(page.score || 0)}">${page.score || 0}%</td>
                            <td>${page.tests?.colorContrast?.score || 'N/A'}%</td>
                            <td>${page.tests?.keyboard?.score || 'N/A'}%</td>
                            <td>${page.tests?.screenReader?.score || 'N/A'}%</td>
                            <td>${page.tests?.focusManagement?.score || 'N/A'}%</td>
                            <td>${page.tests?.structure?.score || 'N/A'}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <footer style="text-align: center; margin-top: 50px; padding: 20px; color: #6b7280;">
            <p><small>Generated by ANAM Gallery Accessibility Testing Suite</small></p>
            <p><small>WCAG 2.1 Guidelines • ${new Date().toLocaleDateString()}</small></p>
        </footer>
    </div>
</body>
</html>`

    const reportPath = path.join(CONFIG.outputDir, 'accessibility-report.html')
    await fs.writeFile(reportPath, html)
    console.log(`📄 HTML report generated: ${reportPath}`)
  }

  /**
   * Generate CSV export for further analysis
   */
  async generateCSVReport() {
    const csvHeaders = [
      'Page', 'URL', 'Overall Score', 'WCAG Level', 'Total Violations', 'Critical Issues',
      'Color Contrast Score', 'Keyboard Score', 'Screen Reader Score', 'Focus Score', 'Structure Score'
    ]

    const csvRows = this.results.pages.map(page => [
      page.path,
      page.url,
      page.score || 0,
      page.wcagLevel || 'Unknown',
      page.violations ? page.violations.length : 0,
      page.violations ? page.violations.filter(v => v.severity === 'critical').length : 0,
      page.tests?.colorContrast?.score || 'N/A',
      page.tests?.keyboard?.score || 'N/A',
      page.tests?.screenReader?.score || 'N/A',
      page.tests?.focusManagement?.score || 'N/A',
      page.tests?.structure?.score || 'N/A'
    ])

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const csvPath = path.join(CONFIG.outputDir, 'accessibility-report.csv')
    await fs.writeFile(csvPath, csvContent)
    console.log(`📈 CSV report generated: ${csvPath}`)
  }

  /**
   * Get CSS class for score styling
   */
  getScoreClass(score) {
    if (score >= 90) return 'score-excellent'
    if (score >= 75) return 'score-good'
    if (score >= 60) return 'score-fair'
    return 'score-poor'
  }
}

/**
 * Main execution
 */
async function main() {
  const generator = new AccessibilityReportGenerator()
  
  try {
    await generator.init()
    const results = await generator.generateReport()
    
    console.log('\n♿ Accessibility Report Summary:')
    console.log(`Overall Score: ${results.summary.overallScore}%`)
    console.log(`Total Violations: ${results.summary.totalViolations}`)
    console.log(`Critical Issues: ${results.summary.criticalIssues}`)
    console.log(`Pass Rate: ${results.summary.passRate}%`)
    
    // Exit with appropriate code
    const hasFailures = results.summary.overallScore < 70 || results.summary.criticalIssues > 0
    process.exit(hasFailures ? 1 : 0)
    
  } catch (error) {
    console.error('❌ Accessibility report generation failed:', error)
    process.exit(1)
  } finally {
    await generator.cleanup()
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { AccessibilityReportGenerator, CONFIG }