/**
 * Cultural Knowledge Base
 * Comprehensive knowledge repository for Korean calligraphy culture, history, and traditions
 * Provides structured access to cultural data for analysis and educational content generation
 */

import {
  CalligraphyStyle,
  CulturalPeriod,
  Language,
  MultiLanguageText
} from '@/lib/types/cultural-context'

export interface CulturalKnowledge {
  id: string
  category: 'technique' | 'history' | 'philosophy' | 'symbolism' | 'tradition' | 'artist' | 'period'
  title: MultiLanguageText
  description: MultiLanguageText
  culturalSignificance: number // 0-10 scale
  historicalPeriod?: CulturalPeriod
  relatedConcepts: string[]
  sourceReliability: number // 0-10 scale
  lastUpdated: Date
}

export interface StyleInformation {
  style: CalligraphyStyle
  name: MultiLanguageText
  characteristics: MultiLanguageText
  historicalOrigin: MultiLanguageText
  culturalContext: MultiLanguageText
  technicalRequirements: string[]
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'master'
  masterExamples: string[]
}

export interface PhilosophicalConcept {
  concept: string
  name: MultiLanguageText
  definition: MultiLanguageText
  culturalOrigin: string
  applicationInCalligraphy: MultiLanguageText
  relatedPhilosophies: string[]
  modernInterpretation: MultiLanguageText
}

export interface HistoricalPeriodInfo {
  period: CulturalPeriod
  name: MultiLanguageText
  timeRange: string
  characteristics: MultiLanguageText
  significantArtists: string[]
  majorDevelopments: MultiLanguageText
  culturalContext: MultiLanguageText
  influencingFactors: string[]
}

export class CulturalKnowledgeBase {
  private knowledgeEntries: Map<string, CulturalKnowledge> = new Map()
  private styleInformation: Map<CalligraphyStyle, StyleInformation> = new Map()
  private philosophicalConcepts: Map<string, PhilosophicalConcept> = new Map()
  private historicalPeriods: Map<CulturalPeriod, HistoricalPeriodInfo> = new Map()
  private culturalTerms: Map<string, MultiLanguageText> = new Map()

  constructor() {
    this.initializeKnowledgeBase()
  }

  /**
   * Get style information for a specific calligraphy style
   */
  getStyleInformation(style: CalligraphyStyle): StyleInformation | null {
    return this.styleInformation.get(style) || null
  }

  /**
   * Get philosophical concept information
   */
  getPhilosophicalConcept(concept: string): PhilosophicalConcept | null {
    return this.philosophicalConcepts.get(concept) || null
  }

  /**
   * Get historical period information
   */
  getHistoricalPeriodInfo(period: CulturalPeriod): HistoricalPeriodInfo | null {
    return this.historicalPeriods.get(period) || null
  }

  /**
   * Search knowledge entries by category
   */
  searchByCategory(category: CulturalKnowledge['category']): CulturalKnowledge[] {
    return Array.from(this.knowledgeEntries.values())
      .filter(entry => entry.category === category)
      .sort((a, b) => b.culturalSignificance - a.culturalSignificance)
  }

  /**
   * Search knowledge entries by cultural significance
   */
  getHighSignificanceEntries(minSignificance: number = 8): CulturalKnowledge[] {
    return Array.from(this.knowledgeEntries.values())
      .filter(entry => entry.culturalSignificance >= minSignificance)
      .sort((a, b) => b.culturalSignificance - a.culturalSignificance)
  }

  /**
   * Get cultural term translation
   */
  getCulturalTerm(term: string): MultiLanguageText | null {
    return this.culturalTerms.get(term) || null
  }

  /**
   * Get related concepts for a knowledge entry
   */
  getRelatedConcepts(entryId: string): CulturalKnowledge[] {
    const entry = this.knowledgeEntries.get(entryId)
    if (!entry || !entry.relatedConcepts) {
      return []
    }

    return entry.relatedConcepts
      .map(conceptId => this.knowledgeEntries.get(conceptId))
      .filter((concept): concept is CulturalKnowledge => concept !== undefined)
  }

