'use client'

import { Logo } from '@/components/logo'
import { SimpleThemeToggle } from '@/components/simple-theme-toggle'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavigationItem {
  href: string
  label: string
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: '홈',
    description: '메인 페이지',
  },
  {
    href: '/gallery',
    label: '갤러리',
    description: '작품 감상',
  },
  {
    href: '/artist',
    label: '작가',
    description: '작가 소개',
  },
  {
    href: '/exhibition',
    label: '전시',
    description: '전시 정보',
  },
  {
    href: '/contact',
    label: '문의',
    description: '연락처',
  },
]

interface ArtNavigationProps {
  className?: string
  variant?: 'default' | 'minimal' | 'transparent'
}

export function ArtNavigation({
  className,
  variant = 'default',
}: ArtNavigationProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const navVariants = {
    default: 'bg-background/95 backdrop-blur-xl border-b border-border/50',
    minimal: 'bg-transparent',
    transparent: 'bg-background/80 backdrop-blur-md border-b border-border/30',
  }

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        navVariants[variant],
        className
      )}
    >
      <div className='container-art'>
        <div className='flex items-center justify-between py-4 md:py-6'>
          {/* 로고 */}
          <Link
            href='/'
            className='flex items-center space-x-3 group focus-art'
            aria-label='희랑 홈페이지로 이동'
          >
            <Logo
              size='xl'
              showLink={false}
              className='transition-transform duration-300 group-hover:scale-105'
            />
          </Link>

          {/* 데스크탑 네비게이션 */}
          <div className='hidden md:flex items-center space-x-1'>
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300',
                  'hover:bg-paper-warm hover:text-ink hover:shadow-soft',
                  'focus-art',
                  isActive(item.href)
                    ? 'text-ink bg-paper-warm shadow-soft'
                    : 'text-ink-light hover:text-ink'
                )}
              >
                <span className='relative z-10'>{item.label}</span>
                {isActive(item.href) && (
                  <div className='absolute inset-0 bg-gradient-zen rounded-lg opacity-50' />
                )}
              </Link>
            ))}

            {/* 테마 토글 */}
            <div className='ml-4 pl-4 border-l border-border/30'>
              <SimpleThemeToggle />
            </div>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className='md:hidden flex items-center space-x-2'>
            <SimpleThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='p-2 hover:bg-paper-warm focus-art'
                  aria-label='메뉴 열기'
                >
                  <Menu className='h-5 w-5 text-ink' />
                </Button>
              </SheetTrigger>
              <SheetContent
                side='right'
                className='w-80 bg-paper border-l border-border/50 backdrop-blur-xl'
              >
                <div className='flex flex-col h-full'>
                  {/* 헤더 */}
                  <div className='flex items-center justify-between py-6 border-b border-border/30'>
                    <Logo size='md' showLink={false} />
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setIsOpen(false)}
                      className='p-2 hover:bg-paper-warm focus-art'
                      aria-label='메뉴 닫기'
                    >
                      <X className='h-5 w-5 text-ink' />
                    </Button>
                  </div>

                  {/* 네비게이션 메뉴 */}
                  <div className='flex-1 py-8'>
                    <div className='space-y-2'>
                      {navigationItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            'flex flex-col px-4 py-4 rounded-xl transition-all duration-300',
                            'hover:bg-paper-warm hover:shadow-soft hover:translate-x-1',
                            'focus-art group',
                            isActive(item.href)
                              ? 'bg-gradient-zen text-ink shadow-soft'
                              : 'text-ink-light hover:text-ink'
                          )}
                        >
                          <span className='font-medium text-base mb-1 group-hover:text-ink transition-colors'>
                            {item.label}
                          </span>
                          {item.description && (
                            <span className='text-xs text-ink-lighter group-hover:text-ink-light transition-colors'>
                              {item.description}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* 푸터 */}
                  <div className='py-6 border-t border-border/30'>
                    <div className='text-center'>
                      <p className='text-xs text-ink-lighter mb-2'>
                        희랑 공경순 개인전
                      </p>
                      <p className='text-xs text-ink-lighter'>길 道 WAY</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

// 네비게이션 스페이서 컴포넌트
export function NavigationSpacer({ className }: { className?: string }) {
  return <div className={cn('h-24 md:h-28', className)} />
}
