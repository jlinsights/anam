/**
 * Cultural Metadata Integration with Airtable
 * Bridges the Cultural Context Database with existing Airtable artwork data
 * Provides seamless integration for AI-powered cultural analysis
 */

import { getBase as getAirtableBase, safeAirtableRequest } from './airtable-client'
import { getCachedData, setCachedData } from './cache'
import { captureError } from './error-logger'
import type { Artwork } from './types'
import type {
  CulturalContext,
  CulturalAnalysisResult,
  EducationalContent,
  CalligraphyStyle,
  CulturalPeriod,
  Language,
  EducationLevel
} from './types/cultural-context'

// Cache duration for cultural metadata (longer than regular artwork data)
const CULTURAL_CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

/**
 * Cultural Context Table Schema in Airtable
 * This table stores AI-generated cultural analysis data linked to artworks
 */
export interface AirtableCulturalContext {
  id: string
  artworkId: string // Links to Artworks table record ID
  analysisResult: string // JSON serialized CulturalAnalysisResult
  culturalMetadata: string // JSON serialized cultural metadata
  generatedLanguages: string[] // Array of supported languages
  qualityMetrics: string // JSON serialized quality scores
  lastAnalysisDate: string // ISO date string
  analysisVersion: string // Version of analysis algorithm used
  expertValidated: boolean // Whether expert has validated this analysis
  validationNotes?: string // Expert validation comments
  createdAt: string
  updatedAt: string
}

/**
 * Educational Content Table Schema in Airtable
 * Stores generated educational content for different levels and languages
 */
export interface AirtableEducationalContent {
  id: string
  artworkId: string // Links to Artworks table record ID
  culturalContextId: string // Links to Cultural Context table
  contentLevel: string // beginner, intermediate, advanced, expert
  language: string // korean, english, japanese, chinese
  contentData: string // JSON serialized educational content
  learningObjectives: string[] // Array of learning objectives
  culturalSignificance: number // 0-10 scale
  educationalEffectiveness: number // 0-10 scale
  lastUpdated: string
  generationVersion: string
}

/**
 * Enhanced Artwork interface with cultural metadata
 */
export interface ArtworkWithCulturalMetadata extends Artwork {
  culturalContext?: CulturalContext
  educationalContent?: EducationalContent[]
  aiAnalysisAvailable: boolean
  culturalSignificanceScore?: number
  recommendedEducationLevel?: EducationLevel
  culturalTags?: string[]
  philosophicalThemes?: string[]
  historicalPeriod?: CulturalPeriod
  calligraphyStyle?: CalligraphyStyle
}

/**
 * Field mappings for Cultural Context table
 */
const CULTURAL_CONTEXT_FIELD_MAP: Record<string, string[]> = {
  artworkId: ['artworkId', 'Artwork ID', 'Artwork_ID', '작품_ID'],
  analysisResult: ['analysisResult', 'Analysis Result', 'Analysis_Result', '분석_결과'],
  culturalMetadata: ['culturalMetadata', 'Cultural Metadata', 'Cultural_Metadata', '문화_메타데이터'],
  generatedLanguages: ['generatedLanguages', 'Generated Languages', 'Generated_Languages', '생성_언어'],
  qualityMetrics: ['qualityMetrics', 'Quality Metrics', 'Quality_Metrics', '품질_지표'],
  lastAnalysisDate: ['lastAnalysisDate', 'Last Analysis Date', 'Last_Analysis_Date', '마지막_분석일'],
  analysisVersion: ['analysisVersion', 'Analysis Version', 'Analysis_Version', '분석_버전'],
  expertValidated: ['expertValidated', 'Expert Validated', 'Expert_Validated', '전문가_검증'],
  validationNotes: ['validationNotes', 'Validation Notes', 'Validation_Notes', '검증_노트']
}

/**
 * Field mappings for Educational Content table
 */
const EDUCATIONAL_CONTENT_FIELD_MAP: Record<string, string[]> = {
  artworkId: ['artworkId', 'Artwork ID', 'Artwork_ID', '작품_ID'],
  culturalContextId: ['culturalContextId', 'Cultural Context ID', 'Cultural_Context_ID', '문화맥락_ID'],
  contentLevel: ['contentLevel', 'Content Level', 'Content_Level', '콘텐츠_수준'],
  language: ['language', 'Language', '언어'],
  contentData: ['contentData', 'Content Data', 'Content_Data', '콘텐츠_데이터'],
  learningObjectives: ['learningObjectives', 'Learning Objectives', 'Learning_Objectives', '학습_목표'],
  culturalSignificance: ['culturalSignificance', 'Cultural Significance', 'Cultural_Significance', '문화적_중요성'],
  educationalEffectiveness: ['educationalEffectiveness', 'Educational Effectiveness', 'Educational_Effectiveness', '교육적_효과'],
  generationVersion: ['generationVersion', 'Generation Version', 'Generation_Version', '생성_버전']
}

