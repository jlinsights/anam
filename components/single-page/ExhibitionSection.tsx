'use client'

import { motion } from 'framer-motion'

export function ExhibitionSection() {
  const exhibitions = [
    {
      id: 1,
      title: '먹, 그리고... 道',
      subtitle: '아남 배옥영 개인전',
      period: '2026년 4월 15일 ~ 4월 20일',
      time: '오전 10시 - 오후 6시',
      venue: '예술의전당 서울서예박물관',
      room: '제1전시실',
      admission: '무료 관람',
      note: '사전 예약 불필요',
      status: 'upcoming',
      featured: true,
    },
    {
      id: 2,
      title: '전통과 현대의 만남',
      subtitle: '단체전',
      period: '2025년 12월',
      venue: '한국 서예 문화원',
      status: 'upcoming',
    },
    {
      id: 3,
      title: '서예의 새로운 지평',
      subtitle: '아남 배옥영 작품전',
      period: '2025년 8월',
      venue: '갤러리 청담',
      status: 'completed',
    },
  ]

  return (
    <div className='max-w-7xl mx-auto px-zen-md'>
      {/* Section header */}
      <motion.div
        className='text-center mb-zen-xl'
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className='font-calligraphy font-bold text-ink text-3xl md:text-4xl mb-zen-sm'>
          전시 정보
        </h2>
        <p className='font-display text-ink-light text-lg'>
          Exhibition Info • 展示情報
        </p>
        <div className='mt-zen-sm flex justify-center'>
          <div className='w-24 h-1 bg-gold'></div>
        </div>
      </motion.div>

      {/* Featured exhibition */}
      {exhibitions
        .filter((ex) => ex.featured)
        .map((exhibition, index) => (
          <motion.div
            key={exhibition.id}
            className='mb-zen-2xl'
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <div className='bg-paper-warm border-4 border-ink shadow-brutal-strong p-zen-xl'>
              {/* Exhibition title */}
              <div className='text-center mb-zen-xl'>
                <h3 className='font-calligraphy font-bold text-ink text-2xl md:text-3xl mb-zen-sm'>
                  {exhibition.title}
                </h3>
                <p className='font-display text-gold text-lg font-medium'>
                  {exhibition.subtitle}
                </p>

                {exhibition.status === 'upcoming' && (
                  <motion.div
                    className='inline-block mt-zen-sm px-zen-md py-zen-xs bg-gold text-ink font-display font-bold text-sm'
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🎨 개최 예정
                  </motion.div>
                )}
              </div>

              {/* Exhibition details */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-zen-lg mb-zen-xl'>
                <motion.div
                  className='bg-paper p-zen-md border-2 border-ink shadow-brutal-sm'
                  whileHover={{ scale: 1.02, rotate: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className='font-display font-semibold text-ink mb-zen-sm flex items-center'>
                    📅 전시 기간
                  </h4>
                  <p className='font-display text-ink-light mb-1'>
                    {exhibition.period}
                  </p>
                  <p className='font-display text-ink-light text-sm'>
                    {exhibition.time}
                  </p>
                </motion.div>

                <motion.div
                  className='bg-paper p-zen-md border-2 border-ink shadow-brutal-sm'
                  whileHover={{ scale: 1.02, rotate: -0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className='font-display font-semibold text-ink mb-zen-sm flex items-center'>
                    🏛️ 전시 장소
                  </h4>
                  <p className='font-display text-ink-light mb-1'>
                    {exhibition.venue}
                  </p>
                  {exhibition.room && (
                    <p className='font-display text-ink-light text-sm'>
                      {exhibition.room}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  className='bg-paper p-zen-md border-2 border-ink shadow-brutal-sm'
                  whileHover={{ scale: 1.02, rotate: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className='font-display font-semibold text-ink mb-zen-sm flex items-center'>
                    🎫 관람 안내
                  </h4>
                  <p className='font-display text-ink-light mb-1'>
                    {exhibition.admission}
                  </p>
                  <p className='font-display text-ink-light text-sm'>
                    {exhibition.note}
                  </p>
                </motion.div>
              </div>

              {/* Call to action */}
              <div className='text-center'>
                <button
                  className='
                inline-block px-zen-xl py-zen-md
                bg-ink text-paper font-display font-bold text-lg
                hover:bg-gold hover:text-ink
                transition-all duration-300
                shadow-brutal hover:shadow-brutal-strong
                transform hover:-translate-x-2 hover:-translate-y-2
                border-4 border-ink hover:border-gold
                group relative overflow-hidden
              '
                >
                  <span className='relative z-10'>전시 상세 정보 보기</span>
                  <div className='absolute inset-0 bg-gold opacity-0 group-hover:opacity-20 transition-opacity duration-300' />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

      {/* Exhibition timeline */}
      <motion.div
        className='mb-zen-2xl'
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h3 className='font-calligraphy font-bold text-ink text-xl mb-zen-lg text-center'>
          전시 연혁 • Exhibition Timeline
        </h3>

        <div className='space-y-zen-md'>
          {exhibitions.map((exhibition, index) => (
            <motion.div
              key={exhibition.id}
              className={`
                flex items-center p-zen-md border-2 border-ink
                ${
                  exhibition.status === 'upcoming'
                    ? 'bg-gold/10 border-gold'
                    : exhibition.featured
                      ? 'bg-paper-warm'
                      : 'bg-paper'
                }
                shadow-brutal-sm hover:shadow-brutal
                transition-all duration-300
              `}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ x: 4 }}
            >
              {/* Status indicator */}
              <div
                className={`
                w-4 h-4 rounded-full mr-zen-md flex-shrink-0
                ${exhibition.status === 'upcoming' ? 'bg-gold' : 'bg-ink/30'}
              `}
              />

              {/* Exhibition info */}
              <div className='flex-1'>
                <h4 className='font-display font-semibold text-ink'>
                  {exhibition.title}
                </h4>
                <p className='font-display text-ink-light text-sm'>
                  {exhibition.period} • {exhibition.venue}
                </p>
              </div>

              {/* Status badge */}
              <div
                className={`
                px-zen-sm py-zen-xs text-xs font-display font-medium
                ${
                  exhibition.status === 'upcoming'
                    ? 'bg-gold text-ink'
                    : 'bg-ink/20 text-ink-light'
                }
              `}
              >
                {exhibition.status === 'upcoming' ? '예정' : '완료'}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Exhibition philosophy */}
      <motion.div
        className='text-center max-w-4xl mx-auto'
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className='bg-paper p-zen-xl border-4 border-ink shadow-brutal'>
          <h3 className='font-calligraphy font-bold text-ink text-xl mb-zen-md'>
            전시를 통한 소통
          </h3>

          <p className='font-display text-ink leading-relaxed mb-zen-md'>
            전시는 작가와 관람객이 만나는 특별한 공간입니다. 각 작품 앞에서 잠시
            머물며 느끼는 감동과 울림이 서예의 진정한 가치를 전달한다고
            믿습니다.
          </p>

          <div className='flex items-center justify-center gap-zen-sm'>
            <div className='w-8 h-px bg-gold' />
            <span className='font-calligraphy text-ink font-medium text-sm'>
              書道無言 而有聲
            </span>
            <div className='w-8 h-px bg-gold' />
          </div>

          <p className='font-display text-ink-light text-sm mt-zen-sm'>
            서도는 말이 없어도 소리가 있다
          </p>
        </div>
      </motion.div>
    </div>
  )
}
