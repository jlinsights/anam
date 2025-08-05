#!/usr/bin/env tsx

/**
 * Test Script for Cultural Metadata Integration
 * Tests the integration between AI-powered cultural analysis and Airtable storage
 */

import { CulturalMetadataService } from '../lib/services/cultural-metadata-service'
import { fetchArtworksFromAirtable } from '../lib/airtable'

async function testCulturalIntegration() {
  console.log('🧪 Testing Cultural Metadata Integration')
  console.log('=' .repeat(50))

  const culturalService = new CulturalMetadataService()

  try {
    // Step 1: Get available artworks
    console.log('\n📚 Step 1: Fetching available artworks from Airtable...')
    const artworks = await fetchArtworksFromAirtable()
    
    if (!artworks || artworks.length === 0) {
      console.error('❌ No artworks found in Airtable')
      return
    }

    console.log(`✅ Found ${artworks.length} artworks`)
    console.log(`   Sample artwork: "${artworks[0].title}" (${artworks[0].year})`)

    // Step 2: Test collection statistics
    console.log('\n📊 Step 2: Getting collection statistics...')
    const stats = await culturalService.getCollectionStatistics()
    console.log(`✅ Collection Statistics:`)
    console.log(`   Total artworks: ${stats.totalArtworks}`)
    console.log(`   With AI analysis: ${stats.artworksWithAnalysis}`)
    console.log(`   Coverage: ${stats.coveragePercentage.toFixed(1)}%`)
    console.log(`   Average quality score: ${stats.averageQualityScore.toFixed(2)}`)
    console.log(`   Expert validated: ${stats.expertValidatedCount}`)

    // Step 3: Test cultural metadata generation for first artwork
    console.log('\n🎨 Step 3: Testing cultural metadata generation...')
    const testArtworkId = artworks[0].id
    const testArtworkTitle = artworks[0].title

    console.log(`   Processing artwork: "${testArtworkTitle}" (ID: ${testArtworkId})`)
    
    const culturalContext = await culturalService.getCulturalMetadata(testArtworkId, {
      targetLanguages: ['korean', 'english'],
      educationLevels: ['intermediate'],
      analysisType: 'comprehensive',
      forceRegenerate: false // Use cached if available
    })

    if (culturalContext) {
      console.log(`✅ Cultural metadata generated successfully:`)
      console.log(`   Analysis version: ${culturalContext.analysisVersion}`)
      console.log(`   Languages: ${culturalContext.generatedLanguages.join(', ')}`)
      console.log(`   Cultural accuracy: ${culturalContext.qualityMetrics.culturalAccuracy.toFixed(2)}`)
      console.log(`   Analysis depth: ${culturalContext.qualityMetrics.analysisDepth.toFixed(2)}`)
      console.log(`   Expert validated: ${culturalContext.expertValidated}`)
      
      // Show cultural tags and themes
      if (culturalContext.culturalMetadata.culturalTags) {
        console.log(`   Cultural tags: ${culturalContext.culturalMetadata.culturalTags.slice(0, 3).join(', ')}${culturalContext.culturalMetadata.culturalTags.length > 3 ? '...' : ''}`)
      }
      
      if (culturalContext.culturalMetadata.philosophicalThemes) {
        console.log(`   Philosophical themes: ${culturalContext.culturalMetadata.philosophicalThemes.slice(0, 3).join(', ')}${culturalContext.culturalMetadata.philosophicalThemes.length > 3 ? '...' : ''}`)
      }
    } else {
      console.error(`❌ Failed to generate cultural metadata for "${testArtworkTitle}"`)
    }

    // Step 4: Test educational content generation
    console.log('\n📚 Step 4: Testing educational content generation...')
    const educationalContent = await culturalService.generateEducationalContent(testArtworkId, {
      levels: ['intermediate', 'advanced'],
      languages: ['korean', 'english'],
      culturalContext
    })

    if (educationalContent.length > 0) {
      console.log(`✅ Educational content generated:`)
      console.log(`   Generated ${educationalContent.length} content items`)
      console.log(`   Languages: ${educationalContent[0].languages.join(', ')}`)
      console.log(`   Education levels: ${educationalContent[0].contentLevels.join(', ')}`)
      console.log(`   Cultural accuracy: ${educationalContent[0].culturalAccuracy.toFixed(2)}`)
      console.log(`   Educational effectiveness: ${educationalContent[0].educationalEffectiveness.toFixed(2)}`)
      console.log(`   Learning objectives: ${educationalContent[0].learningObjectives.length}`)
    } else {
      console.error(`❌ Failed to generate educational content for "${testArtworkTitle}"`)
    }

    // Step 5: Test enhanced artworks retrieval
    console.log('\n🎯 Step 5: Testing enhanced artworks retrieval...')
    const enhancedArtworks = await culturalService.getEnhancedArtworks(5) // Limit to first 5
    
    console.log(`✅ Enhanced artworks retrieved:`)
    console.log(`   Total enhanced: ${enhancedArtworks.length}`)
    console.log(`   With AI analysis: ${enhancedArtworks.filter(a => a.aiAnalysisAvailable).length}`)
    console.log(`   With educational content: ${enhancedArtworks.filter(a => a.educationalContent && a.educationalContent.length > 0).length}`)

    enhancedArtworks.slice(0, 3).forEach((artwork, index) => {
      console.log(`   ${index + 1}. "${artwork.title}" - Analysis: ${artwork.aiAnalysisAvailable ? '✅' : '❌'}, Education: ${artwork.educationalContent && artwork.educationalContent.length > 0 ? '✅' : '❌'}`)
    })

    // Step 6: Test cultural criteria search
    console.log('\n🔍 Step 6: Testing cultural criteria search...')
    const searchResults = await culturalService.searchArtworksByCulturalCriteria({
      culturalSignificanceMin: 7.0,
      hasEducationalContent: false, // Look for artworks that could benefit from educational content
      languages: ['korean']
    })

    console.log(`✅ Cultural search completed:`)
    console.log(`   Found ${searchResults.length} artworks matching criteria`)
    if (searchResults.length > 0) {
      console.log(`   Sample results:`)
      searchResults.slice(0, 2).forEach((artwork, index) => {
        console.log(`     ${index + 1}. "${artwork.title}" - Significance: ${artwork.culturalSignificanceScore?.toFixed(1) || 'N/A'}`)
      })
    }

    // Final summary
    console.log('\n🎉 Integration Test Summary')
    console.log('=' .repeat(30))
    console.log(`✅ Artwork retrieval: ${artworks.length} artworks`)
    console.log(`✅ Collection statistics: ${stats.coveragePercentage.toFixed(1)}% coverage`)
    console.log(`✅ Cultural metadata: ${culturalContext ? 'Generated' : 'Failed'}`)
    console.log(`✅ Educational content: ${educationalContent.length > 0 ? `${educationalContent.length} items` : 'Failed'}`)
    console.log(`✅ Enhanced artworks: ${enhancedArtworks.length} enhanced`)
    console.log(`✅ Cultural search: ${searchResults.length} results`)

    const overallSuccess = culturalContext && educationalContent.length > 0 && enhancedArtworks.length > 0
    console.log(`\n🎯 Overall Integration Status: ${overallSuccess ? '✅ SUCCESS' : '❌ PARTIAL'}`)

    if (overallSuccess) {
      console.log('\n🚀 Cultural metadata integration is working correctly!')
      console.log('   Ready for production use with Airtable integration.')
    } else {
      console.log('\n⚠️  Some integration tests failed. Check the logs above for details.')
    }

  } catch (error) {
    console.error('\n❌ Integration test failed with error:', error)
    process.exit(1)
  }
}

// Run the test if called directly
if (require.main === module) {
  testCulturalIntegration()
    .then(() => {
      console.log('\n✅ Test completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error)
      process.exit(1)
    })
}

export { testCulturalIntegration }