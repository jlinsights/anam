'use client'

import { ReactNode } from 'react'
import type { Artwork, Artist } from '@/lib/types'

interface SimpleFallbackLayoutProps {
  children?: ReactNode
  initialArtworks?: Artwork[]
  artist?: Artist
}

export default function SimpleFallbackLayout({ 
  children, 
  initialArtworks, 
  artist 
}: SimpleFallbackLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">아남 갤러리</h1>
        <p className="text-muted-foreground mb-8">
          시스템 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        {initialArtworks && initialArtworks.length > 0 && (
          <div className="mt-8">
            <p className="text-sm text-muted-foreground">
              {initialArtworks.length}개의 작품이 로드되었습니다.
            </p>
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}