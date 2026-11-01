import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/contact-form'
import { ARTIST_EMAIL, mailtoHref } from '@/lib/contact'

export const metadata: Metadata = {
  title: '문의 | 아남 배옥영 서예 갤러리',
  description:
    '아남 배옥영 작가에게 작품 소장·주문 제작·강연·전시를 문의합니다.',
}

interface ContactPageProps {
  searchParams: Promise<{ artwork?: string | string[] }>
}

// 작품 상세의 "이 작품 문의하기"는 ?artwork=<작품명> 으로 들어온다
function subjectFor(artwork: string | string[] | undefined): string {
  const title = (Array.isArray(artwork) ? artwork[0] : artwork)?.trim()
  if (!title) return ''
  // 글자(코드 포인트) 단위로 자른다. slice 는 이모지를 반쪽으로 남겨 메일 링크 인코딩이 깨졌다
  return `「${Array.from(title).slice(0, 80).join('')}」 작품 문의`
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { artwork } = await searchParams
  const defaultSubject = subjectFor(artwork)

  return (
    <div className='min-h-screen bg-paper break-keep'>
      <header className='max-w-3xl mx-auto px-6 pt-12 pb-10 text-center md:pt-20 md:pb-14'>
        <h1 className='font-display font-bold text-ink text-3xl md:text-4xl mb-4'>
          문의
        </h1>
        <p className='font-body text-ink-light'>
          작품 소장, 주문 제작, 강연, 전시에 관해 남겨 주시면 답변드립니다.
        </p>
        <div className='mt-6 flex justify-center' aria-hidden='true'>
          <div className='w-24 h-1 bg-gold' />
        </div>
      </header>

      <div className='max-w-5xl mx-auto px-6 pb-32 grid gap-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12'>
        <section aria-labelledby='contact-form-heading'>
          <h2 id='contact-form-heading' className='sr-only'>
            문의 남기기
          </h2>
          <ContactForm key={defaultSubject} defaultSubject={defaultSubject} />
        </section>

        <aside className='font-body text-ink lg:border-l lg:border-ink/15 lg:pl-10 lg:pt-1'>
          <h2 className='font-display text-xl font-bold mb-4'>직접 연락</h2>
          <p className='text-ink-light leading-relaxed mb-5'>
            메일로 바로 보내셔도 됩니다. 작품 이름과 용도를 함께 적어 주시면
            답변이 빠릅니다.
          </p>
          <a
            href={mailtoHref({ subject: defaultSubject })}
            className='inline-block break-all border-b-2 border-ink pb-1 font-medium hover:text-ink-light hover:border-ink-light'
          >
            {ARTIST_EMAIL}
          </a>
          <p className='mt-10 text-sm text-ink-light'>
            작품을 먼저 둘러보시려면{' '}
            <Link
              href='/gallery'
              className='underline underline-offset-4 hover:text-ink'
            >
              작품 갤러리
            </Link>
            로 가세요.
          </p>
        </aside>
      </div>
    </div>
  )
}
