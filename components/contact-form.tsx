'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ErrorBoundary } from '@/components/error-boundary'
import { Loader2, Send } from 'lucide-react'

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

interface ContactFormProps {
  className?: string
}

export function ContactForm({ className = '' }: ContactFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

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
      // Handle AbortError (request was cancelled)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Contact form submission was cancelled')
        return
      }
      
      console.error('Form submission error:', error)
      toast({
        title: '전송 실패',
        description: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        variant: 'destructive',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
      abortControllerRef.current = null
    }
  }

  return (
    <ErrorBoundary>
      <div className={`contact-card-balanced ${className}`}>
        {/* 헤더 */}
        <div className='flex items-center gap-zen-sm mb-zen-md'>
          <div className='p-zen-xs bg-gold/10 rounded-lg'>
            <Send className='w-4 h-4 text-gold' />
          </div>
          <h2 className='text-sm font-medium text-ink dark:text-neutral-100'>
            문의사항
          </h2>
        </div>

        {/* 폼 */}
        <form
          onSubmit={handleSubmit}
          className='contact-form-compact flex-1 flex flex-col'
        >
          {/* 이름 */}
          <FormField
            id='name'
            label='이름'
            name='name'
            type='text'
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder='이름을 입력해주세요'
          />

          {/* 이메일 */}
          <FormField
            id='email'
            label='이메일'
            name='email'
            type='email'
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder='이메일을 입력해주세요'
          />

          {/* 전화번호 */}
          <FormField
            id='phone'
            label='전화번호'
            name='phone'
            type='tel'
            value={formData.phone}
            onChange={handleInputChange}
            placeholder='전화번호를 입력해주세요 (선택사항)'
          />

          {/* 제목 */}
          <FormField
            id='subject'
            label='제목'
            name='subject'
            type='text'
            value={formData.subject}
            onChange={handleInputChange}
            required
            placeholder='문의 제목을 입력해주세요'
          />

          {/* 메시지 */}
          <FormField
            id='message'
            label='메시지'
            name='message'
            type='textarea'
            value={formData.message}
            onChange={handleInputChange}
            required
            placeholder='문의 내용을 자세히 입력해주세요'
            rows={5}
          />

          {/* 제출 버튼 */}
          <div className='mt-zen-lg'>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='w-full contact-submit-button'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-zen-sm animate-spin' />
                  전송 중...
                </>
              ) : (
                <>
                  <Send className='w-4 h-4 mr-zen-sm' />
                  문의 전송
                </>
              )}
            </Button>
          </div>
        </form>

        {/* 하단 안내 */}
        <div className='mt-zen-md pt-zen-md border-t border-border/50'>
          <p className='text-xs text-ink-light dark:text-neutral-300 text-center'>
            문의하신 내용은 빠른 시일 내에 답변드리겠습니다.
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
}

interface FormFieldProps {
  id: string
  name: string
  type: 'text' | 'email' | 'tel' | 'textarea'
  label: string
  placeholder: string
  value: string
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  required?: boolean
  disabled?: boolean
  rows?: number
}

function FormField({
  id,
  name,
  type,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  rows = 3,
}: FormFieldProps) {
  return (
    <div className='space-y-zen-sm void-breathing'>
      <Label
        htmlFor={id}
        className='text-sm text-ink font-medium dark:text-neutral-100'
      >
        {label} {required && '*'}
      </Label>
      {type === 'textarea' ? (
        <Textarea
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          required={required}
          disabled={disabled}
          className='zen-brutalist-input dark:text-neutral-100 dark:bg-neutral-800 dark:border-neutral-600 dark:placeholder:text-neutral-500'
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className='zen-brutalist-input dark:text-neutral-100 dark:bg-neutral-800 dark:border-neutral-600 dark:placeholder:text-neutral-500'
        />
      )}
    </div>
  )
}

