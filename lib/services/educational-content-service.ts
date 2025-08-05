/**
 * Educational Content Service
 * Service layer for managing educational content generation and retrieval
 * Integrates with Educational Content Generator and provides data persistence
 */

import {
  EducationalContent,
  EducationLevel,
  Language,
  CulturalAnalysisResult
} from '@/lib/types/cultural-context'
import { 
  EducationalContentGenerator,
  ContentGenerationRequest,
  ContentCustomizationOptions
} from '@/lib/agents/generators/educational-content-generator'
import { CulturalContextService } from './cultural-context-service'
import { validateEducationalContent } from '@/lib/utils/validation-utils'

export interface EducationalContentQuery {
  level?: EducationLevel
  language?: Language
  contentType?: string
  artworkId?: string
  includeExpired?: boolean
}

export interface GenerateContentRequest {
  artworkId: string
  levels: EducationLevel[]
  languages: Language[]
  contentTypes: string[]
  culturalContext?: CulturalAnalysisResult
  customizationOptions?: ContentCustomizationOptions
  forceRegenerate?: boolean
}

export class EducationalContentService {
  private contentGenerator: EducationalContentGenerator
  private culturalContextService: CulturalContextService
  private contentCache: Map<string, EducationalContent> = new Map()
  private generationQueue: Map<string, Promise<EducationalContent>> = new Map()

  constructor() {
    this.contentGenerator = new EducationalContentGenerator()
    this.culturalContextService = new CulturalContextService()
  }

