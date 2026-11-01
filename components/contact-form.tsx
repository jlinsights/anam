'use client'

import { useEffect, useRef, useState } from 'react'
import { ARTIST_EMAIL, mailtoHref, type ContactDraft } from '@/lib/contact'

interface ContactFormProps {
  className?: string
  /** 작품 상세에서 넘어온 경우 제목 칸을 미리 채운다 */
  defaultSubject?: string
}

type SubmitStatus =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | {
      kind: 'failed'
      reason: 'unavailable' | 'invalid' | 'network'
      message?: string
    }

const INQUIRY_TYPES = ['작품 소장', '주문 제작', '강연', '전시', '기타']

const EMPTY: ContactDraft = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

// DESIGN.md Inputs: 2px 먹 테두리, 한지 바탕, 각진 모서리, 초점은 금 테두리 + 따뜻한 한지
const FIELD =
  'block w-full border-2 border-ink bg-paper px-4 py-3 md:px-5 font-body text-base text-ink ' +
  'placeholder:text-ink-light rounded-none transition-colors ' +
  'focus:outline-none focus:border-gold focus:bg-paper-warm focus:ring-4 focus:ring-gold/20'

export function ContactForm({
  className = '',
  defaultSubject = '',
}: ContactFormProps) {
  const [draft, setDraft] = useState<ContactDraft>({
    ...EMPTY,
    subject: defaultSubject,
  })
  // 작품 상세에서 넘어왔다면 대개 소장 문의다
  const [inquiryType, setInquiryType] = useState<string>(
    defaultSubject ? '작품 소장' : ''
  )
  const [status, setStatus] = useState<SubmitStatus>({ kind: 'idle' })
  const abortRef = useRef<AbortController | null>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    if (status.kind === 'sent' || status.kind === 'failed')
      statusRef.current?.focus()
  }, [status.kind])

  const update = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setDraft((prev) => ({ ...prev, [name]: value }))
  }

  // 작가가 메일 제목만 보고도 무슨 문의인지 알게 한다: "[주문 제작] 제목"
  const payload: ContactDraft = {
    ...draft,
    subject: inquiryType ? `[${inquiryType}] ${draft.subject}` : draft.subject,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setStatus({ kind: 'sending' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      const result = await response.json().catch(() => ({}))

      if (response.ok && result.success) {
        setDraft(EMPTY)
        setInquiryType('')
        setStatus({ kind: 'sent' })
      } else if (response.status === 400) {
        setStatus({
          kind: 'failed',
          reason: 'invalid',
          message: result.message,
        })
      } else {
        setStatus({ kind: 'failed', reason: 'unavailable' })
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setStatus({ kind: 'failed', reason: 'network' })
    } finally {
      if (abortRef.current === controller) abortRef.current = null
    }
  }

  const sending = status.kind === 'sending'

  return (
    <form onSubmit={handleSubmit} className={`space-y-7 ${className}`}>
      <div className='grid gap-7 md:grid-cols-2'>
        <Field id='name' label='이름'>
          <input
            id='name'
            name='name'
            type='text'
            autoComplete='name'
            required
            value={draft.name}
            onChange={update}
            disabled={sending}
            className={FIELD}
          />
        </Field>
        <Field id='email' label='이메일' hint='회신받으실 주소'>
          <input
            id='email'
            name='email'
            type='email'
            autoComplete='email'
            inputMode='email'
            required
            value={draft.email}
            onChange={update}
            disabled={sending}
            className={FIELD}
          />
        </Field>
      </div>

      <Field id='phone' label='전화번호' optional>
        <input
          id='phone'
          name='phone'
          type='tel'
          autoComplete='tel'
          inputMode='tel'
          value={draft.phone}
          onChange={update}
          disabled={sending}
          className={FIELD}
        />
      </Field>

      <fieldset>
        <legend className='mb-2 flex items-baseline gap-2 font-body text-sm font-medium text-ink'>
          문의 종류
          <span className='text-xs font-normal text-ink-light'>선택</span>
        </legend>
        <div className='flex flex-wrap gap-2'>
          {INQUIRY_TYPES.map((type) => (
            <label key={type} className='cursor-pointer'>
              <input
                type='radio'
                name='inquiryType'
                value={type}
                checked={inquiryType === type}
                onChange={() => setInquiryType(type)}
                disabled={sending}
                className='peer sr-only'
              />
              <span className='inline-flex min-h-[40px] items-center border border-ink/25 px-4 font-body text-sm text-ink transition-colors hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold'>
                {type}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field id='subject' label='제목'>
        <input
          id='subject'
          name='subject'
          type='text'
          required
          maxLength={120}
          placeholder='예: 작품 소장 문의'
          value={draft.subject}
          onChange={update}
          disabled={sending}
          className={FIELD}
        />
      </Field>

      <Field id='message' label='내용'>
        <textarea
          id='message'
          name='message'
          required
          rows={7}
          maxLength={5000}
          placeholder='관심 있는 작품, 용도(소장·선물·전시), 원하시는 일정 등을 적어 주세요.'
          value={draft.message}
          onChange={update}
          disabled={sending}
          className={`${FIELD} min-h-[11rem] resize-y leading-relaxed`}
        />
      </Field>

      <div className='flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
        <p className='font-body text-sm text-ink-light'>
          적어 주신 내용은 작가에게 메일로 전해집니다.
        </p>
        <button
          type='submit'
          disabled={sending}
          className='inline-flex min-h-[48px] items-center justify-center border-2 border-ink bg-ink px-10 font-body text-base text-paper transition-colors hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/40 disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-ink disabled:hover:text-paper'
        >
          {sending ? '보내는 중…' : '문의 보내기'}
        </button>
      </div>

      <div
        ref={statusRef}
        tabIndex={-1}
        aria-live='polite'
        className='focus:outline-none'
      >
        <StatusMessage status={status} draft={payload} />
      </div>
    </form>
  )
}

interface FieldProps {
  id: string
  label: string
  hint?: string
  optional?: boolean
  children: React.ReactNode
}

function Field({ id, label, hint, optional = false, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className='mb-2 flex items-baseline gap-2 font-body text-sm font-medium text-ink'
      >
        {label}
        {optional && (
          <span className='text-xs font-normal text-ink-light'>선택</span>
        )}
        {hint && (
          <span className='text-xs font-normal text-ink-light'>· {hint}</span>
        )}
      </label>
      {children}
    </div>
  )
}

function StatusMessage({
  status,
  draft,
}: {
  status: SubmitStatus
  draft: ContactDraft
}) {
  if (status.kind === 'sent') {
    return (
      <p className='border-t-2 border-ink pt-4 font-body text-ink'>
        문의를 받았습니다. 적어 주신 이메일로 회신드립니다.
      </p>
    )
  }
  if (status.kind !== 'failed') return null

  if (status.reason === 'invalid') {
    return (
      <p className='border-t-2 border-ink pt-4 font-body text-ink'>
        {status.message || '입력하신 내용을 다시 확인해 주세요.'}
      </p>
    )
  }

  return (
    <div className='border-t-2 border-ink pt-4 font-body text-ink'>
      <p>
        {status.reason === 'network'
          ? '연결이 끊겨 문의를 보내지 못했습니다.'
          : '지금은 온라인으로 문의를 보낼 수 없습니다.'}{' '}
        적어 주신 내용은 그대로 남아 있습니다.
      </p>
      <a
        href={mailtoHref(draft)}
        className='mt-3 inline-block font-medium underline underline-offset-4 hover:text-ink-light'
      >
        메일로 직접 보내기 ({ARTIST_EMAIL})
      </a>
    </div>
  )
}