  /**
   * Search knowledge base with text query
   */
  searchKnowledge(query: string, language: Language = 'korean'): CulturalKnowledge[] {
    const queryLower = query.toLowerCase()
    const results: Array<{ entry: CulturalKnowledge; relevance: number }> = []

    for (const entry of this.knowledgeEntries.values()) {
      let relevance = 0

      // Check title match
      const title = entry.title[language]?.toLowerCase() || ''
      if (title.includes(queryLower)) {
        relevance += 10
      }

      // Check description match
      const description = entry.description[language]?.toLowerCase() || ''
      if (description.includes(queryLower)) {
        relevance += 5
      }

      // Check related concepts
      if (entry.relatedConcepts.some(concept => concept.toLowerCase().includes(queryLower))) {
        relevance += 3
      }

      if (relevance > 0) {
        results.push({ entry, relevance })
      }
    }

    return results
      .sort((a, b) => b.relevance - a.relevance)
      .map(result => result.entry)
  }

  /**
   * Get comprehensive cultural context for an artwork
   */
  getCulturalContextForArtwork(
    style?: CalligraphyStyle,
    historicalPeriod?: CulturalPeriod,
    textualContent?: string
  ): {
    styleInfo?: StyleInformation
    periodInfo?: HistoricalPeriodInfo
    relevantPhilosophy: PhilosophicalConcept[]
    culturalSignificance: CulturalKnowledge[]
  } {
    const styleInfo = style ? this.getStyleInformation(style) || undefined : undefined
    const periodInfo = historicalPeriod ? this.getHistoricalPeriodInfo(historicalPeriod) || undefined : undefined
    
    const context = {
      styleInfo,
      periodInfo,
      relevantPhilosophy: this.getRelevantPhilosophy(textualContent),
      culturalSignificance: this.getHighSignificanceEntries(7)
    }

    return context
  }

  // Private initialization methods

  private initializeKnowledgeBase(): void {
    this.initializeStyleInformation()
    this.initializePhilosophicalConcepts()
    this.initializeHistoricalPeriods()
    this.initializeCulturalTerms()
    this.initializeKnowledgeEntries()
  }

