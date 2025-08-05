'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Locale } from '@/lib/types'
import {
  getStoredLocale,
  setStoredLocale,
  getTranslation,
  formatTranslation,
  getPlural,
} from '@/lib/i18n/index'

interface I18nContextType {
  locale: Locale
  changeLocale: (locale: Locale) => void
  t: (key: string, fallback?: string) => string
  tf: (key: string, params?: Record<string, any>) => string
  tp: (key: string, count: number) => string
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: React.ReactNode
  defaultLocale?: Locale
}

export function I18nProvider({
  children,
  defaultLocale = 'ko',
}: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedLocale = getStoredLocale()
    setLocale(storedLocale)
    setIsLoading(false)
  }, [])

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    setStoredLocale(newLocale)

    // Notify analytics about language change
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'language_change', {
        event_category: 'engagement',
        event_label: `${locale}_to_${newLocale}`,
      })
    }

    // Reload page to apply language changes across all components
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const t = (key: string, fallback?: string) => {
    return getTranslation(locale, key, fallback)
  }

  const tf = (key: string, params: Record<string, any> = {}) => {
    return formatTranslation(locale, key, params)
  }

  const tp = (key: string, count: number) => {
    return getPlural(locale, key, count)
  }

  const value: I18nContextType = {
    locale,
    changeLocale,
    t,
    tf,
    tp,
    isLoading,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Component wrapper for easy translation
interface TProps {
  k: string // translation key
  fallback?: string
  params?: Record<string, any>
  count?: number
}

export function T({ k, fallback, params, count }: TProps) {
  const { t, tf, tp } = useI18n()

  if (count !== undefined) {
    return <>{tp(k, count)}</>
  }

  if (params) {
    return <>{tf(k, params)}</>
  }

  return <>{t(k, fallback)}</>
}
