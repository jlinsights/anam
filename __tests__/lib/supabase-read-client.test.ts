/**
 * @jest-environment node
 */

// 앱은 Supabase 를 읽기만 한다. 공개 읽기는 RLS 정책(artworks·artist "public read")으로 열려 있으므로
// RLS 를 우회하는 service_role 키를 쓸 이유가 없다. 쿼리에 결함이 생겨도 피해 범위를 anon 권한으로 묶는다.
// service_role 은 scripts/ 의 이관 스크립트만 쓴다.

const createClientMock = jest.fn((_url: string, _key: string) => ({
  from: jest.fn(),
}))
jest.mock('@supabase/supabase-js', () => ({
  createClient: (url: string, key: string) => createClientMock(url, key),
}))

const ORIGINAL_ENV = { ...process.env }

function load() {
  let mod!: typeof import('@/lib/supabase/server')
  jest.isolateModules(() => {
    mod = require('@/lib/supabase/server')
  })
  return mod
}

beforeEach(() => {
  createClientMock.mockClear()
  process.env = { ...ORIGINAL_ENV }
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
})

afterAll(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('서버 읽기용 Supabase 클라이언트', () => {
  it('anon 키로 만든다 (service_role 키는 쓰지 않는다)', () => {
    const client = load().createSupabaseClient()
    expect(client).not.toBeNull()
    expect(createClientMock).toHaveBeenCalledTimes(1)
    expect(createClientMock.mock.calls[0][0]).toBe(
      'https://example.supabase.co'
    )
    expect(createClientMock.mock.calls[0][1]).toBe('anon-key')
  })

  it('anon 키가 없으면 service_role 키로 대신하지 않고 null 을 준다', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const client = load().createSupabaseClient()
    expect(client).toBeNull()
    expect(createClientMock).not.toHaveBeenCalled()
  })

  it('URL 이 없으면 null', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    expect(load().createSupabaseClient()).toBeNull()
  })
})

// 이관 스크립트(scripts/migrate-airtable-to-supabase.ts)는 upsert·insert·update 를 하므로
// RLS 를 우회하는 service_role 클라이언트가 따로 필요하다(Codex 리뷰). 앱 코드는 이것을 쓰면 안 된다.
describe('이관 스크립트용 Supabase 관리자 클라이언트', () => {
  it('service_role 키로 만든다', () => {
    const client = load().createSupabaseAdminClient()
    expect(client).not.toBeNull()
    expect(createClientMock.mock.calls[0][1]).toBe('service-role-key')
  })

  it('service_role 키가 없으면 null', () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    expect(load().createSupabaseAdminClient()).toBeNull()
  })

  it('읽기 클라이언트와 관리자 클라이언트를 섞어 캐시하지 않는다', () => {
    const mod = load()
    mod.createSupabaseClient()
    mod.createSupabaseAdminClient()
    expect(createClientMock.mock.calls.map((c) => c[1])).toEqual([
      'anon-key',
      'service-role-key',
    ])
  })

  it('앱 코드(app·lib·hooks·components)는 관리자 클라이언트를 가져오지 않는다', () => {
    const fs = require('fs') as typeof import('fs')
    const path = require('path') as typeof import('path')
    const root = path.join(__dirname, '..', '..')
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(p)
        else if (/\.(ts|tsx)$/.test(entry.name) && !p.endsWith(path.join('lib', 'supabase', 'server.ts'))) {
          if (fs.readFileSync(p, 'utf8').includes('createSupabaseAdminClient')) offenders.push(path.relative(root, p))
        }
      }
    }
    for (const d of ['app', 'lib', 'hooks', 'components']) walk(path.join(root, d))
    expect(offenders).toEqual([])
  })
})
