'use client'

import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
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

interface ArtistClientProps {
  artist: Artist
}

export default function ArtistClient({ artist }: ArtistClientProps) {
  const renderSection = (
    title: string,
    content: string[] | string | undefined,
    icon: React.ReactNode
  ) => {
    if (!content || (Array.isArray(content) && content.length === 0))
      return null

    return (
      <div className='bg-card border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-primary/10 rounded-lg text-primary'>
            {icon}
          </div>
          <h3 className='text-lg font-semibold text-foreground'>{title}</h3>
        </div>
        <div className='space-y-2'>
          {Array.isArray(content) ? (
            content.map((item, index) => (
              <p key={index} className='text-muted-foreground leading-relaxed'>
                {item}
              </p>
            ))
          ) : (
            <p className='text-muted-foreground leading-relaxed whitespace-pre-wrap'>
              {content}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20'>
      <ArtNavigation />
      <NavigationSpacer />

      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        {/* 페이지 헤더 */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight'>
            작가 소개
          </h1>
          <div className='w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full'></div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className='grid lg:grid-cols-2 gap-8 mb-12'>
          {/* 왼쪽: 프로필 섹션 */}
          <div className='space-y-6'>
            {/* 프로필 이미지: 모바일에서는 작게, 데스크탑에서는 크게 보이도록 반응형 Tailwind 클래스 적용 */}
            <div className='bg-card border border-border/50 rounded-2xl p-6 shadow-sm'>
              <div className='relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg mb-6'>
                <Image
                  src={
                    artist.profileImageUrl || '/images/artist/artist-large.jpg'
                  }
                  alt={artist.name}
                  fill
                  className='
                    rounded-full object-cover
                    w-32 h-32 mx-auto
                    sm:w-48 sm:h-48
                    md:w-60 md:h-60
                    shadow-lg
                  '
                  priority
                />
              </div>
            </div>
          </div>

          {/* 오른쪽: 상세 정보 섹션 */}
          <div className='space-y-6'>
            {/* 이름/인스타그램/이메일/전화번호 블록을 오른쪽 최상단에 추가 */}
            <div className='text-left space-y-2'>
              <h2 className='text-3xl font-bold text-foreground'>
                {artist.name}
              </h2>
              {/* 연락처 정보: 항상 세로로 나열 */}
              <div className='flex flex-col gap-2 mt-2'>
                {/* 인스타그램 */}
                {artist.socialLinks?.instagram && (
                  <div className='flex items-center gap-2'>
                    <Instagram className='h-5 w-5 text-pink-500' />
                    <Link
                      href={`https://instagram.com/${artist.socialLinks.instagram.replace(
                        '@',
                        ''
                      )}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-pink-500 hover:text-pink-600 transition-colors font-medium'
                    >
                      {artist.socialLinks.instagram}
                    </Link>
                  </div>
                )}
                {/* 이메일 */}
                {artist.email && (
                  <div className='flex items-center gap-2'>
                    <Mail className='h-5 w-5 text-blue-500' />
                    <Link
                      href={`mailto:${artist.email}`}
                      className='text-base text-muted-foreground hover:underline'
                    >
                      {artist.email}
                    </Link>
                  </div>
                )}
                {/* 전화번호 */}
                {artist.phone && (
                  <div className='flex items-center gap-2'>
                    <Phone className='h-5 w-5 text-green-500' />
                    <Link
                      href={`tel:${artist.phone}`}
                      className='text-base text-muted-foreground hover:underline'
                    >
                      {artist.phone}
                    </Link>
                  </div>
                )}
              </div>
            </div>
            {/* 작가 소개 */}
            {artist.bio && (
              <div className='bg-card border border-border/50 rounded-xl p-6 shadow-sm'>
                <p className='text-muted-foreground leading-relaxed whitespace-pre-wrap'>
                  {artist.bio}
                </p>
              </div>
            )}

            {/* 작품 철학 */}
            {artist.philosophy && (
              <div className='bg-card border border-border/50 rounded-xl p-6 shadow-sm'>
                <h3 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
                  <div className='p-2 bg-primary/10 rounded-lg text-primary'>
                    <BookOpen className='h-4 w-4' />
                  </div>
                  작품 철학
                </h3>
                <p className='text-muted-foreground leading-relaxed whitespace-pre-wrap'>
                  {artist.philosophy}
                </p>
              </div>
            )}

            {/* 경력 */}
            {artist.statement && (
              <div className='bg-card border border-border/50 rounded-xl p-6 shadow-sm'>
                <h3 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
                  <div className='p-2 bg-primary/10 rounded-lg text-primary'>
                    <Building className='h-4 w-4' />
                  </div>
                  작가 노트
                </h3>
                <p className='text-muted-foreground leading-relaxed whitespace-pre-wrap'>
                  {artist.statement}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
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
    </div>
  )
}
