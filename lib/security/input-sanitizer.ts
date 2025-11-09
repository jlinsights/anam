/**
 * Advanced Input Sanitization & Validation System
 * 
 * XSS, SQL Injection, Path Traversal 등 다양한 공격 벡터로부터 보호
 */

interface SanitizationOptions {
  allowHTML?: boolean
  maxLength?: number
  stripTags?: boolean
  normalizeUnicode?: boolean
  preventPathTraversal?: boolean
}

/**
 * XSS 공격 패턴 탐지
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /<meta\b[^>]*>/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /expression\s*\(/gi,
  /@import/gi,
  /\beval\s*\(/gi,
  /\bsetTimeout\s*\(/gi,
  /\bsetInterval\s*\(/gi
]

/**
 * SQL Injection 패턴 탐지
 */
const SQL_INJECTION_PATTERNS = [
  /('|(\\'))|(;)|(\\)|(\*)|(%27)|(%3D)|(SP_)|(\bSP_\b)/gi,
  /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi,
  /(\bOR\b|\bAND\b)\s+\w+\s*=\s*\w+/gi,
  /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)\b/gi,
  /--|\/\*|\*\//gi,
  /\bxp_cmdshell\b/gi,
  /\bsp_executesql\b/gi
]

/**
 * Path Traversal 패턴 탐지
 */
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.[\/\\]/gi,
  /[\/\\]\.\.[\/\\]/gi,
  /\.\.[\/\\]\.\.*/gi,
  /%2e%2e[\/\\]/gi,
  /%252e%252e/gi,
  /\.\.%2f/gi,
  /\.\.%5c/gi
]

/**
 * 위험한 문자열 탐지
 */
function detectMaliciousPatterns(input: string): {
  isXSS: boolean
  isSQLInjection: boolean
  isPathTraversal: boolean
  detectedPatterns: string[]
} {
  const detectedPatterns: string[] = []
  
  const isXSS = XSS_PATTERNS.some(pattern => {
    if (pattern.test(input)) {
      detectedPatterns.push(`XSS: ${pattern.source}`)
      return true
    }
    return false
  })
  
  const isSQLInjection = SQL_INJECTION_PATTERNS.some(pattern => {
    if (pattern.test(input)) {
      detectedPatterns.push(`SQL: ${pattern.source}`)
      return true
    }
    return false
  })
  
  const isPathTraversal = PATH_TRAVERSAL_PATTERNS.some(pattern => {
    if (pattern.test(input)) {
      detectedPatterns.push(`Path: ${pattern.source}`)
      return true
    }
    return false
  })
  
  return {
    isXSS,
    isSQLInjection,
    isPathTraversal,
    detectedPatterns
  }
}

/**
 * HTML 엔티티 인코딩
 */
function escapeHTML(input: string): string {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }
  
  return input.replace(/[&<>"'`=/]/g, char => entityMap[char] || char)
}

/**
 * Unicode 정규화 (동형 문자 공격 방지)
 */
function normalizeUnicode(input: string): string {
  try {
    // NFD 정규화 후 ASCII가 아닌 문자 제거
    return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  } catch (error) {
    console.warn('Unicode normalization failed:', error)
    return input
  }
}

/**
 * Path traversal 문자 제거
 */
function sanitizePathTraversal(input: string): string {
  return input
    .replace(/\.\.[\/\\]/g, '')
    .replace(/[\/\\]\.\.[\/\\]/g, '/')
    .replace(/%2e%2e[\/\\]/gi, '')
    .replace(/%252e%252e/gi, '')
    .replace(/\.\.%2f/gi, '')
    .replace(/\.\.%5c/gi, '')
}

/**
 * 메인 sanitization 함수
 */
export function sanitizeInput(
  input: string,
  options: SanitizationOptions = {}
): {
  sanitized: string
  isClean: boolean
  threats: string[]
  originalLength: number
  sanitizedLength: number
} {
  if (!input || typeof input !== 'string') {
    return {
      sanitized: '',
      isClean: true,
      threats: [],
      originalLength: 0,
      sanitizedLength: 0
    }
  }
  
  const originalLength = input.length
  let sanitized = input
  const threats: string[] = []
  
  // 길이 제한 확인
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength)
    threats.push(`Length exceeded: trimmed to ${options.maxLength} characters`)
  }
  
  // 악성 패턴 탐지
  const detection = detectMaliciousPatterns(sanitized)
  if (detection.detectedPatterns.length > 0) {
    threats.push(...detection.detectedPatterns)
  }
  
  // Unicode 정규화
  if (options.normalizeUnicode !== false) {
    sanitized = normalizeUnicode(sanitized)
  }
  
  // Path traversal 제거
  if (options.preventPathTraversal !== false) {
    sanitized = sanitizePathTraversal(sanitized)
  }
  
  // HTML 태그 처리
  if (!options.allowHTML || options.stripTags) {
    sanitized = escapeHTML(sanitized)
  }
  
  const isClean = threats.length === 0 && originalLength === sanitized.length
  
  return {
    sanitized,
    isClean,
    threats,
    originalLength,
    sanitizedLength: sanitized.length
  }
}

