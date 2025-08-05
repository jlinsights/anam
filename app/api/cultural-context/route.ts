import { NextRequest, NextResponse } from 'next/server'
import { 
  CulturalContext, 
  CulturalContextResponse,
  CulturalAnalysisResult,
  AnalysisResponse
} from '@/lib/types/cultural-context'
import { CulturalContextService } from '@/lib/services/cultural-context-service'
import { validateRequestBody, handleApiError } from '@/lib/utils/api-utils'

const culturalContextService = new CulturalContextService()

/**
 * GET /api/cultural-context
 * Retrieve cultural context data for artworks
 * 
 * Query Parameters:
 * - artworkId: specific artwork ID
 * - level: education level filter
 * - language: language preference
 * - validated: only return validated content
 */
export async function GET(request: NextRequest): Promise<NextResponse<CulturalContextResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get('artworkId')
    const level = searchParams.get('level') as 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
    const language = searchParams.get('language') as 'korean' | 'english' | 'japanese' | 'chinese' | null
    const validated = searchParams.get('validated') === 'true'

    // If specific artwork requested
    if (artworkId) {
      const culturalContext = await culturalContextService.getCulturalContext(artworkId, {
        language: language || 'korean'
      })

      if (!culturalContext) {
        return NextResponse.json({
          success: false,
          error: 'Cultural context not found for this artwork'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: culturalContext,
        metadata: {
          processingTime: Date.now()
        }
      })
    }

    // Get all cultural contexts with filters
    const culturalContexts = await culturalContextService.searchCulturalContexts({
      language: language || 'korean'
    })

    return NextResponse.json({
      success: true,
      data: culturalContexts,
      metadata: {
        totalCount: culturalContexts.length,
        processingTime: Date.now()
      }
    })

  } catch (error) {
    console.error('Cultural context GET error:', error)
    return handleApiError(error)
  }
}

/**
 * POST /api/cultural-context
 * Create or update cultural context for an artwork
 * 
 * Body:
 * - artworkId: artwork ID to analyze
 * - analysisType: 'comprehensive' | 'quick' | 'educational' | 'research'
 * - forceRegenerate: boolean to force regeneration
 * - expertValidation: require expert validation
 */
export async function POST(request: NextRequest): Promise<NextResponse<CulturalContextResponse | AnalysisResponse>> {
  try {
    const body = await request.json()
    const { artworkId, analysisType = 'comprehensive', forceRegenerate = false, expertValidation = false } = body

    // Validate required fields
    if (!artworkId) {
      return NextResponse.json({
        success: false,
        error: 'Artwork ID is required'
      }, { status: 400 })
    }

    // Validate artwork exists
    const artworkExists = await culturalContextService.validateArtworkExists(artworkId)
    if (!artworkExists) {
      return NextResponse.json({
        success: false,
        error: 'Artwork not found'
      }, { status: 404 })
    }

    // Check if cultural context already exists and not forcing regeneration
    if (!forceRegenerate) {
      const existingContext = await culturalContextService.getCulturalContext(artworkId)
      if (existingContext) {
        return NextResponse.json({
          success: true,
          data: existingContext,
          metadata: {
            processingTime: 0,
            cached: true
          }
        })
      }
    }

    // Generate new cultural analysis
    const startTime = Date.now()
    const analysisResult = await culturalContextService.generateCulturalAnalysis(artworkId, {
      analysisType,
      expertValidation,
      generateEducationalContent: true,
      multilingualSupport: true
    })

    const processingTime = Date.now() - startTime

    // Return analysis result
    return NextResponse.json({
      success: true,
      data: analysisResult,
      metadata: {
        processingTime,
        confidenceScore: analysisResult.confidenceScore,
        validationRequired: analysisResult.expertValidationRequired
      }
    })

  } catch (error) {
    console.error('Cultural context POST error:', error)
    return handleApiError(error)
  }
}

/**
 * PUT /api/cultural-context
 * Update existing cultural context
 */
export async function PUT(request: NextRequest): Promise<NextResponse<CulturalContextResponse>> {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Cultural context ID is required'
      }, { status: 400 })
    }

    const updatedContext = await culturalContextService.updateCulturalContext(id, updateData)

    return NextResponse.json({
      success: true,
      data: updatedContext,
      metadata: {
        updated: true,
        processingTime: Date.now()
      }
    })

  } catch (error) {
    console.error('Cultural context PUT error:', error)
    return handleApiError(error)
  }
}

/**
 * DELETE /api/cultural-context
 * Delete cultural context
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<CulturalContextResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Cultural context ID is required'
      }, { status: 400 })
    }

    await culturalContextService.deleteCulturalContext(id)

    return NextResponse.json({
      success: true,
      data: undefined,
      metadata: {
        processingTime: Date.now()
      }
    })

  } catch (error) {
    console.error('Cultural context DELETE error:', error)
    return handleApiError(error)
  }
}