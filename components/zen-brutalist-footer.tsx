'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState, useRef, useCallback } from 'react'

interface ZenBrutalistFooterProps {
  variant?: 'zen' | 'brutal' | 'immersive' | 'cultural'
  showPhaseNavigation?: boolean
  enableInteraction?: boolean
  className?: string
}

type VariantType = 'zen' | 'brutal' | 'immersive' | 'cultural'

export function ZenBrutalistFooter({
  variant = 'cultural',
  showPhaseNavigation = true,
  enableInteraction = true,
  className,
}: ZenBrutalistFooterProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!footerRef.current || !enableInteraction) return

      const rect = footerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      setMousePosition({ x, y })
    },
    [enableInteraction]
  )

  // Variant-specific styling
  const variantStyles = {
    zen: {
      container: 'bg-gradient-zen border-t border-stone-light',
      text: 'text-ink',
      textLight: 'text-ink-light',
      textLighter: 'text-ink-lighter',
      accent: 'bg-ink text-paper',
      effects: 'zen-breathe-deep',
      spacing: 'void-breathing',
    },
    brutal: {
      container: 'bg-paper brutal-border border-t-0',
      text: 'text-ink',
      textLight: 'text-ink-dark',
      textLighter: 'text-ink-light',
      accent: 'bg-ink text-paper brutal-shadow',
      effects: 'ink-ripple-effect',
      spacing: 'void-contemplative',
    },
    immersive: {
      container: 'bg-gradient-paper glass-depth-container',
      text: 'text-ink',
      textLight: 'text-ink-light',
      textLighter: 'text-ink-lighter',
      accent: 'ink-glass-immersive text-paper',
      effects: 'fluid-ink-transition immersive-hover',
      spacing: 'void-infinite',
    },
    cultural: {
      container: 'cultural-immersion border-t border-gold/20',
      text: 'text-paper',
      textLight: 'text-paper-warm',
      textLighter: 'text-paper-cream',
      accent: 'cultural-context text-paper',
      effects: 'cultural-layer-flow seasonal-shift',
      spacing: 'void-cosmic',
    },
  }

  // 안전한 variant 값 검증 및 기본값 설정
  const safeVariant: VariantType =
    variant && variantStyles[variant as VariantType]
      ? (variant as VariantType)
      : 'cultural'

  const currentStyle = variantStyles[safeVariant] || variantStyles.cultural

  // Dynamic background based on mouse position
  const dynamicBackground = enableInteraction
    ? {
        background:
          variant === 'cultural'
            ? `conic-gradient(
          from ${mousePosition.x * 360}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          hsla(var(--season-spring) / 0.05) 0deg,
          hsla(var(--season-summer) / 0.08) 90deg,
          hsla(var(--season-autumn) / 0.1) 180deg,
          hsla(var(--season-winter) / 0.06) 270deg,
          hsla(var(--season-spring) / 0.05) 360deg
        )`
            : `radial-gradient(
          circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          hsla(var(--ink) / 0.05) 0%,
          hsla(var(--gold) / 0.03) 40%,
          transparent 70%
        )`,
      }
    : {}

  const phaseNavigation = [
    {
      phase: '1',
      title: 'ZEN FOUNDATION',
      subtitle: '백지의 시작',
      href: '/zen-demo',
      concept: 'White Space Architecture',
    },
    {
      phase: '2',
      title: 'GLASS IMMERSION',
      subtitle: '먹과 유리',
      href: '/immersive-demo',
      concept: 'Multi-Layer Depth',
    },
    {
      phase: '3',
      title: 'CULTURAL DEPTH',
      subtitle: '전통의 깊이',
      href: '/cultural-demo',
      concept: 'Traditional Integration',
    },
  ]

  const quickLinks = [
    { label: '갤러리', href: '/gallery' },
    { label: '작가소개', href: '/artist' },
    { label: '전시정보', href: '/exhibitions' },
    { label: '문의사항', href: '/contact' },
  ]

  const designLinks = [
    { label: 'Design System', href: '/design-system' },
    { label: 'Component Library', href: '/components' },
    { label: 'Style Guide', href: '/style-guide' },
    { label: 'Accessibility', href: '/accessibility' },
  ]

  return (
    <footer
      ref={footerRef}
      className={cn(
        currentStyle.container,
        currentStyle.effects,
        'relative overflow-hidden mt-auto',
        className
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Background Effects */}
      {enableInteraction && (
        <div
          className='absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-3000 pointer-events-none'
          style={dynamicBackground}
        />
      )}

      <div className={cn('zen-brutalist-layout', currentStyle.spacing)}>
        {/* Phase Navigation Section */}
        {showPhaseNavigation && (
          <div className='mb-zen-2xl'>
            <h3
              className={cn(
                'zen-typography-section mb-zen-xl text-center',
                currentStyle.text,
                variant === 'cultural' && 'stroke-horizontal'
              )}
            >
              Design Evolution Journey
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-zen-lg'>
              {phaseNavigation.map((phase) => (
                <Link
                  key={phase.phase}
                  href={phase.href}
                  className={cn(
                    'group block rounded-xl transition-all duration-500',
                    currentStyle.spacing,
                    'hover:transform hover:scale-105',
                    variant === 'zen' &&
                      'ink-glass-primary hover:shadow-zen-depth',
                    variant === 'brutal' && 'brutal-border hover:brutal-shadow',
                    variant === 'immersive' &&
                      'glass-layer-1 hover:glass-layer-2',
                    variant === 'cultural' &&
                      'cultural-context hover:temporal-depth'
                  )}
                  onMouseEnter={() => setActiveSection(phase.phase)}
                  onMouseLeave={() => setActiveSection(null)}
                >
                  <div className='relative'>
                    {/* Phase Number */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center mb-zen-md',
                        currentStyle.accent,
                        'transition-all duration-300',
                        activeSection === phase.phase && 'scale-110',
                        variant === 'cultural' && 'yin-yang-balance'
                      )}
                    >
                      <span className='brutal-typography-accent text-lg font-black'>
                        {phase.phase}
                      </span>
                    </div>

                    {/* Phase Info */}
                    <div className='space-y-zen-xs'>
                      <h4
                        className={cn(
                          'brutal-typography-accent text-sm',
                          currentStyle.text,
                          'group-hover:text-gold transition-colors duration-300'
                        )}
                      >
                        {phase.title}
                      </h4>

                      <p
                        className={cn(
                          'zen-typography-body text-base',
                          currentStyle.text,
                          'group-hover:transform group-hover:translate-x-1 transition-all duration-300'
                        )}
                      >
                        {phase.subtitle}
                      </p>

                      <p
                        className={cn(
                          'text-xs',
                          currentStyle.textLighter,
                          'group-hover:opacity-100 transition-opacity duration-300',
                          activeSection !== phase.phase && 'opacity-70'
                        )}
                      >
                        {phase.concept}
                      </p>
                    </div>

                    {/* Interactive Indicator */}
                    {activeSection === phase.phase && (
                      <div
                        className={cn(
                          'absolute -top-2 -right-2 w-3 h-3 rounded-full',
                          'bg-gold animate-pulse',
                          variant === 'cultural' && 'seasonal-shift'
                        )}
                      />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-zen-xl mb-zen-2xl'>
          {/* ANAM Gallery Info */}
          <div className='md:col-span-1 lg:col-span-1'>
            <div
              className={cn(
                'mb-zen-lg',
                variant === 'cultural' && 'cultural-context'
              )}
            >
              <h4
                className={cn(
                  'zen-typography-section mb-zen-md',
                  currentStyle.text,
                  variant === 'cultural' && 'stroke-press'
                )}
              >
                ANAM Gallery
              </h4>

              <p
                className={cn(
                  'zen-typography-body mb-zen-sm',
                  currentStyle.textLight
                )}
              >
                아남 배옥영 작가의 현대 서예 작품을 통해 전통과 현대가 만나는
                새로운 미학적 경험을 제공합니다.
              </p>

              <p className={cn('text-sm', currentStyle.textLighter)}>
                Korean Contemporary Calligraphy Gallery
              </p>
            </div>

            {/* Design Philosophy */}
            <div
              className={cn(
                'p-zen-md rounded-lg',
                variant === 'zen' && 'ink-glass-primary',
                variant === 'brutal' && 'brutal-border bg-paper-warm',
                variant === 'immersive' && 'glass-layer-1',
                variant === 'cultural' && 'temporal-depth'
              )}
            >
              <p className={cn('text-sm italic', currentStyle.textLight)}>
                "전통의 깊이와 현대적 몰입감을 동시에 제공하는 UI/UX 디자인"
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className={cn(
                'zen-typography-section mb-zen-lg',
                currentStyle.text,
                variant === 'cultural' && 'stroke-horizontal'
              )}
            >
              빠른 링크
            </h4>

            <ul className='space-y-zen-sm'>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'zen-typography-body transition-all duration-300',
                      currentStyle.textLight,
                      'hover:text-gold hover:transform hover:translate-x-2',
                      variant === 'cultural' && 'hover:stroke-vertical'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Design Resources */}
          <div>
            <h4
              className={cn(
                'zen-typography-section mb-zen-lg',
                currentStyle.text,
                variant === 'cultural' && 'stroke-vertical'
              )}
            >
              디자인 시스템
            </h4>

            <ul className='space-y-zen-sm'>
              {designLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'zen-typography-body transition-all duration-300',
                      currentStyle.textLight,
                      'hover:text-gold hover:transform hover:translate-x-2',
                      variant === 'cultural' && 'hover:stroke-curve'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4
              className={cn(
                'zen-typography-section mb-zen-lg',
                currentStyle.text,
                variant === 'cultural' && 'stroke-curve'
              )}
            >
              연결
            </h4>

            <div className='space-y-zen-md'>
              <div>
                <p className={cn('text-sm', currentStyle.textLighter)}>Email</p>
                <p
                  className={cn('zen-typography-body', currentStyle.textLight)}
                >
                  contact@anam-gallery.com
                </p>
              </div>

              <div>
                <p className={cn('text-sm', currentStyle.textLighter)}>
                  GitHub
                </p>
                <Link
                  href='https://github.com/anam-gallery'
                  className={cn(
                    'zen-typography-body transition-all duration-300',
                    currentStyle.textLight,
                    'hover:text-gold hover:underline'
                  )}
                >
                  anam-gallery
                </Link>
              </div>

              {/* Design System Badge */}
              <div
                className={cn(
                  'inline-block px-zen-md py-zen-sm rounded-lg',
                  currentStyle.accent,
                  'transition-all duration-500 hover:scale-105',
                  variant === 'cultural' && 'yin-yang-balance'
                )}
              >
                <span className='text-xs font-bold tracking-wider'>
                  ZEN BRUTALISM SYSTEM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className={cn(
            'border-t pt-zen-lg',
            variant === 'cultural' ? 'border-gold/20' : 'border-stone-light'
          )}
        >
          <div className='flex flex-col md:flex-row justify-between items-center gap-zen-md'>
            {/* Copyright */}
            <div
              className={cn(
                'text-center md:text-left',
                currentStyle.textLighter
              )}
            >
              <p className='text-sm'>© 2024 ANAM Gallery. 모든 권리 보유.</p>
              <p className='text-xs mt-1'>
                Zen Brutalism Design System by Claude Code
              </p>
            </div>

            {/* Design Credits */}
            <div className='text-center md:text-right'>
              <div
                className={cn(
                  'flex items-center gap-zen-sm',
                  currentStyle.textLighter
                )}
              >
                <span className='text-xs'>Powered by</span>
                <div
                  className={cn(
                    'px-zen-sm py-1 rounded',
                    currentStyle.accent,
                    'transition-all duration-300 hover:scale-105'
                  )}
                >
                  <span className='text-xs font-bold'>
                    Korean Traditional Aesthetics
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className='absolute inset-0 pointer-events-none overflow-hidden opacity-5'>
          {variant === 'zen' && (
            <>
              <div className='absolute bottom-zen-lg left-zen-lg w-8 h-8 bg-gold brutal-shadow rotate-45'></div>
              <div className='absolute top-zen-lg right-zen-lg w-4 h-16 bg-ink'></div>
            </>
          )}

          {variant === 'brutal' && (
            <>
              <div className='absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-ink via-gold to-ink'></div>
              <div className='absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-transparent via-gold to-transparent'></div>
            </>
          )}

          {variant === 'immersive' && (
            <div className='absolute inset-0 bg-gradient-to-tr from-ink/5 via-transparent to-gold/5'></div>
          )}

          {variant === 'cultural' && (
            <div className='composition-thirds w-full h-full'>
              <div className='thirds-top-left w-4 h-4 rounded-full bg-gold'></div>
              <div className='thirds-top-right w-4 h-4 rounded-full bg-gold'></div>
              <div className='thirds-bottom-left w-4 h-4 rounded-full bg-gold'></div>
              <div className='thirds-bottom-right w-4 h-4 rounded-full bg-gold'></div>
              <div className='thirds-center'>
                <div className='w-6 h-6 rounded-full bg-gradient-to-r from-ink to-gold'></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
