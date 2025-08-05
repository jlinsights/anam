import { NextRequest, NextResponse } from 'next/server'
import { CulturalMetadataService } from '@/lib/services/cultural-metadata-service'
import { handleApiError } from '@/lib/utils/api-utils'
import type { 
  CulturalContext,
  Language,
  EducationLevel
} from '@/lib/types/cultural-context'

const culturalService = new CulturalMetadataService()

/**
 * GET /api/cultural-metadata
 * Retrieve cultural metadata for artworks
 * 
 * Query Parameters:
 * - artworkId: specific artwork ID
 * - limit: number of artworks to retrieve (for bulk operations)
 * - enhanced: return enhanced artworks with cultural metadata
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get('artworkId')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const enhanced = searchParams.get('enhanced') === 'true'

    // Single artwork cultural metadata
    if (artworkId) {
      const culturalContext = await culturalService.getCulturalMetadata(artworkId)
      
      if (!culturalContext) {
        return NextResponse.json({
          success: false,
          error: 'Cultural metadata not found for this artwork'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: culturalContext,
        metadata: {
          artworkId,
          analysisVersion: culturalContext.analysisVersion,
          expertValidated: culturalContext.expertValidated,
          languages: culturalContext.generatedLanguages,
          qualityScore: culturalContext.qualityMetrics.culturalAccuracy
        }
      })
    }

    // Enhanced artworks with cultural metadata
    if (enhanced) {
      const artworks = await culturalService.getEnhancedArtworks(limit)
      
      return NextResponse.json({
        success: true,
        data: artworks,
        metadata: {
          total: artworks.length,
          withAnalysis: artworks.filter(a => a.aiAnalysisAvailable).length,
          coveragePercentage: artworks.length > 0 ? 
            (artworks.filter(a => a.aiAnalysisAvailable).length / artworks.length) * 100 : 0
        }
      })
    }

    // Collection statistics
    const statistics = await culturalService.getCollectionStatistics()
    
    return NextResponse.json({
      success: true,
      data: statistics,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }
    })

  } catch (error) {
    console.error('Cultural metadata GET error:', error)
    return handleApiError(error)
  }
}

/**
 * POST /api/cultural-metadata
 * Generate cultural metadata for an artwork
 * 
 * Body:
 * - artworkId: artwork ID to analyze
 * - forceRegenerate: force regeneration even if data exists
 * - targetLanguages: languages to generate content for
 * - educationLevels: education levels to support
 * - analysisType: type of analysis to perform
 * - includeExpertValidation: whether to include expert validation
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const {
      artworkId,
      forceRegenerate = false,
      targetLanguages = ['korean', 'english'],
      educationLevels = ['intermediate'],
      analysisType = 'comprehensive',
      includeExpertValidation = false
    } = body

    if (!artworkId) {
      return NextResponse.json({
        success: false,
        error: 'Artwork ID is required'
      }, { status: 400 })
    }

    console.log(`🎨 Generating cultural metadata for artwork: ${artworkId}`)
    
    const startTime = Date.now()
    const culturalContext = await culturalService.getCulturalMetadata(artworkId, {
      forceRegenerate,
      targetLanguages,
      educationLevels,
      analysisType,
      includeExpertValidation
    })

    if (!culturalContext) {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate cultural metadata'
      }, { status: 500 })
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: culturalContext,
      metadata: {
        processingTime,
        analysisType,
        languages: culturalContext.generatedLanguages,
        qualityScore: culturalContext.qualityMetrics.culturalAccuracy,
        cached: !forceRegenerate && processingTime < 1000 // Likely cached if very fast
      }
    })

  } catch (error) {
    console.error('Cultural metadata POST error:', error)
    return handleApiError(error)
  }
}

/**
 * PUT /api/cultural-metadata
 * Update cultural metadata (expert validation, notes, etc.)
 * 
 * Body:
 * - artworkId: artwork ID to update
 * - validationNotes: expert validation notes
 * - expertValidated: validation status
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const {
      artworkId,
      validationNotes,
      expertValidated = true
    } = body

    if (!artworkId) {
      return NextResponse.json({
        success: false,
        error: 'Artwork ID is required'
      }, { status: 400 })
    }

    const success = await culturalService.validateAndUpdateMetadata(
      artworkId,
      validationNotes,
      expertValidated
    )

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update cultural metadata'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        artworkId,
        expertValidated,
        validationNotes,
        updatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Cultural metadata PUT error:', error)
    return handleApiError(error)
  }
}