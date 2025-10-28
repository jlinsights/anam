'use client'

import { Suspense, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getArtworks, fetchArtist } from '@/lib/artworks'
import type { Artwork, Artist } from '@/lib/types'
import SuperClaudeLayout from '@/components/layout/SuperClaudeLayout'
import { BMADGallerySystem } from '@/components/gallery/BMADGallerySystem'
import { AgentOSNavigation } from '@/components/navigation/AgentOSNavigation'
import { cn } from '@/lib/utils'

interface EnhancedPageProps {
  initialArtworks?: Artwork[]
  initialArtist?: Artist
}

export default function EnhancedPage({ initialArtworks = [], initialArtist }: EnhancedPageProps) {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks)
  const [artist, setArtist] = useState<Artist | null>(initialArtist || null)
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter' | 'eternal'>('eternal')
  const [loading, setLoading] = useState(!initialArtworks.length)

  // 🎯 SuperClaude Pattern: Intelligent Data Loading
  useEffect(() => {
    if (!initialArtworks.length) {
      Promise.all([getArtworks(), fetchArtist()])
        .then(([artworksData, artistData]) => {
          setArtworks(artworksData)
          setArtist(artistData)
          setLoading(false)
        })
        .catch(console.error)
    }
  }, [initialArtworks.length])

  // 🎯 BMAD Pattern: Seasonal Context Detection
  useEffect(() => {
    const month = new Date().getMonth()
    const seasonMap = {
      spring: [2, 3, 4], // Mar, Apr, May
      summer: [5, 6, 7], // Jun, Jul, Aug
      autumn: [8, 9, 10], // Sep, Oct, Nov
      winter: [11, 0, 1] // Dec, Jan, Feb
    }
    
    const detectedSeason = Object.entries(seasonMap).find(([, months]) => 
      months.includes(month)
    )?.[0] as typeof currentSeason || 'eternal'
    
    setCurrentSeason(detectedSeason)
  }, [])

  // 🎨 Featured artworks for hero section (benchmark: 권소영 스타일)
  const featuredArtworks = artworks.filter(artwork => artwork.featured).slice(0, 3)
  const recentArtworks = artworks.filter(artwork => artwork.year >= 2023).slice(0, 8)

  if (loading) {
    return (
      <SuperClaudeLayout variant="gallery" culturalContext={currentSeason}>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </SuperClaudeLayout>
    )
  }

  return (
    <SuperClaudeLayout 
      variant="gallery" 
      culturalContext={currentSeason}
      enableMicroInteractions={true}
    >
      {/* 🎯 Agent OS Navigation */}
      <AgentOSNavigation
        variant="horizontal"
        culturalContext={currentSeason}
        enableBilingualMode={true}
        enableAgentFeatures={true}
      />

      {/* 🎨 Hero Section - Benchmark: 권소영 스타일 큰 임팩트 */}
      <section className="aceternity-section relative pt-20">
        <div className="aceternity-container">
          <motion.div
            className="grid lg:grid-cols-2 gap-zen-xl items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Text Content */}
            <div className="space-y-zen-lg">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <h1 className="aceternity-heading-xl text-6xl lg:text-8xl leading-tight text-foreground mb-8">
                  아남<br />
                  <span className="text-primary">배옥영</span>
                </h1>
                
                <p className="aceternity-heading-lg text-2xl lg:text-3xl text-muted-foreground leading-relaxed mb-8">
                  전통의 깊이와<br />
                  현대적 몰입감을 동시에 제공하는<br />
                  <span className="text-accent font-medium">혁신적인 서예 갤러리</span>
                </p>

                <div className="flex flex-wrap gap-3">
                  <motion.span
                    className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    {artworks.length}개 작품
                  </motion.span>
                  <motion.span
                    className="px-4 py-2 bg-secondary/10 text-secondary-foreground rounded-full text-sm font-medium border border-secondary/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    2021-2025
                  </motion.span>
                  <motion.span
                    className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium border border-accent/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    전통 서예 × 현대 디자인
                  </motion.span>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <motion.a
                  href="/gallery"
                  className="aceternity-button-primary px-8 py-4 text-lg font-medium"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  갤러리 탐험하기
                </motion.a>
                
                <motion.a
                  href="/artist"
                  className="aceternity-button-secondary px-8 py-4 text-lg font-medium"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  작가 소개
                </motion.a>
                
                <motion.a
                  href="/aceternity-demo"
                  className="aceternity-button-accent px-8 py-4 text-lg font-medium"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Aceternity Demo
                </motion.a>
              </motion.div>
            </div>

            {/* Featured Artwork Showcase */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="aceternity-card aceternity-card-elevated relative aspect-square overflow-hidden shadow-aceternity-xl">
                {featuredArtworks[0] && (
                  <img
                    src={featuredArtworks[0].imageUrl}
                    alt={featuredArtworks[0].title}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Overlay with artwork info */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent">
                  <div className="absolute bottom-zen-md left-zen-md right-zen-md text-paper">
                    <h3 className="font-display text-xl mb-2">
                      {featuredArtworks[0]?.title}
                    </h3>
                    <p className="text-sm opacity-90">
                      {featuredArtworks[0]?.year} • {featuredArtworks[0]?.medium}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional featured artworks */}
              <div className="absolute -right-4 -bottom-4 grid grid-cols-2 gap-2">
                {featuredArtworks.slice(1, 3).map((artwork, index) => (
                  <motion.div
                    key={artwork.id}
                    className="w-20 h-20 rounded-lg overflow-hidden shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                  >
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 🎯 BMAD Gallery System - 최신 작품 하이라이트 */}
      <section className="py-zen-xl px-zen-md">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-zen-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              'zen-typography-section font-display text-4xl lg:text-5xl',
              'text-ink mb-zen-md'
            )}>
              최신 작품
            </h2>
            <p className="zen-typography-body text-ink-light max-w-2xl mx-auto">
              2023년부터 현재까지, 작가의 최근 작업을 통해 
              진화하는 서예 예술의 새로운 경지를 만나보세요.
            </p>
          </motion.div>

          <BMADGallerySystem
            artworks={recentArtworks}
            variant="immersive"
            layout="adaptive"
            culturalContext={currentSeason}
            enableBenchmarkFeatures={true}
          />
        </div>
      </section>

      {/* 🎨 Artist Highlight Section - Benchmark: 권소영 스타일 */}
      {artist && (
        <section className="py-zen-xl px-zen-md bg-paper-warm/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid lg:grid-cols-3 gap-zen-xl items-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="lg:col-span-2 space-y-zen-lg">
                <h2 className={cn(
                  'zen-typography-section font-display text-3xl lg:text-4xl',
                  'text-ink mb-zen-md'
                )}>
                  작가 이야기
                </h2>
                
                <p className="zen-typography-body text-ink-light leading-relaxed">
                  {artist.statement}
                </p>

                <div className="grid sm:grid-cols-2 gap-zen-md">
                  <div>
                    <h3 className="font-display text-lg text-ink mb-zen-sm">주요 전시</h3>
                    <ul className="space-y-1 text-sm text-ink-light">
                      {artist.exhibitions.slice(0, 3).map((exhibition, index) => (
                        <li key={index}>{exhibition}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-display text-lg text-ink mb-zen-sm">수상 경력</h3>
                    <ul className="space-y-1 text-sm text-ink-light">
                      {artist.awards.slice(0, 3).map((award, index) => (
                        <li key={index}>{award}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <motion.a
                  href="/artist"
                  className={cn(
                    'inline-flex items-center px-zen-lg py-zen-md',
                    'border-2 border-gold text-gold rounded-lg',
                    'font-medium transition-all duration-200',
                    'hover:bg-gold hover:text-paper hover:shadow-zen-depth'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  더 자세히 보기 →
                </motion.a>
              </div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="aspect-square rounded-2xl overflow-hidden shadow-zen-float">
                  <img
                    src={artist.profileImageUrl}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* 🎯 Cultural Context Section */}
      <section className="py-zen-xl px-zen-md">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={cn(
              'zen-typography-section font-display text-3xl lg:text-4xl',
              'text-ink mb-zen-lg'
            )}>
              Zen Brutalism Foundation
            </h2>
            
            <p className="zen-typography-body text-ink-light leading-relaxed mb-zen-xl">
              전통 한국 서예의 정신과 현대적 디지털 인터랙션이 조화를 이루는 
              혁신적인 디자인 시스템을 경험해보세요.
            </p>

            <div className="grid sm:grid-cols-3 gap-zen-lg">
              {[
                {
                  phase: 'Phase 1',
                  title: '백지의 시작',
                  description: '여백의 미학 + 기하학적 브루탈리즘',
                  link: '/zen-demo'
                },
                {
                  phase: 'Phase 2', 
                  title: '먹과 유리의 조화',
                  description: '다층 글래스 모피즘 + 유동하는 먹 효과',
                  link: '/immersive-demo'
                },
                {
                  phase: 'Phase 3',
                  title: '전통의 깊이',
                  description: '삼분법, 음양균형, 계절 미학 통합',
                  link: '/cultural-demo'
                }
              ].map((phase, index) => (
                <motion.a
                  key={phase.phase}
                  href={phase.link}
                  className={cn(
                    'block p-zen-lg rounded-xl border border-ink/10',
                    'hover:border-gold/40 hover:shadow-zen-depth',
                    'transition-all duration-300 group'
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <div className="text-gold text-sm font-medium mb-2 group-hover:text-gold-dark transition-colors">
                    {phase.phase}
                  </div>
                  <h3 className="font-display text-lg text-ink mb-zen-sm group-hover:text-gold transition-colors">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-ink-light leading-relaxed">
                    {phase.description}
                  </p>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </SuperClaudeLayout>
  )
}