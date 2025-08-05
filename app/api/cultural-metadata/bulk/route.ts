import { NextRequest, NextResponse } from 'next/server'
import { CulturalMetadataService } from '@/lib/services/cultural-metadata-service'
import { handleApiError } from '@/lib/utils/api-utils'
import type { Language, EducationLevel } from '@/lib/types/cultural-context'

const culturalService = new CulturalMetadataService()

/**
 * POST /api/cultural-metadata/bulk
 * Bulk generate cultural metadata for multiple artworks
 * 
 * Body:
 * - artworkIds: array of artwork IDs to process
 * - options: generation options
 *   - forceRegenerate: force regeneration even if data exists
 *   - targetLanguages: languages to generate content for
 *   - educationLevels: education levels to support
 *   - analysisType: type of analysis to perform
 *   - batchSize: number of artworks to process concurrently
 *   - delayBetweenBatches: delay in milliseconds between batches
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const {
      artworkIds,
      options = {}
    } = body

    if (!artworkIds || !Array.isArray(artworkIds) || artworkIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Array of artwork IDs is required'
      }, { status: 400 })
    }

    if (artworkIds.length > 50) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 50 artworks can be processed in a single bulk operation'
      }, { status: 400 })
    }

    console.log(`🚀 Starting bulk cultural metadata generation for ${artworkIds.length} artworks`)

    const startTime = Date.now()
    
    // Set up progress tracking
    const progressLog: Array<{ timestamp: number; current: number; total: number; artworkTitle: string }> = []
    const errorLog: Array<{ artworkId: string; error: string; timestamp: number }> = []

    const results = await culturalService.bulkGenerateCulturalMetadata(artworkIds, {
      ...options,
      onProgress: (current: number, total: number, artworkTitle: string) => {
        progressLog.push({
          timestamp: Date.now(),
          current,
          total,
          artworkTitle
        })
        console.log(`📊 Progress: ${current}/${total} - Processing: ${artworkTitle}`)
      },
      onError: (artworkId: string, error: string) => {
        errorLog.push({
          artworkId,
          error,
          timestamp: Date.now()
        })
        console.error(`❌ Bulk operation error for ${artworkId}: ${error}`)
      }
    })

    const totalTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        totalProcessingTime: totalTime,
        averageTimePerArtwork: totalTime / artworkIds.length,
        progressLog: progressLog.slice(-10), // Last 10 progress entries
        errorLog,
        completedAt: new Date().toISOString(),
        options: {
          batchSize: options.batchSize || 5,
          targetLanguages: options.targetLanguages || ['korean', 'english'],
          analysisType: options.analysisType || 'comprehensive'
        }
      }
    })

  } catch (error) {
    console.error('Bulk cultural metadata generation error:', error)
    return handleApiError(error)
  }
}

/**
 * GET /api/cultural-metadata/bulk
 * Get bulk operation status or search artworks by cultural criteria
 * 
 * Query Parameters:
 * - search: if true, perform cultural criteria search
 * - calligraphyStyle: filter by calligraphy style
 * - historicalPeriod: filter by historical period
 * - philosophicalThemes: comma-separated list of themes
 * - culturalSignificanceMin: minimum cultural significance score
 * - hasEducationalContent: filter by educational content availability
 * - expertValidated: filter by expert validation status
 * - languages: comma-separated list of supported languages
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const isSearch = searchParams.get('search') === 'true'

    if (!isSearch) {
      // Return bulk operation capabilities and limits
      return NextResponse.json({
        success: true,
        data: {
          capabilities: {
            maxBulkSize: 50,
            supportedAnalysisTypes: ['comprehensive', 'quick', 'educational', 'research'],
            supportedLanguages: ['korean', 'english', 'japanese', 'chinese'],
            supportedEducationLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
            defaultBatchSize: 5,
            recommendedDelayBetweenBatches: 2000
          },
          limits: {
            maxConcurrentOperations: 3,
            rateLimitPerHour: 100,
            maxProcessingTimePerArtwork: '2 minutes'
          }
        }
      })
    }

    // Perform cultural criteria search
    const criteria: any = {}

    if (searchParams.get('calligraphyStyle')) {
      criteria.calligraphyStyle = searchParams.get('calligraphyStyle')
    }

    if (searchParams.get('historicalPeriod')) {
      criteria.historicalPeriod = searchParams.get('historicalPeriod')
    }

    if (searchParams.get('philosophicalThemes')) {
      criteria.philosophicalThemes = searchParams.get('philosophicalThemes')!.split(',').map(s => s.trim())
    }

    if (searchParams.get('culturalSignificanceMin')) {
      criteria.culturalSignificanceMin = parseFloat(searchParams.get('culturalSignificanceMin')!)
    }

    if (searchParams.get('hasEducationalContent')) {
      criteria.hasEducationalContent = searchParams.get('hasEducationalContent') === 'true'
    }

    if (searchParams.get('expertValidated')) {
      criteria.expertValidated = searchParams.get('expertValidated') === 'true'
    }

    if (searchParams.get('languages')) {
      criteria.languages = searchParams.get('languages')!.split(',').map(s => s.trim()) as Language[]
    }

    console.log('🔎 Performing cultural criteria search:', criteria)

    const results = await culturalService.searchArtworksByCulturalCriteria(criteria)

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        searchCriteria: criteria,
        totalResults: results.length,
        searchPerformed: new Date().toISOString(),
        resultsSummary: {
          withAnalysis: results.filter(a => a.aiAnalysisAvailable).length,
          withEducationalContent: results.filter(a => a.educationalContent && a.educationalContent.length > 0).length,
          expertValidated: results.filter(a => a.culturalContext?.expertValidated).length
        }
      }
    })

  } catch (error) {
    console.error('Bulk cultural metadata search error:', error)
    return handleApiError(error)
  }
}