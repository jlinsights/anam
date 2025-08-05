/**
 * Cultural Context Database Types
 * Comprehensive type definitions for Korean calligraphy cultural analysis
 */

export type CalligraphyStyle = 
  | 'kaishu'        // 해서 (楷書) - Standard script
  | 'xingshu'       // 행서 (行書) - Running script  
  | 'caoshu'        // 초서 (草書) - Cursive script
  | 'lishu'         // 예서 (隸書) - Clerical script
  | 'zhuanshu'      // 전서 (篆書) - Seal script
  | 'hangeul-calligraphy'  // 한글서예
  | 'mixed-script'         // 혼합서체
  | 'modern-interpretation' // 현대적 해석

export type CulturalPeriod = 
  | 'ancient'
  | 'classical' 
  | 'medieval'
  | 'early-modern'
  | 'modern' 
  | 'contemporary' 
  | 'digital-age'
  | 'traditional-revival'

export type InkFlowPattern = 
  | 'controlled' 
  | 'flowing' 
  | 'explosive' 
  | 'meditative'

export type EducationLevel = 
  | 'beginner' 
  | 'intermediate' 
  | 'advanced' 
  | 'expert'

export type ComplexityLevel = 
  | 'simple' 
  | 'moderate' 
  | 'complex' 
  | 'expert'

export type Language = 
  | 'korean' 
  | 'english' 
  | 'japanese' 
  | 'chinese'

export interface MultiLanguageText {
  korean: string
  english: string
  japanese?: string
  chinese?: string
}

// Cultural Context Core Interface
export interface CulturalContext {
  id: string
  artworkId: string
  analysisResult: CulturalAnalysisResult
  culturalMetadata: {
    culturalSignificance: any
    historicalPeriod: string
    regionalInfluences: string[]
    philosophicalThemes: string[]
    traditionalElements: any
    modernInterpretation: any
  }
  generatedLanguages: Language[]
  qualityMetrics: {
    culturalAccuracy: number
    analysisDepth: number
    expertValidationScore: number
    userEngagementScore: number
    educationalEffectiveness: number
  }
  expertValidation?: {
    required: boolean
    status: 'pending' | 'approved' | 'rejected'
    expertId: string
    validatedAt: Date | null
    feedback: {
      culturalAccuracy: number
      historicalAccuracy: number
      linguisticQuality: number
      educationalValue: number
      overallScore: number
    }
    comments: MultiLanguageText
  }
  createdAt: Date
  updatedAt: Date
}

export interface TechnicalAnalysis {
  brushwork: string
  composition: string
  inkUsage: string
  paperInteraction: string
  styleCharacteristics: StyleCharacteristics
}

export interface StyleCharacteristics {
  brushTechnique: BrushTechnique[]
  inkFlowPattern: InkFlowPattern
  compositionPrinciples: CompositionPrinciple[]
  culturalPeriod: CulturalPeriod
  philosophicalBackground: PhilosophicalConcept[]
  learningComplexity: ComplexityLevel
}

export interface BrushTechnique {
  name: string
  description: MultiLanguageText
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master'
  culturalSignificance: string
}

export interface CompositionPrinciple {
  principle: string
  description: MultiLanguageText
  culturalOrigin: string
  visualExample?: string
}

export interface PhilosophicalConcept {
  concept: string
  description: MultiLanguageText
  tradition: 'confucianism' | 'buddhism' | 'taoism' | 'shamanism' | 'modern'
  relevanceToArtwork: string
}


export interface CulturalReference {
  id: string
  type: 'historical' | 'literary' | 'philosophical' | 'artistic'
  source: string
  description: MultiLanguageText
  relevance: number // 1-10 scale
  verified: boolean
  expertValidated: boolean
}

// Educational Content Types
export interface EducationalContent {
  id: string
  artworkId: string
  
  // Content Structure
  learningObjectives: LearningObjective[]
  contentLevels: ContentLevel[]
  assessmentCriteria: AssessmentCriteria[]
  
  // Interactive Elements
  interactiveElements: InteractiveElement[]
  visualAids: VisualAid[]
  progressionPath: ProgressionStep[]
  
  // Multilingual Support
  languages: Language[]
  primaryLanguage: Language
  
