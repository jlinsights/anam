/**
 * 🔒 Enhanced Security Guard for Debug Routes
 * SuperClaude Pattern: Multi-layer security validation
 */

interface SecurityContext {
  ip?: string
  userAgent?: string
  environment: string
  timestamp: number
}

// 🔐 IP Whitelist for Production Debug Access (if absolutely necessary)
const ALLOWED_IPS = [
  '127.0.0.1',
  '::1',
  // Add specific IP addresses if production debug access is required
  // '192.168.1.100', // Example: specific admin IP
]

export function isDebugAllowed(context?: SecurityContext): boolean {
  const env = process.env.NODE_ENV

  // ✅ Always allow in development
  if (env === 'development' || env === 'test') {
    return true
  }

  // 🚨 Strict production security
  if (env === 'production') {
    // Production debug access requires explicit flag AND IP whitelist
    const explicitlyEnabled = process.env.ENABLE_DEBUG_ROUTES === 'true'
    const ipAllowed = context?.ip ? ALLOWED_IPS.includes(context.ip) : false
    
    // Log security attempts in production
    if (explicitlyEnabled || context) {
      console.warn('🔒 Production debug access attempt:', {
        enabled: explicitlyEnabled,
        ip: context?.ip,
        allowed: ipAllowed,
        timestamp: new Date().toISOString()
      })
    }
    
    return explicitlyEnabled && ipAllowed
  }

  // 🔒 Default deny for unknown environments
  return false
}

// 🎯 SuperClaude Pattern: Request Context Extraction
export function getSecurityContext(request?: Request): SecurityContext {
  const headers = request?.headers
  
  return {
    ip: getClientIP(headers),
    userAgent: headers?.get('user-agent') || 'unknown',
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: Date.now()
  }
}

function getClientIP(headers?: Headers): string {
  if (!headers) return 'unknown'
  
  // Check various IP headers in order of preference
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-cluster-client-ip'
  ]
  
  for (const header of ipHeaders) {
    const value = headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim()
    }
  }
  
  return 'unknown'
}

// 🔒 Enhanced Security Check with Logging
export function validateDebugAccess(request?: Request): {
  allowed: boolean
  reason: string
  context: SecurityContext
} {
  const context = getSecurityContext(request)
  const allowed = isDebugAllowed(context)
  
  let reason = 'Access denied'
  if (allowed) {
    reason = context.environment === 'production' 
      ? 'Production access granted (IP whitelisted)' 
      : 'Development access granted'
  } else if (context.environment === 'production') {
    reason = 'Production access denied (debug disabled or IP not whitelisted)'
  }
  
  return { allowed, reason, context }
}