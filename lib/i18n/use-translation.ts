'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Locale } from '@/lib/types'
import {
  getTranslation,
  formatTranslation,
  getPlural,
  getStoredLocale,
  setStoredLocale,
} from './index'

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>('ko')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedLocale = getStoredLocale()
    setLocale(storedLocale)
    setIsLoading(false)
  }, [])

  const t = useCallback(
    (key: string, fallback?: string) => {
      return getTranslation(locale, key, fallback)
    },
    [locale]
  )

  const tf = useCallback(
    (key: string, params: Record<string, any> = {}) => {
      return formatTranslation(locale, key, params)
    },
    [locale]
  )

  const tp = useCallback(
    (key: string, count: number) => {
      return getPlural(locale, key, count)
    },
    [locale]
  )

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale)
    setStoredLocale(newLocale)

    // Reload page to apply language changes
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }, [])

  return {
    locale,
    t,
    tf,
    tp,
    changeLocale,
    isLoading,
  }
}

// Hook for getting translation without state management (for server components)
export function useStaticTranslation(locale: Locale) {
  const t = useCallback(
    (key: string, fallback?: string) => {
      return getTranslation(locale, key, fallback)
    },
    [locale]
  )

  const tf = useCallback(
    (key: string, params: Record<string, any> = {}) => {
      return formatTranslation(locale, key, params)
    },
    [locale]
  )

  const tp = useCallback(
    (key: string, count: number) => {
      return getPlural(locale, key, count)
    },
    [locale]
  )

  return { t, tf, tp }
}
