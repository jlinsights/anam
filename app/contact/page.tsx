import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/contact-form'

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
  return title ? `「${title.slice(0, 80)}」 작품 문의` : ''
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { artwork } = await searchParams
  const defaultSubject = subjectFor(artwork)

  return (
    <div className='min-h-screen bg-paper dark:bg-gray-900'>
      <header className='max-w-3xl mx-auto px-6 pt-24 pb-16 text-center'>
        <h1 className='font-display font-bold text-ink dark:text-white text-3xl md:text-4xl mb-4'>
          문의
        </h1>
        <p className='font-body text-ink-light dark:text-gray-400'>
          작품 소장, 주문 제작, 강연, 전시에 관해 남겨 주시면 답변드립니다.
        </p>
        <div className='mt-6 flex justify-center' aria-hidden='true'>
          <div className='w-24 h-1 bg-gold' />
        </div>
      </header>

      <main className='max-w-2xl mx-auto px-6 pb-32'>
        <ContactForm key={defaultSubject} defaultSubject={defaultSubject} />
        <p className='mt-10 text-center font-body text-sm text-ink-light dark:text-gray-400'>
          작품을 먼저 둘러보시려면{' '}
          <Link
            href='/gallery'
            className='underline underline-offset-4 hover:text-ink dark:hover:text-white'
          >
            작품 갤러리
          </Link>
          로 가세요.
        </p>
      </main>
    </div>
  )
}
