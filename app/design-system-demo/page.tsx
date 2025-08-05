'use client'

import { useState } from 'react'
import { ZenBrutalistHero } from '@/components/zen-brutalist-hero'
import { motion } from 'framer-motion'

export default function DesignSystemDemo() {
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring')

  const seasons = [
    { key: 'spring', name: '봄', description: '벚꽃과 새싹의 계절' },
    { key: 'summer', name: '여름', description: '푸른 하늘과 녹음의 계절' },
    { key: 'autumn', name: '가을', description: '단풍과 황금빛의 계절' },
    { key: 'winter', name: '겨울', description: '눈과 얼음의 계절' },
  ] as const

  return (
    <div className="min-h-screen bg-paper">
      {/* 계절 선택기 */}
      <div className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="text-calligraphy-title text-ink mb-4">계절 선택</h3>
        <div className="flex flex-wrap gap-2">
          {seasons.map((season) => (
            <button
              key={season.key}
              onClick={() => setCurrentSeason(season.key)}
              className={`
                px-4 py-2 rounded-md text-calligraphy-caption
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

      {/* 메인 히어로 섹션 */}
      <ZenBrutalistHero
        title="아남 배옥영 서예 갤러리"
        subtitle="전통의 깊이와 현대적 몰입감"
        description="한국 전통 서예의 정신과 현대적 디지털 인터랙션이 조화를 이루는 혁신적인 웹 갤러리입니다."
        season={currentSeason}
      />

      {/* 타이포그래피 데모 섹션 */}
      <section className="py-zen-2xl px-zen-xl bg-paper">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-calligraphy-title text-responsive-2xl text-ink mb-zen-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            타이포그래피 시스템
          </motion.h2>

          <div className="space-y-zen-lg">
            {/* 서예 타이포그래피 스타일들 */}
            <motion.div 
              className="p-zen-lg border border-ink rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-calligraphy-title text-responsive-xl text-ink mb-zen-sm">
                서예 제목 스타일
              </h3>
              <p className="text-calligraphy-title text-responsive-lg text-ink">
                아남 배옥영 서예 갤러리
              </p>
            </motion.div>

            <motion.div 
              className="p-zen-lg border border-ink rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-calligraphy-bold text-responsive-xl text-ink mb-zen-sm">
                굵은 서예 스타일
              </h3>
              <p className="text-calligraphy-bold text-responsive-lg text-ink">
                전통의 깊이와 현대적 몰입감
              </p>
            </motion.div>

            <motion.div 
              className="p-zen-lg border border-ink rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-calligraphy-light text-responsive-xl text-ink mb-zen-sm">
                연한 서예 스타일
              </h3>
              <p className="text-calligraphy-light text-responsive-lg text-ink">
                선적 미학과 브루탈리즘의 조화
              </p>
            </motion.div>

            <motion.div 
              className="p-zen-lg border border-ink rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-calligraphy-ink text-responsive-xl mb-zen-sm">
                먹색 서예 스타일
              </h3>
              <p className="text-calligraphy-ink text-responsive-lg">
                전통 먹의 깊이와 현대적 표현
              </p>
            </motion.div>

            <motion.div 
              className="p-zen-lg border border-ink rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-calligraphy-gold text-responsive-xl mb-zen-sm">
                금색 서예 스타일
              </h3>
              <p className="text-calligraphy-gold text-responsive-lg">
                전통 금색의 화려함과 우아함
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 계절별 색상 데모 섹션 */}
      <section className="py-zen-2xl px-zen-xl bg-stone">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-calligraphy-title text-responsive-2xl text-ink mb-zen-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            계절별 색상 시스템
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-zen-lg">
            {seasons.map((season, index) => (
              <motion.div
                key={season.key}
                className={`
                  p-zen-lg rounded-lg border-2
                  bg-${season.key}-muted border-${season.key}-accent
                  seasonal-transition
                `}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h3 className={`text-calligraphy-title text-responsive-lg text-${season.key}-primary mb-zen-sm`}>
                  {season.name}
                </h3>
                <p className={`text-calligraphy-body text-responsive-base text-${season.key}-secondary mb-zen-md`}>
                  {season.description}
                </p>
                <div className="space-y-zen-sm">
                  <div className={`w-full h-8 bg-${season.key}-primary rounded`}></div>
                  <div className={`w-full h-8 bg-${season.key}-secondary rounded`}></div>
                  <div className={`w-full h-8 bg-${season.key}-accent rounded`}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 인터랙티브 데모 섹션 */}
      <section className="py-zen-2xl px-zen-xl bg-paper">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-calligraphy-title text-responsive-2xl text-ink mb-zen-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            인터랙티브 효과
          </motion.h2>

          <motion.div 
            className="p-zen-xl border-2 border-ink rounded-lg hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <p className="text-calligraphy-body text-responsive-lg text-ink mb-zen-md">
              마우스를 움직여보세요. 실시간으로 반응하는 배경 효과를 확인할 수 있습니다.
            </p>
            <p className="text-calligraphy-caption text-ink-light">
              위의 히어로 섹션에서 마우스 움직임에 따라 배경 그라디언트가 변화합니다.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 