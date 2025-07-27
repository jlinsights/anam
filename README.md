# 🎨 아남 배옥영 작가 서예 갤러리

> 배옥영 작가의 현대 서예 작품을 온라인으로 감상할 수 있는 디지털 갤러리

전통 서예의 정신과 현대적 감각이 조화를 이루는 서예 작품을 온라인으로 경험할 수 있는 웹 갤러리입니다.

---

## 🆕 최근 업데이트/개선 사항

- **아티스트 프로필 이미지 최적화**
  - 원본 PNG에서 배경 제거(누끼) 후, 다양한 크기의 JPG(large/medium/thumb)로
    변환
  - 모든 코드/경로에서 소문자 및 일관된 파일명(`artist-large.jpg` 등) 사용
  - 배포 환경(리눅스 서버)에서의 대소문자 구분 문제 예방
- **Exhibition(전시) 아이콘 다크모드 가독성 개선**
  - Tailwind의 `text-white dark:text-paper` 클래스로 아이콘 색상 일관성 확보
- **정적 자산 관리 및 배포 안정성 강화**
  - git을 통한 이미지/정적 파일 복구 및 관리 방법 적용
  - 빌드/배포 전, 모든 이미지 경로와 파일 존재 여부 점검
  - 배포 후, CDN 캐시/브라우저 캐시 문제 대응(강력 새로고침, 시크릿 모드 활용)

---

### 📸 이미지 및 정적 자산 관리 가이드

- **이미지 최적화**
  - `public/Images/Artist/` 및 `public/Images/Artworks/` 내 모든 파일은 소문자,
    일관된 네이밍 사용
  - PNG → JPG 변환 시, 배경색(흰색) 지정 및 WebP 자동 변환 지원
  - 필요시 `rembg`, `convert`(ImageMagick) 등 툴 활용
- **경로 일관성**
  - 코드 내 이미지 참조는 항상 소문자 경로 사용 (예:
    `/images/artist/artist-large.jpg`)
  - 대소문자 혼용 시, 배포 서버에서 404 에러 발생 가능
- **파일 복구/관리**
  - git을 통한 파일 복구: `git checkout <commit> -- <경로>`
  - 불필요한 파일/이미지 삭제 후, 최적화된 파일만 커밋

---

### 🚀 빌드/배포 체크리스트

- [ ] 모든 이미지/정적 파일이 git에 커밋되어 있는지 확인
- [ ] 코드 내 경로와 실제 파일명이 일치하는지 점검(특히 대소문자)
- [ ] 빌드/배포 후, 실제 서비스에서 이미지/아이콘이 정상 노출되는지 확인
- [ ] 캐시 문제 발생 시, 강력 새로고침(Shift+Reload) 또는 시크릿 모드로 테스트
- [ ] 에러 발생 시, git을 통한 파일 복구 및 경로 재점검

---

### 👩‍💻 Junior 개발자를 위한 실전 팁

- **이미지 최적화와 경로 관리**는 배포 환경에서의 에러(404, 누락 등) 예방에 매우
  중요합니다.
- **정적 자산은 항상 git으로 관리**하고, 불필요한 파일은 주기적으로 정리하세요.
- **배포 전/후 체크리스트**를 습관화하면, 운영 중 장애를 크게 줄일 수 있습니다.

---

## ✨ 주요 기능

- 🎨 **작품 갤러리**: 25점의 서예 작품을 4x3 그리드로 감상
- 🔍 **작품 검색/필터**: 제목, 년도, 재료별 실시간 검색 및 필터링
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- 🌙 **다크/라이트 테마**: 사용자 환경에 맞는 테마 선택
- 🚀 **PWA 지원**: 모바일 앱처럼 설치 및 오프라인 사용 가능
- 🖼️ **이미지 라이트박스(모달)**: 작품 상세페이지에서 작품 이미지를 클릭하면
  전체화면 모달로 크게 감상 가능
- 📝 **작가노트(artistNote) 지원**: 작품 상세페이지에서 작품 설명 아래에
  작가노트가 있을 경우 함께 표시
