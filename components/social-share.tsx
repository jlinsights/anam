'use client'

import {
  AccessibleIconButton,
  AccessibleModal,
} from '@/components/accessibility'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Check,
  Download,
  Facebook,
  Instagram,
  Link2,
  Mail,
  MessageCircle,
  Share2,
} from 'lucide-react'
import { useState } from 'react'

interface SocialShareProps {
  title: string
  description: string
  url: string
  imageUrl?: string
  hashtags?: string[]
  className?: string
}

interface SharePlatform {
  name: string
  icon: React.ReactNode
  shareUrl: (data: SocialShareProps) => string
  color: string
}

const sharePlatforms: SharePlatform[] = [
  {
    name: 'Instagram',
    icon: <Instagram className='h-4 w-4' />,
    shareUrl: (data) => {
      // Instagram은 직접 URL 공유가 제한적이므로 모바일에서는 앱으로,
      // 데스크톱에서는 Instagram 웹으로 리다이렉트하여 수동 게시 유도
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)

      if (isIOS || isAndroid) {
        // 모바일: Instagram 앱으로 리다이렉트
        return 'instagram://camera'
      } else {
        // 데스크톱: Instagram 웹으로 리다이렉트
        return 'https://www.instagram.com/'
      }
    },
    color:
      'hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white dark:hover:from-purple-600 dark:hover:to-pink-600',
  },
  {
    name: 'Facebook',
    icon: <Facebook className='h-4 w-4' />,
    shareUrl: (data) => {
      const params = new URLSearchParams({
        u: data.url,
        quote: `${data.title} - ${data.description}`,
      })
      return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
    },
    color: 'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20',
  },
  {
    name: 'KakaoTalk',
    icon: <MessageCircle className='h-4 w-4' />,
    shareUrl: (data) => {
      // 카카오톡 웹 공유 (실제로는 Kakao SDK 필요)
      const text = encodeURIComponent(
        `${data.title}\n${data.description}\n${data.url}`
      )
      return `https://accounts.kakao.com/weblogin/account?continue=${encodeURIComponent(
        `https://story.kakao.com/share?url=${data.url}&text=${text}`
      )}`
    },
    color:
      'hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20',
  },
  {
    name: 'Email',
    icon: <Mail className='h-4 w-4' />,
    shareUrl: (data) => {
      const params = new URLSearchParams({
        subject: data.title,
        body: `${data.description}\n\n${data.url}`,
      })
      return `mailto:?${params.toString()}`
    },
    color: 'hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800/50',
  },
]

export function SocialShare({
  title,
  description,
  url,
  imageUrl,
  hashtags,
  className,
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // 링크 복사 기능
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // 폴백: 텍스트 선택
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 이미지 다운로드 기능
  const downloadImage = async () => {
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download image:', err)
    }
  }

  // Web Share API 지원 확인
  const canUseWebShare =
    typeof navigator !== 'undefined' && 'share' in navigator

  // 네이티브 공유
  const handleNativeShare = async () => {
    if (!canUseWebShare) return

    try {
      await navigator.share({
        title,
        text: description,
        url,
      })
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Failed to share:', err)
        setIsOpen(true) // 폴백으로 모달 열기
      }
    }
  }

  // Instagram 전용 공유 처리
  const handleInstagramShare = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)

    if (isIOS || isAndroid) {
      // 모바일: 이미지 먼저 다운로드 후 Instagram 앱 열기
      if (imageUrl) {
        await downloadImage()
        // 잠시 대기 후 Instagram 앱 열기
        setTimeout(() => {
          window.location.href = 'instagram://camera'
        }, 1000)
      } else {
        window.location.href = 'instagram://camera'
      }
    } else {
      // 데스크톱: 클립보드에 텍스트 복사 후 Instagram 웹 열기
      await copyToClipboard()
      window.open('https://www.instagram.com/', '_blank')

      // 사용자에게 가이드 표시
      alert(
        `📋 링크가 클립보드에 복사되었습니다!\n\nInstagram에서 새 게시물을 작성할 때 붙여넣기(Ctrl+V)로 링크를 추가해주세요.`
      )
    }
  }

  // 플랫폼별 공유
  const handlePlatformShare = (platform: SharePlatform) => {
    if (platform.name === 'Instagram') {
      handleInstagramShare()
      return
    }

    const shareUrl = platform.shareUrl({
      title,
      description,
      url,
      imageUrl,
      hashtags,
    })
    window.open(
      shareUrl,
      '_blank',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    )
  }

  return (
    <div className={className}>
      {/* 공유 버튼 */}
      {canUseWebShare ? (
        <AccessibleIconButton
          icon={<Share2 className='h-4 w-4' />}
          label='공유하기'
          onClick={handleNativeShare}
          className='bg-ink text-white hover:bg-ink/90'
        />
      ) : (
        <AccessibleIconButton
          icon={<Share2 className='h-4 w-4' />}
          label='공유하기'
          onClick={() => setIsOpen(true)}
          className='bg-ink text-white hover:bg-ink/90'
        />
      )}

      {/* 공유 모달 */}
      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='작품 공유하기'
        description='이 작품을 다른 사람들과 공유해보세요'
        className='max-w-md'
      >
        <div className='space-y-6'>
          {/* 소셜 플랫폼 */}
          <div className='space-y-3'>
            <h3 className='font-medium text-sm text-ink-light'>소셜 미디어</h3>
            <div className='grid grid-cols-2 gap-2'>
              {sharePlatforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => handlePlatformShare(platform)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border border-border transition-colors',
                    platform.color
                  )}
                >
                  {platform.icon}
                  <span className='font-medium'>{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 링크 복사 */}
          <div className='space-y-3'>
            <h3 className='font-medium text-sm text-ink-light'>링크 복사</h3>
            <div className='flex gap-2'>
              <input
                type='text'
                value={url}
                readOnly
                className='flex-1 px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-border rounded-md text-sm'
              />
              <Button
                onClick={copyToClipboard}
                size='sm'
                className={cn(
                  'min-w-[80px] transition-colors',
                  copied && 'bg-green-600 hover:bg-green-700'
                )}
              >
                {copied ? (
                  <>
                    <Check className='h-4 w-4 mr-1' />
                    복사됨
                  </>
                ) : (
                  <>
                    <Link2 className='h-4 w-4 mr-1' />
                    복사
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 이미지 다운로드 */}
          {imageUrl && (
            <div className='space-y-3'>
              <h3 className='font-medium text-sm text-ink-light'>
                이미지 저장
              </h3>
              <Button
                onClick={downloadImage}
                variant='outline'
                className='w-full'
              >
                <Download className='h-4 w-4 mr-2' />
                이미지 다운로드
              </Button>
            </div>
          )}

          {/* 공유 팁 */}
          <div className='p-3 bg-stone-50 dark:bg-slate-800 rounded-lg'>
            <p className='text-xs text-ink-light'>
              💡 <strong>Instagram 공유 팁:</strong>
              <br />
              📱 <strong>모바일:</strong> 이미지가 자동으로 다운로드되고
              Instagram 앱이 열립니다.
              <br />
              💻 <strong>데스크톱:</strong> 링크가 복사되며 Instagram 웹에서
              붙여넣기하세요.
              <br />✨ 작품에 대한 개인적인 감상을 함께 적어주시면 더욱 의미있는
              공유가 됩니다.
            </p>
          </div>
        </div>
      </AccessibleModal>
    </div>
  )
}

// 간단한 공유 버튼 (아이콘만)
export function ShareButton({
  title,
  description,
  url,
  imageUrl,
  hashtags,
  variant = 'default',
  size = 'sm',
}: SocialShareProps & {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'lg'
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className='gap-2'
      >
        <Share2 className='h-4 w-4' />
        공유
      </Button>

      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='공유하기'
        className='max-w-sm'
      >
        <SocialShare
          title={title}
          description={description}
          url={url}
          imageUrl={imageUrl}
          hashtags={hashtags}
        />
      </AccessibleModal>
    </>
  )
}
