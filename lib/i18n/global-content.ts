// 🎯 Global Benchmark: 권소영 웹사이트 스타일 완전한 이중언어 지원
// SuperClaude Pattern: Comprehensive Bilingual Content Management

export interface BilingualContent {
  ko: string
  en: string
}

export interface BilingualMetadata {
  title: BilingualContent
  description: BilingualContent
  keywords: BilingualContent
}

// 🎨 Site-wide Bilingual Content
export const globalContent = {
  // Navigation
  navigation: {
    home: { ko: '홈', en: 'Home' },
    gallery: { ko: '갤러리', en: 'Gallery' },
    artist: { ko: '작가', en: 'Artist' },
    exhibition: { ko: '전시', en: 'Exhibition' },
    contact: { ko: '연락처', en: 'Contact' },
    
    // Sub-navigation
    allWorks: { ko: '전체 작품', en: 'All Artworks' },
    featured: { ko: '주요 작품', en: 'Featured Works' },
    recent: { ko: '최신 작품', en: 'Recent Works' },
    timeline: { ko: '연대기', en: 'Timeline' },
    biography: { ko: '작가 소개', en: 'Biography' },
    statement: { ko: '작가 노트', en: 'Artist Statement' },
    exhibitions: { ko: '전시 이력', en: 'Exhibitions' },
    awards: { ko: '수상 경력', en: 'Awards' },
    upcoming: { ko: '예정 전시', en: 'Upcoming' },
    virtual: { ko: '가상 투어', en: 'Virtual Tour' },
    info: { ko: '연락 정보', en: 'Contact Info' },
    inquiry: { ko: '문의하기', en: 'Inquiry' }
  },

  // Hero Section
  hero: {
    title: { 
      ko: '아남 배옥영', 
      en: 'ANAM Bae Ok Young' 
    },
    subtitle: { 
      ko: '전통의 깊이와 현대적 몰입감을 동시에 제공하는 혁신적인 서예 갤러리', 
      en: 'An innovative calligraphy gallery that simultaneously provides traditional depth and modern immersion' 
    },
    description: {
      ko: '한국 전통 서예의 정신과 현대적 디지털 인터랙션이 조화를 이루는 혁신적인 웹 갤러리입니다.',
      en: 'An innovative web gallery where the spirit of traditional Korean calligraphy harmonizes with contemporary digital interaction.'
    },
    cta: {
      gallery: { ko: '갤러리 탐험하기', en: 'Explore Gallery' },
      artist: { ko: '작가 소개', en: 'About Artist' },
      learn: { ko: '더 자세히 보기', en: 'Learn More' }
    }
  },

  // Gallery Section
  gallery: {
    title: { ko: '작품 갤러리', en: 'Artwork Gallery' },
    recentWorks: { ko: '최신 작품', en: 'Recent Works' },
    featuredWorks: { ko: '주요 작품', en: 'Featured Works' },
    allWorks: { ko: '전체 작품', en: 'All Artworks' },
    
    description: {
      recent: {
        ko: '2023년부터 현재까지, 작가의 최근 작업을 통해 진화하는 서예 예술의 새로운 경지를 만나보세요.',
        en: 'From 2023 to present, experience the new horizons of evolving calligraphic art through the artist\'s recent works.'
      },
      featured: {
        ko: '작가의 대표작들을 통해 전통 서예와 현대적 감각의 조화를 감상해보세요.',
        en: 'Appreciate the harmony between traditional calligraphy and contemporary sensibility through the artist\'s masterpieces.'
      }
    },

    metadata: {
      year: { ko: '년도', en: 'Year' },
      medium: { ko: '재료', en: 'Medium' },
      dimensions: { ko: '크기', en: 'Dimensions' },
      category: { ko: '분류', en: 'Category' },
      
      mediumTypes: {
        'Ink on paper': { ko: '종이에 먹', en: 'Ink on paper' },
        'Ink on hanji': { ko: '한지에 먹', en: 'Ink on hanji' },
        'Ink and color on paper': { ko: '종이에 먹과 채색', en: 'Ink and color on paper' },
        'Traditional ink': { ko: '전통 먹', en: 'Traditional ink' }
      },

      categories: {
        recent: { ko: '최신', en: 'Recent' },
        contemporary: { ko: '현대', en: 'Contemporary' },
        classic: { ko: '고전', en: 'Classic' },
        featured: { ko: '주요 작품', en: 'Featured' }
      }
    },

    filters: {
      all: { ko: '전체', en: 'All' },
      sortBy: { ko: '정렬', en: 'Sort by' },
      year: { ko: '연도순', en: 'By Year' },
      title: { ko: '제목순', en: 'By Title' },
      narrative: { ko: '내러티브', en: 'Narrative' },
      engagement: { ko: '참여도', en: 'Engagement' },
      
      viewMode: { ko: '보기 방식', en: 'View Mode' },
      adaptive: { ko: '적응형', en: 'Adaptive' },
      grid: { ko: '그리드', en: 'Grid' },
      masonry: { ko: '벽돌형', en: 'Masonry' },
      timeline: { ko: '타임라인', en: 'Timeline' },
      story: { ko: '스토리', en: 'Story' }
    }
  },

  // Artist Section
  artist: {
    title: { ko: '작가 이야기', en: 'Artist Story' },
    biography: { ko: '작가 소개', en: 'Biography' },
    statement: { ko: '작가 노트', en: 'Artist Statement' },
    philosophy: { ko: '작업 철학', en: 'Artistic Philosophy' },
    
    profile: {
      name: { ko: '아남 배옥영 (ANAM Bae Ok Young)', en: 'ANAM Bae Ok Young (아남 배옥영)' },
      birth: { ko: '출생', en: 'Born' },
      education: { ko: '학력', en: 'Education' },
      exhibitions: { ko: '주요 전시', en: 'Major Exhibitions' },
      awards: { ko: '수상 경력', en: 'Awards' },
      collections: { ko: '소장처', en: 'Collections' },
      contact: { ko: '연락처', en: 'Contact' }
    },

    statement: {
      ko: '전통 서예의 정신을 바탕으로 현대적 감각을 더하여, 과거와 현재가 조화를 이루는 작품을 추구합니다. 각 작품은 선과 공간, 여백의 관계를 탐구하는 과정이며, 전통에 뿌리를 두되 동시대의 감성과 소통하는 새로운 서예의 가능성을 모색합니다.',
      en: 'Based on the spirit of traditional calligraphy, I add contemporary sensibility to pursue works where past and present harmonize. Each work is a process of exploring the relationship between lines, space, and void, seeking new possibilities for calligraphy that is rooted in tradition yet communicates with contemporary sensibilities.'
    }
  },

  // Exhibition Section
  exhibition: {
    title: { ko: '전시 정보', en: 'Exhibition Information' },
    upcoming: { ko: '예정 전시', en: 'Upcoming Exhibitions' },
    current: { ko: '현재 전시', en: 'Current Exhibitions' },
    past: { ko: '지난 전시', en: 'Past Exhibitions' },
    virtual: { ko: '가상 투어', en: 'Virtual Tour' },
    
    details: {
      period: { ko: '전시 기간', en: 'Exhibition Period' },
      venue: { ko: '전시 장소', en: 'Venue' },
      curator: { ko: '기획', en: 'Curator' },
      theme: { ko: '주제', en: 'Theme' },
      works: { ko: '출품작', en: 'Featured Works' },
      opening: { ko: '개막', en: 'Opening' },
      closing: { ko: '폐막', en: 'Closing' }
    }
  },

  // Contact Section
  contact: {
    title: { ko: '연락처', en: 'Contact' },
    info: { ko: '연락 정보', en: 'Contact Information' },
    inquiry: { ko: '문의하기', en: 'Make an Inquiry' },
    
    form: {
      name: { ko: '이름', en: 'Name' },
      email: { ko: '이메일', en: 'Email' },
      subject: { ko: '제목', en: 'Subject' },
      message: { ko: '메시지', en: 'Message' },
      send: { ko: '보내기', en: 'Send' },
      sending: { ko: '전송 중...', en: 'Sending...' },
      success: { ko: '메시지가 성공적으로 전송되었습니다.', en: 'Message sent successfully.' },
      error: { ko: '전송 중 오류가 발생했습니다.', en: 'An error occurred while sending.' }
    },

    details: {
      email: { ko: '이메일', en: 'Email' },
      phone: { ko: '전화', en: 'Phone' },
      instagram: { ko: '인스타그램', en: 'Instagram' },
      website: { ko: '웹사이트', en: 'Website' },
      address: { ko: '주소', en: 'Address' }
    }
  },

  // Zen Brutalism Design System
  designSystem: {
    title: { ko: 'Zen Brutalism Foundation', en: 'Zen Brutalism Foundation' },
    subtitle: {
      ko: '전통 한국 서예의 정신과 현대적 디지털 인터랙션이 조화를 이루는 혁신적인 디자인 시스템',
      en: 'An innovative design system where the spirit of traditional Korean calligraphy harmonizes with contemporary digital interaction'
    },
    
    phases: {
      phase1: {
        title: { ko: '백지의 시작', en: 'The Beginning of White Space' },
        subtitle: { ko: 'Zen Foundation', en: 'Zen Foundation' },
        description: { ko: '여백의 미학 + 기하학적 브루탈리즘', en: 'Aesthetics of void space + Geometric brutalism' }
      },
      phase2: {
        title: { ko: '먹과 유리의 조화', en: 'Harmony of Ink and Glass' },
        subtitle: { ko: 'Glass Immersion', en: 'Glass Immersion' },
        description: { ko: '다층 글래스 모피즘 + 유동하는 먹 효과', en: 'Multi-layer glass morphism + Flowing ink effects' }
      },
      phase3: {
        title: { ko: '전통의 깊이', en: 'Depth of Tradition' },
        subtitle: { ko: 'Cultural Integration', en: 'Cultural Integration' },
        description: { ko: '삼분법, 음양균형, 계절 미학 통합', en: 'Integration of rule of thirds, yin-yang balance, and seasonal aesthetics' }
      }
    }
  },

  // Cultural Context
  cultural: {
    seasons: {
      spring: { ko: '봄', en: 'Spring' },
      summer: { ko: '여름', en: 'Summer' },
      autumn: { ko: '가을', en: 'Autumn' },
      winter: { ko: '겨울', en: 'Winter' },
      eternal: { ko: '영원', en: 'Eternal' }
    },
    
    concepts: {
      void: { ko: '여백', en: 'Void Space' },
      breath: { ko: '호흡', en: 'Breathing' },
      balance: { ko: '균형', en: 'Balance' },
      harmony: { ko: '조화', en: 'Harmony' },
      depth: { ko: '깊이', en: 'Depth' },
      flow: { ko: '흐름', en: 'Flow' }
    }
  },

  // Common UI Elements
  ui: {
    loading: { ko: '로딩 중...', en: 'Loading...' },
    error: { ko: '오류가 발생했습니다', en: 'An error occurred' },
    retry: { ko: '다시 시도', en: 'Retry' },
    close: { ko: '닫기', en: 'Close' },
    next: { ko: '다음', en: 'Next' },
    previous: { ko: '이전', en: 'Previous' },
    more: { ko: '더 보기', en: 'View More' },
    less: { ko: '접기', en: 'Show Less' },
    
    pagination: {
      page: { ko: '페이지', en: 'Page' },
      of: { ko: '/', en: 'of' },
      first: { ko: '처음', en: 'First' },
      last: { ko: '마지막', en: 'Last' }
    },
    
    search: {
      placeholder: { ko: '검색...', en: 'Search...' },
      results: { ko: '검색 결과', en: 'Search Results' },
      noResults: { ko: '검색 결과가 없습니다', en: 'No results found' }
    }
  },

  // Metadata
  metadata: {
    site: {
      title: { 
        ko: 'ANAM Gallery - 아남 배옥영 작가 서예 갤러리', 
        en: 'ANAM Gallery - Korean Calligraphy by ANAM Bae Ok Young' 
      },
      description: {
        ko: '전통 한국 서예의 정신과 현대적 디지털 인터랙션이 조화를 이루는 혁신적인 웹 갤러리입니다. Zen Brutalism Foundation 디자인 시스템을 통해 전통의 깊이와 현대적 몰입감을 동시에 제공합니다.',
        en: 'An innovative web gallery where the spirit of traditional Korean calligraphy harmonizes with contemporary digital interaction. Through the Zen Brutalism Foundation design system, it simultaneously provides traditional depth and modern immersion.'
      },
      keywords: {
        ko: '한국 서예, 전통 서예, 현대 서예, 아남 배옥영, ANAM, 갤러리, 디지털 아트, Zen Brutalism, 전통 예술, 문화',
        en: 'Korean calligraphy, traditional calligraphy, contemporary calligraphy, ANAM Bae Ok Young, ANAM, gallery, digital art, Zen Brutalism, traditional art, culture'
      }
    }
  }
}

// 🎯 SuperClaude Pattern: Language Detection and Management
export type Language = 'ko' | 'en'

export function getContent<T extends keyof typeof globalContent>(
  section: T,
  lang: Language = 'ko'
): typeof globalContent[T] {
  return globalContent[section]
}

export function getText(content: BilingualContent, lang: Language = 'ko'): string {
  return content[lang] || content.ko
}

// 🎯 Agent OS Pattern: Smart Language Detection
export function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'ko'
  
  const urlLang = window.location.pathname.includes('/en') ? 'en' : null
  const browserLang = navigator.language.startsWith('ko') ? 'ko' : 'en'
  const storedLang = localStorage.getItem('anam-gallery-language') as Language
  
  return urlLang || storedLang || browserLang
}

export function setLanguage(lang: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('anam-gallery-language', lang)
  }
}

// 🎨 Cultural Context Integration
export function getCulturalContent(season: string, lang: Language = 'ko') {
  const seasonContent = globalContent.cultural.seasons[season as keyof typeof globalContent.cultural.seasons]
  return seasonContent ? getText(seasonContent, lang) : getText(globalContent.cultural.seasons.eternal, lang)
}

export default globalContent