  private initializeStyleInformation(): void {
    // Korean traditional calligraphy styles
    this.styleInformation.set('kaishu', {
      style: 'kaishu',
      name: {
        korean: '해서 (楷書)',
        english: 'Kaishu (Regular Script)',
        japanese: '楷書（かいしょ）',
        chinese: '楷书'
      },
      characteristics: {
        korean: '정자체의 기본이 되는 서체로, 단정하고 균형 잡힌 형태가 특징',
        english: 'Foundational script with upright, balanced, and clearly structured characters',
        japanese: '端正で均整の取れた字形が特徴的な書体',
        chinese: '字形端正，结构均衡的标准字体'
      },
      historicalOrigin: {
        korean: '한나라 후기에 완성되어 동아시아 서예의 기본 서체로 정착',
        english: 'Perfected during the late Han Dynasty, became the standard script of East Asian calligraphy',
        japanese: '後漢時代に完成され、東アジア書道の基本書体として定着',
        chinese: '完善于汉末，成为东亚书法的基础字体'
      },
      culturalContext: {
        korean: '학습과 수양의 기초가 되는 서체로, 정신적 안정과 집중력 함양에 중요',
        english: 'Foundation for learning and cultivation, important for mental stability and concentration',
        japanese: '学習と修養の基礎となる書体として、精神的安定と集中力向上に重要',
        chinese: '学习修养的基础，对精神安定和专注力培养很重要'
      },
      technicalRequirements: ['기본 필법', '균형감', '정확한 구조', '일정한 속도'],
      difficultyLevel: 'beginner',
      masterExamples: ['안진경', '구양순', '유공권']
    })

    this.styleInformation.set('xingshu', {
      style: 'xingshu',
      name: {
        korean: '행서 (行書)',
        english: 'Xingshu (Running Script)',
        japanese: '行書（ぎょうしょ）',
        chinese: '行书'
      },
      characteristics: {
        korean: '해서와 초서의 중간 형태로, 유창하면서도 읽기 쉬운 서체',
        english: 'Semi-cursive script between regular and cursive, flowing yet readable',
        japanese: '楷書と草書の中間で、流暢で読みやすい書体',
        chinese: '介于楷书和草书之间，流畅易读的字体'
      },
      historicalOrigin: {
        korean: '위진남북조 시대에 발달하여 실용적이면서도 예술적인 서체로 완성',
        english: 'Developed during Wei-Jin period, combining practicality with artistic expression',
        japanese: '魏晋南北朝時代に発達し、実用性と芸術性を兼ね備えた書体',
        chinese: '魏晋南北朝时期发展，兼具实用性和艺术性'
      },
      culturalContext: {
        korean: '일상 서신과 문학 작품에 널리 사용되며, 개성과 감정 표현이 자유로운 서체',
        english: 'Widely used in daily correspondence and literature, allows free expression of personality and emotion',
        japanese: '日常の書信や文学作品に広く用いられ、個性と感情表現が自由な書体',
        chinese: '广泛用于日常书信和文学作品，个性和情感表达自由'
      },
      technicalRequirements: ['연필법', '속도 조절', '연결 기법', '변화 있는 획'],
      difficultyLevel: 'intermediate',
      masterExamples: ['왕희지', '왕헌지', '안진경']
    })

    this.styleInformation.set('hangeul-calligraphy', {
      style: 'hangeul-calligraphy',
      name: {
        korean: '한글서예',
        english: 'Hangeul Calligraphy',
        japanese: 'ハングル書道',
        chinese: '韩文书法'
      },
      characteristics: {
        korean: '한글의 독창적 구조를 살린 조형미와 민족 정서가 깃든 서체',
        english: 'Unique aesthetic utilizing Hangeul structure with Korean national sentiment',
        japanese: 'ハングル独特の構造を活かした造形美と民族情緒が込められた書体',
        chinese: '发挥韩文独特结构的造型美，蕴含民族情感的字体'
      },
      historicalOrigin: {
        korean: '조선시대 세종대왕의 훈민정음 창제 이후 독자적으로 발달',
        english: 'Developed independently after King Sejong created Hunminjeongeum during Joseon Dynasty',
        japanese: '朝鮮時代の世宗大王による訓民正音創制後に独自発達',
        chinese: '朝鲜时代世宗大王创制训民正音后独立发展'
      },
      culturalContext: {
        korean: '한국의 독창적 문자 체계를 바탕으로 한 민족 예술의 정수',
        english: 'Essence of national art based on Korea\'s unique writing system',
        japanese: '韓国独創の文字体系に基づく民族芸術の精髄',
        chinese: '基于韩国独创文字体系的民族艺术精华'
      },
      technicalRequirements: ['한글 구조 이해', '자음모음 조화', '받침 처리', '전체 균형'],
      difficultyLevel: 'intermediate',
      masterExamples: ['김충현', '손재형', '변관식']
    })
  }

