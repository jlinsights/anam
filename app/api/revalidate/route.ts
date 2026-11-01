import { clearCacheAndRevalidate } from '@/lib/cache'
import {
  createErrorResponse,
  createSuccessResponse,
  handleAuthError,
} from '@/lib/error-handler'
import { NextRequest, NextResponse } from 'next/server'
import { isValidSecret } from '@/lib/server-secret'

// 시크릿이 없으면 누구나 캐시를 무효화할 수 있으므로 필수로 둔다
const WEBHOOK_SECRET = process.env.REVALIDATE_SECRET

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tag, secret } = body

    if (!WEBHOOK_SECRET) {
      return createErrorResponse(
        new Error('REVALIDATE_SECRET is not configured'),
        503,
        'Revalidation is not configured'
      )
    }

    if (!isValidSecret(secret, WEBHOOK_SECRET)) {
      return handleAuthError('Invalid secret')
    }

    if (!tag || typeof tag !== 'string') {
      return createErrorResponse(
        new Error('Missing or invalid tag parameter'),
        400,
        'Missing tag parameter'
      )
    }

    clearCacheAndRevalidate(tag)

    return createSuccessResponse(
      { revalidated: true, tag },
      'Cache revalidated successfully'
    )
  } catch (error: any) {
    return createErrorResponse(error, 400)
  }
}
