import { clearCacheAndRevalidate } from '@/lib/cache'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Timing-safe token comparison
function verifyAdminToken(
  providedToken: string,
  expectedToken: string
): boolean {
  try {
    if (providedToken.length !== expectedToken.length) {
      return false
    }

    return crypto.timingSafeEqual(
      Buffer.from(providedToken, 'utf8'),
      Buffer.from(expectedToken, 'utf8')
    )
  } catch (error) {
    console.error('Admin token verification error:', error)
    return false
  }
}

// GET: Get sync status
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization')
    const providedToken = authHeader?.replace('Bearer ', '') || ''
    const expectedToken = process.env.ADMIN_SYNC_TOKEN || ''

    if (!expectedToken) {
      return NextResponse.json(
        { error: 'Admin token not configured' },
        { status: 500 }
      )
    }

    if (!verifyAdminToken(providedToken, expectedToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return basic status without database dependency
    return NextResponse.json({
      status: 'healthy',
      message: 'Admin sync API is operational',
      last_sync: null,
      recent_operations: {
        total: 0,
        successful: 0,
        failed: 0,
      },
      timestamp: new Date().toISOString(),
      note: 'Currently using Airtable direct integration. Supabase sync can be added later.',
    })
  } catch (error) {
    console.error('Admin sync status error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// POST: Manual cache revalidation
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization')
    const providedToken = authHeader?.replace('Bearer ', '') || ''
    const expectedToken = process.env.ADMIN_SYNC_TOKEN || ''

    if (!expectedToken) {
      return NextResponse.json(
        { error: 'Admin token not configured' },
        { status: 500 }
      )
    }

    if (!verifyAdminToken(providedToken, expectedToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Manual cache revalidation triggered')

    // 같은 서버에서 직접 갱신한다. 예전에는 이 사이트의 /api/revalidate 를 HTTP 로 불렀는데
    // 요청 형식(Bearer 헤더 + {tags, paths})이 그 엔드포인트(body.secret·body.tag)와 달라 늘 401 이었다
    clearCacheAndRevalidate('artworks')
    console.log('Manual cache revalidation done')

    return NextResponse.json({
      success: true,
      message: 'Cache revalidated successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Manual sync failed:', error)
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
