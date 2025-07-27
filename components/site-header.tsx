'use client'

import { MountainIcon } from 'lucide-react'
import Link from 'next/link'
import { LanguageSwitcher } from './language-switcher'
import { ThemeToggleButton } from './theme-toggle-button'
import { useI18n } from './i18n-provider'

export function SiteHeader() {
  const { locale } = useI18n()

  // 기본 언어(ko)는 URL에 포함하지 않음
  const getLocalizedPath = (path: string) => {
    if (locale === 'ko') {
      return path
    }
    return `/${locale}${path}`
  }

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-14 max-w-screen-2xl items-center'>
        <Link
          href={getLocalizedPath('/')}
          className='mr-6 flex items-center space-x-2'
          aria-label='홈으로 가기'
        >
          <MountainIcon
            className='h-6 w-6 text-neutral-700 dark:text-neutral-300'
            aria-hidden='true'
          />
          <span className='font-bold sm:inline-block text-neutral-800 dark:text-neutral-200'>
            아남
          </span>
        </Link>
        <nav
          className='flex items-center gap-1 sm:gap-2 text-sm ml-auto'
          role='navigation'
          aria-label='메인 네비게이션'
        >
          <Link
            href={getLocalizedPath('/gallery')}
            className='px-2 py-1 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-500 rounded'
          >
            갤러리
          </Link>
          <Link
            href={getLocalizedPath('/artist')}
            className='px-2 py-1 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-500 rounded'
          >
            작가
          </Link>
          <ThemeToggleButton />
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
