'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

interface InkAnimationSystemProps {
  children: React.ReactNode
  intensity?: number
  brushSize?: number
  inkColor?: string
}

export function InkAnimationSystem({
  children,
  intensity = 1,
  brushSize = 100,
  inkColor = 'hsl(var(--ink))'
}: InkAnimationSystemProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushStrokes, setBrushStrokes] = useState<Array<{
    id: number
    x: number
    y: number
    pressure: number
    timestamp: number
  }>>([])
  
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const brushOpacity = useTransform(mouseX, [0, 1], [0, 0.3])
  const brushScale = useTransform(mouseY, [0, 1], [0.8, 1.2])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      
      setMousePosition({ x, y })
      mouseX.set(x)
      mouseY.set(y)
      
      // 붓 터치 효과 생성
      if (isDrawing) {
        const pressure = Math.random() * 0.5 + 0.5
        const newStroke = {
          id: Date.now(),
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          pressure,
          timestamp: Date.now()
        }
        
        setBrushStrokes(prev => [...prev.slice(-20), newStroke])
      }
    }

    const handleMouseDown = () => setIsDrawing(true)
    const handleMouseUp = () => setIsDrawing(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mousedown', handleMouseDown)
      container.addEventListener('mouseup', handleMouseUp)
      container.addEventListener('mouseleave', handleMouseUp)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mousedown', handleMouseDown)
        container.removeEventListener('mouseup', handleMouseUp)
        container.removeEventListener('mouseleave', handleMouseUp)
      }
    }
  }, [isDrawing, mouseX, mouseY])

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* 메인 콘텐츠 */}
      <div className="relative z-10">
        {children}
      </div>

      {/* 배경 먹 효과 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            ${inkColor} 0%, 
            transparent ${brushSize}px)`,
          opacity: brushOpacity,
          transform: `scale(${brushScale})`,
        }}
        animate={{
          scale: isDrawing ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* 붓 터치 효과들 */}
      {brushStrokes.map((stroke) => (
        <motion.div
          key={stroke.id}
          className="absolute pointer-events-none"
          style={{
            left: stroke.x,
            top: stroke.y,
            width: brushSize * stroke.pressure,
            height: brushSize * stroke.pressure,
            background: inkColor,
            borderRadius: '50%',
            opacity: 0.6,
          }}
          initial={{ 
            scale: 0, 
            opacity: 0.8 
          }}
          animate={{ 
            scale: 1, 
            opacity: 0 
          }}
          transition={{ 
            duration: 2,
            ease: 'easeOut'
          }}
          onAnimationComplete={() => {
            setBrushStrokes(prev => prev.filter(s => s.id !== stroke.id))
          }}
        />
      ))}

      {/* 붓 커서 */}
      <motion.div
        className="absolute pointer-events-none border-2 border-ink rounded-full"
        style={{
          left: mousePosition.x * 100 + '%',
          top: mousePosition.y * 100 + '%',
          width: brushSize,
          height: brushSize,
          opacity: brushOpacity,
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: isDrawing ? 1.2 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
    </div>
  )
}

// 서예 붓 터치 효과 훅
export function useBrushEffect() {
  const [brushStrokes, setBrushStrokes] = useState<Array<{
    id: number
    x: number
    y: number
    pressure: number
    angle: number
  }>>([])

  const addBrushStroke = (x: number, y: number, pressure: number = 1) => {
    const newStroke = {
      id: Date.now(),
      x,
      y,
      pressure,
      angle: Math.random() * 360
    }
    setBrushStrokes(prev => [...prev.slice(-10), newStroke])
  }

  const clearBrushStrokes = () => {
    setBrushStrokes([])
  }

  return {
    brushStrokes,
    addBrushStroke,
    clearBrushStrokes
  }
}

// 먹 흐름 효과 컴포넌트
export function InkFlowEffect({ 
  children, 
  flowIntensity = 0.5 
}: { 
  children: React.ReactNode
  flowIntensity?: number 
}) {
  const [flowPoints, setFlowPoints] = useState<Array<{
    id: number
    x: number
    y: number
    velocity: { x: number; y: number }
  }>>([])

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < flowIntensity) {
        const newPoint = {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
          }
        }
        setFlowPoints(prev => [...prev.slice(-20), newPoint])
      }
    }, 100)

    return () => clearInterval(interval)
  }, [flowIntensity])

  return (
    <div className="relative overflow-hidden">
      {children}
      
      {/* 먹 흐름 효과 */}
      {flowPoints.map((point) => (
        <motion.div
          key={point.id}
          className="absolute w-2 h-2 bg-ink rounded-full opacity-30"
          style={{
            left: point.x + '%',
            top: point.y + '%',
          }}
          animate={{
            x: point.velocity.x * 100,
            y: point.velocity.y * 100,
            opacity: [0.3, 0.1, 0],
          }}
          transition={{
            duration: 3,
            ease: 'easeOut'
          }}
          onAnimationComplete={() => {
            setFlowPoints(prev => prev.filter(p => p.id !== point.id))
          }}
        />
      ))}
    </div>
  )
} 