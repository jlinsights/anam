'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AccessibleIconButton, FocusTrap, ScreenReaderOnly } from '@/components/accessibility'
import { X } from 'lucide-react'

interface ExhibitionData {
  id: string
  title: string
  subtitle?: string
  description: string
  venue: string
  location: string
  startDate: string
  endDate: string
  openingReception?: string
  imageUrl?: string
  status: 'upcoming' | 'current' | 'past'
  featured?: boolean
  artworkCount?: number
  ticketUrl?: string
  galleryHours?: string[]
}

const sampleExhibitions: ExhibitionData[] = [
  {
    id: 'exhibition-2025-spring',
    title: '선(線)의 여백, 여백의 선',
    subtitle: '전통과 현대의 만남',
    description: '한국 전통 서예의 정수를 현대적 감각으로 재해석한 새로운 작품들을 선보입니다. 선과 여백의 조화를 통해 내면의 평온과 현대적 아름다움을 동시에 느낄 수 있는 전시입니다.',
    venue: '갤러리 현대',
    location: '서울시 강남구',
    startDate: '2025-03-15',
    endDate: '2025-04-30',
    openingReception: '2025-03-15T18:00',
    imageUrl: '/Images/Exhibition/upcoming-spring-2025.jpg',
    status: 'upcoming',
    featured: true,
    artworkCount: 25,
    ticketUrl: '#',
    galleryHours: [
      '월요일-금요일: 10:00-19:00',
      '토요일-일요일: 10:00-18:00',
      '매주 화요일 휴관'
    ]
  },
  {
    id: 'exhibition-2025-summer',
    title: '먹향(墨香)',
    subtitle: '서예의 향기',
    description: '먹의 향기와 종이의 질감이 만들어내는 서예 작품의 감성적 매력을 탐구하는 전시입니다.',
    venue: '한국미술관',
    location: '서울시 종로구',
    startDate: '2025-06-01',
    endDate: '2025-07-15',
    imageUrl: '/Images/Exhibition/upcoming-summer-2025.jpg',
    status: 'upcoming',
    artworkCount: 18,
    ticketUrl: '#',
    galleryHours: [
      '화요일-일요일: 09:00-18:00',
      '매주 월요일 휴관'
    ]
  }
]

