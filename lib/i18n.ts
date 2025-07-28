export type Locale = 'ko' | 'en' | 'ja' | 'zh'

export interface Translation {
  // 네비게이션
  nav: {
    gallery: string
    artist: string
    exhibition: string
    back: string
  }

  // 갤러리
  gallery: {
    title: string
    totalArtworks: string
    page: string
    of: string
    filter: string
    search: string
    searchPlaceholder: string
    reset: string
    results: string
    noResults: string
    keyboardNavigation: string
  }

  // 필터
  filter: {
    title: string
    description: string
    sort: string
    year: string
    medium: string
    apply: string
    reset: string
    ascending: string
    descending: string
    byTitle: string
    byYear: string
    byMedium: string
  }

  // 작품
  artwork: {
    year: string
    medium: string
    dimensions: string
    description: string
    artistNote: string
    share: string
    download: string
    previousWork: string
    nextWork: string
    backToGallery: string
  }

  // 공유
  share: {
    title: string
    description: string
    socialMedia: string
    copyLink: string
    saveImage: string
    copy: string
    copied: string
    download: string
    tip: string
  }

  // 공통
  common: {
    loading: string
    error: string
    retry: string
    home: string
    skipToMain: string
    close: string
  }

  // 접근성
  accessibility: {
    skipToMain: string
    artworkImage: string
    keyboardInstructions: string
    openFilter: string
    closeFilter: string
    previousPage: string
    nextPage: string
  }
}

