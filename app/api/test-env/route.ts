import { createSuccessResponse } from '@/lib/error-handler'

export async function GET() {
  // Only expose environment info in development
  if (process.env.NODE_ENV === 'production') {
    return createSuccessResponse(
      { env: 'production' },
      'Environment information is not available in production'
    )
  }

  return createSuccessResponse(
    {
      airtable_key: process.env.AIRTABLE_API_KEY ? 'exists' : 'missing',
      airtable_base: process.env.AIRTABLE_BASE_ID ? 'exists' : 'missing',
      node_env: process.env.NODE_ENV,
    },
    'Environment variables status retrieved'
  )
}
