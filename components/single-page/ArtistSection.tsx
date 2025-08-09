'use client'

import { motion } from 'framer-motion'
import type { Artist } from '@/lib/types'

interface ArtistSectionProps {
  artist?: Artist
}

export function ArtistSection({ artist }: ArtistSectionProps) {
  // Fallback artist data if not provided
  const artistData = artist || {
    id: 'anam',
    name: '아남 배옥영',
    bio: '전통 서예의 깊이와 현대적 감각을 조화시키며, 한국 미학의 정수를 현대적 언어로 재해석하는 작업을 하고 있습니다.',
    birthYear: 1955,
    exhibitions: [],
    awards: [],
    education: [],
  }

  return (
    <div className="max-w-7xl mx-auto px-zen-md">
      {/* Section header */}
      <motion.div
        className="text-center mb-zen-xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="font-calligraphy font-bold text-ink text-3xl md:text-4xl mb-zen-sm">
          작가 소개
        </h2>
        <p className="font-display text-ink-light text-lg">
          Artist Profile • 書藝家
        </p>
        <div className="mt-zen-sm flex justify-center">
          <div className="w-24 h-1 bg-gold"></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-zen-xl items-center">
        {/* Artist image */}
        <motion.div
          className="flex justify-center order-2 lg:order-1"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="
            relative bg-paper-cream w-80 h-96 border-4 border-ink
            shadow-brutal hover:shadow-brutal-strong
            transition-all duration-300
            hover:-translate-x-2 hover:-translate-y-2
            flex items-center justify-center
            group cursor-pointer
          ">
            {/* Portrait placeholder */}
            <div className="absolute inset-4 bg-paper border-2 border-ink/20 flex flex-col items-center justify-center">
              <div className="w-24 h-24 border-2 border-ink/30 rounded-full mb-zen-sm flex items-center justify-center">
                <span className="font-calligraphy text-ink/60 text-xl">芽南</span>
              </div>
              <span className="font-display text-ink-light text-sm">작가 프로필</span>
            </div>
            
            {/* Hover effect */}
            <div className="
              absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100
              transition-opacity duration-300
              flex items-center justify-center
            ">
              <span className="font-display text-ink text-sm">작가의 세계</span>
            </div>
          </div>
        </motion.div>

        {/* Artist content */}
        <motion.div
          className="order-1 lg:order-2"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="mb-zen-md">
            <h3 className="font-calligraphy font-bold text-ink text-3xl md:text-4xl mb-zen-sm">
              {artistData.name}
            </h3>
            <p className="font-display text-gold text-lg font-medium mb-zen-sm">
              ANAM Bae Ok Young • 書藝家
            </p>
            {artistData.birthYear && (
              <p className="font-display text-ink-light">
                {artistData.birthYear}년생
              </p>
            )}
          </div>
          
          <div className="space-y-zen-md">
            <motion.p 
              className="font-display text-ink text-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              전통 서예의 깊이와 현대적 감각을 조화시키며, 
              <strong className="text-gold font-semibold"> 한국 미학의 정수</strong>를 
              현대적 언어로 재해석하는 작업을 하고 있습니다.
            </motion.p>
            
            <motion.p 
              className="font-display text-ink-light leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              오랜 수행과 연구를 통해 완성된 독창적인 서예 세계를 
              디지털 갤러리를 통해 널리 공유하고자 합니다.
            </motion.p>
            
            <motion.blockquote 
              className="border-l-4 border-gold pl-zen-md py-zen-sm bg-paper-warm"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="font-calligraphy text-ink italic text-lg">
                "먹과 붓이 만나는 순간, 전통과 현대가 하나가 된다"
              </p>
              <cite className="font-display text-ink-light text-sm block mt-zen-xs">
                - {artistData.name}
              </cite>
            </motion.blockquote>

            {/* Artist details */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-zen-md mt-zen-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <div>
                <h4 className="font-display font-semibold text-ink mb-zen-sm">작품 세계</h4>
                <ul className="space-y-1 text-sm text-ink-light">
                  <li>• 전통 서예의 현대적 재해석</li>
                  <li>• 한국적 미학의 디지털 표현</li>
                  <li>• 선묵(線墨)의 조화와 균형</li>
                  <li>• 여백의 미학과 공간 활용</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-display font-semibold text-ink mb-zen-sm">작업 철학</h4>
                <ul className="space-y-1 text-sm text-ink-light">
                  <li>• 전통 계승과 현대적 혁신</li>
                  <li>• 문화적 정체성의 탐구</li>
                  <li>• 디지털 시대의 서예 확장</li>
                  <li>• 국제적 문화 교류</li>
                </ul>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            className="mt-zen-xl flex flex-col sm:flex-row gap-zen-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            viewport={{ once: true }}
          >
            <button className="
              inline-block px-zen-lg py-zen-md
              bg-paper border-4 border-ink text-ink font-display font-bold
              hover:bg-ink hover:text-paper
              transition-all duration-300
              shadow-brutal-offset hover:shadow-brutal
              transform hover:translate-x-1 hover:translate-y-1
            ">
              작품 세계 더 알아보기
            </button>
            
            <button className="
              inline-block px-zen-lg py-zen-md
              bg-gold text-ink font-display font-bold
              hover:bg-ink hover:text-paper
              transition-all duration-300
              shadow-brutal hover:shadow-brutal-strong
              transform hover:-translate-x-1 hover:-translate-y-1
              border-4 border-gold hover:border-ink
            ">
              전시 이력 보기
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Additional section - Artist philosophy */}
      <motion.div
        className="mt-zen-2xl pt-zen-xl border-t-2 border-ink/20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="text-center max-w-4xl mx-auto">
          <h3 className="font-calligraphy font-bold text-ink text-2xl mb-zen-lg">
            작가의 메시지
          </h3>
          
          <div className="bg-paper-warm p-zen-xl border-4 border-ink shadow-brutal">
            <p className="font-display text-ink text-lg leading-relaxed mb-zen-md">
              서예는 단순한 글씨가 아니라 마음의 흔적이며, 시대를 관통하는 정신의 표현입니다. 
              전통의 깊이를 잃지 않으면서도 현대인들과 소통할 수 있는 새로운 언어를 찾아가고 있습니다.
            </p>
            
            <p className="font-display text-ink-light leading-relaxed">
              이 디지털 갤러리를 통해 더 많은 분들이 서예의 아름다움을 경험하고, 
              전통 문화의 가치를 새롭게 인식하는 계기가 되기를 희망합니다.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}