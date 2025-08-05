'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 고대비 모드 감지 훅
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isHighContrast
}

// 모션 감소 모드 감지 훅
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// 접근성 강화 버튼 컴포넌트
interface AccessibilityButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  ariaLabel?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function AccessibilityButton({
  children,
  onClick,
  className = '',
  ariaLabel,
  disabled = false,
  variant = 'primary',
  size = 'md'
}: AccessibilityButtonProps) {
  const isHighContrast = useHighContrast()
  const prefersReducedMotion = useReducedMotion()

  const getVariantClasses = () => {
    const baseClasses = 'text-calligraphy-body font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-ink text-paper hover:bg-ink-dark focus:ring-ink ${isHighContrast ? 'border-2 border-ink' : ''}`
      case 'secondary':
        return `${baseClasses} bg-paper text-ink border border-ink hover:bg-ink hover:text-paper focus:ring-ink ${isHighContrast ? 'border-2' : ''}`
      case 'ghost':
        return `${baseClasses} text-ink hover:bg-ink/10 focus:ring-ink ${isHighContrast ? 'border border-ink' : ''}`
      default:
        return baseClasses
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-zen-sm py-zen-xs text-responsive-sm'
      case 'md':
        return 'px-zen-md py-zen-sm text-responsive-base'
      case 'lg':
        return 'px-zen-lg py-zen-md text-responsive-lg'
      default:
        return 'px-zen-md py-zen-sm text-responsive-base'
    }
  }

  return (
    <motion.button
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
    >
      {children}
    </motion.button>
  )
}

// 접근성 강화 카드 컴포넌트
interface AccessibilityCardProps {
  children: React.ReactNode
  className?: string
  role?: string
  ariaLabel?: string
  interactive?: boolean
  season?: 'spring' | 'summer' | 'autumn' | 'winter'
}

export function AccessibilityCard({
  children,
  className = '',
  role = 'article',
  ariaLabel,
  interactive = false,
  season = 'spring'
}: AccessibilityCardProps) {
  const isHighContrast = useHighContrast()
  const prefersReducedMotion = useReducedMotion()

  const getSeasonalClasses = () => {
    if (isHighContrast) {
      return 'border-2 border-ink bg-paper'
    }
    
    switch (season) {
      case 'spring':
        return 'border-spring-accent bg-spring-muted'
      case 'summer':
        return 'border-summer-accent bg-summer-muted'
      case 'autumn':
        return 'border-autumn-accent bg-autumn-muted'
      case 'winter':
        return 'border-winter-accent bg-winter-muted'
      default:
        return 'border-ink bg-paper'
    }
  }

  return (
    <motion.div
      className={`
        p-zen-lg rounded-lg border
        ${getSeasonalClasses()}
        ${interactive ? 'cursor-pointer hover:shadow-lg' : ''}
        ${className}
      `}
      role={role}
      aria-label={ariaLabel}
      whileHover={interactive && !prefersReducedMotion ? { y: -2 } : {}}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// 스크린 리더 전용 텍스트 컴포넌트
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// 접근성 강화 포커스 표시기
export function FocusIndicator() {
  return (
    <div className="focus-indicator">
      <style jsx>{`
        .focus-indicator:focus-within {
          outline: 3px solid hsl(var(--ink));
          outline-offset: 2px;
        }
        
        @media (prefers-contrast: high) {
          .focus-indicator:focus-within {
            outline: 4px solid hsl(var(--ink));
            outline-offset: 3px;
          }
        }
      `}</style>
    </div>
  )
}

// 접근성 강화 모달 컴포넌트
interface AccessibilityModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  ariaLabel?: string
}

export function AccessibilityModal({
  isOpen,
  onClose,
  title,
  children,
  ariaLabel
}: AccessibilityModalProps) {
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 포커스를 모달로 이동
      const modal = document.getElementById('accessibility-modal')
      if (modal) {
        modal.focus()
      }
      
      // 배경 스크롤 방지
      document.body.style.overflow = 'hidden'
    } else {
      // 모달이 닫힐 때 배경 스크롤 복원
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* 모달 */}
          <motion.div
            id="accessibility-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-zen-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            <div className="bg-paper rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-zen-lg border-b border-ink/20">
                <h2 
                  id="modal-title"
                  className="text-calligraphy-title text-responsive-lg text-ink"
                >
                  {title}
                </h2>
              </div>
              
              <div id="modal-description" className="p-zen-lg">
                {children}
              </div>
              
              <div className="p-zen-lg border-t border-ink/20 flex justify-end">
                <AccessibilityButton
                  onClick={onClose}
                  variant="primary"
                  size="md"
                  ariaLabel="모달 닫기"
                >
                  닫기
                </AccessibilityButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 접근성 강화 툴팁 컴포넌트
interface AccessibilityTooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function AccessibilityTooltip({
  children,
  content,
  position = 'top',
  className = ''
}: AccessibilityTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-zen-sm'
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-zen-sm'
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-zen-sm'
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-zen-sm'
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-zen-sm'
    }
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`
              absolute z-50 px-zen-sm py-zen-xs
              bg-ink text-paper text-calligraphy-caption
              rounded shadow-lg whitespace-nowrap
              ${getPositionClasses()}
            `}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            role="tooltip"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 