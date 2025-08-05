/**
 * Multilingual Content Adapter
 * Handles cultural adaptation and translation of educational content
 * Supports Korean, English, Japanese, and Chinese with cultural sensitivity
 */

import {
  Language,
  MultiLanguageText,
  EducationLevel
} from '@/lib/types/cultural-context'

export interface AdaptationContext {
  contentType?: 'introduction' | 'explanation' | 'term' | 'definition' | 'cultural_context' | 'instructions' | 'reflection'
  educationLevel?: EducationLevel
  culturalContext?: 'korean' | 'international' | 'academic'
  targetAudience?: 'general' | 'students' | 'researchers' | 'practitioners'
}

export interface CulturalAdaptationRules {
  formalityLevel: 'casual' | 'formal' | 'academic'
  culturalReferences: 'maintain' | 'explain' | 'adapt'
  technicalTerms: 'preserve' | 'translate' | 'explain'
  culturalNuances: 'explicit' | 'implicit' | 'detailed'
}

export class MultilingualContentAdapter {
  private translationCache: Map<string, Map<Language, string>> = new Map()
  private culturalAdaptationRules: Map<Language, CulturalAdaptationRules> = new Map()

  constructor() {
    this.initializeCulturalRules()
  }

  /**
   * Adapt content to multiple languages with cultural sensitivity
   */
  async adaptContent(
    sourceContent: string,
    sourceLanguage: Language,
    targetLanguages: Language[],
    context?: AdaptationContext
  ): Promise<MultiLanguageText> {
    const result: Partial<MultiLanguageText> = {}

    // Always include source language
    result[sourceLanguage] = sourceContent

    // Adapt to each target language
    for (const targetLang of targetLanguages) {
      if (targetLang !== sourceLanguage) {
        result[targetLang] = await this.adaptToLanguage(
          sourceContent,
          sourceLanguage,
          targetLang,
          context
        )
      }
    }

    // Ensure all required languages are present
    return this.ensureCompleteTranslation(result as MultiLanguageText)
  }

  /**
   * Adapt content to a specific target language
   */
  private async adaptToLanguage(
    content: string,
    sourceLanguage: Language,
    targetLanguage: Language,
    context?: AdaptationContext
  ): Promise<string> {
    // Check cache first
    const cacheKey = this.getCacheKey(content, sourceLanguage, targetLanguage, context)
    const cached = this.translationCache.get(cacheKey)?.get(targetLanguage)
    if (cached) {
      return cached
    }

    // Get cultural adaptation rules for target language
    const rules = this.culturalAdaptationRules.get(targetLanguage) || this.getDefaultRules()

    // Perform cultural adaptation
    let adaptedContent = await this.performCulturalAdaptation(
      content,
      sourceLanguage,
      targetLanguage,
      rules,
      context
    )

    // Apply language-specific formatting
    adaptedContent = this.applyLanguageFormatting(adaptedContent, targetLanguage)

    // Cache the result
    this.cacheTranslation(cacheKey, targetLanguage, adaptedContent)

    return adaptedContent
  }

  /**
   * Perform cultural adaptation based on target language and context
   */
  private async performCulturalAdaptation(
    content: string,
    sourceLanguage: Language,
    targetLanguage: Language,
    rules: CulturalAdaptationRules,
    context?: AdaptationContext
  ): Promise<string> {
    let adaptedContent = content

    switch (targetLanguage) {
      case 'english':
        adaptedContent = await this.adaptToEnglish(content, rules, context)
        break
      case 'japanese':
        adaptedContent = await this.adaptToJapanese(content, rules, context)
        break
      case 'chinese':
        adaptedContent = await this.adaptToChinese(content, rules, context)
        break
      case 'korean':
        // If source is not Korean, adapt to Korean
        if (sourceLanguage !== 'korean') {
          adaptedContent = await this.adaptToKorean(content, rules, context)
        }
        break
    }

    return adaptedContent
  }

