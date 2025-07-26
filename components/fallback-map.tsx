'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink, MapPin } from 'lucide-react'

interface FallbackMapProps {
  latitude: number
  longitude: number
  placeName: string
  address: string
  className?: string
}

export default function FallbackMap({
  latitude,
  longitude,
  placeName,
  address,
  className = 'w-full h-96',
}: FallbackMapProps) {
  // const kakaoMapUrl = `https://map.kakao.com/link/map/${placeName},${latitude},${longitude}`;
  const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

  return (
    <div
      className={`${className} bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700`}
    >
      <div className='h-full flex flex-col items-center justify-center p-6 text-center'>
        {/* 지도 아이콘 */}
        <div className='relative mb-4'>
          <div className='w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg'>
            <MapPin className='w-8 h-8 text-white' />
          </div>
          <div className='absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-pulse'></div>
        </div>

        {/* 장소 정보 */}
        <div className='space-y-2 mb-6'>
          <h3 className='text-lg font-bold text-gray-800 dark:text-gray-200'>
            {placeName}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>{address}</p>
          <div className='text-xs text-gray-500 dark:text-gray-500'>
            위도: {latitude} | 경도: {longitude}
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4'>
          <p className='text-sm text-yellow-700 dark:text-yellow-300'>
            <strong>🗺️ 지도 로딩 중...</strong>
            <br />
            카카오맵을 불러오는 중입니다.
            <br />
            잠시만 기다려주세요.
          </p>
        </div>

        {/* 외부 지도 링크 */}
        <div className='flex flex-col sm:flex-row gap-3 w-full max-w-xs'>
          {/* <Button asChild variant="outline" size="sm">
            <a
              href={kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              카카오맵
            </a>
          </Button> */}
          <Button asChild variant='outline' size='sm'>
            <a
              href={googleMapUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors'
            >
              <ExternalLink className='w-4 h-4' />
              구글맵
            </a>
          </Button>
        </div>

        {/* 교통 정보 */}
        <div className='mt-6 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md'>
          <h4 className='font-medium text-gray-800 dark:text-gray-200 mb-2'>
            🚇 교통 안내
          </h4>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            지하철 3호선 안국역 6번 출구
            <br />
            도보 5분 거리
          </p>
        </div>
      </div>
    </div>
  )
}
