'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { WifiOff, RefreshCw, Home, Image } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-paper via-paper-light to-paper'>
      <Card className='w-full max-w-md text-center shadow-xl border-ink/10'>
        <CardHeader className='space-y-4'>
          <div className='mx-auto w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center'>
            <WifiOff className='w-8 h-8 text-ink/40' />
          </div>
          <CardTitle className='text-2xl font-bold text-ink'>
            인터넷 연결 없음
          </CardTitle>
          <CardDescription className='text-ink/60'>
            현재 오프라인 상태입니다.
            <br />
            인터넷 연결을 확인한 후 다시 시도해주세요.
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            <Button
              onClick={() => window.location.reload()}
              className='w-full'
              variant='default'
            >
              <RefreshCw className='w-4 h-4 mr-2' />
              다시 시도
            </Button>

            <Button asChild variant='outline' className='w-full'>
              <Link href='/'>
                <Home className='w-4 h-4 mr-2' />
                홈으로 가기
              </Link>
            </Button>

            <Button asChild variant='ghost' className='w-full'>
              <Link href='/gallery'>
                <Image className='w-4 h-4 mr-2' />
                갤러리 보기
              </Link>
            </Button>
          </div>

          <div className='pt-4 border-t border-ink/10'>
            <p className='text-sm text-ink/50'>
              서예 작품들은 오프라인에서도
              <br />
              캐시된 버전으로 감상하실 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const dynamic = 'force-static'
