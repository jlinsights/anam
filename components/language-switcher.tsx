'use client'

import { AccessibleModal } from '@/components/accessibility'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/components/i18n-provider'
import type { Locale } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, Globe } from 'lucide-react'
import { useState } from 'react'

interface Language {
  code: Locale
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
]

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, changeLocale, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0]

  const handleLanguageChange = (newLocale: Locale) => {
    changeLocale(newLocale)
    setIsOpen(false)
  }

  return (
    <div className={className}>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setIsOpen(true)}
        className='gap-2'
        aria-label={t('common.changeLanguage', `언어 변경 (현재: ${currentLanguage.nativeName})`)}
      >
        <Globe className='h-4 w-4' />
        <span className='hidden sm:inline'>{currentLanguage.nativeName}</span>
      </Button>

      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('common.selectLanguage', '언어 선택 / Select Language / 言語選択')}
        description={t('common.selectLanguageDesc', '원하는 언어를 선택하세요')}
        className='max-w-sm'
      >
        <div className='space-y-2'>
          {languages.map((language) => {
            const isSelected = language.code === locale

            return (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg border transition-colors',
                  isSelected
                    ? 'bg-ink text-white border-ink'
                    : 'bg-background border-border hover:border-ink hover:bg-stone-50 dark:hover:bg-slate-800'
                )}
              >
                <div className='flex items-center gap-3'>
                  <span className='text-lg'>{language.flag}</span>
                  <div className='text-left'>
                    <div className='font-medium'>{language.nativeName}</div>
                    <div
                      className={cn(
                        'text-sm',
                        isSelected ? 'text-white/80' : 'text-ink-light'
                      )}
                    >
                      {language.name}
                    </div>
                  </div>
                </div>

                {isSelected && <Check className='h-4 w-4' />}
              </button>
            )
          })}
        </div>

        <div className='mt-4 p-3 bg-stone-50 dark:bg-slate-800 rounded-lg'>
          <p className='text-xs text-ink-light'>
            💡 언어를 변경하면 페이지가 새로고침됩니다. <br />
            The page will refresh when changing language. <br />
            言語を変更するとページが更新されます。
            <br />
            更换语言时页面将刷新。
          </p>
        </div>
      </AccessibleModal>
    </div>
  )
}

// 간단한 언어 표시기 (현재 언어만 표시)
export function LanguageIndicator({ locale }: { locale: Locale }) {
  const language =
    languages.find((lang) => lang.code === locale) || languages[0]

  return (
    <span className='inline-flex items-center gap-1 text-sm text-ink-light'>
      <span>{language.flag}</span>
      <span>{language.nativeName}</span>
    </span>
  )
}

// This function is deprecated, use useI18n hook instead
export function useLocale() {
  console.warn('useLocale is deprecated, please use useI18n hook instead')
  return { locale: 'ko' as Locale, changeLocale: () => {} }
}
