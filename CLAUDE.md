# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

**ANAM Gallery** is a Next.js-based digital calligraphy gallery for Korean
artist 아남 배옥영 (ANAM Bae Ok Young). The project features an innovative **Zen
Brutalism Foundation** design system that combines traditional Korean aesthetic
principles with cutting-edge web technologies.

### 🚀 **BMad-Method Integration (Agent OS)**

The project now includes a comprehensive **bmad-method framework integration** through Agent OS, providing AI-assisted development methodology for creating a professional Korean calligraphy gallery platform:

**Key Features**:
- **Cultural Context Database**: AI-powered cultural analysis and educational content generation
- **Gallery Enhancement System**: Professional gallery features and advanced user experience design
- **Multi-Agent Orchestration**: Coordinated AI agents for specialized domain expertise
- **Quality Assurance Framework**: Comprehensive validation and expert review processes

**Agent OS Structure**:
```
.agent-os/
├── product/                    # Product specifications
│   ├── cultural-context-database.md
│   ├── gallery-enhancement.md
│   └── integration-plan.md
├── agents/                     # Specialized AI agents
│   ├── cultural-context-agent.md
│   ├── gallery-enhancement-agent.md
│   └── integration-coordinator.md
└── workflows/                  # Process workflows
    └── cultural-analysis.md
```

### 🎯 **Zen Brutalism Foundation Design Philosophy**

**Core Concept**: "전통의 깊이와 현대적 몰입감을 동시에 제공하는 UI/UX 디자인"
(UI/UX design that simultaneously provides traditional depth and modern
immersion)

**3-Phase Evolution System**:

- **Phase 1**: **백지의 시작** (White Space Foundation) - Zen minimalism +
  geometric brutalism
- **Phase 2**: **먹과 유리의 조화** (Ink & Glass Harmony) - Multi-layer glass
  morphism + fluid ink effects
- **Phase 3**: **전통의 깊이** (Traditional Depth) - Korean composition
  principles + cultural layers

## Development Commands

### Core Commands

```bash
# Development
npm run dev              # Start development server (localhost:3000)
npm run dev -- --port 3001  # Alternative port if 3000 is in use
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

### 🆕 **Zen Brutalism Development Commands**

```bash
# Demo Pages Development
npm run dev              # Access new demo pages:
                         # /zen-demo (Phase 1)
                         # /immersive-demo (Phase 2)
                         # /cultural-demo (Phase 3)

# Design System Testing
npm run test -- --testPathPattern=zen-brutalist     # Test design components
npm run test -- --testPathPattern=immersive         # Test interactive effects
npm run test -- --testPathPattern=cultural          # Test cultural integration
```

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript 5
- **Runtime**: React 19
- **Styling**: Tailwind CSS + **Zen Brutalism Foundation** custom theme
- **UI Components**: Radix UI + shadcn/ui + **Custom Design System**
- **CMS**: Airtable (58 artworks + artist data management)
- **Images**: Optimized WebP/AVIF with responsive sizing
- **Deployment**: Vercel with ISR (Incremental Static Regeneration)
- **Animation**: CSS Custom Properties + Transform3D + Mouse tracking

### 🆕 **Zen Brutalism Components**

#### **Hero Components**

- `ZenBrutalistHero` - Base hero component with phase-specific styling
- `ZenBrutalistHeroPhase1` - Foundation phase hero (zen minimalism)
- `ZenBrutalistHeroPhase2` - Immersion phase hero (glass morphism)
- `ZenBrutalistHeroPhase3` - Cultural phase hero (traditional integration)

#### **Artwork Card Components**

- `ZenBrutalistArtworkCard` - Phase 1: Zen + brutal design variants
- `ImmersiveArtworkCard` - Phase 2: Glass morphism + ink flow effects
- `CulturalArtworkCard` - Phase 3: Traditional composition + seasonal aesthetics

#### **Layout Components**

- `ZenBrutalistFooter` - Enhanced footer with cultural design integration
- Interactive mouse tracking and dynamic backgrounds
- Phase navigation with design evolution journey

### Directory Structure

```
ANAM/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (Airtable integration)
│   ├── gallery/                  # Gallery pages with [slug] dynamic routes
│   │   ├── page.tsx              # Main gallery (58 artworks)
│   │   └── [slug]/               # Individual artwork detail pages
│   ├── artist/                   # Artist profile page
│   ├── exhibition/               # Exhibition information
│   ├── contact/                  # Contact page
│   │
│   ├── zen-demo/                 # 🆕 Phase 1: Zen Foundation Demo
│   ├── immersive-demo/           # 🆕 Phase 2: Glass Immersion Demo
│   ├── cultural-demo/            # 🆕 Phase 3: Cultural Integration Demo
│   │
│   ├── layout.tsx                # Root layout with theme provider
│   └── globals.css               # 🆕 Zen Brutalism global styles
│
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui base components
│   │
│   ├── zen-brutalist-hero.tsx    # 🆕 Phase-specific hero sections
│   ├── zen-brutalist-footer.tsx  # 🆕 Cultural design footer
│   ├── zen-brutalist-artwork-card.tsx      # 🆕 Phase 1 artwork cards
│   ├── immersive-artwork-card.tsx          # 🆕 Phase 2 immersive cards
│   ├── cultural-artwork-card.tsx           # 🆕 Phase 3 cultural cards
│   │
│   ├── artwork-card.tsx          # Legacy gallery artwork display
│   ├── site-header.tsx           # Navigation with language switcher
│   └── theme-toggle.tsx          # Dark/light theme toggle
│
├── lib/                          # Core utilities and data management
│   ├── airtable.ts               # Airtable CMS integration
│   ├── artworks.ts               # Artwork data with fallback system (58 works)
│   ├── types.ts                  # TypeScript interfaces
│   ├── utils.ts                  # Common utilities
│   └── image-utils.ts            # Image optimization utilities
│
├── public/Images/                # Artwork assets organized by year
│   ├── Artworks/                 # 58 artwork images (2021-2025)
│   └── Artist/                   # Artist profile images
│
└── tailwind.config.ts            # 🆕 Zen Brutalism theme configuration
```

### Data Management System

The project uses a sophisticated dual-data system:

1. **Primary Data Source**: Airtable CMS
   - `Artworks` table: 58 artworks with metadata, descriptions, artist notes
   - `Artist` table: artist bio, exhibitions, awards, contact info
   - Environment variables: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`

