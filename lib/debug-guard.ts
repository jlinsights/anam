/**
 * Environment guard for debug routes
 * Prevents access to debug endpoints in production unless explicitly enabled
 */
export function isDebugAllowed(): boolean {
  // Allow debug routes in development
  if (process.env.NODE_ENV !== 'production') {
    return true
  }
  
  // Allow debug routes in production if explicitly enabled
  if (process.env.ENABLE_DEBUG_ROUTES === 'true') {
    return true
  }
  
  return false
}