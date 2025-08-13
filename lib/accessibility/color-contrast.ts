/**
 * Color Contrast and Visual Accessibility Testing Framework
 * WCAG 2.1 AA/AAA color contrast validation and visual accessibility testing
 */

export interface ColorContrastResult {
  foreground: string
  background: string
  ratio: number
  level: 'AA' | 'AAA' | 'fail'
  size: 'normal' | 'large'
  passes: boolean
  element: HTMLElement
  selector: string
  wcagRequirement: {
    aa: number
    aaa: number
  }
  issues: string[]
  recommendations: string[]
}

export interface VisualAccessibilityResult {
  element: HTMLElement
  selector: string
  tests: {
    colorContrast: ColorContrastResult
    focusIndicator: FocusIndicatorResult
    colorOnly: ColorOnlyResult
    motionSafety: MotionSafetyResult
    targetSize: TargetSizeResult
  }
  score: number
  issues: string[]
}

export interface FocusIndicatorResult {
  hasIndicator: boolean
  visible: boolean
  sufficient: boolean
  ratio: number
  methods: string[]
  issues: string[]
}

export interface ColorOnlyResult {
  usesColorOnly: boolean
  hasTextualIndicator: boolean
  hasIconIndicator: boolean
  hasPatternIndicator: boolean
  accessible: boolean
  issues: string[]
}

export interface MotionSafetyResult {
  hasAnimation: boolean
  respectsReducedMotion: boolean
  autoPlaying: boolean
  canBePaused: boolean
  accessible: boolean
  issues: string[]
}

export interface TargetSizeResult {
  width: number
  height: number
  minimumSize: number
  passes: boolean
  spacing: number
  adequateSpacing: boolean
  issues: string[]
}

export interface ColorContrastAudit {
  url: string
  timestamp: string
  summary: {
    totalElements: number
    passing: number
    failing: number
    aaCompliant: number
    aaaCompliant: number
    averageRatio: number
  }
  results: ColorContrastResult[]
  visualResults: VisualAccessibilityResult[]
  score: number
  recommendations: string[]
}

/**
 * Color Contrast and Visual Accessibility Testing Framework
 */
export class ColorContrastTesting {
  /**
   * Run comprehensive color contrast audit
   */
  static async runColorContrastAudit(
    container: HTMLElement = document.body
  ): Promise<ColorContrastAudit> {
    const timestamp = new Date().toISOString()
    
    // Test color contrast
    const contrastResults = await this.testAllColorContrasts(container)
    
    // Test visual accessibility
    const visualResults = await this.testVisualAccessibility(container)
    
    const summary = this.calculateSummary(contrastResults)
    const score = this.calculateOverallScore(contrastResults, visualResults)
    const recommendations = this.generateRecommendations(contrastResults, visualResults)

    return {
      url: window.location.href,
      timestamp,
      summary,
      results: contrastResults,
      visualResults,
      score,
      recommendations
    }
  }

  /**
   * Test color contrast for all text elements
   */
  static async testAllColorContrasts(container: HTMLElement): Promise<ColorContrastResult[]> {
    const results: ColorContrastResult[] = []
    const textElements = this.getTextElements(container)

    for (const element of textElements) {
      const result = await this.testElementColorContrast(element)
      if (result) {
        results.push(result)
      }
    }

    return results
  }

  /**
   * Test color contrast for a specific element
   */
  static async testElementColorContrast(element: HTMLElement): Promise<ColorContrastResult | null> {
    const styles = getComputedStyle(element)
    const textContent = element.textContent?.trim()
    
    if (!textContent || textContent.length === 0) {
      return null
    }

    const foreground = this.getEffectiveForegroundColor(element)
    const background = this.getEffectiveBackgroundColor(element)
    
    if (!foreground || !background) {
      return null
    }

    const ratio = this.calculateContrastRatio(foreground, background)
    const size = this.getTextSize(element)
    const wcagRequirement = this.getWCAGRequirement(size)
    
    const level = this.determineContrastLevel(ratio, wcagRequirement)
    const passes = level !== 'fail'
    
    const issues: string[] = []
    const recommendations: string[] = []
    
    if (!passes) {
      issues.push(`Color contrast ratio ${ratio.toFixed(2)}:1 is below WCAG AA requirement of ${wcagRequirement.aa}:1`)
      recommendations.push(this.generateContrastRecommendation(ratio, wcagRequirement, foreground, background))
    }

    return {
      foreground,
      background,
      ratio,
      level,
      size,
      passes,
      element,
      selector: this.getElementSelector(element),
      wcagRequirement,
      issues,
      recommendations
    }
  }

