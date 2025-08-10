'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrentSection, useGalleryStore } from '@/lib/stores/gallery-store-safe'

interface NavigationProps {
  currentSection: string
  onNavigate: (sectionId: string) => void
}

export function Navigation({ currentSection, onNavigate }: NavigationProps) {
  // Use store for additional navigation features
  const { isNavigating } = useGalleryStore()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePosition({ x, y })
  }, [])

  const navItems = [
    { id: 'hero', label: '홈', icon: '🏠' },
    { id: 'gallery', label: '갤러리', icon: '🎨' },
    { id: 'artist', label: '작가소개', icon: '👤' },
    { id: 'exhibition', label: '전시정보', icon: '📅' },
    { id: 'contact', label: '연락처', icon: '📧' }
  ]

  return (
    <motion.nav 
      className="
        fixed top-0 left-0 right-0 z-50
        bg-paper/95 backdrop-blur-sm border-b-4 border-ink
        shadow-brutal
      "
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Dynamic background effect */}
      <motion.div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            hsl(var(--ink)) 0%, transparent 50%)`
        }}
        animate={{
          opacity: isHovered ? 0.08 : 0.05
        }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative max-w-7xl mx-auto px-zen-sm sm:px-zen-md lg:px-zen-lg">
        <div className="flex justify-between items-center py-zen-sm">
          {/* Logo */}
          <motion.div 
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate('hero')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h1 className="text-ink font-calligraphy font-bold text-xl sm:text-2xl">
              아남 Oriental Calligraphy
            </h1>
            <div className="ml-zen-sm text-ink-light font-display text-xs hidden sm:block">
              단일 페이지 갤러리
            </div>
          </motion.div>
          
          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-zen-md">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  relative px-zen-sm py-zen-xs font-display font-medium
                  transition-all duration-300 group
                  ${currentSection === item.id 
                    ? 'text-gold bg-gold/10' 
                    : 'text-ink hover:text-gold'
                  }
                `}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden lg:inline mr-1">{item.icon}</span>
                {item.label}
                
                {/* Active indicator */}
                <motion.div
                  className="
                    absolute bottom-0 left-0 right-0 h-0.5 bg-gold
                    origin-left
                  "
                  initial={{ scaleX: 0 }}
                  animate={{ 
                    scaleX: currentSection === item.id ? 1 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Hover effect */}
                <motion.div
                  className="
                    absolute bottom-0 left-0 right-0 h-0.5 bg-ink/30
                    origin-left
                  "
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ))}
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-zen-xs bg-ink text-paper hover:bg-gold transition-colors duration-300"
          >
            <motion.svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={isMobileMenuOpen ? { rotate: 90 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
            </motion.svg>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 bg-paper border-b-4 border-ink shadow-brutal-strong z-40"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-zen-md py-zen-sm space-y-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`
                    w-full text-left px-zen-sm py-zen-xs font-display font-medium rounded
                    transition-all duration-300
                    ${currentSection === item.id 
                      ? 'text-gold bg-gold/10 border-l-4 border-gold' 
                      : 'text-ink hover:text-gold hover:bg-gold/5'
                    }
                  `}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}