/*
  Airtable Client Helper
  ----------------------
  1. 환경 변수 검사 (build-time 에러 방지)
  2. Singleton 패턴으로 Airtable Base 재사용 → 연결 비용/Rate-Limit 보호
  3. requestTimeout 증가 및 AbortError 방지
*/

/** 필수 ENV 확인 */
function assertAirtableEnv() {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error(
      '[Airtable] AIRTABLE_API_KEY 또는 AIRTABLE_BASE_ID 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.'
    )
  }
}

let basePromise: Promise<any> | null = null

/**
 * 재사용 가능한 Airtable Base 인스턴스 반환
 */
export async function getBase() {
  if (basePromise) return basePromise

  assertAirtableEnv()
  basePromise = (async () => {
    const { default: Airtable } = await import('airtable')
    const airtable = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY!,
      requestTimeout: 15000, // 15초로 증가 (AbortError 방지)
      endpointUrl: 'https://api.airtable.com',
    })
    return airtable.base(process.env.AIRTABLE_BASE_ID!)
  })()

  return basePromise
}

/**
 * 에러 객체를 상세히 로깅하는 헬퍼 함수
 */
function logError(error: any, context: string) {
  const errorInfo = {
    name: error?.name || 'Unknown',
    message: error?.message || 'No message',
    stack: error?.stack || 'No stack trace',
    code: error?.code || 'No code',
    status: error?.status || error?.statusCode || 'No status',
    type: typeof error,
    raw: error,
  }

  console.error(`[Airtable] ${context}:`, {
    ...errorInfo,
    // 환경변수 상태도 함께 로깅 (민감한 정보는 마스킹)
    env: {
      hasApiKey: !!process.env.AIRTABLE_API_KEY,
      hasBaseId: !!process.env.AIRTABLE_BASE_ID,
      apiKeyLength: process.env.AIRTABLE_API_KEY?.length || 0,
      baseIdLength: process.env.AIRTABLE_BASE_ID?.length || 0,
    },
  })
}

/**
 * AbortError 방지를 위한 안전한 요청 래퍼
 */
export async function safeAirtableRequest<T>(
  operation: () => Promise<T>,
  retries: number = 3
): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      // AbortError 또는 타임아웃 에러 처리
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        console.warn(
          `[Airtable] Request aborted, attempt ${attempt}/${retries}`
        )
        if (attempt < retries) {
          // 재시도 전 대기 시간 (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
      }

      // 각 시도에서 에러 로깅 (레벨 구분)
      if (attempt < retries) {
        logError(error, `Attempt ${attempt}/${retries} failed, retrying`)
        // 재시도 전 대기 시간
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      } else {
        // 최종 실패
        logError(error, `Final attempt ${attempt}/${retries} failed`)
        throw error
      }
    }
  }

  return null
}
