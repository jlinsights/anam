import { NextRequest, NextResponse } from 'next/server'
import { 
  EducationalContent, 
  EducationalContentResponse,
  EducationLevel,
  Language
} from '@/lib/types/cultural-context'
import { EducationalContentService } from '@/lib/services/educational-content-service'
import { handleApiError } from '@/lib/utils/api-utils'

const educationalService = new EducationalContentService()

/**
 * GET /api/educational-content
 * Retrieve educational content for artworks
 * 
 * Query Parameters:
 * - artworkId: specific artwork ID
 * - level: education level (beginner, intermediate, advanced, expert)
 * - language: preferred language
 * - type: content type filter
 */
export async function GET(request: NextRequest): Promise<NextResponse<EducationalContentResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get('artworkId')
    const level = searchParams.get('level') as EducationLevel | null
    const language = searchParams.get('language') as Language | null
    const contentType = searchParams.get('type')

    if (!artworkId) {
      return NextResponse.json({
        success: false,
        error: 'Artwork ID is required'
      }, { status: 400 })
    }

    const educationalContent = await educationalService.getEducationalContent(artworkId, {
      level,
      language: language || 'korean',
      contentType
    })

    if (!educationalContent) {
      return NextResponse.json({
        success: false,
        error: 'Educational content not found for this artwork'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: educationalContent,
      metadata: {
        generatedLanguages: educationalContent.languages,
        qualityScore: educationalContent.educationalEffectiveness
      }
    })

  } catch (error) {
    console.error('Educational content GET error:', error)
    return handleApiError(error)
  }
}

/**
 * POST /api/educational-content
 * Generate educational content for an artwork
 * 
 * Body:
 * - artworkId: artwork ID
 * - levels: education levels to generate
 * - languages: target languages
 * - contentTypes: types of content to generate
 * - culturalContext: existing cultural context data
 */
export async function POST(request: NextRequest): Promise<NextResponse<EducationalContentResponse>> {
  try {
    const body = await request.json()
    const {
      artworkId,
      levels = ['intermediate'],
      languages = ['korean', 'english'],
      contentTypes = ['explanation', 'cultural_context', 'learning_objectives'],
      culturalContext,
      forceRegenerate = false
    } = body

    if (!artworkId) {
      return NextResponse.json({
        success: false,
        error: 'Artwork ID is required'
      }, { status: 400 })
    }

    // Check if content already exists
    if (!forceRegenerate) {
      const existingContent = await educationalService.getEducationalContent(artworkId)
      if (existingContent) {
        return NextResponse.json({
          success: true,
          data: existingContent,
          metadata: {
            cached: true,
            generationTime: 0
          }
        })
      }
    }

    // Generate new educational content
    const startTime = Date.now()
    const educationalContent = await educationalService.generateEducationalContent({
      artworkId,
      levels,
      languages,
      contentTypes,
      culturalContext
    })

    const generationTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: educationalContent,
      metadata: {
        generationTime,
        languagesGenerated: languages,
        qualityScore: educationalContent.educationalEffectiveness
      }
    })

  } catch (error) {
    console.error('Educational content POST error:', error)
    return handleApiError(error)
  }
}

/**
 * PUT /api/educational-content
 * Update existing educational content
 */
export async function PUT(request: NextRequest): Promise<NextResponse<EducationalContentResponse>> {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Educational content ID is required'
      }, { status: 400 })
    }

    const updatedContent = await educationalService.updateEducationalContent(id, updateData)

    return NextResponse.json({
      success: true,
      data: updatedContent,
      metadata: {
        updated: true
      }
    })

  } catch (error) {
    console.error('Educational content PUT error:', error)
    return handleApiError(error)
  }
}