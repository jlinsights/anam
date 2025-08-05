/**
 * Cultural Metadata Service
 * High-level service for managing cultural metadata integration with Airtable
 * Provides seamless bridge between AI analysis and data persistence
 */

import {
  fetchCulturalContextFromAirtable,
  storeCulturalContextInAirtable,
  fetchEducationalContentFromAirtable,
  fetchArtworksWithCulturalMetadata,
  getCulturalStatistics,
  bulkUpdateCulturalMetadata,
  type ArtworkWithCulturalMetadata
} from '../airtable-cultural-integration'
import { CulturalAnalysisEngine } from '../agents/cultural-analysis-engine'
import { EducationalContentService } from './educational-content-service'
import type {
  CulturalContext,
  CulturalAnalysisResult,
  EducationalContent,
  Language,
  EducationLevel
} from '../types/cultural-context'
import type { Artwork } from '../types'

export interface CulturalMetadataGenerationOptions {
  forceRegenerate?: boolean
  targetLanguages?: Language[]
  educationLevels?: EducationLevel[]
  includeExpertValidation?: boolean
  analysisType?: 'comprehensive' | 'quick' | 'educational' | 'research'
}

export interface CulturalMetadataBulkOptions {
  batchSize?: number
  delayBetweenBatches?: number
  onProgress?: (current: number, total: number, artworkTitle: string) => void
  onError?: (artworkId: string, error: string) => void
}

export class CulturalMetadataService {
  private analysisEngine: CulturalAnalysisEngine
  private educationalService: EducationalContentService

  constructor() {
    this.analysisEngine = new CulturalAnalysisEngine()
    this.educationalService = new EducationalContentService()
  }

