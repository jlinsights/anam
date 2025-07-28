'use client'

import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
import { ZenBrutalistHero } from '@/components/zen-brutalist-hero'
import { ZenBrutalistFooter } from '@/components/zen-brutalist-footer'
import { Artist } from '@/lib/types'
import {
  BookOpen,
  Building,
  Calendar,
  GraduationCap,
  Instagram,
  Mail,
  Palette,
  Phone,
  Trophy,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef, useCallback } from 'react'

interface ArtistClientProps {
  artist: Artist
}

export default function ArtistClient({ artist }: ArtistClientProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    setMousePosition({ x, y })
  }, [])

  const renderSection = (
    title: string,
    content: string[] | string | undefined,
    icon: React.ReactNode
  ) => {
    if (!content || (Array.isArray(content) && content.length === 0))
      return null

    return (
      <div className='zen-brutalist-card glass-layer-1 zen-hover-scale void-breathing'>
        <div className='flex items-center gap-zen-md mb-zen-lg'>
          <div className='p-zen-sm bg-gold/10 rounded-lg text-gold'>
            {icon}
          </div>
          <h3 className='zen-typography-section text-ink stroke-horizontal'>{title}</h3>
        </div>
        <div className='space-y-zen-sm'>
          {Array.isArray(content) ? (
            content.map((item, index) => (
              <p key={index} className='zen-typography-body text-ink-light leading-relaxed void-minimal'>
                {item}
              </p>
            ))
          ) : (
            <p className='zen-typography-body text-ink-light leading-relaxed whitespace-pre-wrap void-minimal'>
              {content}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Dynamic background based on mouse position
  const dynamicBackground = {
    background: `radial-gradient(
      circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
      hsla(var(--ink) / 0.08) 0%,
      hsla(var(--gold) / 0.05) 40%,
      transparent 70%
    )`
  }

  return (
    <div 
      ref={containerRef}
      className='min-h-screen bg-paper relative overflow-hidden flex flex-col'
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Zen Brutalism Foundation Background Effects */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute inset-0 zen-breathe-deep opacity-2' />
        <div className='absolute inset-0 ink-flow-ambient opacity-1' />
        <div 
          className={`absolute inset-0 transition-opacity duration-2000 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          style={dynamicBackground}
        />
      </div>

      <ArtNavigation />
      
      {/* Zen Brutalist Hero for Artist Page */}
      <ZenBrutalistHero
        phase="1"
        title={{
          main: "아남 배옥영",
          sub: "ANAM BAE OK YOUNG",
          english: "Korean Calligraphy Artist"
        }}
        description={{
          primary: "전통 서예의 정신과 현대적 감각이 조화를 이루는 작가",
          secondary: "먹과 붓으로 그려내는 한국의 미학, 그 깊이와 아름다움을 탐험합니다"
        }}
        concept="ARTIST PROFILE"
        navigation={{
          prev: { href: '/gallery', label: '갤러리' },
          demo: { href: '/zen-demo', label: 'Zen 체험' }
        }}
        variant="zen"
        enableInteraction={true}
        className="min-h-[60vh]"
      />

      <NavigationSpacer />

      <main className='section-padding relative z-10 flex-1'>
        <div className='zen-brutalist-layout'>
          {/* 메인 콘텐츠 */}
          <div className='grid lg:grid-cols-2 gap-zen-2xl mb-zen-3xl temporal-depth'>
            {/* 왼쪽: 프로필 섹션 */}
            <div className='space-y-zen-lg void-contemplative'>
              {/* 프로필 이미지 */}
              <div className='zen-brutalist-card glass-layer-1 cultural-context'>
                <div className='relative w-full h-[500px] rounded-2xl overflow-hidden mb-zen-lg'>
                  <Image
                    src={
                      artist.profileImageUrl || '/Images/Artist/artist-large.jpg'
                    }
                    alt={artist.name}
                    fill
                    className='object-cover zen-hover-scale'
                    priority
                  />
                  {/* Image overlay with traditional ink effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/10 via-transparent to-transparent pointer-events-none" />
                </div>
                
                {/* 연락처 정보 섹션 */}
                <div className='space-y-zen-md void-breathing'>
                  <h2 className='zen-typography-hero text-ink stroke-press mb-zen-lg'>
                    {artist.name}
                  </h2>
                  
                  <div className='space-y-zen-sm'>
                    {/* 인스타그램 */}
                    {artist.socialLinks?.instagram && (
                      <div className='flex items-center gap-zen-sm zen-hover-scale'>
                        <div className='p-zen-xs bg-pink-100 rounded-lg'>
                          <Instagram className='h-4 w-4 text-pink-600' />
                        </div>
                        <Link
                          href={`https://instagram.com/${artist.socialLinks.instagram.replace('@', '')}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='zen-typography-body text-pink-600 hover:text-pink-700 transition-colors font-medium'
                        >
                          {artist.socialLinks.instagram}
                        </Link>
                      </div>
                    )}
                    {/* 이메일 */}
                    {artist.email && (
                      <div className='flex items-center gap-zen-sm zen-hover-scale'>
                        <div className='p-zen-xs bg-blue-50 rounded-lg'>
                          <Mail className='h-4 w-4 text-blue-600' />
                        </div>
                        <Link
                          href={`mailto:${artist.email}`}
                          className='zen-typography-body text-ink-light hover:text-ink transition-colors'
                        >
                          {artist.email}
                        </Link>
                      </div>
                    )}
                    {/* 전화번호 */}
                    {artist.phone && (
                      <div className='flex items-center gap-zen-sm zen-hover-scale'>
                        <div className='p-zen-xs bg-green-50 rounded-lg'>
                          <Phone className='h-4 w-4 text-green-600' />
                        </div>
                        <Link
                          href={`tel:${artist.phone}`}
                          className='zen-typography-body text-ink-light hover:text-ink transition-colors'
                        >
                          {artist.phone}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 상세 정보 섹션 */}
            <div className='space-y-zen-lg void-contemplative'>
              {/* 작가 소개 */}
              {artist.bio && (
                <div className='zen-brutalist-card glass-layer-1 zen-hover-scale void-breathing'>
                  <h3 className='zen-typography-section text-ink stroke-horizontal mb-zen-lg'>
                    작가 소개
                  </h3>
                  <p className='zen-typography-body text-ink-light leading-relaxed whitespace-pre-wrap void-minimal'>
                    {artist.bio}
                  </p>
                </div>
              )}

              {/* 작품 철학 */}
              {artist.philosophy && (
                <div className='zen-brutalist-card glass-layer-1 zen-hover-scale void-breathing'>
                  <div className='flex items-center gap-zen-md mb-zen-lg'>
                    <div className='p-zen-sm bg-gold/10 rounded-lg text-gold'>
                      <BookOpen className='h-4 w-4' />
                    </div>
                    <h3 className='zen-typography-section text-ink stroke-horizontal'>작품 철학</h3>
                  </div>
                  <p className='zen-typography-body text-ink-light leading-relaxed whitespace-pre-wrap void-minimal'>
                    {artist.philosophy}
                  </p>
                </div>
              )}

              {/* 작가 노트 */}
              {artist.statement && (
                <div className='zen-brutalist-card glass-layer-1 zen-hover-scale void-breathing'>
                  <div className='flex items-center gap-zen-md mb-zen-lg'>
                    <div className='p-zen-sm bg-gold/10 rounded-lg text-gold'>
                      <Building className='h-4 w-4' />
                    </div>
                    <h3 className='zen-typography-section text-ink stroke-horizontal'>작가 노트</h3>
                  </div>
                  <p className='zen-typography-body text-ink-light leading-relaxed whitespace-pre-wrap void-minimal'>
                    {artist.statement}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 추가 정보 섹션 */}
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-zen-lg temporal-depth'>
            {/* 학력 */}
            {renderSection(
              '학력',
              artist.education,
              <GraduationCap className='h-4 w-4' />
            )}

            {/* 전시 */}
            {renderSection(
              '전시',
              artist.exhibitions,
              <Palette className='h-4 w-4' />
            )}

            {/* 수상 */}
            {renderSection('수상', artist.awards, <Trophy className='h-4 w-4' />)}

            {/* 강의 */}
            {renderSection(
              '강의 경력',
              artist.teachingExperience,
              <Users className='h-4 w-4' />
            )}

            {/* 출판 */}
            {renderSection(
              '출판',
              artist.publications,
              <BookOpen className='h-4 w-4' />
            )}

            {/* 소속 */}
            {renderSection(
              '소속',
              artist.memberships,
              <Building className='h-4 w-4' />
            )}

            {/* 컬렉션 */}
            {renderSection(
              '컬렉션',
              artist.collections,
              <Calendar className='h-4 w-4' />
            )}
          </div>
        </div>
      </main>

      {/* Zen Brutalist Footer */}
      <ZenBrutalistFooter 
        variant="zen" 
        showPhaseNavigation={true} 
        enableInteraction={true}
      />
    </div>
  )
}
