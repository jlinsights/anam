import { clearCacheAndRevalidate } from '@/lib/cache'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Timing-safe token comparison
function verifyToken(providedToken: string, expectedToken: string): boolean {
  try {
    if (providedToken.length !== expectedToken.length) {
      return false
    }

    return crypto.timingSafeEqual(
      Buffer.from(providedToken, 'utf8'),
      Buffer.from(expectedToken, 'utf8')
    )
  } catch (error) {
    console.error('Token verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    const providedSecret = authHeader?.replace('Bearer ', '') || ''
    const expectedSecret = process.env.AIRTABLE_WEBHOOK_SECRET || ''

    if (!expectedSecret) {
      console.error('AIRTABLE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    if (!verifyToken(providedSecret, expectedSecret)) {
      console.error('Invalid webhook secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse webhook payload
    const payload = await request.json()
    console.log('Airtable webhook received:', {
      baseId: payload.base?.id,
      timestamp: payload.timestamp || new Date().toISOString(),
      changes: Object.keys(payload.changedTablesById || {}).length,
    })

    // 같은 서버에서 직접 갱신한다. 예전에는 이 사이트의 /api/revalidate 를 HTTP 로 불렀는데
    // 요청 형식(Bearer 헤더 + {tags, paths})이 그 엔드포인트(body.secret·body.tag)와 달라 늘 401 이었고
    // 실패를 삼킨 채 "revalidated" 라고 응답했다
    clearCacheAndRevalidate('artworks')

    const response = {
      success: true,
      message: 'Webhook processed and cache revalidated',
      timestamp: new Date().toISOString(),
    }

    console.log('Webhook processing completed:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Webhook processing failed:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'airtable-webhook',
    timestamp: new Date().toISOString(),
  })
}
