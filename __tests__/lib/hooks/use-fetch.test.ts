import { StrictMode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useFetch } from '@/hooks/use-api-request'

const jsonResponse = (data: unknown) =>
  new Response(JSON.stringify({ success: true, data }), {
    headers: { 'content-type': 'application/json' },
  })

// 홈 "작품 갤러리"가 "작품을 불러오는 중..."에 멈춘 회귀:
// 요청이 끝나기 전에 다시 렌더되면(부모 상태 변경 등) 진행 중 요청이 취소되고
// loading 이 영영 true 로 남았다
describe('useFetch', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('요청 중에 다시 렌더되어도 데이터를 받고 loading 을 끝낸다', async () => {
    let resolve: (value: Response) => void = () => {}
    global.fetch = jest.fn(
      () => new Promise<Response>((r) => (resolve = r))
    ) as unknown as typeof fetch

    const { result, rerender } = renderHook(() =>
      useFetch<number[]>('/api/artworks', { immediate: true, timeout: 5000 })
    )
    expect(result.current.loading).toBe(true)

    rerender()
    rerender()

    resolve(
      new Response(JSON.stringify({ success: true, data: [1, 2, 3] }), {
        headers: { 'content-type': 'application/json' },
      })
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([1, 2, 3])
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  // StrictMode 는 마운트 효과를 두 번 돌린다: 첫 요청이 취소되고 곧바로 새 요청이 나간다.
  // 취소된 첫 요청의 AbortError 처리가 새 요청 진행 중에 loading=false·타임아웃 오류를 써서는 안 된다
  it('StrictMode 에서 취소된 첫 요청이 새 요청의 상태를 덮어쓰지 않는다', async () => {
    const pending: Array<(value: Response) => void> = []
    global.fetch = jest.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))
          )
          pending.push(resolve)
        })
    ) as unknown as typeof fetch

    const { result } = renderHook(
      () =>
        useFetch<number[]>('/api/artworks', { immediate: true, timeout: 5000 }),
      { wrapper: StrictMode }
    )

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2))
    // 취소된 첫 요청의 catch 가 끝날 때까지 기다린다
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()

    await act(async () => {
      pending[1](jsonResponse([1, 2, 3]))
    })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([1, 2, 3])
    expect(result.current.error).toBeNull()
  })

  it('진짜 타임아웃은 여전히 loading 을 끝내고 오류를 남긴다', async () => {
    global.fetch = jest.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))
          )
        })
    ) as unknown as typeof fetch

    const { result } = renderHook(() =>
      useFetch<number[]>('/api/artworks', { immediate: true, timeout: 20 })
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toMatch(/timed out/)
  })
})

// 예전에는 /api/artworks·/api/artist 가 실패하면 이 훅이 지어낸 작품 61점·작가 정보를
// 성공 데이터처럼 돌려줬다. 실패는 오류로 남아 화면이 오류 상태를 보여야 한다
describe('useFetch: 실패를 지어낸 데이터로 바꾸지 않는다', () => {
  const originalFetch = global.fetch
  afterEach(() => {
    global.fetch = originalFetch
  })

  it.each([
    ['/api/artworks', 'HTTP 503'],
    ['/api/artist', 'HTTP 503'],
    ['/api/artworks', 'network'],
    ['/api/artist', 'network'],
  ])('%s %s → data 없음, 오류 있음', async (url, kind) => {
    global.fetch = jest.fn(async () => {
      if (kind === 'network') throw new TypeError('Failed to fetch')
      return new Response(JSON.stringify({ success: false, data: null }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      })
    }) as unknown as typeof fetch

    const { result } = renderHook(() =>
      useFetch<unknown>(url, {
        immediate: true,
        retryAttempts: 0,
        timeout: 5000,
      })
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeTruthy()
  })
})
