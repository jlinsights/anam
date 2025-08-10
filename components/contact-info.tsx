'use client'

import { Clock, Loader2, Mail, MapPin, Phone, Globe } from 'lucide-react'

interface ContactInfoProps {
  className?: string
}

export function ContactInfo({ className = '' }: ContactInfoProps) {
  const [artist, setArtist] = useState<Artist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArtist() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/artist')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success && result.data) {
          setArtist(result.data)
        } else {
          console.warn('Failed to fetch artist data:', result.message)
          setError('작가 정보를 불러올 수 없습니다.')
        }
      } catch (error) {
        console.error('Error fetching artist data:', error)
        setError('연락처 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtist()
  }, [])

  if (isLoading) {
    return (
      <div className={`contact-card-balanced ${className}`}>
        <div className='flex items-center gap-zen-sm mb-zen-md'>
          <div className='p-zen-xs bg-gold/10 rounded-lg'>
            <Mail className='w-4 h-4 text-gold' />
          </div>
          <h2 className='text-sm font-medium text-ink dark:text-neutral-100'>
            연락처 정보
          </h2>
        </div>
        <div className='flex items-center justify-center py-zen-lg flex-1'>
          <Loader2 className='w-4 h-4 animate-spin text-gold' />
          <span className='ml-zen-sm text-xs text-ink-light dark:text-neutral-300'>
            연락처 정보를 불러오는 중...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`contact-card-balanced ${className}`}>
        <div className='flex items-center gap-zen-sm mb-zen-md'>
          <div className='p-zen-xs bg-gold/10 rounded-lg'>
            <Mail className='w-4 h-4 text-gold' />
          </div>
          <h2 className='text-sm font-medium text-ink dark:text-neutral-100'>
            연락처 정보
          </h2>
        </div>
        <div className='flex items-center justify-center py-zen-lg flex-1'>
          <div className='text-center'>
            <p className='text-xs text-ink-light dark:text-neutral-300 mb-zen-sm'>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className='text-xs text-gold hover:text-gold/80 underline'
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className={`contact-card-balanced ${className}`}>
        {/* 헤더 */}
        <div className='flex items-center gap-zen-sm mb-zen-md'>
          <div className='p-zen-xs bg-gold/10 rounded-lg'>
            <Mail className='w-4 h-4 text-gold' />
          </div>
          <h2 className='text-sm font-medium text-ink dark:text-neutral-100'>
            연락처 정보
          </h2>
        </div>

        {/* 연락처 정보 목록 */}
        <div className='space-y-zen-md flex-1'>
          {/* 이메일 */}
          <ContactItem
            icon={<Mail className='w-4 h-4 text-blue-600' />}
            iconBg='bg-blue-50 dark:bg-blue-900/20'
            title='이메일'
            content={artist?.email || '이메일 정보 없음'}
            link={artist?.email ? `mailto:${artist.email}` : undefined}
          />

          {/* 전화번호 */}
          <ContactItem
            icon={<Phone className='w-4 h-4 text-green-600' />}
            iconBg='bg-green-50 dark:bg-green-900/20'
            title='전화번호'
            content={artist?.phone || '전화번호 정보 없음'}
            link={artist?.phone ? `tel:${artist.phone}` : undefined}
            className='contact-phone-number'
          />

          {/* 주소 */}
          <ContactItem
            icon={<MapPin className='w-4 h-4 text-purple-600' />}
            iconBg='bg-purple-50 dark:bg-purple-900/20'
            title='주소'
            content={artist?.currentLocation || '주소 정보 없음'}
          />

          {/* 운영시간 */}
          <ContactItem
            icon={<Clock className='w-4 h-4 text-orange-600' />}
            iconBg='bg-orange-50 dark:bg-orange-900/20'
            title='운영시간'
            content='월-금: 10:00 - 18:00\n토-일: 10:00 - 17:00'
          />

          {/* 웹사이트 */}
          {artist?.website && (
            <ContactItem
              icon={<Globe className='w-4 h-4 text-indigo-600' />}
              iconBg='bg-indigo-50 dark:bg-indigo-900/20'
              title='웹사이트'
              content={artist.website}
              link={artist.website}
            />
          )}
        </div>

        {/* 하단 안내 */}
        <div className='mt-zen-md pt-zen-md border-t border-border/50'>
          <p className='text-xs text-ink-light dark:text-neutral-300 text-center'>
            문의사항이 있으시면 언제든지 연락해 주세요.
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
}

interface ContactItemProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  content: React.ReactNode
  link?: string
  isExternal?: boolean
  className?: string
}

function ContactItem({
  icon,
  iconBg,
  title,
  content,
  link,
  isExternal = false,
  className,
}: ContactItemProps) {
  const contentElement = (
    <div className='flex items-start gap-zen-md void-breathing'>
      <div className={`p-zen-xs ${iconBg} rounded-lg mt-zen-xs`}>{icon}</div>
      <div className='flex-1'>
        <p className='text-base text-ink font-medium dark:text-neutral-100'>
          {title}
        </p>
        {typeof content === 'string' ? (
          <p className='text-sm text-ink-light dark:text-neutral-300 void-minimal'>
            {content}
          </p>
        ) : (
          content
        )}
      </div>
    </div>
  )

  if (link) {
    return (
      <a
        href={link}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className='block hover:scale-[1.02] transition-transform duration-200'
      >
        {contentElement}
      </a>
    )
  }

  return contentElement
}

