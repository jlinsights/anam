'use client'

import { Button } from '@/components/ui/button'
import { Share } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ArtworkDetailClientProps {
  title: string
  slug: string
}

export function ArtworkDetailClient({ title, slug }: ArtworkDetailClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleShare = async () => {
    const shareData = {
      title: `${title} - 아남 배옥영`,
      text: `아남 배옥영 작가의 작품 "${title}"을 감상해보세요.`,
      url: `${window.location.origin}/gallery/${slug}`,
    }

    try {
      if (navigator.share && mounted) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url)
        alert('링크가 클립보드에 복사되었습니다!')
      }
    } catch (error) {
      console.error('공유 실패:', error)
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url)
        alert('링크가 클립보드에 복사되었습니다!')
      } catch (clipboardError) {
        console.error('클립보드 복사 실패:', clipboardError)
      }
    }
  }

  if (!mounted) {
    return (
      <Button variant='outline' size='sm' disabled>
        <Share className='w-4 h-4 mr-2' />
        공유하기
      </Button>
    )
  }

  return (
    <Button variant='outline' size='sm' onClick={handleShare}>
      <Share className='w-4 h-4 mr-2' />
      공유하기
    </Button>
  )
}
