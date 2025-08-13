import { clearCacheAndRevalidate } from '@/lib/cache'
import { createErrorResponse, createSuccessResponse, handleAuthError } from '@/lib/error-handler'
import { NextRequest, NextResponse } from 'next/server'

// Optional secret to protect endpoint
const WEBHOOK_SECRET = process.env.REVALIDATE_SECRET

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tag, secret } = body

    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
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

    return createSuccessResponse({ revalidated: true, tag }, 'Cache revalidated successfully')
  } catch (error: any) {
    return createErrorResponse(error, 400)
  }
}