export const translations: Record<Locale, Translation> = {
  ko: {
    nav: {
      gallery: '갤러리',
      artist: '작가',
      exhibition: '전시',
      back: '돌아가기',
    },
    gallery: {
      title: '갤러리',
      totalArtworks: '총 {count}점의 작품',
      page: '페이지',
      of: '/',
      filter: '필터',
      search: '검색',
      searchPlaceholder: '작품명이나 설명으로 검색...',
      reset: '초기화',
      results: '개 작품',
      noResults: '검색 결과가 없습니다',
      keyboardNavigation:
        '키보드 네비게이션: 화살표 키로 이동, Enter/Space로 선택, Home/End로 처음/끝으로 이동',
    },
    filter: {
      title: '작품 필터',
      description: '원하는 조건으로 작품을 필터링하세요',
      sort: '정렬',
      year: '제작년도',
      medium: '재료',
      apply: '적용',
      reset: '초기화',
      ascending: '오름차순',
      descending: '내림차순',
      byTitle: '작품명',
      byYear: '제작년도',
      byMedium: '재료',
    },
    artwork: {
      year: '제작년도',
      medium: '재료',
      dimensions: '크기',
      description: '작품 설명',
      artistNote: '작가 노트',
      share: '공유',
      download: '다운로드',
      previousWork: '이전 작품',
      nextWork: '다음 작품',
      backToGallery: '갤러리로 돌아가기',
    },
    share: {
      title: '작품 공유하기',
      description: '이 작품을 다른 사람들과 공유해보세요',
      socialMedia: '소셜 미디어',
      copyLink: '링크 복사',
      saveImage: '이미지 저장',
      copy: '복사',
      copied: '복사됨',
      download: '이미지 다운로드',
      tip: 'Instagram 공유 팁:\n📱 모바일: 이미지가 자동으로 다운로드되고 Instagram 앱이 열립니다.\n💻 데스크톱: 링크가 복사되며 Instagram 웹에서 붙여넣기하세요.\n✨ 작품에 대한 개인적인 감상을 함께 적어주시면 더욱 의미있는 공유가 됩니다.',
    },
    common: {
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      retry: '다시 시도',
      home: '홈',
      skipToMain: '메인 콘텐츠로 건너뛰기',
      close: '닫기',
    },
    accessibility: {
      skipToMain: '메인 콘텐츠로 건너뛰기',
      artworkImage: '{title} - 배옥영 작가의 {year}년 서예 작품',
      keyboardInstructions: '키보드로 작품을 탐색할 수 있습니다',
      openFilter: '필터 열기',
      closeFilter: '필터 닫기',
      previousPage: '이전 페이지',
      nextPage: '다음 페이지',
    },
  },

  en: {
    nav: {
      gallery: 'Gallery',
      artist: 'Artist',
      exhibition: 'Exhibition',
      back: 'Back',
    },
    gallery: {
      title: 'Gallery',
      totalArtworks: 'Total {count} artworks',
      page: 'Page',
      of: 'of',
      filter: 'Filter',
      search: 'Search',
      searchPlaceholder: 'Search by title or description...',
      reset: 'Reset',
      results: ' artworks',
      noResults: 'No search results found',
      keyboardNavigation:
        'Keyboard navigation: Arrow keys to move, Enter/Space to select, Home/End to go to first/last',
    },
    filter: {
      title: 'Filter Artworks',
      description: 'Filter artworks by your preferences',
      sort: 'Sort',
      year: 'Year',
      medium: 'Medium',
      apply: 'Apply',
      reset: 'Reset',
      ascending: 'Ascending',
      descending: 'Descending',
      byTitle: 'Title',
      byYear: 'Year',
      byMedium: 'Medium',
    },
    artwork: {
      year: 'Year',
      medium: 'Medium',
      dimensions: 'Dimensions',
      description: 'Description',
      artistNote: 'Artist Note',
      share: 'Share',
      download: 'Download',
      previousWork: 'Previous',
      nextWork: 'Next',
      backToGallery: 'Back to Gallery',
    },
    share: {
      title: 'Share Artwork',
      description: 'Share this artwork with others',
      socialMedia: 'Social Media',
      copyLink: 'Copy Link',
      saveImage: 'Save Image',
      copy: 'Copy',
      copied: 'Copied',
      download: 'Download Image',
      tip: 'Instagram Sharing Tips:\n📱 Mobile: Image downloads automatically and Instagram app opens.\n💻 Desktop: Link is copied, paste it on Instagram web.\n✨ Adding your personal thoughts about the artwork makes sharing more meaningful.',
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      home: 'Home',
      skipToMain: 'Skip to main content',
      close: 'Close',
    },
    accessibility: {
      skipToMain: 'Skip to main content',
      artworkImage:
        '{title} - Calligraphy artwork by Anam Bae Ok Young from {year}',
      keyboardInstructions: 'You can navigate artworks using keyboard',
      openFilter: 'Open filter',
      closeFilter: 'Close filter',
      previousPage: 'Previous page',
      nextPage: 'Next page',
    },
  },

  ja: {
    nav: {
      gallery: 'ギャラリー',
      artist: '作家',
      exhibition: '展示',
      back: '戻る',
    },
    gallery: {
      title: 'ギャラリー',
      totalArtworks: '全{count}点の作品',
      page: 'ページ',
      of: '/',
      filter: 'フィルター',
      search: '検索',
      searchPlaceholder: '作品名や説明で検索...',
      reset: 'リセット',
      results: '件の作品',
      noResults: '検索結果がありません',
      keyboardNavigation:
        'キーボードナビゲーション：矢印キーで移動、Enter/Spaceで選択、Home/Endで最初/最後へ移動',
    },
    filter: {
      title: '作品フィルター',
      description: 'お好みの条件で作品をフィルタリングしてください',
      sort: 'ソート',
      year: '制作年',
      medium: '素材',
      apply: '適用',
      reset: 'リセット',
      ascending: '昇順',
      descending: '降順',
      byTitle: '作品名',
      byYear: '制作年',
      byMedium: '素材',
    },
    artwork: {
      year: '制作年',
      medium: '素材',
      dimensions: 'サイズ',
      description: '作品説明',
      artistNote: '作家ノート',
      share: 'シェア',
      download: 'ダウンロード',
      previousWork: '前の作品',
      nextWork: '次の作品',
      backToGallery: 'ギャラリーに戻る',
    },
    share: {
      title: '作品をシェア',
      description: 'この作品を他の人と共有しましょう',
      socialMedia: 'ソーシャルメディア',
      copyLink: 'リンクをコピー',
      saveImage: '画像を保存',
      copy: 'コピー',
      copied: 'コピーしました',
      download: '画像をダウンロード',
      tip: 'Instagramシェアのコツ：\n📱 モバイル：画像が自動ダウンロードされ、Instagramアプリが開きます。\n💻 デスクトップ：リンクがコピーされ、Instagram ウェブで貼り付けてください。\n✨ 作品についての個人的な感想を一緒に書くと、より意味のあるシェアになります。',
    },
    common: {
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      retry: '再試行',
      home: 'ホーム',
      skipToMain: 'メインコンテンツにスキップ',
      close: '閉じる',
    },
    accessibility: {
      skipToMain: 'メインコンテンツにスキップ',
      artworkImage: '{title} - 孔慶順作家の{year}年書道作品',
      keyboardInstructions: 'キーボードで作品を探索できます',
      openFilter: 'フィルターを開く',
      closeFilter: 'フィルターを閉じる',
      previousPage: '前のページ',
      nextPage: '次のページ',
    },
  },

  zh: {
    nav: {
      gallery: '画廊',
      artist: '艺术家',
      exhibition: '展览',
      back: '返回',
    },
    gallery: {
      title: '画廊',
      totalArtworks: '共{count}件作品',
      page: '页',
      of: '/',
      filter: '筛选',
      search: '搜索',
      searchPlaceholder: '按作品名或描述搜索...',
      reset: '重置',
      results: '件作品',
      noResults: '没有找到搜索结果',
      keyboardNavigation:
        '键盘导航：方向键移动，Enter/Space选择，Home/End到首/末',
    },
    filter: {
      title: '作品筛选',
      description: '按您的喜好筛选作品',
      sort: '排序',
      year: '创作年份',
      medium: '材料',
      apply: '应用',
      reset: '重置',
      ascending: '升序',
      descending: '降序',
      byTitle: '作品名',
      byYear: '创作年份',
      byMedium: '材料',
    },
    artwork: {
      year: '创作年份',
      medium: '材料',
      dimensions: '尺寸',
      description: '作品描述',
      artistNote: '艺术家笔记',
      share: '分享',
      download: '下载',
      previousWork: '上一件作品',
      nextWork: '下一件作品',
      backToGallery: '返回画廊',
    },
    share: {
      title: '分享作品',
      description: '与他人分享这件作品',
      socialMedia: '社交媒体',
      copyLink: '复制链接',
      saveImage: '保存图片',
      copy: '复制',
      copied: '已复制',
      download: '下载图片',
      tip: 'Instagram分享技巧：\n📱 手机：图片自动下载，Instagram应用会打开。\n💻 桌面：链接已复制，请在Instagram网页版粘贴。\n✨ 添加您对作品的个人感受会让分享更有意义。',
    },
    common: {
      loading: '加载中...',
      error: '发生错误',
      retry: '重试',
      home: '首页',
      skipToMain: '跳转到主内容',
      close: '关闭',
    },
    accessibility: {
      skipToMain: '跳转到主内容',
      artworkImage: '{title} - 孔庆顺艺术家{year}年书法作品',
      keyboardInstructions: '您可以使用键盘浏览作品',
      openFilter: '打开筛选器',
      closeFilter: '关闭筛选器',
      previousPage: '上一页',
      nextPage: '下一页',
    },
  },
}

// 템플릿 문자열 처리 함수
export function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match
  })
}

// 로케일 감지 함수
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'ko' // SSR 기본값

  const saved = localStorage.getItem('locale') as Locale
  if (saved && saved in translations) return saved

  // 브라우저 언어 감지 개선 (중국어 변형 지원)
  const browserLang = navigator.language.toLowerCase()

  // 중국어 변형들 처리
  if (browserLang.startsWith('zh')) {
    return 'zh'
  }

  const browser = browserLang.split('-')[0] as Locale
  if (browser in translations) return browser

  return 'ko' // 기본값
}

// 로케일 저장 함수
export function saveLocale(locale: Locale): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('locale', locale)
}

// 번역 함수 타입
export type TranslationKey =
  | keyof Translation
  | `${keyof Translation}.${string}`

// 중첩된 키 접근을 위한 헬퍼 함수
export function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}
