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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse webhook payload
    const payload = await request.json()
    console.log('Airtable webhook received:', {
      baseId: payload.base?.id,
      timestamp: payload.timestamp || new Date().toISOString(),
      changes: Object.keys(payload.changedTablesById || {}).length
    })
    
    // Trigger cache revalidation for artworks
    try {
      const revalidateUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`
      const revalidateSecret = process.env.REVALIDATE_SECRET || ''
      
      if (revalidateUrl && revalidateSecret) {
        const revalidateResponse = await fetch(revalidateUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${revalidateSecret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            tags: ['artworks'],
            paths: ['/api/artworks', '/gallery', '/'] 
          })
        })
        
        if (revalidateResponse.ok) {
          console.log('Cache revalidated successfully after Airtable webhook')
        } else {
          console.error('Cache revalidation failed:', revalidateResponse.status)
        }
      }
    } catch (revalidateError) {
      console.error('Failed to revalidate cache:', revalidateError)
    }
    
    const response = {
      success: true,
      message: 'Webhook processed and cache revalidated',
      timestamp: new Date().toISOString()
    }
    
    console.log('Webhook processing completed:', response)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Webhook processing failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
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
    timestamp: new Date().toISOString()
  })
}