  /**
   * Get educational content for an artwork
   */
  async getEducationalContent(
    artworkId: string,
    options?: EducationalContentQuery
  ): Promise<EducationalContent | null> {
    try {
      console.log(`Retrieving educational content for artwork: ${artworkId}`)

      // Check cache first
      const cacheKey = this.generateCacheKey(artworkId, options)
      const cachedContent = this.contentCache.get(cacheKey)
      if (cachedContent && this.isContentValid(cachedContent)) {
        console.log('Returning cached educational content')
        return cachedContent
      }

      // Query database for existing content
      const existingContent = await this.retrieveFromDatabase(artworkId, options)
      if (existingContent && this.isContentValid(existingContent)) {
        // Cache the retrieved content
        this.contentCache.set(cacheKey, existingContent)
        return existingContent
      }

      // No valid content found
      console.log('No valid educational content found')
      return null

    } catch (error) {
      console.error('Error retrieving educational content:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to retrieve educational content: ${errorMessage}`)
    }
  }

  /**
   * Generate educational content for an artwork
   */
  async generateEducationalContent(request: GenerateContentRequest): Promise<EducationalContent> {
    try {
      console.log(`Generating educational content for artwork: ${request.artworkId}`)

      // Check if generation is already in progress
      const queueKey = this.generateQueueKey(request)
      const existingGeneration = this.generationQueue.get(queueKey)
      if (existingGeneration) {
        console.log('Educational content generation already in progress, waiting...')
        return await existingGeneration
      }

      // Start new generation
      const generationPromise = this.performContentGeneration(request)
      this.generationQueue.set(queueKey, generationPromise)

      try {
        const result = await generationPromise
        return result
      } finally {
        // Clean up queue entry
        this.generationQueue.delete(queueKey)
      }

    } catch (error) {
      console.error('Error generating educational content:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to generate educational content: ${errorMessage}`)
    }
  }

  /**
   * Update existing educational content
   */
  async updateEducationalContent(
    id: string,
    updateData: Partial<EducationalContent>
  ): Promise<EducationalContent> {
    try {
      console.log(`Updating educational content: ${id}`)

      // Retrieve existing content
      const existingContent = await this.getEducationalContentById(id)
      if (!existingContent) {
        throw new Error(`Educational content not found: ${id}`)
      }

      // Merge updates
      const updatedContent: EducationalContent = {
        ...existingContent,
        ...updateData,
        updatedAt: new Date()
      }

      // Validate updated content
      const validationResult = validateEducationalContent(updatedContent)
      if (!validationResult.isValid) {
        throw new Error(`Invalid content data: ${validationResult.errors.join(', ')}`)
      }

      // Update cache
      const cacheKey = this.generateCacheKey(updatedContent.artworkId)
      this.contentCache.set(cacheKey, updatedContent)

      // Update in database
      await this.updateInDatabase(id, updatedContent)

      console.log(`Educational content updated successfully: ${id}`)
      return updatedContent

    } catch (error) {
      console.error('Error updating educational content:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to update educational content: ${errorMessage}`)
    }
  }

  /**
   * Delete educational content
   */
  async deleteEducationalContent(id: string): Promise<boolean> {
    try {
      console.log(`Deleting educational content: ${id}`)

      // Get content to find artwork ID for cache key
      const content = await this.getEducationalContentById(id)
      if (content) {
        const cacheKey = this.generateCacheKey(content.artworkId)
        this.contentCache.delete(cacheKey)
      }

      // Delete from database
      await this.deleteFromDatabase(id)

      console.log(`Educational content deleted successfully: ${id}`)
      return true

    } catch (error) {
      console.error('Error deleting educational content:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to delete educational content: ${errorMessage}`)
    }
  }

  /**
   * Search educational content with filters
   */
  async searchEducationalContent(query: EducationalContentQuery): Promise<EducationalContent[]> {
    try {
      console.log('Searching educational content with query:', query)

      // In a full implementation, this would query the database
      // For now, return cached results that match the query
      const results: EducationalContent[] = []
      
      for (const content of this.contentCache.values()) {
        if (this.matchesContentQuery(content, query)) {
          results.push(content)
        }
      }

      console.log(`Found ${results.length} matching educational content items`)
      return results

    } catch (error) {
      console.error('Error searching educational content:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to search educational content: ${errorMessage}`)
    }
  }

  /**
   * Get content generation status for long-running operations
   */
  getGenerationStatus(artworkId: string): { inProgress: boolean; queuePosition?: number } {
    const queueKeys = Array.from(this.generationQueue.keys())
    const matchingKey = queueKeys.find(key => key.includes(artworkId))
    
    if (matchingKey) {
      const queuePosition = queueKeys.indexOf(matchingKey) + 1
      return { inProgress: true, queuePosition }
    }
    
    return { inProgress: false }
  }

  // Private helper methods

  private async performContentGeneration(request: GenerateContentRequest): Promise<EducationalContent> {
    console.log('Starting educational content generation process')

    // Get or generate cultural context if not provided
    let culturalContext = request.culturalContext
    if (!culturalContext) {
      console.log('No cultural context provided, retrieving from service')
      const contextData = await this.culturalContextService.getCulturalContext(request.artworkId)
      if (contextData) {
        culturalContext = contextData.analysisResult
      } else {
        console.log('No existing cultural context found, generating basic analysis')
        culturalContext = await this.culturalContextService.performAnalysis({
          artworkId: request.artworkId,
          analysisType: 'educational',
          includedAnalysis: ['visual', 'cultural'],
          targetLanguages: request.languages,
          educationLevels: request.levels,
          expertValidation: false
        })
      }
    }

    // Prepare generation request
    const generationRequest: ContentGenerationRequest = {
      artworkId: request.artworkId,
      levels: request.levels,
      languages: request.languages,
      contentTypes: request.contentTypes,
      culturalContext,
      customizationOptions: request.customizationOptions
    }

    // Generate content using the generator
    const educationalContent = await this.contentGenerator.generateEducationalContent(generationRequest)

    // Cache the generated content
    const cacheKey = this.generateCacheKey(request.artworkId)
    this.contentCache.set(cacheKey, educationalContent)

    // Save to database
    await this.saveToDatabase(educationalContent)

    console.log(`Educational content generation completed: ${educationalContent.id}`)
    return educationalContent
  }

  private async getEducationalContentById(id: string): Promise<EducationalContent | null> {
    // In a full implementation, this would query the database by ID
    // For now, search in cache
    for (const content of this.contentCache.values()) {
      if (content.id === id) {
        return content
      }
    }
    return null
  }

  private generateCacheKey(artworkId: string, options?: EducationalContentQuery): string {
    const optionsKey = options ? JSON.stringify(options) : 'default'
    return `${artworkId}-${optionsKey}`
  }

  private generateQueueKey(request: GenerateContentRequest): string {
    return `${request.artworkId}-${request.levels.join(',')}-${request.languages.join(',')}`
  }

  private isContentValid(content: EducationalContent): boolean {
    // Check if content is not expired and has required quality
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
    const isRecent = (Date.now() - content.createdAt.getTime()) < maxAge
    const hasGoodQuality = content.educationalEffectiveness >= 7.0
    
    return isRecent && hasGoodQuality
  }

  private async retrieveFromDatabase(
    artworkId: string,
    options?: EducationalContentQuery
  ): Promise<EducationalContent | null> {
    // Mock implementation - in real scenario, this would query Supabase/database
    console.log(`Querying database for educational content: ${artworkId}`)
    return null
  }

  private async saveToDatabase(content: EducationalContent): Promise<void> {
    // Mock implementation - in real scenario, this would save to Supabase/database
    console.log(`Saving educational content to database: ${content.id}`)
  }

  private async updateInDatabase(id: string, content: EducationalContent): Promise<void> {
    // Mock implementation - in real scenario, this would update in Supabase/database
    console.log(`Updating educational content in database: ${id}`)
  }

  private async deleteFromDatabase(id: string): Promise<void> {
    // Mock implementation - in real scenario, this would delete from Supabase/database
    console.log(`Deleting educational content from database: ${id}`)
  }

  private matchesContentQuery(content: EducationalContent, query: EducationalContentQuery): boolean {
    if (query.artworkId && content.artworkId !== query.artworkId) {
      return false
    }
    
    if (query.language && !content.languages.includes(query.language)) {
      return false
    }
    
    if (query.level) {
      const hasLevel = content.contentLevels.some(level => level.level === query.level)
      if (!hasLevel) {
        return false
      }
    }
    
    return true
  }

  /**
   * Batch generate educational content for multiple artworks
   */
  async batchGenerateEducationalContent(
    requests: GenerateContentRequest[]
  ): Promise<EducationalContent[]> {
    try {
      console.log(`Batch generating educational content for ${requests.length} artworks`)

      const results = await Promise.allSettled(
        requests.map(request => this.generateEducationalContent(request))
      )

      const successfulResults: EducationalContent[] = []
      const failures: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults.push(result.value)
        } else {
          failures.push(`${requests[index].artworkId}: ${result.reason.message}`)
        }
      })

      if (failures.length > 0) {
        console.warn(`Some educational content generation failed:`, failures)
      }

      console.log(`Batch generation completed: ${successfulResults.length} successful, ${failures.length} failed`)
      return successfulResults

    } catch (error) {
      console.error('Error in batch educational content generation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Batch generation failed: ${errorMessage}`)
    }
  }

  /**
   * Get educational content statistics
   */
  getContentStatistics(): {
    totalCached: number
    activeGenerations: number
    averageQuality: number
    languageDistribution: Record<Language, number>
    levelDistribution: Record<EducationLevel, number>
  } {
    const cachedContents = Array.from(this.contentCache.values())
    
    // Calculate average quality
    const totalQuality = cachedContents.reduce((sum, content) => sum + content.educationalEffectiveness, 0)
    const averageQuality = cachedContents.length > 0 ? totalQuality / cachedContents.length : 0

    // Calculate language distribution
    const languageDistribution: Record<Language, number> = {
      korean: 0,
      english: 0,
      japanese: 0,
      chinese: 0
    }

    // Calculate level distribution
    const levelDistribution: Record<EducationLevel, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      expert: 0
    }

    cachedContents.forEach(content => {
      // Count languages
      content.languages.forEach(lang => {
        if (lang in languageDistribution) {
          languageDistribution[lang]++
        }
      })

      // Count levels
      content.contentLevels.forEach(level => {
        if (level.level in levelDistribution) {
          levelDistribution[level.level]++
        }
      })
    })

    return {
      totalCached: cachedContents.length,
      activeGenerations: this.generationQueue.size,
      averageQuality,
      languageDistribution,
      levelDistribution
    }
  }

  /**
   * Clear caches (for memory management)
   */
  clearCaches(): void {
    this.contentCache.clear()
    this.generationQueue.clear()
    console.log('Educational content service caches cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { 
    contentEntries: number
    queueEntries: number
    memoryUsageEstimate: number
  } {
    // Rough estimate of memory usage
    const memoryUsageEstimate = this.contentCache.size * 50000 // ~50KB per content item

    return {
      contentEntries: this.contentCache.size,
      queueEntries: this.generationQueue.size,
      memoryUsageEstimate
    }
  }
}