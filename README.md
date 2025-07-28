# 🎨 ANAM Gallery - 아남 배옥영 작가 서예 갤러리

> **Zen Brutalism Foundation** - 전통의 깊이와 현대적 몰입감을 동시에 제공하는 UI/UX 디자인

전통 한국 서예의 정신과 현대적 디지털 인터랙션이 조화를 이루는 혁신적인 웹 갤러리입니다.

[![Korean Calligraphy](https://img.shields.io/badge/Korean-Calligraphy-red)](https://github.com/jlinsights/ANAM)
[![Zen Brutalism](https://img.shields.io/badge/Zen-Brutalism-black)](https://github.com/jlinsights/ANAM)
[![Digital Gallery](https://img.shields.io/badge/Digital-Gallery-green)](https://github.com/jlinsights/ANAM)

---

## 🆕 **NEW: Zen Brutalism Foundation 디자인 시스템**

### 🎯 **3단계 진화 디자인 철학**

| Phase | 컨셉 | 핵심 요소 |
|-------|------|-----------|
| **Phase 1** | **백지의 시작** - Zen Foundation | 여백의 미학 + 기하학적 브루탈리즘 |
| **Phase 2** | **먹과 유리의 조화** - Glass Immersion | 다층 글래스 모피즘 + 유동하는 먹 효과 |
| **Phase 3** | **전통의 깊이** - Cultural Integration | 삼분법, 음양균형, 계절 미학 통합 |

### ✨ **혁신적 디자인 컴포넌트**

- **🖼️ ZenBrutalistHero**: 단계별 히어로 섹션 (실시간 마우스 추적 상호작용)
- **🎨 ZenBrutalistFooter**: 문화적 디자인 개념 통합 푸터  
- **📱 Interactive Artwork Cards**: 전통 미학 + 현대적 몰입감
- **🌊 Fluid Ink System**: 실시간 먹 그라디언트 애니메이션
- **🏛️ Cultural Composition**: 한국 전통 구성 원리 (삼분법, 여백의 미학, 음양균형)

### 🚀 **Demo Pages**

- **[/zen-demo](https://anam-gallery.vercel.app/zen-demo)** - Phase 1: 선적 미니멀리즘 showcase
- **[/immersive-demo](https://anam-gallery.vercel.app/immersive-demo)** - Phase 2: 몰입형 유리+먹 효과
- **[/cultural-demo](https://anam-gallery.vercel.app/cultural-demo)** - Phase 3: 전통 문화 통합 체험

---

## 🚀 **라이브 사이트**

**배포 URL**: [https://anam-gallery.vercel.app](https://anam-gallery.vercel.app)

[![Powered by Vercel](https://img.shields.io/badge/Powered%20by-Vercel-black)](https://vercel.com)

---

## ✨ **주요 기능**

### 🎨 **갤러리 & 작품 관리**
- **58점의 서예 작품** - Airtable 연동 실시간 관리
- **반응형 그리드** - 4x3 (데스크톱) → 2x6 (모바일) 적응형 레이아웃
- **고급 검색/필터** - 제목, 년도, 재료별 실시간 검색
- **라이트박스 모달** - 전체화면 작품 감상 (키보드 네비게이션 지원)
- **작가노트 시스템** - 작품별 상세 설명 및 제작 의도

### 🖱️ **인터랙티브 경험**
- **실시간 마우스 추적** - 마우스 움직임에 반응하는 동적 배경 효과
- **다층 글래스 깊이감** - 3단계 독립적 블러 및 투명도 시스템
- **유동하는 먹 애니메이션** - 전통 서예 붓질을 디지털로 재현
- **계절 미학 변화** - 사계절 색상 변화 및 호흡하는 여백 시스템

### 🎯 **사용자 경험 (UX)**
- **Progressive Web App** - 모바일 앱처럼 설치 및 오프라인 사용
- **다크/라이트 테마** - 시스템 환경에 맞는 자동 테마 전환
- **WCAG 2.1 AA 준수** - 스크린 리더 및 키보드 네비게이션 완전 지원
- **성능 최적화** - WebP 이미지 자동 변환, 지연 로딩, CDN 최적화

---

## 🛠 **기술 스택**

### **Core Framework**
- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript 5
- **Runtime**: React 19
- **Build Tool**: Turbopack

### **Design System**
- **Styling**: Tailwind CSS + 사용자 정의 Zen Brutalism 테마
- **UI Components**: Radix UI + shadcn/ui
- **Animation**: CSS Custom Properties + Transform3D
- **Typography**: 전통 서예 기반 계층적 타이포그래피

### **Data & CMS**
- **CMS**: Airtable (58개 작품 + 작가 정보 동적 관리)
- **Fallback System**: 로컬 데이터 자동 대체
- **Image Management**: Optimized WebP/AVIF + 다중 해상도

### **Deployment & Performance**
- **Platform**: Vercel (Edge Runtime)
- **CDN**: Global CDN + Image Optimization
- **Monitoring**: Real-time performance metrics
- **Testing**: Jest + Testing Library + E2E

---

## 📁 **프로젝트 구조**

```
ANAM/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 루트 레이아웃 (테마 프로바이더)
│   ├── page.tsx                  # 메인 페이지
│   ├── gallery/                  # 갤러리 섹션
│   │   ├── page.tsx              # 갤러리 메인 (58개 작품)
│   │   ├── gallery-client.tsx    # 클라이언트 상호작용
│   │   └── [slug]/               # 개별 작품 상세 페이지
│   ├── artist/                   # 작가 소개 (Airtable 연동)
│   ├── exhibition/               # 전시 정보
│   ├── contact/                  # 연락처 (인스타그램/이메일/전화)
│   │
│   ├── zen-demo/                 # 🆕 Phase 1: Zen Foundation Demo
│   ├── immersive-demo/           # 🆕 Phase 2: Glass Immersion Demo  
│   └── cultural-demo/            # 🆕 Phase 3: Cultural Integration Demo
│
├── components/                   # 재사용 컴포넌트
│   ├── ui/                       # shadcn/ui 기본 컴포넌트
│   │
│   ├── zen-brutalist-hero.tsx    # 🆕 단계별 히어로 섹션
│   ├── zen-brutalist-footer.tsx  # 🆕 문화적 디자인 푸터
│   ├── zen-brutalist-artwork-card.tsx      # 🆕 Phase 1 작품 카드
│   ├── immersive-artwork-card.tsx          # 🆕 Phase 2 몰입형 카드
│   ├── cultural-artwork-card.tsx           # 🆕 Phase 3 문화적 카드
│   │
│   ├── optimized-image.tsx       # 최적화된 이미지 컴포넌트
│   ├── search-filter.tsx         # 고급 검색 필터
│   └── theme-toggle.tsx          # 다크/라이트 테마 토글
│
├── lib/                          # 핵심 라이브러리
│   ├── airtable.ts               # Airtable CMS 연동
│   ├── artworks.ts               # 작품 데이터 + 폴백 시스템
│   ├── types.ts                  # TypeScript 타입 정의
│   └── utils.ts                  # 공통 유틸리티
│
├── styles/                       # 스타일링
│   └── globals.css               # 🆕 Zen Brutalism 글로벌 스타일
│
├── public/                       # 정적 자산
│   ├── Images/                   # 작품 이미지 (년도별 정리)
│   │   ├── Artworks/             # 58개 작품 이미지
│   │   └── Artist/               # 작가 프로필 이미지
│   └── icons/                    # UI 아이콘
│
└── tailwind.config.ts            # 🆕 Zen Brutalism 테마 구성
```

---

## 🏃‍♂️ **로컬 개발 환경 설정**

### **1. 기본 설정**

```bash
# 저장소 클론
git clone https://github.com/jlinsights/ANAM.git
cd ANAM

# 의존성 설치
npm install

# 개발 서버 실행 (localhost:3000)
npm run dev
```

### **2. 환경 변수 설정**

`.env.local` 파일 생성:

```bash
# Airtable CMS 연동 (선택사항 - 폴백 시스템 있음)
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here

# 사이트 URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### **3. 개발 명령어**

```bash
# 개발 서버 (포트 3000)
npm run dev

# 다른 포트로 실행
npm run dev -- --port 3001

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm start

# 코드 품질 검사
npm run lint
npm run type-check

# 테스트 실행
npm test
npm run test:watch
npm run test:coverage

# 이미지 최적화
npm run optimize-images

# 배포
npm run deploy              # Vercel 프로덕션
npm run deploy:preview      # Vercel 프리뷰
```

---

## 🎯 **페이지별 상세 기능**

### **메인 페이지 (`/`)**
- 갤러리 소개 및 작가 컨셉
- 주요 작품 하이라이트 (featured works)
- Zen Brutalism 디자인 미리보기
- 갤러리 및 데모 페이지 바로가기

### **갤러리 (`/gallery`)**
- **58개 작품** Airtable 실시간 연동
- **반응형 그리드**: 4x3 (데스크톱) → 3x4 (태블릿) → 2x6 (모바일)
- **고급 검색**: 제목, 년도, 재료, 카테고리별 실시간 필터링
- **정렬 옵션**: 년도순, 제목순, 카테고리별
- **키보드 네비게이션**: 화살표 키로 작품 탐색
- **무한 스크롤** 또는 **페이지네이션** (설정 가능)

### **작품 상세 (`/gallery/[slug]`)**
- **고해상도 이미지** - 클릭 시 전체화면 라이트박스
- **상세 메타데이터**: 제목, 년도, 재료, 크기, 종횡비
- **작가노트**: 작품 제작 의도 및 배경 설명
- **이전/다음 네비게이션**: 키보드 화살표 키 지원
- **공유 기능**: 소셜 미디어 공유 링크
- **관련 작품 추천**: 같은 년도/재료 작품 제안

### **작가 소개 (`/artist`)**
- **Airtable 연동** 동적 프로필 관리
- **프로필 이미지**: 다중 해상도 최적화
- **상세 이력**: 학력, 전시, 수상, 소장처
- **연락처**: 인스타그램, 이메일, 전화 (세로 정렬)
- **작가 철학** 및 **작업 노트**

### **🆕 데모 페이지들**

#### **Zen Demo (`/zen-demo`) - Phase 1**
- **선적 미니멀리즘** 디자인 시스템 showcase
- **여백의 미학** 구현 (5단계 호흡 시스템)
- **브루탈리즘 타이포그래피** 계층 구조
- **기하학적 구조**와 **명상적 여백**의 조화

#### **Immersive Demo (`/immersive-demo`) - Phase 2**
- **다층 글래스 모피즘** (3단계 독립 깊이감)
- **유동하는 먹 애니메이션** (실시간 마우스 추적)
- **몰입형 상호작용** 패턴
- **성능 메트릭** 및 **기술적 특징** 설명

#### **Cultural Demo (`/cultural-demo`) - Phase 3**
- **삼분법 구성** 시각적 구현
- **황금비율 배치** 시스템
- **음양균형** 인터랙션
- **사계절 미학** 변화 (호흡하는 색상 시스템)
- **전통 깊이감** 5단계 층위 구현

---

## 🎨 **Zen Brutalism Foundation 디자인 시스템**

### **핵심 디자인 원칙**

1. **여백의 미학 (Void Aesthetics)**
   - 5단계 호흡 시스템: `zen-xs` → `zen-4xl`
   - 명상적 여백을 통한 집중도 향상
   - 전통 한국 회화의 공간 철학 적용

2. **브루탈리즘 구조 (Brutal Structure)**
   - 기하학적 정확성과 강렬한 대비
   - 그림자 시스템: `brutal-shadow` → `brutal-shadow-strong`
   - 전통 서예의 힘찬 필획을 현대적 구조로 재해석

3. **글래스 모피즘 진화 (Glass Morphism Evolution)**
   - 3단계 독립적 깊이감: `glass-layer-1/2/3`
   - 동적 블러 및 채도 조절
   - 전통 먹의 투명성을 현대적 유리 효과로 구현

4. **문화적 상호작용 (Cultural Interaction)**
   - 실시간 마우스 추적 상호작용
   - 계절별 색상 변화 시스템
   - 전통 구성 원리의 디지털 구현

### **색상 시스템**

```css
/* 전통 한국 색상 팔레트 */
--ink: 28 25 23           /* 먹색 - 주요 텍스트 */
--paper: 254 252 232      /* 한지색 - 배경 */
--gold: 168 85 27         /* 황금색 - 강조 */
--stone: 120 113 108      /* 돌색 - 보조 */
--brush: 87 83 74         /* 붓색 - 중성 */

/* 계절 색상 (사계절 미학) */
--season-spring: 134 239 172    /* 봄 - 청록 */
--season-summer: 74 222 128     /* 여름 - 녹색 */
--season-autumn: 251 191 36     /* 가을 - 황금 */
--season-winter: 156 163 175    /* 겨울 - 회색 */
```

### **타이포그래피 계층**

```css
/* Zen Typography */
.zen-typography-display     /* 64px - 주요 제목 */
.zen-typography-hero        /* 48px - 히어로 제목 */
.zen-typography-section     /* 32px - 섹션 제목 */
.zen-typography-body        /* 18px - 본문 텍스트 */

/* Brutal Typography */
.brutal-typography-impact     /* 강렬한 임팩트 */
.brutal-typography-statement  /* 선언적 메시지 */
.brutal-typography-accent     /* 강조 요소 */
```

---

## 🌟 **기술적 특징**

### **성능 최적화**
- **Next.js 15 App Router**: 최신 React 19 + Server Components
- **이미지 최적화**: 자동 WebP/AVIF 변환, 다중 해상도, 지연 로딩
- **번들 최적화**: Turbopack + Tree Shaking + Code Splitting
- **CDN 최적화**: Vercel Edge Network 전 세계 배포
- **메모리 관리**: 효율적인 상태 관리 및 가비지 컬렉션

### **접근성 (Accessibility)**
- **WCAG 2.1 AA 완전 준수**: 스크린 리더 100% 호환
- **키보드 네비게이션**: 모든 기능을 키보드로 조작 가능
- **고대비 모드**: 시각 장애인을 위한 고대비 테마
- **의미론적 HTML**: SEO 및 스크린 리더 최적화
- **Focus Management**: 논리적 탭 순서 및 포커스 표시

### **Progressive Web App (PWA)**
- **오프라인 지원**: Service Worker + Cache API
- **모바일 설치**: Add to Home Screen 기능
- **Push Notifications**: 새로운 작품 업데이트 알림 (선택사항)
- **Background Sync**: 오프라인 상태에서 데이터 동기화

---

## 🔧 **개발자를 위한 고급 정보**

### **Airtable CMS 연동 시스템**

#### **자동 폴백 시스템**
```typescript
// Airtable 연동 실패 시 자동으로 로컬 데이터 사용
const artworks = await getArtworks() || fallbackArtworksData
```

#### **실시간 캐싱 전략**
- **Memory Cache**: 세션 내 데이터 재사용
- **SWR Pattern**: Stale-While-Revalidate 전략
- **ISR (Incremental Static Regeneration)**: 정적 페이지 점진적 업데이트

### **컴포넌트 아키텍처**

#### **Design System Components**
```typescript
// Phase별 Hero 컴포넌트
<ZenBrutalistHeroPhase1 
  navigation={{ next: '/immersive-demo' }}
  enableInteraction={true}
/>

// Variant 기반 Artwork Card
<ZenBrutalistArtworkCard
  variant="zen|brutal|glass-ink|fusion"
  immersionLevel="subtle|moderate|intense|maximum"
  traditionalDepth={true}
/>
```

#### **실시간 상호작용 시스템**
```typescript
// 마우스 추적 기반 동적 배경
const handleMouseMove = useCallback((e: MouseEvent) => {
  const x = e.clientX / window.innerWidth
  const y = e.clientY / window.innerHeight
  setDynamicBackground(`radial-gradient(
    circle at ${x * 100}% ${y * 100}%,
    hsla(var(--ink) / 0.08) 0%,
    transparent 70%
  )`)
}, [])
```

### **테스트 전략**

#### **단위 테스트 (Unit Tests)**
```bash
# 컴포넌트 테스트
npm run test -- --testPathPattern=components

# 유틸리티 함수 테스트  
npm run test -- --testPathPattern=lib

# 커버리지 확인 (90%+ 목표)
npm run test:coverage
```

#### **통합 테스트 (Integration Tests)**
```bash
# API 연동 테스트
npm run test -- --testPathPattern=api

# 페이지 렌더링 테스트
npm run test -- --testPathPattern=pages
```

#### **E2E 테스트 (End-to-End)**
```bash
# 사용자 시나리오 테스트
npm run test:e2e

# 시각적 회귀 테스트
npm run test:visual
```

---

## 📊 **성능 지표**

### **Core Web Vitals**
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### **Lighthouse Scores**
- **Performance**: 95+ / 100
- **Accessibility**: 100 / 100
- **Best Practices**: 100 / 100
- **SEO**: 100 / 100

### **번들 사이즈**
- **Initial Bundle**: < 100KB (gzipped)
- **Runtime Bundle**: < 50KB (gzipped)
- **Image Optimization**: WebP/AVIF 자동 변환

---

## 🚀 **배포 및 운영**

### **Vercel 배포 설정**

```bash
# 프로덕션 배포
npm run deploy

# 프리뷰 배포 (PR 자동 배포)
npm run deploy:preview

# 환경별 배포
vercel --prod                    # 프로덕션
vercel                          # 프리뷰
```

### **환경 변수 (Vercel Dashboard)**
```bash
# 필수 환경 변수
AIRTABLE_API_KEY=key***********     # Airtable API 키
AIRTABLE_BASE_ID=app***********     # Base ID
NEXT_PUBLIC_SITE_URL=https://***    # 사이트 URL

# 선택적 환경 변수  
NEXT_PUBLIC_GA_ID=G-**********      # Google Analytics
VERCEL_URL=***.vercel.app           # Vercel 자동 생성
```

### **모니터링 및 분석**
- **Vercel Analytics**: 실시간 성능 모니터링
- **Google Analytics**: 사용자 행동 분석 (선택사항)
- **Error Reporting**: 자동 에러 수집 및 알림
- **Performance Monitoring**: Core Web Vitals 추적

---

## 🎨 **작품 컬렉션 정보**

### **현재 컬렉션** (58점)
- **제작 기간**: 2021-2025년 (5년간)
- **주요 테마**: "길(Way)"의 다양한 해석과 인생 여정
- **장르**: 현대 서예, 전통 서예, 실험적 서예
- **재료**: 지본채색, 지본묵서, 견본채색, 한지에 먹 등
- **크기**: 소품(30×40cm)부터 대작(140×280cm)까지 다양

### **작품 카테고리**
- **자연 시리즈**: 계절감과 자연의 변화 표현
- **철학 시리즈**: 인생의 깊이와 성찰 담은 작품
- **감정 시리즈**: 기쁨, 슬픔, 그리움 등 인간의 감정
- **전통 재해석**: 고전 시가를 현대적 감각으로 재해석

---

## 🔮 **향후 개발 계획**

### **Phase 4: AI Integration (계획 중)**
- **AI 기반 작품 추천**: 사용자 선호도 학습
- **가상 큐레이션**: AI 큐레이터 시스템
- **인터랙티브 서예**: 실시간 서예 체험

### **Phase 5: VR/AR Experience (연구 중)**
- **가상 갤러리**: 3D 몰입형 갤러리 투어
- **AR 작품 배치**: 실제 공간에 작품 배치 시뮬레이션
- **VR 서예 체험**: 가상현실 서예 워크샵

### **추가 기능 개발**
- **다국어 지원**: 영어, 일본어, 중국어 번역
- **소셜 기능**: 작품 댓글, 공유, 좋아요
- **이커머스**: 작품 판매 및 결제 시스템
- **교육 플랫폼**: 온라인 서예 강좌

---

## 🙏 **기여 및 후원**

### **작가 정보**
- **작가명**: 아남 배옥영 (ANAM Bae Ok Young, b.1955)
- **작가호**: 芽南 (아남)
- **전문 분야**: 현대 서예, 전통 서예, 문인화

### **갤러리 정보**
- **갤러리명**: ANAM Calligraphy Gallery
- **설립년도**: 2024년
- **미션**: 전통 서예와 현대 기술의 융합을 통한 새로운 예술 경험 제공

### **개발팀**
- **Design System**: Zen Brutalism Foundation
- **Technical Stack**: Next.js 15 + React 19 + TypeScript
- **Powered by**: Claude Code AI Assistant

---

## 📄 **라이선스 및 저작권**

- **소프트웨어**: MIT License
- **작품 저작권**: 아남 배옥영 작가 (All Rights Reserved)
- **디자인 시스템**: Zen Brutalism Foundation (Open Source)

---

> 🎨 **"전통의 깊이와 현대적 몰입감을 동시에 제공하는 혁신적인 디지털 갤러리"** 🌍
> 
> **Zen Brutalism Foundation**을 통해 한국 전통 서예의 아름다움을 전 세계와 공유합니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jlinsights/ANAM)