/**
 * Helper function to get field value with fallback options
 */
function getFieldValue(fields: any, fieldNames: string[]): any {
  for (const fieldName of fieldNames) {
    if (fields[fieldName] !== undefined && fields[fieldName] !== null && fields[fieldName] !== '') {
      return fields[fieldName]
    }
  }
  return null
}

/**
 * Helper function to pick field using mapping
 */
function pickField<T = any>(
  fields: any,
  map: Record<string, string[]>,
  key: string
): T | undefined {
  return getFieldValue(fields, map[key] ?? [key]) as T | undefined
}

/**
 * Safe JSON parsing with error handling
 */
function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    console.warn('Failed to parse JSON:', error)
    return fallback
  }
}

/**
 * Fetch cultural context data for a specific artwork from Airtable
 */
export async function fetchCulturalContextFromAirtable(
  artworkId: string
): Promise<CulturalContext | null> {
  const cacheKey = `cultural-context-${artworkId}`
  
  // Check cache first
  const cachedData = getCachedData(cacheKey)
  if (cachedData) {
    console.log(`📦 Using cached cultural context for artwork: ${artworkId}`)
    return cachedData
  }

  try {
    console.log(`📡 Fetching cultural context for artwork: ${artworkId}`)
    
    const records = await safeAirtableRequest(async () => {
      const base = await getAirtableBase()
      if (!base) return []

      return new Promise((resolve, reject) => {
        const results: any[] = []
        base('Cultural Context')
          .select({
            filterByFormula: `{artworkId} = '${artworkId}'`,
            sort: [{ field: 'lastAnalysisDate', direction: 'desc' }],
            maxRecords: 1
          })
          .eachPage(
            (pageRecords: any[], fetchNextPage: () => void) => {
              results.push(...pageRecords)
              fetchNextPage()
            },
            (err: any) => {
              if (err) reject(err)
              else resolve(results)
            }
          )
      })
    })

    if (!records || records.length === 0) {
      console.log(`ℹ️ No cultural context found for artwork: ${artworkId}`)
      return null
    }

    const record = records[0]
    const fields = record.fields

    // Parse the stored JSON data
    const analysisResult = safeJsonParse<CulturalAnalysisResult>(
      pickField<string>(fields, CULTURAL_CONTEXT_FIELD_MAP, 'analysisResult') || '{}',
      {} as CulturalAnalysisResult
    )

    const culturalMetadata = safeJsonParse<any>(
      pickField<string>(fields, CULTURAL_CONTEXT_FIELD_MAP, 'culturalMetadata') || '{}',
      {}
    )

    const qualityMetrics = safeJsonParse<any>(
      pickField<string>(fields, CULTURAL_CONTEXT_FIELD_MAP, 'qualityMetrics') || '{}',
      {}
    )

    const culturalContext: CulturalContext = {
      id: record.id,
      artworkId,
      analysisResult,
      culturalMetadata,
      generatedLanguages: pickField<Language[]>(fields, CULTURAL_CONTEXT_FIELD_MAP, 'generatedLanguages') || ['korean'],
      qualityMetrics,
      lastAnalysisDate: new Date(pickField<string>(fields, CULTURAL_CONTEXT_FIELD_MAP, 'lastAnalysisDate') || Date.now()),
      analysisVersion: pickField<string>(fields, CULTURAL_CONTEXT_FIELD_MAP, 'analysisVersion') || '1.0',
      expertValidated: pickField<boolean>(fields, CULTURAL_CONTEXT_FIELD_MAP, 'expertValidated') || false,
      validationNotes: pickField<string>(fields, CULTURAL_CONTEXT_FIELD_MAP, 'validationNotes'),
      createdAt: new Date(record.createdTime || Date.now()),
      updatedAt: new Date(fields.updatedAt || record.createdTime || Date.now())
    }

    // Cache the result
    setCachedData(cacheKey, culturalContext, CULTURAL_CACHE_DURATION)
    
    console.log(`✅ Cultural context fetched for artwork: ${artworkId}`)
    return culturalContext

  } catch (error) {
    console.error(`❌ Error fetching cultural context for artwork ${artworkId}:`, error)
    captureError(error, { scope: 'fetchCulturalContextFromAirtable', artworkId })
    return null
  }
}

