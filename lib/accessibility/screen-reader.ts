/**
 * Screen Reader Testing Framework
 * Automated validation for screen reader accessibility
 */

import { ACCESSIBILITY_SELECTORS } from './index'

export interface ScreenReaderTestResult {
  element: string
  announcement: string
  context: string
  clarity: 'excellent' | 'good' | 'fair' | 'poor'
  issues: string[]
  recommendations: string[]
}

export interface ScreenReaderAuditResult {
  url: string
  timestamp: string
  results: ScreenReaderTestResult[]
  summary: {
    total: number
    excellent: number
    good: number
    fair: number
    poor: number
    issues: number
  }
  score: number
}

export interface AriaTestResult {
  element: HTMLElement
  selector: string
  attributes: {
    [key: string]: {
      present: boolean
      value: string
      valid: boolean
      required: boolean
      recommendation?: string
    }
  }
  roles: {
    implicit: string
    explicit?: string
    valid: boolean
    conflicts: boolean
  }
  labels: {
    hasLabel: boolean
    labelText: string
    labelSources: string[]
    accessible: boolean
  }
  issues: string[]
  score: number
}

export interface LiveRegionTestResult {
  element: HTMLElement
  type: 'polite' | 'assertive' | 'off'
  relevant: string[]
  atomic: boolean
  busy: boolean
  hasContent: boolean
  updates: {
    detected: boolean
    announced: boolean
    clear: boolean
  }
  issues: string[]
}

/**
 * Screen Reader Testing Framework
 * Comprehensive testing for screen reader compatibility
 */
export class ScreenReaderTesting {
  private static announcements: string[] = []
  private static liveRegionObserver?: MutationObserver

  /**
   * Test all screen reader accessibility aspects
   */
  static async runComprehensiveTest(
    container: HTMLElement = document.body
  ): Promise<ScreenReaderAuditResult> {
    const timestamp = new Date().toISOString()
    const results: ScreenReaderTestResult[] = []

    // Test different element types
    const elementTests = [
      { selector: 'button, [role="button"]', type: 'buttons' },
      { selector: 'a[href], [role="link"]', type: 'links' },
      { selector: 'input, select, textarea', type: 'form-controls' },
      { selector: 'img, [role="img"]', type: 'images' },
      { selector: 'h1, h2, h3, h4, h5, h6, [role="heading"]', type: 'headings' },
      { selector: '[role="navigation"], nav', type: 'navigation' },
      { selector: '[role="main"], main', type: 'landmarks' },
      { selector: '[role="dialog"], [role="alertdialog"]', type: 'modals' },
      { selector: '[aria-live], [role="status"], [role="alert"]', type: 'live-regions' }
    ]

    for (const test of elementTests) {
      const elements = container.querySelectorAll(test.selector)
      for (const element of Array.from(elements)) {
        const result = await this.testElementAccessibility(element as HTMLElement, test.type)
        results.push(result)
      }
    }

    const summary = this.calculateSummary(results)
    const score = this.calculateOverallScore(results)

    return {
      url: window.location.href,
      timestamp,
      results,
      summary,
      score
    }
  }

  /**
   * Test individual element accessibility for screen readers
   */
  static async testElementAccessibility(
    element: HTMLElement,
    type: string
  ): Promise<ScreenReaderTestResult> {
    const issues: string[] = []
    const recommendations: string[] = []
    
    // Get element selector
    const selector = this.getElementSelector(element)
    
    // Test accessible name
    const accessibleName = this.getAccessibleName(element)
    const announcement = this.generateAnnouncement(element, accessibleName)
    
    // Test context and clarity
    const context = this.getElementContext(element)
    const clarity = this.assessClarity(element, accessibleName, context)

    // Specific tests based on element type
    switch (type) {
      case 'buttons':
        this.testButtonAccessibility(element, issues, recommendations)
        break
      case 'links':
        this.testLinkAccessibility(element, issues, recommendations)
        break
      case 'form-controls':
        this.testFormControlAccessibility(element, issues, recommendations)
        break
      case 'images':
        this.testImageAccessibility(element, issues, recommendations)
        break
      case 'headings':
        this.testHeadingAccessibility(element, issues, recommendations)
        break
      case 'navigation':
        this.testNavigationAccessibility(element, issues, recommendations)
        break
      case 'landmarks':
        this.testLandmarkAccessibility(element, issues, recommendations)
        break
      case 'modals':
        this.testModalAccessibility(element, issues, recommendations)
        break
      case 'live-regions':
        this.testLiveRegionAccessibility(element, issues, recommendations)
        break
    }

    return {
      element: selector,
      announcement,
      context,
      clarity,
      issues,
      recommendations
    }
  }

