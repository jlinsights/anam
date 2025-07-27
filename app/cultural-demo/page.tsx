import { CulturalArtworkCard, CulturalGallery } from '@/components/cultural-artwork-card'
import { ZenBrutalistHeroPhase3 } from '@/components/zen-brutalist-hero'
import { ZenBrutalistFooter } from '@/components/zen-brutalist-footer'
import { fallbackArtworksData } from '@/lib/artworks'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Traditional Cultural Integration Demo - ANAM Gallery',
  description: 'Phase 3: Traditional Korean composition principles with cultural depth layers and seasonal aesthetics',
}

export default async function CulturalDemoPage() {
  // Use artworks for comprehensive Phase 3 demo
  const demoArtworks = fallbackArtworksData.slice(0, 16)

  return (
    <main className="min-h-screen bg-paper relative overflow-hidden flex flex-col">
      {/* Traditional Cultural Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 cultural-layer-flow opacity-3" />
        <div className="absolute inset-0 traditional-composition opacity-2" />
        <div className="absolute inset-0 yin-yang-balance opacity-1" />
      </div>

      {/* Enhanced Hero Section */}
      <ZenBrutalistHeroPhase3 
        navigation={{
          prev: { href: '/immersive-demo', label: 'Phase 2' },
          demo: { href: '/cultural-demo#composition', label: '전통 미학 탐험' },
        }}
        enableInteraction={true}
      />

      {/* Phase 3 Effects Showcase */}
      <section className="relative z-10 py-zen-4xl cultural-context">
        <div className="zen-brutalist-layout">
          <h2 className="zen-typography-section text-center text-ink mb-zen-3xl stroke-horizontal">
            Traditional Korean Composition Systems
          </h2>
          
          {/* 삼분법 (Rule of Thirds) Demonstration */}
          <div className="mb-zen-4xl">
            <div className="text-center mb-zen-2xl">
              <h3 className="zen-typography-hero text-ink mb-zen-lg stroke-press">
                삼분법 - Rule of Thirds Composition
              </h3>
              <p className="zen-typography-body text-ink-light max-w-4xl mx-auto void-breathing">
                전통 한국 회화의 삼분법 구성 원리를 현대적 그리드 시스템으로 구현. 
                황금비율과 조화를 이루는 시각적 균형감을 디지털 공간에서 재현.
              </p>
            </div>
            
            <div className="composition-thirds min-h-[600px] border border-gold/20 rounded-2xl void-contemplative relative">
              {/* Grid visual indicators */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-0 right-0 h-px bg-gold/30"></div>
                <div className="absolute top-2/3 left-0 right-0 h-px bg-gold/30"></div>
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-gold/30"></div>
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-gold/30"></div>
              </div>
              
              {/* Positioned artworks according to rule of thirds */}
              <div className="thirds-top-left">
                <CulturalArtworkCard
                  artwork={demoArtworks[0]}
                  variant="traditional"
                  composition="centered"
                  culturalSeason="spring"
                  depthLayer="foreground"
                  enableStroke={true}
                  showMetadata={false}
                />
              </div>
              
              <div className="thirds-top-right">
                <CulturalArtworkCard
                  artwork={demoArtworks[1]}
                  variant="seasonal"
                  composition="centered"
                  culturalSeason="summer"
                  depthLayer="middle"
                  enableStroke={true}
                  showMetadata={false}
                />
              </div>
              
              <div className="thirds-center">
                <div className="cultural-immersion rounded-xl void-breathing text-center">
                  <span className="zen-typography-display text-gold">均</span>
                  <p className="zen-typography-body text-ink-light mt-zen-sm">조화로운 균형</p>
                </div>
              </div>
              
              <div className="thirds-bottom-left">
                <CulturalArtworkCard
                  artwork={demoArtworks[2]}
                  variant="balanced"
                  composition="centered"
                  culturalSeason="autumn"
                  depthLayer="cultural"
                  enableStroke={true}
                  showMetadata={false}
                />
              </div>
              
              <div className="thirds-bottom-right">
                <CulturalArtworkCard
                  artwork={demoArtworks[3]}
                  variant="immersive"
                  composition="centered"
                  culturalSeason="winter"
                  depthLayer="temporal"
                  enableStroke={true}
                  showMetadata={false}
                />
              </div>
            </div>
          </div>

          {/* 황금비율 (Golden Ratio) Demonstration */}
          <div className="mb-zen-4xl">
            <div className="text-center mb-zen-2xl">
              <h3 className="zen-typography-hero text-ink mb-zen-lg stroke-horizontal">
                황금비율 - Golden Ratio Balance
              </h3>
              <p className="zen-typography-body text-ink-light max-w-4xl mx-auto void-breathing">
                자연의 법칙인 황금비율(1:1.618)을 활용한 전통적 구성법. 
                좌우 비대칭의 아름다움과 시각적 안정감을 동시에 구현.
              </p>
            </div>
            
            <div className="composition-golden min-h-[400px] border border-gold/20 rounded-2xl void-contemplative relative">
              {/* Golden ratio visual indicator */}
              <div className="absolute left-[38.2%] top-0 bottom-0 w-px bg-gold/50"></div>
              <div className="absolute left-[38.2%] top-0 w-3 h-3 bg-gold rounded-full transform -translate-x-1/2"></div>
              <div className="absolute left-[38.2%] bottom-0 w-3 h-3 bg-gold rounded-full transform -translate-x-1/2"></div>
              
              <div className="grid grid-cols-2 h-full gap-void-breathing items-center">
                <div className="space-y-zen-xl">
                  <CulturalArtworkCard
                    artwork={demoArtworks[4]}
                    variant="traditional"
                    composition="flowing"
                    culturalSeason="eternal"
                    depthLayer="foreground"
                    enableStroke={true}
                    showMetadata={true}
                    className="transform scale-110"
                  />
                </div>
                
                <div className="space-y-zen-lg">
                  <CulturalArtworkCard
                    artwork={demoArtworks[5]}
                    variant="seasonal"
                    composition="flowing"
                    culturalSeason="spring"
                    depthLayer="middle"
                    enableStroke={true}
                    showMetadata={true}
                    className="transform scale-90"
                  />
                  <CulturalArtworkCard
                    artwork={demoArtworks[6]}
                    variant="balanced"
                    composition="flowing"
                    culturalSeason="autumn"
                    depthLayer="cultural"
                    enableStroke={true}
                    showMetadata={true}
                    className="transform scale-90"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 여백의 미학 (Aesthetics of Empty Space) */}
      <section className="relative z-10 py-zen-4xl bg-gradient-zen temporal-depth">
        <div className="zen-brutalist-layout">
          <h2 className="zen-typography-section text-center text-ink mb-zen-3xl stroke-curve">
            여백의 미학 - The Aesthetics of Void
          </h2>
          
          <div className="space-y-zen-4xl">
            {/* Void breathing demonstration */}
            <div className="text-center mb-zen-2xl">
              <h3 className="zen-typography-hero text-ink mb-zen-lg stroke-vertical">
                호흡하는 여백의 단계
              </h3>
              <p className="zen-typography-body text-ink-light max-w-4xl mx-auto">
                최소 여백부터 우주적 여백까지, 다섯 단계의 호흡을 통한 명상적 경험. 
                각 단계는 관찰자의 내적 상태와 공명하며 깊이 있는 감상을 유도합니다.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-zen-xl">
              {[
                { level: 'minimal', name: '최소 여백', description: '기본적 호흡' },
                { level: 'breathing', name: '호흡 여백', description: '자연스러운 흐름' },
                { level: 'contemplative', name: '사색 여백', description: '깊은 성찰' },
                { level: 'infinite', name: '무한 여백', description: '경계의 소거' },
                { level: 'cosmic', name: '우주 여백', description: '절대적 침묵' }
              ].map((voidLevel, index) => (
                <div key={voidLevel.level} className={`void-${voidLevel.level}`}>
                  <div className="cultural-context rounded-xl h-full flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ink to-gold mb-zen-md void-breathing-animation opacity-80"></div>
                    <h4 className="zen-typography-section text-ink mb-zen-sm">{voidLevel.name}</h4>
                    <p className="zen-typography-body text-ink-light">{voidLevel.description}</p>
                    <div className="mt-zen-md">
                      <CulturalArtworkCard
                        artwork={demoArtworks[7 + index]}
                        variant="traditional"
                        composition="centered"
                        culturalSeason="eternal"
                        depthLayer="cultural"
                        enableStroke={false}
                        enableVoidBreathing={true}
                        showMetadata={false}
                        className="transform scale-75"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 음양균형 (Yin-Yang Balance) */}
      <section className="relative z-10 py-zen-4xl cultural-immersion">
        <div className="zen-brutalist-layout">
          <h2 className="zen-typography-section text-center text-paper mb-zen-3xl stroke-press">
            음양균형 - Yin-Yang Harmony
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-zen-3xl items-center">
            {/* Yin side */}
            <div className="yin-element rounded-2xl void-contemplative">
              <h3 className="zen-typography-hero text-paper mb-zen-xl text-center">陰 - Yin</h3>
              <div className="space-y-zen-lg">
                {demoArtworks.slice(12, 14).map((artwork, index) => (
                  <CulturalArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    variant="balanced"
                    composition="flowing"
                    culturalSeason="winter"
                    depthLayer="cultural"
                    enableStroke={true}
                    showMetadata={true}
                  />
                ))}
              </div>
            </div>
            
            {/* Yang side */}
            <div className="yang-element rounded-2xl void-contemplative">
              <h3 className="zen-typography-hero text-ink mb-zen-xl text-center">陽 - Yang</h3>
              <div className="space-y-zen-lg">
                {demoArtworks.slice(14, 16).map((artwork, index) => (
                  <CulturalArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    variant="seasonal"
                    composition="flowing"
                    culturalSeason="summer"
                    depthLayer="foreground"
                    enableStroke={true}
                    showMetadata={true}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Center balance indicator */}
          <div className="text-center mt-zen-3xl">
            <div className="inline-block w-24 h-24 rounded-full bg-gradient-conic from-ink via-gold to-paper yin-yang-balance shadow-zen-depth"></div>
            <p className="zen-typography-body text-paper-warm mt-zen-md">
              음과 양의 완벽한 조화 속에서 피어나는 예술의 본질
            </p>
          </div>
        </div>
      </section>

      {/* 계절의 흐름 (Seasonal Flow) */}
      <section className="relative z-10 py-zen-4xl bg-gradient-paper seasonal-shift">
        <div className="zen-brutalist-layout">
          <h2 className="zen-typography-section text-center text-ink mb-zen-3xl stroke-horizontal">
            사계절의 흐름 - Seasonal Transitions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-zen-xl">
            {[
              { season: 'spring' as const, name: '春 - 봄', description: '생명의 시작', hue: '청록의 생동' },
              { season: 'summer' as const, name: '夏 - 여름', description: '성장의 시간', hue: '녹색의 풍요' },
              { season: 'autumn' as const, name: '秋 - 가을', description: '성숙의 결실', hue: '황금의 깊이' },
              { season: 'winter' as const, name: '冬 - 겨울', description: '성찰의 시간', hue: '회색의 고요' }
            ].map((seasonInfo, index) => (
              <div key={seasonInfo.season} className={`season-${seasonInfo.season} rounded-xl void-breathing`}>
                <div className="cultural-context h-full">
                  <div className="text-center mb-zen-lg">
                    <h3 className="zen-typography-hero text-ink mb-zen-sm">{seasonInfo.name}</h3>
                    <p className="zen-typography-body text-ink-light mb-zen-xs">{seasonInfo.description}</p>
                    <p className="text-sm text-ink-lighter">{seasonInfo.hue}</p>
                  </div>
                  
                  <CulturalArtworkCard
                    artwork={demoArtworks[index]}
                    variant="seasonal"
                    composition="flowing"
                    culturalSeason={seasonInfo.season}
                    depthLayer="middle"
                    enableStroke={true}
                    showMetadata={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 전통 깊이감 (Traditional Depth Layers) */}
      <section className="relative z-10 py-zen-4xl bg-ink text-paper cultural-depth-shift">
        <div className="zen-brutalist-layout">
          <h2 className="zen-typography-section text-center mb-zen-3xl stroke-curve">
            전통 깊이감의 층위
          </h2>
          
          <div className="relative min-h-[800px] perspective-1000">
            {/* 5-layer depth demonstration */}
            <div className="absolute inset-0">
              {/* Temporal depth (deepest) */}
              <div className="absolute inset-0 temporal-depth">
                <div className="w-full h-full rounded-3xl bg-gradient-to-br from-stone-dark to-paper-aged opacity-20"></div>
                <div className="absolute bottom-zen-lg left-zen-lg">
                  <span className="text-paper-warm text-sm">시간적 차원</span>
                </div>
              </div>
              
              {/* Cultural depth */}
              <div className="absolute inset-8 cultural-context">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-brush to-stone opacity-30"></div>
                <div className="absolute bottom-zen-md left-zen-md">
                  <span className="text-paper text-sm">문화적 맥락</span>
                </div>
              </div>
              
              {/* Background depth */}
              <div className="absolute inset-16 depth-background">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-ink-light to-stone-light opacity-40"></div>
                <div className="absolute bottom-zen-sm left-zen-sm">
                  <span className="text-paper text-sm">배경 층위</span>
                </div>
              </div>
              
              {/* Middle depth */}
              <div className="absolute inset-24 depth-middle">
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-ink to-gold opacity-60"></div>
                <div className="absolute top-zen-sm right-zen-sm">
                  <CulturalArtworkCard
                    artwork={demoArtworks[8]}
                    variant="balanced"
                    composition="flowing"
                    culturalSeason="eternal"
                    depthLayer="middle"
                    enableStroke={true}
                    showMetadata={false}
                    className="transform scale-75"
                  />
                </div>
              </div>
              
              {/* Foreground depth (closest) */}
              <div className="absolute inset-32 depth-foreground">
                <div className="w-full h-full rounded bg-gradient-to-br from-gold to-paper opacity-80"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <CulturalArtworkCard
                    artwork={demoArtworks[9]}
                    variant="immersive"
                    composition="flowing"
                    culturalSeason="spring"
                    depthLayer="foreground"
                    enableStroke={true}
                    showMetadata={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Integrated Cultural Experience */}
      <section className="relative z-10 py-zen-4xl cultural-immersion">
        <div className="zen-brutalist-layout text-center space-y-zen-2xl">
          <div className="composition-thirds rounded-3xl void-cosmic">
            <div className="thirds-center">
              <h2 className="zen-typography-display text-paper mb-zen-xl stroke-press">
                通合의 경험
              </h2>
              <p className="zen-typography-hero text-paper-warm max-w-4xl mx-auto mb-zen-lg stroke-horizontal">
                전통과 현대, 동양과 서양, 정적과 동적이 하나로 통합되는 
                새로운 차원의 문화적 경험
              </p>
              <p className="zen-typography-body text-paper-cream max-w-3xl mx-auto mb-zen-2xl stroke-vertical">
                삼분법의 조화, 여백의 호흡, 음양의 균형, 계절의 흐름, 깊이의 층위가 
                만들어내는 종합적 미학 체험을 지금 시작하세요.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-zen-lg justify-center items-center">
                <button className="btn-art px-zen-2xl py-zen-lg cultural-immersion stroke-curve">
                  전통 갤러리 체험
                </button>
                <button className="btn-art-outline px-zen-2xl py-zen-lg text-paper border-paper hover:bg-paper hover:text-ink cultural-depth-shift stroke-press">
                  문화적 여정 시작
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <ZenBrutalistFooter 
        variant="cultural"
        showPhaseNavigation={true}
        enableInteraction={true}
      />
    </main>
  )
}