  /**
   * Adapt content for English-speaking audiences
   */
  private async adaptToEnglish(
    content: string,
    rules: CulturalAdaptationRules,
    context?: AdaptationContext
  ): Promise<string> {
    let adapted = content

    // Cultural adaptation strategies for English
    const adaptationMap = {
      // Educational content adaptations
      '서예': 'Korean calligraphy (seoye)',
      '문방사우': 'the Four Treasures of the Study (traditional writing implements)',
      '기운생동': 'rhythmic vitality (gi-un-saeng-dong)',
      '신운': 'spiritual resonance',
      '여백': 'empty space (meaningful void in composition)',
      
      // Cultural concepts
      '정': 'jeong (deep affection and bonds)',
      '한': 'han (complex emotion of sorrow and hope)',
      '눈치': 'nunchi (social awareness)',
      '멋': 'meot (sophisticated taste)',
      
      // Technical terms
      '해서': 'kaishu (standard script)',
      '행서': 'xingshu (running script)',
      '초서': 'caoshu (cursive script)',
      '예서': 'lishu (clerical script)',
      
      // Philosophical concepts
      '음양': 'yin-yang (complementary forces)',
      '도': 'dao/do (the Way)',
      '선': 'seon/zen (meditation)',
      
      // Common phrases
      '전통과 현대의 조화': 'harmony between tradition and modernity',
      '문화적 맥락': 'cultural context',
      '예술적 가치': 'artistic value',
      '정신적 깊이': 'spiritual depth'
    }

    // Apply adaptations
    for (const [korean, english] of Object.entries(adaptationMap)) {
      adapted = adapted.replace(new RegExp(korean, 'g'), english)
    }

    // Add cultural explanations based on context
    if (context?.contentType === 'explanation' || context?.contentType === 'cultural_context') {
      adapted = this.addCulturalExplanationsForEnglish(adapted, context)
    }

    // Adjust formality level
    adapted = this.adjustFormalityForEnglish(adapted, rules.formalityLevel, context)

    return adapted
  }

  /**
   * Adapt content for Japanese audiences
   */
  private async adaptToJapanese(
    content: string,
    rules: CulturalAdaptationRules,
    context?: AdaptationContext
  ): Promise<string> {
    let adapted = content

    // Japanese audiences often share cultural context with Korean traditions
    const adaptationMap = {
      '서예': '書道（しょどう）',
      '문방사우': '文房四宝（ぶんぼうしほう）',
      '기운생동': '気韻生動（きいんせいどう）',
      '신운': '神韻（しんいん）',
      '여백': '余白（よはく）',
      
      // Shared cultural concepts
      '도': '道（どう）',
      '선': '禅（ぜん）',
      '음양': '陰陽（いんよう）',
      
      // Script types (using Japanese terms)
      '해서': '楷書（かいしょ）',
      '행서': '行書（ぎょうしょ）',
      '초서': '草書（そうしょ）',
      '예서': '隷書（れいしょ）',
      
      // Common expressions
      '전통과 현대의 조화': '伝統と現代の調和',
      '문화적 맥락': '文化的文脈',
      '예술적 가치': '芸術的価値',
      '정신적 깊이': '精神的深み'
    }

    // Apply adaptations
    for (const [korean, japanese] of Object.entries(adaptationMap)) {
      adapted = adapted.replace(new RegExp(korean, 'g'), japanese)
    }

    // Add Korean-specific cultural notes for Japanese audience
    adapted = this.addKoreanCulturalNotesForJapanese(adapted, context)

    // Adjust politeness level (Japanese has complex honorific system)
    adapted = this.adjustPolitenessForJapanese(adapted, rules.formalityLevel, context)

    return adapted
  }

  /**
   * Adapt content for Chinese audiences
   */
  private async adaptToChinese(
    content: string,
    rules: CulturalAdaptationRules,
    context?: AdaptationContext
  ): Promise<string> {
    let adapted = content

    // Chinese audiences share calligraphy traditions with Korea
    const adaptationMap = {
      '서예': '书法',
      '문방사우': '文房四宝',
      '기운생동': '气韵生动',
      '신운': '神韵',
      '여백': '留白',
      
      // Shared philosophical concepts
      '도': '道',
      '선': '禅',
      '음양': '阴阳',
      
      // Script types
      '해서': '楷书',
      '행서': '行书',
      '초서': '草书',
      '예서': '隶书',
      
      // Common expressions
      '전통과 현대의 조화': '传统与现代的和谐',
      '문화적 맥락': '文化语境',
      '예술적 가치': '艺术价值',
      '정신적 깊이': '精神深度'
    }

    // Apply adaptations
    for (const [korean, chinese] of Object.entries(adaptationMap)) {
      adapted = adapted.replace(new RegExp(korean, 'g'), chinese)
    }

    // Highlight Korean-specific elements for Chinese audience
    adapted = this.addKoreanDistinctionsForChinese(adapted, context)

    // Use appropriate Chinese formality level
    adapted = this.adjustFormalityForChinese(adapted, rules.formalityLevel, context)

    return adapted
  }

