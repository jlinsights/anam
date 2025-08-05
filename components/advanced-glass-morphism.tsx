'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

interface AdvancedGlassMorphismProps {
  children: React.ReactNode
  layers?: number
  depth?: number
  blurIntensity?: number
  season?: 'spring' | 'summer' | 'autumn' | 'winter'
}

export function AdvancedGlassMorphism({
  children,
  layers = 3,
  depth = 0.5,
  blurIntensity = 10,
  season = 'spring'
}: AdvancedGlassMorphismProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const getSeasonalGlassColor = () => {
    switch (season) {
      case 'spring':
        return 'rgba(255, 182, 193, 0.1)' // 벚꽃색
      case 'summer':
        return 'rgba(135, 206, 235, 0.1)' // 하늘색
      case 'autumn':
        return 'rgba(255, 140, 0, 0.1)' // 단풍색
      case 'winter':
        return 'rgba(240, 248, 255, 0.1)' // 눈색
      default:
        return 'rgba(255, 255, 255, 0.1)'
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePosition({ x, y })
    mouseX.set(x)
    mouseY.set(y)
  }

  const glassLayers = Array.from({ length: layers }, (_, index) => {
    const layerDepth = (index + 1) * depth
    const layerBlur = blurIntensity * (index + 1)
    const layerOpacity = 0.1 - (index * 0.02)
    
    return {
      depth: layerDepth,
      blur: layerBlur,
      opacity: layerOpacity,
      zIndex: layers - index
    }
  })

  return (
    <div 
      className="relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* 배경 레이어들 */}
      {glassLayers.map((layer, index) => (
        <motion.div
          key={index}
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: layer.zIndex,
            background: getSeasonalGlassColor(),
            backdropFilter: `blur(${layer.blur}px)`,
            opacity: layer.opacity,
            transform: `translateZ(${layer.depth}px)`,
          }}
          animate={{
            x: mousePosition.x * layer.depth * 20,
            y: mousePosition.y * layer.depth * 20,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}

      {/* 메인 콘텐츠 */}
      <motion.div
        className="relative z-10"
        animate={{
          x: mousePosition.x * depth * 10,
          y: mousePosition.y * depth * 10,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {children}
      </motion.div>

      {/* 반사 효과 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(45deg, 
            transparent 0%, 
            ${getSeasonalGlassColor()} 50%, 
            transparent 100%)`,
          opacity: 0.3,
        }}
        animate={{
          x: mousePosition.x * 100,
          y: mousePosition.y * 100,
        }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  )
}

// 다층 글래스 카드 컴포넌트
export function MultiLayerGlassCard({
  children,
  className = '',
  depth = 0.3,
  season = 'spring'
}: {
  children: React.ReactNode
  className?: string
  depth?: number
  season?: 'spring' | 'summer' | 'autumn' | 'winter'
}) {
  const [isHovered, setIsHovered] = useState(false)

  const getSeasonalBorderColor = () => {
    switch (season) {
      case 'spring':
        return 'border-spring-accent'
      case 'summer':
        return 'border-summer-accent'
      case 'autumn':
        return 'border-autumn-accent'
      case 'winter':
        return 'border-winter-accent'
      default:
        return 'border-ink'
    }
  }

  return (
    <motion.div
      className={`
        relative p-zen-lg rounded-lg
        bg-white/10 backdrop-blur-md
        border border-white/20
        ${getSeasonalBorderColor()}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.02,
        y: -depth * 10,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* 내부 글래스 레이어 */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-lg" />
      
      {/* 콘텐츠 */}
      <div className="relative z-10">
        {children}
      </div>

      {/* 호버 효과 */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  )
}

// 깊이감 글래스 컨테이너
export function DepthGlassContainer({
  children,
  depth = 0.5,
  season = 'spring'
}: {
  children: React.ReactNode
  depth?: number
  season?: 'spring' | 'summer' | 'autumn' | 'winter'
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePosition({ x, y })
  }

  const getSeasonalGradient = () => {
    switch (season) {
      case 'spring':
        return 'from-spring-primary/20 via-spring-secondary/10 to-spring-accent/20'
      case 'summer':
        return 'from-summer-primary/20 via-summer-secondary/10 to-summer-accent/20'
      case 'autumn':
        return 'from-autumn-primary/20 via-autumn-secondary/10 to-autumn-accent/20'
      case 'winter':
        return 'from-winter-primary/20 via-winter-secondary/10 to-winter-accent/20'
      default:
        return 'from-ink/20 via-paper/10 to-gold/20'
    }
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg
        bg-gradient-to-br ${getSeasonalGradient()}
        backdrop-blur-lg
      `}
      onMouseMove={handleMouseMove}
    >
      {/* 깊이 레이어들 */}
      <motion.div
        className="absolute inset-0 bg-white/5"
        animate={{
          x: mousePosition.x * depth * 20,
          y: mousePosition.y * depth * 20,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      
      <motion.div
        className="absolute inset-0 bg-black/5"
        animate={{
          x: -mousePosition.x * depth * 15,
          y: -mousePosition.y * depth * 15,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />

      {/* 메인 콘텐츠 */}
      <motion.div
        className="relative z-10 p-zen-lg"
        animate={{
          x: mousePosition.x * depth * 5,
          y: mousePosition.y * depth * 5,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  )
} 