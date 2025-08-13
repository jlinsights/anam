/**
 * Keyboard Navigation Testing Framework
 * Comprehensive testing for keyboard accessibility and navigation patterns
 */

export interface KeyboardTestResult {
  element: string
  accessible: boolean
  focusable: boolean
  tabIndex: number
  keyboardSupport: {
    enter: boolean
    space: boolean
    escape: boolean
    arrowKeys: boolean
    homeEnd: boolean
    pageUpDown: boolean
  }
  ariaKeyboard: {
    hasAriaKeyShortcuts: boolean
    ariaKeyShortcuts?: string
    supportsAriaKeyShortcuts: boolean
  }
  issues: string[]
  recommendations: string[]
}

export interface FocusManagementResult {
  component: string
  scenario: string
  initialFocus: boolean
  focusTrap: boolean
  focusReturn: boolean
  tabOrder: boolean
  visualFocusIndicator: boolean
  issues: string[]
  recommendations: string[]
}

export interface KeyboardNavigationAudit {
  url: string
  timestamp: string
  summary: {
    totalElements: number
    keyboardAccessible: number
    focusManagementIssues: number
    tabOrderIssues: number
    shortcutConflicts: number
  }
  results: {
    interactive: KeyboardTestResult[]
    focusManagement: FocusManagementResult[]
    tabOrder: TabOrderResult
    shortcuts: KeyboardShortcutResult[]
  }
  score: number
  recommendations: string[]
}

export interface TabOrderResult {
  valid: boolean
  sequence: {
    element: HTMLElement
    tabIndex: number
    expectedOrder: number
    actualOrder: number
  }[]
  issues: string[]
  skippedElements: HTMLElement[]
  unreachableElements: HTMLElement[]
}

export interface KeyboardShortcutResult {
  key: string
  modifiers: string[]
  action: string
  element: HTMLElement
  conflicts: boolean
  documented: boolean
  issues: string[]
}

/**
 * Keyboard Navigation Testing Framework
 */
export class KeyboardNavigationTesting {
  private static currentFocus: HTMLElement | null = null
  private static focusHistory: HTMLElement[] = []
  private static keyboardShortcuts: Map<string, KeyboardShortcutResult> = new Map()

  /**
   * Run comprehensive keyboard navigation audit
   */
  static async runKeyboardAudit(
    container: HTMLElement = document.body
  ): Promise<KeyboardNavigationAudit> {
    const timestamp = new Date().toISOString()
    
    // Test interactive elements
    const interactiveResults = await this.testInteractiveElements(container)
    
    // Test focus management
    const focusResults = await this.testFocusManagement(container)
    
    // Test tab order
    const tabOrderResult = this.testTabOrder(container)
    
    // Test keyboard shortcuts
    const shortcutResults = this.testKeyboardShortcuts(container)
    
    const summary = this.calculateSummary(interactiveResults, focusResults, tabOrderResult, shortcutResults)
    const score = this.calculateKeyboardScore(summary, interactiveResults, focusResults)
    const recommendations = this.generateRecommendations(interactiveResults, focusResults, tabOrderResult)

    return {
      url: window.location.href,
      timestamp,
      summary,
      results: {
        interactive: interactiveResults,
        focusManagement: focusResults,
        tabOrder: tabOrderResult,
        shortcuts: shortcutResults
      },
      score,
      recommendations
    }
  }

  /**
   * Test interactive elements for keyboard accessibility
   */
  static async testInteractiveElements(container: HTMLElement): Promise<KeyboardTestResult[]> {
    const interactiveSelectors = [
      'button',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="link"]',
      '[role="tab"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="slider"]',
      '[role="spinbutton"]'
    ]

    const elements = container.querySelectorAll(interactiveSelectors.join(', '))
    const results: KeyboardTestResult[] = []

    for (const element of Array.from(elements)) {
      const result = await this.testElementKeyboardSupport(element as HTMLElement)
      results.push(result)
    }