  private initializePhilosophicalConcepts(): void {
    this.philosophicalConcepts.set('gi-un-saeng-dong', {
      concept: 'gi-un-saeng-dong',
      name: {
        korean: '기운생동 (氣韻生動)',
        english: 'Rhythmic Vitality',
        japanese: '気韻生動（きいんせいどう）',
        chinese: '气韵生动'
      },
      definition: {
        korean: '작품에 생명력과 운율이 넘치는 동양 예술의 최고 경지',
        english: 'The highest realm of Eastern art where artwork overflows with vitality and rhythm',
        japanese: '作品に生命力と韻律が溢れる東洋芸術の最高境地',
        chinese: '作品充满生命力和韵律的东方艺术最高境界'
      },
      culturalOrigin: 'chinese-ancient-aesthetics',
      applicationInCalligraphy: {
        korean: '붓놀림에 생명력을 불어넣어 글자가 살아 움직이는 듯한 느낌을 표현',
        english: 'Breathing life into brushwork to make characters appear alive and moving',
        japanese: '筆遣いに生命力を吹き込んで文字が生き生きと動くような感覚を表現',
        chinese: '在笔法中注入生命力，使字体显得生动活泼'
      },
      relatedPhilosophies: ['음양', '도', '무위자연'],
      modernInterpretation: {
        korean: '현대 서예에서도 기계적 완벽함보다 생동감 있는 표현을 추구',
        english: 'Modern calligraphy still pursues dynamic expression over mechanical perfection',
        japanese: '現代書道でも機械的完璧さより生動感ある表現を追求',
        chinese: '现代书法仍追求动感表达胜过机械完美'
      }
    })

    this.philosophicalConcepts.set('jeong', {
      concept: 'jeong',
      name: {
        korean: '정 (情)',
        english: 'Jeong (Deep Affection)',
        japanese: '情（じょう）',
        chinese: '情'
      },
      definition: {
        korean: '한국인의 독특한 정서로, 깊은 애정과 유대감을 나타내는 감정',
        english: 'Unique Korean emotion representing deep affection and bonds between people',
        japanese: '韓国人独特の情緒で、深い愛情と絆を表す感情',
        chinese: '韩国人独特的情感，表示深厚感情和人际纽带'
      },
      culturalOrigin: 'korean-traditional-culture',
      applicationInCalligraphy: {
        korean: '서예 작품에 따뜻한 인간미와 정서적 깊이를 담아내는 표현 방식',
        english: 'Way of expressing warm humanity and emotional depth in calligraphy works',
        japanese: '書道作品に温かい人間味と情緒的深みを込める表現方式',
        chinese: '在书法作品中表达温暖人情和情感深度的方式'
      },
      relatedPhilosophies: ['한', '눈치', '우리'],
      modernInterpretation: {
        korean: '현대 사회에서도 인간관계의 기본이 되는 한국적 가치',
        english: 'Korean value that remains fundamental to human relationships in modern society',
        japanese: '現代社会でも人間関係の基本となる韓国的価値',
        chinese: '现代社会中仍是人际关系基础的韩国价值观'
      }
    })
  }

  private initializeHistoricalPeriods(): void {
    this.historicalPeriods.set('contemporary', {
      period: 'contemporary',
      name: {
        korean: '현대 (現代)',
        english: 'Contemporary Period',
        japanese: '現代（げんだい）',
        chinese: '现代'
      },
      timeRange: '1945-present',
      characteristics: {
        korean: '전통과 현대의 조화를 추구하며, 국제적 감각과 한국적 정체성을 동시에 모색',
        english: 'Seeks harmony between tradition and modernity, exploring international sensibility and Korean identity',
        japanese: '伝統と現代の調和を追求し、国際的感覚と韓国的アイデンティティを同時に模索',
        chinese: '追求传统与现代的和谐，同时探索国际感觉和韩国身份认同'
      },
      significantArtists: ['김충현', '손재형', '변관식', '서세옥'],
      majorDevelopments: {
        korean: '한글서예의 독창적 발전, 현대적 조형 감각의 도입, 국제 교류 확산',
        english: 'Original development of Hangeul calligraphy, introduction of modern aesthetic sense, expansion of international exchange',
        japanese: 'ハングル書道の独創的発展、現代的造形感覚の導入、国際交流の拡散',
        chinese: '韩文书法的独创发展，现代造型感觉的引入，国际交流的扩展'
      },
      culturalContext: {
        korean: '서구 문화 유입과 민족 문화 보존의식이 공존하는 시대적 배경',
        english: 'Era where Western cultural influx coexists with consciousness of preserving national culture',
        japanese: '西欧文化流入と民族文化保存意識が共存する時代的背景',
        chinese: '西方文化流入与民族文化保存意识并存的时代背景'
      },
      influencingFactors: ['해방', '근대화', '세계화', '디지털화']
    })

    this.historicalPeriods.set('traditional-revival', {
      period: 'traditional-revival',
      name: {
        korean: '전통 부흥기',
        english: 'Traditional Revival Period',
        japanese: '伝統復興期',
        chinese: '传统复兴期'
      },
      timeRange: '1980s-present',
      characteristics: {
        korean: '전통 문화에 대한 재인식과 함께 현대적 해석을 통한 새로운 창작 모색',
        english: 'Renewed recognition of traditional culture with exploration of new creation through modern interpretation',
        japanese: '伝統文化への再認識とともに現代的解釈による新しい創作の模索',
        chinese: '重新认识传统文化，通过现代阐释探索新的创作'
      },
      significantArtists: ['김충현', '변관식', '박대헌'],
      majorDevelopments: {
        korean: '전통 서예 교육 체계화, 문화재 보존 활동 강화, 국제적 한국 서예 알리기',
        english: 'Systematization of traditional calligraphy education, strengthening cultural preservation activities, international promotion of Korean calligraphy',
        japanese: '伝統書道教育の体系化、文化財保存活動の強化、国際的な韓国書道の紹介',
        chinese: '传统书法教育体系化，加强文化遗产保护活动，国际推广韩国书法'
      },
      culturalContext: {
        korean: '급속한 산업화 속에서 전통 문화의 가치를 재발견하려는 사회적 움직임',
        english: 'Social movement to rediscover the value of traditional culture amid rapid industrialization',
        japanese: '急速な産業化の中で伝統文化の価値を再発見しようとする社会的動き',
        chinese: '在快速工业化中重新发现传统文化价值的社会运动'
      },
      influencingFactors: ['산업화', '문화정책', '교육제도', '국제교류']
    })
  }