2. **Fallback System**: Local static data in `lib/artworks.ts`
   - Ensures site functionality even if Airtable is unavailable
   - Contains 58 predefined artworks with complete metadata

3. **Image Management**:
   - Local images in `/public/Images/Artworks/{year}/`
   - Multiple sizes: `-thumb.jpg`, `-medium.jpg`, `-large.jpg`
   - Responsive image loading with WebP optimization

### 🎨 **Zen Brutalism Design System**

#### **Color Palette**

```css
/* Traditional Korean Colors */
--ink: 28 25 23 /* 먹색 - primary text */ --paper: 254 252 232
  /* 한지색 - background */ --gold: 168 85 27 /* 황금색 - accent */ --stone: 120
  113 108 /* 돌색 - secondary */ --brush: 87 83 74 /* 붓색 - neutral */
  /* Seasonal Colors (사계절 미학) */ --season-spring: 134 239 172
  /* 봄 - spring teal */ --season-summer: 74 222 128 /* 여름 - summer green */
  --season-autumn: 251 191 36 /* 가을 - autumn gold */ --season-winter: 156 163
  175 /* 겨울 - winter gray */;
```

#### **Typography Hierarchy**

```css
/* Zen Typography */
.zen-typography-display     /* 64px - main titles */
.zen-typography-hero        /* 48px - hero titles */
.zen-typography-section     /* 32px - section titles */
.zen-typography-body        /* 18px - body text */

/* Brutal Typography */
.brutal-typography-impact     /* Strong impact text */
.brutal-typography-statement  /* Declarative messages */
.brutal-typography-accent     /* Accent elements */
```

#### **Spacing System (여백의 미학)**

```css
/* Zen Breathing Scale */
--zen-xs: 0.5rem /* 8px - minimal breathing */ --zen-sm: 1rem
  /* 16px - basic breathing */ --zen-md: 2rem /* 32px - medium breathing */
  --zen-lg: 4rem /* 64px - deep breathing */ --zen-xl: 8rem
  /* 128px - meditative breathing */ --zen-2xl: 16rem
  /* 256px - absolute silence */ --zen-3xl: 24rem /* 384px - complete void */
  --zen-4xl: 32rem /* 512px - infinite space */;
```

#### **Interactive Effects**

- **Mouse Tracking**: Real-time cursor-based background effects
- **Glass Morphism**: 3-layer independent blur and saturation system
- **Fluid Ink**: Dynamic gradient animations mimicking traditional brush strokes
- **Cultural Layers**: Traditional Korean composition principles (삼분법,
  음양균형)

### Key Features

#### **🎨 Gallery & Artwork Management**

- **58 Artworks**: Real-time Airtable integration with local fallback
- **Responsive Grid**: 4x3 (desktop) → 3x4 (tablet) → 2x6 (mobile)
- **Advanced Search**: Real-time filtering by title, year, medium, category
- **Lightbox Modal**: Full-screen artwork viewing with keyboard navigation
- **Artist Notes**: Detailed artwork descriptions and creation intent

#### **🖱️ Interactive Experience**

- **Real-time Mouse Tracking**: Dynamic background effects responding to cursor
- **Multi-layer Glass Depth**: 3-stage independent blur and transparency
- **Fluid Ink Animation**: Digital recreation of traditional calligraphy brush
  strokes
