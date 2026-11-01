'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useThrottledMouseMove } from '@/lib/hooks/use-throttled-handlers'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  description?: string
  featuredArtwork?: {
    id: string
    title: string
    imageUrl: string
    year: string
    medium: string
  }
}

export function HeroSection({
  title = '아남 배옥영',
  subtitle = '전통과 현대가 만나는 서예의 새로운 지평',
  description = '깊이 있는 전통 서예 기법과 현대적 감각이 조화를 이루는 독창적인 작품 세계를 만나보세요.',
  featuredArtwork,
}: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleMouseMove = useThrottledMouseMove(
    useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!heroRef.current) return

      const rect = heroRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      setMousePosition({ x, y })
    }, []),
    []
  )

  return (
    <section
      ref={heroRef}
      className='relative min-h-screen flex items-center justify-center overflow-hidden'
      onMouseMove={handleMouseMove}
      style={{
        background: `radial-gradient(
          circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
          rgba(0, 0, 0, 0.03) 0%,
          transparent 50%
        )`,
      }}
    >
      {/* Background Elements */}
      <div className='absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:from-transparent dark:via-gray-900/50 dark:to-gray-900' />

      {/* Subtle background pattern */}
      <div className='absolute inset-0 opacity-[0.02] dark:opacity-[0.05]'>
        <div className='absolute top-1/4 left-1/4 w-32 h-32 bg-gray-900 rounded-full blur-3xl' />
        <div className='absolute top-3/4 right-1/4 w-24 h-24 bg-gray-600 rounded-full blur-2xl' />
        <div className='absolute bottom-1/2 left-1/2 w-16 h-16 bg-gray-400 rounded-full blur-xl' />
      </div>

      <motion.div
        className='container mx-auto px-4 py-20 relative z-10'
        style={{ y, opacity }}
      >
        <div className='grid lg:grid-cols-2 gap-16 items-center'>
          {/* Content */}
          <motion.div
            className='space-y-8'
            initial={{ x: -50 }}
            animate={isVisible ? { x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Title */}
            <div className='space-y-4'>
              <motion.h1
                className='text-5xl sm:text-6xl lg:text-7xl font-serif text-gray-900 dark:text-white leading-tight'
                initial={{ y: 20 }}
                animate={isVisible ? { y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {title}
              </motion.h1>

              <motion.p
                className='text-xl sm:text-2xl text-gray-600 dark:text-gray-300 font-light tracking-wide'
                initial={{ y: 20 }}
                animate={isVisible ? { y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {subtitle}
              </motion.p>
            </div>

            {/* Description */}
            <motion.p
              className='text-lg text-gray-700 dark:text-gray-400 leading-relaxed max-w-2xl'
              initial={{ y: 20 }}
              animate={isVisible ? { y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {description}
            </motion.p>

            {/* CTA Buttons: 투명도로 페이드하지 않는다. 마지막(약 1.8초)에 나타나는 주요 버튼이 그동안 흐려
                글자 대비가 1.9:1 까지 떨어졌다(Lighthouse color-contrast). 위치만 움직이고 글자는 처음부터 또렷하게 */}
            <motion.div
              className='flex flex-col sm:flex-row gap-4'
              initial={{ y: 20 }}
              animate={isVisible ? { y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <Link
                href='/gallery'
                className='group flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium transition-all duration-300 hover:bg-gray-800 dark:hover:bg-gray-100 hover:scale-105 hover:shadow-xl'
              >
                <span>갤러리 둘러보기</span>
                <motion.div
                  className='w-2 h-2 bg-current rounded-full'
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </Link>

              <Link
                href='/artist'
                className='group flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-medium transition-all duration-300 hover:border-gray-900 dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-800'
              >
                <span>작가 소개</span>
                <ChevronDown className='w-4 h-4 transition-transform group-hover:translate-x-1' />
              </Link>
            </motion.div>
          </motion.div>

          {/* Featured Artwork */}
          {featuredArtwork && (
            <motion.div
              className='relative'
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className='relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-2xl'>
                <Image
                  src={featuredArtwork.imageUrl}
                  alt={featuredArtwork.title}
                  fill
                  className='object-cover'
                  sizes='(max-width: 1024px) 100vw, 50vw'
                  priority
                />

                {/* Artwork overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-500'>
                  <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
                    <p className='text-xl font-medium mb-2'>
                      {featuredArtwork.title}
                    </p>
                    <div className='flex items-center gap-3 text-sm opacity-90'>
                      <span>{featuredArtwork.year}</span>
                      <span>•</span>
                      <span>{featuredArtwork.medium}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <motion.div
                className='absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700'
                animate={{
                  y: [0, -5, 0],
                  rotate: [0, 1, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className='text-xs text-gray-600 dark:text-gray-400 mb-1'>
                  대표작
                </div>
                <div className='font-medium text-gray-900 dark:text-white'>
                  {featuredArtwork.title}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Scroll Indicator: 글자가 있으므로 투명도로 페이드하지 않고, gray-400(흰 배경 약 2.5:1) 대신
            gray-600·dark gray-400 으로 대비를 맞춘다 */}
        <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2'>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className='flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400'
          >
            <span className='text-xs font-light'>더 많은 작품들</span>
            <ChevronDown className='w-5 h-5' />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
