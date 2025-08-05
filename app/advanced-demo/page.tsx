'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ZenBrutalistHero } from '@/components/zen-brutalist-hero'
import { InkAnimationSystem, InkFlowEffect } from '@/components/ink-animation-system'
import { 
  AdvancedGlassMorphism, 
  MultiLayerGlassCard, 
  DepthGlassContainer 
} from '@/components/advanced-glass-morphism'

export default function AdvancedDemo() {
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring')
  const [activeEffect, setActiveEffect] = useState<'ink' | 'glass' | 'depth'>('ink')

  const seasons = [
    { key: 'spring', name: '봄', description: '벚꽃과 새싹의 계절' },
    { key: 'summer', name: '여름', description: '푸른 하늘과 녹음의 계절' },
    { key: 'autumn', name: '가을', description: '단풍과 황금빛의 계절' },
    { key: 'winter', name: '겨울', description: '눈과 얼음의 계절' },
  ] as const

  const effects = [
    { key: 'ink', name: '먹 애니메이션', description: '전통 서예 붓질 효과' },
    { key: 'glass', name: '글래스모피즘', description: '다층 깊이감 글래스 효과' },
    { key: 'depth', name: '깊이감 컨테이너', description: '3D 깊이감 인터랙션' },
  ] as const

  return (
    <div className="min-h-screen bg-paper">
      {/* 컨트롤 패널 */}
      <div className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-ink/20">
        <h3 className="text-calligraphy-title text-ink mb-4">고급 효과 컨트롤</h3>
        
        {/* 계절 선택 */}
        <div className="mb-6">
          <h4 className="text-calligraphy-caption text-ink mb-2">계절 선택</h4>
          <div className="flex flex-wrap gap-2">
            {seasons.map((season) => (
              <button
                key={season.key}
                onClick={() => setCurrentSeason(season.key)}
                className={`
                  px-3 py-1 rounded-md text-calligraphy-caption
                  transition-all duration-300
                  ${currentSeason === season.key 
                    ? 'bg-ink text-paper' 
                    : 'bg-paper text-ink border border-ink hover:bg-ink hover:text-paper'
                  }
                `}
              >
                {season.name}
              </button>
            ))}
          </div>
        </div>

        {/* 효과 선택 */}
        <div>
          <h4 className="text-calligraphy-caption text-ink mb-2">효과 선택</h4>
          <div className="flex flex-wrap gap-2">
            {effects.map((effect) => (
              <button
                key={effect.key}
                onClick={() => setActiveEffect(effect.key)}
                className={`
                  px-3 py-1 rounded-md text-calligraphy-caption
                  transition-all duration-300
                  ${activeEffect === effect.key 
                    ? 'bg-ink text-paper' 
                    : 'bg-paper text-ink border border-ink hover:bg-ink hover:text-paper'
                  }
                `}
              >
                {effect.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 히어로 섹션 */}
      <ZenBrutalistHero
        title="고급 인터랙티브 갤러리"
        subtitle="전통과 현대의 완벽한 조화"
        description="한국 전통 서예의 정신과 최신 디지털 기술이 만나 탄생한 혁신적인 인터랙티브 경험을 체험해보세요."
        season={currentSeason}
      />

      {/* 효과 데모 섹션 */}
      <section className="py-zen-2xl px-zen-xl">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-calligraphy-title text-responsive-2xl text-ink mb-zen-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            인터랙티브 효과 데모
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-zen-xl">
            {/* 먹 애니메이션 데모 */}
            {activeEffect === 'ink' && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="h-96"
              >
                <InkAnimationSystem
                  intensity={0.8}
                  brushSize={120}
                  inkColor={`hsl(var(--${currentSeason}-accent))`}
                >
                  <div className="h-full flex items-center justify-center">
                    <InkFlowEffect flowIntensity={0.3}>
                      <div className="text-center p-zen-xl">
                        <h3 className="text-calligraphy-title text-responsive-xl text-ink mb-zen-md">
                          먹 애니메이션 시스템
                        </h3>
                        <p className="text-calligraphy-body text-responsive-base text-ink-light">
                          마우스를 움직이고 클릭하여 전통 서예 붓질 효과를 체험해보세요.
                        </p>
                        <div className="mt-zen-lg p-zen-md border border-ink/30 rounded-lg">
                          <p className="text-calligraphy-caption text-ink-light">
                            붓 터치: 클릭하여 붓 터치 효과 생성
                          </p>
                          <p className="text-calligraphy-caption text-ink-light">
                            먹 흐름: 자동으로 생성되는 먹 흐름 효과
                          </p>
                        </div>
                      </div>
                    </InkFlowEffect>
                  </div>
                </InkAnimationSystem>
              </motion.div>
            )}

            {/* 글래스모피즘 데모 */}
            {activeEffect === 'glass' && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="h-96"
              >
                <AdvancedGlassMorphism
                  layers={4}
                  depth={0.6}
                  blurIntensity={15}
                  season={currentSeason}
                >
                  <div className="h-full flex items-center justify-center">
                    <MultiLayerGlassCard
                      depth={0.4}
                      season={currentSeason}
                      className="w-full max-w-md"
                    >
                      <div className="text-center">
                        <h3 className="text-calligraphy-title text-responsive-xl text-ink mb-zen-md">
                          다층 글래스모피즘
                        </h3>
                        <p className="text-calligraphy-body text-responsive-base text-ink-light mb-zen-lg">
                          마우스 움직임에 따라 반응하는 다층 글래스 효과를 체험해보세요.
                        </p>
                        <div className="space-y-zen-sm">
                          <div className="w-full h-2 bg-ink/20 rounded"></div>
                          <div className="w-full h-2 bg-ink/15 rounded"></div>
                          <div className="w-full h-2 bg-ink/10 rounded"></div>
                        </div>
                      </div>
                    </MultiLayerGlassCard>
                  </div>
                </AdvancedGlassMorphism>
              </motion.div>
            )}

            {/* 깊이감 컨테이너 데모 */}
            {activeEffect === 'depth' && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="h-96"
              >
                <DepthGlassContainer
                  depth={0.5}
                  season={currentSeason}
                >
                  <div className="text-center">
                    <h3 className="text-calligraphy-title text-responsive-xl text-ink mb-zen-md">
                      3D 깊이감 컨테이너
                    </h3>
                    <p className="text-calligraphy-body text-responsive-base text-ink-light mb-zen-lg">
                      마우스 움직임에 따라 3D 깊이감이 변화하는 인터랙티브 컨테이너입니다.
                    </p>
                    <div className="grid grid-cols-2 gap-zen-md">
                      <div className="p-zen-sm bg-white/10 rounded border border-white/20">
                        <p className="text-calligraphy-caption text-ink-light">깊이 레이어 1</p>
                      </div>
                      <div className="p-zen-sm bg-white/10 rounded border border-white/20">
                        <p className="text-calligraphy-caption text-ink-light">깊이 레이어 2</p>
                      </div>
                    </div>
                  </div>
                </DepthGlassContainer>
              </motion.div>
            )}

            {/* 설명 패널 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-96 flex items-center"
            >
              <div className="p-zen-xl bg-paper border border-ink/20 rounded-lg">
                <h3 className="text-calligraphy-title text-responsive-xl text-ink mb-zen-md">
                  {effects.find(e => e.key === activeEffect)?.name}
                </h3>
                <p className="text-calligraphy-body text-responsive-base text-ink-light mb-zen-lg">
                  {effects.find(e => e.key === activeEffect)?.description}
                </p>
                
                <div className="space-y-zen-md">
                  <div>
                    <h4 className="text-calligraphy-bold text-responsive-base text-ink mb-zen-sm">
                      현재 계절: {seasons.find(s => s.key === currentSeason)?.name}
                    </h4>
                    <p className="text-calligraphy-caption text-ink-light">
                      {seasons.find(s => s.key === currentSeason)?.description}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-calligraphy-bold text-responsive-base text-ink mb-zen-sm">
                      사용된 기술
                    </h4>
                    <ul className="text-calligraphy-caption text-ink-light space-y-zen-xs">
                      <li>• Framer Motion 애니메이션</li>
                      <li>• CSS Custom Properties</li>
                      <li>• React Hooks</li>
                      <li>• TypeScript 타입 안전성</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 성능 최적화 섹션 */}
      <section className="py-zen-2xl px-zen-xl bg-stone">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-calligraphy-title text-responsive-2xl text-ink mb-zen-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            성능 최적화
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-zen-lg">
            <motion.div 
              className="p-zen-lg bg-paper rounded-lg border border-ink/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-calligraphy-bold text-responsive-lg text-ink mb-zen-sm">
                메모리 최적화
              </h3>
              <p className="text-calligraphy-caption text-ink-light">
                자동 정리되는 애니메이션 객체로 메모리 누수 방지
              </p>
            </motion.div>

            <motion.div 
              className="p-zen-lg bg-paper rounded-lg border border-ink/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-calligraphy-bold text-responsive-lg text-ink mb-zen-sm">
                렌더링 최적화
              </h3>
              <p className="text-calligraphy-caption text-ink-light">
                GPU 가속을 활용한 부드러운 애니메이션 성능
              </p>
            </motion.div>

            <motion.div 
              className="p-zen-lg bg-paper rounded-lg border border-ink/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-calligraphy-bold text-responsive-lg text-ink mb-zen-sm">
                접근성 지원
              </h3>
              <p className="text-calligraphy-caption text-ink-light">
                WCAG 2.1 AA 준수 및 고대비 모드 지원
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
} 