/**
 * Store cultural context data in Airtable
 */
export async function storeCulturalContextInAirtable(
  culturalContext: CulturalContext
): Promise<boolean> {
  try {
    console.log(`📝 Storing cultural context for artwork: ${culturalContext.artworkId}`)

    await safeAirtableRequest(async () => {
      const base = await getAirtableBase()
      if (!base) throw new Error('Airtable base not available')

      // Check if record already exists
      const existingRecords = await new Promise<any[]>((resolve, reject) => {
        const results: any[] = []
        base('Cultural Context')
          .select({
            filterByFormula: `{artworkId} = '${culturalContext.artworkId}'`,
            maxRecords: 1
          })
          .eachPage(
            (pageRecords: any[], fetchNextPage: () => void) => {
              results.push(...pageRecords)
              fetchNextPage()
            },
            (err: any) => {
              if (err) reject(err)
              else resolve(results)
            }
          )
      })

      const recordData = {
        artworkId: culturalContext.artworkId,
        analysisResult: JSON.stringify(culturalContext.analysisResult),
        culturalMetadata: JSON.stringify(culturalContext.culturalMetadata),
        generatedLanguages: culturalContext.generatedLanguages,
        qualityMetrics: JSON.stringify(culturalContext.qualityMetrics),
        lastAnalysisDate: culturalContext.lastAnalysisDate.toISOString(),
        analysisVersion: culturalContext.analysisVersion,
        expertValidated: culturalContext.expertValidated,
        validationNotes: culturalContext.validationNotes || '',
        updatedAt: new Date().toISOString()
      }

      if (existingRecords.length > 0) {
        // Update existing record
        await base('Cultural Context').update(existingRecords[0].id, recordData)
        console.log(`✅ Updated cultural context for artwork: ${culturalContext.artworkId}`)
      } else {
        // Create new record
        await base('Cultural Context').create(recordData)
        console.log(`✅ Created cultural context for artwork: ${culturalContext.artworkId}`)
      }
    })

    // Clear cache to ensure fresh data on next fetch
    const cacheKey = `cultural-context-${culturalContext.artworkId}`
    setCachedData(cacheKey, null, 0) // Expire immediately

    return true

  } catch (error) {
    console.error(`❌ Error storing cultural context for artwork ${culturalContext.artworkId}:`, error)
    captureError(error, { scope: 'storeCulturalContextInAirtable', artworkId: culturalContext.artworkId })
    return false
  }
}

/**
 * Fetch educational content for a specific artwork and parameters
 */
export async function fetchEducationalContentFromAirtable(
  artworkId: string,
  level?: EducationLevel,
  language?: Language
): Promise<EducationalContent[]> {
  const cacheKey = `educational-content-${artworkId}-${level || 'all'}-${language || 'all'}`
  
  // Check cache first
  const cachedData = getCachedData(cacheKey)
  if (cachedData) {
    console.log(`📦 Using cached educational content for artwork: ${artworkId}`)
    return cachedData
  }

  try {
    console.log(`📡 Fetching educational content for artwork: ${artworkId}`)
    
    // Build filter formula
    let filterFormula = `{artworkId} = '${artworkId}'`
    if (level) {
      filterFormula += ` AND {contentLevel} = '${level}'`
    }
    if (language) {
      filterFormula += ` AND {language} = '${language}'`
    }

    const records = await safeAirtableRequest(async () => {
      const base = await getAirtableBase()
      if (!base) return []

      return new Promise((resolve, reject) => {
        const results: any[] = []
        base('Educational Content')
          .select({
            filterByFormula,
            sort: [{ field: 'lastUpdated', direction: 'desc' }]
          })
          .eachPage(
            (pageRecords: any[], fetchNextPage: () => void) => {
              results.push(...pageRecords)
              fetchNextPage()
            },
            (err: any) => {
              if (err) reject(err)
              else resolve(results)
            }
          )
      })
    })

    if (!records || records.length === 0) {
      console.log(`ℹ️ No educational content found for artwork: ${artworkId}`)
      return []
    }

    const educationalContents: EducationalContent[] = records.map((record: any) => {
      const fields = record.fields

      const contentData = safeJsonParse<any>(
        pickField<string>(fields, EDUCATIONAL_CONTENT_FIELD_MAP, 'contentData') || '{}',
        {}
      )

      return {
        id: record.id,
        artworkId,
        culturalContextId: pickField<string>(fields, EDUCATIONAL_CONTENT_FIELD_MAP, 'culturalContextId') || '',
        contentLevel: pickField<EducationLevel>(fields, EDUCATIONAL_CONTENT_FIELD_MAP, 'contentLevel') || 'intermediate',
        language: pickField<Language>(fields, EDUCATIONAL_CONTENT_FIELD_MAP, 'language') || 'korean',
        contentData,
        learningObjectives: pickField<string[]>(fields, EDUCATIONAL_CONTENT_FIELD_MAP, 'learningObjectives') || [],
        culturalSignificance: pickField<number>(fields, EDUCATIONAL_CONTENT_FIELD_MAP, 'culturalSignificance') || 5,
        educationalEffectiveness: pickField<number>(fields, EDUCATIONAL_CONTENT_FIELD_MAP, 'educationalEffectiveness') || 5,
        lastUpdated: new Date(fields.lastUpdated || record.createdTime || Date.now()),
        generationVersion: pickField<string>(fields, EDUCATIONAL_CONTENT_FIELD_MAP, 'generationVersion') || '1.0',
        languages: [pickField<Language>(fields, EDUCATIONAL_CONTENT_FIELD_MAP, 'language') || 'korean'],
        contentLevels: [pickField<EducationLevel>(fields, EDUCATIONAL_CONTENT_FIELD_MAP, 'contentLevel') || 'intermediate'],
        primaryLanguage: pickField<Language>(fields, EDUCATIONAL_CONTENT_FIELD_MAP, 'language') || 'korean',
        culturalAccuracy: pickField<number>(fields, EDUCATIONAL_CONTENT_FIELD_MAP, 'culturalSignificance') || 8,
        userEngagement: 7.5, // Default engagement score
        createdAt: new Date(record.createdTime || Date.now()),
        updatedAt: new Date(fields.lastUpdated || record.createdTime || Date.now())
      } as EducationalContent
    })

    // Cache the results
    setCachedData(cacheKey, educationalContents, CULTURAL_CACHE_DURATION)
    
    console.log(`✅ Educational content fetched for artwork: ${artworkId} (${educationalContents.length} items)`)
    return educationalContents

  } catch (error) {
    console.error(`❌ Error fetching educational content for artwork ${artworkId}:`, error)
    captureError(error, { scope: 'fetchEducationalContentFromAirtable', artworkId })
    return []
  }
}

/**
 * Fetch enhanced artworks with cultural metadata
 */
export async function fetchArtworksWithCulturalMetadata(
  limit?: number
): Promise<ArtworkWithCulturalMetadata[]> {
  try {
    // First fetch regular artworks from existing Airtable integration
    const { fetchArtworksFromAirtable } = await import('./airtable')
    const artworks = await fetchArtworksFromAirtable()
    
    if (!artworks) {
      console.warn('No artworks available from Airtable')
      return []
    }

    const limitedArtworks = limit ? artworks.slice(0, limit) : artworks
    const enhancedArtworks: ArtworkWithCulturalMetadata[] = []

    console.log(`🎨 Enhancing ${limitedArtworks.length} artworks with cultural metadata`)

    // Fetch cultural metadata for each artwork
    for (const artwork of limitedArtworks) {
      try {
        const culturalContext = await fetchCulturalContextFromAirtable(artwork.id)
        const educationalContent = await fetchEducationalContentFromAirtable(artwork.id)

        const enhancedArtwork: ArtworkWithCulturalMetadata = {
          ...artwork,
          culturalContext: culturalContext || undefined,
          educationalContent: educationalContent.length > 0 ? educationalContent : undefined,
          aiAnalysisAvailable: !!culturalContext,
          culturalSignificanceScore: culturalContext?.analysisResult?.culturalAnalysis?.culturalSignificance?.overallSignificance,
          recommendedEducationLevel: culturalContext ? 'intermediate' : undefined,
          culturalTags: culturalContext?.culturalMetadata?.culturalTags,
          philosophicalThemes: culturalContext?.culturalMetadata?.philosophicalThemes,
          historicalPeriod: culturalContext?.analysisResult?.culturalAnalysis?.culturalSignificance?.culturalPeriod,
          calligraphyStyle: culturalContext?.analysisResult?.visualAnalysis?.styleClassification?.primaryStyle
        }

        enhancedArtworks.push(enhancedArtwork)

      } catch (error) {
        console.warn(`⚠️ Failed to enhance artwork ${artwork.id} with cultural metadata:`, error)
        // Add artwork without cultural metadata
        enhancedArtworks.push({
          ...artwork,
          aiAnalysisAvailable: false
        })
      }
    }

    console.log(`✅ Enhanced ${enhancedArtworks.length} artworks with cultural metadata`)
    console.log(`📊 AI analysis available for ${enhancedArtworks.filter(a => a.aiAnalysisAvailable).length} artworks`)

    return enhancedArtworks

  } catch (error) {
    console.error('❌ Error fetching artworks with cultural metadata:', error)
    captureError(error, { scope: 'fetchArtworksWithCulturalMetadata' })
    return []
  }
}

