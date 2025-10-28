'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SuperClaudeLayoutProps {
  children: React.ReactNode
  variant?: 'gallery' | 'artist' | 'exhibition' | 'cultural'
  enableMicroInteractions?: boolean
  culturalContext?: 'spring' | 'summer' | 'autumn' | 'winter' | 'eternal'
  className?: string
}

interface LayoutState {
  mousePosition: { x: number; y: number }
  viewportSize: { width: number; height: number }
  scrollProgress: number
  interactionIntensity: number
  culturalSeason: string
}

function layoutReducer(state: LayoutState, action: any): LayoutState {
  switch (action.type) {
    case 'UPDATE_MOUSE':
      return { ...state, mousePosition: action.payload }
    case 'UPDATE_VIEWPORT':
      return { ...state, viewportSize: action.payload }
    case 'UPDATE_SCROLL':
      return { ...state, scrollProgress: action.payload }
    case 'UPDATE_INTENSITY':
      return { ...state, interactionIntensity: action.payload }
    case 'UPDATE_SEASON':
      return { ...state, culturalSeason: action.payload }
    default:
      return state
  }
}

export function SuperClaudeLayout({
  children,
  variant = 'gallery',
  enableMicroInteractions = true,
  culturalContext = 'eternal',
  className
}: SuperClaudeLayoutProps) {
  const prefersReducedMotion = useReducedMotion()
  
  const [state, dispatch] = useState<LayoutState>({
    mousePosition: { x: 0.5, y: 0.5 },
    viewportSize: { width: 1200, height: 800 },
    scrollProgress: 0,
    interactionIntensity: 0,
    culturalSeason: culturalContext
  })

  // 🎯 SuperClaude Pattern: Advanced Mouse Tracking with Cultural Context
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enableMicroInteractions || prefersReducedMotion) return

    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight
    
    dispatch({
      type: 'UPDATE_MOUSE',
      payload: { x, y }
    })

    // Calculate interaction intensity based on movement velocity
    const intensity = Math.min(1, Math.sqrt(x * x + y * y))
    dispatch({
      type: 'UPDATE_INTENSITY',
      payload: intensity
    })
  }, [enableMicroInteractions, prefersReducedMotion])

  // 🎯 SuperClaude Pattern: Intelligent Scroll Progress Tracking
  const handleScroll = useCallback(() => {
    const progress = Math.min(1, window.scrollY / (document.documentElement.scrollHeight - window.innerHeight))
    dispatch({
      type: 'UPDATE_SCROLL',
      payload: progress
    })
  }, [])

  // 🎯 SuperClaude Pattern: Responsive Viewport Awareness
  const handleResize = useCallback(() => {
    dispatch({
      type: 'UPDATE_VIEWPORT',
      payload: { width: window.innerWidth, height: window.innerHeight }
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    
    // Initial viewport size
    handleResize()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [handleMouseMove, handleScroll, handleResize])

  // 🎨 Cultural Context Dynamic Styling
  const culturalStyles = {
    spring: {
      background: `radial-gradient(circle at ${state.mousePosition.x * 100}% ${state.mousePosition.y * 100}%, 
        hsla(134, 61%, 41%, ${0.03 + state.interactionIntensity * 0.02}) 0%, 
        hsla(134, 61%, 41%, 0.01) 70%, 
        transparent 100%)`,
      filter: `hue-rotate(${state.scrollProgress * 10}deg)`
    },
    summer: {
      background: `radial-gradient(circle at ${state.mousePosition.x * 100}% ${state.mousePosition.y * 100}%, 
        hsla(145, 63%, 49%, ${0.03 + state.interactionIntensity * 0.02}) 0%, 
        hsla(145, 63%, 49%, 0.01) 70%, 
        transparent 100%)`,
      filter: `hue-rotate(${state.scrollProgress * 15}deg)`
    },
    autumn: {
      background: `radial-gradient(circle at ${state.mousePosition.x * 100}% ${state.mousePosition.y * 100}%, 
        hsla(45, 93%, 47%, ${0.03 + state.interactionIntensity * 0.02}) 0%, 
        hsla(45, 93%, 47%, 0.01) 70%, 
        transparent 100%)`,
      filter: `hue-rotate(${state.scrollProgress * 20}deg)`
    },
    winter: {
      background: `radial-gradient(circle at ${state.mousePosition.x * 100}% ${state.mousePosition.y * 100}%, 
        hsla(220, 13%, 18%, ${0.03 + state.interactionIntensity * 0.02}) 0%, 
        hsla(220, 13%, 18%, 0.01) 70%, 
        transparent 100%)`,
      filter: `hue-rotate(${state.scrollProgress * 5}deg)`
    },
    eternal: {
      background: `radial-gradient(circle at ${state.mousePosition.x * 100}% ${state.mousePosition.y * 100}%, 
        hsla(var(--ink) / ${0.02 + state.interactionIntensity * 0.03}) 0%, 
        hsla(var(--gold) / 0.01) 40%, 
        transparent 70%)`,
      filter: `contrast(${1 + state.scrollProgress * 0.1})`
    }
  }

  const currentCulturalStyle = culturalStyles[culturalContext as keyof typeof culturalStyles]

  // 🎯 SuperClaude Pattern: Variant-Based Layout Classes
  const layoutClasses = {
    gallery: 'zen-brutalist-layout gallery-grid-container',
    artist: 'cultural-composition artist-narrative-flow',
    exhibition: 'temporal-depth exhibition-timeline',
    cultural: 'traditional-composition cultural-immersion'
  }

  return (
    <div
      className={cn(
        'min-h-screen relative overflow-x-hidden',
        'aceternity-container aceternity-fade-in',
        'bg-background text-foreground',
        'zen-breathe-deep cultural-context',
        culturalContext && `aceternity-cultural-${culturalContext}`,
        layoutClasses[variant],
        className
      )}
      style={{
        ...currentCulturalStyle,
        '--mouse-x': state.mousePosition.x,
        '--mouse-y': state.mousePosition.y,
        '--scroll-progress': state.scrollProgress,
        '--interaction-intensity': state.interactionIntensity
      } as React.CSSProperties}
    >
      {/* 🎨 Dynamic Background Layers - BMAD Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `conic-gradient(from ${state.mousePosition.x * 360}deg at 50% 50%, 
              transparent 0deg, 
              hsla(var(--ink) / 0.01) 90deg, 
              transparent 180deg, 
              hsla(var(--gold) / 0.01) 270deg, 
              transparent 360deg)`
          }}
          animate={{
            rotate: enableMicroInteractions ? state.scrollProgress * 360 : 0
          }}
          transition={{
            duration: 0.1,
            ease: 'linear'
          }}
        />

        {/* Glass Morphism Depth Layers with Aceternity Enhancement */}
        <div className="glass-layer-1 absolute inset-0 opacity-20 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="glass-layer-2 absolute inset-0 opacity-15 bg-gradient-to-tr from-secondary/3 to-primary/3" />
        <div className="glass-layer-3 absolute inset-0 opacity-10 bg-gradient-to-bl from-accent/2 to-secondary/2" />
      </div>

      {/* 🎯 Main Content with Intelligent Spacing */}
      <motion.main
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      >
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </motion.main>

      {/* 🎨 Cultural Breathing Animation Overlay */}
      <div 
        className={cn(
          'fixed inset-0 pointer-events-none z-5',
          'void-breathing-animation',
          culturalContext !== 'eternal' && `season-${culturalContext}`
        )}
        style={{
          opacity: state.interactionIntensity * 0.1
        }}
      />

      {/* 🎯 SuperClaude Pattern: Performance Metrics Display (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="aceternity-card fixed bottom-4 right-4 z-50 p-3 shadow-aceternity-lg">
          <div className="aceternity-caption text-muted-foreground space-y-1">
            <div>Mouse: {state.mousePosition.x.toFixed(2)}, {state.mousePosition.y.toFixed(2)}</div>
            <div>Scroll: {(state.scrollProgress * 100).toFixed(0)}%</div>
            <div>Intensity: {(state.interactionIntensity * 100).toFixed(0)}%</div>
            <div>Viewport: {state.viewportSize.width}×{state.viewportSize.height}</div>
            <div>Cultural: {culturalContext}</div>
            <div>Variant: {variant}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperClaudeLayout