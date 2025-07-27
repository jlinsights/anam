import { ZenBrutalistArtworkCard, ZenBrutalistGallery } from '@/components/zen-brutalist-artwork-card'
import { ZenBrutalistHeroPhase1 } from '@/components/zen-brutalist-hero'
import { ZenBrutalistFooter } from '@/components/zen-brutalist-footer'
import { fallbackArtworksData } from '@/lib/artworks'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zen Brutalism Demo - ANAM Gallery',
  description: 'Demonstration of the new Zen Brutalism + Glass Morphism design system',
}

export default async function ZenDemoPage() {
  // Use first 8 artworks for demo
  const demoArtworks = fallbackArtworksData.slice(0, 8)

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      {/* Enhanced Hero Section */}
      <ZenBrutalistHeroPhase1 
        navigation={{
          demo: { href: '/zen-demo#showcase', label: '디자인 시스템 탐험' },
          next: { href: '/immersive-demo', label: 'Phase 2' },
        }}
        enableInteraction={true}
      />

      {/* Design Variants Showcase */}
      <section className="py-zen-3xl bg-gradient-zen">
        <div className="zen-brutalist-layout">
          <h2 className="zen-typography-section text-center text-ink mb-zen-2xl">
            Design System Variants
          </h2>
          
          {/* Zen Variant */}
          <div className="mb-zen-3xl">
            <h3 className="zen-typography-hero text-ink mb-zen-lg">
              선(禪) - Zen Minimalism
            </h3>
            <p className="zen-typography-body text-ink-light mb-zen-xl max-w-3xl">
              명상적 여백과 섬세한 글래스 모피즘으로 구현된 현대적 선미학. 
              깊은 호흡과 절대적 침묵의 공간에서 작품과 대화하는 경험.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-zen-xl">
              {demoArtworks.slice(0, 3).map((artwork) => (
                <ZenBrutalistArtworkCard
                  key={`zen-${artwork.id}`}
                  artwork={artwork}
                  variant="zen"
                  immersionLevel="moderate"
                  traditionalDepth={true}
                  showMetadata={true}
                />
              ))}
            </div>
          </div>

          {/* Brutal Variant */}
          <div className="mb-zen-3xl">
            <h3 className="brutal-typography-impact text-ink mb-zen-lg">
              BRUTAL POETRY
            </h3>
            <p className="zen-typography-body text-ink-light mb-zen-xl max-w-3xl">
              강렬한 그림자와 기하학적 구조로 표현된 절제된 브루탈리즘. 
              전통 서예의 힘찬 필획을 현대적 공간언어로 재해석.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-zen-xl">
              {demoArtworks.slice(3, 6).map((artwork) => (
                <ZenBrutalistArtworkCard
                  key={`brutal-${artwork.id}`}
                  artwork={artwork}
                  variant="brutal"
                  immersionLevel="maximum"
                  traditionalDepth={true}
                  showMetadata={true}
                />
              ))}
            </div>
          </div>

          {/* Glass Ink Variant */}
          <div className="mb-zen-3xl">
            <h3 className="zen-typography-hero text-ink mb-zen-lg">
              먹과 유리의 조화
            </h3>
            <p className="zen-typography-body text-ink-light mb-zen-xl max-w-3xl">
              먹의 깊이와 유리의 투명성이 만나는 몰입형 인터페이스. 
              전통 재료의 물성을 현대 기술로 재현한 감각적 경험.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-zen-lg">
              {demoArtworks.slice(0, 4).map((artwork) => (
                <ZenBrutalistArtworkCard
                  key={`glass-${artwork.id}`}
                  artwork={artwork}
                  variant="glass-ink"
                  immersionLevel="maximum"
                  traditionalDepth={true}
                  showMetadata={true}
                />
              ))}
            </div>
          </div>

          {/* Fusion Variant */}
          <div>
            <h3 className="zen-typography-section text-ink mb-zen-lg">
              전통과 현대의 융합
            </h3>
            <p className="zen-typography-body text-ink-light mb-zen-xl max-w-3xl">
              선적 미니멀리즘과 브루탈리즘, 글래스 모피즘이 조화롭게 융합된 하이브리드 디자인. 
              전통의 깊이와 현대적 몰입감의 완벽한 균형.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-zen-2xl">
              {demoArtworks.slice(6, 8).map((artwork) => (
                <ZenBrutalistArtworkCard
                  key={`fusion-${artwork.id}`}
                  artwork={artwork}
                  variant="fusion"
                  immersionLevel="maximum"
                  traditionalDepth={true}
                  showMetadata={true}
                  showActions={true}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Typography Showcase */}
      <section className="py-zen-3xl bg-paper">
        <div className="zen-brutalist-layout">
          <h2 className="zen-typography-section text-center text-ink mb-zen-2xl">
            Typography System
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-zen-2xl">
            {/* Zen Typography */}
            <div className="ink-glass-primary rounded-xl p-zen-xl">
              <h3 className="zen-typography-hero text-ink mb-zen-lg">
                Zen Typography
              </h3>
              <div className="space-y-zen-md">
                <div className="zen-typography-display text-ink">無</div>
                <div className="zen-typography-hero text-ink-light">여백의 미학</div>
                <div className="zen-typography-section text-ink">깊은 호흡</div>
                <div className="zen-typography-body text-ink-lighter">
                  명상적 여백 속에서 피어나는 현대적 서예의 아름다움을 
                  디지털 공간에서 경험하는 새로운 방식입니다.
                </div>
              </div>
            </div>

            {/* Brutal Typography */}
            <div className="bg-paper brutal-border brutal-shadow p-zen-xl">
              <h3 className="brutal-typography-impact text-ink mb-zen-lg">
                BRUTAL TYPE
              </h3>
              <div className="space-y-zen-md">
                <div className="brutal-typography-statement text-ink">力</div>
                <div className="brutal-typography-impact text-ink-dark">STRENGTH</div>
                <div className="brutal-typography-accent text-ink">MODERN POETRY</div>
                <div className="zen-typography-body text-ink-lighter">
                  강렬한 구조와 절제된 아름다움으로 전통 서예의 
                  힘찬 정신을 현대적 언어로 재해석합니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing Scale Demonstration */}
      <section className="py-zen-3xl bg-gradient-paper">
        <div className="zen-brutalist-layout">
          <h2 className="zen-typography-section text-center text-ink mb-zen-2xl">
            Zen Spacing Scale
          </h2>
          
          <div className="space-y-zen-lg">
            <div className="text-center">
              <div className="zen-typography-body text-ink-light mb-zen-sm">
                호흡의 단계별 구현
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-zen-md">
              {[
                { scale: 'zen-xs', name: '미세한 호흡', size: '8px' },
                { scale: 'zen-sm', name: '기본 호흡', size: '16px' },
                { scale: 'zen-md', name: '중간 호흡', size: '32px' },
                { scale: 'zen-lg', name: '깊은 호흡', size: '64px' },
                { scale: 'zen-xl', name: '명상적 호흡', size: '128px' },
                { scale: 'zen-2xl', name: '절대적 침묵', size: '256px' },
                { scale: 'zen-3xl', name: '완전한 여백', size: '384px' },
                { scale: 'zen-4xl', name: '무한의 공간', size: '512px' }
              ].map((space, index) => (
                <div key={space.scale} className="ink-glass-primary rounded-lg p-zen-sm">
                  <div className="zen-typography-body text-ink font-medium">
                    {space.name}
                  </div>
                  <div className="text-ink-light text-sm">
                    {space.scale} ({space.size})
                  </div>
                  <div 
                    className="bg-gold mt-zen-xs rounded"
                    style={{ height: '4px', width: `${Math.min(100, (index + 1) * 12)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-zen-3xl bg-ink text-paper" id="showcase">
        <div className="zen-brutalist-layout text-center space-y-zen-xl">
          <h2 className="zen-typography-hero">
            전통의 깊이, 현대의 몰입
          </h2>
          <p className="zen-typography-body max-w-2xl mx-auto opacity-80">
            아남 배옥영 작가의 서예 작품을 통해 경험하는 
            새로운 디지털 갤러리의 미학
          </p>
          <div className="flex flex-col sm:flex-row gap-zen-md justify-center items-center">
            <button className="btn-art px-zen-lg py-zen-md">
              갤러리 둘러보기
            </button>
            <button className="btn-art-outline px-zen-lg py-zen-md text-paper border-paper hover:bg-paper hover:text-ink">
              작가 소개
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <ZenBrutalistFooter 
        variant="zen"
        showPhaseNavigation={true}
        enableInteraction={true}
      />
    </main>
  )
}