/**
 * Get cultural statistics for the collection
 */
export async function getCulturalStatistics(): Promise<{
  totalArtworks: number
  artworksWithAnalysis: number
  coveragePercentage: number
  languageSupport: Record<Language, number>
  educationLevelSupport: Record<EducationLevel, number>
  averageQualityScore: number
  expertValidatedCount: number
}> {
  try {
    const artworks = await fetchArtworksWithCulturalMetadata()
    
    const stats = {
      totalArtworks: artworks.length,
      artworksWithAnalysis: artworks.filter(a => a.aiAnalysisAvailable).length,
      coveragePercentage: 0,
      languageSupport: {
        korean: 0,
        english: 0,
        japanese: 0,
        chinese: 0
      } as Record<Language, number>,
      educationLevelSupport: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
        expert: 0
      } as Record<EducationLevel, number>,
      averageQualityScore: 0,
      expertValidatedCount: 0
    }

    stats.coveragePercentage = stats.totalArtworks > 0 
      ? (stats.artworksWithAnalysis / stats.totalArtworks) * 100 
      : 0

    // Analyze language and education level support
    let totalQualityScore = 0
    let qualityScoreCount = 0

    for (const artwork of artworks) {
      if (artwork.culturalContext) {
        // Count language support
        artwork.culturalContext.generatedLanguages.forEach(lang => {
          stats.languageSupport[lang]++
        })

        // Count expert validated
        if (artwork.culturalContext.expertValidated) {
          stats.expertValidatedCount++
        }

        // Calculate average quality score
        if (artwork.culturalContext.qualityMetrics?.culturalAccuracy) {
          totalQualityScore += artwork.culturalContext.qualityMetrics.culturalAccuracy
          qualityScoreCount++
        }
      }

      // Count education level support
      if (artwork.educationalContent) {
        artwork.educationalContent.forEach(content => {
          stats.educationLevelSupport[content.contentLevel]++
        })
      }
    }

    stats.averageQualityScore = qualityScoreCount > 0 
      ? totalQualityScore / qualityScoreCount 
      : 0

    console.log('📊 Cultural statistics calculated:', stats)
    return stats

  } catch (error) {
    console.error('❌ Error calculating cultural statistics:', error)
    captureError(error, { scope: 'getCulturalStatistics' })
    return {
      totalArtworks: 0,
      artworksWithAnalysis: 0,
      coveragePercentage: 0,
      languageSupport: { korean: 0, english: 0, japanese: 0, chinese: 0 },
      educationLevelSupport: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
      averageQualityScore: 0,
      expertValidatedCount: 0
    }
  }
}

/**
 * Bulk update cultural metadata for multiple artworks
 */
export async function bulkUpdateCulturalMetadata(
  updates: Array<{ artworkId: string; culturalContext: CulturalContext }>
): Promise<{ successful: number; failed: number; errors: string[] }> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[]
  }

  console.log(`🔄 Starting bulk update for ${updates.length} cultural metadata entries`)

  for (const update of updates) {
    try {
      const success = await storeCulturalContextInAirtable(update.culturalContext)
      if (success) {
        results.successful++
      } else {
        results.failed++
        results.errors.push(`Failed to update ${update.artworkId}: Unknown error`)
      }
    } catch (error) {
      results.failed++
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      results.errors.push(`Failed to update ${update.artworkId}: ${errorMessage}`)
    }
  }

  console.log(`✅ Bulk update completed: ${results.successful} successful, ${results.failed} failed`)
  
  if (results.errors.length > 0) {
    console.warn('⚠️ Bulk update errors:', results.errors)
  }

  return results
}