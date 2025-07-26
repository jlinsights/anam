'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  description?: string
  badge?: string
  icon?: ReactNode
  variant?: 'default' | 'centered' | 'minimal' | 'artistic'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  children?: ReactNode
  action?: {
    label: string
    href: string
    variant?: 'default' | 'outline' | 'ghost'
  }
}

export function SectionHeader({
  title,
  subtitle,
  description,
  badge,
  variant = 'default',
  size = 'md',
  className,
  children,
  action,
}: SectionHeaderProps) {
  const variants = {
    default: 'text-left',
    centered: 'text-center',
    minimal: 'text-left',
    artistic: 'text-center',
  }

  const sizes = {
    sm: {
      title: 'text-2xl md:text-3xl',
      subtitle: 'text-base md:text-lg',
      description: 'text-sm',
      spacing: 'space-y-3',
    },
    md: {
      title: 'text-3xl md:text-4xl lg:text-5xl',
      subtitle: 'text-lg md:text-xl',
      description: 'text-base',
      spacing: 'space-y-4',
    },
    lg: {
      title: 'text-4xl md:text-5xl lg:text-6xl',
      subtitle: 'text-xl md:text-2xl',
      description: 'text-lg',
      spacing: 'space-y-6',
    },
    xl: {
      title: 'text-5xl md:text-6xl lg:text-7xl',
      subtitle: 'text-2xl md:text-3xl',
      description: 'text-xl',
      spacing: 'space-y-8',
    },
  }

  const containerClasses = cn(
    'w-full',
    variants[variant],
    sizes[size].spacing,
    className
  )

  return (
    <div className={containerClasses}>
      {/* 배지 */}
      {badge && (
        <div
          className={cn(
            'flex',
            variant === 'centered' || variant === 'artistic'
              ? 'justify-center'
              : 'justify-start'
          )}
        >
          <Badge
            variant='secondary'
            className={cn(
              'text-xs font-medium px-3 py-1',
              variant === 'artistic'
                ? 'bg-gradient-zen text-ink border-stone-light'
                : 'bg-paper-warm text-ink-light border-stone-light'
            )}
          >
            {badge}
          </Badge>
        </div>
      )}

      {/* 제목 */}
      <div className='space-y-2'>
        <h2
          className={cn(
            'font-display font-bold tracking-tight text-ink',
            sizes[size].title,
            variant === 'artistic' && 'text-calligraphy'
          )}
        >
          {title}
        </h2>

        {/* 부제목 */}
        {subtitle && (
          <h3
            className={cn(
              'font-display font-medium text-ink-light',
              sizes[size].subtitle,
              variant === 'artistic' && 'text-calligraphy tracking-wide'
            )}
          >
            {subtitle}
          </h3>
        )}
      </div>

      {/* 설명 */}
      {description && (
        <p
          className={cn(
            'text-ink-light leading-relaxed max-w-3xl',
            sizes[size].description,
            variant === 'centered' || variant === 'artistic' ? 'mx-auto' : ''
          )}
        >
          {description}
        </p>
      )}

      {/* 액션 버튼 또는 커스텀 콘텐츠 */}
      {(action || children) && (
        <div
          className={cn(
            'flex items-center',
            variant === 'centered' || variant === 'artistic'
              ? 'justify-center'
              : 'justify-start',
            'pt-2'
          )}
        >
          {action && (
            <Button
              asChild
              variant={action.variant || 'default'}
              className={cn(
                'group',
                action.variant === 'default' && 'btn-art',
                action.variant === 'outline' && 'btn-art-outline',
                action.variant === 'ghost' && 'btn-art-ghost'
              )}
            >
              <Link href={action.href}>
                {action.label}
                <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
              </Link>
            </Button>
          )}
          {children}
        </div>
      )}
    </div>
  )
}

// 브레드크럼 컴포넌트
interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      className={cn('flex items-center space-x-2 text-sm', className)}
      aria-label='Breadcrumb'
    >
      {items.map((item, index) => (
        <div key={index} className='flex items-center space-x-2'>
          {index > 0 && <ChevronRight className='h-3 w-3 text-ink-lighter' />}
          {item.href ? (
            <Link
              href={item.href}
              className='text-ink-light hover:text-ink transition-colors focus-art rounded px-1 py-0.5'
            >
              {item.label}
            </Link>
          ) : (
            <span className='text-ink font-medium'>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

// 페이지 헤더 컴포넌트 (브레드크럼 + 섹션 헤더 조합)
interface PageHeaderProps extends Omit<SectionHeaderProps, 'variant'> {
  breadcrumb?: BreadcrumbItem[]
  variant?: 'default' | 'centered' | 'minimal' | 'artistic'
}

export function PageHeader({
  breadcrumb,
  title,
  subtitle,
  description,
  badge,
  variant = 'default',
  size = 'lg',
  className,
  children,
  action,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* 브레드크럼 */}
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb
          items={breadcrumb}
          className={cn(
            variant === 'centered' || variant === 'artistic'
              ? 'justify-center'
              : 'justify-start'
          )}
        />
      )}

      {/* 섹션 헤더 */}
      <SectionHeader
        title={title}
        subtitle={subtitle}
        description={description}
        badge={badge}
        variant={variant}
        size={size}
        action={action}
      >
        {children}
      </SectionHeader>
    </div>
  )
}

// 구분선 컴포넌트
interface DividerProps {
  variant?: 'default' | 'artistic' | 'minimal'
  className?: string
}

export function Divider({ variant = 'default', className }: DividerProps) {
  const variants = {
    default: 'border-t border-border/50',
    artistic:
      'relative h-px bg-gradient-to-r from-transparent via-ink-lighter to-transparent',
    minimal: 'border-t border-border/30',
  }

  if (variant === 'artistic') {
    return (
      <div className={cn('relative py-8', className)}>
        <div className={variants[variant]} />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='bg-background px-4'>
            <div className='w-2 h-2 bg-ink-lighter rounded-full' />
          </div>
        </div>
      </div>
    )
  }

  return <hr className={cn(variants[variant], className)} />
}

// 통계 표시 컴포넌트
interface StatsProps {
  stats: Array<{
    label: string
    value: string | number
    description?: string
  }>
  variant?: 'default' | 'minimal' | 'artistic'
  className?: string
}

export function Stats({ stats, variant = 'default', className }: StatsProps) {
  const variants = {
    default: 'bg-paper-warm border border-stone-light rounded-xl p-6',
    minimal: 'bg-transparent',
    artistic: 'bg-gradient-zen border border-stone-light rounded-2xl p-8',
  }

  return (
    <div className={cn(variants[variant], className)}>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {stats.map((stat, index) => (
          <div key={index} className='text-center space-y-2'>
            <div className='text-2xl md:text-3xl font-bold text-ink font-display'>
              {stat.value}
            </div>
            <div className='text-sm font-medium text-ink-light'>
              {stat.label}
            </div>
            {stat.description && (
              <div className='text-xs text-ink-lighter'>{stat.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