  /**
   * Get cultural metadata for a specific artwork
   * Retrieves from Airtable if available, generates if not
   */
  async getCulturalMetadata(
    artworkId: string,
    options: CulturalMetadataGenerationOptions = {}
  ): Promise<CulturalContext | null> {
    try {
      console.log(`🔍 Getting cultural metadata for artwork: ${artworkId}`)
      
      // Check if we should force regeneration
      if (!options.forceRegenerate) {
        const existingContext = await fetchCulturalContextFromAirtable(artworkId)
        if (existingContext) {
          console.log(`✅ Found existing cultural metadata for artwork: ${artworkId}`)
          return existingContext
        }
      }

      // Generate new cultural analysis
      console.log(`🎨 Generating new cultural analysis for artwork: ${artworkId}`)
      const analysisResult = await this.analysisEngine.performCulturalAnalysis({
        artworkId,
        analysisType: options.analysisType || 'comprehensive',
        includedAnalysis: ['visual', 'textual', 'cultural', 'historical', 'philosophical'],
        targetLanguages: options.targetLanguages || ['korean', 'english'],
        educationLevels: options.educationLevels || ['intermediate'],
        expertValidation: options.includeExpertValidation || false
      })

      // Create cultural context object
      const culturalContext: CulturalContext = {
        id: `ctx_${artworkId}_${Date.now()}`,
        artworkId,
        analysisResult,
        culturalMetadata: {
          culturalTags: this.extractCulturalTags(analysisResult),
          philosophicalThemes: this.extractPhilosophicalThemes(analysisResult),
          historicalContext: analysisResult.historicalAnalysis?.historicalContext,
          technicalAnalysis: {
            calligraphyStyle: analysisResult.visualAnalysis?.styleClassification?.primaryStyle,
            brushworkQuality: analysisResult.visualAnalysis?.brushworkAnalysis?.strokeQuality,
            compositionType: analysisResult.visualAnalysis?.compositionAnalysis?.layout
          },
          educationalMetadata: {
            recommendedLevel: this.determineRecommendedLevel(analysisResult),
            learningComplexity: this.assessLearningComplexity(analysisResult),
            culturalDepth: analysisResult.culturalAnalysis?.culturalSignificance?.overallSignificance || 5
          }
        },
        generatedLanguages: options.targetLanguages || ['korean', 'english'],
        qualityMetrics: {
          culturalAccuracy: analysisResult.culturalAccuracy,
          analysisDepth: analysisResult.analysisDepth,
          expertValidationScore: options.includeExpertValidation ? 9.0 : 7.5,
          userEngagementScore: 8.0,
          educationalEffectiveness: 8.5
        },
        lastAnalysisDate: new Date(),
        analysisVersion: '1.0',
        expertValidated: false,
        validationNotes: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Store in Airtable
      const stored = await storeCulturalContextInAirtable(culturalContext)
      if (!stored) {
        console.warn(`⚠️ Failed to store cultural metadata for artwork: ${artworkId}`)
        // Return the generated context anyway for immediate use
        return culturalContext
      }

      console.log(`✅ Generated and stored cultural metadata for artwork: ${artworkId}`)
      return culturalContext

    } catch (error) {
      console.error(`❌ Error getting cultural metadata for artwork ${artworkId}:`, error)
      return null
    }
  }

  /**
   * Generate educational content for an artwork with cultural metadata
   */
  async generateEducationalContent(
    artworkId: string,
    options: {
      levels?: EducationLevel[]
      languages?: Language[]
      culturalContext?: CulturalContext
    } = {}
  ): Promise<EducationalContent[]> {
    try {
      console.log(`📚 Generating educational content for artwork: ${artworkId}`)

      // Get cultural context if not provided
      let culturalContext = options.culturalContext
      if (!culturalContext) {
        culturalContext = await this.getCulturalMetadata(artworkId)
      }

      if (!culturalContext) {
        console.warn(`⚠️ No cultural context available for artwork: ${artworkId}`)
        return []
      }

      // Generate educational content using the educational service
      const educationalContent = await this.educationalService.generateEducationalContent({
        artworkId,
        levels: options.levels || ['intermediate'],
        languages: options.languages || ['korean', 'english'],
        contentTypes: ['explanation', 'cultural_context', 'learning_objectives', 'historical_background'],
        culturalContext: culturalContext.analysisResult
      })

      console.log(`✅ Generated educational content for artwork: ${artworkId}`)
      return [educationalContent]

    } catch (error) {
      console.error(`❌ Error generating educational content for artwork ${artworkId}:`, error)
      return []
    }
  }

  /**
   * Get enhanced artworks with cultural metadata
   */
  async getEnhancedArtworks(limit?: number): Promise<ArtworkWithCulturalMetadata[]> {
    try {
      return await fetchArtworksWithCulturalMetadata(limit)
    } catch (error) {
      console.error('❌ Error fetching enhanced artworks:', error)
      return []
    }
  }

  /**
   * Get cultural statistics for the collection
   */
  async getCollectionStatistics() {
    try {
      return await getCulturalStatistics()
    } catch (error) {
      console.error('❌ Error fetching cultural statistics:', error)
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
   * Bulk generate cultural metadata for multiple artworks
   */
  async bulkGenerateCulturalMetadata(
    artworkIds: string[],
    options: CulturalMetadataGenerationOptions & CulturalMetadataBulkOptions = {}
  ): Promise<{
    successful: string[]
    failed: Array<{ artworkId: string; error: string }>
    statistics: { total: number; successful: number; failed: number }
  }> {
    const results = {
      successful: [] as string[],
      failed: [] as Array<{ artworkId: string; error: string }>,
      statistics: { total: artworkIds.length, successful: 0, failed: 0 }
    }

    const batchSize = options.batchSize || 5
    const delay = options.delayBetweenBatches || 2000 // 2 seconds between batches

    console.log(`🚀 Starting bulk cultural metadata generation for ${artworkIds.length} artworks`)
    console.log(`📋 Batch size: ${batchSize}, Delay: ${delay}ms`)

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < artworkIds.length; i += batchSize) {
      const batch = artworkIds.slice(i, i + batchSize)
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(artworkIds.length / batchSize)}`)

      // Process batch concurrently
      const batchPromises = batch.map(async (artworkId) => {
        try {
          // Get artwork title for progress reporting
          const { fetchArtworkById } = await import('../airtable')
          const artwork = await fetchArtworkById(artworkId)
          const artworkTitle = artwork?.title || artworkId

          if (options.onProgress) {
            options.onProgress(i + results.successful.length + results.failed.length + 1, artworkIds.length, artworkTitle)
          }

          const culturalContext = await this.getCulturalMetadata(artworkId, options)
          if (culturalContext) {
            results.successful.push(artworkId)
            results.statistics.successful++
            console.log(`✅ Successfully processed artwork: ${artworkTitle}`)
          } else {
            const error = 'Failed to generate cultural metadata'
            results.failed.push({ artworkId, error })
            results.statistics.failed++
            if (options.onError) {
              options.onError(artworkId, error)
            }
            console.error(`❌ Failed to process artwork: ${artworkTitle} - ${error}`)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          results.failed.push({ artworkId, error: errorMessage })
          results.statistics.failed++
          if (options.onError) {
            options.onError(artworkId, errorMessage)
          }
          console.error(`❌ Error processing artwork ${artworkId}:`, error)
        }
      })

      await Promise.allSettled(batchPromises)

      // Delay between batches (except for the last batch)
      if (i + batchSize < artworkIds.length) {
        console.log(`⏳ Waiting ${delay}ms before next batch...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    console.log(`🎯 Bulk generation completed:`)
    console.log(`   ✅ Successful: ${results.statistics.successful}`)
    console.log(`   ❌ Failed: ${results.statistics.failed}`)
    console.log(`   📊 Success rate: ${((results.statistics.successful / results.statistics.total) * 100).toFixed(1)}%`)

    return results
  }

  /**
   * Validate and update existing cultural metadata
   */
  async validateAndUpdateMetadata(
    artworkId: string,
    validationNotes?: string,
    expertValidated: boolean = true
  ): Promise<boolean> {
    try {
      console.log(`🔍 Validating cultural metadata for artwork: ${artworkId}`)

      const existingContext = await fetchCulturalContextFromAirtable(artworkId)
      if (!existingContext) {
        console.warn(`⚠️ No existing cultural metadata found for artwork: ${artworkId}`)
        return false
      }

      // Update validation status
      const updatedContext: CulturalContext = {
        ...existingContext,
        expertValidated,
        validationNotes,
        updatedAt: new Date()
      }

      const success = await storeCulturalContextInAirtable(updatedContext)
      if (success) {
        console.log(`✅ Updated validation status for artwork: ${artworkId}`)
      }

      return success

    } catch (error) {
      console.error(`❌ Error validating metadata for artwork ${artworkId}:`, error)
      return false
    }
  }

  /**
   * Search artworks by cultural criteria
   */
  async searchArtworksByCulturalCriteria(criteria: {
    calligraphyStyle?: string
    historicalPeriod?: string
    philosophicalThemes?: string[]
    culturalSignificanceMin?: number
    hasEducationalContent?: boolean
    expertValidated?: boolean
    languages?: Language[]
  }): Promise<ArtworkWithCulturalMetadata[]> {
    try {
      console.log('🔎 Searching artworks by cultural criteria:', criteria)

      const allArtworks = await this.getEnhancedArtworks()
      
      const filteredArtworks = allArtworks.filter(artwork => {
        // Check if artwork has required analysis
        if (!artwork.aiAnalysisAvailable) return false

        const context = artwork.culturalContext
        if (!context) return false

        // Filter by calligraphy style
        if (criteria.calligraphyStyle && artwork.calligraphyStyle !== criteria.calligraphyStyle) {
          return false
        }

        // Filter by historical period
        if (criteria.historicalPeriod && artwork.historicalPeriod !== criteria.historicalPeriod) {
          return false
        }

        // Filter by philosophical themes
        if (criteria.philosophicalThemes && criteria.philosophicalThemes.length > 0) {
          const artworkThemes = artwork.philosophicalThemes || []
          const hasMatchingTheme = criteria.philosophicalThemes.some(theme =>
            artworkThemes.some(artworkTheme => 
              artworkTheme.toLowerCase().includes(theme.toLowerCase())
            )
          )
          if (!hasMatchingTheme) return false
        }

        // Filter by cultural significance
        if (criteria.culturalSignificanceMin && 
            (artwork.culturalSignificanceScore || 0) < criteria.culturalSignificanceMin) {
          return false
        }

        // Filter by educational content availability
        if (criteria.hasEducationalContent && (!artwork.educationalContent || artwork.educationalContent.length === 0)) {
          return false
        }

        // Filter by expert validation
        if (criteria.expertValidated !== undefined && context.expertValidated !== criteria.expertValidated) {
          return false
        }

        // Filter by language support
        if (criteria.languages && criteria.languages.length > 0) {
          const hasLanguageSupport = criteria.languages.some(lang =>
            context.generatedLanguages.includes(lang)
          )
          if (!hasLanguageSupport) return false
        }

        return true
      })

      console.log(`🎯 Found ${filteredArtworks.length} artworks matching cultural criteria`)
      return filteredArtworks

    } catch (error) {
      console.error('❌ Error searching artworks by cultural criteria:', error)
      return []
    }
  }

  // Private helper methods

  private extractCulturalTags(analysisResult: CulturalAnalysisResult): string[] {
    const tags: string[] = []
    
    // Extract from cultural analysis
    if (analysisResult.culturalAnalysis?.traditionalElements?.culturalSymbols) {
      tags.push(...analysisResult.culturalAnalysis.traditionalElements.culturalSymbols)
    }

    // Extract from philosophical analysis
    if (analysisResult.philosophicalAnalysis?.philosophicalThemes?.universalConcepts) {
      tags.push(...analysisResult.philosophicalAnalysis.philosophicalThemes.universalConcepts)
    }

    // Extract from historical analysis
    if (analysisResult.historicalAnalysis?.culturalMovements) {
      tags.push(...analysisResult.historicalAnalysis.culturalMovements)
    }

    return Array.from(new Set(tags)) // Remove duplicates
  }

  private extractPhilosophicalThemes(analysisResult: CulturalAnalysisResult): string[] {
    const themes: string[] = []

    if (analysisResult.philosophicalAnalysis?.philosophicalThemes?.primaryThemes) {
      themes.push(...analysisResult.philosophicalAnalysis.philosophicalThemes.primaryThemes)
    }

    if (analysisResult.philosophicalAnalysis?.philosophicalThemes?.secondaryThemes) {
      themes.push(...analysisResult.philosophicalAnalysis.philosophicalThemes.secondaryThemes)
    }

    if (analysisResult.philosophicalAnalysis?.philosophicalThemes?.culturalSpecificConcepts) {
      themes.push(...analysisResult.philosophicalAnalysis.philosophicalThemes.culturalSpecificConcepts)
    }

    return Array.from(new Set(themes))
  }

  private determineRecommendedLevel(analysisResult: CulturalAnalysisResult): EducationLevel {
    const complexity = analysisResult.analysisDepth || 5
    const culturalDepth = analysisResult.culturalAnalysis?.culturalSignificance?.overallSignificance || 5

    const averageComplexity = (complexity + culturalDepth) / 2

    if (averageComplexity >= 8.5) return 'expert'
    if (averageComplexity >= 7) return 'advanced'
    if (averageComplexity >= 5) return 'intermediate'
    return 'beginner'
  }

  private assessLearningComplexity(analysisResult: CulturalAnalysisResult): 'simple' | 'moderate' | 'complex' | 'expert' {
    const analysisDepth = analysisResult.analysisDepth || 5
    
    if (analysisDepth >= 9) return 'expert'
    if (analysisDepth >= 7) return 'complex'
    if (analysisDepth >= 5) return 'moderate'
    return 'simple'
  }
}