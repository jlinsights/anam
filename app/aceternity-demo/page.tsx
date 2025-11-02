'use client'

/**
 * 🎨 Aceternity UI Demo Page
 * Showcase of modern design integration with ANAM Gallery
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SuperClaudeLayout from '@/components/layout/SuperClaudeLayout'
import { BMADGallerySystem } from '@/components/gallery/BMADGallerySystem'
import { AgentOSNavigation } from '@/components/navigation/AgentOSNavigation'
import { getArtworks } from '@/lib/artworks'
import { cn } from '@/lib/utils'
import { Sparkles, Palette, Layers, Zap, Globe } from 'lucide-react'
import type { Artwork } from '@/lib/types'

export default function AcetinityDemoPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [activeDemo, setActiveDemo] = useState<'layout' | 'gallery' | 'navigation' | 'components'>('layout')
  const [culturalContext, setCulturalContext] = useState<'spring' | 'summer' | 'autumn' | 'winter' | 'eternal'>('eternal')

  useEffect(() => {
    async function loadArtworks() {
      try {
        const artworkData = await getArtworks()
        setArtworks(artworkData.slice(0, 12)) // Show first 12 for demo
      } catch (error) {
        console.error('Failed to load artworks for demo:', error)
      }
    }
    loadArtworks()
  }, [])

  const demoSections = [
    {
      id: 'layout' as const,
      title: '레이아웃 시스템',
      subtitle: 'SuperClaude Layout with Aceternity',
      icon: Layers,
      description: '마우스 추적과 문화적 컨텍스트가 통합된 반응형 레이아웃'
    },
    {
      id: 'gallery' as const,
      title: '갤러리 시스템',
      subtitle: 'BMAD Gallery with Enhanced Design',
      icon: Palette,
      description: 'Aceternity UI 디자인으로 업그레이드된 지능형 갤러리'
    },
    {
      id: 'navigation' as const,
      title: '내비게이션',
      subtitle: 'Agent OS Navigation Enhanced',
      icon: Globe,
      description: '다국어 지원과 현대적 디자인이 결합된 네비게이션'
    },
    {
      id: 'components' as const,
      title: '컴포넌트',
      subtitle: 'Aceternity UI Components',
      icon: Zap,
      description: '버튼, 카드, 입력 필드 등 향상된 UI 컴포넌트'
    }
  ]

  const culturalOptions = [
    { value: 'eternal' as const, label: '영원', color: 'from-ink to-gold' },
    { value: 'spring' as const, label: '봄', color: 'from-spring to-spring/60' },
    { value: 'summer' as const, label: '여름', color: 'from-summer to-summer/60' },
    { value: 'autumn' as const, label: '가을', color: 'from-autumn to-autumn/60' },
    { value: 'winter' as const, label: '겨울', color: 'from-winter to-winter/60' }
  ]

  return (
    <SuperClaudeLayout 
      variant="gallery" 
      culturalContext={culturalContext}
      enableMicroInteractions={true}
      className="min-h-screen"
    >
      {/* Demo Navigation */}
      <AgentOSNavigation 
        variant="horizontal"
        culturalContext={culturalContext}
        enableBilingualMode={true}
        enableAgentFeatures={true}
      />

      {/* Hero Section */}
      <section className="aceternity-section pt-24">
        <div className="aceternity-container">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="aceternity-caption text-primary">ACETERNITY UI DEMO</span>
            </div>
            
            <h1 className="aceternity-heading-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Modern Design System
            </h1>
            
            <p className="aceternity-body max-w-2xl mx-auto">
              ANAM Gallery의 전통적 미학과 Aceternity UI의 현대적 디자인이 만나 
              새로운 디지털 예술 경험을 제공합니다.
            </p>

            {/* Cultural Context Selector */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {culturalOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setCulturalContext(option.value)}
                  className={cn(
                    'aceternity-button-secondary px-4 py-2 text-sm',
                    culturalContext === option.value && 'aceternity-button-primary'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={cn('w-3 h-3 rounded-full mr-2 bg-gradient-to-r', option.color)} />
                  {option.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Section Navigation */}
      <section className="aceternity-section">
        <div className="aceternity-container">
          <div className="aceternity-grid max-w-4xl mx-auto">
            {demoSections.map((section) => {
              const IconComponent = section.icon
              return (
                <motion.div
                  key={section.id}
                  onClick={() => setActiveDemo(section.id)}
                  className={cn(
                    'aceternity-card aceternity-card-interactive cursor-pointer p-6',
                    activeDemo === section.id && 'aceternity-card-elevated shadow-aceternity-xl border-primary/50'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={cn(
                      'p-3 rounded-lg',
                      activeDemo === section.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="aceternity-heading-md text-lg mb-2">{section.title}</h3>
                      <p className="aceternity-caption text-muted-foreground mb-2">{section.subtitle}</p>
                      <p className="aceternity-body text-sm">{section.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Active Demo Content */}
      <section className="aceternity-section">
        <div className="aceternity-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDemo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeDemo === 'layout' && (
                <div className="space-y-6">
                  <h2 className="aceternity-heading-lg text-center">SuperClaude Layout System</h2>
                  <div className="aceternity-card p-8 space-y-4">
                    <h3 className="aceternity-heading-md">Features</h3>
                    <ul className="aceternity-body space-y-2">
                      <li>• Real-time mouse tracking and background effects</li>
                      <li>• Cultural context integration with seasonal themes</li>
                      <li>• Glass morphism depth layers with Aceternity colors</li>
                      <li>• Performance metrics display for development</li>
                      <li>• Responsive design with mobile optimization</li>
                    </ul>
                    <div className="aceternity-caption text-muted-foreground">
                      마우스를 움직여 배경 효과를 확인해보세요. 문화적 컨텍스트를 변경하면 색상 테마가 변경됩니다.
                    </div>
                  </div>
                </div>
              )}

              {activeDemo === 'gallery' && artworks.length > 0 && (
                <div className="space-y-6">
                  <h2 className="aceternity-heading-lg text-center">BMAD Gallery System</h2>
                  <BMADGallerySystem
                    artworks={artworks}
                    variant="immersive"
                    layout="adaptive"
                    culturalContext={culturalContext}
                    enableBenchmarkFeatures={true}
                  />
                </div>
              )}

              {activeDemo === 'navigation' && (
                <div className="space-y-6">
                  <h2 className="aceternity-heading-lg text-center">Agent OS Navigation</h2>
                  <div className="aceternity-card p-8 space-y-4">
                    <h3 className="aceternity-heading-md">Enhanced Features</h3>
                    <ul className="aceternity-body space-y-2">
                      <li>• Aceternity UI styling with consistent color system</li>
                      <li>• Bilingual support (Korean/English)</li>
                      <li>• Multiple layout variants (horizontal, vertical, floating, minimal)</li>
                      <li>• Smooth animations and hover effects</li>
                      <li>• Accessibility optimizations</li>
                    </ul>
                    <div className="aceternity-caption text-muted-foreground">
                      위의 네비게이션 바를 확인해보세요. 언어 전환 버튼과 호버 효과가 적용되어 있습니다.
                    </div>
                  </div>
                </div>
              )}

              {activeDemo === 'components' && (
                <div className="space-y-6">
                  <h2 className="aceternity-heading-lg text-center">Aceternity UI Components</h2>
                  <div className="aceternity-grid max-w-4xl mx-auto">
                    
                    {/* Buttons Demo */}
                    <div className="aceternity-card p-6 space-y-4">
                      <h3 className="aceternity-heading-md">Buttons</h3>
                      <div className="space-y-3">
                        <button className="aceternity-button-primary">Primary Button</button>
                        <button className="aceternity-button-secondary">Secondary Button</button>
                        <button className="aceternity-button-accent">Accent Button</button>
                      </div>
                    </div>

                    {/* Cards Demo */}
                    <div className="aceternity-card p-6 space-y-4">
                      <h3 className="aceternity-heading-md">Cards</h3>
                      <div className="aceternity-card aceternity-card-elevated p-4">
                        <p className="aceternity-body">Elevated Card</p>
                      </div>
                      <div className="aceternity-card aceternity-card-interactive p-4 cursor-pointer">
                        <p className="aceternity-body">Interactive Card</p>
                      </div>
                    </div>

                    {/* Inputs Demo */}
                    <div className="aceternity-card p-6 space-y-4">
                      <h3 className="aceternity-heading-md">Inputs</h3>
                      <input 
                        type="text" 
                        placeholder="Text Input"
                        className="aceternity-input w-full"
                      />
                      <textarea 
                        placeholder="Textarea"
                        className="aceternity-textarea w-full"
                      />
                    </div>

                    {/* Typography Demo */}
                    <div className="aceternity-card p-6 space-y-4">
                      <h3 className="aceternity-heading-md">Typography</h3>
                      <div className="space-y-2">
                        <h1 className="aceternity-heading-xl text-2xl">Heading XL</h1>
                        <h2 className="aceternity-heading-lg text-xl">Heading LG</h2>
                        <h3 className="aceternity-heading-md text-lg">Heading MD</h3>
                        <p className="aceternity-body">Body text with proper spacing and readability.</p>
                        <p className="aceternity-caption">Caption text for supporting information.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Cultural Context Info */}
      <section className="aceternity-section">
        <div className="aceternity-container">
          <div className={cn(
            'aceternity-card p-8 text-center',
            culturalContext && `aceternity-cultural-${culturalContext}`
          )}>
            <h3 className="aceternity-heading-md mb-4">
              현재 문화적 컨텍스트: {culturalOptions.find(opt => opt.value === culturalContext)?.label}
            </h3>
            <p className="aceternity-body">
              각 계절과 영원의 테마는 전통 한국 미학을 반영하여 색상과 분위기를 조정합니다.
              Aceternity UI의 현대적 디자인과 결합되어 독특한 시각적 경험을 제공합니다.
            </p>
          </div>
        </div>
      </section>
    </SuperClaudeLayout>
  )
}