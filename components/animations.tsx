'use client'

import { AnimatePresence, motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'

// 기본 애니메이션 variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
}

export const slideInFromBottom = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 100 },
}

// 스태거 애니메이션을 위한 컨테이너
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// 페이지 전환 애니메이션
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' },
}

// 갤러리 카드 애니메이션
export const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  hover: {
    y: -8,
    scale: 1.02,
  },
  tap: { scale: 0.98 },
}

// 이미지 로딩 애니메이션
export const imageVariants = {
  loading: { opacity: 0, scale: 1.05 },
  loaded: {
    opacity: 1,
    scale: 1,
  },
}

// 모달 애니메이션
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
}

// 백드롭 애니메이션
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

// 커스텀 애니메이션 컴포넌트들
interface AnimatedContainerProps extends MotionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FadeInContainer({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function ScaleInContainer({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function SlideInContainer({
  children,
  className,
  delay = 0,
  direction = 'up',
  ...props
}: AnimatedContainerProps & { direction?: 'up' | 'down' | 'left' | 'right' }) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: 50 }
      case 'down':
        return { y: -50 }
      case 'left':
        return { x: 50 }
      case 'right':
        return { x: -50 }
      default:
        return { y: 50 }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, ...getInitialPosition() }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// 스태거 애니메이션 컨테이너
export function StaggerContainer({
  children,
  className,
  ...props
}: AnimatedContainerProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial='initial'
      animate='animate'
      exit='initial'
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// 갤러리 카드 애니메이션 래퍼
export function AnimatedCard({
  children,
  className,
  index = 0,
  ...props
}: AnimatedContainerProps & { index?: number }) {
  return (
    <motion.div
      variants={cardVariants}
      initial='initial'
      animate='animate'
      whileHover='hover'
      whileTap='tap'
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// 이미지 로딩 애니메이션
interface AnimatedImageProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
}

export function AnimatedImage({
  src,
  alt,
  className,
  onLoad,
}: AnimatedImageProps) {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      variants={imageVariants}
      initial='loading'
      animate='loaded'
      onLoad={onLoad}
    />
  )
}

// 페이지 전환 래퍼
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={pageTransition}
      initial='initial'
      animate='animate'
      exit='exit'
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 모달 애니메이션 래퍼
export function AnimatedModal({
  children,
  isOpen,
  onClose,
  className,
}: {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  className?: string
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='fixed inset-0 bg-black/50 z-50'
            onClick={onClose}
          />
          <motion.div
            variants={modalVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 마이크로 인터랙션 컴포넌트들
export function HoverCard({
  children,
  className,
  ...props
}: AnimatedContainerProps) {
  return (
    <motion.div
      whileHover={{
        y: -2,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function FloatingElement({
  children,
  className,
  ...props
}: AnimatedContainerProps) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// 텍스트 애니메이션
export function TypewriterText({
  text,
  className,
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className={className}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + index * 0.05 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

// 프로그레시브 로딩을 위한 스켈레톤 애니메이션
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`bg-stone-200 dark:bg-slate-700 rounded ${className}`}
    />
  )
}

// 성능 최적화를 위한 Reduce Motion 대응
export function useReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
