import {
  ImmersiveArtworkCard,
  ImmersiveGallery,
} from '@/components/immersive-artwork-card'
import { ZenBrutalistHeroPhase2 } from '@/components/zen-brutalist-hero'
import { ZenBrutalistFooter } from '@/components/zen-brutalist-footer'
import { fallbackArtworksData } from '@/lib/artworks'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Immersive Glass Morphism Demo - ANAM Gallery',
  description:
    'Advanced glass morphism effects with fluid ink transitions and multi-layer depth',
}

export default async function ImmersiveDemoPage() {
  // Use first 12 artworks for comprehensive demo
  const demoArtworks = fallbackArtworksData.slice(0, 12)

  return (
    <main className='min-h-screen bg-paper relative overflow-hidden flex flex-col'>
      {/* Ambient Background Effects */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute inset-0 ink-flow-ambient opacity-5' />
        <div className='absolute inset-0 zen-breathe-deep opacity-3' />
      </div>

      {/* Enhanced Hero Section */}
      <ZenBrutalistHeroPhase2
        navigation={{
          prev: { href: '/zen-demo', label: 'Phase 1' },
          demo: { href: '/immersive-demo#effects', label: '몰입형 체험' },
          next: { href: '/cultural-demo', label: 'Phase 3' },
        }}
        enableInteraction={true}
      />

      {/* Phase 2 Effects Showcase */}
      <section className='relative z-10 py-zen-3xl bg-gradient-zen'>
        <div className='zen-brutalist-layout'>
          <h2 className='zen-typography-section text-center text-ink mb-zen-2xl'>
            Advanced Immersion Levels
          </h2>

          {/* Zen Immersive Variant */}
          <div className='mb-zen-4xl'>
            <div className='text-center mb-zen-xl'>
              <h3 className='zen-typography-hero text-ink mb-zen-md'>
                Zen Immersive - 선적 몰입
              </h3>
              <p className='zen-typography-body text-ink-light max-w-4xl mx-auto'>
                다층 유리 깊이감과 부드러운 먹 그라디언트가 조화를 이루는 명상적
                인터페이스. 마우스 추적 기반 문화적 레이어 시스템으로 전통
                미학의 현대적 재해석.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-zen-lg'>
              {['subtle', 'moderate', 'intense', 'maximum'].map(
                (intensity, idx) => (
                  <div key={intensity} className='space-y-zen-sm'>
                    <div className='text-center'>
                      <span className='brutal-typography-accent text-ink-dark text-sm uppercase tracking-wider'>
                        {intensity}
                      </span>
                    </div>
                    <ImmersiveArtworkCard
                      artwork={demoArtworks[idx]}
                      variant='zen-immersive'
                      intensity={intensity as any}
                      culturalDepth={true}
                      showMetadata={true}
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Brutal Glass Variant */}
          <div className='mb-zen-4xl'>
            <div className='text-center mb-zen-xl'>
              <h3 className='brutal-typography-impact text-ink mb-zen-md'>
                BRUTAL GLASS FUSION
              </h3>
              <p className='zen-typography-body text-ink-light max-w-4xl mx-auto'>
                강렬한 기하학적 구조와 정밀한 유리 효과의 융합. 브루탈리즘의
                힘과 글래스 모피즘의 섬세함이 만나는 혁신적 조합.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-zen-lg'>
              {['subtle', 'moderate', 'intense', 'maximum'].map(
                (intensity, idx) => (
                  <div key={intensity} className='space-y-zen-sm'>
                    <div className='text-center'>
                      <span className='brutal-typography-accent text-ink-dark text-sm uppercase tracking-wider'>
                        {intensity}
                      </span>
                    </div>
                    <ImmersiveArtworkCard
                      artwork={demoArtworks[idx + 4]}
                      variant='brutal-glass'
                      intensity={intensity as any}
                      culturalDepth={true}
                      showMetadata={true}
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Ink Flow Variant */}
          <div className='mb-zen-4xl'>
            <div className='text-center mb-zen-xl'>
              <h3 className='zen-typography-hero text-ink mb-zen-md'>
                Fluid Ink Transitions - 유동하는 먹
              </h3>
              <p className='zen-typography-body text-ink-light max-w-4xl mx-auto'>
                실시간 마우스 추적으로 생성되는 동적 먹 그라디언트. 전통 서예의
                붓질 움직임을 디지털 상호작용으로 재현한 혁신적 시스템.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-zen-lg'>
              {['subtle', 'moderate', 'intense', 'maximum'].map(
                (intensity, idx) => (
                  <div key={intensity} className='space-y-zen-sm'>
                    <div className='text-center'>
                      <span className='brutal-typography-accent text-ink-dark text-sm uppercase tracking-wider'>
                        {intensity}
                      </span>
                    </div>
                    <ImmersiveArtworkCard
                      artwork={demoArtworks[idx + 8]}
                      variant='ink-flow'
                      intensity={intensity as any}
                      culturalDepth={true}
                      showMetadata={true}
                      showActions={intensity === 'maximum'}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Showcase Section */}
      <section className='relative z-10 py-zen-3xl bg-gradient-paper'>
        <div className='zen-brutalist-layout'>
          <h2 className='zen-typography-section text-center text-ink mb-zen-2xl'>
            Interactive Gallery Layouts
          </h2>

          {/* Flowing Layout */}
          <div className='mb-zen-3xl'>
            <h3 className='zen-typography-hero text-ink mb-zen-lg text-center'>
              Flowing Layout - 흐르는 구성
            </h3>
            <ImmersiveGallery
              artworks={demoArtworks.slice(0, 4)}
              variant='depth-fusion'
              intensity='intense'
              culturalDepth={true}
              layout='flowing'
              showMetadata={true}
              className='bg-transparent py-zen-lg'
            />
          </div>

          {/* Organic Layout */}
          <div className='mb-zen-3xl'>
            <h3 className='zen-typography-hero text-ink mb-zen-lg text-center'>
              Organic Layout - 유기적 배치
            </h3>
            <div className='glass-depth-container rounded-2xl p-zen-xl'>
              <ImmersiveGallery
                artworks={demoArtworks.slice(4, 8)}
                variant='ink-flow'
                intensity='maximum'
                culturalDepth={true}
                layout='organic'
                showMetadata={true}
                className='bg-transparent py-0'
              />
            </div>
          </div>

          {/* Asymmetric Layout */}
          <div>
            <h3 className='zen-typography-hero text-ink mb-zen-lg text-center'>
              Asymmetric Layout - 비대칭 리듬
            </h3>
            <div className='brutal-border brutal-shadow-strong rounded-lg p-zen-lg bg-paper-warm'>
              <ImmersiveGallery
                artworks={demoArtworks.slice(8, 12)}
                variant='brutal-glass'
                intensity='moderate'
                culturalDepth={true}
                layout='asymmetric'
                showMetadata={true}
                className='bg-transparent py-0'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Technical Showcase */}
      <section className='relative z-10 py-zen-3xl bg-ink text-paper'>
        <div className='zen-brutalist-layout'>
          <h2 className='zen-typography-section text-center mb-zen-2xl'>
            Advanced Technical Features
          </h2>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-zen-xl'>
            {/* Multi-Layer Glass Depth */}
            <div className='glass-depth-container glass-layer-3 rounded-xl p-zen-lg immersive-hover'>
              <h3 className='zen-typography-hero mb-zen-md'>
                Multi-Layer Glass
              </h3>
              <p className='zen-typography-body opacity-80 mb-zen-md'>
                3단계 깊이감을 구현한 고급 글래스 모피즘 시스템. 각 레이어는
                독립적인 블러와 투명도를 가져 입체적 경험 제공.
              </p>
              <ul className='space-y-zen-xs text-sm opacity-70'>
                <li>• Layer 1: blur(8px) + 120% saturation</li>
                <li>• Layer 2: blur(16px) + 140% saturation</li>
                <li>• Layer 3: blur(24px) + 160% saturation</li>
              </ul>
            </div>

            {/* Advanced Ink Flow */}
            <div className='fluid-ink-transition rounded-xl p-zen-lg'>
              <h3 className='zen-typography-hero mb-zen-md'>
                Fluid Ink System
              </h3>
              <p className='zen-typography-body opacity-80 mb-zen-md'>
                실시간 마우스 추적으로 생성되는 동적 먹 그라디언트. 전통 서예의
                붓질과 먹의 번짐을 현대적으로 재해석.
              </p>
              <ul className='space-y-zen-xs text-sm opacity-70'>
                <li>• Radial gradient mouse tracking</li>
                <li>• Conic gradient rotation effects</li>
                <li>• Real-time ink flow animation</li>
              </ul>
            </div>

            {/* Cultural Depth Integration */}
            <div className='zen-breathe-deep ink-glass-elevated rounded-xl p-zen-lg'>
              <h3 className='zen-typography-hero mb-zen-md'>Cultural Depth</h3>
              <p className='zen-typography-body opacity-80 mb-zen-md'>
                전통 한국 미학의 깊이감을 현대적 인터랙션으로 표현. 여백의
                미학과 층위적 구성의 디지털 구현.
              </p>
              <ul className='space-y-zen-xs text-sm opacity-70'>
                <li>• Traditional composition principles</li>
                <li>• Breathing space implementation</li>
                <li>• Layered cultural context</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className='relative z-10 py-zen-3xl bg-gradient-zen'>
        <div className='zen-brutalist-layout'>
          <h2 className='zen-typography-section text-center text-ink mb-zen-2xl'>
            Performance & Animation System
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-zen-lg'>
            {[
              {
                name: 'Ink Flow Duration',
                value: '3000ms',
                desc: '유동적 먹 애니메이션',
              },
              {
                name: 'Glass Morph Duration',
                value: '2000ms',
                desc: '유리 변형 효과',
              },
              {
                name: 'Depth Transition',
                value: '1500ms',
                desc: '깊이감 전환',
              },
              {
                name: 'Mouse Tracking',
                value: '<16ms',
                desc: '실시간 마우스 추적',
              },
            ].map((metric) => (
              <div
                key={metric.name}
                className='ink-glass-primary rounded-lg p-zen-md text-center'
              >
                <div className='brutal-typography-accent text-ink mb-zen-xs'>
                  {metric.value}
                </div>
                <div className='zen-typography-body text-ink font-medium mb-zen-xs'>
                  {metric.name}
                </div>
                <div className='text-ink-lighter text-sm'>{metric.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section
        className='relative z-10 py-zen-4xl bg-ink text-paper'
        id='effects'
      >
        <div className='zen-brutalist-layout text-center space-y-zen-xl'>
          <div className='glass-depth-container glass-layer-3 rounded-2xl p-zen-2xl immersive-hover'>
            <h2 className='zen-typography-hero mb-zen-lg'>
              Experience the Future of Digital Art
            </h2>
            <p className='zen-typography-body max-w-3xl mx-auto opacity-80 mb-zen-xl'>
              전통 한국 서예의 깊이와 현대 기술의 몰입감이 만나는 혁신적인
              디지털 갤러리 경험을 지금 시작하세요.
            </p>
            <div className='flex flex-col sm:flex-row gap-zen-md justify-center items-center'>
              <button className='btn-art px-zen-xl py-zen-lg immersive-hover'>
                Immersive Gallery 체험
              </button>
              <button className='btn-art-outline px-zen-xl py-zen-lg text-paper border-paper hover:bg-paper hover:text-ink immersive-hover'>
                Phase 3 미리보기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <ZenBrutalistFooter
        variant='immersive'
        showPhaseNavigation={true}
        enableInteraction={true}
      />
    </main>
  )
}
