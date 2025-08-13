#!/usr/bin/env node

/**
 * Color Contrast Testing Script for CI/CD Pipeline
 * Automated WCAG 2.1 AA/AAA color contrast validation
 */

const puppeteer = require('puppeteer')
const { AxeBuilder } = require('@axe-core/playwright')
const fs = require('fs').promises
const path = require('path')

// Configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  outputDir: process.env.OUTPUT_DIR || './test-results/accessibility',
  viewport: {
    width: 1440,
    height: 900
  },
  pages: [
    '/',
    '/gallery',
    '/gallery/01',
    '/contact',
    '/artist',
    '/exhibition'
  ],
  thresholds: {
    aa: 4.5,
    aaa: 7,
    largeTextAA: 3,
    largeTextAAA: 4.5,
    uiComponents: 3
  }
}

/**
 * Color contrast testing implementation
 */
class ColorContrastTester {
  constructor() {
    this.browser = null
    this.results = {
      summary: {
        totalPages: 0,
        totalElements: 0,
        passing: 0,
        failing: 0,
        aaCompliant: 0,
        aaaCompliant: 0
      },
      pages: [],
      violations: [],
      recommendations: []
    }
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true })
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  /**
   * Run color contrast tests on all pages
   */
  async runTests() {
    console.log('🎨 Starting color contrast testing...')
    
    for (const pagePath of CONFIG.pages) {
      console.log(`Testing page: ${pagePath}`)
      
      try {
        const pageResult = await this.testPage(pagePath)
        this.results.pages.push(pageResult)
        
        console.log(`✓ Page ${pagePath}: ${pageResult.summary.passing}/${pageResult.summary.total} elements passing`)
      } catch (error) {
        console.error(`✗ Error testing page ${pagePath}:`, error.message)
        
        this.results.pages.push({
          url: `${CONFIG.baseUrl}${pagePath}`,
          error: error.message,
          summary: { total: 0, passing: 0, failing: 0 },
          elements: []
        })
      }
    }

    // Generate summary
    this.generateSummary()
    
    // Save results
    await this.saveResults()
    
    // Generate report
    await this.generateReport()
    
    return this.results
  }

  /**
   * Test color contrast for a single page
   */
  async testPage(pagePath) {
    const page = await this.browser.newPage()
    
    try {
      await page.setViewport(CONFIG.viewport)
      await page.goto(`${CONFIG.baseUrl}${pagePath}`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      })

      // Wait for page to be fully loaded
      await page.waitForTimeout(2000)

      // Run color contrast analysis
      const pageResult = await page.evaluate(this.analyzeColorContrast)
      
      return {
        url: `${CONFIG.baseUrl}${pagePath}`,
        timestamp: new Date().toISOString(),
        summary: pageResult.summary,
        elements: pageResult.elements,
        violations: pageResult.violations
      }
    } finally {
      await page.close()
    }
  }

  /**
   * Analyze color contrast on the current page
   * This function runs in the browser context
   */
  analyzeColorContrast() {
    const results = {
      summary: { total: 0, passing: 0, failing: 0, aaCompliant: 0, aaaCompliant: 0 },
      elements: [],
      violations: []
    }

    // Helper function to calculate contrast ratio
    function calculateContrastRatio(foreground, background) {
      const getLuminance = (color) => {
        const rgb = hexToRgb(color)
        if (!rgb) return 0
        
        const rsRGB = rgb.r / 255
        const gsRGB = rgb.g / 255
        const bsRGB = rgb.b / 255

        const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
        const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
        const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }

      const fgLuminance = getLuminance(foreground)
      const bgLuminance = getLuminance(background)
      
      const lightest = Math.max(fgLuminance, bgLuminance)
      const darkest = Math.min(fgLuminance, bgLuminance)
      
      return (lightest + 0.05) / (darkest + 0.05)
    }

    // Helper function to convert hex to RGB
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }

    // Helper function to normalize color to hex
    function normalizeColor(color) {
      const div = document.createElement('div')
      div.style.color = color
      document.body.appendChild(div)
      
      const computedColor = getComputedStyle(div).color
      document.body.removeChild(div)
      
      const rgbMatch = computedColor.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/)
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1])
        const g = parseInt(rgbMatch[2])
        const b = parseInt(rgbMatch[3])
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      }
      
      return color
    }

    // Helper function to get effective background color
    function getEffectiveBackgroundColor(element) {
      let current = element
      
      while (current && current !== document.body) {
        const styles = getComputedStyle(current)
        const bgColor = styles.backgroundColor
        
        if (bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
          return normalizeColor(bgColor)
        }
        
        current = current.parentElement
      }
      
      return '#ffffff' // Default to white
    }

    // Helper function to determine text size
    function getTextSize(element) {
      const styles = getComputedStyle(element)
      const fontSize = parseFloat(styles.fontSize)
      const fontWeight = styles.fontWeight
      
      const isBold = parseInt(fontWeight) >= 700 || fontWeight === 'bold'
      const isLarge = fontSize >= 24 || (fontSize >= 18.67 && isBold)
      
      return isLarge ? 'large' : 'normal'
    }

    // Helper function to get element selector
    function getElementSelector(element) {
      const tagName = element.tagName.toLowerCase()
      const id = element.id ? `#${element.id}` : ''
      const classes = element.className ? `.${element.className.split(' ').slice(0, 2).join('.')}` : ''
      
      return `${tagName}${id}${classes}`.slice(0, 100)
    }

    // Find all text elements
    const textSelectors = [
      'p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'button', 'label', 'legend', 'caption', 'th', 'td',
      'li', 'dt', 'dd', 'blockquote', 'figcaption',
      '[role="button"]', '[role="link"]', '[role="tab"]'
    ].join(', ')

    const textElements = Array.from(document.querySelectorAll(textSelectors))
      .filter(el => {
        const text = el.textContent?.trim()
        return text && text.length > 0
      })

    // Test each text element
    textElements.forEach(element => {
      const styles = getComputedStyle(element)
      const foreground = normalizeColor(styles.color)
      const background = getEffectiveBackgroundColor(element)
      
      if (foreground && background) {
        const ratio = calculateContrastRatio(foreground, background)
        const size = getTextSize(element)
        const selector = getElementSelector(element)
        
        // Determine requirements based on text size
        const requirements = size === 'large' 
          ? { aa: 3, aaa: 4.5 }
          : { aa: 4.5, aaa: 7 }
        
        const passesAA = ratio >= requirements.aa
        const passesAAA = ratio >= requirements.aaa
        
        const elementResult = {
          selector,
          foreground,
          background,
          ratio: Math.round(ratio * 100) / 100,
          size,
          passesAA,
          passesAAA,
          requirements,
          textContent: element.textContent?.slice(0, 100)
        }
        
        results.elements.push(elementResult)
        results.summary.total++
        
        if (passesAA) {
          results.summary.passing++
          results.summary.aaCompliant++
        } else {
          results.summary.failing++
          
          results.violations.push({
            type: 'color-contrast',
            severity: ratio < requirements.aa * 0.7 ? 'critical' : 'serious',
            element: selector,
            description: `Color contrast ratio ${ratio.toFixed(2)}:1 is below WCAG AA requirement of ${requirements.aa}:1`,
            foreground,
            background,
            ratio,
            required: requirements.aa,
            recommendation: ratio < requirements.aa * 0.8 
              ? 'Choose significantly different colors'
              : 'Slightly adjust text or background color'
          })
        }
        
        if (passesAAA) {
          results.summary.aaaCompliant++
        }
      }
    })

    return results
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    this.results.summary.totalPages = this.results.pages.length
    
    this.results.pages.forEach(page => {
      if (page.summary) {
        this.results.summary.totalElements += page.summary.total
        this.results.summary.passing += page.summary.passing
        this.results.summary.failing += page.summary.failing
        this.results.summary.aaCompliant += page.summary.aaCompliant
        this.results.summary.aaaCompliant += page.summary.aaaCompliant
      }
      
      if (page.violations) {
        this.results.violations.push(...page.violations)
      }
    })

    // Generate recommendations
    this.generateRecommendations()
  }

  /**
   * Generate accessibility recommendations
   */
  generateRecommendations() {
    const criticalViolations = this.results.violations.filter(v => v.severity === 'critical')
    const seriousViolations = this.results.violations.filter(v => v.severity === 'serious')
    
    if (criticalViolations.length > 0) {
      this.results.recommendations.push({
        priority: 'critical',
        title: `Fix ${criticalViolations.length} critical color contrast violations`,
        description: 'These elements have extremely poor contrast and must be fixed immediately'
      })
    }
    
    if (seriousViolations.length > 0) {
      this.results.recommendations.push({
        priority: 'high',
        title: `Improve ${seriousViolations.length} color contrast ratios`,
        description: 'These elements do not meet WCAG AA standards and should be improved'
      })
    }
    
    const aaComplianceRate = this.results.summary.totalElements > 0
      ? (this.results.summary.aaCompliant / this.results.summary.totalElements) * 100
      : 100
    
    if (aaComplianceRate < 95) {
      this.results.recommendations.push({
        priority: 'medium',
        title: 'Improve overall WCAG AA compliance',
        description: `Current compliance rate is ${aaComplianceRate.toFixed(1)}%. Aim for 95%+ compliance.`
      })
    }
  }

  /**
   * Save results to JSON file
   */
  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `color-contrast-results-${timestamp}.json`
    const filepath = path.join(CONFIG.outputDir, filename)
    
    await fs.writeFile(filepath, JSON.stringify(this.results, null, 2))
    console.log(`📊 Results saved to: ${filepath}`)
  }

  /**
   * Generate HTML report
   */
  async generateReport() {
    const timestamp = new Date().toISOString()
    const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Color Contrast Accessibility Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; background: #f9f9f9; }
        .score { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
        .pass { color: #22c55e; }
        .fail { color: #ef4444; }
        .warning { color: #f59e0b; }
        .violation { border-left: 4px solid #ef4444; padding: 15px; margin: 10px 0; background: #fef2f2; }
        .critical { border-left-color: #dc2626; }
        .serious { border-left-color: #f59e0b; }
        .color-sample { display: inline-block; width: 20px; height: 20px; border: 1px solid #ccc; margin-right: 10px; vertical-align: middle; }
        .recommendations { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: 600; }
        .ratio { font-family: monospace; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Color Contrast Accessibility Report</h1>
        <p>Generated on ${timestamp}</p>
        <p>WCAG 2.1 AA/AAA Compliance Assessment</p>
    </div>

    <div class="summary">
        <div class="card">
            <div class="score ${this.results.summary.totalElements > 0 && this.results.summary.failing === 0 ? 'pass' : 'fail'}">
                ${this.results.summary.totalElements > 0 ? ((this.results.summary.passing / this.results.summary.totalElements) * 100).toFixed(1) : 0}%
            </div>
            <h3>Overall Score</h3>
            <p>Elements passing WCAG AA</p>
        </div>
        
        <div class="card">
            <div class="score">${this.results.summary.totalElements}</div>
            <h3>Total Elements</h3>
            <p>Text elements tested</p>
        </div>
        
        <div class="card">
            <div class="score ${this.results.summary.passing > 0 ? 'pass' : 'fail'}">${this.results.summary.passing}</div>
            <h3>Passing</h3>
            <p>WCAG AA compliant</p>
        </div>
        
        <div class="card">
            <div class="score ${this.results.summary.failing === 0 ? 'pass' : 'fail'}">${this.results.summary.failing}</div>
            <h3>Failing</h3>
            <p>Below WCAG AA</p>
        </div>
    </div>

    ${this.results.recommendations.length > 0 ? `
    <div class="recommendations">
        <h2>🎯 Recommendations</h2>
        ${this.results.recommendations.map(rec => `
            <div class="recommendation">
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${this.results.violations.length > 0 ? `
    <h2>⚠️ Color Contrast Violations</h2>
    ${this.results.violations.map(violation => `
        <div class="violation ${violation.severity}">
            <h3>${violation.element}</h3>
            <p><strong>${violation.description}</strong></p>
            <p>
                <span class="color-sample" style="background-color: ${violation.foreground};" title="Foreground: ${violation.foreground}"></span>
                Foreground: ${violation.foreground}
                <span class="color-sample" style="background-color: ${violation.background};" title="Background: ${violation.background}"></span>
                Background: ${violation.background}
            </p>
            <p><strong>Contrast Ratio:</strong> <span class="ratio">${violation.ratio.toFixed(2)}:1</span> (Required: ${violation.required}:1)</p>
            <p><strong>Recommendation:</strong> ${violation.recommendation}</p>
        </div>
    `).join('')}
    ` : '<div class="card"><h2>✅ No Color Contrast Violations Found</h2><p>All text elements meet WCAG AA standards!</p></div>'}

    <h2>📊 Page Details</h2>
    <table>
        <thead>
            <tr>
                <th>Page</th>
                <th>Elements Tested</th>
                <th>Passing</th>
                <th>Failing</th>
                <th>AA Compliance</th>
            </tr>
        </thead>
        <tbody>
            ${this.results.pages.map(page => `
                <tr>
                    <td>${page.url}</td>
                    <td>${page.summary?.total || 0}</td>
                    <td class="${page.summary?.passing === page.summary?.total ? 'pass' : ''}">${page.summary?.passing || 0}</td>
                    <td class="${page.summary?.failing === 0 ? 'pass' : 'fail'}">${page.summary?.failing || 0}</td>
                    <td>${page.summary?.total > 0 ? ((page.summary.aaCompliant / page.summary.total) * 100).toFixed(1) : 0}%</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <footer>
        <p><small>Generated by ANAM Gallery Accessibility Testing Suite</small></p>
    </footer>
</body>
</html>`

    const reportPath = path.join(CONFIG.outputDir, 'color-contrast-report.html')
    await fs.writeFile(reportPath, reportHtml)
    console.log(`📄 HTML report generated: ${reportPath}`)
  }
}

/**
 * Main execution
 */
async function main() {
  const tester = new ColorContrastTester()
  
  try {
    await tester.init()
    const results = await tester.runTests()
    
    // Output summary
    console.log('\n🎨 Color Contrast Test Summary:')
    console.log(`Total Elements: ${results.summary.totalElements}`)
    console.log(`Passing: ${results.summary.passing}`)
    console.log(`Failing: ${results.summary.failing}`)
    console.log(`AA Compliance: ${results.summary.totalElements > 0 ? ((results.summary.aaCompliant / results.summary.totalElements) * 100).toFixed(1) : 0}%`)
    console.log(`AAA Compliance: ${results.summary.totalElements > 0 ? ((results.summary.aaaCompliant / results.summary.totalElements) * 100).toFixed(1) : 0}%`)
    
    // Exit with appropriate code
    const hasFailures = results.summary.failing > 0
    process.exit(hasFailures ? 1 : 0)
    
  } catch (error) {
    console.error('❌ Color contrast testing failed:', error)
    process.exit(1)
  } finally {
    await tester.cleanup()
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { ColorContrastTester, CONFIG }