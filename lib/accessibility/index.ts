/**
 * Accessibility Testing and Validation Framework
 * WCAG 2.1 AA Compliance Suite for ANAM Gallery
 */

export interface AccessibilityTestResult {
  url: string
  timestamp: string
  violations: AccessibilityViolation[]
  passes: AccessibilityPass[]
  incomplete: AccessibilityIncomplete[]
  score: number
  level: 'A' | 'AA' | 'AAA'
  status: 'pass' | 'fail' | 'warning'
}

export interface AccessibilityViolation {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  help: string
  helpUrl: string
  nodes: AccessibilityNode[]
  tags: string[]
}

export interface AccessibilityPass {
  id: string
  description: string
  nodes: AccessibilityNode[]
}

export interface AccessibilityIncomplete {
  id: string
  description: string
  nodes: AccessibilityNode[]
}

export interface AccessibilityNode {
  target: string[]
  html: string
  failureSummary?: string
  element?: HTMLElement
}

export interface ColorContrastResult {
  foreground: string
  background: string
  ratio: number
  level: 'AA' | 'AAA' | 'fail'
  size: 'normal' | 'large'
  passes: boolean
}

export interface KeyboardNavigationResult {
  element: string
  accessible: boolean
  focusable: boolean
  tabIndex: number
  ariaLabel?: string
  role?: string
  issues: string[]
}

export interface ScreenReaderResult {
  element: string
  announcement: string
  context: string
  clarity: 'excellent' | 'good' | 'fair' | 'poor'
  issues: string[]
}

export interface AccessibilityAuditReport {
  overview: {
    url: string
    timestamp: string
    totalScore: number
    wcagLevel: 'A' | 'AA' | 'AAA'
    status: 'pass' | 'fail' | 'warning'
  }
  summary: {
    violations: number
    passes: number
    incomplete: number
    colorContrastIssues: number
    keyboardIssues: number
    screenReaderIssues: number
  }
  sections: {
    core: AccessibilityTestResult
    colorContrast: ColorContrastResult[]
    keyboardNavigation: KeyboardNavigationResult[]
    screenReader: ScreenReaderResult[]
    focusManagement: FocusManagementResult[]
    ariaCompliance: AriaComplianceResult[]
  }
  recommendations: AccessibilityRecommendation[]
  regression: AccessibilityRegressionResult[]
}

export interface FocusManagementResult {
  component: string
  scenario: string
  initialFocus: boolean
  focusTrap: boolean
  focusReturn: boolean
  tabOrder: boolean
  issues: string[]
}

export interface AriaComplianceResult {
  element: string
  attributes: {
    [key: string]: {
      present: boolean
      value: string
      valid: boolean
      required: boolean
    }
  }
  roles: {
    implicit: string
    explicit?: string
    valid: boolean
  }
  issues: string[]
}

export interface AccessibilityRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'keyboard' | 'screen-reader' | 'color-contrast' | 'focus' | 'aria' | 'structure'
  title: string
  description: string
  solution: string
  wcagReference: string
  examples: string[]
}

export interface AccessibilityRegressionResult {
  testName: string
  previousScore: number
  currentScore: number
  difference: number
  status: 'improved' | 'degraded' | 'stable'
  affectedElements: string[]
}

// Core configuration for accessibility testing
export const ACCESSIBILITY_CONFIG = {
  wcag: {
    level: 'AA' as const,
    version: '2.1' as const,
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
  },
  colorContrast: {
    normalText: {
      aa: 4.5,
      aaa: 7
    },
    largeText: {
      aa: 3,
      aaa: 4.5
    }
  },
  viewport: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1440, height: 900 }
  },
  timeout: {
    pageLoad: 10000,
    interaction: 5000,
    assertion: 3000
  }
} as const

