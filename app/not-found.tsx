import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Palette } from 'lucide-react'

// 전역 not-found 페이지
export default function NotFound() {
  return (
    <div className='min-h-screen bg-canvas flex items-center justify-center p-4'>
      <div className='text-center'>
        <Palette className='h-24 w-24 mx-auto text-ink-light mb-6' />
        <h1 className='text-4xl font-bold text-ink mb-4'>404</h1>
        <p className='text-xl text-ink-light mb-8'>
          죄송합니다. 찾으시는 페이지가 존재하지 않습니다.
        </p>
        <Button asChild>
          <Link href='/'>홈으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  )
}

