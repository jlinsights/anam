'use client'

import { cn } from '@/lib/utils'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Artwork } from '@/lib/types'

interface ZenBrutalistHeroProps {
  phase: '1' | '2' | '3'
  title: {
    main: string
    sub?: string
    english?: string
  }
  description: {
    primary: string
    secondary?: string
  }
  concept: string
  navigation?: {
    prev?: { href: string; label: string }
    next?: { href: string; label: string }
    demo?: { href: string; label: string }
  }
  variant?: 'zen' | 'brutal' | 'fusion'
  enableInteraction?: boolean
  className?: string
  backgroundArtworks?: Artwork[]
  showImageCarousel?: boolean
}

export function ZenBrutalistHero({
  phase,
  title,
  description,
  concept,
  navigation,
  variant = 'fusion',
  enableInteraction = true,
  className,
  backgroundArtworks = [],
  showImageCarousel = false
}: ZenBrutalistHeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current || !enableInteraction) return
    
    const rect = heroRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    setMousePosition({ x, y })
  }, [enableInteraction])

  // Image carousel functionality
  useEffect(() => {
    if (showImageCarousel && backgroundArtworks.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundArtworks.length)
      }, 6000)

      return () => clearInterval(interval)
    }
  }, [showImageCarousel, backgroundArtworks.length])

  const nextImage = () => {
    if (backgroundArtworks.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundArtworks.length)
    }
  }

  const prevImage = () => {
    if (backgroundArtworks.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + backgroundArtworks.length) % backgroundArtworks.length
      )
    }
  }

  // Phase-specific styling
  const phaseStyles = {
    '1': {
      container: 'zen-brutalist-layout py-zen-4xl bg-gradient-zen',
      title: 'zen-typography-display text-ink',
      subtitle: 'brutal-typography-impact text-ink-dark',
      description: 'zen-typography-body text-ink-light',
      accent: 'bg-ink text-paper brutal-shadow',
      effects: 'ink-glass-primary'
    },
    '2': {
      container: 'zen-brutalist-layout py-zen-4xl bg-gradient-paper',
      title: 'zen-typography-display text-ink immersive-hover',
      subtitle: 'zen-typography-hero text-ink-dark',
      description: 'zen-typography-body text-ink-light',
      accent: 'ink-glass-immersive text-paper',
      effects: 'glass-depth-container glass-layer-3 fluid-ink-transition'
    },
    '3': {
      container: 'cultural-immersion zen-brutalist-layout py-zen-4xl',
      title: 'zen-typography-display text-paper cultural-layer-flow',
      subtitle: 'zen-typography-hero text-paper-warm stroke-horizontal',
      description: 'zen-typography-body text-paper-cream',
      accent: 'cultural-context temporal-depth text-paper',
      effects: 'cultural-immersion seasonal-shift traditional-composition'
    }
  }

  const variantStyles = {
    zen: {
      wrapper: 'void-cosmic rounded-3xl',
      spacing: 'space-y-zen-2xl',
      animation: 'zen-breathe-deep'
    },
    brutal: {
      wrapper: 'brutal-border brutal-shadow-strong',
      spacing: 'space-y-zen-xl',
      animation: 'ink-ripple-effect'
    },
    fusion: {
      wrapper: 'rounded-2xl void-infinite',
      spacing: 'space-y-zen-2xl',
      animation: phase === '3' ? 'cultural-layer-flow' : 'immersive-hover'
    }
  }

  const currentPhase = phaseStyles[phase]
  const currentVariant = variantStyles[variant]

  // Dynamic background based on mouse position
  const dynamicBackground = enableInteraction ? {
    background: phase === '3' 
      ? `radial-gradient(
          circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          hsla(var(--season-spring) / 0.1) 0%,
          hsla(var(--season-summer) / 0.08) 25%,
          hsla(var(--season-autumn) / 0.12) 50%,
          hsla(var(--season-winter) / 0.06) 75%,
          transparent 100%
        )`
      : `radial-gradient(
          circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          hsla(var(--ink) / 0.08) 0%,
          hsla(var(--gold) / 0.05) 40%,
          transparent 70%
        )`
  } : {}

  return (
    <section 
      ref={heroRef}
      className={cn(currentPhase.container, 'relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image Carousel */}
      {showImageCarousel && backgroundArtworks.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full">
            {/* Current Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
              style={{
                backgroundImage: `url(${backgroundArtworks[currentImageIndex]?.image || backgroundArtworks[currentImageIndex]?.thumbnail})`,
                opacity: 0.1
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-paper/95 via-paper/90 to-paper/95" />
            
            {/* Image Navigation Controls */}
            <div className="absolute bottom-zen-lg right-zen-lg flex items-center space-x-zen-sm pointer-events-auto">
              <button
                onClick={prevImage}
                disabled={backgroundArtworks.length <= 1}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'bg-ink/10 hover:bg-ink/20 backdrop-blur-sm transition-all',
                  'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
              >
                <ChevronLeft className="w-4 h-4 text-ink" />
              </button>
              
              <button
                onClick={nextImage}
                disabled={backgroundArtworks.length <= 1}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'bg-ink/10 hover:bg-ink/20 backdrop-blur-sm transition-all',
                  'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
              >
                <ChevronRight className="w-4 h-4 text-ink" />
              </button>
            </div>
            
            {/* Image Indicators */}
            {backgroundArtworks.length > 1 && (
              <div className="absolute bottom-zen-lg left-zen-lg flex space-x-zen-xs pointer-events-auto">
                {backgroundArtworks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      index === currentImageIndex 
                        ? 'bg-ink/80 w-6' 
                        : 'bg-ink/30 hover:bg-ink/50'
                    )}
                  />
                ))}
              </div>
            )}
            
            {/* Artwork Info */}
            {backgroundArtworks[currentImageIndex] && (
              <div className="absolute bottom-zen-lg left-1/2 transform -translate-x-1/2">
                <div className="bg-ink/10 backdrop-blur-sm rounded-xl px-zen-md py-zen-sm">
                  <p className="text-xs text-ink/70 text-center">
                    {backgroundArtworks[currentImageIndex].title}
                    {backgroundArtworks[currentImageIndex].year && (
                      <span className="ml-zen-xs">({backgroundArtworks[currentImageIndex].year})</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Background Effects */}
      {enableInteraction && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-2000 pointer-events-none"
          style={dynamicBackground}
        />
      )}

      {/* Phase Indicator */}
      <div className="absolute top-zen-lg right-zen-lg">
        <div className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center',
          currentPhase.accent,
          currentVariant.animation
        )}>
          <span className="zen-typography-section font-black">
            {phase}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        'group relative',
        currentVariant.wrapper,
        currentPhase.effects
      )}>
        <div className={cn('text-center', currentVariant.spacing)}>
          {/* Main Title */}
          <div className="relative">
            <h1 className={cn(
              currentPhase.title,
              'mb-zen-lg transition-all duration-1000',
              isHovered && enableInteraction && 'transform translate-y-[-4px]',
              phase === '3' && 'stroke-press'
            )}>
              {title.main}
            </h1>
            
            {/* Subtitle */}
            {title.sub && (
              <h2 className={cn(
                currentPhase.subtitle,
                'mb-zen-md transition-all duration-800',
                isHovered && enableInteraction && 'transform translate-x-2',
                phase === '2' && 'fluid-ink-transition',
                phase === '3' && 'stroke-horizontal'
              )}>
                {title.sub}
              </h2>
            )}

            {/* English Translation */}
            {title.english && (
              <p className={cn(
                'brutal-typography-accent text-ink-lighter mb-zen-lg',
                'transition-all duration-600',
                isHovered && enableInteraction && 'opacity-100',
                !isHovered && 'opacity-70',
                phase === '3' && 'stroke-vertical'
              )}>
                {title.english}
              </p>
            )}
          </div>

          {/* Concept Badge */}
          <div className="mb-zen-xl">
            <div className={cn(
              'inline-block px-zen-lg py-zen-sm rounded-xl',
              currentPhase.accent,
              'transition-all duration-500',
              isHovered && enableInteraction && 'scale-110 shadow-zen-depth',
              phase === '1' && 'brutal-border',
              phase === '2' && 'glass-layer-2',
              phase === '3' && 'cultural-context'
            )}>
              <span className="brutal-typography-accent text-sm tracking-widest">
                {concept}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-4xl mx-auto void-breathing">
            <p className={cn(
              currentPhase.description,
              'mb-zen-lg leading-loose',
              'transition-all duration-1000',
              isHovered && enableInteraction && 'transform translate-y-[-2px]'
            )}>
              {description.primary}
            </p>
            
            {description.secondary && (
              <p className={cn(
                currentPhase.description,
                'text-sm opacity-80 max-w-3xl mx-auto',
                'transition-all duration-1200',
                isHovered && enableInteraction && 'opacity-100'
              )}>
                {description.secondary}
              </p>
            )}
          </div>

          {/* Navigation Buttons */}
          {navigation && (
            <div className={cn(
              'flex flex-col sm:flex-row gap-zen-md justify-center items-center mt-zen-2xl',
              'transition-all duration-800',
              isHovered && enableInteraction && 'transform translate-y-[-2px]'
            )}>
              {navigation.demo && (
                <Button 
                  asChild
                  className={cn(
                    'btn-art px-zen-xl py-zen-lg',
                    phase === '1' && 'brutal-shadow hover:brutal-shadow-strong',
                    phase === '2' && 'glass-layer-1 immersive-hover',
                    phase === '3' && 'cultural-immersion stroke-curve'
                  )}
                >
                  <Link href={navigation.demo.href}>
                    {navigation.demo.label}
                  </Link>
                </Button>
              )}

              <div className="flex gap-zen-sm">
                {navigation.prev && (
                  <Button 
                    asChild
                    variant="outline"
                    className={cn(
                      'btn-art-outline px-zen-lg py-zen-md',
                      phase === '1' && 'brutal-border',
                      phase === '2' && 'glass-layer-1',
                      phase === '3' && 'cultural-context temporal-depth'
                    )}
                  >
                    <Link href={navigation.prev.href}>
                      ← {navigation.prev.label}
                    </Link>
                  </Button>
                )}

                {navigation.next && (
                  <Button 
                    asChild
                    variant="outline"
                    className={cn(
                      'btn-art-outline px-zen-lg py-zen-md',
                      phase === '1' && 'brutal-border',
                      phase === '2' && 'glass-layer-1',
                      phase === '3' && 'cultural-context temporal-depth'
                    )}
                  >
                    <Link href={navigation.next.href}>
                      {navigation.next.label} →
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Phase 1: Geometric Shapes */}
          {phase === '1' && (
            <>
              <div className="absolute top-zen-xl left-zen-xl w-4 h-4 bg-gold brutal-shadow opacity-60"></div>
              <div className="absolute bottom-zen-xl right-zen-xl w-6 h-6 bg-ink brutal-border opacity-40"></div>
              <div className="absolute top-1/2 left-zen-md w-2 h-16 bg-ink-light opacity-30"></div>
            </>
          )}

          {/* Phase 2: Flowing Lines */}
          {phase === '2' && (
            <>
              <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-ink-light to-transparent opacity-20"></div>
              <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-gold to-transparent opacity-15"></div>
            </>
          )}

          {/* Phase 3: Cultural Patterns */}
          {phase === '3' && (
            <div className="composition-thirds w-full h-full opacity-10">
              <div className="thirds-top-left w-3 h-3 rounded-full bg-gold"></div>
              <div className="thirds-top-right w-3 h-3 rounded-full bg-gold"></div>
              <div className="thirds-bottom-left w-3 h-3 rounded-full bg-gold"></div>
              <div className="thirds-bottom-right w-3 h-3 rounded-full bg-gold"></div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Preset hero configurations for each phase
export const ZenBrutalistHeroPhase1 = (props: Partial<ZenBrutalistHeroProps>) => (
  <ZenBrutalistHero
    phase="1"
    title={{
      main: "白紙의 시작",
      sub: "ZEN BRUTALISM FOUNDATION",
      english: "The Beginning of White Space"
    }}
    description={{
      primary: "여백의 힘과 브루탈리즘의 강렬함이 만나는 첫 번째 단계. 전통 한국 미학의 근본인 '비움'의 철학을 현대적 디자인 언어로 재해석합니다.",
      secondary: "명상적 여백 속에서 피어나는 기하학적 구조의 아름다움을 경험해보세요."
    }}
    concept="PHASE 1: FOUNDATION"
    variant="zen"
    {...props}
  />
)

export const ZenBrutalistHeroPhase2 = (props: Partial<ZenBrutalistHeroProps>) => (
  <ZenBrutalistHero
    phase="2"
    title={{
      main: "먹과 유리의 조화",
      sub: "GLASS MORPHISM + INK FLOW",
      english: "Harmony of Ink and Glass"
    }}
    description={{
      primary: "전통 먹의 유동성과 현대 유리의 투명성이 만나는 두 번째 단계. 다층 깊이감과 실시간 상호작용을 통한 몰입형 경험을 제공합니다.",
      secondary: "마우스 움직임에 반응하는 살아있는 인터페이스의 마법을 느껴보세요."
    }}
    concept="PHASE 2: IMMERSION"
    variant="fusion"
    {...props}
  />
)

export const ZenBrutalistHeroPhase3 = (props: Partial<ZenBrutalistHeroProps>) => (
  <ZenBrutalistHero
    phase="3"
    title={{
      main: "傳統의 깊이",
      sub: "전통 구성 원리와 문화적 층위",
      english: "Traditional Depth & Cultural Layers"
    }}
    description={{
      primary: "삼분법, 음양균형, 계절의 흐름이 어우러진 세 번째 단계. 한국 전통 미학의 정수를 현대적 상호작용 시스템으로 완성합니다.",
      secondary: "시간과 공간을 넘나드는 문화적 깊이감의 진정한 의미를 탐험해보세요."
    }}
    concept="PHASE 3: CULTURAL INTEGRATION"
    variant="fusion"
    {...props}
  />
)