- **Seasonal Aesthetics**: Four-season color changes and breathing space system

#### **🎯 User Experience (UX)**

- **Progressive Web App**: Mobile app-like installation and offline usage
- **Dark/Light Theme**: Automatic theme switching based on system preference
- **WCAG 2.1 AA Compliance**: Full screen reader and keyboard navigation support
- **Performance Optimization**: WebP image auto-conversion, lazy loading, CDN
  optimization

#### **🆕 Demo Pages**

- **`/zen-demo`**: Phase 1 zen minimalism showcase
- **`/immersive-demo`**: Phase 2 immersive glass + ink effects
- **`/cultural-demo`**: Phase 3 traditional cultural integration

## Environment Setup

### Required Environment Variables

```bash
# Airtable Integration (optional - falls back to local data)
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id

# Production URLs
NEXT_PUBLIC_SITE_URL=https://anam-gallery.vercel.app
```

### Development Workflow

1. **Environment setup**: Node.js 18+, npm install
2. **Start development**: `npm run dev` (or `npm run dev -- --port 3001` if port
   3000 is in use)
3. **Code quality**: Always run `npm run lint` and `npm run type-check` before
   commits
4. **Testing**: Use `npm run test:coverage` to ensure adequate test coverage
5. **Images**: Use `npm run optimize-images` when adding new artwork images
6. **🆕 Design System**: Test Zen Brutalism components in demo pages

## Testing Strategy

- **Unit Tests**: Jest + Testing Library for components
- **커버리지 하한 (래칫)**: `jest.config.js` 의 `coverageThreshold` 는 목표치가 아니라 지금 실측의 바닥값이다(2026-10-31 기준 약 4%). 테스트를 늘려 실측이 오르면 값을 올리고, 내리지 않는다
- **Test Files**: `__tests__/` directory and `*.test.tsx` files
- **Mocking**: Airtable API calls mocked for reliable testing
- **🆕 Design System Tests**: Specific tests for Zen Brutalism components and
  interactions

## Deployment Notes

- **Platform**: Vercel with automatic deployments from git
- **ISR**: Uses Next.js ISR with `revalidateTag("artworks")` for cache
  invalidation
- **Performance**: Image optimization, bundle splitting, CDN delivery
- **Security**: CSP headers, XSS protection, secure asset handling
- **🆕 Build Success**: Recent successful deployment with all Zen Brutalism
  components

## Common Development Tasks

### Adding New Artwork

1. Add optimized images to `/public/Images/Artworks/{year}/`
2. Update Airtable `Artworks` table OR modify `fallbackArtworksData` in
   `lib/artworks.ts`
3. Ensure slug follows pattern: `anam-{title}-{year}`

### 🆕 **Working with Zen Brutalism Components**

#### **Creating New Hero Sections**

```typescript
// Use preset configurations
<ZenBrutalistHeroPhase1
  navigation={{
    demo: { href: '/zen-demo#showcase', label: '디자인 시스템 탐험' },
    next: { href: '/immersive-demo', label: 'Phase 2' },
  }}
  enableInteraction={true}
/>

// Or create custom hero
<ZenBrutalistHero
  phase="2"
  title={{ main: "Custom Title", sub: "Subtitle" }}
  description={{ primary: "Description text" }}
  concept="CUSTOM CONCEPT"
  variant="fusion"
  enableInteraction={true}
/>
```

#### **Implementing Interactive Artwork Cards**

```typescript
// Phase 1: Zen Brutalism
<ZenBrutalistArtworkCard
  artwork={artwork}
  variant="zen|brutal|glass-ink|fusion"
  immersionLevel="subtle|moderate|intense|maximum"
  traditionalDepth={true}
  showMetadata={true}
/>

// Phase 2: Immersive Effects
<ImmersiveArtworkCard
  artwork={artwork}
  variant="zen-immersive|brutal-glass|ink-flow|depth-fusion"
  intensity="subtle|moderate|intense|maximum"
  culturalDepth={true}
  showActions={true}
/>

// Phase 3: Cultural Integration
<CulturalArtworkCard
  artwork={artwork}
  variant="traditional|seasonal|balanced|immersive"
  composition="centered|flowing|grid"
  culturalSeason="spring|summer|autumn|winter|eternal"
  depthLayer="foreground|middle|background|cultural|temporal"
  enableStroke={true}
  enableVoidBreathing={true}
/>
```

#### **Adding Mouse Tracking Interactions**

```typescript
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

const handleMouseMove = useCallback(
  (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !enableInteraction) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setMousePosition({ x, y })
  },
  [enableInteraction]
)

// Apply dynamic background
const dynamicBackground = {
  background: `radial-gradient(
    circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
    hsla(var(--ink) / 0.08) 0%,
    hsla(var(--gold) / 0.05) 40%,
    transparent 70%
  )`,
}
```

