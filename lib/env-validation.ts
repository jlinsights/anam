// 🔒 Environment Variables Validation & Security
// SuperClaude Pattern: Comprehensive Environment Validation

interface EnvironmentConfig {
  // Required variables
  AIRTABLE_API_KEY?: string
  AIRTABLE_BASE_ID?: string
  NEXT_PUBLIC_SITE_URL?: string
  
  // Optional but recommended
  REVALIDATE_SECRET?: string
  NEXT_PUBLIC_SENTRY_DSN?: string
  SENTRY_DSN?: string
  
  // Security flags
  ENABLE_DEBUG_ROUTES?: string
  NODE_ENV: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  config: EnvironmentConfig
}

export function validateEnvironment(): ValidationResult {
  const config: EnvironmentConfig = {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    ENABLE_DEBUG_ROUTES: process.env.ENABLE_DEBUG_ROUTES,
    NODE_ENV: process.env.NODE_ENV || 'development'
  }

  const errors: string[] = []
  const warnings: string[] = []

  // 🚨 Critical Security Checks
  if (config.NODE_ENV === 'production') {
    // Production security validations
    if (config.ENABLE_DEBUG_ROUTES === 'true') {
      errors.push('🚨 SECURITY: Debug routes are enabled in production! Set ENABLE_DEBUG_ROUTES=false')
    }
    
    if (!config.NEXT_PUBLIC_SITE_URL) {
      errors.push('🚨 REQUIRED: NEXT_PUBLIC_SITE_URL must be set in production')
    }
    
    if (!config.REVALIDATE_SECRET) {
      warnings.push('⚠️ SECURITY: REVALIDATE_SECRET not set - webhook revalidation will be insecure')
    }
  }

  // 🔑 API Key Validation
  if (config.AIRTABLE_API_KEY) {
    if (!config.AIRTABLE_API_KEY.startsWith('pat') && !config.AIRTABLE_API_KEY.startsWith('key')) {
      errors.push('🚨 INVALID: AIRTABLE_API_KEY format is incorrect')
    }
    
    if (config.AIRTABLE_API_KEY.length < 20) {
      errors.push('🚨 INVALID: AIRTABLE_API_KEY appears to be too short')
    }
  } else {
    warnings.push('⚠️ MISSING: AIRTABLE_API_KEY - CMS functionality will use fallback data')
  }

  if (config.AIRTABLE_BASE_ID) {
    if (!config.AIRTABLE_BASE_ID.startsWith('app')) {
      errors.push('🚨 INVALID: AIRTABLE_BASE_ID format is incorrect (should start with "app")')
    }
  } else {
    warnings.push('⚠️ MISSING: AIRTABLE_BASE_ID - CMS functionality will use fallback data')
  }

  // 🌐 URL Validation
  if (config.NEXT_PUBLIC_SITE_URL) {
    try {
      new URL(config.NEXT_PUBLIC_SITE_URL)
    } catch {
      errors.push('🚨 INVALID: NEXT_PUBLIC_SITE_URL is not a valid URL')
    }
  }

  // 🔐 Security Token Validation
  if (config.REVALIDATE_SECRET && config.REVALIDATE_SECRET.length < 32) {
    warnings.push('⚠️ WEAK: REVALIDATE_SECRET should be at least 32 characters for security')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config
  }
}

export function getSecureConfig(): EnvironmentConfig {
  const validation = validateEnvironment()
  
  if (!validation.isValid) {
    const errorMessage = `Environment validation failed:\n${validation.errors.join('\n')}`
    throw new Error(errorMessage)
  }

  // Log warnings in development
  if (process.env.NODE_ENV === 'development' && validation.warnings.length > 0) {
    console.warn('Environment warnings:')
    validation.warnings.forEach(warning => console.warn(warning))
  }

  return validation.config
}

// 🎯 SuperClaude Pattern: Runtime Environment Check
export function checkProductionSecurity(): boolean {
  if (process.env.NODE_ENV !== 'production') return true

  const securityChecks = [
    // Debug routes disabled
    process.env.ENABLE_DEBUG_ROUTES !== 'true',
    
    // Required production variables
    !!process.env.NEXT_PUBLIC_SITE_URL,
    
    // No development keys in production
    !process.env.AIRTABLE_API_KEY?.includes('development'),
    !process.env.AIRTABLE_API_KEY?.includes('test'),
    
    // Secure protocols
    process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://') || false
  ]

  return securityChecks.every(Boolean)
}

// 🔒 Sanitized Environment for Client-Side
export function getClientConfig() {
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    isProduction: process.env.NODE_ENV === 'production',
    enablePerformanceMonitoring: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
    culturalContext: process.env.NEXT_PUBLIC_CULTURAL_CONTEXT || 'eternal',
    bmadOptimizationLevel: process.env.NEXT_PUBLIC_BMAD_OPTIMIZATION_LEVEL || 'standard'
  }
}

export default validateEnvironment