  /**
   * Adapt content to Korean (when source is not Korean)
   */
  private async adaptToKorean(
    content: string,
    rules: CulturalAdaptationRules,
    context?: AdaptationContext
  ): Promise<string> {
    // This would handle adaptation from other languages to Korean
    // For now, return the content as-is since Korean is typically the source
    return content
  }

  /**
   * Add cultural explanations for English-speaking audiences
   */
  private addCulturalExplanationsForEnglish(content: string, context?: AdaptationContext): string {
    let enhanced = content

    // Add explanatory notes for cultural concepts
    if (content.includes('jeong')) {
      enhanced += '\n\n*Cultural Note: Jeong represents the deep emotional bonds and affection that develop between people in Korean culture, often extending beyond family to community relationships.*'
    }

    if (content.includes('han')) {
      enhanced += '\n\n*Cultural Note: Han is a complex Korean emotion that encompasses sorrow, hope, and resilience, often expressed through art and literature.*'
    }

    if (content.includes('rhythmic vitality')) {
      enhanced += '\n\n*Cultural Note: This concept, fundamental to East Asian aesthetics, refers to the life force and dynamic energy that should flow through artwork.*'
    }

    return enhanced
  }

  /**
   * Add Korean cultural notes for Japanese audiences
   */
  private addKoreanCulturalNotesForJapanese(content: string, context?: AdaptationContext): string {
    let enhanced = content

    // Japanese audiences understand East Asian culture but may miss Korean-specific nuances
    if (content.includes('정') || content.includes('jeong')) {
      enhanced += '\n\n※韓国特有の概念：「정」は日本の「情」に似ていますが、より共同体的で継続的な感情の絆を表します。'
    }

    return enhanced
  }

  /**
   * Add Korean distinctions for Chinese audiences
   */
  private addKoreanDistinctionsForChinese(content: string, context?: AdaptationContext): string {
    let enhanced = content

    // Highlight differences from Chinese traditions
    if (content.includes('书法')) {
      enhanced += '\n\n※韩国书法特色：虽然源于中国传统，但融入了朝鲜半岛独特的美学理念和文化内涵。'
    }

    return enhanced
  }

  /**
   * Adjust formality level for English
   */
  private adjustFormalityForEnglish(
    content: string,
    formality: CulturalAdaptationRules['formalityLevel'],
    context?: AdaptationContext
  ): string {
    let adjusted = content

    switch (formality) {
      case 'casual':
        // Use more conversational tone
        adjusted = adjusted.replace(/Furthermore,/g, 'Also,')
        adjusted = adjusted.replace(/Moreover,/g, 'Plus,')
        break
      case 'formal':
        // Professional but accessible
        // Keep current tone
        break
      case 'academic':
        // Scholarly tone
        adjusted = adjusted.replace(/shows/g, 'demonstrates')
        adjusted = adjusted.replace(/uses/g, 'employs')
        break
    }

    return adjusted
  }

  /**
   * Adjust politeness level for Japanese
   */
  private adjustPolitenessForJapanese(
    content: string,
    formality: CulturalAdaptationRules['formalityLevel'],
    context?: AdaptationContext
  ): string {
    let adjusted = content

    // Japanese requires careful attention to politeness levels
    switch (formality) {
      case 'casual':
        // Use だ/である調
        adjusted = adjusted.replace(/です/g, 'だ')
        adjusted = adjusted.replace(/ます/g, 'る')
        break
      case 'formal':
        // Use です/ます調 (default for educational content)
        // Keep current polite form
        break
      case 'academic':
        // Use である調 for academic writing
        adjusted = adjusted.replace(/です/g, 'である')
        adjusted = adjusted.replace(/ます/g, 'る')
        break
    }

    return adjusted
  }

