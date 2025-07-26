# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

HEELANG is a Next.js-based exhibition website for Korean calligraphy artist 희랑
공경순 (Kong Kyung Soon). The project showcases her personal exhibition "길
(Way)" featuring 25+ contemporary calligraphy artworks with modern Korean
aesthetic.

## Development Commands

### Core Commands

```bash
# Development
npm run dev              # Start development server (localhost:3000)
npm run dev:turbo        # Start with Turbo mode

# Build & Deploy
npm run build            # Production build
npm run start            # Production server
npm run deploy           # Deploy to Vercel production
npm run deploy:preview   # Deploy to Vercel preview

# Quality & Testing
npm run lint             # ESLint code checking
npm run type-check       # TypeScript type checking
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report
npm run test:ci          # CI-optimized test run

# Asset Management
npm run optimize-images  # Optimize artwork images
```

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui components
- **CMS**: Airtable for artwork and artist data management
- **Images**: Optimized WebP/AVIF with responsive sizing
- **Deployment**: Vercel with ISR (Incremental Static Regeneration)

### Directory Structure

```
HEELANG/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (Airtable integration)
│   ├── gallery/           # Gallery pages with [slug] dynamic routes
│   ├── artist/            # Artist profile page
│   └── layout.tsx         # Root layout with theme provider
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui base components
│   ├── artwork-card.tsx  # Gallery artwork display
│   └── site-header.tsx   # Navigation with language switcher
├── lib/                  # Core utilities and data management
│   ├── airtable.ts       # Airtable CMS integration
│   ├── artworks.ts       # Artwork data with fallback system
│   ├── types.ts          # TypeScript interfaces
│   └── image-utils.ts    # Image optimization utilities
└── public/Images/        # Artwork assets organized by year
```

### Data Management System

The project uses a sophisticated dual-data system:

1. **Primary Data Source**: Airtable CMS
   - `Artworks` table: artwork metadata, descriptions, artist notes
   - `Artist` table: artist bio, exhibitions, awards, contact info
   - Environment variables: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`

2. **Fallback System**: Local static data in `lib/artworks.ts`
   - Ensures site functionality even if Airtable is unavailable
   - Contains 25+ predefined artworks with complete metadata

3. **Image Management**:
   - Local images in `/public/Images/Artworks/{year}/`
   - Multiple sizes: `-thumb.jpg`, `-medium.jpg`, `-large.jpg`
   - Responsive image loading with WebP optimization

### Key Features

- **Bilingual Support**: Korean/English with potential for Japanese/Chinese
- **Responsive Gallery**: 4x3 grid (desktop) → 2x6 grid (mobile)
- **Search & Filter**: Real-time artwork filtering by title, year, medium
- **Lightbox Modal**: Full-screen artwork viewing with artist notes
- **PWA Support**: Installable as mobile app with offline functionality
- **Dark/Light Theme**: User preference with system detection

## Environment Setup

### Required Environment Variables

```bash
# Airtable Integration (optional - falls back to local data)
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id

# Production URLs
NEXT_PUBLIC_SITE_URL=https://heelang.vercel.app
```

### Development Workflow

1. Environment setup: Node.js 18+, npm install
2. Start development: `npm run dev`
3. Code quality: Always run `npm run lint` and `npm run type-check` before
   commits
4. Testing: Use `npm run test:coverage` to ensure adequate test coverage
5. Images: Use `npm run optimize-images` when adding new artwork images

## Testing Strategy

- **Unit Tests**: Jest + Testing Library for components
- **Coverage Target**: 70% minimum across functions, lines, branches, statements
- **Test Files**: `__tests__/` directory and `*.test.tsx` files
- **Mocking**: Airtable API calls mocked for reliable testing

## Deployment Notes

- **Platform**: Vercel with automatic deployments from git
- **ISR**: Uses Next.js ISR with `revalidateTag("artworks")` for cache
  invalidation
- **Performance**: Image optimization, bundle splitting, CDN delivery
- **Security**: CSP headers, XSS protection, secure asset handling

## Common Development Tasks

### Adding New Artwork

1. Add optimized images to `/public/Images/Artworks/{year}/`
2. Update Airtable `Artworks` table OR modify `fallbackArtworksData` in
   `lib/artworks.ts`
3. Ensure slug follows pattern: `heelang-{title}-{year}`

### Modifying Gallery Layout

- Gallery pagination: 12 items per page
- Grid responsive breakpoints: `lib/constants.ts`
- Card component: `components/artwork-card.tsx`

### Theme/Styling Changes

- Tailwind config: `tailwind.config.ts`
- Global styles: `app/globals.css`
- Theme provider: `components/theme-provider.tsx`

## Performance Considerations

- Images automatically optimized to WebP/AVIF
- Bundle analysis available via `@next/bundle-analyzer`
- Lazy loading implemented for artwork galleries
- Cache strategies: memory cache + localStorage for client-side data

## 문제 분석

배포 로그에 따르면 빌드는 성공했으나, **타입스크립트 에러**와 **ESLint
미설치**로 인해 최종적으로 빌드가 실패했습니다.

### 주요 에러 요약

1. **ESLint 미설치**

   ```
   ESLint must be installed in order to run during builds: npm install --save-dev eslint
   ```

   - 빌드 시 ESLint가 필요하지만 설치되어 있지 않습니다.

2. **zustand 패키지 미설치**
   ```
   Type error: Cannot find module 'zustand' or its corresponding type declarations.
   import { create } from 'zustand'
   ```

   - `lib/store/ui-store.ts`에서 `zustand`를 import하고 있으나, 해당 패키지가
     설치되어 있지 않습니다.

---

## 해결 방법

### 1. ESLint 설치

```bash
npm install --save-dev eslint
```

### 2. zustand 및 타입 선언 설치

```bash
npm install zustand
npm install --save-dev @types/zustand
```

> 참고: zustand는 타입이 내장되어 있어 @types/zustand는 필요 없을 수 있습니다.
> 그래도 타입 에러가 나면 같이 설치하세요.

---

## 권장 순서

1. 위 명령어로 필요한 패키지 설치
2. 다시 `npm run build && npm run deploy` 실행

---

## 추가 설명 (주니어 개발자용)

- **ESLint**는 코드 스타일과 잠재적 오류를 미리 잡아주는 도구입니다. Next.js
  빌드 시 기본적으로 실행됩니다.
- **zustand**는 리액트 상태 관리 라이브러리입니다. 해당 파일에서 사용 중이므로
  반드시 설치해야 합니다.
- 패키지가 없으면 import 시점에서 타입스크립트가 에러를 발생시키고, 빌드가
  중단됩니다.

---

## 다음 단계

1. 아래 명령어를 차례로 실행해 주세요:
   ```bash
   npm install --save-dev eslint
   npm install zustand
   ```
   (필요시)
   ```bash
   npm install --save-dev @types/zustand
   ```
2. 설치가 끝나면 다시 빌드 및 배포:
   ```bash
   npm run build && npm run deploy
   ```

---

문제가 계속된다면, 추가 에러 메시지를 공유해 주세요!