// Test selectors for common UI elements
export const ACCESSIBILITY_SELECTORS = {
  interactive: [
    'button',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[role="menuitem"]'
  ].join(', '),
  
  landmarks: [
    'main',
    'nav',
    'aside',
    'header',
    'footer',
    '[role="main"]',
    '[role="navigation"]',
    '[role="complementary"]',
    '[role="banner"]',
    '[role="contentinfo"]'
  ].join(', '),
  
  headings: 'h1, h2, h3, h4, h5, h6, [role="heading"]',
  
  images: 'img, [role="img"], svg[role="img"]',
  
  forms: 'form, [role="form"], fieldset, legend, label, input, select, textarea, button[type="submit"]',
  
  modals: '[role="dialog"], [role="alertdialog"], .modal, [aria-modal="true"]',
  
  liveRegions: '[aria-live], [role="status"], [role="alert"], [role="log"]'
} as const

// Common accessibility utilities
export const AccessibilityUtils = {
  /**
   * Calculate color contrast ratio between foreground and background colors
   */
  calculateContrastRatio: (foreground: string, background: string): number => {
    const getRGB = (color: string) => {
      const hex = color.replace('#', '')
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
      }
    }

    const getLuminance = (rgb: { r: number; g: number; b: number }) => {
      const rsRGB = rgb.r / 255
      const gsRGB = rgb.g / 255
      const bsRGB = rgb.b / 255

      const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
      const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
      const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const fgRGB = getRGB(foreground)
    const bgRGB = getRGB(background)
    const fgLuminance = getLuminance(fgRGB)
    const bgLuminance = getLuminance(bgRGB)

    const lightest = Math.max(fgLuminance, bgLuminance)
    const darkest = Math.min(fgLuminance, bgLuminance)

    return (lightest + 0.05) / (darkest + 0.05)
  },

  /**
   * Check if an element is properly labeled
   */
  isProperlyLabeled: (element: HTMLElement): boolean => {
    const ariaLabel = element.getAttribute('aria-label')
    const ariaLabelledby = element.getAttribute('aria-labelledby')
    const title = element.getAttribute('title')
    
    if (ariaLabel && ariaLabel.trim()) return true
    if (ariaLabelledby) {
      const labelElement = document.getElementById(ariaLabelledby)
      return labelElement ? labelElement.textContent?.trim() !== '' : false
    }
    if (title && title.trim()) return true
    
    // Check for associated label
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
      const id = element.getAttribute('id')
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`)
        return label ? label.textContent?.trim() !== '' : false
      }
    }
    
    return element.textContent?.trim() !== ''
  },

  /**
   * Check if an element is keyboard accessible
   */
  isKeyboardAccessible: (element: HTMLElement): boolean => {
    const tagName = element.tagName.toLowerCase()
    const tabIndex = element.getAttribute('tabindex')
    const role = element.getAttribute('role')
    
    // Naturally focusable elements
    const naturallyFocusable = ['a', 'button', 'input', 'select', 'textarea']
    if (naturallyFocusable.includes(tagName)) {
      return !element.hasAttribute('disabled')
    }
    
    // Elements with positive tabindex
    if (tabIndex && parseInt(tabIndex) >= 0) return true
    
    // Elements with interactive roles
    const interactiveRoles = ['button', 'link', 'tab', 'menuitem', 'option']
    if (role && interactiveRoles.includes(role)) return true
    
    return false
  },

  /**
   * Get the accessible name of an element
   */
  getAccessibleName: (element: HTMLElement): string => {
    const ariaLabel = element.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel

    const ariaLabelledby = element.getAttribute('aria-labelledby')
    if (ariaLabelledby) {
      const labelElement = document.getElementById(ariaLabelledby)
      if (labelElement) return labelElement.textContent || ''
    }

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
      const id = element.getAttribute('id')
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`)
        if (label) return label.textContent || ''
      }
    }

    const title = element.getAttribute('title')
    if (title) return title

    return element.textContent || ''
  }
}

export default {
  AccessibilityUtils,
  ACCESSIBILITY_CONFIG,
  ACCESSIBILITY_SELECTORS
}