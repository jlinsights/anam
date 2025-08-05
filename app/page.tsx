'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Artwork } from '@/lib/types'

// Zen Brutalism 헤더 컴포넌트
function ZenBrutalistHeader() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isScrolled, setIsScrolled] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePosition({ x, y })
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`
        relative bg-paper/95 backdrop-blur-sm border-b-4 border-ink
        transition-all duration-500 z-50
        ${isScrolled ? 'shadow-brutal' : ''}
      `}
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic background effect */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            hsl(var(--ink)) 0%, transparent 50%)`
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-zen-sm sm:px-zen-md lg:px-zen-lg">
        <div className="flex justify-between items-center py-zen-md">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-ink font-calligraphy font-bold text-2xl sm:text-3xl">
              아남 Oriental Calligraphy
            </h1>
            <div className="ml-zen-sm text-ink-light font-display text-sm hidden sm:block">
              전통과 현대가 만나는 서예의 세계
            </div>
          </motion.div>
          
          <nav className="hidden md:flex space-x-zen-md">
            {[
              { href: '/gallery', label: '갤러리' },
              { href: '/artist', label: '작가소개' },
              { href: '/exhibition', label: '전시정보' },
              { href: '/contact', label: '연락처' }
            ].map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link 
                  href={item.href} 
                  className="
                    text-ink hover:text-gold font-display font-medium
                    relative group transition-colors duration-300
                    before:absolute before:bottom-0 before:left-0 
                    before:w-0 before:h-0.5 before:bg-gold
                    before:transition-all before:duration-300
                    hover:before:w-full
                  "
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>
          
          <button className="md:hidden p-zen-xs bg-ink text-paper hover:bg-gold transition-colors duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

// Zen Brutalism 히어로 섹션
function ZenBrutalistHeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePosition({ x, y })
  }, [])

  return (
    <motion.section 
      className="
        relative min-h-screen flex items-center justify-center overflow-hidden
        bg-gradient-to-br from-paper via-paper-warm to-paper-cream
      "
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* Dynamic ink flow background */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          background: `
            radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
              hsl(var(--ink)) 0%, 
              hsl(var(--gold)) 30%,
              transparent 70%
            )
          `
        }}
        animate={{
          scale: isHovered ? 1.1 : 1,
          opacity: isHovered ? 0.15 : 0.1
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Geometric brutalist elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-ink opacity-10"
        animate={{
          rotate: mousePosition.x * 30,
          scale: isHovered ? 1.2 : 1
        }}
        transition={{ duration: 0.6 }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-24 h-24 border-4 border-gold opacity-20"
        animate={{
          rotate: mousePosition.y * -20,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-zen-md py-zen-xl max-w-6xl mx-auto">
        {/* Title */}
        <motion.h1
          className="
            font-calligraphy font-bold text-ink mb-zen-lg
            text-4xl sm:text-5xl md:text-6xl lg:text-7xl
            drop-shadow-sm
          "
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <span className="block">아남 배옥영</span>
          <span className="block text-gold font-display text-2xl sm:text-3xl md:text-4xl mt-zen-sm">
            Oriental Calligraphy
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="
            font-display text-ink-light text-lg sm:text-xl md:text-2xl 
            max-w-4xl mx-auto leading-relaxed mb-zen-xl
          "
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          전통 서예의 정신과 현대적 감각이 어우러진 작품 세계<br />
          <span className="text-base sm:text-lg text-brush font-body">
            WHERE TRADITION FLOWS INTO CONTEMPORARY
          </span>
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-zen-sm justify-center items-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <Link 
            href="/gallery" 
            className="
              group relative px-zen-lg py-zen-md
              bg-ink text-paper font-display font-bold
              hover:bg-gold hover:text-ink
              transition-all duration-300
              shadow-brutal hover:shadow-brutal-strong
              transform hover:-translate-x-1 hover:-translate-y-1
              border-4 border-ink hover:border-gold
              min-w-[200px]
            "
          >
            <span className="relative z-10">작품 갤러리</span>
            <div className="absolute inset-0 bg-gold opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          </Link>
          
          <Link 
            href="/artist" 
            className="
              group relative px-zen-lg py-zen-md
              bg-paper border-4 border-ink text-ink font-display font-bold
              hover:bg-ink hover:text-paper
              transition-all duration-300
              shadow-brutal-offset hover:shadow-brutal
              transform hover:translate-x-1 hover:translate-y-1
              min-w-[200px]
            "
          >
            <span className="relative z-10">작가 소개</span>
            <div className="absolute inset-0 bg-ink opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          </Link>
        </motion.div>

        {/* Cultural element */}
        <motion.div
          className="
            mt-zen-xl pt-zen-lg border-t-2 border-ink/20
            flex items-center justify-center gap-zen-sm
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <div className="w-12 h-px bg-gold" />
          <span className="font-calligraphy text-ink font-medium">
            먹, 그리고... 道
          </span>
          <div className="w-12 h-px bg-gold" />
        </motion.div>
      </div>
    </motion.section>
  )
}

// Zen Brutalism 추천 작품 섹션
function ZenBrutalistFeaturedWorksSection() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    async function loadArtworks() {
      try {
        const response = await fetch('/api/artworks')
        if (!response.ok) throw new Error('Failed to fetch artworks')
        
        const result = await response.json()
        const allArtworks = result.data || []
        
        // 처음 6개 작품만 표시
        setArtworks(allArtworks.slice(0, 6))
      } catch (error) {
        console.error('Failed to load artworks:', error)
        // 폴백 데이터
        setArtworks([
          {
            id: '1',
            title: '전통 서예 작품 1',
            slug: 'artwork-1',
            year: 2024,
            medium: '서예',
            dimensions: '68 x 136 cm',
            aspectRatio: '1/1',
            description: '전통 서예의 아름다움',
            imageUrl: '/placeholder.jpg',
          },
          {
            id: '2',
            title: '전통 서예 작품 2',
            slug: 'artwork-2',
            year: 2024,
            medium: '서예',
            dimensions: '68 x 136 cm',
            aspectRatio: '1/1',
            description: '현대적 감각의 서예',
            imageUrl: '/placeholder.jpg',
          },
          {
            id: '3',
            title: '전통 서예 작품 3',
            slug: 'artwork-3',
            year: 2024,
            medium: '서예',
            dimensions: '68 x 136 cm',
            aspectRatio: '1/1',
            description: '조화로운 서예 작품',
            imageUrl: '/placeholder.jpg',
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadArtworks()
  }, [])

  if (loading) {
    return (
      <section className="py-zen-xl bg-paper-warm">
        <div className="max-w-7xl mx-auto px-zen-md">
          <motion.h2 
            className="font-calligraphy font-bold text-ink text-3xl md:text-4xl text-center mb-zen-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            추천 작품 • Featured Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-zen-lg">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="
                  bg-paper-cream aspect-square border-4 border-ink/20
                  animate-pulse shadow-brutal-offset
                  flex items-center justify-center
                "
              >
                <div className="w-16 h-16 bg-ink/10"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-zen-xl bg-paper-warm">
      <div className="max-w-7xl mx-auto px-zen-md">
        {/* Section title */}
        <motion.div
          className="text-center mb-zen-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="font-calligraphy font-bold text-ink text-3xl md:text-4xl mb-zen-sm">
            추천 작품
          </h2>
          <p className="font-display text-ink-light text-lg">
            Selected Works • 精選作品
          </p>
          <div className="mt-zen-sm flex justify-center">
            <div className="w-24 h-1 bg-gold"></div>
          </div>
        </motion.div>

        {/* Artwork grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-zen-lg">
          {artworks.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="
                relative bg-paper aspect-square border-4 border-ink
                shadow-brutal group-hover:shadow-brutal-strong
                transition-all duration-300
                group-hover:-translate-x-2 group-hover:-translate-y-2
                overflow-hidden
              ">
                {/* Artwork display area */}
                <div className="absolute inset-4 bg-paper-cream flex items-center justify-center">
                  <span className="font-calligraphy text-ink-light text-sm">
                    {artwork.title}
                  </span>
                </div>
                
                {/* Hover overlay */}
                <motion.div
                  className="
                    absolute inset-0 bg-gold/5 
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                  "
                  animate={{
                    opacity: hoveredIndex === index ? 1 : 0
                  }}
                >
                  <div className="text-center p-zen-sm">
                    <div className="w-12 h-12 border-2 border-ink mx-auto mb-2"></div>
                    <span className="font-display text-ink text-xs">작품 보기</span>
                  </div>
                </motion.div>
              </div>
              
              {/* Artwork info */}
              <div className="mt-zen-sm">
                <h3 className="font-calligraphy font-semibold text-ink mb-1">
                  {artwork.title}
                </h3>
                <p className="font-display text-ink-light text-sm">
                  {artwork.year} • {artwork.medium}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          className="text-center mt-zen-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Link 
            href="/gallery" 
            className="
              inline-block px-zen-lg py-zen-md
              bg-ink text-paper font-display font-bold
              hover:bg-gold hover:text-ink
              transition-all duration-300
              shadow-brutal hover:shadow-brutal-strong
              transform hover:-translate-x-1 hover:-translate-y-1
              border-4 border-ink hover:border-gold
            "
          >
            전체 작품 갤러리 탐험
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// Zen Brutalism 작가 소개 섹션
function ZenBrutalistArtistSection() {
  return (
    <section className="py-zen-xl bg-paper">
      <div className="max-w-7xl mx-auto px-zen-md">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-zen-xl items-center">
          {/* Artist content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="mb-zen-sm">
              <h3 className="font-calligraphy font-bold text-ink text-3xl md:text-4xl mb-zen-sm">
                아남 배옥영
              </h3>
              <p className="font-display text-gold text-lg font-medium">
                ANAM Bae Ok Young • 書藝家
              </p>
            </div>
            
            <div className="space-y-zen-md">
              <p className="font-display text-ink text-lg leading-relaxed">
                전통 서예의 깊이와 현대적 감각을 조화시키며, 
                <strong className="text-gold font-semibold">한국 미학의 정수</strong>를 
                현대적 언어로 재해석하는 작업을 하고 있습니다.
              </p>
              
              <p className="font-display text-ink-light leading-relaxed">
                오랜 수행과 연구를 통해 완성된 독창적인 서예 세계를 
                디지털 갤러리를 통해 널리 공유하고자 합니다.
              </p>
              
              <blockquote className="border-l-4 border-gold pl-zen-md py-zen-sm bg-paper-warm">
                <p className="font-calligraphy text-ink italic">
                  "먹과 붓이 만나는 순간, 전통과 현대가 하나가 된다"
                </p>
              </blockquote>
            </div>
            
            <motion.div
              className="mt-zen-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <Link 
                href="/artist" 
                className="
                  inline-block px-zen-lg py-zen-md
                  bg-paper border-4 border-ink text-ink font-display font-bold
                  hover:bg-ink hover:text-paper
                  transition-all duration-300
                  shadow-brutal-offset hover:shadow-brutal
                  transform hover:translate-x-1 hover:translate-y-1
                "
              >
                작가 소개 더보기
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Artist image */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="
              relative bg-paper-cream w-80 h-96 border-4 border-ink
              shadow-brutal hover:shadow-brutal-strong
              transition-all duration-300
              hover:-translate-x-2 hover:-translate-y-2
              flex items-center justify-center
              group cursor-pointer
            ">
              {/* Portrait placeholder */}
              <div className="absolute inset-4 bg-paper border-2 border-ink/20 flex flex-col items-center justify-center">
                <div className="w-24 h-24 border-2 border-ink/30 rounded-full mb-zen-sm flex items-center justify-center">
                  <span className="font-calligraphy text-ink/60 text-xs">아남</span>
                </div>
                <span className="font-display text-ink-light text-sm">작가 프로필</span>
              </div>
              
              {/* Hover effect */}
              <div className="
                absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                flex items-center justify-center
              ">
                <span className="font-display text-ink text-sm">더 보기</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// 전시 정보 섹션
function ExhibitionSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-6">먹, 그리고... 道</h3>
        <p className="text-xl text-gray-600 mb-12">아남 배옥영 개인전</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">전시 기간</h4>
            <p className="text-gray-600">2026년 4월 15일 ~ 4월 20일</p>
            <p className="text-sm text-gray-500">오전 10시 - 오후 6시</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">전시 장소</h4>
            <p className="text-gray-600">예술의전당 서울서예박물관</p>
            <p className="text-sm text-gray-500">제1전시실</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">관람 안내</h4>
            <p className="text-gray-600">무료 관람</p>
            <p className="text-sm text-gray-500">사전 예약 불필요</p>
          </div>
        </div>
        
        <Link 
          href="/exhibition" 
          className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          전시 상세 정보
        </Link>
      </div>
    </section>
  )
}

// 푸터
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-xl font-semibold mb-4">Oriental Calligraphy</h3>
        <p className="text-gray-400 mb-6">
          전통과 현대가 만나는 서예의 세계
        </p>
        <p className="text-gray-500 text-sm">
          © 2024 아남 배옥영 서예 갤러리. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

// Zen Brutalism 메인 페이지
export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper">
      <ZenBrutalistHeader />
      <ZenBrutalistHeroSection />
      <ZenBrutalistFeaturedWorksSection />
      <ZenBrutalistArtistSection />
      <ExhibitionSection />
      <Footer />
    </main>
  )
}