'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Image as ImageIcon, 
  User, 
  Calendar, 
  Mail, 
  Globe, 
  Menu, 
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react'

interface NavigationItem {
  id: string
  title: { ko: string; en: string }
  href: string
  icon: React.ComponentType<any>
  children?: NavigationItem[]
  badge?: string
  external?: boolean
}

interface AgentOSNavigationProps {
  variant?: 'horizontal' | 'vertical' | 'floating' | 'minimal'
  culturalContext?: 'spring' | 'summer' | 'autumn' | 'winter' | 'eternal'
  enableBilingualMode?: boolean
  enableAgentFeatures?: boolean
  className?: string
}

export function AgentOSNavigation({
  variant = 'horizontal',
  culturalContext = 'eternal',
  enableBilingualMode = true,
  enableAgentFeatures = true,
  className
}: AgentOSNavigationProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState<'ko' | 'en'>('ko')
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // 🎯 Agent OS Pattern: Intelligent Navigation Structure
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      title: { ko: '홈', en: 'Home' },
      href: '/',
      icon: Home
    },
    {
      id: 'gallery',
      title: { ko: '갤러리', en: 'Gallery' },
      href: '/gallery',
      icon: ImageIcon,
      children: [
        {
          id: 'all-works',
          title: { ko: '전체 작품', en: 'All Artworks' },
          href: '/gallery',
          icon: ImageIcon
        },
        {
          id: 'featured',
          title: { ko: '주요 작품', en: 'Featured' },
          href: '/gallery?filter=featured',
          icon: Sparkles,
          badge: 'NEW'
        }
      ]
    },
    {
      id: 'artist',
      title: { ko: '작가', en: 'Artist' },
      href: '/artist',
      icon: User
    },
    {
      id: 'exhibition',
      title: { ko: '전시', en: 'Exhibition' },
      href: '/exhibition',
      icon: Calendar,
      children: enableAgentFeatures ? [
        {
          id: 'upcoming',
          title: { ko: '예정 전시', en: 'Upcoming' },
          href: '/exhibition/upcoming',
          icon: Calendar
        },
        {
          id: 'virtual',
          title: { ko: '가상 투어', en: 'Virtual Tour' },
          href: '/exhibition/virtual',
          icon: Globe,
          badge: 'AI'
        }
      ] : undefined
    },
    {
      id: 'contact',
      title: { ko: '연락처', en: 'Contact' },
      href: '/contact',
      icon: Mail
    }
  ]

  // 🎯 SuperClaude Pattern: Advanced Scroll Tracking
  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(1, window.scrollY / (document.documentElement.scrollHeight - window.innerHeight))
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 🎯 Agent OS Pattern: Intelligent Language Detection
  useEffect(() => {
    const detectedLang = pathname.includes('/en') ? 'en' : 'ko'
    setCurrentLang(detectedLang)
  }, [pathname])

  // 🎨 Cultural Context Styling
  const culturalStyles = {
    spring: {
      background: 'bg-gradient-to-r from-spring-primary/10 to-spring-secondary/5',
      accent: 'spring-primary',
      border: 'border-spring-primary/20'
    },
    summer: {
      background: 'bg-gradient-to-r from-summer-primary/10 to-summer-secondary/5',
      accent: 'summer-primary',
      border: 'border-summer-primary/20'
    },
    autumn: {
      background: 'bg-gradient-to-r from-autumn-primary/10 to-autumn-secondary/5',
      accent: 'autumn-primary',
      border: 'border-autumn-primary/20'
    },
    winter: {
      background: 'bg-gradient-to-r from-winter-primary/10 to-winter-secondary/5',
      accent: 'winter-primary',
      border: 'border-winter-primary/20'
    },
    eternal: {
      background: 'bg-paper/80 backdrop-blur-lg',
      accent: 'gold',
      border: 'border-ink/10'
    }
  }

  const currentStyle = culturalStyles[culturalContext]

  // 🎯 Navigation Variants for Different Layouts
  const navigationVariants = {
    horizontal: {
      container: cn(
        'fixed top-0 left-0 right-0 z-50 border-b',
        currentStyle.background,
        currentStyle.border
      ),
      list: 'flex items-center justify-center space-x-zen-md px-zen-md py-zen-sm',
      item: 'relative group'
    },
    vertical: {
      container: cn(
        'fixed left-0 top-0 bottom-0 w-64 z-50 border-r',
        currentStyle.background,
        currentStyle.border
      ),
      list: 'flex flex-col space-y-zen-sm p-zen-md',
      item: 'relative'
    },
    floating: {
      container: cn(
        'fixed bottom-zen-md left-1/2 transform -translate-x-1/2 z-50 rounded-full border',
        currentStyle.background,
        currentStyle.border,
        'shadow-zen-float'
      ),
      list: 'flex items-center space-x-zen-sm px-zen-md py-zen-sm',
      item: 'relative'
    },
    minimal: {
      container: cn(
        'fixed top-zen-sm right-zen-sm z-50 rounded-lg border',
        currentStyle.background,
        currentStyle.border
      ),
      list: 'flex items-center space-x-zen-xs p-zen-xs',
      item: 'relative'
    }
  }

  const currentVariant = navigationVariants[variant]

  // 🎯 SuperClaude Pattern: Intelligent Link Component
  const NavigationLink = ({ item, isActive }: { item: NavigationItem; isActive: boolean }) => {
    const IconComponent = item.icon
    
    return (
      <Link
        href={item.href}
        className={cn(
          'aceternity-nav-item flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200',
          'hover:text-foreground',
          isActive && 'aceternity-nav-item-active text-primary border-l-2 border-primary',
          variant === 'minimal' && 'p-2'
        )}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
      >
        <IconComponent className={cn(
          'w-4 h-4',
          variant === 'minimal' && 'w-5 h-5'
        )} />
        
        {variant !== 'minimal' && (
          <span className={cn(
            'text-sm font-medium',
            'zen-typography-body'
          )}>
            {item.title[currentLang]}
          </span>
        )}
        
        {item.badge && (
          <span className={cn(
            'px-1.5 py-0.5 text-xs rounded-full',
            `bg-${currentStyle.accent}/10 text-${currentStyle.accent}`,
            'font-bold uppercase tracking-wide'
          )}>
            {item.badge}
          </span>
        )}
        
        {item.children && variant !== 'minimal' && (
          <ChevronDown className={cn(
            'w-3 h-3 transition-transform',
            expandedSubmenu === item.id && 'rotate-180'
          )} />
        )}
      </Link>
    )
  }

  // 🎯 Agent OS Pattern: Submenu Component
  const Submenu = ({ item }: { item: NavigationItem }) => {
    if (!item.children) return null

    return (
      <AnimatePresence>
        {expandedSubmenu === item.id && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
              'absolute top-full left-0 mt-2 min-w-48',
              'bg-paper/95 backdrop-blur-lg border border-ink/10 rounded-lg shadow-zen-depth',
              'py-zen-xs'
            )}
          >
            {item.children.map((child) => (
              <div key={child.id} className="px-zen-xs">
                <NavigationLink 
                  item={child} 
                  isActive={pathname === child.href}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <>
      {/* 🎯 Main Navigation */}
      <motion.nav
        className={cn(
          'aceternity-nav bg-background/80 backdrop-blur-lg',
          currentVariant.container, 
          className
        )}
        initial={{ opacity: 0, y: variant === 'floating' ? 20 : variant === 'horizontal' ? -20 : 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* 🎨 Scroll Progress Indicator (for horizontal variant) */}
        {variant === 'horizontal' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink/10">
            <motion.div
              className={`h-full bg-${currentStyle.accent}`}
              style={{ scaleX: scrollProgress }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: scrollProgress }}
              transition={{ duration: 0.1 }}
            />
          </div>
        )}

        <div className={currentVariant.list}>
          {/* 🎯 Logo/Brand (for horizontal and vertical variants) */}
          {(variant === 'horizontal' || variant === 'vertical') && (
            <Link 
              href="/" 
              className={cn(
                'flex items-center space-x-2 mr-zen-lg',
                variant === 'vertical' && 'mb-zen-md pb-zen-md border-b border-ink/10'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full',
                `bg-gradient-to-br from-${currentStyle.accent} to-${currentStyle.accent}/60`
              )} />
              {variant === 'vertical' && (
                <div>
                  <div className="font-display font-bold text-ink">ANAM</div>
                  <div className="text-xs text-ink-light">Gallery</div>
                </div>
              )}
            </Link>
          )}

          {/* 🎯 Navigation Items */}
          {navigationItems.map((item) => (
            <div
              key={item.id}
              className={currentVariant.item}
              onMouseEnter={() => item.children && setExpandedSubmenu(item.id)}
              onMouseLeave={() => setExpandedSubmenu(null)}
            >
              <NavigationLink 
                item={item} 
                isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
              />
              <Submenu item={item} />
            </div>
          ))}

          {/* 🎯 Language Toggle (Benchmark Feature) */}
          {enableBilingualMode && variant !== 'minimal' && (
            <motion.button
              onClick={() => setCurrentLang(currentLang === 'ko' ? 'en' : 'ko')}
              className="aceternity-button-secondary flex items-center space-x-1 px-3 py-2 text-xs font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="w-3 h-3" />
              <span>{currentLang.toUpperCase()}</span>
            </motion.button>
          )}

          {/* 🎯 Mobile Menu Toggle (for horizontal variant) */}
          {variant === 'horizontal' && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md hover:bg-ink/5 transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </motion.nav>

      {/* 🎯 Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && variant === 'horizontal' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className={cn(
                'absolute right-0 top-0 bottom-0 w-80 max-w-[80vw]',
                currentStyle.background,
                'border-l', currentStyle.border,
                'overflow-y-auto'
              )}
            >
              <div className="p-zen-md space-y-zen-sm">
                {navigationItems.map((item) => (
                  <div key={item.id} className="space-y-zen-xs">
                    <NavigationLink 
                      item={item} 
                      isActive={pathname === item.href}
                    />
                    {item.children && (
                      <div className="ml-zen-md space-y-zen-xs border-l border-ink/10 pl-zen-sm">
                        {item.children.map((child) => (
                          <NavigationLink 
                            key={child.id}
                            item={child} 
                            isActive={pathname === child.href}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AgentOSNavigation