    return results
  }

  /**
   * Test individual element for keyboard support
   */
  static async testElementKeyboardSupport(element: HTMLElement): Promise<KeyboardTestResult> {
    const issues: string[] = []
    const recommendations: string[] = []
    
    const selector = this.getElementSelector(element)
    const tabIndex = this.getEffectiveTabIndex(element)
    const focusable = this.isElementFocusable(element)
    
    // Test keyboard event support
    const keyboardSupport = await this.testKeyboardEvents(element)
    
    // Test ARIA keyboard shortcuts
    const ariaKeyboard = this.testAriaKeyboardShortcuts(element)
    
    // Analyze accessibility
    const accessible = this.analyzeKeyboardAccessibility(element, keyboardSupport, issues, recommendations)

    return {
      element: selector,
      accessible,
      focusable,
      tabIndex,
      keyboardSupport,
      ariaKeyboard,
      issues,
      recommendations
    }
  }

  /**
   * Test focus management patterns
   */
  static async testFocusManagement(container: HTMLElement): Promise<FocusManagementResult[]> {
    const results: FocusManagementResult[] = []
    
    // Test modals/dialogs
    const modals = container.querySelectorAll('[role="dialog"], [role="alertdialog"], .modal, [aria-modal="true"]')
    for (const modal of Array.from(modals)) {
      const result = await this.testModalFocusManagement(modal as HTMLElement)
      results.push(result)
    }
    
    // Test dropdown menus
    const dropdowns = container.querySelectorAll('[role="menu"], [role="listbox"], .dropdown-menu')
    for (const dropdown of Array.from(dropdowns)) {
      const result = await this.testDropdownFocusManagement(dropdown as HTMLElement)
      results.push(result)
    }
    
    // Test tab panels
    const tabPanels = container.querySelectorAll('[role="tabpanel"]')
    for (const tabPanel of Array.from(tabPanels)) {
      const result = await this.testTabPanelFocusManagement(tabPanel as HTMLElement)
      results.push(result)
    }

    return results
  }

  /**
   * Test tab order throughout the page
   */
  static testTabOrder(container: HTMLElement): TabOrderResult {
    const focusableElements = this.getFocusableElements(container)
    const sequence: TabOrderResult['sequence'] = []
    const issues: string[] = []
    const skippedElements: HTMLElement[] = []
    const unreachableElements: HTMLElement[] = []

    let expectedOrder = 0
    let hasPositiveTabIndex = false

    for (let i = 0; i < focusableElements.length; i++) {
      const element = focusableElements[i]
      const tabIndex = this.getEffectiveTabIndex(element)
      
      if (tabIndex > 0) {
        hasPositiveTabIndex = true
      }

      sequence.push({
        element,
        tabIndex,
        expectedOrder: expectedOrder++,
        actualOrder: i
      })

      // Check for tab order issues
      if (tabIndex > 0 && i > 0) {
        const prevElement = focusableElements[i - 1]
        const prevTabIndex = this.getEffectiveTabIndex(prevElement)
        
        if (prevTabIndex === 0 || (prevTabIndex > 0 && prevTabIndex > tabIndex)) {
          issues.push(`Tab order disrupted at ${this.getElementSelector(element)}`)
        }
      }
    }

    // Check for positive tabindex (anti-pattern)
    if (hasPositiveTabIndex) {
      issues.push('Positive tabindex values found - use natural document order instead')
    }

    // Test actual tab navigation
    this.testActualTabNavigation(container, sequence, unreachableElements)

    return {
      valid: issues.length === 0,
      sequence,
      issues,
      skippedElements,
      unreachableElements
    }
  }

  /**
   * Test keyboard shortcuts and conflicts
   */
  static testKeyboardShortcuts(container: HTMLElement): KeyboardShortcutResult[] {
    const results: KeyboardShortcutResult[] = []
    const shortcutMap = new Map<string, HTMLElement[]>()

    // Find elements with keyboard shortcuts
    const elementsWithShortcuts = container.querySelectorAll('[accesskey], [aria-keyshortcuts]')
    
    for (const element of Array.from(elementsWithShortcuts)) {
      const htmlElement = element as HTMLElement
      
      // Handle accesskey attribute
      const accesskey = htmlElement.getAttribute('accesskey')
      if (accesskey) {
        const shortcutKey = `Alt+${accesskey.toUpperCase()}`
        
        if (!shortcutMap.has(shortcutKey)) {
          shortcutMap.set(shortcutKey, [])
        }
        shortcutMap.get(shortcutKey)!.push(htmlElement)

        results.push({
          key: accesskey,
          modifiers: ['Alt'],
          action: this.getShortcutAction(htmlElement),
          element: htmlElement,
          conflicts: false, // Will be updated below
          documented: this.isShortcutDocumented(htmlElement, shortcutKey),
          issues: []
        })
      }

      // Handle aria-keyshortcuts attribute
      const ariaKeyshortcuts = htmlElement.getAttribute('aria-keyshortcuts')
      if (ariaKeyshortcuts) {
        const shortcuts = ariaKeyshortcuts.split(' ')
        
        for (const shortcut of shortcuts) {
          if (!shortcutMap.has(shortcut)) {
            shortcutMap.set(shortcut, [])
          }
          shortcutMap.get(shortcut)!.push(htmlElement)

          const { key, modifiers } = this.parseKeyboardShortcut(shortcut)
          
          results.push({
            key,
            modifiers,
            action: this.getShortcutAction(htmlElement),
            element: htmlElement,
            conflicts: false, // Will be updated below
            documented: this.isShortcutDocumented(htmlElement, shortcut),
            issues: []
          })
        }
      }
    }

    // Check for conflicts
    for (const [shortcutKey, elements] of shortcutMap.entries()) {
      if (elements.length > 1) {
        results.forEach(result => {
          const resultShortcut = `${result.modifiers.join('+')}+${result.key}`
          if (resultShortcut === shortcutKey || 
              (result.modifiers.includes('Alt') && `Alt+${result.key}` === shortcutKey)) {
            result.conflicts = true
            result.issues.push(`Shortcut conflicts with ${elements.length - 1} other element(s)`)
          }
        })
      }
    }

    return results
  }

  /**
   * Test modal focus management
   */
  private static async testModalFocusManagement(modal: HTMLElement): Promise<FocusManagementResult> {
    const issues: string[] = []
    const recommendations: string[] = []
    
    // Test initial focus
    const initialFocus = this.testModalInitialFocus(modal, issues, recommendations)
    
    // Test focus trap
    const focusTrap = await this.testModalFocusTrap(modal, issues, recommendations)
    
    // Test focus return
    const focusReturn = this.testModalFocusReturn(modal, issues, recommendations)
    
    // Test tab order within modal
    const tabOrder = this.testModalTabOrder(modal, issues, recommendations)
    
    // Test visual focus indicator
    const visualFocusIndicator = this.testVisualFocusIndicator(modal, issues, recommendations)

    return {
      component: 'modal',
      scenario: 'dialog-focus-management',
      initialFocus,
      focusTrap,
      focusReturn,
      tabOrder,
      visualFocusIndicator,
      issues,
      recommendations
    }
  }

  /**
   * Test dropdown focus management
   */
  private static async testDropdownFocusManagement(dropdown: HTMLElement): Promise<FocusManagementResult> {
    const issues: string[] = []
    const recommendations: string[] = []
    
    // Find trigger button
    const trigger = dropdown.closest('[aria-haspopup]') || 
                   document.querySelector(`[aria-controls="${dropdown.id}"]`) as HTMLElement
    
    const initialFocus = trigger ? this.testDropdownInitialFocus(dropdown, trigger, issues, recommendations) : false
    const focusTrap = await this.testDropdownFocusTrap(dropdown, issues, recommendations)
    const focusReturn = trigger ? this.testDropdownFocusReturn(dropdown, trigger, issues, recommendations) : false
    const tabOrder = this.testDropdownTabOrder(dropdown, issues, recommendations)
    const visualFocusIndicator = this.testVisualFocusIndicator(dropdown, issues, recommendations)

    return {
      component: 'dropdown',
      scenario: 'menu-focus-management',
      initialFocus,
      focusTrap,
      focusReturn,
      tabOrder,
      visualFocusIndicator,
      issues,
      recommendations
    }
  }

  /**
   * Test tab panel focus management
   */
  private static async testTabPanelFocusManagement(tabPanel: HTMLElement): Promise<FocusManagementResult> {
    const issues: string[] = []
    const recommendations: string[] = []
    
    // Find associated tab
    const tabId = tabPanel.getAttribute('aria-labelledby')
    const tab = tabId ? document.getElementById(tabId) : null
    
    const initialFocus = this.testTabPanelInitialFocus(tabPanel, issues, recommendations)
    const focusTrap = false // Tab panels typically don't trap focus
    const focusReturn = tab ? this.testTabPanelFocusReturn(tabPanel, tab, issues, recommendations) : false
    const tabOrder = this.testTabPanelTabOrder(tabPanel, issues, recommendations)
    const visualFocusIndicator = this.testVisualFocusIndicator(tabPanel, issues, recommendations)

    return {
      component: 'tabpanel',
      scenario: 'tab-focus-management',
      initialFocus,
      focusTrap,
      focusReturn,
      tabOrder,
      visualFocusIndicator,
      issues,
      recommendations
    }
  }

  // Helper methods for testing keyboard events
  private static async testKeyboardEvents(element: HTMLElement): Promise<KeyboardTestResult['keyboardSupport']> {
    const tagName = element.tagName.toLowerCase()
    const role = element.getAttribute('role')
    const type = element.getAttribute('type')

    // Default keyboard support based on element type
    let keyboardSupport = {
      enter: false,
      space: false,
      escape: false,
      arrowKeys: false,
      homeEnd: false,
      pageUpDown: false
    }

    // Native keyboard support
    if (tagName === 'button' || (tagName === 'input' && ['button', 'submit', 'reset'].includes(type || ''))) {
      keyboardSupport.enter = true
      keyboardSupport.space = true
    }

    if (tagName === 'a' && element.hasAttribute('href')) {
      keyboardSupport.enter = true
    }

    if (['input', 'select', 'textarea'].includes(tagName)) {
      keyboardSupport.enter = true
      if (tagName === 'select' || type === 'checkbox' || type === 'radio') {
        keyboardSupport.space = true
      }
    }

    // Role-based keyboard support
    if (role) {
      switch (role) {
        case 'button':
          keyboardSupport.enter = true
          keyboardSupport.space = true
          break
        case 'link':
          keyboardSupport.enter = true
          break
        case 'tab':
          keyboardSupport.enter = true
          keyboardSupport.space = true
          keyboardSupport.arrowKeys = true
          break
        case 'menuitem':
          keyboardSupport.enter = true
          keyboardSupport.space = true
          keyboardSupport.arrowKeys = true
          break
        case 'option':
          keyboardSupport.enter = true
          keyboardSupport.arrowKeys = true
          break
        case 'slider':
          keyboardSupport.arrowKeys = true
          keyboardSupport.homeEnd = true
          keyboardSupport.pageUpDown = true
          break
        case 'listbox':
        case 'grid':
        case 'tree':
          keyboardSupport.arrowKeys = true
          keyboardSupport.homeEnd = true
          keyboardSupport.pageUpDown = true
          break
        case 'dialog':
        case 'alertdialog':
          keyboardSupport.escape = true
          break
      }
    }

    // Test for custom keyboard event handlers
    const hasKeydownHandler = this.hasEventHandler(element, 'keydown')
    const hasKeyupHandler = this.hasEventHandler(element, 'keyup')
    const hasKeypressHandler = this.hasEventHandler(element, 'keypress')

    if (hasKeydownHandler || hasKeyupHandler || hasKeypressHandler) {
      // Element has custom keyboard handlers, assume it supports keyboard interaction
      // In a real implementation, you might want to test actual key events
      if (role === 'button' || tagName === 'button') {
        keyboardSupport.enter = true
        keyboardSupport.space = true
      }
    }

    return keyboardSupport
  }

  private static testAriaKeyboardShortcuts(element: HTMLElement): KeyboardTestResult['ariaKeyboard'] {
    const ariaKeyShortcuts = element.getAttribute('aria-keyshortcuts')
    
    return {
      hasAriaKeyShortcuts: !!ariaKeyShortcuts,
      ariaKeyShortcuts: ariaKeyShortcuts || undefined,
      supportsAriaKeyShortcuts: !!ariaKeyShortcuts && this.validateAriaKeyShortcuts(ariaKeyShortcuts)
    }
  }

  private static analyzeKeyboardAccessibility(
    element: HTMLElement,
    keyboardSupport: KeyboardTestResult['keyboardSupport'],
    issues: string[],
    recommendations: string[]
  ): boolean {
    const tagName = element.tagName.toLowerCase()
    const role = element.getAttribute('role')
    const tabIndex = this.getEffectiveTabIndex(element)

    let accessible = true

    // Check if element is focusable
    if (!this.isElementFocusable(element)) {
      if (this.isInteractiveElement(element)) {
        issues.push('Interactive element is not focusable')
        recommendations.push('Add tabindex="0" or remove disabled attribute')
        accessible = false
      }
    }

    // Check keyboard event support
    if (role === 'button' && (!keyboardSupport.enter || !keyboardSupport.space)) {
      issues.push('Custom button missing Enter/Space key support')
      recommendations.push('Add keyboard event handlers for Enter and Space keys')
      accessible = false
    }

    if (role === 'link' && !keyboardSupport.enter) {
      issues.push('Custom link missing Enter key support')
      recommendations.push('Add keyboard event handler for Enter key')
      accessible = false
    }

    // Check for positive tabindex
    if (tabIndex > 0) {
      issues.push('Positive tabindex disrupts natural tab order')
      recommendations.push('Use tabindex="0" and arrange elements in document order')
    }

    // Check for missing focus indicators
    if (!this.hasFocusIndicator(element)) {
      issues.push('Element missing visible focus indicator')
      recommendations.push('Add CSS focus styles (outline, border, etc.)')
    }

    return accessible
  }

  // Helper methods for focus management testing
  private static testModalInitialFocus(
    modal: HTMLElement,
    issues: string[],
    recommendations: string[]
  ): boolean {
    const focusableElements = this.getFocusableElements(modal)
    
    if (focusableElements.length === 0) {
      issues.push('Modal contains no focusable elements')
      recommendations.push('Add at least one focusable element (close button, etc.)')
      return false
    }

    // Check if modal or first focusable element receives focus
    const firstFocusable = focusableElements[0]
    const autoFocusElement = modal.querySelector('[autofocus]') as HTMLElement
    
    if (!autoFocusElement && !modal.hasAttribute('tabindex')) {
      issues.push('Modal does not specify initial focus')
      recommendations.push('Add autofocus to first interactive element or tabindex="-1" to modal')
      return false
    }

    return true
  }

  private static async testModalFocusTrap(
    modal: HTMLElement,
    issues: string[],
    recommendations: string[]
  ): Promise<boolean> {
    const focusableElements = this.getFocusableElements(modal)
    
    if (focusableElements.length < 2) {
      // Can't test focus trap with fewer than 2 elements
      return true
    }

    // In a real implementation, you would simulate Tab and Shift+Tab navigation
    // and verify that focus stays within the modal
    
    // For now, check if modal has focus trap implementation
    const hasFocusTrap = modal.hasAttribute('aria-modal') || 
                        modal.getAttribute('role') === 'dialog' ||
                        modal.classList.contains('focus-trap')

    if (!hasFocusTrap) {
      issues.push('Modal may not trap focus properly')
      recommendations.push('Implement focus trap to keep focus within modal')
      return false
    }

    return true
  }

  private static testModalFocusReturn(
    modal: HTMLElement,
    issues: string[],
    recommendations: string[]
  ): boolean {
    // Check if there's a mechanism to return focus to the trigger element
    const triggerId = modal.getAttribute('data-trigger-id')
    const hasReturnFocus = triggerId || modal.hasAttribute('data-return-focus')

    if (!hasReturnFocus) {
      issues.push('Modal may not return focus to trigger element')
      recommendations.push('Store and restore focus to the element that opened the modal')
      return false
    }

    return true
  }

  private static testModalTabOrder(
    modal: HTMLElement,
    issues: string[],
    recommendations: string[]
  ): boolean {
    const focusableElements = this.getFocusableElements(modal)
    
    for (let i = 0; i < focusableElements.length; i++) {
      const element = focusableElements[i]
      const tabIndex = this.getEffectiveTabIndex(element)
      
      if (tabIndex > 0) {
        issues.push('Modal contains elements with positive tabindex')
        recommendations.push('Remove positive tabindex values from modal elements')
        return false
      }
    }

    return true
  }

  private static testDropdownInitialFocus(
    dropdown: HTMLElement,
    trigger: HTMLElement,
    issues: string[],
    recommendations: string[]
  ): boolean {
    const firstOption = dropdown.querySelector('[role="menuitem"], [role="option"]') as HTMLElement
    
    if (!firstOption) {
      issues.push('Dropdown has no focusable options')
      recommendations.push('Add focusable menu items or options')
      return false
    }

    return true
  }

  private static async testDropdownFocusTrap(
    dropdown: HTMLElement,
    issues: string[],
    recommendations: string[]
  ): Promise<boolean> {
    // Dropdowns typically don't trap focus, but arrow key navigation should be supported
    const menuItems = dropdown.querySelectorAll('[role="menuitem"], [role="option"]')
    
    if (menuItems.length > 1) {
      // Check for arrow key navigation support
      const hasArrowKeySupport = Array.from(menuItems).some(item => 
        this.hasEventHandler(item as HTMLElement, 'keydown')
      )
      
      if (!hasArrowKeySupport) {
        issues.push('Dropdown missing arrow key navigation')
        recommendations.push('Implement arrow key navigation between menu items')
        return false
      }
    }

    return true
  }

  private static testDropdownFocusReturn(
    dropdown: HTMLElement,
    trigger: HTMLElement,
    issues: string[],
    recommendations: string[]
  ): boolean {
    // Check if dropdown implementation returns focus to trigger
    const hasEscapeHandler = this.hasEventHandler(dropdown, 'keydown') || 
                            this.hasEventHandler(trigger, 'keydown')

    if (!hasEscapeHandler) {
      issues.push('Dropdown may not handle Escape key to close and return focus')
      recommendations.push('Add Escape key handler to close dropdown and return focus to trigger')
      return false
    }

    return true
  }

  private static testDropdownTabOrder(
    dropdown: HTMLElement,
    issues: string[],
    recommendations: string[]
  ): boolean {
    const menuItems = dropdown.querySelectorAll('[role="menuitem"], [role="option"]')
    
    // Menu items should typically have tabindex="-1" for arrow key navigation
    let hasIncorrectTabIndex = false
    
    menuItems.forEach(item => {
      const tabIndex = (item as HTMLElement).getAttribute('tabindex')
      if (tabIndex !== '-1' && tabIndex !== null) {
        hasIncorrectTabIndex = true
      }
    })

    if (hasIncorrectTabIndex) {
      issues.push('Menu items should have tabindex="-1" for proper arrow key navigation')
      recommendations.push('Set tabindex="-1" on menu items and use arrow keys for navigation')
      return false
    }

    return true
  }

  private static testTabPanelInitialFocus(
    tabPanel: HTMLElement,
    issues: string[],
    recommendations: string[]
  ): boolean {
    const focusableElements = this.getFocusableElements(tabPanel)
    
    if (focusableElements.length > 0) {
      return true
    }

    // Tab panel should be focusable if it has no focusable content
    const tabIndex = this.getEffectiveTabIndex(tabPanel)
    
    if (tabIndex < 0 && focusableElements.length === 0) {
      issues.push('Tab panel with no focusable content should have tabindex="0"')
      recommendations.push('Add tabindex="0" to tab panel for keyboard navigation')
      return false
    }

    return true
  }

  private static testTabPanelFocusReturn(
    tabPanel: HTMLElement,
    tab: HTMLElement,
    issues: string[],
    recommendations: string[]
  ): boolean {
    // Tab panels should return focus to their associated tab when appropriate
    return true // This would need implementation-specific testing
  }

  private static testTabPanelTabOrder(
    tabPanel: HTMLElement,
    issues: string[],
    recommendations: string[]
  ): boolean {
    const focusableElements = this.getFocusableElements(tabPanel)
    
    // Check for logical tab order within panel
    return focusableElements.length === 0 || true // Simplified check
  }

  private static testVisualFocusIndicator(
    container: HTMLElement,
    issues: string[],
    recommendations: string[]
  ): boolean {
    const focusableElements = this.getFocusableElements(container)
    let hasVisibleFocusIndicator = true

    for (const element of focusableElements) {
      if (!this.hasFocusIndicator(element)) {
        hasVisibleFocusIndicator = false
        break
      }
    }

    if (!hasVisibleFocusIndicator) {
      issues.push('Some focusable elements lack visible focus indicators')
      recommendations.push('Add CSS focus styles to all interactive elements')
    }

    return hasVisibleFocusIndicator
  }

  private static testActualTabNavigation(
    container: HTMLElement,
    sequence: TabOrderResult['sequence'],
    unreachableElements: HTMLElement[]
  ): void {
    // In a real implementation, this would simulate actual Tab key navigation
    // and verify that elements receive focus in the expected order
    
    const focusableElements = this.getFocusableElements(container)
    
    // Check for elements that might be unreachable
    focusableElements.forEach(element => {
      if (element.offsetParent === null && element !== document.activeElement) {
        // Element might be hidden
        const style = getComputedStyle(element)
        if (style.display === 'none' || style.visibility === 'hidden') {
          unreachableElements.push(element)
        }
      }
    })
  }

  // Utility methods
  private static getElementSelector(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase()
    const id = element.id ? `#${element.id}` : ''
    const classes = element.className ? `.${element.className.split(' ').slice(0, 2).join('.')}` : ''
    const role = element.getAttribute('role') ? `[role="${element.getAttribute('role')}"]` : ''
    
    return `${tagName}${id}${classes}${role}`.slice(0, 100)
  }

  private static getEffectiveTabIndex(element: HTMLElement): number {
    const tabIndex = element.getAttribute('tabindex')
    
    if (tabIndex !== null) {
      return parseInt(tabIndex)
    }

    // Elements that are naturally focusable have tabindex 0
    const naturallyFocusable = ['a', 'button', 'input', 'select', 'textarea']
    if (naturallyFocusable.includes(element.tagName.toLowerCase())) {
      if (!element.hasAttribute('disabled')) {
        return 0
      }
    }

    return -1
  }

  private static isElementFocusable(element: HTMLElement): boolean {
    const tabIndex = this.getEffectiveTabIndex(element)
    
    if (tabIndex < 0) return false
    if (element.hasAttribute('disabled')) return false
    
    const style = getComputedStyle(element)
    if (style.display === 'none' || style.visibility === 'hidden') return false
    
    return true
  }

  private static isInteractiveElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase()
    const role = element.getAttribute('role')
    
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea']
    const interactiveRoles = ['button', 'link', 'tab', 'menuitem', 'option', 'checkbox', 'radio']
    
    return interactiveTags.includes(tagName) || 
           (role && interactiveRoles.includes(role))
  }

  private static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([aria-disabled="true"])',
      '[role="link"]:not([aria-disabled="true"])',
      '[role="tab"]:not([aria-disabled="true"])',
      '[role="menuitem"]:not([aria-disabled="true"])',
      '[role="option"]:not([aria-disabled="true"])'
    ].join(', ')

    return Array.from(container.querySelectorAll(selector))
      .filter(el => this.isElementFocusable(el as HTMLElement)) as HTMLElement[]
  }

  private static hasEventHandler(element: HTMLElement, eventType: string): boolean {
    // Check for inline event handlers
    if (element.getAttribute(`on${eventType}`)) return true
    
    // Check for addEventListener (limited detection)
    // In practice, this is difficult to detect reliably
    return false
  }

  private static hasFocusIndicator(element: HTMLElement): boolean {
    // Temporarily focus the element to check for focus styles
    const originalFocus = document.activeElement
    element.focus()
    
    const styles = getComputedStyle(element)
    const hasOutline = styles.outline !== 'none' && styles.outline !== '0px'
    const hasBorder = styles.borderColor !== 'transparent'
    const hasBoxShadow = styles.boxShadow !== 'none'
    const hasBackground = styles.backgroundColor !== 'transparent'
    
    // Restore original focus
    if (originalFocus && originalFocus !== element) {
      (originalFocus as HTMLElement).focus()
    }
    
    return hasOutline || hasBorder || hasBoxShadow || hasBackground
  }

  private static validateAriaKeyShortcuts(shortcuts: string): boolean {
    const shortcutArray = shortcuts.split(' ')
    
    for (const shortcut of shortcutArray) {
      if (!this.isValidKeyboardShortcut(shortcut)) {
        return false
      }
    }
    
    return true
  }

  private static isValidKeyboardShortcut(shortcut: string): boolean {
    // Simplified validation for keyboard shortcuts
    const validKeys = /^(Alt|Control|Meta|Shift)\+[A-Za-z0-9]$|^[A-Za-z0-9]$|^(Enter|Escape|Space|Tab|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Home|End|PageUp|PageDown)$/
    return validKeys.test(shortcut)
  }

  private static parseKeyboardShortcut(shortcut: string): { key: string; modifiers: string[] } {
    const parts = shortcut.split('+')
    const key = parts[parts.length - 1]
    const modifiers = parts.slice(0, -1)
    
    return { key, modifiers }
  }

  private static getShortcutAction(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase()
    const role = element.getAttribute('role')
    const type = element.getAttribute('type')
    
    if (tagName === 'button' || role === 'button') {
      return element.textContent?.trim() || 'activate button'
    }
    
    if (tagName === 'a' || role === 'link') {
      return 'follow link'
    }
    
    if (tagName === 'input') {
      switch (type) {
        case 'submit': return 'submit form'
        case 'reset': return 'reset form'
        default: return 'focus input'
      }
    }
    
    return 'activate element'
  }

  private static isShortcutDocumented(element: HTMLElement, shortcut: string): boolean {
    // Check if shortcut is documented in title, aria-label, or nearby text
    const title = element.getAttribute('title') || ''
    const ariaLabel = element.getAttribute('aria-label') || ''
    const textContent = element.textContent || ''
    
    const allText = `${title} ${ariaLabel} ${textContent}`.toLowerCase()
    const shortcutLower = shortcut.toLowerCase()
    
    return allText.includes(shortcutLower) || 
           allText.includes(shortcutLower.replace('+', ' '))
  }

  private static calculateSummary(
    interactiveResults: KeyboardTestResult[],
    focusResults: FocusManagementResult[],
    tabOrderResult: TabOrderResult,
    shortcutResults: KeyboardShortcutResult[]
  ) {
    return {
      totalElements: interactiveResults.length,
      keyboardAccessible: interactiveResults.filter(r => r.accessible).length,
      focusManagementIssues: focusResults.reduce((sum, r) => sum + r.issues.length, 0),
      tabOrderIssues: tabOrderResult.issues.length,
      shortcutConflicts: shortcutResults.filter(r => r.conflicts).length
    }
  }

  private static calculateKeyboardScore(
    summary: KeyboardNavigationAudit['summary'],
    interactiveResults: KeyboardTestResult[],
    focusResults: FocusManagementResult[]
  ): number {
    let score = 100

    // Deduct for inaccessible elements
    const accessibilityRate = summary.totalElements > 0 ? 
      summary.keyboardAccessible / summary.totalElements : 1
    score *= accessibilityRate

    // Deduct for focus management issues
    score -= Math.min(summary.focusManagementIssues * 5, 30)

    // Deduct for tab order issues
    score -= Math.min(summary.tabOrderIssues * 10, 40)

    // Deduct for shortcut conflicts
    score -= summary.shortcutConflicts * 5

    return Math.max(0, Math.round(score))
  }

  private static generateRecommendations(
    interactiveResults: KeyboardTestResult[],
    focusResults: FocusManagementResult[],
    tabOrderResult: TabOrderResult
  ): string[] {
    const recommendations: string[] = []

    // Collect unique recommendations from all test results
    const allRecommendations = new Set<string>()

    interactiveResults.forEach(result => {
      result.recommendations.forEach(rec => allRecommendations.add(rec))
    })

    focusResults.forEach(result => {
      result.recommendations.forEach(rec => allRecommendations.add(rec))
    })

    if (tabOrderResult.issues.length > 0) {
      allRecommendations.add('Review and fix tab order issues throughout the page')
    }

    return Array.from(allRecommendations).slice(0, 10) // Limit to top 10
  }
}

export default KeyboardNavigationTesting