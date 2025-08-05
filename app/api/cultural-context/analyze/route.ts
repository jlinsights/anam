import { NextRequest, NextResponse } from 'next/server'
import { AnalysisResponse } from '@/lib/types/cultural-context'
import { CulturalAnalysisEngine } from '@/lib/agents/cultural-analysis-engine'
import { handleApiError, validateRequestBody } from '@/lib/utils/api-utils'

const analysisEngine = new CulturalAnalysisEngine()

/**
 * POST /api/cultural-context/analyze
 * Perform comprehensive cultural analysis on an artwork
 * 
 * Body:
 * - artworkId: artwork to analyze
 * - analysisType: 'comprehensive' | 'quick' | 'educational' | 'research'
 * - includedAnalysis: array of analysis types to include
 * - targetLanguages: languages for multilingual content
 * - educationLevels: education levels for content generation
 */
export async function POST(request: NextRequest): Promise<NextResponse<AnalysisResponse>> {
  try {
    const body = await request.json()
    const {
      artworkId,
      analysisType = 'comprehensive',
      includedAnalysis = ['visual', 'textual', 'cultural', 'historical', 'philosophical'],
      targetLanguages = ['korean', 'english'],
      educationLevels = ['intermediate'],
      expertValidation = false
    } = body

    // Validate required fields
    if (!artworkId) {
      return NextResponse.json({
        success: false,
        error: 'Artwork ID is required'
      }, { status: 400 })
    }

    // Start analysis
    const startTime = Date.now()
    
    console.log(`Starting cultural analysis for artwork: ${artworkId}`)
    console.log(`Analysis type: ${analysisType}`)
    console.log(`Included analysis: ${includedAnalysis.join(', ')}`)
    
    // Perform comprehensive cultural analysis
    const analysisResult = await analysisEngine.performCulturalAnalysis({
      artworkId,
      analysisType,
      includedAnalysis,
      targetLanguages,
      educationLevels,
      expertValidation
    })

    const processingTime = Date.now() - startTime
    
    console.log(`Cultural analysis completed in ${processingTime}ms`)
    console.log(`Confidence score: ${analysisResult.confidenceScore}`)

    const response: AnalysisResponse = {
      success: true,
      data: analysisResult,
      metadata: {
        processingTime,
        confidenceScore: analysisResult.confidenceScore,
        validationRequired: analysisResult.expertValidationRequired
      }
    }
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Cultural analysis error:', error)
    const errorResponse = handleApiError(error)
    return errorResponse as NextResponse<AnalysisResponse>
  }
}

/**
 * GET /api/cultural-context/analyze/status
 * Check analysis status for long-running operations
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('analysisId')

    if (!analysisId) {
      return NextResponse.json({
        success: false,
        error: 'Analysis ID is required'
      }, { status: 400 })
    }

    const status = await analysisEngine.getAnalysisStatus(analysisId)

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error) {
    console.error('Analysis status error:', error)
    return handleApiError(error)
  }
}