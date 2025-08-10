'use client'

import { Button } from '@/components/ui/button'
import { Share } from 'lucide-react'

interface ArtworkDetailClientProps {
  title: string
  slug: string
}

export function ArtworkDetailClient({ title, slug }: ArtworkDetailClientProps) {
  const [mounted, setMounted] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleShare = async () => {
    // Prevent multiple concurrent share operations
    if (isSharing) return

    setIsSharing(true)

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

      // Handle specific Web Share API errors
      if (error instanceof Error) {
        if (error.name === 'InvalidStateError') {
          console.warn('Share already in progress, skipping...')
          return
        } else if (error.name === 'AbortError') {
          console.info('User cancelled share')
          return
        }
      }

      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url)
        alert('링크가 클립보드에 복사되었습니다!')
      } catch (clipboardError) {
        console.error('클립보드 복사 실패:', clipboardError)
      }
    } finally {
      // Reset sharing state after a delay to prevent rapid consecutive calls
      setTimeout(() => {
        setIsSharing(false)
      }, 1000)
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
    <Button
      variant='outline'
      size='sm'
      onClick={handleShare}
      disabled={isSharing}
    >
      <Share className='w-4 h-4 mr-2' />
      {isSharing ? '공유 중...' : '공유하기'}
    </Button>
  )
}

