import crypto from 'crypto'

// 서버 전용: 시크릿 비교와 Bearer 헤더 확인을 한곳에 둔다

/** 길이가 다르면 바로 false, 같으면 timing-safe 비교 (바이트 수 기준) */
export function isValidSecret(provided: unknown, expected: string): boolean {
  if (typeof provided !== 'string' || expected.length === 0) {
    return false
  }
  const providedBuf = Buffer.from(provided, 'utf8')
  const expectedBuf = Buffer.from(expected, 'utf8')
  if (providedBuf.length !== expectedBuf.length) {
    return false
  }
  return crypto.timingSafeEqual(providedBuf, expectedBuf)
}

/**
 * `Authorization: Bearer <secret>` 이 환경변수 envName 의 값과 같은지.
 * 환경변수가 비어 있으면 맞는 값이 없으므로 늘 false(설정 누락 시 열리지 않게)
 */
export function hasBearerSecret(
  headers: Pick<Headers, 'get'>,
  envName: string
): boolean {
  const expected = process.env[envName] ?? ''
  const header = headers.get('authorization') ?? ''
  const provided = header.startsWith('Bearer ') ? header.slice(7) : ''
  return isValidSecret(provided, expected)
}
