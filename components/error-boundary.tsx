'use client'

import { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  // Simplified error boundary for build optimization
  return <>{children}</>
}