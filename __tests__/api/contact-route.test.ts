/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const sendMail = jest.fn().mockResolvedValue({})
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail })),
}))

const ENV_KEYS = ['SMTP_USER', 'SMTP_PASS', 'CONTACT_EMAIL'] as const
const ORIGINAL = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]))

function setEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string>>) {
  ENV_KEYS.forEach((k) => delete process.env[k])
  Object.assign(process.env, values)
}

function loadRoute() {
  let route: typeof import('@/app/api/contact/route')
  jest.isolateModules(() => {
    route = require('@/app/api/contact/route')
  })
  return route!.POST
}

function request(ip: string) {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
    body: JSON.stringify({
      name: '홍길동',
      email: 'visitor@example.com',
      subject: '작품 문의',
      message: '소장 문의드립니다.',
    }),
  })
}

beforeEach(() => sendMail.mockClear())
afterAll(() => {
  ENV_KEYS.forEach((k) => {
    if (ORIGINAL[k] === undefined) delete process.env[k]
    else process.env[k] = ORIGINAL[k]
  })
})

describe('POST /api/contact', () => {
  it('CONTACT_EMAIL이 없으면 배옥영 작가 메일로 보낸다', async () => {
    setEnv({ SMTP_USER: 'bot@example.com', SMTP_PASS: 'x' })
    const res = await loadRoute()(request('10.0.0.1'))
    expect(res.status).toBe(200)
    expect(sendMail).toHaveBeenCalledTimes(1)
    expect(sendMail.mock.calls[0][0].to).toBe('anam8488@hanmail.net')
    expect(sendMail.mock.calls[0][0].replyTo).toBe('visitor@example.com')
  })

  it('CONTACT_EMAIL이 있으면 그 주소로 보낸다', async () => {
    setEnv({
      SMTP_USER: 'bot@example.com',
      SMTP_PASS: 'x',
      CONTACT_EMAIL: 'other@example.com',
    })
    await loadRoute()(request('10.0.0.2'))
    expect(sendMail.mock.calls[0][0].to).toBe('other@example.com')
  })

  it('SMTP 설정이 없으면 보내지 않고 503과 안내를 돌려준다', async () => {
    setEnv({})
    const res = await loadRoute()(request('10.0.0.3'))
    expect(res.status).toBe(503)
    expect(sendMail).not.toHaveBeenCalled()
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.code).toBe('MAIL_NOT_CONFIGURED')
  })
})
