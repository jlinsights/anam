import type { Locale } from '@/lib/types'

export interface TranslationStructure {
  common: {
    loading: string
    error: string
    retry: string
    close: string
    back: string
    next: string
    previous: string
    save: string
    cancel: string
    confirm: string
    delete: string
    edit: string
    view: string
    share: string
    download: string
    changeLanguage: string
    selectLanguage: string
    selectLanguageDesc: string
  }
  navigation: {
    home: string
    gallery: string
    artist: string
    exhibition: string
    about: string
    contact: string
  }
  gallery: {
    title: string
    subtitle: string
    allArtworks: string
    noResults: string
    searchPlaceholder: string
    filterBy: string
    sortBy: string
    year: string
    medium: string
    category: string
    featured: string
    viewArtwork: string
    artworkDetails: string
    dimensions: string
    created: string
    artistNote: string
  }
  artist: {
    title: string
    biography: string
    exhibitions: string
    awards: string
    education: string
    contact: string
    born: string
    nationality: string
  }
  exhibition: {
    title: string
    current: string
    upcoming: string
    past: string
    online: string
    period: string
    location: string
    curator: string
    description: string
    works: string
    catalog: string
  }
  footer: {
    copyright: string
    organization: string
    contact: string
    privacy: string
    terms: string
  }
  search: {
    placeholder: string
    results: string
    noResults: string
    filterBy: string
    sortBy: string
    reset: string
  }
  meta: {
    defaultTitle: string
    defaultDescription: string
    exhibitionTitle: string
    galleryTitle: string
    artistTitle: string
  }
}