  /**
   * Test comprehensive visual accessibility
   */
  static async testVisualAccessibility(container: HTMLElement): Promise<VisualAccessibilityResult[]> {
    const results: VisualAccessibilityResult[] = []
    const interactiveElements = this.getInteractiveElements(container)

    for (const element of interactiveElements) {
      const result = await this.testElementVisualAccessibility(element)
      results.push(result)
    }

    return results
  }

  /**
   * Test visual accessibility for a specific element
   */
  static async testElementVisualAccessibility(element: HTMLElement): Promise<VisualAccessibilityResult> {
    const issues: string[] = []
    
    // Test color contrast
    const colorContrast = await this.testElementColorContrast(element) || {
      foreground: 'unknown',
      background: 'unknown',
      ratio: 0,
      level: 'fail' as const,
      size: 'normal' as const,
      passes: false,
      element,
      selector: this.getElementSelector(element),
      wcagRequirement: { aa: 4.5, aaa: 7 },
      issues: ['Could not determine color contrast'],
      recommendations: ['Ensure text has sufficient color contrast']
    }

    // Test focus indicator
    const focusIndicator = await this.testFocusIndicator(element)
    
    // Test color-only information
    const colorOnly = this.testColorOnlyInformation(element)
    
    // Test motion safety
    const motionSafety = this.testMotionSafety(element)
    
    // Test target size
    const targetSize = this.testTargetSize(element)

    // Collect all issues
    issues.push(
      ...colorContrast.issues,
      ...focusIndicator.issues,
      ...colorOnly.issues,
      ...motionSafety.issues,
      ...targetSize.issues
    )

    const score = this.calculateElementScore({
      colorContrast,
      focusIndicator,
      colorOnly,
      motionSafety,
      targetSize
    })

    return {
      element,
      selector: this.getElementSelector(element),
      tests: {
        colorContrast,
        focusIndicator,
        colorOnly,
        motionSafety,
        targetSize
      },
      score,
      issues
    }
  }

  /**
   * Test focus indicator visibility and contrast
   */
  static async testFocusIndicator(element: HTMLElement): Promise<FocusIndicatorResult> {
    const issues: string[] = []
    const methods: string[] = []
    
    // Temporarily focus the element
    const originalFocus = document.activeElement
    element.focus()
    
    const focusedStyles = getComputedStyle(element)
    const unfocusedStyles = getComputedStyle(element) // Would need to get this before focus
    
    // Check for focus indicators
    let hasIndicator = false
    let visible = false
    let ratio = 0

    // Check outline
    if (focusedStyles.outline !== 'none' && focusedStyles.outline !== '0px') {
      hasIndicator = true
      visible = true
      methods.push('outline')
    }

    // Check border changes
    if (focusedStyles.borderColor !== 'transparent' && 
        focusedStyles.borderWidth !== '0px') {
      hasIndicator = true
      visible = true
      methods.push('border')
    }

    // Check box shadow
    if (focusedStyles.boxShadow !== 'none') {
      hasIndicator = true
      visible = true
      methods.push('box-shadow')
    }

    // Check background color changes
    if (focusedStyles.backgroundColor !== 'transparent') {
      hasIndicator = true
      visible = true
      methods.push('background-color')
    }

    // Calculate contrast ratio for focus indicator
    if (visible) {
      const focusColor = this.extractFocusIndicatorColor(focusedStyles)
      const backgroundColor = this.getEffectiveBackgroundColor(element)
      
      if (focusColor && backgroundColor) {
        ratio = this.calculateContrastRatio(focusColor, backgroundColor)
      }
    }

    // Restore original focus
    if (originalFocus && originalFocus !== element) {
      (originalFocus as HTMLElement).focus()
    } else {
      element.blur()
    }

    const sufficient = ratio >= 3 || methods.includes('outline') // 3:1 ratio for focus indicators

    if (!hasIndicator) {
      issues.push('Element has no visible focus indicator')
    } else if (!sufficient) {
      issues.push(`Focus indicator contrast ratio ${ratio.toFixed(2)}:1 is below 3:1 requirement`)
    }

    return {
      hasIndicator,
      visible,
      sufficient,
      ratio,
      methods,
      issues
    }
  }

