/**
 * @jest-environment node
 */

// #23 이후 앱은 anon 키만 쓴다. 상태 확인이 REST 루트(/rest/v1/)를 부르면 anon 키로는 거부돼
// 운영에서 실제 읽기는 되는데도 supabase 가 "degraded" 로 나왔다(2026-11-01).
// 앱이 실제로 읽는 공개 표(artworks)에서 한 줄을 읽어 확인한다
describe('/api/health Supabase 확인', () => {
  const ORIGINAL_ENV = { ...process.env }
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock as unknown as typeof fetch
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    }
    delete process.env.AIRTABLE_API_KEY
  })

  afterAll(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  async function health() {
    let GET!: typeof import('@/app/api/health/route').GET
    jest.isolateModules(() => {
      GET = require('@/app/api/health/route').GET
    })
    const response = await GET(new Request('http://localhost/api/health'))
    return response.json()
  }

  it('anon 키로 공개 표 artworks 한 줄을 읽어 확인한다 (REST 루트가 아니라)', async () => {
    fetchMock.mockResolvedValue(new Response('[]', { status: 200 }))

    const body = await health()

    const supabaseCall = fetchMock.mock.calls.find(([url]) =>
      String(url).startsWith('https://example.supabase.co')
    )
    expect(String(supabaseCall?.[0])).toBe(
      'https://example.supabase.co/rest/v1/artworks?select=id&limit=1'
    )
    expect(supabaseCall?.[1].headers.apikey).toBe('anon-key')
    expect(body.services.supabase.status).toBe('up')
  })

  it('읽기가 거부되면 up 이 아니다', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 401 }))
    const body = await health()
    expect(body.services.supabase.status).not.toBe('up')
  })
})