- 👩‍🎨 **아티스트 프로필**: Cloudflare Images + Airtable 연동, 모바일 최적화,
  연락처(인스타그램/이메일/전화) 세로 정렬
- 🛡️ **에러 처리/폴백**: Airtable 연동 실패 시 로컬 데이터 폴백, 에러 바운더리
  적용
- 🧑‍💻 **접근성/키보드 네비게이션**: WCAG 2.1 AA, 키보드 조작 지원

## 🚀 라이브 사이트

**배포 URL**: [https://anam.orientalcalligraphy.org](https://anam.orientalcalligraphy.org)

[![Powered by Vercel](https://img.shields.io/badge/Powered%20by-Vercel-black)](https://vercel.com)

## 🛠 기술 스택

- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React 19 Hooks
- **Build Tool**: Turbopack
- **Deployment**: Vercel
- **Testing**: Jest + Testing Library

## 📱 갤러리 레이아웃

### 반응형 그리드 시스템

- **데스크톱 (1024px+)**: 4열 × 3행 = 12개 작품
- **태블릿 (768px-1023px)**: 3열 × 4행 = 12개 작품
- **모바일 (~767px)**: 2열 × 6행 = 12개 작품

### 페이지네이션

- 페이지당 12개 작품 표시
- 직관적인 이전/다음 버튼
- 페이지 번호 네비게이션 (최대 5개)
- 전체 작품 수 및 현재 위치 정보

## 📁 프로젝트 구조

```
ANAM/
├── app/                   # App Router 구조
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   ├── gallery/           # 갤러리 섹션
│   │   ├── page.tsx       # 갤러리 메인
│   │   ├── gallery-client.tsx # 클라이언트 컴포넌트
│   │   ├── loading.tsx    # 로딩 UI
│   │   └── [slug]/        # 개별 작품 페이지
│   ├── artists/           # 작가 소개
│   ├── exhibition/        # 전시 정보
│   ├── contact/           # 연락처
│   └── offline/           # 오프라인 페이지
├── components/            # 재사용 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── animations/       # 애니메이션 컴포넌트
│   ├── optimized-image.tsx # 최적화된 이미지
│   ├── search-filter.tsx # 검색 필터
│   └── theme-toggle.tsx  # 테마 토글
├── lib/                  # 유틸리티 및 데이터
│   ├── artworks.ts       # 작품 데이터
│   ├── utils.ts          # 공통 유틸리티
│   └── types.ts          # 타입 정의
├── styles/               # 스타일 파일
├── public/               # 정적 자산
│   ├── images/           # 작품 이미지
│   └── icons/            # 아이콘
└── scripts/              # 빌드 스크립트
    └── optimize-images.js # 이미지 최적화
```

## 🏃‍♂️ 로컬 개발

### 시작하기

```bash
# 저장소 클론
git clone https://github.com/jlinsights/ANAM.git
cd ANAM

# 의존성 설치
npm install

# 개발 서버 실행 (localhost:3000)
npm run dev
```

### 개발 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm start

# 린팅
npm run lint

# 테스트 실행
npm test

# 테스트 (watch 모드)
npm run test:watch

# 커버리지 확인
npm run test:coverage

# 이미지 최적화
npm run optimize-images
```

### 배포 명령어

```bash
# Vercel 프로덕션 배포
npm run deploy

# Vercel 프리뷰 배포
npm run deploy:preview
```

## 🎯 페이지별 기능

### 메인 페이지 (`/`)

- 전시 소개 및 컨셉
- 주요 작품 하이라이트
- 전시 정보 요약
- 갤러리 바로가기

### 갤러리 (`/gallery`)

- **4x3 그리드 레이아웃**: 한 페이지에 12개 작품
- **실시간 검색**: 제목, 년도, 재료별 필터링
- **키보드 네비게이션**: 화살표 키로 작품 탐색
- **페이지네이션**: 전체 작품을 페이지별로 구성

### 작품 상세 (`/gallery/[slug]`)

- 고해상도 작품 이미지
- **이미지 클릭 시 전체화면 라이트박스(모달)**
- 상세 작품 정보 (제목, 년도, 재료, 크기)
- **작가노트(artistNote) 표시**: 작품 설명 아래에 artistNote가 있을 경우 함께
  노출
- 이전/다음 작품 네비게이션

### 작가 소개 (`/artist`)

- Cloudflare Images 기반 프로필 이미지(모바일 최적화)
- 이름, 직함, 소개, "작가 소개 더보기" 버튼
- **연락처(인스타그램/이메일/전화) 세로 정렬**
- 전시 경력 및 수상 내역

### 전시 정보 (`/exhibition`)

- 전시 개요 및 기획 의도
- 후원 기관 정보
- 전시 일정 및 관련 행사

## 🎨 작품 컬렉션

총 **25점**의 서예 작품으로 구성:

- **주제**: "길(Way)"의 다양한 해석
- **장르**: 현대 서예, 전통 서예
- **재료**: 지본채색, 지본묵서, 견본채색 등
- **크기**: 다양한 규격의 작품들

## 🌟 주요 특징

### 성능 최적화

- **Next.js App Router**: 최신 React 19 기능 활용
- **이미지 최적화**: 자동 WebP 변환 및 레이지 로딩
- **번들 분석**: @next/bundle-analyzer로 성능 모니터링
- **Vercel Edge**: 전 세계 CDN을 통한 빠른 로딩

### 접근성 (Accessibility)

- **WCAG 2.1 AA 준수**: 스크린 리더 지원
- **키보드 네비게이션**: 모든 기능을 키보드로 조작 가능
- **고대비 모드**: 시각 장애인을 위한 테마
- **의미론적 HTML**: 검색 엔진 최적화

### 사용자 경험 (UX)

- **Progressive Web App**: 모바일 앱처럼 설치 가능
- **오프라인 지원**: 네트워크 없이도 기본 탐색 가능
- **부드러운 애니메이션**: Framer Motion을 활용한 자연스러운 전환
- **직관적 UI**: 미니멀한 디자인으로 작품에 집중

## 🔧 개발자를 위한 정보

### 기술적 특징

- **TypeScript 5**: 완전한 타입 안정성
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Radix UI**: 헤드리스 UI 컴포넌트
- **React 19**: 최신 React 기능 활용
- **ESLint + Prettier**: 코드 품질 관리

### 테스트

- **Unit Tests**: Jest + Testing Library
- **Component Tests**: React 컴포넌트 테스트
- **E2E Tests**: 사용자 시나리오 테스트
- **Visual Regression**: 스크린샷 기반 테스트

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 후원 및 지원

**작가**: 아남 배옥영  
**갤러리**: ANAM Calligraphy Gallery

---

> 🎨 **전통 서예와 현대적 감각의 조화를 통해 독창적인 작품 세계를 
> 전 세계와 공유합니다** 🌍

[![Korean Calligraphy](https://img.shields.io/badge/Korean-Calligraphy-red)](https://github.com/jlinsights/ANAM)
[![Modern Art](https://img.shields.io/badge/Modern-Art-blue)](https://github.com/jlinsights/ANAM)
[![Digital Gallery](https://img.shields.io/badge/Digital-Gallery-green)](https://github.com/jlinsights/ANAM)

## 프로젝트 개요

아남 배옥영 작가의 현대 서예 작품을 위한 Next.js 기반 디지털 서예 갤러리입니다.

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **CMS**: Airtable (작품 및 작가 정보 관리)
- **Deployment**: Vercel

## Airtable 연동 설정

### 1. Airtable Base 설정

Airtable에서 다음과 같은 구조로 Base를 생성하세요:

#### Artworks 테이블

- `id` (Single line text) - 작품 고유 ID
- `slug` (Single line text) - URL용 슬러그
- `title` (Single line text) - 작품 제목
- `year` (Number) - 제작 연도
- `medium` (Single line text) - 재료/기법
- `dimensions` (Single line text) - 작품 크기
- `aspectRatio` (Single line text) - 종횡비 (예: "2/1", "1/1", "5/7")
- `description` (Long text) - 작품 설명
- `imageUrl` (URL) - 작품 이미지 URL
- `imageUrlQuery` (Single line text) - 이미지 쿼리 파라미터 (선택사항)
- `artistNote` (Long text) - 작가 노트 (선택사항)
- `featured` (Checkbox) - 대표작 여부
- `category` (Single line text) - 카테고리 (선택사항)
- `tags` (Multiple select) - 태그 (선택사항)
- `price` (Number) - 가격 (선택사항)
- `available` (Checkbox) - 판매 가능 여부 (선택사항)

#### Artist 테이블

- `name` (Single line text) - 작가명
- `bio` (Long text) - 작가 약력
- `statement` (Long text) - 작가 노트
- `profileImageUrl` (URL) - 프로필 이미지 URL
- `birthYear` (Number) - 출생년도 (선택사항)
- `education` (Multiple select) - 학력 (선택사항)
- `exhibitions` (Multiple select) - 전시 이력 (선택사항)
- `awards` (Multiple select) - 수상 이력 (선택사항)
- `collections` (Multiple select) - 소장처 (선택사항)
- `website` (URL) - 개인 웹사이트 (선택사항)
- `socialLinks` (Long text) - 소셜 링크 JSON 형태 (선택사항)

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# Airtable 설정
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here

# 또는 클라이언트 사이드에서 사용하려면 (권장하지 않음)
# NEXT_PUBLIC_AIRTABLE_API_KEY=your_airtable_api_key_here
# NEXT_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id_here
```

### 3. Airtable API 키 및 Base ID 확인 방법

1. **API 키 확인**:
   - [Airtable Account](https://airtable.com/account) 페이지 접속
   - "Generate API key" 클릭하여 API 키 생성
   - 생성된 키를 복사

2. **Base ID 확인**:
   - [Airtable API Documentation](https://airtable.com/api) 접속
   - 해당 Base 선택
   - URL에서 `app` 뒤의 문자열이 Base ID (예: `appXXXXXXXXXXXXXX`)

### 4. 데이터 구조 예시

#### Artworks 테이블 예시 데이터:

```
id: "1"
slug: "way"
title: "길"
year: 2025
medium: "한지에 먹"
dimensions: "70×140cm"
aspectRatio: "1/2"
description: "인생의 여정을 표현한 작품"
imageUrl: "/Images/Artworks/2025/heelang-way-2025.jpg"
featured: true
```

#### Artist 테이블 예시 데이터:

```
name: "아남 배옥영 (ANAM Bae Ok Young)"
bio: "한국의 전통 서예와 현대적 감각을 결합한 독창적인 작품 세계를 구축하고 있는 서예 작가입니다..."
statement: "전통 서예의 정신을 바탕으로 현대적 감각을 더하여, 과거와 현재가 조화를 이루는 작품을 추구합니다..."
profileImageUrl: "/Images/Artist/배옥영.jpeg"
```

## 로컬 개발 환경 설정

1. 의존성 설치:

```bash
npm install
```

2. 개발 서버 실행:

```bash
npm run dev
```

3. 브라우저에서 `http://localhost:3000` 접속

## 주요 기능

- **Airtable CMS 연동**: 작품과 작가 정보를 Airtable에서 동적으로 관리
- **반응형 갤러리**: 모바일부터 데스크톱까지 최적화된 갤러리 뷰
- **다크/라이트 모드**: 사용자 선호에 따른 테마 전환
- **SEO 최적화**: 메타데이터 및 구조화된 데이터 지원
- **성능 최적화**: 이미지 최적화 및 지연 로딩
- **에러 처리**: 포괄적인 에러 바운더리 및 폴백 시스템

## 배포

Vercel을 통한 배포 시 환경 변수를 Vercel 대시보드에서 설정해야 합니다:

1. Vercel 프로젝트 설정 → Environment Variables
2. `AIRTABLE_API_KEY`와 `AIRTABLE_BASE_ID` 추가
3. Production, Preview, Development 환경에 모두 적용

## 폴백 시스템

Airtable 연동이 실패하거나 환경 변수가 설정되지 않은 경우, `lib/artworks.ts`의
로컬 데이터를 사용합니다. 이를 통해 개발 환경에서도 안정적으로 작동합니다.

## 라이선스

이 프로젝트는 아남 배옥영 작가의 서예 갤러리를 위한 전용 웹사이트입니다.
