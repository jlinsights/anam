'use client'

import { useI18n } from '@/components/i18n-provider'

interface TranslatedContentProps {
  textKey: string
  namespace?: string
  fallback?: string
  params?: Record<string, any>
  count?: number
}

export function TranslatedContent({
  textKey,
  namespace,
  fallback,
  params,
  count,
}: TranslatedContentProps) {
  const { t, tf, tp } = useI18n()
  
  const key = namespace ? `${namespace}.${textKey}` : textKey
  
  if (count !== undefined) {
    return <>{tp(key, count)}</>
  }
  
  if (params) {
    return <>{tf(key, params)}</>
  }
  
  return <>{t(key, fallback)}</>
}