  // Quality Metrics
  educationalEffectiveness: number
  culturalAccuracy: number
  userEngagement: number
  expertValidation: ExpertValidation
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export interface LearningObjective {
  id: string
  level: EducationLevel
  objective: MultiLanguageText
  skills: string[]
  culturalKnowledge: string[]
  assessmentMethod: string
}

export interface ContentLevel {
  level: EducationLevel
  content: LevelContent
  estimatedDuration: number // minutes
  prerequisites: string[]
  nextSteps: string[]
}

export interface LevelContent {
  introduction: MultiLanguageText
  keyTerms: CulturalTerm[]
  mainContent: ContentSection[]
  culturalContext: CulturalContextSection[]
  practicalExercises?: PracticalExercise[]
  reflection: MultiLanguageText
}

export interface CulturalTerm {
  term: MultiLanguageText
  definition: MultiLanguageText
  pronunciation?: string
  culturalSignificance: string
  relatedTerms: string[]
  visualExample?: string
}

export interface ContentSection {
  title: MultiLanguageText
  content: MultiLanguageText
  type: 'explanation' | 'analysis' | 'comparison' | 'historical_context'
  visualSupports: VisualSupport[]
  culturalNotes: string[]
}

export interface CulturalContextSection {
  title: MultiLanguageText
  period: string
  culturalBackground: MultiLanguageText
  philosophicalContext: MultiLanguageText
  artisticTradition: MultiLanguageText
  modernRelevance: MultiLanguageText
}

export interface PracticalExercise {
  title: MultiLanguageText
  instructions: MultiLanguageText
  expectedOutcome: string
  culturalLearning: string
  difficulty: EducationLevel
}

export interface VisualSupport {
  type: 'image' | 'diagram' | 'comparison' | 'timeline' | 'map'
  url: string
  caption: MultiLanguageText
  culturalSignificance?: string
}

export interface AssessmentCriteria {
  criterion: string
  description: MultiLanguageText
  weight: number
  rubric: RubricLevel[]
}

export interface RubricLevel {
  level: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement'
  description: MultiLanguageText
  culturalUnderstanding: string
  points: number
}

export interface InteractiveElement {
  id: string
  type: 'quiz' | 'annotation' | 'comparison' | 'timeline' | 'cultural_map'
  title: MultiLanguageText
  instructions: MultiLanguageText
  content: any // Type varies by interaction type
  culturalLearningGoals: string[]
}

export interface VisualAid {
  id: string
  type: 'infographic' | 'process_diagram' | 'cultural_comparison' | 'historical_timeline'
  title: MultiLanguageText
  description: MultiLanguageText
  imageUrl: string
  interactiveFeatures?: InteractiveFeature[]
}

export interface InteractiveFeature {
  type: 'hotspot' | 'overlay' | 'zoom' | 'comparison'
  position: { x: number; y: number }
  content: MultiLanguageText
  culturalContext: string
}

export interface ProgressionStep {
  step: number
  title: MultiLanguageText
  description: MultiLanguageText
  completionCriteria: string[]
  culturalMilestone: string
  nextRecommendation: string
}

// Expert Validation Types
export interface ExpertValidation {
  id: string
  artworkId: string
  expertId: string
  expertName: string
  expertCredentials: string
  validationType: 'cultural_accuracy' | 'educational_content' | 'historical_context' | 'linguistic_accuracy'
  
  validation: {
    overallScore: number // 1-10
    culturalAccuracy: number
    historicalAccuracy: number
    educationalValue: number
    linguisticQuality: number
  }
  
  feedback: {
    strengths: string[]
    improvements: string[]
    criticalIssues: string[]
    recommendations: string[]
  }
  
  comments: MultiLanguageText
  approved: boolean
  validatedAt: Date
}

// Analysis Result Types
export interface CulturalAnalysisResult {
  id: string
  artworkId: string
  analysisType: 'comprehensive' | 'quick' | 'educational' | 'research'
  
  // Analysis Components
  visualAnalysis: VisualAnalysis
  textualAnalysis: TextualAnalysis
  culturalAnalysis: CulturalAnalysis
  historicalAnalysis: HistoricalAnalysis
  philosophicalAnalysis: PhilosophicalAnalysis
  
  // Quality Metrics
  confidenceScore: number
  culturalAccuracy: number
  analysisDepth: number
  expertValidationRequired: boolean
  
  // Processing Metadata
  processingTime: number
  algorithmsUsed: string[]
  dataSourcesUsed: string[]
  
  createdAt: Date
  validatedAt?: Date
}

export interface VisualAnalysis {
  styleClassification: {
    primaryStyle: CalligraphyStyle
    secondaryStyles: CalligraphyStyle[]
    confidence: number
    styleCharacteristics: string[]
  }
  
  compositionAnalysis: {
    layout: string
    balance: string
    rhythm: string
    emphasis: string
    culturalPrinciples: string[]
  }
  
  brushworkAnalysis: {
    strokeQuality: string
    inkFlowPattern: InkFlowPattern
    pressureVariation: string
    speedIndicators: string
    technicalSkill: ComplexityLevel
  }
  
