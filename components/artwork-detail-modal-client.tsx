'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArtworkDetailClient } from '@/components/artwork-detail-client'
import { GalleryDetailImage } from '@/components/optimized-image'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle, Palette, Ruler, XCircle } from 'lucide-react'

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
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-zen-lg max-w-6xl mx-auto'>
      {/* Image Section - 컴팩트화 */}
      <div className='space-y-zen-md'>
        <div className='relative aspect-square rounded-xl overflow-hidden bg-paper border border-stone/20'>
          <GalleryDetailImage
            artwork={artwork}
            className='w-full h-full object-cover zen-hover-scale'
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
              className='absolute top-4 right-4 text-white text-3xl hover:opacity-70 transition-opacity'
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
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
              <div className='px-zen-md py-zen-xs bg-gold/10 text-gold border border-gold/20 rounded-lg text-sm font-medium'>
                {artwork.price.toLocaleString()}원
              </div>
            )}
          </div>

          <div className='flex items-center gap-zen-md text-sm text-ink-light flex-wrap'>
            <div className='flex items-center gap-zen-xs'>
              <Calendar className='w-4 h-4 text-gold' />
              <span>{artwork.year}년</span>
            </div>

            {artwork.medium && (
              <div className='flex items-center gap-zen-xs'>
                <Palette className='w-4 h-4 text-gold' />
                <span>{artwork.medium}</span>
              </div>
            )}

            {artwork.dimensions && (
              <div className='flex items-center gap-zen-xs'>
                <Ruler className='w-4 h-4 text-gold' />
                <span>{artwork.dimensions}</span>
              </div>
            )}
          </div>
        </div>

        {/* 작품 설명 - 타이포그래피 개선 */}
        {artwork.description && (
          <div>
            <h3 className='text-lg font-medium text-ink mb-zen-sm'>
              작품 설명
            </h3>
            <p className='text-base text-ink-light leading-relaxed'>
              {artwork.description}
            </p>
          </div>
        )}

        {/* 작가노트(artistNote) - 타이포그래피 개선 */}
        {artwork.artistNote && (
          <div>
            <h3 className='text-lg font-medium text-ink mb-zen-sm'>작가노트</h3>
            <p className='text-base text-ink-light leading-relaxed whitespace-pre-line'>
              {artwork.artistNote}
            </p>
          </div>
        )}

        {artwork.tags && artwork.tags.length > 0 && (
          <div className='space-y-zen-sm'>
            <h3 className='text-lg font-medium text-ink'>태그</h3>
            <div className='flex flex-wrap gap-zen-sm'>
              {artwork.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className='px-zen-md py-zen-xs bg-stone/10 text-ink border border-stone/20 rounded-lg text-sm'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
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
        <div className='lg:col-span-2 mt-zen-2xl'>
          <div className='mb-zen-lg'>
            <h2 className='text-xl font-semibold text-ink mb-zen-sm'>
              다른 작품들
            </h2>
            <p className='text-base text-ink-light'>
              아남의 다른 작품들을 감상해보세요
            </p>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-zen-md'>
            {recommendedArtworks.map((recommendedArtwork: any) => (
              <Link
                key={recommendedArtwork.id}
                href={`/gallery/${recommendedArtwork.slug}`}
                className='group block bg-paper border border-stone/20 rounded-xl overflow-hidden zen-hover-scale'
              >
                <div className='relative aspect-square overflow-hidden'>
                  <Image
                    src={recommendedArtwork.imageUrl}
                    alt={recommendedArtwork.title}
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
        </div>
      )}
    </div>
  )
}

