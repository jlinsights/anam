import { clearCacheAndRevalidate } from '@/lib/cache'
import { NextRequest, NextResponse } from 'next/server'

// Optional secret to protect endpoint
const WEBHOOK_SECRET = process.env.REVALIDATE_SECRET

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tag, secret } = body

    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    if (!tag || typeof tag !== 'string') {
      return NextResponse.json({ error: 'Missing tag' }, { status: 400 })
    }

    clearCacheAndRevalidate(tag)

    return NextResponse.json({ revalidated: true, tag })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Invalid payload' },
      {
        status: 400,
      }
    )
  }
}
