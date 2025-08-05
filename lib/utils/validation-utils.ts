/**
 * Validation Utilities
 * Comprehensive validation functions for cultural context and educational content data
 */

import {
  CulturalContext,
  CulturalAnalysisResult,
  EducationalContent,
  AnalysisRequest,
  Language,
  EducationLevel,
  CalligraphyStyle,
  CulturalPeriod,
  ComplexityLevel
} from '@/lib/types/cultural-context'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * Validate analysis request
 */
export function validateAnalysisRequest(request: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required fields
  if (!request.artworkId) {
    errors.push('Artwork ID is required')
  }

  if (!request.analysisType) {
    errors.push('Analysis type is required')
  } else if (!['comprehensive', 'quick', 'educational', 'research'].includes(request.analysisType)) {
    errors.push('Invalid analysis type. Must be: comprehensive, quick, educational, or research')
  }

  if (!request.includedAnalysis || !Array.isArray(request.includedAnalysis)) {
    errors.push('Included analysis array is required')
  } else if (request.includedAnalysis.length === 0) {
    errors.push('At least one analysis type must be included')
  } else {
    const validAnalysisTypes = ['visual', 'textual', 'cultural', 'historical', 'philosophical']
    const invalidTypes = request.includedAnalysis.filter((type: string) => !validAnalysisTypes.includes(type))
    if (invalidTypes.length > 0) {
      errors.push(`Invalid analysis types: ${invalidTypes.join(', ')}`)
    }
  }

  if (!request.targetLanguages || !Array.isArray(request.targetLanguages)) {
    errors.push('Target languages array is required')
  } else if (request.targetLanguages.length === 0) {
    errors.push('At least one target language must be specified')
  } else {
    const validLanguages: Language[] = ['korean', 'english', 'japanese', 'chinese']
    const invalidLanguages = request.targetLanguages.filter((lang: Language) => !validLanguages.includes(lang))
    if (invalidLanguages.length > 0) {
      errors.push(`Invalid languages: ${invalidLanguages.join(', ')}`)
    }
  }

  if (!request.educationLevels || !Array.isArray(request.educationLevels)) {
    errors.push('Education levels array is required')
  } else if (request.educationLevels.length === 0) {
    errors.push('At least one education level must be specified')
  } else {
    const validLevels: EducationLevel[] = ['beginner', 'intermediate', 'advanced', 'expert']
    const invalidLevels = request.educationLevels.filter((level: EducationLevel) => !validLevels.includes(level))
    if (invalidLevels.length > 0) {
      errors.push(`Invalid education levels: ${invalidLevels.join(', ')}`)
    }
  }

  if (typeof request.expertValidation !== 'boolean') {
    errors.push('Expert validation must be a boolean value')
  }

  // Warnings for performance considerations
  if (request.includedAnalysis.length > 3) {
    warnings.push('Including more than 3 analysis types may significantly increase processing time')
  }

  if (request.targetLanguages.length > 2) {
    warnings.push('Generating content for more than 2 languages may increase processing time')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Validate cultural context data
 */
export function validateCulturalContext(context: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required fields
  if (!context.id) {
    errors.push('Cultural context ID is required')
  }

  if (!context.artworkId) {
    errors.push('Artwork ID is required')
  }

  if (!context.analysisResult) {
    errors.push('Analysis result is required')
  } else {
    const analysisValidation = validateAnalysisResult(context.analysisResult)
    if (!analysisValidation.isValid) {
      errors.push(...analysisValidation.errors.map(err => `Analysis result: ${err}`))
    }
  }

  if (!context.culturalMetadata) {
    errors.push('Cultural metadata is required')
  }

  if (!context.generatedLanguages || !Array.isArray(context.generatedLanguages)) {
    errors.push('Generated languages array is required')
  } else if (context.generatedLanguages.length === 0) {
    errors.push('At least one generated language must be specified')
  }

  if (!context.qualityMetrics) {
    errors.push('Quality metrics are required')
  } else {
    const metricsValidation = validateQualityMetrics(context.qualityMetrics)
    if (!metricsValidation.isValid) {
      errors.push(...metricsValidation.errors.map(err => `Quality metrics: ${err}`))
    }
  }

  // Check dates
  if (!context.createdAt) {
    errors.push('Created date is required')
  } else if (!(context.createdAt instanceof Date) && isNaN(Date.parse(context.createdAt))) {
    errors.push('Invalid created date format')
  }

  if (!context.updatedAt) {
    errors.push('Updated date is required')
  } else if (!(context.updatedAt instanceof Date) && isNaN(Date.parse(context.updatedAt))) {
    errors.push('Invalid updated date format')
  } else if (new Date(context.updatedAt) < new Date(context.createdAt)) {
    errors.push('Updated date cannot be earlier than created date')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Validate educational content
 */
export function validateEducationalContent(content: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required fields
  if (!content.id) {
    errors.push('Educational content ID is required')
  }

  if (!content.artworkId) {
    errors.push('Artwork ID is required')
  }

  if (!content.learningObjectives || !Array.isArray(content.learningObjectives)) {
    errors.push('Learning objectives array is required')
  } else if (content.learningObjectives.length === 0) {
    errors.push('At least one learning objective must be provided')
  }

  if (!content.contentLevels || !Array.isArray(content.contentLevels)) {
    errors.push('Content levels array is required')
  } else if (content.contentLevels.length === 0) {
    errors.push('At least one content level must be provided')
  }

  if (!content.languages || !Array.isArray(content.languages)) {
    errors.push('Languages array is required')
  } else if (content.languages.length === 0) {
    errors.push('At least one language must be specified')
  }

  if (!content.primaryLanguage) {
    errors.push('Primary language is required')
  }

  // Validate quality scores
  if (typeof content.educationalEffectiveness !== 'number') {
    errors.push('Educational effectiveness must be a number')
  } else if (content.educationalEffectiveness < 0 || content.educationalEffectiveness > 10) {
    errors.push('Educational effectiveness must be between 0 and 10')
  } else if (content.educationalEffectiveness < 7) {
    warnings.push('Educational effectiveness score is below recommended threshold (7.0)')
  }

  if (typeof content.culturalAccuracy !== 'number') {
    errors.push('Cultural accuracy must be a number')
  } else if (content.culturalAccuracy < 0 || content.culturalAccuracy > 10) {
    errors.push('Cultural accuracy must be between 0 and 10')
  } else if (content.culturalAccuracy < 8) {
    warnings.push('Cultural accuracy score is below recommended threshold (8.0)')
  }

  if (typeof content.userEngagement !== 'number') {
    errors.push('User engagement must be a number')
  } else if (content.userEngagement < 0 || content.userEngagement > 10) {
    errors.push('User engagement must be between 0 and 10')
  }

  // Check dates
  if (!content.createdAt) {
    errors.push('Created date is required')
  } else if (!(content.createdAt instanceof Date) && isNaN(Date.parse(content.createdAt))) {
    errors.push('Invalid created date format')
  }

  if (!content.updatedAt) {
    errors.push('Updated date is required')
  } else if (!(content.updatedAt instanceof Date) && isNaN(Date.parse(content.updatedAt))) {
    errors.push('Invalid updated date format')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Validate analysis result
 */
export function validateAnalysisResult(result: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!result.id) {
    errors.push('Analysis result ID is required')
  }

  if (!result.artworkId) {
    errors.push('Artwork ID is required')
  }

  if (!result.analysisType) {
    errors.push('Analysis type is required')
  }

  // Validate confidence scores
  if (typeof result.confidenceScore !== 'number') {
    errors.push('Confidence score must be a number')
  } else if (result.confidenceScore < 0 || result.confidenceScore > 10) {
    errors.push('Confidence score must be between 0 and 10')
  } else if (result.confidenceScore < 7) {
    warnings.push('Confidence score is below recommended threshold (7.0)')
  }

  if (typeof result.culturalAccuracy !== 'number') {
    errors.push('Cultural accuracy must be a number')
  } else if (result.culturalAccuracy < 0 || result.culturalAccuracy > 10) {
    errors.push('Cultural accuracy must be between 0 and 10')
  }

  if (typeof result.analysisDepth !== 'number') {
    errors.push('Analysis depth must be a number')
  } else if (result.analysisDepth < 0 || result.analysisDepth > 10) {
    errors.push('Analysis depth must be between 0 and 10')
  }

  if (typeof result.processingTime !== 'number') {
    errors.push('Processing time must be a number')
  } else if (result.processingTime < 0) {
    errors.push('Processing time cannot be negative')
  } else if (result.processingTime > 300000) { // 5 minutes
    warnings.push('Processing time exceeds recommended maximum (5 minutes)')
  }

  if (!result.algorithmsUsed || !Array.isArray(result.algorithmsUsed)) {
    errors.push('Algorithms used array is required')
  }

  if (!result.dataSourcesUsed || !Array.isArray(result.dataSourcesUsed)) {
    errors.push('Data sources used array is required')
  }

  if (!result.createdAt) {
    errors.push('Created date is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Validate quality metrics
 */
export function validateQualityMetrics(metrics: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const requiredMetrics = [
    'culturalAccuracy',
    'analysisDepth',
    'expertValidationScore',
    'userEngagementScore',
    'educationalEffectiveness'
  ]

  for (const metric of requiredMetrics) {
    if (typeof metrics[metric] !== 'number') {
      errors.push(`${metric} must be a number`)
    } else if (metrics[metric] < 0 || metrics[metric] > 10) {
      errors.push(`${metric} must be between 0 and 10`)
    } else if (metrics[metric] < 7) {
      warnings.push(`${metric} is below recommended threshold (7.0)`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Validate calligraphy style
 */
export function validateCalligraphyStyle(style: string): boolean {
  const validStyles: CalligraphyStyle[] = [
    'kaishu',
    'xingshu',
    'caoshu',
    'lishu',
    'zhuanshu',
    'hangeul-calligraphy',
    'mixed-script',
    'modern-interpretation'
  ]
  return validStyles.includes(style as CalligraphyStyle)
}

/**
 * Validate cultural period
 */
export function validateCulturalPeriod(period: string): boolean {
  const validPeriods: CulturalPeriod[] = [
    'ancient',
    'classical',
    'medieval',
    'early-modern',
    'modern',
    'contemporary',
    'digital-age',
    'traditional-revival'
  ]
  return validPeriods.includes(period as CulturalPeriod)
}

/**
 * Validate complexity level
 */
export function validateComplexityLevel(level: string): boolean {
  const validLevels: ComplexityLevel[] = ['simple', 'moderate', 'complex', 'expert']
  return validLevels.includes(level as ComplexityLevel)
}

/**
 * Validate language code
 */
export function validateLanguage(language: string): boolean {
  const validLanguages: Language[] = ['korean', 'english', 'japanese', 'chinese']
  return validLanguages.includes(language as Language)
}

/**
 * Validate education level
 */
export function validateEducationLevel(level: string): boolean {
  const validLevels: EducationLevel[] = ['beginner', 'intermediate', 'advanced', 'expert']
  return validLevels.includes(level as EducationLevel)
}

/**
 * Sanitize text input
 */
export function sanitizeTextInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potentially dangerous HTML characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .substring(0, 10000) // Limit length to prevent DoS
}

/**
 * Validate and sanitize artwork ID
 */
export function validateArtworkId(artworkId: string): ValidationResult {
  const errors: string[] = []

  if (!artworkId) {
    errors.push('Artwork ID is required')
  } else if (typeof artworkId !== 'string') {
    errors.push('Artwork ID must be a string')
  } else if (artworkId.length < 3) {
    errors.push('Artwork ID must be at least 3 characters long')
  } else if (artworkId.length > 100) {
    errors.push('Artwork ID must be less than 100 characters long')
  } else if (!/^[a-zA-Z0-9_-]+$/.test(artworkId)) {
    errors.push('Artwork ID can only contain letters, numbers, underscores, and hyphens')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Comprehensive data validation function
 */
export function validateData(data: any, type: 'analysis-request' | 'cultural-context' | 'educational-content'): ValidationResult {
  switch (type) {
    case 'analysis-request':
      return validateAnalysisRequest(data)
    case 'cultural-context':
      return validateCulturalContext(data)
    case 'educational-content':
      return validateEducationalContent(data)
    default:
      return {
        isValid: false,
        errors: [`Unknown validation type: ${type}`]
      }
  }
}

/**
 * Batch validate multiple items
 */
export function batchValidate<T>(
  items: T[],
  validator: (item: T) => ValidationResult
): { valid: T[]; invalid: Array<{ item: T; errors: string[] }> } {
  const valid: T[] = []
  const invalid: Array<{ item: T; errors: string[] }> = []

  for (const item of items) {
    const result = validator(item)
    if (result.isValid) {
      valid.push(item)
    } else {
      invalid.push({ item, errors: result.errors })
    }
  }

  return { valid, invalid }
}