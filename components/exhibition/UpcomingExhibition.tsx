/**
 * Upcoming Exhibition Section Component
 * Displays upcoming exhibitions with featured exhibition and additional exhibitions grid
 */

'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Clock, Users, ExternalLink, X } from 'lucide-react'

// Focus Trap component for modal accessibility
const FocusTrap: React.FC<{ children: React.ReactNode; isActive: boolean }> = ({ children, isActive }) => {
  const trapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const focusableElements = trapRef.current?.querySelectorAll(
      'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements?.[0] as HTMLElement
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])

  return <div ref={trapRef}>{children}</div>
}

// Exhibition type definition
interface Exhibition {
  id: string
  title: string
  subtitle?: string
  description: string
  artist: string
  startDate: string
  endDate: string
  venue: string
  imageUrl?: string
  featured: boolean
  status: 'upcoming' | 'current' | 'past'
  ticketUrl?: string
  openingReception?: string
  artworkCount?: number
  galleryHours?: string[]
}

// Sample exhibition data - replace with actual data source
const sampleExhibitions: Exhibition[] = [
  {
    id: '1',
    title: '서예의 새로운 지평',
    subtitle: '전통과 현대의 만남',
    description: '한국 전통 서예의 아름다움을 현대적 감각으로 재해석한 특별 전시입니다. 작가의 30년 서예 여정을 통해 발전된 독창적인 작품들을 만나보세요.',
    artist: '아남 배옥영',
    startDate: '2025-02-15',
    endDate: '2025-04-30',
    venue: 'ANAM 갤러리',
    imageUrl: '/Images/Exhibitions/upcoming-2025.jpg',
    featured: true,
    status: 'upcoming',
    ticketUrl: 'https://booking.example.com/exhibition-1',
    openingReception: '2025-02-15T18:00:00',
    artworkCount: 25,
    galleryHours: ['화-일: 오전 10시 - 오후 6시', '월요일 휴관']
  },
  {
    id: '2',
    title: '먹의 향연',
    description: '전통 먹과 붓의 조화로 만들어낸 예술 작품들의 향연',
    artist: '아남 배옥영',
    startDate: '2025-05-01',
    endDate: '2025-06-15',
    venue: 'ANAM 갤러리',
    featured: false,
    status: 'upcoming',
    artworkCount: 18
  }
]

const UpcomingExhibition: React.FC = () => {
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const handleOpenModal = useCallback((exhibition: Exhibition) => {
    setSelectedExhibition(exhibition)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedExhibition(null)
  }, [])

  // Close modal on escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedExhibition) {
        handleCloseModal()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [selectedExhibition, handleCloseModal])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedExhibition) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedExhibition])

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateRange = (startDate: string, endDate: string): string => {
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
                        alt={`${featuredExhibition.title} 전시 포스터`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <Calendar className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium">전시 포스터 준비 중</p>
                        <p className="text-sm">Coming Soon</p>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <div 
                      className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                      role="status"
                      aria-label={`전시 상태: ${featuredExhibition.featured ? '주목 전시' : '예정 전시'}`}
                    >
                      {featuredExhibition.featured ? '주목 전시' : '예정 전시'}
                    </div>
                  </div>

                  {/* Days Until Badge */}
                  {getDaysUntil(featuredExhibition.startDate) > 0 && (
                    <div className="absolute top-4 right-4">
                      <div 
                        className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                        role="status"
                        aria-label={`전시까지 ${getDaysUntil(featuredExhibition.startDate)}일 남음`}
                      >
                        D-{getDaysUntil(featuredExhibition.startDate)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <header className="mb-6">
                      <h2 id="featured-exhibition-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {featuredExhibition.title}
                      </h2>
                      {featuredExhibition.subtitle && (
                        <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
                          {featuredExhibition.subtitle}
                        </p>
                      )}
                    </header>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      {featuredExhibition.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                        <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />
                        <span className="font-medium">전시 기간:</span>
                        <span>{formatDateRange(featuredExhibition.startDate, featuredExhibition.endDate)}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-5 h-5 text-blue-600" aria-hidden="true" />
                        <span className="font-medium">전시 장소:</span>
                        <span>{featuredExhibition.venue}</span>
                      </div>

                      {featuredExhibition.artworkCount && (
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                          <Users className="w-5 h-5 text-blue-600" aria-hidden="true" />
                          <span className="font-medium">전시 작품:</span>
                          <span>{featuredExhibition.artworkCount}점</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleOpenModal(featuredExhibition)}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            </article>
          </div>
        )}

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
                        className="text-sm text-blue-600 dark:text-blue-400 font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded"
                        role="status"
                      >
                        예정
                      </div>
                    </header>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {exhibition.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>전시 기간:</strong>
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDateRange(exhibition.startDate, exhibition.endDate)}
                        </span>
                      </div>
                    </div>

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
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                          {selectedExhibition.subtitle}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      aria-label="전시 상세 정보 닫기"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </header>

                  <div id="modal-exhibition-description" className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedExhibition.description}
                    </p>

                    <dl className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <dt className="font-medium text-gray-900 dark:text-white">전시 기간:</dt>
                        <dd className="text-gray-700 dark:text-gray-300">
                          {formatDateRange(selectedExhibition.startDate, selectedExhibition.endDate)}
                        </dd>
                      </div>

                      {selectedExhibition.artworkCount && (
                        <div className="flex flex-wrap gap-2">
                          <dt className="font-medium text-gray-900 dark:text-white">전시 작품:</dt>
                          <dd className="text-gray-700 dark:text-gray-300">{selectedExhibition.artworkCount}점</dd>
                        </div>
                      )}

                      {selectedExhibition.openingReception && (
                        <div className="flex flex-wrap gap-2">
                          <dt className="font-medium text-gray-900 dark:text-white">오프닝 리셉션:</dt>
                          <dd className="text-gray-700 dark:text-gray-300">
                            {formatDate(selectedExhibition.openingReception.split('T')[0])} 오후 6시
                          </dd>
                        </div>
                      )}
                    </dl>

                    {selectedExhibition.galleryHours && (
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">관람 시간</h3>
                        <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                          {selectedExhibition.galleryHours.map((hours, index) => (
                            <li key={index}>{hours}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    {selectedExhibition.ticketUrl && (
                      <Link
                        href={selectedExhibition.ticketUrl}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={handleCloseModal}
                        aria-label={`${selectedExhibition.title} 전시 예매하기 (새 창에서 열림)`}
                      >
                        <ExternalLink className="w-4 h-4 inline mr-2" aria-hidden="true" />
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
            </FocusTrap>
          </div>
        )}
      </div>
    </section>
  )
}

export default UpcomingExhibition