### Modifying Gallery Layout

- Gallery pagination: 12 items per page
- Grid responsive breakpoints: `tailwind.config.ts`
- Card component: `components/artwork-card.tsx` (legacy) or new Zen Brutalist
  cards
- **🆕 Demo layouts**: Check `/zen-demo`, `/immersive-demo`, `/cultural-demo`
  for advanced layouts

### Theme/Styling Changes

- **🆕 Zen Brutalism config**: `tailwind.config.ts` (extended with custom theme)
- Global styles: `app/globals.css` (includes Zen Brutalism classes)
- Theme provider: `components/theme-provider.tsx`
- **🆕 Custom animations**: Defined in `globals.css` with CSS custom properties

## Performance Considerations

- Images automatically optimized to WebP/AVIF
- Bundle analysis available via `@next/bundle-analyzer`
- Lazy loading implemented for artwork galleries
- Cache strategies: memory cache + localStorage for client-side data
- **🆕 Interactive optimizations**: Efficient mouse tracking and animation
  performance
- **🆕 Glass morphism performance**: Hardware-accelerated CSS transforms and
  filters

## 🆕 **Zen Brutalism Development Guidelines**

### **Design Principles**

1. **여백의 미학 (Void Aesthetics)**: Use the 8-stage breathing system for
   spacing
2. **브루탈리즘 구조 (Brutal Structure)**: Maintain geometric precision and
   strong contrasts
3. **글래스 모피즘 진화 (Glass Morphism Evolution)**: Implement 3-layer depth
   effects
4. **문화적 상호작용 (Cultural Interaction)**: Integrate traditional Korean
   composition principles

### **Component Development**

- Always implement both `enableInteraction` prop and non-interactive fallbacks
- Use consistent variant patterns: `zen|brutal|glass-ink|fusion`
- Include proper TypeScript interfaces for all props
- Implement mouse tracking with `useCallback` for performance
- Follow traditional Korean color palette and seasonal aesthetics

### **Testing Interactive Components**

```bash
# Test mouse tracking
npm run test -- --testNamePattern="mouse tracking"

# Test glass morphism effects
npm run test -- --testNamePattern="glass morphism"

# Test cultural integration
npm run test -- --testNamePattern="cultural"
```

### **Performance Best Practices**

- Use `useCallback` for mouse event handlers
- Implement `useRef` for DOM element references
- Apply CSS `transform3d` for hardware acceleration
- Use CSS custom properties for dynamic styling
- Optimize glass morphism filters for 60fps performance

## Troubleshooting

### Common Issues

#### **Port 3000 in Use**

```bash
# Use alternative port
npm run dev -- --port 3001
```

#### **Build Failures**

```bash
# Check for missing dependencies
npm install
npm run lint
npm run type-check
npm run build
```

#### **🆕 Interactive Effects Not Working**

- Ensure `enableInteraction={true}` is set
- Check browser console for JavaScript errors
- Verify CSS custom properties are supported
- Test mouse event handlers with DevTools

#### **🆕 Zen Brutalism Styles Not Applying**

- Verify `tailwind.config.ts` includes Zen Brutalism theme
- Check `globals.css` for custom CSS classes
- Ensure proper CSS custom property definitions
- Test with hard refresh to clear CSS cache

### **Deployment Checklist**

- [ ] All Zen Brutalism components tested in demo pages
- [ ] Mouse tracking interactions working across browsers
- [ ] Glass morphism effects rendering correctly
- [ ] Traditional Korean colors displaying properly
- [ ] Performance metrics meet targets (LCP < 2.5s, FID < 100ms)
- [ ] All artwork images optimized and loading
- [ ] Airtable integration working with fallback system

## Recent Updates

### ✅ **Zen Brutalism Foundation Complete**

- **3-Phase Design System**: Fully implemented and deployed
- **Interactive Components**: 5 new component families with mouse tracking
- **Demo Pages**: 3 comprehensive showcases of design evolution
- **Performance**: Optimized for 60fps interactions and fast loading
- **Cultural Integration**: Traditional Korean aesthetics digitally implemented

### ✅ **Build & Deployment Success**

- **Production Build**: ✓ Compiled successfully in 10.0s
- **Static Generation**: ✓ Generated 55 static pages
- **Airtable Integration**: ✓ Successfully fetched 58 artworks
- **Vercel Deployment**: ✓ Live at https://anam-gallery.vercel.app

---

## 🎨 **"전통의 깊이와 현대적 몰입감을 동시에 제공하는 혁신적인 디지털 갤러리"**

The ANAM Gallery now represents a breakthrough in digital art presentation,
combining traditional Korean calligraphy aesthetics with cutting-edge web
interaction design through the Zen Brutalism Foundation system.