  aestheticQualities: {
    elegance: number
    power: number
    spirituality: number
    modernInterpretation: number
    traditionalAdherence: number
  }
}

export interface TextualAnalysis {
  textRecognition: {
    extractedText: string
    confidence: number
    characters: RecognizedCharacter[]
    readingDifficulty: EducationLevel
  }
  
  semanticAnalysis: {
    literalMeaning: MultiLanguageText
    culturalMeaning: MultiLanguageText
    poeticElements: string[]
    philosophicalThemes: string[]
  }
  
  literaryConnections: {
    classicalReferences: LiteraryReference[]
    poeticTraditions: string[]
    culturalAllusions: string[]
    historicalConnections: string[]
  }
}

export interface RecognizedCharacter {
  character: string
  position: { x: number; y: number; width: number; height: number }
  confidence: number
  alternativeReadings: string[]
  culturalSignificance?: string
}

export interface LiteraryReference {
  source: string
  author?: string
  period: string
  relevance: string
  culturalContext: MultiLanguageText
}

export interface CulturalAnalysis {
  culturalSignificance: {
    overallSignificance: number
    culturalPeriod: CulturalPeriod
    regionalInfluences: string[]
    socialContext: string
    religiousSpiritual: string[]
  }
  
  traditionalElements: {
    classicalTechniques: string[]
    philosophicalUnderpinnings: string[]
    culturalSymbols: string[]
    ritualSignificance?: string
  }
  
  modernInterpretation: {
    contemporaryRelevance: string
    modernAdaptations: string[]
    crossCulturalAppeal: string
    educationalValue: string
  }
}

export interface HistoricalAnalysis {
  historicalContext: {
    period: string
    dynasty?: string
    socialConditions: string
    culturalMovements: string[]
  }
  
  artisticTradition: {
    schoolOfThought: string
    masterInfluences: string[]
    styleDevelopment: string
    innovativeElements: string[]
  }
  
  historicalSignificance: {
    documentaryValue: string
    culturalPreservation: string
    educationalImportance: string
    researchPotential: string
  }
}

export interface PhilosophicalAnalysis {
  philosophicalThemes: {
    primaryThemes: PhilosophicalTheme[]
    secondaryThemes: PhilosophicalTheme[]
    universalConcepts: string[]
    culturalSpecificConcepts: string[]
  }
  
  spiritualDimensions: {
    meditativeQuality: number
    spiritualSymbolism: string[]
    transcendentElements: string[]
    mindfulnessAspects: string[]
  }
  
  ethicalImplications: {
    moralTeaching: string[]
    socialValues: string[]
    personalDevelopment: string[]
    culturalWisdom: string[]
  }
}

export interface PhilosophicalTheme {
  theme: string
  description: MultiLanguageText
  tradition: string
  relevanceToWork: string
  modernInterpretation: string
}

// API Response Types
export interface CulturalContextResponse {
  success: boolean
  data?: CulturalContext | CulturalContext[]
  error?: string
  metadata?: {
    totalCount?: number
    page?: number
    pageSize?: number
    processingTime?: number
  }
}

export interface EducationalContentResponse {
  success: boolean
  data?: EducationalContent | EducationalContent[]
  error?: string
  metadata?: {
    generationTime?: number
    languagesGenerated?: Language[]
    qualityScore?: number
  }
}

export interface AnalysisResponse {
  success: boolean
  data?: CulturalAnalysisResult
  error?: string
  metadata?: {
    processingTime: number
    confidenceScore: number
    validationRequired: boolean
  }
}

// Database Schema Types (for Supabase integration)
export interface CulturalContextTable {
  id: string
  artwork_id: string
  cultural_period: CulturalPeriod
  calligraphy_style: CalligraphyStyle
  brush_techniques: string[]
  ink_flow_pattern: InkFlowPattern
  cultural_explanation: any // JSONB
  technical_analysis: any // JSONB
  cultural_references: any // JSONB
  validation_status: string
  quality_score: number
  created_at: string
  updated_at: string
}

export interface EducationalContentTable {
  id: string
  artwork_id: string
  learning_level: EducationLevel
  content_data: any // JSONB
  languages_supported: Language[]
  educational_effectiveness: number
  cultural_accuracy: number
  expert_validated: boolean
  created_at: string
  updated_at: string
}

// Analysis Request Interface
export interface AnalysisRequest {
  artworkId: string
  analysisType: 'comprehensive' | 'quick' | 'educational' | 'research'
  includedAnalysis: string[]
  targetLanguages: Language[]
  educationLevels: EducationLevel[]
  expertValidation: boolean
}

// Analysis Response Interface
export interface AnalysisResponse {
  success: boolean
  data?: CulturalAnalysisResult
  error?: string
  metadata?: {
    processingTime: number
    confidenceScore: number
    validationRequired: boolean
  }
}