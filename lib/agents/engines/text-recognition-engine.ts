/**
 * Text Recognition Engine
 * AI-powered system for recognizing and analyzing text in Korean calligraphy artworks
 * Handles both Korean and Chinese characters in traditional calligraphy contexts
 */

import { Language, MultiLanguageText } from '@/lib/types/cultural-context'

export interface TextRecognitionResult {
  extractedText: string
  confidence: number
  recognizedCharacters: RecognizedCharacter[]
  textLayout: TextLayout
  languageDetection: LanguageDetection
  readabilityScore: number
  processingTime: number
}

export interface RecognizedCharacter {
  character: string
  confidence: number
  boundingBox: BoundingBox
  alternatives: Array<{ character: string; confidence: number }>
  characterType: 'hangeul' | 'hanja' | 'punctuation' | 'symbol' | 'unknown'
  strokeCount?: number
  radicalInfo?: RadicalInfo
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface TextLayout {
  orientation: 'horizontal' | 'vertical' | 'mixed'
  textLines: TextLine[]
  readingDirection: 'left-to-right' | 'right-to-left' | 'top-to-bottom'
  columnCount: number
  averageLineSpacing: number
}

export interface TextLine {
  text: string
  boundingBox: BoundingBox
  characters: RecognizedCharacter[]
  confidence: number
  lineIndex: number
}

export interface LanguageDetection {
  primaryLanguage: Language
  confidence: number
  languageComponents: Array<{
    language: Language
    percentage: number
    characterRange: { start: number; end: number }
  }>
  scriptTypes: Array<{
    script: 'hangeul' | 'hanja' | 'mixed'
    percentage: number
  }>
}

export interface RadicalInfo {
  radical: string
  radicalMeaning: MultiLanguageText
  strokesInRadical: number
  position: 'left' | 'right' | 'top' | 'bottom' | 'surrounding' | 'center'
}

export class TextRecognitionEngine {
  private recognitionCache: Map<string, TextRecognitionResult> = new Map()
  private characterDatabase: Map<string, CharacterInfo> = new Map()
  private radicalDatabase: Map<string, RadicalInfo> = new Map()

  constructor() {
    this.initializeCharacterDatabase()
    this.initializeRadicalDatabase()
  }

  /**
   * Recognize text from image URL
   */
  async recognizeText(imageUrl: string): Promise<TextRecognitionResult> {
    try {
      console.log(`Starting text recognition for image: ${imageUrl}`)
      const startTime = Date.now()

      // Check cache first
      const cached = this.recognitionCache.get(imageUrl)
      if (cached) {
        console.log('Returning cached text recognition result')
        return cached
      }

      // Perform text recognition
      const result = await this.performTextRecognition(imageUrl, startTime)

      // Cache the result
      this.recognitionCache.set(imageUrl, result)

      console.log(`Text recognition completed in ${result.processingTime}ms`)
      console.log(`Extracted text: "${result.extractedText}" (${result.confidence}% confidence)`)

      return result

    } catch (error) {
      console.error('Text recognition failed:', error)
      return this.getFallbackRecognitionResult()
    }
  }

  /**
   * Analyze text semantics and meaning
   */
  async analyzeTextSemantics(recognitionResult: TextRecognitionResult): Promise<TextSemanticAnalysis> {
    console.log('Analyzing text semantics...')

    const extractedText = recognitionResult.extractedText

    return {
      literalMeaning: await this.extractLiteralMeaning(extractedText),
      culturalMeaning: await this.extractCulturalMeaning(extractedText),
      poeticElements: this.identifyPoeticElements(extractedText),
      philosophicalThemes: this.identifyPhilosophicalThemes(extractedText),
      historicalReferences: this.identifyHistoricalReferences(extractedText),
      symbolism: this.analyzeSymbolism(extractedText),
      emotionalTone: this.analyzeEmotionalTone(extractedText)
    }
  }