  /**
   * Test for color-only information
   */
  static testColorOnlyInformation(element: HTMLElement): ColorOnlyResult {
    const issues: string[] = []
    
    // Check if element uses color to convey information
    const usesColorOnly = this.detectColorOnlyInformation(element)
    
    let hasTextualIndicator = false
    let hasIconIndicator = false
    let hasPatternIndicator = false

    if (usesColorOnly) {
      // Check for textual indicators
      const textContent = element.textContent || ''
      const ariaLabel = element.getAttribute('aria-label') || ''
      const title = element.getAttribute('title') || ''
      
      const indicatorWords = ['required', 'optional', 'error', 'success', 'warning', 'info', 'selected', 'active']
      const allText = `${textContent} ${ariaLabel} ${title}`.toLowerCase()
      
      hasTextualIndicator = indicatorWords.some(word => allText.includes(word))

      // Check for icon indicators
      const icons = element.querySelectorAll('svg, i[class*="icon"], .icon, [class*="fa-"]')
      hasIconIndicator = icons.length > 0

      // Check for pattern/shape indicators
      const hasPatternClasses = element.className.includes('pattern') || 
                               element.className.includes('stripe') ||
                               element.className.includes('dot')
      hasPatternIndicator = hasPatternClasses
    }

    const accessible = !usesColorOnly || hasTextualIndicator || hasIconIndicator || hasPatternIndicator

    if (usesColorOnly && !accessible) {
      issues.push('Element uses color alone to convey information')
    }

    return {
      usesColorOnly,
      hasTextualIndicator,
      hasIconIndicator,
      hasPatternIndicator,
      accessible,
      issues
    }
  }

  /**
   * Test motion safety and reduced motion preferences
   */
  static testMotionSafety(element: HTMLElement): MotionSafetyResult {
    const issues: string[] = []
    
    const styles = getComputedStyle(element)
    const hasAnimation = this.hasAnimation(element, styles)
    
    let respectsReducedMotion = true
    let autoPlaying = false
    let canBePaused = true

    if (hasAnimation) {
      // Check for prefers-reduced-motion support
      respectsReducedMotion = this.respectsReducedMotion(element)
      
      // Check for auto-playing animations
      autoPlaying = this.isAutoPlaying(element, styles)
      
      // Check if animation can be paused
      canBePaused = this.canBePaused(element)
    }

    const accessible = !hasAnimation || (respectsReducedMotion && (!autoPlaying || canBePaused))

    if (hasAnimation) {
      if (!respectsReducedMotion) {
        issues.push('Animation does not respect prefers-reduced-motion setting')
      }
      if (autoPlaying && !canBePaused) {
        issues.push('Auto-playing animation cannot be paused or stopped')
      }
    }

    return {
      hasAnimation,
      respectsReducedMotion,
      autoPlaying,
      canBePaused,
      accessible,
      issues
    }
  }

  /**
   * Test target size for touch accessibility
   */
  static testTargetSize(element: HTMLElement): TargetSizeResult {
    const issues: string[] = []
    
    const rect = element.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const minimumSize = 44 // WCAG AA minimum target size in CSS pixels
    
    const passes = width >= minimumSize && height >= minimumSize
    
    // Check spacing between targets
    const spacing = this.getTargetSpacing(element)
    const adequateSpacing = spacing >= 8 // Minimum spacing

    if (!passes) {
      if (width < minimumSize) {
        issues.push(`Target width ${width.toFixed(0)}px is below 44px minimum`)
      }
      if (height < minimumSize) {
        issues.push(`Target height ${height.toFixed(0)}px is below 44px minimum`)
      }
    }

    if (!adequateSpacing) {
      issues.push(`Target spacing ${spacing.toFixed(0)}px is below 8px minimum`)
    }

    return {
      width,
      height,
      minimumSize,
      passes,
      spacing,
      adequateSpacing,
      issues
    }
  }

