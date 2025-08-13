import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Error types for better categorization
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  DATABASE = 'DATABASE_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
}

/**
 * Sanitized error response interface
 */
interface ErrorResponse {
  success: false
  message: string
  type?: ErrorType
  details?: any
  timestamp: string
}

/**
 * Sanitizes error messages for production
 * Removes stack traces and sensitive information
 */
function sanitizeError(error: any): { message: string; type: ErrorType; details?: any } {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return {
      message: 'Invalid input data provided',
      type: ErrorType.VALIDATION,
      details: process.env.NODE_ENV === 'development' ? error.errors : undefined,
    }
  }

  // Handle known error types
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return {
      message: 'External service temporarily unavailable',
      type: ErrorType.EXTERNAL_SERVICE,
    }
  }

  if (error.code === 'UNAUTHORIZED' || error.status === 401) {
    return {
      message: 'Authentication required',
      type: ErrorType.AUTHENTICATION,
    }
  }

  if (error.code === 'FORBIDDEN' || error.status === 403) {
    return {
      message: 'Access denied',
      type: ErrorType.AUTHORIZATION,
    }
  }

  if (error.code === 'NOT_FOUND' || error.status === 404) {
    return {
      message: 'Resource not found',
      type: ErrorType.NOT_FOUND,
    }
  }

  // Database errors
  if (error.code?.startsWith('P') || error.name === 'PrismaClientKnownRequestError') {
    return {
      message: 'Database operation failed',
      type: ErrorType.DATABASE,
    }
  }

  // Generic error handling
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    message: isProduction ? 'Internal server error' : (error.message || 'Unknown error'),
    type: ErrorType.INTERNAL,
    details: isProduction ? undefined : {
      name: error.name,
      message: error.message,
      // Never include stack traces in production
      stack: undefined,
    },
  }
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: any,
  status: number = 500,
  customMessage?: string
): NextResponse {
  const sanitized = sanitizeError(error)
  
  const response: ErrorResponse = {
    success: false,
    message: customMessage || sanitized.message,
    type: sanitized.type,
    details: sanitized.details,
    timestamp: new Date().toISOString(),
  }

  // Log error for debugging (sanitized in production)
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      type: sanitized.type,
      status,
    })
  } else {
    // In production, log only essential info without sensitive data
    console.error('API Error:', {
      message: sanitized.message,
      type: sanitized.type,
      status,
      timestamp: response.timestamp,
    })
  }

  return NextResponse.json(response, { status })
}

/**
 * Handles validation errors specifically
 */
export function handleValidationError(error: ZodError): NextResponse {
  return createErrorResponse(error, 400)
}

/**
 * Handles authentication errors
 */
export function handleAuthError(message: string = 'Authentication required'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      type: ErrorType.AUTHENTICATION,
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  )
}

/**
 * Handles not found errors
 */
export function handleNotFoundError(resource: string = 'Resource'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: `${resource} not found`,
      type: ErrorType.NOT_FOUND,
      timestamp: new Date().toISOString(),
    },
    { status: 404 }
  )
}

/**
 * Handles external service errors with fallback
 */
export function handleExternalServiceError(
  error: any,
  fallbackData?: any
): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (fallbackData) {
    // Return fallback data with warning
    return NextResponse.json({
      success: true,
      message: 'Using fallback data due to service unavailability',
      data: fallbackData,
      warning: 'External service temporarily unavailable',
      timestamp: new Date().toISOString(),
    })
  }

  return createErrorResponse(error, 503, 'External service temporarily unavailable')
}

/**
 * Success response helper
 */
export function createSuccessResponse(
  data: any,
  message: string = 'Success',
  status: number = 200
): NextResponse {
  return NextResponse.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }, { status })
}