  /**
   * Get character-level analysis
   */
  async analyzeCharacterDetails(recognitionResult: TextRecognitionResult): Promise<CharacterAnalysis[]> {
    console.log('Performing character-level analysis...')

    const analyses: CharacterAnalysis[] = []

    for (const character of recognitionResult.recognizedCharacters) {
      const info = this.characterDatabase.get(character.character)
      
      const analysis: CharacterAnalysis = {
        character: character.character,
        meaning: info?.meaning || {
          korean: '의미 불명',
          english: 'Unknown meaning',
          japanese: '意味不明',
          chinese: '意义不明'
        },
        pronunciation: info?.pronunciation || {
          korean: '',
          chinese: '',
          japanese: '',
          english: ''
        },
        strokeCount: character.strokeCount || info?.strokeCount || 0,
        radicalInfo: character.radicalInfo,
        frequency: info?.frequency || 'unknown',
        calligraphyDifficulty: info?.calligraphyDifficulty || 'unknown',
        culturalSignificance: info?.culturalSignificance || 5,
        variantForms: info?.variantForms || []
      }

      analyses.push(analysis)
    }

    return analyses
  }

  // Private methods for text recognition

  private async performTextRecognition(imageUrl: string, startTime: number): Promise<TextRecognitionResult> {
    // Mock implementation - in real scenario, this would use OCR/computer vision
    // to recognize actual text in the image

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 200))

    // Mock extracted text (would be actual OCR result)
    const extractedTexts = [
      '和氣致祥',      // Peace brings prosperity
      '기운생동',       // Rhythmic vitality
      '書道',          // Calligraphy
      '傳統과 現代',    // Tradition and modern
      '한국의 美'       // Beauty of Korea
    ]

    const extractedText = extractedTexts[Math.floor(Math.random() * extractedTexts.length)]

    // Generate mock character recognition results
    const recognizedCharacters = this.generateMockCharacters(extractedText)

    // Detect text layout
    const textLayout = this.detectTextLayout(recognizedCharacters)

    // Detect language composition
    const languageDetection = this.detectLanguages(extractedText)

    // Calculate readability score
    const readabilityScore = this.calculateReadabilityScore(recognizedCharacters)

    const processingTime = Date.now() - startTime