  // Helper methods for color calculations
  private static getTextElements(container: HTMLElement): HTMLElement[] {
    const textSelectors = [
      'p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'button', 'label', 'legend', 'caption', 'th', 'td',
      'li', 'dt', 'dd', 'blockquote', 'figcaption',
      '[role="button"]', '[role="link"]', '[role="tab"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(textSelectors))
      .filter(el => {
        const text = (el as HTMLElement).textContent?.trim()
        return text && text.length > 0
      }) as HTMLElement[]
  }

  private static getInteractiveElements(container: HTMLElement): HTMLElement[] {
    const interactiveSelectors = [
      'button', 'a[href]', 'input', 'select', 'textarea',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]', '[role="link"]', '[role="tab"]',
      '[role="menuitem"]', '[role="option"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(interactiveSelectors)) as HTMLElement[]
  }

  private static getEffectiveForegroundColor(element: HTMLElement): string | null {
    const styles = getComputedStyle(element)
    const color = styles.color
    
    if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
      return null
    }
    
    return this.normalizeColor(color)
  }

  private static getEffectiveBackgroundColor(element: HTMLElement): string | null {
    let current: HTMLElement | null = element
    
    while (current && current !== document.body) {
      const styles = getComputedStyle(current)
      const bgColor = styles.backgroundColor
      
      if (bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
        return this.normalizeColor(bgColor)
      }
      
      current = current.parentElement
    }
    
    // Default to white background
    return '#ffffff'
  }