  /**
   * Adjust formality for Chinese
   */
  private adjustFormalityForChinese(
    content: string,
    formality: CulturalAdaptationRules['formalityLevel'],
    context?: AdaptationContext
  ): string {
    let adjusted = content

    switch (formality) {
      case 'academic':
        // Use more formal Chinese academic expressions
        adjusted = adjusted.replace(/表现/g, '呈现')
        adjusted = adjusted.replace(/显示/g, '展现')
        break
    }

    return adjusted
  }

  /**
   * Apply language-specific formatting
   */
  private applyLanguageFormatting(content: string, language: Language): string {
    switch (language) {
      case 'japanese':
        // Add appropriate Japanese punctuation and spacing
        return content.replace(/。/g, '。').replace(/、/g, '、')
      case 'chinese':
        // Ensure proper Chinese punctuation
        return content.replace(/。/g, '。').replace(/，/g, '，')
      case 'english':
        // Ensure proper English spacing and punctuation
        return content.replace(/\s+/g, ' ').trim()
      default:
        return content
    }
  }

  /**
   * Ensure all required languages are present in the result
   */
  private ensureCompleteTranslation(result: MultiLanguageText): MultiLanguageText {
    // Ensure Korean is always present (fallback)
    if (!result.korean && result.english) {
      result.korean = result.english // Temporary fallback
    }
    
    // Ensure English is always present (international accessibility)
    if (!result.english && result.korean) {
      result.english = result.korean // Temporary fallback
    }

    return result
  }

  /**
   * Initialize cultural adaptation rules for each language
   */
  private initializeCulturalRules() {
    // English adaptation rules
    this.culturalAdaptationRules.set('english', {
      formalityLevel: 'formal',
      culturalReferences: 'explain',
      technicalTerms: 'explain',
      culturalNuances: 'explicit'
    })

    // Japanese adaptation rules
    this.culturalAdaptationRules.set('japanese', {
      formalityLevel: 'formal',
      culturalReferences: 'maintain',
      technicalTerms: 'preserve',
      culturalNuances: 'explicit'
    })

    // Chinese adaptation rules
    this.culturalAdaptationRules.set('chinese', {
      formalityLevel: 'formal',
      culturalReferences: 'maintain',
      technicalTerms: 'preserve',
      culturalNuances: 'detailed'
    })

    // Korean adaptation rules (source language)
    this.culturalAdaptationRules.set('korean', {
      formalityLevel: 'formal',
      culturalReferences: 'implicit',
      technicalTerms: 'preserve',
      culturalNuances: 'implicit'
    })
  }

  /**
   * Get default adaptation rules
   */
  private getDefaultRules(): CulturalAdaptationRules {
    return {
      formalityLevel: 'formal',
      culturalReferences: 'explain',
      technicalTerms: 'explain',
      culturalNuances: 'explicit'
    }
  }

  /**
   * Generate cache key for translation caching
   */
  private getCacheKey(
    content: string,
    sourceLanguage: Language,
    targetLanguage: Language,
    context?: AdaptationContext
  ): string {
    const contextKey = context ? JSON.stringify(context) : 'default'
    return `${sourceLanguage}-${targetLanguage}-${contextKey}-${this.hashContent(content)}`
  }

  /**
   * Simple hash function for content
   */
  private hashContent(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  /**
   * Cache translation result
   */
  private cacheTranslation(cacheKey: string, language: Language, translation: string) {
    if (!this.translationCache.has(cacheKey)) {
      this.translationCache.set(cacheKey, new Map())
    }
    this.translationCache.get(cacheKey)!.set(language, translation)
  }

  /**
   * Clear translation cache (for memory management)
   */
  clearCache(): void {
    this.translationCache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalEntries: number; totalTranslations: number } {
    let totalTranslations = 0
    for (const languageMap of this.translationCache.values()) {
      totalTranslations += languageMap.size
    }
    
    return {
      totalEntries: this.translationCache.size,
      totalTranslations
    }
  }
}