'use client'

import { ReactNode } from 'react'

interface SimpleFallbackLayoutProps {
  children: ReactNode
}

export default function SimpleFallbackLayout({ children }: SimpleFallbackLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}