  private static normalizeColor(color: string): string {
    // Create a temporary element to normalize the color
    const div = document.createElement('div')
    div.style.color = color
    document.body.appendChild(div)
    
    const computedColor = getComputedStyle(div).color
    document.body.removeChild(div)
    
    // Convert to hex
    const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1])
      const g = parseInt(rgbMatch[2])
      const b = parseInt(rgbMatch[3])
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
    
    // Convert rgba to hex (ignore alpha for now)
    const rgbaMatch = computedColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/)
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1])
      const g = parseInt(rgbaMatch[2])
      const b = parseInt(rgbaMatch[3])
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
    
    return color
  }

  private static calculateContrastRatio(foreground: string, background: string): number {
    const getLuminance = (color: string): number => {
      const rgb = this.hexToRgb(color)
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

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  private static getTextSize(element: HTMLElement): 'normal' | 'large' {
    const styles = getComputedStyle(element)
    const fontSize = parseFloat(styles.fontSize)
    const fontWeight = styles.fontWeight
    
    // Large text: 18pt (24px) normal weight or 14pt (18.67px) bold weight
    const isLarge = fontSize >= 24 || (fontSize >= 18.67 && this.isBoldWeight(fontWeight))
    
    return isLarge ? 'large' : 'normal'
  }

  private static isBoldWeight(fontWeight: string): boolean {
    const numericWeight = parseInt(fontWeight)
    return !isNaN(numericWeight) ? numericWeight >= 700 : fontWeight === 'bold'
  }

  private static getWCAGRequirement(size: 'normal' | 'large'): { aa: number; aaa: number } {
    return size === 'large' 
      ? { aa: 3, aaa: 4.5 }
      : { aa: 4.5, aaa: 7 }
  }

  private static determineContrastLevel(ratio: number, requirement: { aa: number; aaa: number }): 'AA' | 'AAA' | 'fail' {
    if (ratio >= requirement.aaa) return 'AAA'
    if (ratio >= requirement.aa) return 'AA'
    return 'fail'
  }

  private static generateContrastRecommendation(
    ratio: number,
    requirement: { aa: number; aaa: number },
    foreground: string,
    background: string
  ): string {
    const needed = requirement.aa
    const improvement = needed / ratio
    
    if (improvement <= 1.2) {
      return 'Slightly adjust text or background color'
    } else if (improvement <= 2) {
      return 'Significantly darken text or lighten background'
    } else {
      return 'Choose completely different colors with higher contrast'
    }
  }

  private static getElementSelector(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase()
    const id = element.id ? `#${element.id}` : ''
    const classes = element.className ? `.${element.className.split(' ').slice(0, 2).join('.')}` : ''
    
    return `${tagName}${id}${classes}`.slice(0, 100)
  }

  private static extractFocusIndicatorColor(styles: CSSStyleDeclaration): string | null {
    // Extract color from outline
    if (styles.outline !== 'none') {
      const outlineColor = styles.outlineColor
      if (outlineColor !== 'transparent') {
        return this.normalizeColor(outlineColor)
      }
    }

    // Extract color from border
    const borderColor = styles.borderColor
    if (borderColor !== 'transparent') {
      return this.normalizeColor(borderColor)
    }

    // Extract color from box shadow
    if (styles.boxShadow !== 'none') {
      const shadowMatch = styles.boxShadow.match(/rgb\([^)]+\)|#[0-9a-f]{3,6}/i)
      if (shadowMatch) {
        return this.normalizeColor(shadowMatch[0])
      }
    }

    return null
  }

  private static detectColorOnlyInformation(element: HTMLElement): boolean {
    const className = element.className.toLowerCase()
    const style = getComputedStyle(element)
    
    // Check for common color-only patterns
    const colorOnlyPatterns = [
      'error', 'success', 'warning', 'info',
      'red', 'green', 'yellow', 'blue',
      'primary', 'secondary', 'danger'
    ]
    
    const hasColorOnlyClass = colorOnlyPatterns.some(pattern => className.includes(pattern))
    
    // Check for validation states that might use color only
    const isFormControl = ['input', 'select', 'textarea'].includes(element.tagName.toLowerCase())
    const hasValidationColor = isFormControl && (
      style.borderColor.includes('red') || 
      style.borderColor.includes('green') ||
      style.backgroundColor.includes('red') ||
      style.backgroundColor.includes('green')
    )
    
    return hasColorOnlyClass || hasValidationColor
  }

  private static hasAnimation(element: HTMLElement, styles: CSSStyleDeclaration): boolean {
    return styles.animationName !== 'none' || 
           styles.transitionProperty !== 'none' ||
           element.tagName.toLowerCase() === 'video' ||
           element.tagName.toLowerCase() === 'audio'
  }

  private static respectsReducedMotion(element: HTMLElement): boolean {
    // Check if CSS contains prefers-reduced-motion media query
    // This is a simplified check - in practice, you'd need to analyze CSS rules
    const stylesheets = Array.from(document.styleSheets)
    
    for (const stylesheet of stylesheets) {
      try {
        const rules = Array.from(stylesheet.cssRules || [])
        for (const rule of rules) {
          if (rule instanceof CSSMediaRule && 
              rule.conditionText.includes('prefers-reduced-motion')) {
            return true
          }
        }
      } catch (e) {
        // Cross-origin stylesheets might not be accessible
        continue
      }
    }
    
    return false
  }

  private static isAutoPlaying(element: HTMLElement, styles: CSSStyleDeclaration): boolean {
    if (element.tagName.toLowerCase() === 'video') {
      return (element as HTMLVideoElement).autoplay
    }
    
    if (element.tagName.toLowerCase() === 'audio') {
      return (element as HTMLAudioElement).autoplay
    }
    
    // Check for infinite animations
    return styles.animationIterationCount === 'infinite'
  }

  private static canBePaused(element: HTMLElement): boolean {
    if (['video', 'audio'].includes(element.tagName.toLowerCase())) {
      return !(element as HTMLMediaElement).hasAttribute('controls') // Simplified check
    }
    
    // Check for pause/play controls or handlers
    const hasControls = element.querySelector('[role="button"]') !== null ||
                       element.querySelector('button') !== null ||
                       element.hasAttribute('onclick')
    
    return hasControls
  }

  private static getTargetSpacing(element: HTMLElement): number {
    const rect = element.getBoundingClientRect()
    
    // Find nearby interactive elements
    const allInteractive = this.getInteractiveElements(document.body)
    let minDistance = Infinity
    
    for (const other of allInteractive) {
      if (other === element) continue
      
      const otherRect = other.getBoundingClientRect()
      const distance = Math.min(
        Math.abs(rect.right - otherRect.left),
        Math.abs(otherRect.right - rect.left),
        Math.abs(rect.bottom - otherRect.top),
        Math.abs(otherRect.bottom - rect.top)
      )
      
      minDistance = Math.min(minDistance, distance)
    }
    
    return minDistance === Infinity ? 100 : minDistance // Default to large spacing if no neighbors
  }

  private static calculateSummary(results: ColorContrastResult[]) {
    const totalElements = results.length
    const passing = results.filter(r => r.passes).length
    const failing = totalElements - passing
    const aaCompliant = results.filter(r => r.level === 'AA' || r.level === 'AAA').length
    const aaaCompliant = results.filter(r => r.level === 'AAA').length
    const averageRatio = results.length > 0 
      ? results.reduce((sum, r) => sum + r.ratio, 0) / results.length 
      : 0

    return {
      totalElements,
      passing,
      failing,
      aaCompliant,
      aaaCompliant,
      averageRatio
    }
  }

  private static calculateOverallScore(
    contrastResults: ColorContrastResult[],
    visualResults: VisualAccessibilityResult[]
  ): number {
    let score = 100

    // Color contrast score (50% weight)
    if (contrastResults.length > 0) {
      const contrastScore = (contrastResults.filter(r => r.passes).length / contrastResults.length) * 100
      score = score * 0.5 + contrastScore * 0.5
    }

    // Visual accessibility score (50% weight)
    if (visualResults.length > 0) {
      const visualScore = visualResults.reduce((sum, r) => sum + r.score, 0) / visualResults.length
      score = score * 0.5 + visualScore * 0.5
    }

    return Math.round(score)
  }

  private static calculateElementScore(tests: VisualAccessibilityResult['tests']): number {
    let score = 100

    // Color contrast (30%)
    if (!tests.colorContrast.passes) score -= 30

    // Focus indicator (25%)
    if (!tests.focusIndicator.hasIndicator) score -= 25
    else if (!tests.focusIndicator.sufficient) score -= 15

    // Color-only information (20%)
    if (!tests.colorOnly.accessible) score -= 20

    // Motion safety (15%)
    if (!tests.motionSafety.accessible) score -= 15

    // Target size (10%)
    if (!tests.targetSize.passes) score -= 10

    return Math.max(0, score)
  }

  private static generateRecommendations(
    contrastResults: ColorContrastResult[],
    visualResults: VisualAccessibilityResult[]
  ): string[] {
    const recommendations: string[] = []
    
    // Color contrast recommendations
    const failingContrast = contrastResults.filter(r => !r.passes)
    if (failingContrast.length > 0) {
      recommendations.push(`Fix color contrast for ${failingContrast.length} text elements`)
    }

    // Focus indicator recommendations
    const missingFocus = visualResults.filter(r => !r.tests.focusIndicator.hasIndicator)
    if (missingFocus.length > 0) {
      recommendations.push(`Add visible focus indicators to ${missingFocus.length} interactive elements`)
    }

    // Color-only recommendations
    const colorOnlyIssues = visualResults.filter(r => !r.tests.colorOnly.accessible)
    if (colorOnlyIssues.length > 0) {
      recommendations.push(`Provide non-color indicators for ${colorOnlyIssues.length} elements using color alone`)
    }

    // Motion safety recommendations
    const motionIssues = visualResults.filter(r => !r.tests.motionSafety.accessible)
    if (motionIssues.length > 0) {
      recommendations.push(`Implement reduced motion support for ${motionIssues.length} animated elements`)
    }

    // Target size recommendations
    const sizeIssues = visualResults.filter(r => !r.tests.targetSize.passes)
    if (sizeIssues.length > 0) {
      recommendations.push(`Increase target size for ${sizeIssues.length} interactive elements to minimum 44x44px`)
    }

    return recommendations.slice(0, 10) // Limit to top 10
  }
}

export default ColorContrastTesting