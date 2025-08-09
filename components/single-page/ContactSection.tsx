'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: '📧',
      title: '이메일',
      value: 'heelang@orientalcalligraphy.org',
      link: 'mailto:heelang@orientalcalligraphy.org'
    },
    {
      icon: '📱',
      title: '전화',
      value: '+82-2-1234-5678',
      link: 'tel:+8221234567'
    },
    {
      icon: '🏠',
      title: '주소',
      value: '서울시 강남구 서예로 123',
      link: null
    },
    {
      icon: '🌐',
      title: '웹사이트',
      value: 'orientalcalligraphy.org',
      link: 'https://orientalcalligraphy.org'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-zen-md">
      {/* Section header */}
      <motion.div
        className="text-center mb-zen-xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="font-calligraphy font-bold text-ink text-3xl md:text-4xl mb-zen-sm">
          연락하기
        </h2>
        <p className="font-display text-ink-light text-lg">
          Contact • お問い合わせ
        </p>
        <div className="mt-zen-sm flex justify-center">
          <div className="w-24 h-1 bg-gold"></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-zen-xl">
        {/* Contact information */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="font-calligraphy font-bold text-ink text-2xl mb-zen-lg">
            문의 정보
          </h3>

          <div className="space-y-zen-md mb-zen-xl">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                className="
                  flex items-center p-zen-md bg-paper border-2 border-ink
                  shadow-brutal-sm hover:shadow-brutal
                  transition-all duration-300 group
                "
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ x: 4 }}
              >
                <span className="text-2xl mr-zen-md">{item.icon}</span>
                <div className="flex-1">
                  <h4 className="font-display font-semibold text-ink text-sm mb-1">
                    {item.title}
                  </h4>
                  {item.link ? (
                    <a 
                      href={item.link}
                      className="font-display text-ink-light hover:text-gold transition-colors duration-300"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-display text-ink-light">{item.value}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional contact info */}
          <motion.div
            className="bg-paper-warm p-zen-lg border-4 border-ink shadow-brutal"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h4 className="font-display font-semibold text-ink mb-zen-md">
              작품 문의 및 전시 협력
            </h4>
            <div className="space-y-zen-sm text-sm text-ink-light">
              <p>• 작품 구입 및 전시 대여 문의</p>
              <p>• 워크샵 및 강의 협력 제안</p>
              <p>• 문화 교류 및 전시 기획 협력</p>
              <p>• 미디어 인터뷰 및 출간 관련 문의</p>
            </div>
            
            <div className="mt-zen-md pt-zen-md border-t border-ink/20">
              <p className="font-display text-ink-light text-xs">
                문의 응답 시간: 평일 2-3일 내 회신<br />
                급한 문의는 전화로 연락 부탁드립니다.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Contact form */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="font-calligraphy font-bold text-ink text-2xl mb-zen-lg">
            메시지 보내기
          </h3>

          <form onSubmit={handleSubmit} className="space-y-zen-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-zen-md">
              <div>
                <label className="block font-display font-medium text-ink mb-zen-xs">
                  이름 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="
                    w-full px-zen-sm py-zen-sm border-2 border-ink
                    bg-paper focus:bg-paper-warm
                    font-display text-ink
                    focus:outline-none focus:border-gold
                    transition-colors duration-300
                  "
                />
              </div>
              
              <div>
                <label className="block font-display font-medium text-ink mb-zen-xs">
                  이메일 *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="
                    w-full px-zen-sm py-zen-sm border-2 border-ink
                    bg-paper focus:bg-paper-warm
                    font-display text-ink
                    focus:outline-none focus:border-gold
                    transition-colors duration-300
                  "
                />
              </div>
            </div>

            <div>
              <label className="block font-display font-medium text-ink mb-zen-xs">
                전화번호
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="
                  w-full px-zen-sm py-zen-sm border-2 border-ink
                  bg-paper focus:bg-paper-warm
                  font-display text-ink
                  focus:outline-none focus:border-gold
                  transition-colors duration-300
                "
              />
            </div>

            <div>
              <label className="block font-display font-medium text-ink mb-zen-xs">
                문의 유형 *
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="
                  w-full px-zen-sm py-zen-sm border-2 border-ink
                  bg-paper focus:bg-paper-warm
                  font-display text-ink
                  focus:outline-none focus:border-gold
                  transition-colors duration-300
                "
              >
                <option value="">문의 유형을 선택해주세요</option>
                <option value="작품 문의">작품 구입 문의</option>
                <option value="전시 협력">전시 협력 제안</option>
                <option value="워크샵 문의">워크샵 및 강의 문의</option>
                <option value="미디어 문의">미디어 인터뷰 문의</option>
                <option value="기타">기타 문의</option>
              </select>
            </div>

            <div>
              <label className="block font-display font-medium text-ink mb-zen-xs">
                메시지 내용 *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="
                  w-full px-zen-sm py-zen-sm border-2 border-ink
                  bg-paper focus:bg-paper-warm
                  font-display text-ink
                  focus:outline-none focus:border-gold
                  transition-colors duration-300
                  resize-vertical
                "
                placeholder="문의 내용을 자세히 작성해주세요..."
              />
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full px-zen-lg py-zen-md
                bg-ink text-paper font-display font-bold
                hover:bg-gold hover:text-ink
                disabled:bg-ink/50 disabled:cursor-not-allowed
                transition-all duration-300
                shadow-brutal hover:shadow-brutal-strong
                transform hover:-translate-x-1 hover:-translate-y-1
                border-4 border-ink hover:border-gold
                disabled:transform-none disabled:shadow-brutal
              "
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? '전송 중...' : '메시지 보내기'}
            </motion.button>

            {/* Status messages */}
            {submitStatus === 'success' && (
              <motion.div
                className="p-zen-md bg-green-100 border-2 border-green-500 text-green-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-display">
                  ✅ 메시지가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.
                </p>
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                className="p-zen-md bg-red-100 border-2 border-red-500 text-red-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-display">
                  ❌ 메시지 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                </p>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>

      {/* Footer message */}
      <motion.div
        className="text-center mt-zen-2xl pt-zen-xl border-t-2 border-ink/20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="bg-paper p-zen-xl border-4 border-ink shadow-brutal max-w-4xl mx-auto">
          <h3 className="font-calligraphy font-bold text-ink text-xl mb-zen-md">
            함께하는 서예 문화
          </h3>
          
          <p className="font-display text-ink leading-relaxed mb-zen-md">
            서예는 혼자 하는 예술이 아닙니다. 전통을 이어가며 새로운 가치를 창조해 나가는 
            모든 분들과 함께 소통하고 협력하고 싶습니다.
          </p>
          
          <div className="flex items-center justify-center gap-zen-sm">
            <div className="w-8 h-px bg-gold" />
            <span className="font-calligraphy text-ink font-medium text-sm">
              和而不同
            </span>
            <div className="w-8 h-px bg-gold" />
          </div>
          
          <p className="font-display text-ink-light text-sm mt-zen-sm">
            화합하되 같지 않다 - 다양성 속의 조화
          </p>
        </div>
      </motion.div>
    </div>
  )
}