export default function UpcomingExhibition() {
  const [selectedExhibition, setSelectedExhibition] = useState<ExhibitionData | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Handle modal accessibility
  useEffect(() => {
    if (selectedExhibition) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      // Add escape key listener
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleCloseModal()
        }
      }
      
      document.addEventListener('keydown', handleEscapeKey)
      
      return () => {
        document.removeEventListener('keydown', handleEscapeKey)
        document.body.style.overflow = 'unset'
        
        // Restore focus to previous element
        if (previousFocusRef.current) {
          previousFocusRef.current.focus()
        }
      }
    }
  }, [selectedExhibition])

  const handleOpenModal = (exhibition: ExhibitionData) => {
    setSelectedExhibition(exhibition)
  }

  const handleCloseModal = () => {
    setSelectedExhibition(null)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getDate()}일`
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getDaysUntil = (dateString: string): number => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const upcomingExhibitions = sampleExhibitions.filter(ex => ex.status === 'upcoming')
  const featuredExhibition = upcomingExhibitions.find(ex => ex.featured) || upcomingExhibitions[0]

  return (
    <section 
      className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      aria-labelledby="upcoming-exhibitions-title"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-gray-400" aria-hidden="true"></div>
            <h1 id="upcoming-exhibitions-title" className="text-3xl font-bold text-gray-900 dark:text-white">
              다가오는 전시
            </h1>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-gray-400" aria-hidden="true"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            전통 서예의 아름다움을 현대적으로 재해석한 새로운 작품들을 만나보세요
          </p>
        </header>

        {featuredExhibition && (
          <div className="max-w-6xl mx-auto">
            {/* Featured Exhibition */}
            <article 
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 mb-8"
              aria-labelledby="featured-exhibition-title"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative aspect-[4/3] md:aspect-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    {featuredExhibition.imageUrl ? (
                      <Image
                        src={featuredExhibition.imageUrl}
                        alt={`${featuredExhibition.title} 전시 이미지`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmM2Y0ZjY7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNWU3ZWI7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+"
                        onError={(e) => {
                          console.warn('Exhibition image failed to load:', featuredExhibition.imageUrl)
                          // Hide the image on error - fallback will show
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">전시 이미지 준비중</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <div 
                      className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium"
                      role="status"
                      aria-label={`전시 상태: ${getDaysUntil(featuredExhibition.startDate) > 0 
                        ? `${getDaysUntil(featuredExhibition.startDate)}일 남음` 
                        : '진행 중'
                      }`}
                    >
                      {getDaysUntil(featuredExhibition.startDate) > 0 
                        ? `D-${getDaysUntil(featuredExhibition.startDate)}` 
                        : '진행 중'
                      }
                    </div>
                  </div>

                  {/* Featured Badge */}
                  {featuredExhibition.featured && (
                    <div className="absolute top-4 right-4">
                      <div 
                        className="bg-yellow-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium"
                        role="img"
                        aria-label="주요 전시"
                      >
                        주요 전시
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <header className="mb-6">
                      <h2 id="featured-exhibition-title" className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {featuredExhibition.title}
                      </h2>
                      {featuredExhibition.subtitle && (
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                          {featuredExhibition.subtitle}
                        </p>
                      )}
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {featuredExhibition.description}
                      </p>
                    </header>

                    {/* Exhibition Details */}
                    <dl className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <dt className="sr-only">전시 기간:</dt>
                        <dd className="font-medium">
                          {formatDateRange(featuredExhibition.startDate, featuredExhibition.endDate)}
                        </dd>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <dt className="sr-only">전시 장소:</dt>
                        <dd>{featuredExhibition.venue}, {featuredExhibition.location}</dd>
                      </div>

                      {featuredExhibition.artworkCount && (
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <dt className="sr-only">작품 수:</dt>
                          <dd>{featuredExhibition.artworkCount}점 전시</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleOpenModal(featuredExhibition)}
                      className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      aria-describedby="featured-exhibition-title"
                    >
                      상세 정보 보기
                    </button>
                    {featuredExhibition.ticketUrl && (
                      <Link
                        href={featuredExhibition.ticketUrl}
                        className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        aria-label={`${featuredExhibition.title} 전시 예매하기`}
                      >
                        예매하기
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Upcoming Exhibitions */}
            {upcomingExhibitions.length > 1 && (
              <section aria-labelledby="additional-exhibitions-title">
                <h2 id="additional-exhibitions-title" className="sr-only">추가 예정 전시</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {upcomingExhibitions
                    .filter(ex => ex.id !== featuredExhibition.id)
                    .map((exhibition, index) => (
                    <article
                      key={exhibition.id}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      aria-labelledby={`exhibition-${exhibition.id}-title`}
                    >
                      <header className="flex justify-between items-start mb-4">
                        <h3 id={`exhibition-${exhibition.id}-title`} className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                          {exhibition.title}
                        </h3>
                        <div 
                          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium ml-2"
                          role="status"
                          aria-label="예정된 전시"
                        >
                          예정
                        </div>
                      </header>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {exhibition.description}
                      </p>

                      <dl className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <dt className="sr-only">전시 기간:</dt>
                          <dd>{formatDateRange(exhibition.startDate, exhibition.endDate)}</dd>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <dt className="sr-only">전시 장소:</dt>
                          <dd>{exhibition.venue}</dd>
                        </div>
                      </dl>

                      <button
                        onClick={() => handleOpenModal(exhibition)}
                        className="w-full text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        aria-label={`${exhibition.title} 전시 상세 정보 보기`}
                      >
                        자세히 보기
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Modal for Exhibition Details */}
        {selectedExhibition && (
          <div 
            ref={modalRef}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-exhibition-title"
            aria-describedby="modal-exhibition-description"
            onClick={handleCloseModal}
          >
            <FocusTrap isActive={!!selectedExhibition}>
              <div 
                className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <header className="flex justify-between items-start mb-6">
                    <div>
                      <h2 id="modal-exhibition-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedExhibition.title}
                      </h2>
                      {selectedExhibition.subtitle && (
                        <p className="text-gray-600 dark:text-gray-300">
                          {selectedExhibition.subtitle}
                        </p>
                      )}
                    </div>
                    <AccessibleIconButton
                      icon={<X className="w-6 h-6" />}
                      label="전시 상세 정보 닫기"
                      onClick={handleCloseModal}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-lg"
                    />
                  </header>

                  <div className="space-y-6">
                    <p id="modal-exhibition-description" className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {selectedExhibition.description}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <section aria-labelledby="exhibition-info-title">
                        <h3 id="exhibition-info-title" className="font-semibold text-gray-900 dark:text-white mb-3">전시 정보</h3>
                        <dl className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <div>
                            <dt className="font-medium inline">기간: </dt>
                            <dd className="inline">{formatDateRange(selectedExhibition.startDate, selectedExhibition.endDate)}</dd>
                          </div>
                          <div>
                            <dt className="font-medium inline">장소: </dt>
                            <dd className="inline">{selectedExhibition.venue}, {selectedExhibition.location}</dd>
                          </div>
                          {selectedExhibition.artworkCount && (
                            <div>
                              <dt className="font-medium inline">작품 수: </dt>
                              <dd className="inline">{selectedExhibition.artworkCount}점</dd>
                            </div>
                          )}
                          {selectedExhibition.openingReception && (
                            <div>
                              <dt className="font-medium inline">개막식: </dt>
                              <dd className="inline">{formatDate(selectedExhibition.openingReception.split('T')[0])} 오후 6시</dd>
                            </div>
                          )}
                        </dl>
                      </section>

                      {selectedExhibition.galleryHours && (
                        <section aria-labelledby="gallery-hours-title">
                          <h3 id="gallery-hours-title" className="font-semibold text-gray-900 dark:text-white mb-3">관람 안내</h3>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            {selectedExhibition.galleryHours.map((hours, index) => (
                              <li key={index}>{hours}</li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {selectedExhibition.ticketUrl && (
                        <Link
                          href={selectedExhibition.ticketUrl}
                          className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          aria-label={`${selectedExhibition.title} 전시 예매하기`}
                        >
                          예매하기
                        </Link>
                      )}
                      <button
                        onClick={handleCloseModal}
                        className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        aria-label="전시 상세 정보 닫기"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </FocusTrap>
          </div>
        )}
      </div>
    </section>
  )
}