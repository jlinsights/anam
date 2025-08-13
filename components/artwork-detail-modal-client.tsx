'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArtworkDetailClient } from '@/components/artwork-detail-client'
import { GalleryDetailImage } from '@/components/optimized-image'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle, Palette, Ruler, XCircle, X } from 'lucide-react'
import { AccessibleIconButton, FocusTrap, ScreenReaderOnly } from '@/components/accessibility'

interface ArtworkDetailModalClientProps {
  artwork: any
  recommendedArtworks: any[]
}

export default function ArtworkDetailModalClient({
  artwork,
  recommendedArtworks,
}: ArtworkDetailModalClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Handle modal accessibility
  useEffect(() => {
    if (isModalOpen) {
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
  }, [isModalOpen])

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-zen-lg max-w-6xl mx-auto'>
      {/* Image Section - 컴팩트화 */}
      <div className='space-y-zen-md'>
        <div className='relative aspect-square rounded-xl overflow-hidden bg-paper border border-stone/20'>
          <button
            onClick={handleOpenModal}
            className='w-full h-full group focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2'
            aria-label={`${artwork.title} 확대 이미지 보기`}
          >
            <GalleryDetailImage
              artwork={artwork}
              className='w-full h-full object-cover zen-hover-scale'
            />
            <div className='absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 group-focus:bg-black/20 transition-colors duration-200'>
              <div className='opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 bg-white/90 p-2 rounded-full'>
                <span className='text-sm font-medium text-gray-900'>확대보기</span>
              </div>
            </div>
          </button>
        </div>
        {/* 모달(라이트박스) 오버레이 */}
        {isModalOpen && (
          <div
            ref={modalRef}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'
            role='dialog'
            aria-modal='true'
            aria-labelledby='modal-image-title'
            aria-describedby='modal-image-description'
            onClick={handleCloseModal}
          >
            <FocusTrap isActive={isModalOpen}>
              <div className='relative max-w-[90vw] max-h-[90vh] flex flex-col items-center'>
                <img
                  src={artwork.imageUrl}
                  alt={`${artwork.title} - 확대 이미지`}
                  className='max-w-full max-h-full rounded-lg shadow-2xl object-contain'
                  onClick={(e) => e.stopPropagation()}
                />
                
                {/* Image title and description for screen readers */}
                <div className='sr-only'>
                  <h2 id='modal-image-title'>{artwork.title} 확대 이미지</h2>
                  <p id='modal-image-description'>
                    {artwork.year}년 작품, {artwork.medium ? `${artwork.medium}, ` : ''}
                    {artwork.dimensions ? artwork.dimensions : ''}
                  </p>
                </div>
                
                {/* Accessible close button */}
                <AccessibleIconButton
                  icon={<X className='w-6 h-6' />}
                  label='이미지 확대보기 닫기'
                  onClick={handleCloseModal}
                  className='absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full p-2'
                />
                
                {/* Image metadata overlay */}
                <div className='absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4 text-white'>
                  <h3 className='font-semibold text-lg mb-2'>{artwork.title}</h3>
                  <div className='flex flex-wrap gap-4 text-sm opacity-90'>
                    <span>{artwork.year}년</span>
                    {artwork.medium && <span>{artwork.medium}</span>}
                    {artwork.dimensions && <span>{artwork.dimensions}</span>}
                  </div>
                </div>
              </div>
            </FocusTrap>
          </div>
        )}
      </div>
      {/* Details Section - 타이포그래피 개선 */}
      <div className='space-y-zen-lg'>
        <div className='space-y-zen-md'>
          <h1 className='text-2xl font-semibold text-ink leading-tight'>
            {artwork.title}
          </h1>

          {/* 구매가능 상태 표시 - 컴팩트화 */}
          <div className='flex items-center gap-zen-sm flex-wrap'>
            {artwork.available !== undefined && (
              <div
                className={`flex items-center gap-zen-xs px-zen-md py-zen-xs rounded-lg text-sm font-medium ${
                  artwork.available
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
                role='status'
                aria-label={`작품 상태: ${artwork.available ? '구매가능' : '판매완료'}`}
              >
                {artwork.available ? (
                  <>
                    <CheckCircle className='w-4 h-4' aria-hidden='true' />
                    <span>구매가능</span>
                  </>
                ) : (
                  <>
                    <XCircle className='w-4 h-4' aria-hidden='true' />
                    <span>판매완료</span>
                  </>
                )}
              </div>
            )}

            {artwork.price && (
              <div 
                className='px-zen-md py-zen-xs bg-gold/10 text-gold border border-gold/20 rounded-lg text-sm font-medium'
                aria-label={`작품 가격: ${artwork.price.toLocaleString()}원`}
              >
                {artwork.price.toLocaleString()}원
              </div>
            )}
          </div>

          {/* 작품 메타데이터 */}
          <dl className='flex items-center gap-zen-md text-sm text-ink-light flex-wrap'>
            <div className='flex items-center gap-zen-xs'>
              <Calendar className='w-4 h-4 text-gold' aria-hidden='true' />
              <dt className='sr-only'>제작년도:</dt>
              <dd>{artwork.year}년</dd>
            </div>

            {artwork.medium && (
              <div className='flex items-center gap-zen-xs'>
                <Palette className='w-4 h-4 text-gold' aria-hidden='true' />
                <dt className='sr-only'>재료:</dt>
                <dd>{artwork.medium}</dd>
              </div>
            )}

            {artwork.dimensions && (
              <div className='flex items-center gap-zen-xs'>
                <Ruler className='w-4 h-4 text-gold' aria-hidden='true' />
                <dt className='sr-only'>크기:</dt>
                <dd>{artwork.dimensions}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* 작품 설명 - 타이포그래피 개선 */}
        {artwork.description && (
          <section aria-labelledby='artwork-description-title'>
            <h2 id='artwork-description-title' className='text-lg font-medium text-ink mb-zen-sm'>
              작품 설명
            </h2>
            <p className='text-base text-ink-light leading-relaxed'>
              {artwork.description}
            </p>
          </section>
        )}

        {/* 작가노트(artistNote) - 타이포그래피 개선 */}
        {artwork.artistNote && (
          <section aria-labelledby='artist-note-title'>
            <h2 id='artist-note-title' className='text-lg font-medium text-ink mb-zen-sm'>작가노트</h2>
            <p className='text-base text-ink-light leading-relaxed whitespace-pre-line'>
              {artwork.artistNote}
            </p>
          </section>
        )}

        {artwork.tags && artwork.tags.length > 0 && (
          <section aria-labelledby='artwork-tags-title'>
            <h2 id='artwork-tags-title' className='text-lg font-medium text-ink mb-zen-sm'>태그</h2>
            <div className='flex flex-wrap gap-zen-sm' role='list' aria-label='작품 태그 목록'>
              {artwork.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className='px-zen-md py-zen-xs bg-stone/10 text-ink border border-stone/20 rounded-lg text-sm'
                  role='listitem'
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Action Buttons - 레이아웃 개선 */}
        <div className='flex gap-zen-md pt-zen-md flex-wrap'>
          <ArtworkDetailClient title={artwork.title} slug={artwork.slug} />
          <Link href='/contact'>
            <Button
              size='sm'
              variant={artwork.available === false ? 'secondary' : 'default'}
              disabled={artwork.available === false}
              className={
                artwork.available === false ? '' : 'btn-art zen-hover-scale'
              }
            >
              {artwork.available === false ? '판매완료' : '작품 문의하기'}
            </Button>
          </Link>
        </div>
      </div>

      {/* 추천 작품 섹션 - 레이아웃 개선 */}
      {recommendedArtworks.length > 0 && (
        <section className='lg:col-span-2 mt-zen-2xl' aria-labelledby='recommended-artworks-title'>
          <div className='mb-zen-lg'>
            <h2 id='recommended-artworks-title' className='text-xl font-semibold text-ink mb-zen-sm'>
              다른 작품들
            </h2>
            <p className='text-base text-ink-light'>
              아남의 다른 작품들을 감상해보세요
            </p>
          </div>

          <div 
            className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-zen-md'
            role='grid'
            aria-label='추천 작품 갤러리'
          >
            {recommendedArtworks.map((recommendedArtwork: any, index: number) => (
              <Link
                key={recommendedArtwork.id}
                href={`/gallery/${recommendedArtwork.slug}`}
                className='group block bg-paper border border-stone/20 rounded-xl overflow-hidden zen-hover-scale focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2'
                aria-label={`${recommendedArtwork.title}, ${recommendedArtwork.year}년 작품${recommendedArtwork.medium ? `, ${recommendedArtwork.medium}` : ''} - 상세보기`}
                role='gridcell'
              >
                <div className='relative aspect-square overflow-hidden'>
                  <Image
                    src={recommendedArtwork.imageUrl}
                    alt={`${recommendedArtwork.title} - ${recommendedArtwork.year}년 작품`}
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                    sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
                    loading='lazy'
                  />
                  <div className='absolute inset-0 bg-black/0 group-hover:bg-ink/5 transition-colors duration-300' />
                </div>
                <div className='p-zen-md'>
                  <h3 className='font-medium text-ink mb-zen-xs line-clamp-1 text-sm'>
                    {recommendedArtwork.title}
                  </h3>
                  <p className='text-xs text-ink-light mb-zen-xs'>
                    {recommendedArtwork.year}년
                  </p>
                  {recommendedArtwork.medium && (
                    <p className='text-xs text-ink-lighter line-clamp-1'>
                      {recommendedArtwork.medium}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

