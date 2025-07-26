import * as Sentry from '@sentry/nextjs'

// Sentry 초기화 상태 캐싱
let sentryInitialized = false

function initSentry() {
  if (sentryInitialized) return

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
  if (!dsn) return // DSN 미설정 시 Sentry 사용 안 함

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1, // 기본 샘플링 비율 (필요 시 조정)
  })
  sentryInitialized = true
}

export function captureError(error: unknown, context?: Record<string, any>) {
  // 항상 콘솔에는 출력하여 개발 중 확인 가능
  console.error(error)

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
  if (!dsn) return // DSN 없으면 조용히 종료

  initSentry()

  Sentry.captureException(
    error instanceof Error ? error : new Error(String(error)),
    {
      extra: context,
    }
  )
}