  /**
   * Test ARIA compliance
   */
  static testAriaCompliance(container: HTMLElement = document.body): AriaTestResult[] {
    const results: AriaTestResult[] = []
    const elementsWithAria = container.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role], [aria-live], [aria-hidden]')

    for (const element of Array.from(elementsWithAria)) {
      const result = this.testElementAria(element as HTMLElement)
      results.push(result)
    }

    return results
  }

  /**
   * Test live regions functionality
   */
  static testLiveRegions(container: HTMLElement = document.body): LiveRegionTestResult[] {
    const results: LiveRegionTestResult[] = []
    const liveRegions = container.querySelectorAll('[aria-live], [role="status"], [role="alert"], [role="log"]')

    for (const element of Array.from(liveRegions)) {
      const result = this.testLiveRegion(element as HTMLElement)
      results.push(result)
    }

    return results
  }

  /**
   * Monitor live region announcements
   */
  static startLiveRegionMonitoring(container: HTMLElement = document.body): void {
    this.announcements = []
    
    if (this.liveRegionObserver) {
      this.liveRegionObserver.disconnect()
    }

    this.liveRegionObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const target = mutation.target as HTMLElement
          const liveRegion = target.closest('[aria-live], [role="status"], [role="alert"]')
          
          if (liveRegion) {
            const announcement = liveRegion.textContent || ''
            if (announcement.trim()) {
              this.announcements.push(`${new Date().toISOString()}: ${announcement}`)
            }
          }
        }
      })
    })

    this.liveRegionObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true
    })
  }

  /**
   * Stop monitoring and get announcements
   */
  static stopLiveRegionMonitoring(): string[] {
    if (this.liveRegionObserver) {
      this.liveRegionObserver.disconnect()
    }
    return [...this.announcements]
  }

  // Private helper methods
  private static getElementSelector(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase()
    const id = element.id ? `#${element.id}` : ''
    const classes = element.className ? `.${element.className.split(' ').join('.')}` : ''
    const role = element.getAttribute('role') ? `[role="${element.getAttribute('role')}"]` : ''
    
    return `${tagName}${id}${classes}${role}`.slice(0, 100)
  }

  private static getAccessibleName(element: HTMLElement): string {
    // Priority order for accessible name calculation
    const ariaLabel = element.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel.trim()

    const ariaLabelledby = element.getAttribute('aria-labelledby')
    if (ariaLabelledby) {
      const labelElements = ariaLabelledby.split(' ')
        .map(id => document.getElementById(id))
        .filter(Boolean)
      if (labelElements.length > 0) {
        return labelElements.map(el => el?.textContent || '').join(' ').trim()
      }
    }

    // For form controls, check associated label
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      const id = element.getAttribute('id')
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`)
        if (label) return label.textContent?.trim() || ''
      }
      
      // Check if wrapped in label
      const parentLabel = element.closest('label')
      if (parentLabel) {
        const labelText = parentLabel.textContent?.replace(element.textContent || '', '').trim()
        if (labelText) return labelText
      }
    }

    // For images, check alt attribute
    if (element.tagName === 'IMG') {
      const alt = element.getAttribute('alt')
      if (alt !== null) return alt.trim()
    }

    // Use title attribute
    const title = element.getAttribute('title')
    if (title) return title.trim()

    // Use element content
    const content = element.textContent?.trim()
    return content || ''
  }

  private static generateAnnouncement(element: HTMLElement, accessibleName: string): string {
    const tagName = element.tagName.toLowerCase()
    const role = element.getAttribute('role')
    const type = element.getAttribute('type')
    
    let announcement = accessibleName

    // Add role/type information
    if (role) {
      announcement += `, ${role}`
    } else {
      switch (tagName) {
        case 'button':
          announcement += ', button'
          break
        case 'a':
          announcement += ', link'
          break
        case 'input':
          announcement += `, ${type || 'text'} input`
          break
        case 'select':
          announcement += ', combobox'
          break
        case 'textarea':
          announcement += ', text area'
          break
        default:
          if (tagName.match(/^h[1-6]$/)) {
            announcement += `, heading level ${tagName.charAt(1)}`
          }
      }
    }

    // Add state information
    const states = []
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
      states.push('disabled')
    }
    if (element.getAttribute('aria-expanded') === 'true') {
      states.push('expanded')
    } else if (element.getAttribute('aria-expanded') === 'false') {
      states.push('collapsed')
    }
    if (element.getAttribute('aria-checked') === 'true') {
      states.push('checked')
    }
    if (element.getAttribute('aria-selected') === 'true') {
      states.push('selected')
    }

    if (states.length > 0) {
      announcement += `, ${states.join(', ')}`
    }

    return announcement
  }

  private static getElementContext(element: HTMLElement): string {
    const contexts = []
    
    // Find containing landmarks
    const landmarks = ['main', 'nav', 'aside', 'header', 'footer', 'section']
    for (const landmark of landmarks) {
      const container = element.closest(`${landmark}, [role="${landmark === 'aside' ? 'complementary' : landmark}"]`)
      if (container) {
        contexts.push(landmark)
        break
      }
    }

    // Find containing form
    const form = element.closest('form, [role="form"]')
    if (form) {
      contexts.push('form')
    }

    // Find containing list
    const list = element.closest('ul, ol, [role="list"]')
    if (list) {
      contexts.push('list')
    }

    return contexts.join(', ')
  }

  private static assessClarity(element: HTMLElement, accessibleName: string, context: string): 'excellent' | 'good' | 'fair' | 'poor' {
    let score = 0

    // Accessible name quality
    if (accessibleName.length === 0) {
      return 'poor'
    }
    if (accessibleName.length >= 3 && accessibleName.length <= 100) {
      score += 3
    } else if (accessibleName.length > 100) {
      score += 1
    } else {
      score += 2
    }

    // Descriptiveness
    const descriptiveWords = ['submit', 'cancel', 'close', 'open', 'save', 'delete', 'edit', 'add', 'remove']
    if (descriptiveWords.some(word => accessibleName.toLowerCase().includes(word))) {
      score += 2
    }

    // Context availability
    if (context.length > 0) {
      score += 2
    }

    // Generic text detection
    const genericPhrases = ['click here', 'read more', 'learn more', 'button', 'link', 'image']
    if (genericPhrases.some(phrase => accessibleName.toLowerCase() === phrase)) {
      score -= 2
    }

    if (score >= 6) return 'excellent'
    if (score >= 4) return 'good'
    if (score >= 2) return 'fair'
    return 'poor'
  }

  private static testButtonAccessibility(element: HTMLElement, issues: string[], recommendations: string[]): void {
    const accessibleName = this.getAccessibleName(element)
    
    if (!accessibleName) {
      issues.push('Button has no accessible name')
      recommendations.push('Add aria-label or visible text content')
    }

    if (accessibleName.toLowerCase().includes('button')) {
      issues.push('Button name includes redundant "button" text')
      recommendations.push('Remove "button" from the accessible name')
    }

    if (element.getAttribute('role') && element.getAttribute('role') !== 'button') {
      issues.push('Conflicting role attribute on button element')
      recommendations.push('Remove role attribute or use correct role')
    }
  }

  private static testLinkAccessibility(element: HTMLElement, issues: string[], recommendations: string[]): void {
    const accessibleName = this.getAccessibleName(element)
    const href = element.getAttribute('href')
    
    if (!accessibleName) {
      issues.push('Link has no accessible name')
      recommendations.push('Add text content or aria-label')
    }

    if (accessibleName.toLowerCase() === 'click here' || accessibleName.toLowerCase() === 'read more') {
      issues.push('Link has generic text')
      recommendations.push('Use descriptive link text that explains the destination')
    }

    if (!href || href === '#') {
      issues.push('Link missing valid href attribute')
      recommendations.push('Provide valid href or use button element instead')
    }

    if (element.getAttribute('target') === '_blank' && !element.getAttribute('aria-label')?.includes('new window')) {
      issues.push('Link opens in new window without warning')
      recommendations.push('Include "opens in new window" in accessible name')
    }
  }

  private static testFormControlAccessibility(element: HTMLElement, issues: string[], recommendations: string[]): void {
    const accessibleName = this.getAccessibleName(element)
    const required = element.hasAttribute('required') || element.getAttribute('aria-required') === 'true'
    
    if (!accessibleName) {
      issues.push('Form control has no accessible name')
      recommendations.push('Associate with label element or add aria-label')
    }

    if (required && !accessibleName.toLowerCase().includes('required')) {
      issues.push('Required field not clearly indicated to screen readers')
      recommendations.push('Include "required" in accessible name or use aria-required')
    }

    const describedBy = element.getAttribute('aria-describedby')
    if (describedBy) {
      const descriptionElement = document.getElementById(describedBy)
      if (!descriptionElement) {
        issues.push('aria-describedby references non-existent element')
        recommendations.push('Ensure aria-describedby points to valid element ID')
      }
    }
  }

  private static testImageAccessibility(element: HTMLElement, issues: string[], recommendations: string[]): void {
    const alt = element.getAttribute('alt')
    const role = element.getAttribute('role')
    
    if (alt === null) {
      issues.push('Image missing alt attribute')
      recommendations.push('Add alt attribute with descriptive text or empty alt for decorative images')
    }

    if (alt === '' && role !== 'presentation' && role !== 'none') {
      // This might be intentional for decorative images
    }

    if (alt && alt.toLowerCase().includes('image of') || alt && alt.toLowerCase().includes('picture of')) {
      issues.push('Alt text includes redundant "image of" or "picture of"')
      recommendations.push('Remove redundant phrases from alt text')
    }

    if (element.tagName === 'SVG' && !alt && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
      issues.push('SVG missing accessible name')
      recommendations.push('Add aria-label, aria-labelledby, or title element')
    }
  }

  private static testHeadingAccessibility(element: HTMLElement, issues: string[], recommendations: string[]): void {
    const accessibleName = this.getAccessibleName(element)
    const level = element.tagName.match(/^H([1-6])$/)?.[1] || element.getAttribute('aria-level')
    
    if (!accessibleName) {
      issues.push('Heading has no text content')
      recommendations.push('Add descriptive heading text')
    }

    if (accessibleName.length > 100) {
      issues.push('Heading text is too long')
      recommendations.push('Keep heading text concise (under 100 characters)')
    }

    // Check heading hierarchy (simplified)
    const allHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]'))
    const currentIndex = allHeadings.indexOf(element)
    if (currentIndex > 0) {
      const prevHeading = allHeadings[currentIndex - 1] as HTMLElement
      const prevLevel = parseInt(prevHeading.tagName.match(/^H([1-6])$/)?.[1] || prevHeading.getAttribute('aria-level') || '1')
      const currentLevel = parseInt(level || '1')
      
      if (currentLevel - prevLevel > 1) {
        issues.push('Heading level skips hierarchical order')
        recommendations.push('Use sequential heading levels (h1, h2, h3, etc.)')
      }
    }
  }

  private static testNavigationAccessibility(element: HTMLElement, issues: string[], recommendations: string[]): void {
    const label = element.getAttribute('aria-label') || element.getAttribute('aria-labelledby')
    
    if (!label) {
      const navElements = document.querySelectorAll('nav, [role="navigation"]')
      if (navElements.length > 1) {
        issues.push('Multiple navigation regions without distinguishing labels')
        recommendations.push('Add aria-label to distinguish navigation regions')
      }
    }

    const menuItems = element.querySelectorAll('a, button, [role="menuitem"]')
    if (menuItems.length === 0) {
      issues.push('Navigation region contains no interactive elements')
      recommendations.push('Add navigation links or menu items')
    }
  }

  private static testLandmarkAccessibility(element: HTMLElement, issues: string[], recommendations: string[]): void {
    const role = element.getAttribute('role') || element.tagName.toLowerCase()
    
    if (role === 'main') {
      const mainElements = document.querySelectorAll('main, [role="main"]')
      if (mainElements.length > 1) {
        issues.push('Multiple main landmarks found')
        recommendations.push('Use only one main landmark per page')
      }
    }
  }

  private static testModalAccessibility(element: HTMLElement, issues: string[], recommendations: string[]): void {
    const ariaModal = element.getAttribute('aria-modal')
    const ariaLabel = element.getAttribute('aria-label')
    const ariaLabelledby = element.getAttribute('aria-labelledby')
    
    if (ariaModal !== 'true') {
      issues.push('Modal missing aria-modal="true"')
      recommendations.push('Add aria-modal="true" to modal dialog')
    }

    if (!ariaLabel && !ariaLabelledby) {
      issues.push('Modal missing accessible name')
      recommendations.push('Add aria-label or aria-labelledby to modal')
    }

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusableElements.length === 0) {
      issues.push('Modal contains no focusable elements')
      recommendations.push('Ensure modal has at least one focusable element')
    }
  }

  private static testLiveRegionAccessibility(element: HTMLElement, issues: string[], recommendations: string[]): void {
    const ariaLive = element.getAttribute('aria-live')
    const role = element.getAttribute('role')
    
    if (!ariaLive && !role) {
      issues.push('Live region missing aria-live attribute')
      recommendations.push('Add aria-live="polite" or aria-live="assertive"')
    }

    const content = element.textContent?.trim()
    if (!content) {
      issues.push('Live region is empty')
      recommendations.push('Ensure live region contains meaningful content when active')
    }
  }

  private static testElementAria(element: HTMLElement): AriaTestResult {
    const issues: string[] = []
    const attributes: AriaTestResult['attributes'] = {}
    
    // Test ARIA attributes
    const ariaAttributes = Array.from(element.attributes).filter(attr => attr.name.startsWith('aria-'))
    
    for (const attr of ariaAttributes) {
      attributes[attr.name] = {
        present: true,
        value: attr.value,
        valid: this.validateAriaAttribute(attr.name, attr.value, element),
        required: this.isAriaAttributeRequired(attr.name, element)
      }
    }

    // Test roles
    const explicitRole = element.getAttribute('role')
    const implicitRole = this.getImplicitRole(element)
    
    const roles = {
      implicit: implicitRole,
      explicit: explicitRole || undefined,
      valid: explicitRole ? this.isValidRole(explicitRole) : true,
      conflicts: explicitRole ? this.roleConflictsWithElement(explicitRole, element) : false
    }

    // Test labels
    const accessibleName = this.getAccessibleName(element)
    const labels = {
      hasLabel: accessibleName.length > 0,
      labelText: accessibleName,
      labelSources: this.getLabelSources(element),
      accessible: this.isProperlyLabeled(element)
    }

    const score = this.calculateAriaScore(attributes, roles, labels, issues)

    return {
      element,
      selector: this.getElementSelector(element),
      attributes,
      roles,
      labels,
      issues,
      score
    }
  }

  private static testLiveRegion(element: HTMLElement): LiveRegionTestResult {
    const issues: string[] = []
    
    const ariaLive = element.getAttribute('aria-live') || 'off'
    const type = ariaLive as 'polite' | 'assertive' | 'off'
    
    const relevant = (element.getAttribute('aria-relevant') || 'additions text').split(' ')
    const atomic = element.getAttribute('aria-atomic') === 'true'
    const busy = element.getAttribute('aria-busy') === 'true'
    const hasContent = (element.textContent?.trim().length || 0) > 0

    const updates = {
      detected: false, // Would need monitoring to detect
      announced: false, // Would need screen reader testing
      clear: hasContent && !element.textContent?.includes('undefined') && !element.textContent?.includes('null')
    }

    if (type === 'off' && element.getAttribute('role') !== 'status' && element.getAttribute('role') !== 'alert') {
      issues.push('Live region not properly configured for announcements')
    }

    if (!hasContent) {
      issues.push('Live region is empty')
    }

    return {
      element,
      type,
      relevant,
      atomic,
      busy,
      hasContent,
      updates,
      issues
    }
  }

  private static calculateSummary(results: ScreenReaderTestResult[]) {
    const total = results.length
    const excellent = results.filter(r => r.clarity === 'excellent').length
    const good = results.filter(r => r.clarity === 'good').length
    const fair = results.filter(r => r.clarity === 'fair').length
    const poor = results.filter(r => r.clarity === 'poor').length
    const issues = results.reduce((sum, r) => sum + r.issues.length, 0)

    return { total, excellent, good, fair, poor, issues }
  }

  private static calculateOverallScore(results: ScreenReaderTestResult[]): number {
    if (results.length === 0) return 100

    const scores = results.map(r => {
      switch (r.clarity) {
        case 'excellent': return 100
        case 'good': return 80
        case 'fair': return 60
        case 'poor': return 20
        default: return 0
      }
    })

    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const issuesPenalty = Math.min(results.reduce((sum, r) => sum + r.issues.length, 0) * 5, 50)
    
    return Math.max(0, Math.round(averageScore - issuesPenalty))
  }

  // Additional helper methods for ARIA validation
  private static validateAriaAttribute(name: string, value: string, element: HTMLElement): boolean {
    // Simplified validation - in production, use a comprehensive ARIA spec
    const booleanAttrs = ['aria-checked', 'aria-disabled', 'aria-expanded', 'aria-hidden', 'aria-selected']
    const triStateAttrs = ['aria-checked', 'aria-pressed', 'aria-selected']
    
    if (booleanAttrs.includes(name)) {
      if (triStateAttrs.includes(name)) {
        return ['true', 'false', 'mixed'].includes(value)
      }
      return ['true', 'false'].includes(value)
    }

    return value.trim().length > 0
  }

  private static isAriaAttributeRequired(name: string, element: HTMLElement): boolean {
    const role = element.getAttribute('role')
    
    // Simplified required attributes mapping
    const requiredAttrs: Record<string, string[]> = {
      'checkbox': ['aria-checked'],
      'radio': ['aria-checked'],
      'slider': ['aria-valuenow'],
      'progressbar': ['aria-valuenow'],
      'tab': ['aria-selected'],
      'option': ['aria-selected']
    }

    return role ? (requiredAttrs[role] || []).includes(name) : false
  }

  private static getImplicitRole(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase()
    const type = element.getAttribute('type')
    
    const implicitRoles: Record<string, string> = {
      'button': 'button',
      'a': element.hasAttribute('href') ? 'link' : 'generic',
      'input': type === 'button' || type === 'submit' ? 'button' : type === 'checkbox' ? 'checkbox' : 'textbox',
      'select': 'combobox',
      'textarea': 'textbox',
      'img': 'img',
      'nav': 'navigation',
      'main': 'main',
      'aside': 'complementary',
      'header': 'banner',
      'footer': 'contentinfo',
      'section': 'region'
    }

    if (tagName.match(/^h[1-6]$/)) {
      return 'heading'
    }

    return implicitRoles[tagName] || 'generic'
  }

  private static isValidRole(role: string): boolean {
    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox',
      'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog',
      'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group',
      'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee',
      'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
      'navigation', 'none', 'note', 'option', 'presentation', 'progressbar', 'radio',
      'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search',
      'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab',
      'table', 'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip',
      'tree', 'treegrid', 'treeitem'
    ]
    
    return validRoles.includes(role)
  }

  private static roleConflictsWithElement(role: string, element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase()
    
    // Check for semantic conflicts
    const conflicts: Record<string, string[]> = {
      'button': ['link', 'checkbox', 'radio'],
      'a': ['button', 'checkbox', 'radio'],
      'input': ['button', 'link'] // depending on type
    }

    return (conflicts[tagName] || []).includes(role)
  }

  private static getLabelSources(element: HTMLElement): string[] {
    const sources: string[] = []
    
    if (element.getAttribute('aria-label')) sources.push('aria-label')
    if (element.getAttribute('aria-labelledby')) sources.push('aria-labelledby')
    if (element.getAttribute('title')) sources.push('title')
    if (element.textContent?.trim()) sources.push('content')
    
    const id = element.getAttribute('id')
    if (id && document.querySelector(`label[for="${id}"]`)) {
      sources.push('label[for]')
    }
    
    if (element.closest('label')) sources.push('label wrapper')
    
    return sources
  }

  private static isProperlyLabeled(element: HTMLElement): boolean {
    const accessibleName = this.getAccessibleName(element)
    return accessibleName.length > 0 && accessibleName.length <= 100
  }

  private static calculateAriaScore(
    attributes: AriaTestResult['attributes'],
    roles: AriaTestResult['roles'],
    labels: AriaTestResult['labels'],
    issues: string[]
  ): number {
    let score = 100

    // Deduct for invalid attributes
    Object.values(attributes).forEach(attr => {
      if (!attr.valid) score -= 10
    })

    // Deduct for role issues
    if (!roles.valid) score -= 20
    if (roles.conflicts) score -= 15

    // Deduct for labeling issues
    if (!labels.hasLabel) score -= 25
    if (!labels.accessible) score -= 15

    // Deduct for other issues
    score -= issues.length * 5

    return Math.max(0, score)
  }
}

export default ScreenReaderTesting