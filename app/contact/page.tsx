'use client'

import { ArtNavigation, NavigationSpacer } from '@/components/art-navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Clock, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useState } from 'react'

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
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

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

  return (
    <div className='min-h-screen bg-background'>
      <ArtNavigation />
      <NavigationSpacer />

      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-6xl mx-auto'>
          {/* 페이지 헤더 */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-foreground mb-4'>
              문의하기
            </h1>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              작품 구매, 전시 관련 문의, 기타 궁금한 사항이 있으시면 언제든지
              연락해 주세요.
            </p>
          </div>

          <div className='grid lg:grid-cols-2 gap-8'>
            {/* 연락처 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Mail className='w-5 h-5 text-primary' />
                  연락처 정보
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex items-start gap-3'>
                  <Mail className='w-5 h-5 text-primary mt-1' />
                  <div>
                    <p className='font-medium'>이메일</p>
                    <p className='text-muted-foreground'>
                      heelang@orientalcalligraphy.org
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <Phone className='w-5 h-5 text-primary mt-1' />
                  <div>
                    <p className='font-medium'>전화번호</p>
                    <p className='text-muted-foreground'>010-6877-0406</p>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <MapPin className='w-5 h-5 text-primary mt-1' />
                  <div>
                    <p className='font-medium'>주소</p>
                    <p className='text-muted-foreground'>
                      〶10068 경기 김포시 김포한강8로 173-88, 611동 602호
                      (마산동, 한강신도시 동일스위트 더파크뷰 1단지)
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <Clock className='w-5 h-5 text-primary mt-1' />
                  <div>
                    <p className='font-medium'>운영시간</p>
                    <p className='text-muted-foreground'>
                      월-금: 10:00 - 18:00
                      <br />
                      토-일: 10:00 - 17:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 문의 폼 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Send className='w-5 h-5 text-primary' />
                  문의 사항 입력 후 전송하기
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='name'>이름 *</Label>
                      <Input
                        id='name'
                        name='name'
                        type='text'
                        placeholder='이름을 입력해주세요'
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='phone'>전화번호</Label>
                      <Input
                        id='phone'
                        name='phone'
                        type='tel'
                        placeholder='전화번호를 입력해주세요'
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='email'>이메일 *</Label>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      placeholder='이메일을 입력해주세요'
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='subject'>제목 *</Label>
                    <Input
                      id='subject'
                      name='subject'
                      type='text'
                      placeholder='문의 제목을 입력해주세요'
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='message'>문의 내용 *</Label>
                    <Textarea
                      id='message'
                      name='message'
                      placeholder='문의 내용을 자세히 입력해주세요'
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type='submit'
                    className='w-full'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        전송 중...
                      </>
                    ) : (
                      <>
                        <Send className='w-4 h-4 mr-2' />
                        문의 보내기
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
