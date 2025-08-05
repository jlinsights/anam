import type { Locale } from '@/lib/types'
import { translations } from './translations'

export type { Locale }

export function getTranslation(
  locale: Locale,
  key: string,
  fallback?: string
): string {
  const keys = key.split('.')
  let current: any = translations[locale]

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k]
    } else {
      // Fallback to Korean if translation not found
      if (locale !== 'ko') {
        return getTranslation('ko', key, fallback)
      }
      return fallback || key
    }
  }

  return typeof current === 'string' ? current : fallback || key
}

export function formatTranslation(
  locale: Locale,
  key: string,
  params: Record<string, any> = {}
): string {
  let translation = getTranslation(locale, key)

  // Replace placeholders like {name} with actual values
  Object.entries(params).forEach(([param, value]) => {
    translation = translation.replace(
      new RegExp(`\\{${param}\\}`, 'g'),
      String(value)
    )
  })

  return translation
}

export function getPlural(locale: Locale, key: string, count: number): string {
  const pluralKey = count === 1 ? `${key}.one` : `${key}.other`
  return formatTranslation(locale, pluralKey, { count })
}

export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'ko'

  const browserLanguage = navigator.language.toLowerCase()

  // Check exact match first
  if (browserLanguage === 'ko' || browserLanguage.startsWith('ko-')) return 'ko'
  if (browserLanguage === 'en' || browserLanguage.startsWith('en-')) return 'en'
  if (browserLanguage === 'ja' || browserLanguage.startsWith('ja-')) return 'ja'
  if (browserLanguage === 'zh' || browserLanguage.startsWith('zh-')) return 'zh'

  // Default to Korean
  return 'ko'
}

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'ko'

  try {
    const stored = localStorage.getItem('locale') as Locale
    if (stored && ['ko', 'en', 'ja', 'zh'].includes(stored)) {
      return stored
    }
  } catch {
    // localStorage not available
  }

  return getBrowserLocale()
}

export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('locale', locale)
  } catch {
    // localStorage not available
  }
}
