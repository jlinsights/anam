'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useSectionSwipe } from '@/hooks/useSwipeGestures'

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // Touch gesture support for section navigation
  const swipeRef = useSectionSwipe(
    () => onNavigate('gallery'),     // Swipe left → go to gallery
    () => onNavigate('contact')      // Swipe right → go to contact
  )

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePosition({ x, y })
  }, [])

  return (
    <motion.div 
      ref={swipeRef}
      className="
        relative min-h-screen flex items-center justify-center overflow-hidden
        bg-gradient-to-br from-paper via-paper-warm to-paper-cream
        pt-24
      "
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* Dynamic ink flow background */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          background: `
            radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
              hsl(var(--ink)) 0%, 
              hsl(var(--gold)) 30%,
              transparent 70%
            )
          `
        }}
        animate={{
          scale: isHovered ? 1.1 : 1,
          opacity: isHovered ? 0.15 : 0.1
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Geometric brutalist elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-ink opacity-10"
        animate={{
          rotate: mousePosition.x * 30,
          scale: isHovered ? 1.2 : 1
        }}
        transition={{ duration: 0.6 }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-24 h-24 border-4 border-gold opacity-20"
        animate={{
          rotate: mousePosition.y * -20,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-zen-md py-zen-xl max-w-6xl mx-auto">
        {/* Title */}
        <motion.h1
          className="
            font-calligraphy font-bold text-ink mb-zen-lg
            text-4xl sm:text-5xl md:text-6xl lg:text-7xl
            drop-shadow-sm
          "
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <span className="block">아남 배옥영</span>
          <span className="block text-gold font-display text-2xl sm:text-3xl md:text-4xl mt-zen-sm">
            Oriental Calligraphy
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="
            font-display text-ink-light text-lg sm:text-xl md:text-2xl 
            max-w-4xl mx-auto leading-relaxed mb-zen-xl
          "
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          전통 서예의 정신과 현대적 감각이 어우러진 작품 세계<br />
          <span className="text-base sm:text-lg text-brush font-body">
            단일 페이지로 만나는 완전한 갤러리 경험
          </span>
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-zen-sm justify-center items-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <button 
            onClick={() => onNavigate('gallery')}
            className="
              group relative px-zen-lg py-zen-md
              bg-ink text-paper font-display font-bold
              hover:bg-gold hover:text-ink
              transition-all duration-300
              shadow-brutal hover:shadow-brutal-strong
              transform hover:-translate-x-1 hover:-translate-y-1
              border-4 border-ink hover:border-gold
              min-w-[200px]
            "
          >
            <span className="relative z-10">작품 갤러리 탐험</span>
            <div className="absolute inset-0 bg-gold opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          </button>
          
          <button 
            onClick={() => onNavigate('artist')}
            className="
              group relative px-zen-lg py-zen-md
              bg-paper border-4 border-ink text-ink font-display font-bold
              hover:bg-ink hover:text-paper
              transition-all duration-300
              shadow-brutal-offset hover:shadow-brutal
              transform hover:translate-x-1 hover:translate-y-1
              min-w-[200px]
            "
          >
            <span className="relative z-10">작가 이야기</span>
            <div className="absolute inset-0 bg-ink opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          </button>
        </motion.div>

        {/* Cultural element */}
        <motion.div
          className="
            mt-zen-xl pt-zen-lg border-t-2 border-ink/20
            flex items-center justify-center gap-zen-sm
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <div className="w-12 h-px bg-gold" />
          <span className="font-calligraphy text-ink font-medium">
            먹, 그리고... 道
          </span>
          <div className="w-12 h-px bg-gold" />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-ink rounded-full flex justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-1 h-3 bg-ink rounded-full mt-2" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}