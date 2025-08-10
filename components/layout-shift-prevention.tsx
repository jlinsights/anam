'use client'

import React, { ReactNode } from 'react'
import { getAspectRatioStyle } from '@/lib/optimized-image-utils'

interface LayoutStableContainerProps {
  children: ReactNode
  width: number
  height: number
  className?: string
  reserveSpace?: boolean
}

// CLS 방지를 위한 안정적인 레이아웃 컨테이너
export function LayoutStableContainer({
  children,
  width,
  height,
  className = '',
  reserveSpace = true
}: LayoutStableContainerProps) {
  const aspectRatioStyle = getAspectRatioStyle(width, height)

  return (
    <div 
      className={`relative ${className}`}
      style={reserveSpace ? aspectRatioStyle : undefined}
    >
      {children}
    </div>
  )
}

// 갤러리 그리드를 위한 CLS 방지 래퍼
interface ArtworkGridContainerProps {
  children: ReactNode
  itemCount: number
  columns: {
    mobile: number
    tablet: number
    desktop: number
  }
  className?: string
}

export function ArtworkGridContainer({
  children,
  itemCount,
  columns,
  className = ''
}: ArtworkGridContainerProps) {
  // 최소 높이 계산 (4:5 비율 + 간격)
  const estimatedHeight = {
    mobile: Math.ceil(itemCount / columns.mobile) * (300 + 16), // 300px per row + gap
    tablet: Math.ceil(itemCount / columns.tablet) * (350 + 16),
    desktop: Math.ceil(itemCount / columns.desktop) * (400 + 16)
  }

  return (
    <div 
      className={`
        grid gap-4 w-full
        grid-cols-${columns.mobile} 
        md:grid-cols-${columns.tablet} 
        lg:grid-cols-${columns.desktop}
        ${className}
      `}
      style={{
        // CLS 방지를 위한 최소 높이 예약
        minHeight: `${estimatedHeight.mobile}px`,
        containIntrinsicSize: `100% ${estimatedHeight.desktop}px`,
        // CSS 격리로 성능 향상
        contain: 'layout style paint'
      }}
    >
      {children}
    </div>
  )
}

// 스켈레톤 로더 컴포넌트
interface ArtworkSkeletonProps {
  count: number
  className?: string
}

export function ArtworkSkeleton({ count, className = '' }: ArtworkSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className={`
            aspect-[4/5] rounded-lg overflow-hidden 
            bg-gradient-to-br from-paper via-paper-warm to-stone/10
            animate-pulse
            ${className}
          `}
          style={{ containIntrinsicSize: '300px 375px' }}
        >
          {/* Skeleton content */}
          <div className="w-full h-full flex flex-col">
            {/* Image placeholder */}
            <div className="flex-1 bg-stone/10 relative">
              {/* Subtle shimmer effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-stone/20 to-transparent transform -skew-x-12 animate-shimmer"
                style={{
                  animation: 'shimmer 2s infinite'
                }}
              />
            </div>
            
            {/* Title placeholder */}
            <div className="p-3 space-y-2">
              <div className="h-4 bg-stone/20 rounded animate-pulse" />
              <div className="h-3 bg-stone/15 rounded w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

// 이미지 로딩 상태를 위한 진행률 표시기
interface LoadingProgressIndicatorProps {
  loaded: number
  total: number
  className?: string
}

export function LoadingProgressIndicator({ 
  loaded, 
  total, 
  className = '' 
}: LoadingProgressIndicatorProps) {
  const progress = total > 0 ? (loaded / total) * 100 : 0

  if (progress >= 100) return null

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <div 
        className="h-1 bg-gold/60 transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          // Smooth transitions prevent layout shifts
          willChange: 'width',
          transform: 'translateZ(0)' // Force GPU acceleration
        }}
      />
    </div>
  )
}

// 중요한 컨텐츠를 위한 우선순위 컨테이너
interface PriorityContentProps {
  children: ReactNode
  isPriority: boolean
  className?: string
}

export function PriorityContent({ 
  children, 
  isPriority, 
  className = '' 
}: PriorityContentProps) {
  return (
    <div 
      className={className}
      style={{
        // 우선순위 콘텐츠는 즉시 표시
        contentVisibility: isPriority ? 'visible' : 'auto',
        containIntrinsicSize: isPriority ? 'none' : '300px 375px'
      }}
    >
      {children}
    </div>
  )
}