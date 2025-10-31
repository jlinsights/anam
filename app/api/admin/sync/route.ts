import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Timing-safe token comparison
function verifyAdminToken(providedToken: string, expectedToken: string): boolean {
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Return basic status without database dependency
    return NextResponse.json({
      status: 'healthy',
      message: 'Admin sync API is operational',
      last_sync: null,
      recent_operations: {
        total: 0,
        successful: 0,
        failed: 0
      },
      timestamp: new Date().toISOString(),
      note: 'Currently using Airtable direct integration. Supabase sync can be added later.'
    })
    
  } catch (error) {
    console.error('Admin sync status error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('Manual cache revalidation triggered')
    
    // Trigger cache revalidation
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
          console.log('Manual cache revalidation successful')
          
          return NextResponse.json({
            success: true,
            message: 'Cache revalidated successfully',
            timestamp: new Date().toISOString()
          })
        } else {
          throw new Error(`Revalidation failed with status: ${revalidateResponse.status}`)
        }
      } else {
        throw new Error('Revalidation configuration missing')
      }
    } catch (revalidateError) {
      console.error('Manual cache revalidation failed:', revalidateError)
      
      return NextResponse.json({
        success: false,
        error: 'Cache revalidation failed',
        details: revalidateError instanceof Error ? revalidateError.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Manual sync failed:', error)
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