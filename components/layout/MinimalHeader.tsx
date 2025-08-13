'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
  { name: 'Gallery', href: '/gallery', nameKo: '갤러리' },
  { name: 'Artist', href: '/artist', nameKo: '작가' },
  { name: 'Exhibition', href: '/exhibition', nameKo: '전시' },
  { name: 'Contact', href: '/contact', nameKo: '연락처' },
]

export function MinimalHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 group"
            >
              <span className={`text-2xl sm:text-3xl font-serif transition-colors duration-300 ${
                isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'
              } group-hover:text-gray-600 dark:group-hover:text-gray-300`}>
                아남
              </span>
              <span className={`text-xs sm:text-sm font-light tracking-wider uppercase transition-colors duration-300 ${
                isScrolled ? 'text-gray-600 dark:text-gray-400' : 'text-white/80'
              }`}>
                Gallery
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative text-sm font-light tracking-wide transition-colors duration-300 ${
                    pathname === item.href
                      ? isScrolled
                        ? 'text-gray-900 dark:text-white'
                        : 'text-white'
                      : isScrolled
                      ? 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <span>{item.name}</span>
                  {pathname === item.href && (
                    <motion.div
                      className={`absolute -bottom-1 left-0 right-0 h-px ${
                        isScrolled ? 'bg-gray-900 dark:bg-white' : 'bg-white'
                      }`}
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              ))}
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 transition-colors duration-300 ${
                isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'
              }`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white dark:bg-gray-900 md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-2xl font-light tracking-wide transition-colors duration-300 ${
                    pathname === item.href
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span>{item.nameKo}</span>
                  <span className="block text-sm text-gray-400 dark:text-gray-600 mt-1">
                    {item.name}
                  </span>
                </Link>
              ))}
              <div className="pt-8">
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}