  private initializeCulturalTerms(): void {
    const terms = [
      {
        term: '서예',
        translations: {
          korean: '서예 (書藝)',
          english: 'Korean Calligraphy (Seoye)',
          japanese: '書芸（しょげい）',
          chinese: '书艺'
        }
      },
      {
        term: '문방사우',
        translations: {
          korean: '문방사우 (文房四友)',
          english: 'Four Treasures of the Study',
          japanese: '文房四宝（ぶんぼうしほう）',
          chinese: '文房四宝'
        }
      },
      {
        term: '여백',
        translations: {
          korean: '여백 (餘白)',
          english: 'Empty Space (Meaningful Void)',
          japanese: '余白（よはく）',
          chinese: '留白'
        }
      }
    ]

    terms.forEach(({ term, translations }) => {
      this.culturalTerms.set(term, translations)
    })
  }

  private initializeKnowledgeEntries(): void {
    // High-significance cultural knowledge entries
    const entries: CulturalKnowledge[] = [
      {
        id: 'traditional-brush-technique',
        category: 'technique',
        title: {
          korean: '전통 붓글씨 기법',
          english: 'Traditional Brush Techniques',
          japanese: '伝統的筆法',
          chinese: '传统毛笔技法'
        },
        description: {
          korean: '한국 서예의 근간이 되는 전통적인 붓 사용법과 표현 기법',
          english: 'Traditional brush usage and expression techniques that form the foundation of Korean calligraphy',
          japanese: '韓国書道の根幹となる伝統的な筆の使い方と表現技法',
          chinese: '构成韩国书法基础的传统毛笔使用法和表现技法'
        },
        culturalSignificance: 9.5,
        historicalPeriod: 'classical',
        relatedConcepts: ['brushwork', 'ink-flow', 'rhythm'],
        sourceReliability: 9.8,
        lastUpdated: new Date()
      }
    ]

    entries.forEach(entry => {
      this.knowledgeEntries.set(entry.id, entry)
    })
  }

  private getRelevantPhilosophy(textualContent?: string): PhilosophicalConcept[] {
    // Analyze textual content and return relevant philosophical concepts
    const relevantConcepts: PhilosophicalConcept[] = []
    
    // Always include fundamental concepts
    const fundamentalConcepts = ['gi-un-saeng-dong', 'jeong']
    fundamentalConcepts.forEach(concept => {
      const philosophicalConcept = this.philosophicalConcepts.get(concept)
      if (philosophicalConcept) {
        relevantConcepts.push(philosophicalConcept)
      }
    })

    return relevantConcepts
  }
}