    return {
      extractedText,
      confidence: 85 + Math.random() * 10, // 85-95% confidence range
      recognizedCharacters,
      textLayout,
      languageDetection,
      readabilityScore,
      processingTime
    }
  }

  private generateMockCharacters(text: string): RecognizedCharacter[] {
    const characters: RecognizedCharacter[] = []

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const characterType = this.determineCharacterType(char)
      
      const recognizedChar: RecognizedCharacter = {
        character: char,
        confidence: 80 + Math.random() * 15, // 80-95% confidence
        boundingBox: {
          x: i * 50,
          y: 0,
          width: 45,
          height: 50
        },
        alternatives: this.generateAlternatives(char),
        characterType,
        strokeCount: this.estimateStrokeCount(char),
        radicalInfo: characterType === 'hanja' ? this.getRadicalInfo(char) : undefined
      }

      characters.push(recognizedChar)
    }

    return characters
  }

  private determineCharacterType(char: string): RecognizedCharacter['characterType'] {
    // Korean Hangul
    if (/[가-힣]/.test(char)) {
      return 'hangeul'
    }
    
    // Chinese characters (Hanja)
    if (/[\u4e00-\u9fff]/.test(char)) {
      return 'hanja'
    }

    // Punctuation
    if (/[.,;:!?()[\]{}"]/.test(char)) {
      return 'punctuation'
    }

    // Symbols
    if (/[※◎●○■□▲△]/.test(char)) {
      return 'symbol'
    }

    return 'unknown'
  }

  private generateAlternatives(char: string): Array<{ character: string; confidence: number }> {
    // Generate plausible alternatives based on character similarity
    const alternatives: Array<{ character: string; confidence: number }> = []

    // In real implementation, this would be based on visual similarity
    // and common OCR confusions
    if (char === '和') {
      alternatives.push(
        { character: '私', confidence: 25 },
        { character: '利', confidence: 20 }
      )
    } else if (char === '書') {
      alternatives.push(
        { character: '畫', confidence: 30 },
        { character: '晝', confidence: 15 }
      )
    }

    return alternatives
  }

  private estimateStrokeCount(char: string): number {
    // Simplified stroke count estimation
    const strokeCounts: Record<string, number> = {
      '和': 8,
      '氣': 10,
      '致': 10,
      '祥': 10,
      '書': 10,
      '道': 12,
      '傳': 13,
      '統': 12,
      '現': 11,
      '代': 5,
      '美': 9
    }

    return strokeCounts[char] || 8 // Default estimate
  }

  private getRadicalInfo(char: string): RadicalInfo | undefined {
    return this.radicalDatabase.get(char)
  }

  private detectTextLayout(characters: RecognizedCharacter[]): TextLayout {
    // Mock layout detection
    return {
      orientation: 'vertical',
      textLines: [{
        text: characters.map(c => c.character).join(''),
        boundingBox: { x: 0, y: 0, width: 200, height: 300 },
        characters,
        confidence: 90,
        lineIndex: 0
      }],
      readingDirection: 'top-to-bottom',
      columnCount: 1,
      averageLineSpacing: 50
    }
  }

  private detectLanguages(text: string): LanguageDetection {
    const hangeulCount = (text.match(/[가-힣]/g) || []).length
    const hanjaCount = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const totalChars = text.length

    let primaryLanguage: Language = 'korean'
    let confidence = 85

    if (hanjaCount > hangeulCount) {
      primaryLanguage = hanjaCount > totalChars * 0.7 ? 'chinese' : 'korean'
      confidence = 90
    }

    return {
      primaryLanguage,
      confidence,
      languageComponents: [
        {
          language: 'korean',
          percentage: Math.round((hangeulCount / totalChars) * 100),
          characterRange: { start: 0, end: text.length }
        },
        {
          language: 'chinese',
          percentage: Math.round((hanjaCount / totalChars) * 100),
          characterRange: { start: 0, end: text.length }
        }
      ],
      scriptTypes: [
        {
          script: hanjaCount > hangeulCount ? 'hanja' : hangeulCount > 0 ? 'hangeul' : 'mixed',
          percentage: 100
        }
      ]
    }
  }

  private calculateReadabilityScore(characters: RecognizedCharacter[]): number {
    if (characters.length === 0) return 0

    const avgConfidence = characters.reduce((sum, char) => sum + char.confidence, 0) / characters.length
    const legibilityFactor = characters.filter(char => char.confidence > 80).length / characters.length

    return Math.round(avgConfidence * legibilityFactor)
  }

  private getFallbackRecognitionResult(): TextRecognitionResult {
    return {
      extractedText: '텍스트 인식 실패',
      confidence: 0,
      recognizedCharacters: [],
      textLayout: {
        orientation: 'vertical',
        textLines: [],
        readingDirection: 'top-to-bottom',
        columnCount: 0,
        averageLineSpacing: 0
      },
      languageDetection: {
        primaryLanguage: 'korean',
        confidence: 0,
        languageComponents: [],
        scriptTypes: []
      },
      readabilityScore: 0,
      processingTime: 0
    }
  }

  // Semantic analysis methods

  private async extractLiteralMeaning(text: string): Promise<MultiLanguageText> {
    // Mock implementation - would use actual translation service
    const meanings: Record<string, MultiLanguageText> = {
      '和氣致祥': {
        korean: '화기로운 마음이 상서로움을 가져온다',
        english: 'Harmony and peace bring good fortune',
        japanese: '和やかな気持ちが吉祥をもたらす',
        chinese: '和气致祥'
      },
      '기운생동': {
        korean: '생명력이 넘치는 기운',
        english: 'Vital energy and rhythm',
        japanese: '生命力溢れる気韻',
        chinese: '气韵生动'
      }
    }

    return meanings[text] || {
      korean: text,
      english: text,
      japanese: text,
      chinese: text
    }
  }

  private async extractCulturalMeaning(text: string): Promise<MultiLanguageText> {
    return {
      korean: `"${text}"의 문화적 의미와 전통적 맥락`,
      english: `Cultural meaning and traditional context of "${text}"`,
      japanese: `「${text}」の文化的意味と伝統的文脈`,
      chinese: `"${text}"的文化含义和传统背景`
    }
  }

  private identifyPoeticElements(text: string): string[] {
    const elements: string[] = []
    
    if (text.includes('氣') || text.includes('기운')) {
      elements.push('vitality-metaphor')
    }
    
    if (text.includes('和') || text.includes('화')) {
      elements.push('harmony-symbolism')
    }

    return elements
  }

  private identifyPhilosophicalThemes(text: string): string[] {
    return ['harmony', 'balance', 'nature']
  }

  private identifyHistoricalReferences(text: string): string[] {
    return ['classical-chinese-literature']
  }

  private analyzeSymbolism(text: string): string[] {
    return ['prosperity', 'harmony', 'cultural-continuity']
  }

  private analyzeEmotionalTone(text: string): string {
    return 'peaceful-contemplative'
  }

  // Database initialization

  private initializeCharacterDatabase(): void {
    const characters: Array<{ char: string; info: CharacterInfo }> = [
      {
        char: '和',
        info: {
          meaning: {
            korean: '화목, 평화',
            english: 'Harmony, Peace',
            japanese: '和、平和',
            chinese: '和谐、和平'
          },
          pronunciation: {
            korean: '화',
            chinese: 'hé',
            japanese: 'わ (wa)',
            english: 'hwa'
          },
          strokeCount: 8,
          frequency: 'common',
          calligraphyDifficulty: 'intermediate',
          culturalSignificance: 9,
          variantForms: ['龢']
        }
      }
    ]

    characters.forEach(({ char, info }) => {
      this.characterDatabase.set(char, info)
    })
  }

  private initializeRadicalDatabase(): void {
    const radicals: Array<{ char: string; info: RadicalInfo }> = [
      {
        char: '和',
        info: {
          radical: '禾',
          radicalMeaning: {
            korean: '벼 화',
            english: 'Grain, Rice Plant',
            japanese: '禾（のぎ）',
            chinese: '禾部'
          },
          strokesInRadical: 5,
          position: 'left'
        }
      }
    ]

    radicals.forEach(({ char, info }) => {
      this.radicalDatabase.set(char, info)
    })
  }

  /**
   * Clear recognition cache
   */
  clearCache(): void {
    this.recognitionCache.clear()
    console.log('Text recognition engine cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalEntries: number; memoryEstimate: number } {
    return {
      totalEntries: this.recognitionCache.size,
      memoryEstimate: this.recognitionCache.size * 3000 // ~3KB per recognition result
    }
  }
}

// Supporting interfaces

interface CharacterInfo {
  meaning: MultiLanguageText
  pronunciation: {
    korean: string
    chinese: string
    japanese: string
    english: string
  }
  strokeCount: number
  frequency: 'rare' | 'uncommon' | 'common' | 'frequent'
  calligraphyDifficulty: 'easy' | 'intermediate' | 'difficult' | 'unknown'
  culturalSignificance: number // 0-10 scale
  variantForms: string[]
}

interface TextSemanticAnalysis {
  literalMeaning: MultiLanguageText
  culturalMeaning: MultiLanguageText
  poeticElements: string[]
  philosophicalThemes: string[]
  historicalReferences: string[]
  symbolism: string[]
  emotionalTone: string
}

interface CharacterAnalysis {
  character: string
  meaning: MultiLanguageText
  pronunciation: {
    korean: string
    chinese: string
    japanese: string
    english: string
  }
  strokeCount: number
  radicalInfo?: RadicalInfo
  frequency: string
  calligraphyDifficulty: string
  culturalSignificance: number
  variantForms: string[]
}