/**
 * 객체의 모든 문자열 필드 sanitize
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: SanitizationOptions = {}
): {
  sanitized: T
  threats: Record<string, string[]>
  isClean: boolean
} {
  const sanitized = { ...obj }
  const threats: Record<string, string[]> = {}
  let hasThreats = false
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const result = sanitizeInput(value, options)
      sanitized[key] = result.sanitized
      
      if (result.threats.length > 0) {
        threats[key] = result.threats
        hasThreats = true
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 중첩된 객체 처리
      const nestedResult = sanitizeObject(value, options)
      sanitized[key] = nestedResult.sanitized
      
      if (!nestedResult.isClean) {
        threats[key] = Object.values(nestedResult.threats).flat()
        hasThreats = true
      }
    }
  }
  
  return {
    sanitized,
    threats,
    isClean: !hasThreats
  }
}

/**
 * URL 파라미터 sanitization
 */
export function sanitizeURL(url: string): {
  sanitized: string
  isClean: boolean
  threats: string[]
} {
  try {
    const urlObj = new URL(url)
    const threats: string[] = []
    
    // Path traversal 검사
    if (PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(urlObj.pathname))) {
      threats.push('Path traversal detected in URL path')
      urlObj.pathname = urlObj.pathname.replace(/\.\.[\/\\]/g, '')
    }
    
    // Query parameters sanitization
    for (const [key, value] of urlObj.searchParams.entries()) {
      const result = sanitizeInput(value, { preventPathTraversal: true })
      if (result.threats.length > 0) {
        threats.push(`Query param ${key}: ${result.threats.join(', ')}`)
        urlObj.searchParams.set(key, result.sanitized)
      }
    }
    
    return {
      sanitized: urlObj.toString(),
      isClean: threats.length === 0,
      threats
    }
  } catch (error) {
    return {
      sanitized: '',
      isClean: false,
      threats: ['Invalid URL format']
    }
  }
}

/**
 * 실시간 위협 모니터링
 */
export class ThreatMonitor {
  private static instance: ThreatMonitor
  private threats: Array<{
    timestamp: Date
    ip: string
    userAgent: string
    threat: string
    input: string
    endpoint: string
  }> = []
  
  private maxLogSize = 1000
  
  static getInstance(): ThreatMonitor {
    if (!ThreatMonitor.instance) {
      ThreatMonitor.instance = new ThreatMonitor()
    }
    return ThreatMonitor.instance
  }
  
  logThreat(
    ip: string,
    userAgent: string,
    threat: string,
    input: string,
    endpoint: string
  ) {
    this.threats.push({
      timestamp: new Date(),
      ip,
      userAgent,
      threat,
      input: input.substring(0, 100), // 처음 100자만 로깅
      endpoint
    })
    
    // 로그 크기 관리
    if (this.threats.length > this.maxLogSize) {
      this.threats = this.threats.slice(-this.maxLogSize)
    }
    
    // 콘솔에 경고 출력
    console.warn(`🚨 Security threat detected from ${ip} at ${endpoint}: ${threat}`)
  }
  
  getThreats(hours: number = 24): typeof this.threats {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.threats.filter(threat => threat.timestamp > cutoff)
  }
  
  getStats(hours: number = 24) {
    const recentThreats = this.getThreats(hours)
    const threatTypes = recentThreats.reduce((acc, threat) => {
      acc[threat.threat] = (acc[threat.threat] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topIPs = recentThreats.reduce((acc, threat) => {
      acc[threat.ip] = (acc[threat.ip] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalThreats: recentThreats.length,
      threatTypes,
      topIPs: Object.entries(topIPs)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      endpoints: recentThreats.reduce((acc, threat) => {
        acc[threat.endpoint] = (acc[threat.endpoint] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }
}

// 전역 인스턴스
export const threatMonitor = ThreatMonitor.getInstance()