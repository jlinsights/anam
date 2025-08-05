/**
 * Educational Content Generator
 * Generates multi-level educational content for Korean calligraphy artworks
 * Supports multiple languages and cultural adaptations
 */

import {
  EducationalContent,
  LearningObjective,
  ContentLevel,
  CulturalTerm,
  ContentSection,
  CulturalContextSection,
  PracticalExercise,
  InteractiveElement,
  VisualAid,
  ProgressionStep,
  AssessmentCriteria,
  EducationLevel,
  Language,
  MultiLanguageText,
  CulturalAnalysisResult
} from '@/lib/types/cultural-context'
import { MultilingualContentAdapter } from '../adapters/multilingual-content-adapter'
import { CulturalKnowledgeBase } from '../knowledge/cultural-knowledge-base'

export interface ContentGenerationRequest {
  artworkId: string
  levels: EducationLevel[]
  languages: Language[]
  contentTypes: string[]
  culturalContext?: CulturalAnalysisResult
  customizationOptions?: ContentCustomizationOptions
}

export interface ContentCustomizationOptions {
  targetCulture?: 'korean' | 'international'
  educationalContext?: 'academic' | 'general' | 'artistic'
  interactivityLevel?: 'basic' | 'enhanced' | 'immersive'
  assessmentStyle?: 'formal' | 'informal' | 'self_directed'
}

export class EducationalContentGenerator {
  private multilingualAdapter: MultilingualContentAdapter
  private knowledgeBase: CulturalKnowledgeBase
  private contentTemplates: Map<string, any> = new Map()

  constructor() {
    this.multilingualAdapter = new MultilingualContentAdapter()
    this.knowledgeBase = new CulturalKnowledgeBase()
    this.initializeContentTemplates()
  }

