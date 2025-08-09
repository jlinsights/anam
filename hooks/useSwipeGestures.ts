import { useCallback, useEffect, useRef } from 'react'

interface SwipeCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onLongPress?: () => void
}

interface SwipeOptions {
  threshold?: number
  velocityThreshold?: number
  longPressThreshold?: number
  preventScroll?: boolean
}

export function useSwipeGestures(
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
) {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    longPressThreshold = 500,
    preventScroll = false
  } = options

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasSwiped = useRef(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    
    hasSwiped.current = false

    // Start long press timer
    if (callbacks.onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        if (!hasSwiped.current) {
          callbacks.onLongPress?.()
        }
      }, longPressThreshold)
    }

    if (preventScroll) {
      e.preventDefault()
    }
  }, [callbacks.onLongPress, longPressThreshold, preventScroll])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    // If user has moved significantly, cancel long press
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }

    if (preventScroll && (Math.abs(deltaX) > Math.abs(deltaY))) {
      e.preventDefault()
    }
  }, [preventScroll])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // Check if it's a swipe (distance > threshold OR velocity > velocityThreshold)
    const isSwipe = (absX > threshold || absY > threshold) || velocity > velocityThreshold

    if (isSwipe) {
      hasSwiped.current = true

      // Determine swipe direction
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0) {
          callbacks.onSwipeRight?.()
        } else {
          callbacks.onSwipeLeft?.()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          callbacks.onSwipeDown?.()
        } else {
          callbacks.onSwipeUp?.()
        }
      }
    } else if (!hasSwiped.current && absX < 10 && absY < 10 && deltaTime < 300) {
      // It's a tap
      callbacks.onTap?.()
    }

    touchStartRef.current = null
  }, [callbacks, threshold, velocityThreshold])

  const ref = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll })
      element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
      element.addEventListener('touchend', handleTouchEnd, { passive: true })

      return () => {
        element.removeEventListener('touchstart', handleTouchStart)
        element.removeEventListener('touchmove', handleTouchMove)
        element.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  return ref
}

// Hook specifically for artwork modal navigation
export function useArtworkSwipe(onNext: () => void, onPrevious: () => void, onClose: () => void) {
  return useSwipeGestures({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    onSwipeDown: onClose
  }, {
    threshold: 100,
    velocityThreshold: 0.5,
    preventScroll: true
  })
}

// Hook for section navigation
export function useSectionSwipe(onNext: () => void, onPrevious: () => void) {
  return useSwipeGestures({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious
  }, {
    threshold: 80,
    velocityThreshold: 0.4,
    preventScroll: false
  })
}