export const translations: Record<Locale, TranslationStructure> = {
  ko: {
    common: {
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      retry: '다시 시도',
      close: '닫기',
      back: '뒤로',
      next: '다음',
      previous: '이전',
      save: '저장',
      cancel: '취소',
      confirm: '확인',
      delete: '삭제',
      edit: '편집',
      view: '보기',
      share: '공유',
      download: '다운로드',
      changeLanguage: '언어 변경',
      selectLanguage: '언어 선택',
      selectLanguageDesc: '원하는 언어를 선택하세요',
    },
    navigation: {
      home: '홈',
      gallery: '갤러리',
      artist: '작가',
      exhibition: '전시',
      about: '소개',
      contact: '연락처',
    },
    gallery: {
      title: '작품 갤러리',
      subtitle: '아남 배옥영 작가의 서예 작품을 감상하세요',
      allArtworks: '전체 작품',
      noResults: '검색 결과가 없습니다',
      searchPlaceholder: '작품명, 년도, 기법으로 검색...',
      filterBy: '필터',
      sortBy: '정렬',
      year: '년도',
      medium: '기법',
      category: '분류',
      featured: '주요 작품',
      viewArtwork: '작품 보기',
      artworkDetails: '작품 상세',
      dimensions: '크기',
      created: '제작년도',
      artistNote: '작가 노트',
    },
    artist: {
      title: '작가 소개',
      biography: '약력',
      exhibitions: '전시 경력',
      awards: '수상 경력',
      education: '학력',
      contact: '연락처',
      born: '출생',
      nationality: '국적',
    },
    exhibition: {
      title: '전시',
      current: '현재 전시',
      upcoming: '예정 전시',
      past: '지난 전시',
      online: '온라인 전시',
      period: '전시 기간',
      location: '전시 장소',
      curator: '기획',
      description: '전시 소개',
      works: '출품작',
      catalog: '도록',
    },
    footer: {
      copyright: '© 2025 사단법인 아시아서예협회 (ASCA)',
      organization: '사단법인 아시아서예협회',
      contact: '연락처',
      privacy: '개인정보처리방침',
      terms: '이용약관',
    },
    search: {
      placeholder: '검색어를 입력하세요',
      results: '검색 결과',
      noResults: '검색 결과가 없습니다',
      filterBy: '필터',
      sortBy: '정렬',
      reset: '초기화',
    },
    meta: {
      defaultTitle: '아남 배옥영 개인전 - 먹, 그리고...',
      defaultDescription:
        '아남 배옥영 작가의 현대 서예 개인전. 인생의 여정을 담은 깊이 있는 서예 작품을 온라인으로 감상하세요.',
      exhibitionTitle: '아남 배옥영 개인전 - 전시',
      galleryTitle: '아남 배옥영 개인전 - 갤러리',
      artistTitle: '아남 배옥영 개인전 - 작가',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      share: 'Share',
      download: 'Download',
      changeLanguage: 'Change Language',
      selectLanguage: 'Select Language',
      selectLanguageDesc: 'Please select your preferred language',
    },
    navigation: {
      home: 'Home',
      gallery: 'Gallery',
      artist: 'Artist',
      exhibition: 'Exhibition',
      about: 'About',
      contact: 'Contact',
    },
    gallery: {
      title: 'Artwork Gallery',
      subtitle: 'Explore the calligraphy works of Artist Anam Bae Ok Young',
      allArtworks: 'All Artworks',
      noResults: 'No results found',
      searchPlaceholder: 'Search by title, year, medium...',
      filterBy: 'Filter',
      sortBy: 'Sort',
      year: 'Year',
      medium: 'Medium',
      category: 'Category',
      featured: 'Featured',
      viewArtwork: 'View Artwork',
      artworkDetails: 'Artwork Details',
      dimensions: 'Dimensions',
      created: 'Created',
      artistNote: 'Artist Note',
    },
    artist: {
      title: 'About the Artist',
      biography: 'Biography',
      exhibitions: 'Exhibitions',
      awards: 'Awards',
      education: 'Education',
      contact: 'Contact',
      born: 'Born',
      nationality: 'Nationality',
    },
    exhibition: {
      title: 'Exhibition',
      current: 'Current Exhibition',
      upcoming: 'Upcoming Exhibition',
      past: 'Past Exhibitions',
      online: 'Online Exhibition',
      period: 'Exhibition Period',
      location: 'Location',
      curator: 'Curator',
      description: 'Description',
      works: 'Works',
      catalog: 'Catalog',
    },
    footer: {
      copyright: '© 2025 The Asian Society of Calligraphic Arts (ASCA)',
      organization: 'The Asian Society of Calligraphic Arts',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    },
    search: {
      placeholder: 'Enter search terms',
      results: 'Search Results',
      noResults: 'No results found',
      filterBy: 'Filter',
      sortBy: 'Sort',
      reset: 'Reset',
    },
    meta: {
      defaultTitle: 'Anam Bae Ok Young Solo Exhibition - Ink, and...',
      defaultDescription:
        'Solo exhibition of contemporary calligraphy by artist Anam Bae Ok Young. Experience profound calligraphy works depicting the journey of life online.',
      exhibitionTitle: 'Anam Bae Ok Young Solo Exhibition - Exhibition',
      galleryTitle: 'Anam Bae Ok Young Solo Exhibition - Gallery',
      artistTitle: 'Anam Bae Ok Young Solo Exhibition - Artist',
    },
  },
  ja: {
    common: {
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      retry: '再試行',
      close: '閉じる',
      back: '戻る',
      next: '次へ',
      previous: '前へ',
      save: '保存',
      cancel: 'キャンセル',
      confirm: '確認',
      delete: '削除',
      edit: '編集',
      view: '表示',
      share: '共有',
      download: 'ダウンロード',
      changeLanguage: '言語変更',
      selectLanguage: '言語選択',
      selectLanguageDesc: 'お好みの言語を選択してください',
    },
    navigation: {
      home: 'ホーム',
      gallery: 'ギャラリー',
      artist: '作家',
      exhibition: '展示',
      about: '紹介',
      contact: '連絡先',
    },
    gallery: {
      title: '作品ギャラリー',
      subtitle: 'アーティスト希欄孔慶順の書道作品をご鑑賞ください',
      allArtworks: '全作品',
      noResults: '検索結果がありません',
      searchPlaceholder: '作品名、年、技法で検索...',
      filterBy: 'フィルター',
      sortBy: '並び替え',
      year: '年',
      medium: '技法',
      category: 'カテゴリー',
      featured: '注目作品',
      viewArtwork: '作品を見る',
      artworkDetails: '作品詳細',
      dimensions: 'サイズ',
      created: '制作年',
      artistNote: '作家ノート',
    },
    artist: {
      title: '作家紹介',
      biography: '略歴',
      exhibitions: '展示経歴',
      awards: '受賞歴',
      education: '学歴',
      contact: '連絡先',
      born: '生年',
      nationality: '国籍',
    },
    exhibition: {
      title: '展示',
      current: '現在の展示',
      upcoming: '予定展示',
      past: '過去の展示',
      online: 'オンライン展示',
      period: '展示期間',
      location: '展示場所',
      curator: '企画',
      description: '展示紹介',
      works: '出品作',
      catalog: 'カタログ',
    },
    footer: {
      copyright: '© 2025 一般社団法人アジア書芸協会 (ASCA)',
      organization: '一般社団法人アジア書芸協会',
      contact: '連絡先',
      privacy: 'プライバシーポリシー',
      terms: '利用規約',
    },
    search: {
      placeholder: '検索語を入力してください',
      results: '検索結果',
      noResults: '検索結果がありません',
      filterBy: 'フィルター',
      sortBy: '並び替え',
      reset: 'リセット',
    },
    meta: {
      defaultTitle: '希欄孔慶順個展 - 道',
      defaultDescription:
        '作家希欄孔慶順の現代書道個展。人生の旅路を込めた深みのある書道作品をオンラインでご鑑賞ください。',
      exhibitionTitle: '希欄孔慶順個展 - 展示',
      galleryTitle: '希欄孔慶順個展 - ギャラリー',
      artistTitle: '希欄孔慶順個展 - 作家',
    },
  },
  zh: {
    common: {
      loading: '加载中...',
      error: '发生错误',
      retry: '重试',
      close: '关闭',
      back: '返回',
      next: '下一个',
      previous: '上一个',
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      delete: '删除',
      edit: '编辑',
      view: '查看',
      share: '分享',
      download: '下载',
      changeLanguage: '更换语言',
      selectLanguage: '选择语言',
      selectLanguageDesc: '请选择您的首选语言',
    },
    navigation: {
      home: '首页',
      gallery: '画廊',
      artist: '艺术家',
      exhibition: '展览',
      about: '关于',
      contact: '联系方式',
    },
    gallery: {
      title: '作品画廊',
      subtitle: '欣赏艺术家熙欄孔慶順的书法作品',
      allArtworks: '全部作品',
      noResults: '没有找到结果',
      searchPlaceholder: '按标题、年份、媒介搜索...',
      filterBy: '筛选',
      sortBy: '排序',
      year: '年份',
      medium: '媒介',
      category: '类别',
      featured: '精选作品',
      viewArtwork: '查看作品',
      artworkDetails: '作品详情',
      dimensions: '尺寸',
      created: '创作年份',
      artistNote: '艺术家笔记',
    },
    artist: {
      title: '艺术家介绍',
      biography: '简历',
      exhibitions: '展览经历',
      awards: '获奖经历',
      education: '教育背景',
      contact: '联系方式',
      born: '出生',
      nationality: '国籍',
    },
    exhibition: {
      title: '展览',
      current: '当前展览',
      upcoming: '即将举办',
      past: '过往展览',
      online: '线上展览',
      period: '展览期间',
      location: '展览地点',
      curator: '策展人',
      description: '展览介绍',
      works: '参展作品',
      catalog: '画册',
    },
    footer: {
      copyright: '© 2025 亚洲书艺协会 (ASCA)',
      organization: '亚洲书艺协会',
      contact: '联系方式',
      privacy: '隐私政策',
      terms: '使用条款',
    },
    search: {
      placeholder: '请输入搜索词',
      results: '搜索结果',
      noResults: '没有找到结果',
      filterBy: '筛选',
      sortBy: '排序',
      reset: '重置',
    },
    meta: {
      defaultTitle: '熙欄孔慶順个展 - 道',
      defaultDescription:
        '艺术家熙欄孔慶順的现代书法个展。在线欣赏蕴含人生旅程的深邃书法作品。',
      exhibitionTitle: '熙欄孔慶順个展 - 展览',
      galleryTitle: '熙欄孔慶順个展 - 画廊',
      artistTitle: '熙欄孔慶順个展 - 艺术家',
    },
  },
}
