'use client'

import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Skip to main content link
export function SkipToContent() {
  return (
    <a
      href='#main-content'
      className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-ink text-white p-3 rounded-md z-50 transition-all'
    >
      본문으로 건너뛰기
    </a>
  )
}

// Screen reader only text
export function ScreenReaderOnly({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <span className={cn('sr-only', className)}>{children}</span>
}

// 포커스 트랩 컴포넌트
export function FocusTrap({
  children,
  isActive,
}: {
  children: ReactNode
  isActive: boolean
}) {
  useEffect(() => {
    if (!isActive) return

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])

  return <>{children}</>
}

// 고대비 모드 감지
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setIsHighContrast(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isHighContrast
}

// 모션 감소 모드 감지
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

// 라이브 리전 컴포넌트 (스크린 리더용 알림)
export function LiveRegion({
  children,
  polite = true,
}: {
  children: ReactNode
  polite?: boolean
}) {
  return (
    <div
      aria-live={polite ? 'polite' : 'assertive'}
      aria-atomic='true'
      className='sr-only'
    >
      {children}
    </div>
  )
}

// 접근 가능한 아이콘 버튼
export function AccessibleIconButton({
  icon,
  label,
  onClick,
  className,
  disabled = false,
  ...props
}: {
  icon: ReactNode
  label: string
  onClick?: () => void
  className?: string
  disabled?: boolean
  [key: string]: any
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-md p-2',
        'focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      aria-label={label}
      disabled={disabled}
      {...props}
    >
      {icon}
      <ScreenReaderOnly>{label}</ScreenReaderOnly>
    </button>
  )
}

// 접근 가능한 모달 다이얼로그
export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <FocusTrap isActive={isOpen}>
        <div
          className={cn(
            'bg-background rounded-lg shadow-xl max-w-md w-full mx-4 p-6',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id='modal-title' className='text-xl font-semibold mb-4'>
            {title}
          </h2>
          {description && (
            <p id='modal-description' className='text-ink-light mb-4'>
              {description}
            </p>
          )}
          {children}
        </div>
      </FocusTrap>
    </div>
  )
}

// 접근성 향상을 위한 글로벌 스타일 컴포넌트
export function AccessibilityStyles() {
  return (
    <style jsx global>{`
      /* 포커스 표시 향상 */
      *:focus {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }

      /* 고대비 모드 지원 */
      @media (prefers-contrast: high) {
        .text-ink-light {
          color: hsl(var(--foreground));
        }

        .border-border {
          border-color: hsl(var(--foreground));
        }
      }

      /* 모션 감소 모드 지원 */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }

      /* 포커스 가시성 향상 */
      .focus\\:ring-2:focus {
        box-shadow:
          0 0 0 2px hsl(var(--background)),
          0 0 0 4px hsl(var(--foreground));
      }
    `}</style>
  )
}
