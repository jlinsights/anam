'use client'

import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
import { ZenBrutalistHero } from '@/components/zen-brutalist-hero'
import { ZenBrutalistFooter } from '@/components/zen-brutalist-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import type { Artist } from '@/lib/types'
import { Clock, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [isLoadingArtist, setIsLoadingArtist] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    setMousePosition({ x, y })
  }, [])

  // Artist 정보 가져오기
  useEffect(() => {
    async function fetchArtist() {
      try {
        const response = await fetch('/api/artist')
        const result = await response.json()
        
        if (result.success && result.data) {
          setArtist(result.data)
        } else {
          console.warn('Failed to fetch artist data:', result.message)
        }
      } catch (error) {
        console.error('Error fetching artist data:', error)
      } finally {
        setIsLoadingArtist(false)
      }
    }

    fetchArtist()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: '문의 전송 완료',
          description:
            '문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.',
          duration: 5000,
        })

        // 폼 초기화
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        })
      } else {
        toast({
          title: '전송 실패',
          description: result.message || '문의 전송 중 오류가 발생했습니다.',
          variant: 'destructive',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast({
        title: '전송 실패',
        description: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'destructive',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Dynamic background based on mouse position
  const dynamicBackground = {
    background: `radial-gradient(
      circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
      hsla(var(--season-spring) / 0.1) 0%,
      hsla(var(--season-summer) / 0.08) 25%,
      hsla(var(--season-autumn) / 0.12) 50%,
      hsla(var(--season-winter) / 0.06) 75%,
      transparent 100%
    )`
  }

  return (
    <div 
      ref={containerRef}
      className='min-h-screen bg-paper relative overflow-hidden flex flex-col'
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Zen Brutalism Foundation Background Effects */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute inset-0 zen-breathe-deep opacity-2' />
        <div className='absolute inset-0 ink-flow-ambient opacity-1' />
        <div 
          className={`absolute inset-0 transition-opacity duration-2000 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          style={dynamicBackground}
        />
      </div>

      <ArtNavigation />
      
      {/* Zen Brutalist Hero for Contact Page */}
      <ZenBrutalistHero
        phase="3"
        title={{
          main: "문의하기",
          sub: "CONTACT US",
          english: "Get in Touch"
        }}
        description={{
          primary: "작품 구매, 전시 관련 문의, 기타 궁금한 사항이 있으시면 언제든지 연락해 주세요",
          secondary: "전통 서예의 아름다움과 작가의 철학에 대해 더 자세히 알고 싶으시다면 언제든 연락주세요"
        }}
        concept="ARTIST CONTACT"
        navigation={{
          prev: { href: '/exhibition', label: '전시 정보' },
          demo: { href: '/zen-demo', label: 'Zen 체험' }
        }}
        variant="fusion"
        enableInteraction={true}
        className="min-h-[60vh]"
      />

      <NavigationSpacer />

      <main className='section-padding relative z-10 flex-1'>
        <div className='zen-brutalist-layout'>

          <div className='grid lg:grid-cols-2 gap-zen-2xl temporal-depth'>
            {/* 연락처 정보 */}
            <div className='zen-brutalist-card glass-layer-1 zen-hover-scale void-contemplative'>
              <div className='flex items-center gap-zen-md mb-zen-lg'>
                <div className='p-zen-sm bg-gold/10 rounded-lg'>
                  <Mail className='w-5 h-5 text-gold' />
                </div>
                <h2 className='zen-typography-section text-ink stroke-horizontal'>
                  연락처 정보
                </h2>
              </div>
              <div className='space-y-zen-lg'>
                {isLoadingArtist ? (
                  <div className='flex items-center justify-center py-zen-2xl'>
                    <Loader2 className='w-6 h-6 animate-spin text-gold' />
                    <span className='ml-zen-sm zen-typography-body text-ink-light'>연락처 정보를 불러오는 중...</span>
                  </div>
                ) : (
                  <>
                    {artist?.email && (
                      <div className='flex items-start gap-zen-md void-breathing'>
                        <div className='p-zen-xs bg-blue-50 rounded-lg mt-zen-xs'>
                          <Mail className='w-4 h-4 text-blue-600' />
                        </div>
                        <div>
                          <p className='zen-typography-body text-ink font-medium'>이메일</p>
                          <p className='zen-typography-body text-ink-light void-minimal'>
                            {artist.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {artist?.phone && (
                      <div className='flex items-start gap-zen-md void-breathing'>
                        <div className='p-zen-xs bg-green-50 rounded-lg mt-zen-xs'>
                          <Phone className='w-4 h-4 text-green-600' />
                        </div>
                        <div>
                          <p className='zen-typography-body text-ink font-medium'>전화번호</p>
                          <p className='zen-typography-body text-ink-light void-minimal'>{artist.phone}</p>
                        </div>
                      </div>
                    )}

                    {artist?.currentLocation && (
                      <div className='flex items-start gap-zen-md void-breathing'>
                        <div className='p-zen-xs bg-purple-50 rounded-lg mt-zen-xs'>
                          <MapPin className='w-4 h-4 text-purple-600' />
                        </div>
                        <div>
                          <p className='zen-typography-body text-ink font-medium'>주소</p>
                          <p className='zen-typography-body text-ink-light void-minimal'>
                            {artist.currentLocation}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className='flex items-start gap-zen-md void-breathing'>
                      <div className='p-zen-xs bg-orange-50 rounded-lg mt-zen-xs'>
                        <Clock className='w-4 h-4 text-orange-600' />
                      </div>
                      <div>
                        <p className='zen-typography-body text-ink font-medium'>운영시간</p>
                        <p className='zen-typography-body text-ink-light void-minimal'>
                          월-금: 10:00 - 18:00
                          <br />
                          토-일: 10:00 - 17:00
                        </p>
                      </div>
                    </div>

                    {artist?.website && (
                      <div className='flex items-start gap-zen-md void-breathing'>
                        <div className='p-zen-xs bg-indigo-50 rounded-lg mt-zen-xs'>
                          <Mail className='w-4 h-4 text-indigo-600' />
                        </div>
                        <div>
                          <p className='zen-typography-body text-ink font-medium'>웹사이트</p>
                          <a 
                            href={artist.website} 
                            target='_blank' 
                            rel='noopener noreferrer'
                            className='zen-typography-body text-gold hover:text-ink transition-colors zen-hover-scale'
                          >
                            {artist.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 문의 폼 */}
            <div className='zen-brutalist-card glass-layer-2 zen-hover-scale void-contemplative'>
              <div className='flex items-center gap-zen-md mb-zen-lg'>
                <div className='p-zen-sm bg-gold/10 rounded-lg'>
                  <Send className='w-5 h-5 text-gold' />
                </div>
                <h2 className='zen-typography-section text-ink stroke-horizontal'>
                  문의 사항 입력 후 전송하기
                </h2>
              </div>
              <form onSubmit={handleSubmit} className='space-y-zen-lg'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-zen-lg'>
                  <div className='space-y-zen-sm void-breathing'>
                    <Label htmlFor='name' className='zen-typography-body text-ink font-medium'>이름 *</Label>
                    <Input
                      id='name'
                      name='name'
                      type='text'
                      placeholder='이름을 입력해주세요'
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className='zen-brutalist-input'
                    />
                  </div>

                  <div className='space-y-zen-sm void-breathing'>
                    <Label htmlFor='phone' className='zen-typography-body text-ink font-medium'>전화번호</Label>
                    <Input
                      id='phone'
                      name='phone'
                      type='tel'
                      placeholder='전화번호를 입력해주세요'
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className='zen-brutalist-input'
                    />
                  </div>
                </div>

                <div className='space-y-zen-sm void-breathing'>
                  <Label htmlFor='email' className='zen-typography-body text-ink font-medium'>이메일 *</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    placeholder='이메일을 입력해주세요'
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className='zen-brutalist-input'
                  />
                </div>

                <div className='space-y-zen-sm void-breathing'>
                  <Label htmlFor='subject' className='zen-typography-body text-ink font-medium'>제목 *</Label>
                  <Input
                    id='subject'
                    name='subject'
                    type='text'
                    placeholder='문의 제목을 입력해주세요'
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className='zen-brutalist-input'
                  />
                </div>

                <div className='space-y-zen-sm void-breathing'>
                  <Label htmlFor='message' className='zen-typography-body text-ink font-medium'>문의 내용 *</Label>
                  <Textarea
                    id='message'
                    name='message'
                    placeholder='문의 내용을 자세히 입력해주세요'
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    required
                    disabled={isSubmitting}
                    className='zen-brutalist-input'
                  />
                </div>

                <Button
                  type='submit'
                  className='w-full btn-art px-zen-xl py-zen-lg brutal-shadow zen-hover-scale'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-zen-sm animate-spin' />
                      전송 중...
                    </>
                  ) : (
                    <>
                      <Send className='w-4 h-4 mr-zen-sm' />
                      문의 보내기
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Zen Brutalist Footer */}
      <ZenBrutalistFooter 
        variant="fusion" 
        showPhaseNavigation={true} 
        enableInteraction={true}
      />
    </div>
  )
}