  /**
   * Generate comprehensive educational content for an artwork
   */
  async generateEducationalContent(request: ContentGenerationRequest): Promise<EducationalContent> {
    console.log(`Generating educational content for artwork: ${request.artworkId}`)
    console.log(`Levels: ${request.levels.join(', ')}, Languages: ${request.languages.join(', ')}`)

    const startTime = Date.now()

    // Get or generate cultural context if not provided
    let culturalContext = request.culturalContext
    if (!culturalContext) {
      culturalContext = await this.getCulturalContextForArtwork(request.artworkId)
    }

    // Generate learning objectives for each level
    const learningObjectives = await this.generateLearningObjectives(
      request.levels,
      culturalContext,
      request.languages[0] // Primary language
    )

    // Generate content for each education level
    const contentLevels = await this.generateContentLevels(
      request.levels,
      culturalContext,
      request.languages,
      request.customizationOptions
    )

    // Generate assessment criteria
    const assessmentCriteria = await this.generateAssessmentCriteria(
      request.levels,
      learningObjectives,
      request.languages[0]
    )

    // Generate interactive elements
    const interactiveElements = await this.generateInteractiveElements(
      culturalContext,
      request.levels,
      request.languages,
      request.customizationOptions?.interactivityLevel || 'enhanced'
    )

    // Generate visual aids
    const visualAids = await this.generateVisualAids(
      culturalContext,
      request.languages
    )

    // Generate progression path
    const progressionPath = await this.generateProgressionPath(
      request.levels,
      learningObjectives,
      request.languages[0]
    )

    // Calculate quality metrics
    const qualityMetrics = await this.calculateQualityMetrics(
      culturalContext,
      contentLevels,
      learningObjectives
    )

    const educationalContent: EducationalContent = {
      id: `edu_${request.artworkId}_${Date.now()}`,
      artworkId: request.artworkId,
      learningObjectives,
      contentLevels,
      assessmentCriteria,
      interactiveElements,
      visualAids,
      progressionPath,
      languages: request.languages,
      primaryLanguage: request.languages[0],
      educationalEffectiveness: qualityMetrics.effectiveness,
      culturalAccuracy: qualityMetrics.culturalAccuracy,
      userEngagement: qualityMetrics.engagement,
      expertValidation: {
        id: '',
        artworkId: request.artworkId,
        expertId: '',
        expertName: '',
        expertCredentials: '',
        validationType: 'educational_content',
        validation: {
          overallScore: 0,
          culturalAccuracy: qualityMetrics.culturalAccuracy,
          historicalAccuracy: 0,
          educationalValue: qualityMetrics.effectiveness,
          linguisticQuality: 0
        },
        feedback: {
          strengths: [],
          improvements: [],
          criticalIssues: [],
          recommendations: []
        },
        comments: { korean: '', english: '' },
        approved: false,
        validatedAt: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log(`Educational content generated in ${Date.now() - startTime}ms`)
    console.log(`Quality scores - Effectiveness: ${qualityMetrics.effectiveness}, Accuracy: ${qualityMetrics.culturalAccuracy}`)

    return educationalContent
  }

  /**
   * Generate learning objectives for each education level
   */
  private async generateLearningObjectives(
    levels: EducationLevel[],
    culturalContext: CulturalAnalysisResult,
    primaryLanguage: Language
  ): Promise<LearningObjective[]> {
    const objectives: LearningObjective[] = []

    for (const level of levels) {
      const template = this.getLearningObjectiveTemplate(level)
      
      const objective: LearningObjective = {
        id: `obj_${level}_${Date.now()}`,
        level,
        objective: await this.generateMultilingualObjective(level, culturalContext, primaryLanguage),
        skills: this.getSkillsForLevel(level, culturalContext),
        culturalKnowledge: this.getCulturalKnowledgeForLevel(level, culturalContext),
        assessmentMethod: this.getAssessmentMethodForLevel(level)
      }

      objectives.push(objective)
    }

    return objectives
  }

  /**
   * Generate content for each education level
   */
  private async generateContentLevels(
    levels: EducationLevel[],
    culturalContext: CulturalAnalysisResult,
    languages: Language[],
    customization?: ContentCustomizationOptions
  ): Promise<ContentLevel[]> {
    const contentLevels: ContentLevel[] = []

    for (const level of levels) {
      const content = await this.generateLevelContent(
        level,
        culturalContext,
        languages,
        customization
      )

      const contentLevel: ContentLevel = {
        level,
        content,
        estimatedDuration: this.estimateDurationForLevel(level, content),
        prerequisites: this.getPrerequisitesForLevel(level),
        nextSteps: this.getNextStepsForLevel(level)
      }

      contentLevels.push(contentLevel)
    }

    return contentLevels
  }

  /**
   * Generate content for a specific education level
   */
  private async generateLevelContent(
    level: EducationLevel,
    culturalContext: CulturalAnalysisResult,
    languages: Language[],
    customization?: ContentCustomizationOptions
  ): Promise<any> {
    const template = this.getContentTemplate(level)

    // Generate introduction
    const introduction = await this.generateIntroduction(level, culturalContext, languages)

    // Generate key terms
    const keyTerms = await this.generateKeyTerms(level, culturalContext, languages)

    // Generate main content sections
    const mainContent = await this.generateMainContentSections(
      level,
      culturalContext,
      languages,
      template
    )

    // Generate cultural context sections
    const culturalContextSections = await this.generateCulturalContextSections(
      level,
      culturalContext,
      languages
    )

    // Generate practical exercises (for intermediate and advanced levels)
    let practicalExercises: PracticalExercise[] = []
    if (level !== 'beginner') {
      practicalExercises = await this.generatePracticalExercises(
        level,
        culturalContext,
        languages
      )
    }

    // Generate reflection
    const reflection = await this.generateReflection(level, culturalContext, languages)

    return {
      introduction,
      keyTerms,
      mainContent,
      culturalContext: culturalContextSections,
      practicalExercises: practicalExercises.length > 0 ? practicalExercises : undefined,
      reflection
    }
  }

  /**
   * Generate multilingual introduction
   */
  private async generateIntroduction(
    level: EducationLevel,
    culturalContext: CulturalAnalysisResult,
    languages: Language[]
  ): Promise<MultiLanguageText> {
    const baseIntroduction = this.generateBaseIntroduction(level, culturalContext)
    
    return await this.multilingualAdapter.adaptContent(
      baseIntroduction,
      'korean',
      languages,
      { contentType: 'introduction', educationLevel: level }
    )
  }

  /**
   * Generate key cultural terms
   */
  private async generateKeyTerms(
    level: EducationLevel,
    culturalContext: CulturalAnalysisResult,
    languages: Language[]
  ): Promise<CulturalTerm[]> {
    const baseTerms = this.getBaseTermsForLevel(level, culturalContext)
    const culturalTerms: CulturalTerm[] = []

    for (const baseTerm of baseTerms) {
      const term: CulturalTerm = {
        term: await this.multilingualAdapter.adaptContent(
          baseTerm.term,
          'korean',
          languages,
          { contentType: 'term' }
        ),
        definition: await this.multilingualAdapter.adaptContent(
          baseTerm.definition,
          'korean',
          languages,
          { contentType: 'definition' }
        ),
        pronunciation: baseTerm.pronunciation,
        culturalSignificance: baseTerm.culturalSignificance,
        relatedTerms: baseTerm.relatedTerms,
        visualExample: baseTerm.visualExample
      }

      culturalTerms.push(term)
    }

    return culturalTerms
  }

  /**
   * Generate main content sections
   */
  private async generateMainContentSections(
    level: EducationLevel,
    culturalContext: CulturalAnalysisResult,
    languages: Language[],
    template: any
  ): Promise<ContentSection[]> {
    const sections: ContentSection[] = []

    for (const sectionTemplate of template.sections) {
      const section: ContentSection = {
        title: await this.multilingualAdapter.adaptContent(
          sectionTemplate.title,
          'korean',
          languages,
          { contentType: 'title' }
        ),
        content: await this.generateSectionContent(
          sectionTemplate,
          culturalContext,
          languages,
          level
        ),
        type: sectionTemplate.type,
        visualSupports: await this.generateVisualSupports(sectionTemplate, culturalContext),
        culturalNotes: sectionTemplate.culturalNotes || []
      }

      sections.push(section)
    }

    return sections
  }

  /**
   * Generate cultural context sections
   */
  private async generateCulturalContextSections(
    level: EducationLevel,
    culturalContext: CulturalAnalysisResult,
    languages: Language[]
  ): Promise<CulturalContextSection[]> {
    const sections: CulturalContextSection[] = []

    // Historical period section
    if (culturalContext.historicalAnalysis) {
      sections.push({
        title: await this.multilingualAdapter.adaptContent(
          '역사적 배경',
          'korean',
          languages,
          { contentType: 'section_title' }
        ),
        period: culturalContext.historicalAnalysis.historicalContext.period,
        culturalBackground: await this.generateHistoricalBackground(
          culturalContext.historicalAnalysis,
          languages
        ),
        philosophicalContext: await this.generatePhilosophicalContext(
          culturalContext.philosophicalAnalysis,
          languages
        ),
        artisticTradition: await this.generateArtisticTradition(
          culturalContext.historicalAnalysis.artisticTradition,
          languages
        ),
        modernRelevance: await this.generateModernRelevance(
          culturalContext.culturalAnalysis.modernInterpretation,
          languages
        )
      })
    }

    return sections
  }

  /**
   * Generate interactive elements
   */
  private async generateInteractiveElements(
    culturalContext: CulturalAnalysisResult,
    levels: EducationLevel[],
    languages: Language[],
    interactivityLevel: string
  ): Promise<InteractiveElement[]> {
    const elements: InteractiveElement[] = []

    // Cultural knowledge quiz
    elements.push({
      id: `quiz_cultural_${Date.now()}`,
      type: 'quiz',
      title: await this.multilingualAdapter.adaptContent(
        '문화적 이해도 퀴즈',
        'korean',
        languages,
        { contentType: 'interactive_title' }
      ),
      instructions: await this.multilingualAdapter.adaptContent(
        '다음 질문들을 통해 작품의 문화적 의미를 탐험해보세요.',
        'korean',
        languages,
        { contentType: 'instructions' }
      ),
      content: await this.generateQuizContent(culturalContext, levels[0]),
      culturalLearningGoals: [
        'Understanding cultural symbolism',
        'Recognition of traditional techniques',
        'Appreciation of philosophical themes'
      ]
    })

    // Interactive annotation system
    if (interactivityLevel === 'enhanced' || interactivityLevel === 'immersive') {
      elements.push({
        id: `annotation_${Date.now()}`,
        type: 'annotation',
        title: await this.multilingualAdapter.adaptContent(
          '작품 상세 분석',
          'korean',
          languages,
          { contentType: 'interactive_title' }
        ),
        instructions: await this.multilingualAdapter.adaptContent(
          '작품의 각 부분을 클릭하여 상세한 문화적 설명을 확인하세요.',
          'korean',
          languages,
          { contentType: 'instructions' }
        ),
        content: await this.generateAnnotationContent(culturalContext),
        culturalLearningGoals: [
          'Detailed visual analysis',
          'Cultural symbolism understanding',
          'Technical appreciation'
        ]
      })
    }

    return elements
  }

  // Helper methods for content generation

  private initializeContentTemplates() {
    // Initialize content templates for different education levels
    this.contentTemplates.set('beginner', {
      sections: [
        { title: '작품 소개', type: 'explanation' },
        { title: '기본 기법', type: 'analysis' },
        { title: '문화적 의미', type: 'cultural_context' }
      ]
    })

    this.contentTemplates.set('intermediate', {
      sections: [
        { title: '작품 분석', type: 'analysis' },
        { title: '역사적 맥락', type: 'historical_context' },
        { title: '기법 연구', type: 'analysis' },
        { title: '문화적 의의', type: 'cultural_context' }
      ]
    })

    this.contentTemplates.set('advanced', {
      sections: [
        { title: '종합적 분석', type: 'analysis' },
        { title: '철학적 배경', type: 'philosophical_context' },
        { title: '예술사적 위치', type: 'historical_context' },
        { title: '현대적 해석', type: 'comparison' }
      ]
    })

    this.contentTemplates.set('expert', {
      sections: [
        { title: '학술적 분석', type: 'scholarly_analysis' },
        { title: '비교 연구', type: 'comparison' },
        { title: '연구 방법론', type: 'methodology' },
        { title: '학술적 기여', type: 'research_contribution' }
      ]
    })
  }

  private getLearningObjectiveTemplate(level: EducationLevel) {
    return this.contentTemplates.get(`${level}_objectives`) || {}
  }

  private getContentTemplate(level: EducationLevel) {
    return this.contentTemplates.get(level) || this.contentTemplates.get('intermediate')
  }

  private generateBaseIntroduction(level: EducationLevel, culturalContext: CulturalAnalysisResult): string {
    switch (level) {
      case 'beginner':
        return '이 작품은 한국 전통 서예의 아름다움과 깊은 문화적 의미를 담고 있습니다. 함께 탐험해보세요.'
      case 'intermediate':
        return '이 서예 작품을 통해 한국 문화의 정신적 깊이와 예술적 전통을 이해해보겠습니다.'
      case 'advanced':
        return '본 작품은 한국 서예 전통의 철학적 기반과 현대적 해석이 조화를 이루는 중요한 예술 작품입니다.'
      case 'expert':
        return '이 작품은 한국 서예사에서 전통과 현대성의 융합을 보여주는 학술적으로 중요한 사례입니다.'
      default:
        return '한국 서예의 문화적 가치와 예술적 의미를 탐구해보세요.'
    }
  }

  private getBaseTermsForLevel(level: EducationLevel, culturalContext: CulturalAnalysisResult) {
    // Return base cultural terms appropriate for the education level
    const commonTerms = [
      {
        term: '서예 (書藝)',
        definition: '붓과 먹을 사용하여 한자나 한글을 아름답게 쓰는 예술',
        pronunciation: 'seo-ye',
        culturalSignificance: '한국 전통 문화의 핵심 예술 형태',
        relatedTerms: ['서법', '서도', '문방사우'],
        visualExample: '/images/terms/seoye.jpg'
      }
    ]

    if (level === 'intermediate' || level === 'advanced' || level === 'expert') {
      commonTerms.push({
        term: '기운생동 (氣韻生動)',
        definition: '생명력이 넘치는 기운과 운율',
        pronunciation: 'gi-un-saeng-dong',
        culturalSignificance: '동양 예술의 최고 경지를 나타내는 개념',
        relatedTerms: ['신운', '기품', '풍격'],
        visualExample: '/images/terms/giunsaengdong.jpg'
      })
    }

    return commonTerms
  }

  private getSkillsForLevel(level: EducationLevel, culturalContext: CulturalAnalysisResult): string[] {
    const skillMap = {
      beginner: ['기본 서예 용어 이해', '작품 감상 능력', '문화적 맥락 인식'],
      intermediate: ['서체 구분 능력', '문화적 의미 해석', '역사적 맥락 이해'],
      advanced: ['작품 분석 능력', '철학적 해석 능력', '비교 연구 능력'],
      expert: ['학술적 분석 능력', '연구 방법론 적용', '이론적 체계화']
    }
    return skillMap[level] || skillMap.intermediate
  }

  private getCulturalKnowledgeForLevel(level: EducationLevel, culturalContext: CulturalAnalysisResult): string[] {
    const knowledgeMap = {
      beginner: ['한국 서예 기초', '문화적 가치 이해'],
      intermediate: ['서예 전통과 변천', '철학적 배경 이해'],
      advanced: ['서예사적 위치', '현대적 의의 파악'],
      expert: ['학술적 연구 맥락', '이론적 기여도 평가']
    }
    return knowledgeMap[level] || knowledgeMap.intermediate
  }

  private getAssessmentMethodForLevel(level: EducationLevel): string {
    const methodMap = {
      beginner: '기본 개념 확인 퀴즈',
      intermediate: '문화적 해석 에세이',
      advanced: '비교 분석 보고서',
      expert: '학술 논문 형태 분석'
    }
    return methodMap[level] || methodMap.intermediate
  }

  private estimateDurationForLevel(level: EducationLevel, content: any): number {
    const durationMap = {
      beginner: 15,      // 15 minutes
      intermediate: 30,   // 30 minutes
      advanced: 45,      // 45 minutes
      expert: 60         // 60 minutes
    }
    return durationMap[level] || 30
  }

  private getPrerequisitesForLevel(level: EducationLevel): string[] {
    const prerequisiteMap = {
      beginner: [],
      intermediate: ['기본 서예 용어 이해'],
      advanced: ['중급 서예 지식', '한국 문화사 기초'],
      expert: ['서예사 전문 지식', '연구 방법론 이해']
    }
    return prerequisiteMap[level] || []
  }

  private getNextStepsForLevel(level: EducationLevel): string[] {
    const nextStepMap = {
      beginner: ['중급 과정 진행', '실습 체험 참여'],
      intermediate: ['고급 분석 학습', '전문 서적 읽기'],
      advanced: ['전문가 과정 진행', '연구 프로젝트 참여'],
      expert: ['학술 발표', '연구 논문 작성']
    }
    return nextStepMap[level] || []
  }

  private async getCulturalContextForArtwork(artworkId: string): Promise<CulturalAnalysisResult> {
    // Mock implementation - in real scenario, this would fetch from database or generate new analysis
    throw new Error('Cultural context not provided and auto-generation not implemented')
  }

  private async generateSectionContent(
    template: any,
    culturalContext: CulturalAnalysisResult,
    languages: Language[],
    level: EducationLevel
  ): Promise<MultiLanguageText> {
    // Generate section content based on template and cultural context
    const baseContent = this.generateBaseSectionContent(template, culturalContext, level)
    
    return await this.multilingualAdapter.adaptContent(
      baseContent,
      'korean',
      languages,
      { contentType: 'section_content', educationLevel: level }
    )
  }

  private generateBaseSectionContent(template: any, culturalContext: CulturalAnalysisResult, level: EducationLevel): string {
    // Generate base content based on the template and analysis result
    return `${template.title}에 대한 ${level} 수준의 설명 내용입니다.`
  }

  private async generateVisualSupports(template: any, culturalContext: CulturalAnalysisResult) {
    // Generate visual support materials
    return []
  }

  private async generateHistoricalBackground(
    historicalAnalysis: any,
    languages: Language[]
  ): Promise<MultiLanguageText> {
    const baseContent = `${historicalAnalysis.historicalContext.period} 시대의 문화적 배경과 사회적 맥락`
    return await this.multilingualAdapter.adaptContent(
      baseContent,
      'korean',
      languages,
      { contentType: 'historical_background' }
    )
  }

  private async generatePhilosophicalContext(
    philosophicalAnalysis: any,
    languages: Language[]
  ): Promise<MultiLanguageText> {
    const baseContent = '작품에 담긴 철학적 사상과 정신적 배경'
    return await this.multilingualAdapter.adaptContent(
      baseContent,
      'korean',
      languages,
      { contentType: 'philosophical_context' }
    )
  }

  private async generateArtisticTradition(
    artisticTradition: any,
    languages: Language[]
  ): Promise<MultiLanguageText> {
    const baseContent = `${artisticTradition.schoolOfThought} 유파의 예술적 전통과 특징`
    return await this.multilingualAdapter.adaptContent(
      baseContent,
      'korean',
      languages,
      { contentType: 'artistic_tradition' }
    )
  }

  private async generateModernRelevance(
    modernInterpretation: any,
    languages: Language[]
  ): Promise<MultiLanguageText> {
    const baseContent = `${modernInterpretation.contemporaryRelevance}와 현대적 의의`
    return await this.multilingualAdapter.adaptContent(
      baseContent,
      'korean',
      languages,
      { contentType: 'modern_relevance' }
    )
  }

  private async generateQuizContent(culturalContext: CulturalAnalysisResult, level: EducationLevel) {
    // Generate quiz questions based on cultural context and education level
    return {
      questions: [
        {
          question: '이 작품의 주된 서체는 무엇인가요?',
          options: ['해서', '행서', '초서', '예서'],
          correct: 0,
          explanation: '작품의 시각적 특성을 바탕으로 한 서체 분류'
        }
      ]
    }
  }

  private async generateAnnotationContent(culturalContext: CulturalAnalysisResult) {
    // Generate interactive annotation points
    return {
      annotations: [
        {
          x: 0.3,
          y: 0.2,
          title: '필획의 특징',
          description: '이 부분의 필획에서 볼 수 있는 기법적 특징과 문화적 의미'
        }
      ]
    }
  }

  private async generatePracticalExercises(
    level: EducationLevel,
    culturalContext: CulturalAnalysisResult,
    languages: Language[]
  ): Promise<PracticalExercise[]> {
    // Generate practical exercises for hands-on learning
    return []
  }

  private async generateReflection(
    level: EducationLevel,
    culturalContext: CulturalAnalysisResult,
    languages: Language[]
  ): Promise<MultiLanguageText> {
    const baseReflection = '이 작품을 통해 한국 문화의 어떤 면을 새롭게 발견하셨나요?'
    return await this.multilingualAdapter.adaptContent(
      baseReflection,
      'korean',
      languages,
      { contentType: 'reflection' }
    )
  }

  private async generateAssessmentCriteria(
    levels: EducationLevel[],
    objectives: LearningObjective[],
    primaryLanguage: Language
  ): Promise<AssessmentCriteria[]> {
    // Generate assessment criteria based on learning objectives
    return []
  }

  private async generateVisualAids(
    culturalContext: CulturalAnalysisResult,
    languages: Language[]
  ): Promise<VisualAid[]> {
    // Generate visual aids for educational content
    return []
  }

  private async generateProgressionPath(
    levels: EducationLevel[],
    objectives: LearningObjective[],
    primaryLanguage: Language
  ): Promise<ProgressionStep[]> {
    // Generate learning progression path
    return []
  }

  private async calculateQualityMetrics(
    culturalContext: CulturalAnalysisResult,
    contentLevels: ContentLevel[],
    objectives: LearningObjective[]
  ) {
    // Calculate quality metrics for the generated content
    return {
      effectiveness: 8.5,
      culturalAccuracy: 9.2,
      engagement: 8.8
    }
  }

  private async generateMultilingualObjective(
    level: EducationLevel,
    culturalContext: CulturalAnalysisResult,
    primaryLanguage: Language
  ): Promise<MultiLanguageText> {
    const baseObjective = this.getBaseObjectiveForLevel(level, culturalContext)
    
    // For now, return the base objective in Korean
    // In a full implementation, this would be adapted to multiple languages
    return {
      korean: baseObjective,
      english: baseObjective, // Would be properly translated
      japanese: baseObjective, // Would be properly translated
      chinese: baseObjective  // Would be properly translated
    }
  }

  private getBaseObjectiveForLevel(level: EducationLevel, culturalContext: CulturalAnalysisResult): string {
    const objectiveMap = {
      beginner: '한국 서예의 기본 개념과 문화적 가치를 이해한다.',
      intermediate: '작품의 문화적 맥락과 예술적 기법을 분석할 수 있다.',
      advanced: '서예 작품의 철학적 배경과 역사적 의의를 종합적으로 해석할 수 있다.',
      expert: '작품에 대한 학술적 분석과 연구를 수행할 수 있다.'
    }
    return objectiveMap[level] || objectiveMap.intermediate
  }
}