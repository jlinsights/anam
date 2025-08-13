'use client'

import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { WifiOff, RefreshCw, Home, Image, User, Wifi } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-paper via-paper-light to-paper'>
      <Card className='w-full max-w-lg text-center shadow-xl border-ink/10'>
        <CardHeader className='space-y-4'>
          <div className='mx-auto w-20 h-20 bg-gradient-to-br from-ink/5 to-ink/10 rounded-full flex items-center justify-center'>
            <WifiOff className='w-10 h-10 text-ink/40' />
          </div>
          <CardTitle className='text-3xl font-bold text-ink'>
            오프라인 상태
          </CardTitle>
          <CardDescription className='text-ink/60 text-base'>
            인터넷 연결이 끊어졌습니다.
            <br />
            캐시된 콘텐츠로 갤러리를 계속 감상하실 수 있습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* 오프라인 가능 기능 */}
          <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
            <h3 className='font-semibold text-green-800 mb-3 flex items-center gap-2'>
              <span className='text-green-600'>✓</span>
              오프라인에서 이용 가능
            </h3>
            <ul className='text-left space-y-2 text-sm text-green-700'>
              <li className='flex items-center gap-2'>
                <Image className='w-4 h-4' />
                이전에 본 작품 갤러리
              </li>
              <li className='flex items-center gap-2'>
                <User className='w-4 h-4' />
                작가 프로필 및 이력
              </li>
              <li className='flex items-center gap-2'>
                <span className='w-4 h-4 flex items-center justify-center text-xs'>💾</span>
                캐시된 모든 콘텐츠
              </li>
            </ul>
          </div>

          {/* 제한된 기능 */}
          <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
            <h3 className='font-semibold text-amber-800 mb-3 flex items-center gap-2'>
              <span className='text-amber-600'>⚠</span>
              온라인 연결 필요
            </h3>
            <ul className='text-left space-y-1 text-sm text-amber-700'>
              <li>• 새로운 작품 업데이트</li>
              <li>• 문의 폼 즉시 전송</li>
              <li>• 실시간 전시 정보</li>
            </ul>
            <p className='text-xs text-amber-600 mt-2 italic'>
              * 문의 폼은 오프라인에서도 작성 가능하며, 온라인 복구 시 자동 전송됩니다.
            </p>
          </div>

          {/* 액션 버튼들 */}
          <div className='space-y-3'>
            <Button
              onClick={() => window.location.reload()}
              className='w-full bg-ink hover:bg-ink/90'
              size='lg'
            >
              <RefreshCw className='w-4 h-4 mr-2' />
              연결 상태 다시 확인
            </Button>

            <div className='grid grid-cols-2 gap-3'>
              <Button asChild variant='outline' className='w-full'>
                <Link href='/'>
                  <Home className='w-4 h-4 mr-2' />
                  홈으로
                </Link>
              </Button>

              <Button asChild variant='outline' className='w-full'>
                <Link href='/gallery'>
                  <Image className='w-4 h-4 mr-2' />
                  갤러리
                </Link>
              </Button>
            </div>

            <Button asChild variant='ghost' className='w-full text-ink/60'>
              <Link href='/artist'>
                <User className='w-4 h-4 mr-2' />
                작가 소개
              </Link>
            </Button>
          </div>

          {/* 추가 정보 */}
          <div className='pt-4 border-t border-ink/10'>
            <div className='flex items-center justify-center gap-2 text-sm text-ink/50 mb-2'>
              <Wifi className='w-4 h-4' />
              <span>네트워크 연결 도움말</span>
            </div>
            <p className='text-xs text-ink/40 leading-relaxed'>
              Wi-Fi나 모바일 데이터 연결을 확인하거나,
              <br />
              기기의 네트워크 설정을 다시 확인해보세요.
              <br />
              문제가 지속되면 잠시 후 다시 시도해주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const dynamic = 'force-static'

