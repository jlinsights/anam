'use client'

import { ArtworkDetailClient } from '@/components/artwork-detail-client'
import { GalleryDetailImage } from '@/components/optimized-image'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle, Palette, Ruler, XCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface ArtworkDetailModalClientProps {
  artwork: any
  recommendedArtworks: any[]
}

export default function ArtworkDetailModalClient({
  artwork,
  recommendedArtworks,
}: ArtworkDetailModalClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto'>
      {/* Image Section */}
      <div className='space-y-4'>
        <div className='relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800'>
          <GalleryDetailImage
            artwork={artwork}
            className='w-full h-full object-cover'
            onClick={() => setIsModalOpen(true)}
          />
        </div>
        {/* 모달(라이트박스) 오버레이 */}
        {isModalOpen && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'
            onClick={() => setIsModalOpen(false)}
          >
            <img
              src={artwork.imageUrl}
              alt='작품 전체 이미지'
              className='max-w-full max-h-full rounded-lg shadow-2xl'
              onClick={(e) => e.stopPropagation()} // 이미지 클릭 시 모달 닫히지 않게
            />
            <button
              className='absolute top-4 right-4 text-white text-3xl'
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
          </div>
        )}
      </div>
      {/* Details Section */}
      <div className='space-y-6'>
        <div className='space-y-4'>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
            {artwork.title}
          </h1>

          {/* 구매가능 상태 표시 */}
          <div className='flex items-center space-x-2'>
            {artwork.available !== undefined && (
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  artwork.available
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {artwork.available ? (
                  <>
                    <CheckCircle className='w-4 h-4' />
                    <span>구매가능</span>
                  </>
                ) : (
                  <>
                    <XCircle className='w-4 h-4' />
                    <span>판매완료</span>
                  </>
                )}
              </div>
            )}

            {artwork.price && (
              <div className='px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium'>
                {artwork.price.toLocaleString()}원
              </div>
            )}
          </div>

          <div className='flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400'>
            <div className='flex items-center space-x-1'>
              <Calendar className='w-4 h-4' />
              <span>{artwork.year}년</span>
            </div>

            {artwork.medium && (
              <div className='flex items-center space-x-1'>
                <Palette className='w-4 h-4' />
                <span>{artwork.medium}</span>
              </div>
            )}

            {artwork.dimensions && (
              <div className='flex items-center space-x-1'>
                <Ruler className='w-4 h-4' />
                <span>{artwork.dimensions}</span>
              </div>
            )}
          </div>
        </div>

        {/* 작품 설명 */}
        {artwork.description && (
          <div className='mt-6'>
            <h3 className='text-lg font-semibold mb-1'>작품 설명</h3>
            <p className='text-base text-muted-foreground'>
              {artwork.description}
            </p>
          </div>
        )}

        {/* 작가노트(artistNote): 작품 설명 아래에 artistNote가 있을 때만 표시 */}
        {artwork.artistNote && (
          <div className='mt-6'>
            <h3 className='text-lg font-semibold mb-1'>작가노트</h3>
            {/* 줄바꿈이 유지되도록 whitespace-pre-line 적용 */}
            <p className='text-base text-muted-foreground whitespace-pre-line'>
              {artwork.artistNote}
            </p>
          </div>
        )}

        {artwork.tags && artwork.tags.length > 0 && (
          <div className='space-y-2'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
              태그
            </h3>
            <div className='flex flex-wrap gap-2'>
              {artwork.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className='px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex space-x-4 pt-4'>
          <ArtworkDetailClient title={artwork.title} slug={artwork.slug} />
          <Link href='/contact'>
            <Button
              size='sm'
              variant={artwork.available === false ? 'secondary' : 'default'}
              disabled={artwork.available === false}
            >
              {artwork.available === false ? '판매완료' : '작품 문의하기'}
            </Button>
          </Link>
        </div>
      </div>

      {/* 추천 작품 섹션 */}
      {recommendedArtworks.length > 0 && (
        <div className='lg:col-span-2 mt-16'>
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
              다른 작품들
            </h2>
            <p className='text-slate-600 dark:text-slate-400'>
              아남의 다른 작품들을 감상해보세요
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
            {recommendedArtworks.map((recommendedArtwork: any) => (
              <Link
                key={recommendedArtwork.id}
                href={`/gallery/${recommendedArtwork.slug}`}
                className='group block bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1'
              >
                <div className='relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700'>
                  <Image
                    src={recommendedArtwork.imageUrl}
                    alt={recommendedArtwork.title}
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw'
                    loading='lazy'
                  />
                  <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300' />
                </div>
                <div className='p-3 sm:p-4'>
                  <h3 className='font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1 text-sm sm:text-base'>
                    {recommendedArtwork.title}
                  </h3>
                  <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2'>
                    {recommendedArtwork.year}년
                  </p>
                  {recommendedArtwork.medium && (
                    <p className='text-xs text-slate-500 dark:text-slate-500 line-clamp-2'>
                      {recommendedArtwork.medium}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
