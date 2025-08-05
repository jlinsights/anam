/**
 * API Utilities
 * Common utilities for API route handling, error management, and response formatting
 */

import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  metadata?: Record<string, any>
}

export interface ApiErrorInterface {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

/**
 * Standard API error handler
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  // Handle known error types
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code
      },
      { status: error.statusCode || 500 }
    )
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 404 }
      )
    }

    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 400 }
      )
    }

    if (error.message.includes('unauthorized') || error.message.includes('permission')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 403 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }

  // Handle unknown error types
  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred'
    },
    { status: 500 }
  )
}

/**
 * Create API success response
 */
export function createSuccessResponse<T>(
  data: T,
  metadata?: Record<string, any>,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    metadata,
    message
  })
}

/**
 * Create API error response
 */
export function createErrorResponse(
  error: string,
  statusCode: number = 400,
  code?: string,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      details
    },
    { status: statusCode }
  )
}

/**
 * Validate request body
 */
export function validateRequestBody<T>(
  body: any,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields?: string[]; data?: T } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, missingFields: ['Valid request body required'] }
  }

  const missingFields: string[] = []
  
  for (const field of requiredFields) {
    if (!(field in body) || body[field] === undefined || body[field] === null) {
      missingFields.push(String(field))
    }
  }

  if (missingFields.length > 0) {
    return { isValid: false, missingFields }
  }

  return { isValid: true, data: body as T }
}

/**
 * Validate query parameters
 */
export function validateQueryParams(
  searchParams: URLSearchParams,
  requiredParams: string[] = [],
  optionalParams: string[] = []
): { isValid: boolean; missingParams?: string[]; params?: Record<string, string> } {
  const missingParams: string[] = []
  const params: Record<string, string> = {}

  // Check required parameters
  for (const param of requiredParams) {
    const value = searchParams.get(param)
    if (!value) {
      missingParams.push(param)
    } else {
      params[param] = value
    }
  }

  if (missingParams.length > 0) {
    return { isValid: false, missingParams }
  }

  // Add optional parameters
  for (const param of optionalParams) {
    const value = searchParams.get(param)
    if (value) {
      params[param] = value
    }
  }

  return { isValid: true, params }
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor(
    private windowMs: number = 60000, // 1 minute
    private maxRequests: number = 100
  ) {
    // Clean up old entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, windowMs)
  }

  /**
   * Check if request is allowed
   */
  checkRateLimit(identifier: string): { allowed: boolean; remainingRequests?: number; resetTime?: number } {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get existing requests for this identifier
    const existingRequests = this.requests.get(identifier) || []
    
    // Filter requests within the current window
    const recentRequests = existingRequests.filter(timestamp => timestamp > windowStart)

    if (recentRequests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...recentRequests)
      const resetTime = oldestRequest + this.windowMs
      
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime
      }
    }

    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)

    return {
      allowed: true,
      remainingRequests: this.maxRequests - recentRequests.length,
      resetTime: now + this.windowMs
    }
  }

  /**
   * Clean up old entries
   */
  private cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.windowMs

    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > windowStart)
      
      if (recentRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, recentRequests)
      }
    }
  }

  /**
   * Destroy rate limiter and clean up
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.requests.clear()
  }
}

/**
 * CORS headers for API responses
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleCorsOptions(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  })
}

/**
 * Generate request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Log API request for monitoring
 */
export function logApiRequest(
  method: string,
  path: string,
  requestId: string,
  duration?: number,
  statusCode?: number
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    requestId,
    method,
    path,
    duration,
    statusCode
  }

  if (duration && statusCode) {
    console.log(`API ${method} ${path} - ${statusCode} (${duration}ms) [${requestId}]`)
  } else {
    console.log(`API ${method} ${path} - Started [${requestId}]`)
  }

  // In production, this would send to monitoring service
  // e.g., send to DataDog, New Relic, or CloudWatch
}

/**
 * Parse JSON body safely
 */
export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    const body = await request.json()
    return body as T
  } catch (error) {
    throw new ApiError('Invalid JSON body', 'INVALID_JSON', 400)
  }
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return String(input)
  }

  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove on* event handlers
    .trim()
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public statusCode: number
  
  constructor(
    message: string,
    public code?: string,
    status: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = status
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter(60000, 100) // 100 requests per minute

/**
 * Middleware for rate limiting
 */
export function rateLimitMiddleware(identifier: string): { allowed: boolean; response?: NextResponse } {
  const rateLimitResult = globalRateLimiter.checkRateLimit(identifier)
  
  if (!rateLimitResult.allowed) {
    const response = NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      { status: 429 }
    )

    response.headers.set('Retry-After', String(Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000)))
    
    return { allowed: false, response }
  }

  return { allowed: true }
}