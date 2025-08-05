'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Artwork } from '@/lib/types'

interface ZenBrutalistHeroProps {
  title?: string | { main?: string; sub?: string; english?: string }
  subtitle?: string | { main?: string; sub?: string; english?: string }
  description?: string | { main?: string; sub?: string; english?: string }
  season?: 'spring' | 'summer' | 'autumn' | 'winter'
  phase?: string
  concept?: string
  variant?: string
  className?: string
  backgroundArtworks?: Artwork[]
  navigation?: {
    prev?: { href: string; label: string }
    demo?: { href: string; label: string }
    next?: { href: string; label: string }
  }
  enableInteraction?: boolean
  showImageCarousel?: boolean
  onMouseMove?: (e: React.MouseEvent) => void
}

// 텍스트를 안전하게 추출하는 헬퍼 함수
function extractText(value: string | { main?: string; sub?: string; english?: string } | undefined): string {
  if (!value) return ''
  
  if (typeof value === 'string') {
    return value
  }
  
  if (typeof value === 'object' && value !== null) {
    // 객체인 경우 main, sub, english 중 하나를 우선적으로 사용
    return (value as any).main || (value as any).sub || (value as any).english || ''
  }
  
  return String(value)
}

export function ZenBrutalistHero({
  title,
  subtitle,
  description,
  season = 'spring',
  phase,
  concept,
  variant,
  className,
  backgroundArtworks,
  navigation,
  enableInteraction,
  showImageCarousel,
  onMouseMove,
}: ZenBrutalistHeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // 안전하게 텍스트 추출
  const safeTitle = extractText(title)
  const safeSubtitle = extractText(subtitle)
  const safeDescription = extractText(description)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePosition({ x, y })
    onMouseMove?.(e)
  }

  const getSeasonalClasses = () => {
    switch (season) {
      case 'spring':
        return {
          text: 'text-spring-primary',
          bg: 'bg-spring-muted',
          border: 'border-spring-accent',
          accent: 'text-spring-accent'
        }
      case 'summer':
        return {
          text: 'text-summer-primary',
          bg: 'bg-summer-muted',
          border: 'border-summer-accent',
          accent: 'text-summer-accent'
        }
      case 'autumn':
        return {
          text: 'text-autumn-primary',
          bg: 'bg-autumn-muted',
          border: 'border-autumn-accent',
          accent: 'text-autumn-accent'
        }
      case 'winter':
        return {
          text: 'text-winter-primary',
          bg: 'bg-winter-muted',
          border: 'border-winter-accent',
          accent: 'text-winter-accent'
        }
      default:
        return {
          text: 'text-ink',
          bg: 'bg-paper',
          border: 'border-ink',
          accent: 'text-gold'
        }
    }
  }

  const seasonalClasses = getSeasonalClasses()

  return (
    <motion.section
      className={`
        relative min-h-screen flex items-center justify-center
        ${seasonalClasses.bg} seasonal-transition
        overflow-hidden
      `}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      {/* 배경 효과 */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            hsl(var(--${season}-accent)) 0%, 
            transparent 50%)`
        }}
        animate={{
          scale: isHovered ? 1.2 : 1,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 text-center p-zen-xl max-w-4xl mx-auto">
        {/* 제목 */}
        <motion.h1
          className={`
            text-calligraphy-title text-responsive-3xl
            ${seasonalClasses.text} seasonal-transition-color
            mb-zen-md
          `}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {safeTitle}
        </motion.h1>

        {/* 부제목 */}
        {safeSubtitle && (
          <motion.h2
            className={`
              text-calligraphy-body text-responsive-xl
              ${seasonalClasses.accent} seasonal-transition-color
              mb-zen-lg
            `}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            {safeSubtitle}
          </motion.h2>
        )}

        {/* 설명 */}
        {safeDescription && (
          <motion.p
            className={`
              text-calligraphy-body text-responsive-lg
              ${seasonalClasses.text} seasonal-transition-color
              max-w-2xl mx-auto leading-relaxed
            `}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {safeDescription}
          </motion.p>
        )}

        {/* 계절 표시 */}
        <motion.div
          className={`
            inline-block px-zen-md py-zen-sm
            ${seasonalClasses.border} border-2
            text-calligraphy-caption
            ${seasonalClasses.accent} seasonal-transition-color
            mt-zen-xl
          `}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {season.charAt(0).toUpperCase() + season.slice(1)}
        </motion.div>
      </div>

      {/* 장식적 요소들 */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 opacity-10"
        style={{
          border: `2px solid hsl(var(--${season}-accent))`,
          transform: `rotate(${mousePosition.x * 45}deg)`
        }}
        animate={{
          rotate: mousePosition.x * 45,
        }}
        transition={{ duration: 0.5 }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-24 h-24 opacity-10"
        style={{
          border: `2px solid hsl(var(--${season}-accent))`,
          transform: `rotate(${mousePosition.y * -45}deg)`
        }}
        animate={{
          rotate: mousePosition.y * -45,
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.section>
  )
}

// Phase-specific hero components
export function ZenBrutalistHeroPhase1(props: Omit<ZenBrutalistHeroProps, 'season'>) {
  return <ZenBrutalistHero 
    {...props} 
    season="spring" 
    title={props.title || { main: 'Zen Foundation', sub: 'Phase 1', english: 'Minimal Brutalism' }}
    phase="1"
  />
}

export function ZenBrutalistHeroPhase2(props: Omit<ZenBrutalistHeroProps, 'season'>) {
  return <ZenBrutalistHero 
    {...props} 
    season="summer" 
    title={props.title || { main: 'Glass Immersion', sub: 'Phase 2', english: 'Interactive Design' }}
    phase="2"
  />
}

export function ZenBrutalistHeroPhase3(props: Omit<ZenBrutalistHeroProps, 'season'>) {
  return <ZenBrutalistHero 
    {...props} 
    season="autumn" 
    title={props.title || { main: 'Cultural Depth', sub: 'Phase 3', english: 'Traditional Integration' }}
    phase="3"
  />
}
