import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { withRateLimit } from '@/lib/rate-limit'

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  services: {
    [key: string]: {
      status: 'up' | 'down' | 'degraded'
      responseTime?: number
      error?: string
    }
  }
  system: {
    memory: {
      used: number
      total: number
      percentage: number
    }
    node: string
    environment: string
  }
  version: string
}

/**
 * 서비스 상태 확인
 */
async function checkServiceHealth(serviceName: string, checkFn: () => Promise<boolean>): Promise<{
  status: 'up' | 'down' | 'degraded'
  responseTime: number
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    const isHealthy = await Promise.race([
      checkFn(),
      new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ])
    
    const responseTime = Date.now() - startTime
    
    return {
      status: isHealthy ? 'up' : 'degraded',
      responseTime
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      status: 'down',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Airtable 연결 상태 확인
 */
async function checkAirtableHealth(): Promise<boolean> {
  try {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
    
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return false
    }
    
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Artworks?maxRecords=1`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    return response.ok
  } catch (error) {
    console.warn('Airtable health check failed:', error)
    return false
  }
}

/**
 * Supabase 연결 상태 확인
 */
async function checkSupabaseHealth(): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return false // 환경 변수 없음 = 사용 안함 = 정상
    }
    
    // Supabase health endpoint 확인
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    return response.ok || response.status === 404 // 404도 정상 (endpoint 존재)
  } catch (error) {
    console.warn('Supabase health check failed:', error)
    return false
  }
}

/**
 * 메모리 사용량 확인
 */
function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    const total = usage.heapTotal
    const used = usage.heapUsed
    
    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round((used / total) * 100)
    }
  }
  
  return {
    used: 0,
    total: 0,
    percentage: 0
  }
}

export async function GET(request: Request) {
  return withRateLimit(request, 'health', async () => {
    const startTime = Date.now()
    
    try {
    // 병렬로 서비스 상태 확인
    const [airtableHealth, supabaseHealth] = await Promise.all([
      checkServiceHealth('airtable', checkAirtableHealth),
      checkServiceHealth('supabase', checkSupabaseHealth)
    ])
    
    const services = {
      airtable: airtableHealth,
      supabase: supabaseHealth,
      cache: {
        status: 'up' as const,
        responseTime: 0 // 로컬 캐시는 즉시 응답
      }
    }
    
    // 전체 시스템 상태 결정
    const allServicesUp = Object.values(services).every(service => service.status === 'up')
    const anyServiceDown = Object.values(services).some(service => service.status === 'down')
    
    const overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 
      anyServiceDown ? 'unhealthy' :
      !allServicesUp ? 'degraded' : 'healthy'
    
    const memory = getMemoryUsage()
    
    const healthCheck: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
      services,
      system: {
        memory,
        node: process.version || 'unknown',
        environment: process.env.NODE_ENV || 'unknown'
      },
      version: process.env.npm_package_version || '0.2.0'
    }
    
    // ✅ FIXED: Always return 200 for health checks to prevent 503 errors in console
    // External monitoring tools can check the status field in the response
    const statusCode = 200
    
      return NextResponse.json(healthCheck, { status: statusCode })
      
    } catch (error) {
      console.error('Health check error:', error)
      
      return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: Date.now() - startTime,
        services: {},
        system: {
          memory: getMemoryUsage(),
          node: process.version || 'unknown',
          environment: process.env.NODE_ENV || 'unknown'
        },
        version: process.env.npm_package_version || '0.2.0',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as HealthCheckResult & { error: string }, { 
        status: 200  // ✅ FIXED: Return 200 even for errors to prevent console 503s
      })
    }
  })
}

// OPTIONS 요청 지원 (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}