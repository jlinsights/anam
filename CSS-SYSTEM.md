# HEELANG CSS 시스템 가이드

## 개요

HEELANG 프로젝트의 통합 CSS 시스템은 서예 예술에 특화된 디자인 토큰과 컴포넌트를
제공합니다.

## 색상 시스템

### 기본 색상 팔레트

#### 1. 먹(墨) - Ink Colors

```css
--ink: 222.2 47.4% 11.2% /* 기본 먹색 */ --ink-light: 215.4 16.3% 46.9%
  /* 연한 먹색 */ --ink-lighter: 210 20% 65% /* 더 연한 먹색 */
  --ink-dark: 222.2 84% 4.9% /* 진한 먹색 */;
```

#### 2. 종이(紙) - Paper Colors

```css
--paper: 0 0% 100% /* 기본 종이색 */ --paper-warm: 30 40% 98%
  /* 따뜻한 종이색 */ --paper-cream: 45 25% 96% /* 크림 종이색 */
  --paper-aged: 40 15% 92% /* 오래된 종이색 */;
```

#### 3. 붓(筆) - Brush Colors

```css
--brush: 25 30% 25% /* 기본 붓색 */ --brush-light: 25 20% 45% /* 연한 붓색 */
  --brush-dark: 25 40% 15% /* 진한 붓색 */;
```

#### 4. 돌(石) - Stone Colors

```css
--stone: 210 15% 85% /* 기본 돌색 */ --stone-light: 210 20% 90% /* 연한 돌색 */
  --stone-dark: 210 25% 75% /* 진한 돌색 */;
```

#### 5. 금(金) - Gold Colors

```css
--gold: 45 100% 50% /* 기본 금색 */ --gold-light: 45 100% 70% /* 연한 금색 */
  --gold-dark: 45 100% 30% /* 진한 금색 */;
```

## 유틸리티 클래스

### 색상 유틸리티

```css
/* 텍스트 색상 */
.text-ink, .text-ink-light, .text-ink-lighter, .text-ink-dark
.text-brush, .text-brush-light, .text-brush-dark
.text-gold, .text-gold-light, .text-gold-dark

/* 배경 색상 */
.bg-paper, .bg-paper-warm, .bg-paper-cream, .bg-paper-aged
.bg-stone, .bg-stone-light, .bg-stone-dark
.bg-gold, .bg-gold-light, .bg-gold-dark
```

### 그라디언트 유틸리티

```css
.bg-gradient-ink     /* 먹 그라디언트 */
.bg-gradient-paper   /* 종이 그라디언트 */
.bg-gradient-zen     /* 선(禪) 그라디언트 */
```

## 컴포넌트 클래스

### 버튼 컴포넌트

```css
.btn-art           /* 기본 예술 버튼 */
.btn-art-outline   /* 아웃라인 예술 버튼 */
.btn-art-ghost     /* 고스트 예술 버튼 */
```

### 카드 컴포넌트

```css
.card-art          /* 기본 예술 카드 */
.card-art-elevated /* 강조된 예술 카드 */
```

### 레이아웃 유틸리티

```css
.container-art     /* 예술 작품용 컨테이너 */
.section-padding   /* 기본 섹션 패딩 */
.section-padding-sm /* 작은 섹션 패딩 */
```

## 애니메이션 클래스

### 기본 애니메이션

```css
.animate-fade-in        /* 페이드 인 */
.animate-slide-in-left  /* 왼쪽에서 슬라이드 */
.animate-slide-in-right /* 오른쪽에서 슬라이드 */
.animate-slide-in-up    /* 아래에서 슬라이드 */
```

### 서예 전용 애니메이션

```css
.animate-brush-in   /* 붓 터치 효과 */
.animate-ink-drop   /* 먹 방울 효과 */
.animate-paper-fold /* 종이 접기 효과 */
.animate-zen-float  /* 선적 부유 효과 */
```

## 타이포그래피

### 폰트 패밀리

```css
font-display      /* Noto Serif KR - 제목용 */
font-body         /* Inter - 본문용 */
font-calligraphy  /* Noto Serif KR - 서예용 */
```

### 서예 스타일

```css
.text-calligraphy /* 서예 스타일 텍스트 */
.text-zen         /* 선적 스타일 텍스트 */
```

## 반응형 텍스트

```css
.text-responsive-xs   /* 12px → 14px */
.text-responsive-sm   /* 14px → 16px */
.text-responsive-base /* 16px → 18px */
.text-responsive-lg   /* 18px → 24px */
.text-responsive-xl   /* 20px → 32px */
.text-responsive-2xl  /* 24px → 48px */
.text-responsive-3xl  /* 32px → 96px */
```

## 효과 클래스

### 텍스트 효과

```css
.text-shadow-soft    /* 부드러운 그림자 */
.text-shadow-medium  /* 중간 그림자 */
.text-shadow-strong  /* 강한 그림자 */
.text-shadow-glow    /* 글로우 효과 */
```

### 호버 효과

```css
.hover-lift   /* 호버 시 상승 */
.hover-glow   /* 호버 시 글로우 */
.hover-scale  /* 호버 시 확대 */
```

### 글래스모피즘

```css
.glass        /* 기본 글래스 효과 */
.glass-strong /* 강한 글래스 효과 */
```

## 접근성

### 포커스 스타일

```css
.focus-art /* 예술적 포커스 스타일 */
```

### 고대비 모드 지원

- 고대비 모드에서 자동으로 테두리 강화
- 접근성 개선을 위한 자동 조정

## 성능 최적화

### Tailwind 설정

- 사용하지 않는 플러그인 비활성화 (float, clear, skew)
- Safelist로 동적 클래스 보호
- 실험적 최적화 기능 활성화

### 최적화된 CSS 번들

- 중복 제거된 단일 CSS 파일
- 트리 셰이킹으로 사용되지 않는 스타일 제거
- 압축된 CSS 변수 시스템

## 사용 예시

```tsx
// 기본 서예 카드
<div className="card-art">
  <h3 className="text-ink font-display">작품 제목</h3>
  <p className="text-ink-light">작품 설명</p>
</div>

// 예술적 버튼
<button className="btn-art">
  작품 보기
</button>

// 그라디언트 배경
<section className="bg-gradient-zen section-padding">
  <h2 className="text-responsive-2xl text-calligraphy">전시 소개</h2>
</section>
```

## 마이그레이션 가이드

### 하드코딩된 색상을 CSS 변수로 변경

```css
/* 변경 전 */
background-color: #222222;
color: #fcfcfc;

/* 변경 후 */
background-color: hsl(var(--ink));
color: hsl(var(--paper));
```

### Tailwind 클래스 사용

```tsx
// 변경 전
<div style={{backgroundColor: '#222222', color: '#fcfcfc'}}>

// 변경 후
<div className="bg-ink text-paper">
```

이 CSS 시스템을 통해 일관성 있고 접근 가능하며 성능 최적화된 서예 예술
웹사이트를 구축할 수 있습니다.
