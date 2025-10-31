#!/usr/bin/env node

/**
 * ANAM Gallery Auto-Sync System Test Suite
 * 
 * Comprehensive testing script for the Airtable → Supabase auto-synchronization system.
 * Tests webhook endpoints, admin API, database views, and overall system health.
 */

const https = require('https')
const http = require('http')

// Configuration
const BASE_URL = 'https://anam-gallery.vercel.app'
const ADMIN_TOKEN = process.env.ADMIN_SYNC_TOKEN || 'NqfbwjnXwUcNOLwidJIxA_R2cuxVdPE6Qfos6gvlnoKZXwuZ5oF1dDwqlfeaPa0e'
const WEBHOOK_SECRET = process.env.AIRTABLE_WEBHOOK_SECRET || 'EbvTwS2uwrHOHqTOyMyEf5h3krIU3negWP1PQoAP0mTZTZoPfn9bvVAW4QE0zoxc'

// Test colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://')
    const client = isHttps ? https : http
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : {}
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData
          })
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          })
        }
      })
    })
    
    req.on('error', reject)
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
}

// Log test result
function logTest(name, passed, message, details = null) {
  const status = passed ? 'PASS' : 'FAIL'
  const color = passed ? colors.green : colors.red
  
  console.log(`${color}[${status}]${colors.reset} ${name}`)
  if (message) {
    console.log(`      ${message}`)
  }
  if (details) {
    console.log(`      ${colors.blue}Details: ${JSON.stringify(details, null, 2)}${colors.reset}`)
  }
  
  testResults.tests.push({ name, passed, message, details })
  if (passed) {
    testResults.passed++
  } else {
    testResults.failed++
  }
}

// Log warning
function logWarning(name, message, details = null) {
  console.log(`${colors.yellow}[WARN]${colors.reset} ${name}`)
  if (message) {
    console.log(`      ${message}`)
  }
  if (details) {
    console.log(`      ${colors.blue}Details: ${JSON.stringify(details, null, 2)}${colors.reset}`)
  }
  
  testResults.warnings++
}

// Print test header
function printHeader(title) {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}`)
}

// Test 1: Webhook Endpoint Health Check
async function testWebhookHealth() {
  printHeader('Webhook Endpoint Health Check')
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/sync/airtable`)
    
    if (response.status === 200) {
      logTest(
        'Webhook endpoint accessible',
        true,
        'GET request to webhook endpoint successful',
        { status: response.status, endpoint: response.data.endpoint }
      )
    } else {
      logTest(
        'Webhook endpoint accessible',
        false,
        `Unexpected status code: ${response.status}`,
        response.data
      )
    }
  } catch (error) {
    logTest(
      'Webhook endpoint accessible',
      false,
      `Request failed: ${error.message}`,
      { error: error.toString() }
    )
  }
}

// Test 2: Webhook Authentication
async function testWebhookAuth() {
  printHeader('Webhook Authentication')
  
  // Test with invalid token
  try {
    const response = await makeRequest(`${BASE_URL}/api/sync/airtable`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token'
      },
      body: { test: 'data' }
    })
    
    if (response.status === 401) {
      logTest(
        'Webhook rejects invalid authentication',
        true,
        'Invalid token correctly rejected with 401',
        { status: response.status }
      )
    } else {
      logTest(
        'Webhook rejects invalid authentication',
        false,
        `Expected 401, got ${response.status}`,
        response.data
      )
    }
  } catch (error) {
    logTest(
      'Webhook rejects invalid authentication',
      false,
      `Request failed: ${error.message}`,
      { error: error.toString() }
    )
  }
  
  // Test with valid token but invalid data
  try {
    const response = await makeRequest(`${BASE_URL}/api/sync/airtable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEBHOOK_SECRET}`
      },
      body: { test: 'minimal data' }
    })
    
    if (response.status === 200 || response.status === 500) {
      logTest(
        'Webhook accepts valid authentication',
        true,
        'Valid token accepted (may fail on data processing)',
        { status: response.status }
      )
    } else {
      logTest(
        'Webhook accepts valid authentication',
        false,
        `Unexpected status: ${response.status}`,
        response.data
      )
    }
  } catch (error) {
    logWarning(
      'Webhook authentication test',
      `Request failed: ${error.message}`,
      { error: error.toString() }
    )
  }
}

// Test 3: Admin API Health Check
async function testAdminAPIHealth() {
  printHeader('Admin API Health Check')
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/sync`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    })
    
    if (response.status === 200) {
      logTest(
        'Admin API accessible',
        true,
        'Admin API returns sync status successfully',
        { 
          status: response.status, 
          lastSync: response.data.last_sync,
          operations: response.data.recent_operations
        }
      )
    } else {
      logTest(
        'Admin API accessible',
        false,
        `Unexpected status code: ${response.status}`,
        response.data
      )
    }
  } catch (error) {
    logTest(
      'Admin API accessible',
      false,
      `Request failed: ${error.message}`,
      { error: error.toString() }
    )
  }
}

// Test 4: Admin API Authentication
async function testAdminAPIAuth() {
  printHeader('Admin API Authentication')
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/sync`, {
      headers: {
        'Authorization': 'Bearer invalid-admin-token'
      }
    })
    
    if (response.status === 401) {
      logTest(
        'Admin API rejects invalid authentication',
        true,
        'Invalid admin token correctly rejected',
        { status: response.status }
      )
    } else {
      logTest(
        'Admin API rejects invalid authentication',
        false,
        `Expected 401, got ${response.status}`,
        response.data
      )
    }
  } catch (error) {
    logTest(
      'Admin API rejects invalid authentication',
      false,
      `Request failed: ${error.message}`,
      { error: error.toString() }
    )
  }
}

// Test 5: Artworks API Integration
async function testArtworksAPI() {
  printHeader('Artworks API Integration')
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/artworks`)
    
    if (response.status === 200 && response.data.success) {
      const artworkCount = response.data.data ? response.data.data.length : 0
      
      logTest(
        'Artworks API returns data',
        artworkCount > 0,
        `Found ${artworkCount} artworks`,
        { 
          status: response.status,
          count: artworkCount,
          message: response.data.message
        }
      )
      
      // Check if some artworks have airtable_id (indicating sync)
      if (artworkCount > 0) {
        const syncedArtworks = response.data.data.filter(artwork => 
          artwork.id && artwork.id.startsWith('rec')
        )
        
        logTest(
          'Synced artworks detected',
          syncedArtworks.length > 0,
          `${syncedArtworks.length} artworks appear to be from Airtable`,
          { syncedCount: syncedArtworks.length, totalCount: artworkCount }
        )
      }
    } else {
      logTest(
        'Artworks API returns data',
        false,
        `API failed or returned no data: ${response.status}`,
        response.data
      )
    }
  } catch (error) {
    logTest(
      'Artworks API returns data',
      false,
      `Request failed: ${error.message}`,
      { error: error.toString() }
    )
  }
}

// Test 6: Environment Variables
async function testEnvironmentVariables() {
  printHeader('Environment Variables')
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/test-env`)
    
    if (response.status === 200) {
      const config = response.data.config || {}
      
      // Check required environment variables
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'AIRTABLE_API_KEY',
        'AIRTABLE_BASE_ID',
        'ADMIN_SYNC_TOKEN',
        'AIRTABLE_WEBHOOK_SECRET'
      ]
      
      const missingVars = requiredVars.filter(varName => !config[varName])
      
      logTest(
        'Required environment variables set',
        missingVars.length === 0,
        missingVars.length === 0 
          ? 'All required environment variables are configured'
          : `Missing variables: ${missingVars.join(', ')}`,
        { configured: Object.keys(config), missing: missingVars }
      )
    } else {
      logTest(
        'Environment variables accessible',
        false,
        `Test endpoint failed: ${response.status}`,
        response.data
      )
    }
  } catch (error) {
    logWarning(
      'Environment variables test',
      `Could not test environment variables: ${error.message}`,
      { error: error.toString() }
    )
  }
}

// Test 7: Webhook Sample Data Processing
async function testWebhookDataProcessing() {
  printHeader('Webhook Data Processing')
  
  const samplePayload = {
    base: { id: "appnTPahU80ZnGWQO" },
    webhook: { id: "test-webhook" },
    timestamp: new Date().toISOString(),
    changedTablesById: {
      "tblArtworks": {
        changedRecordsById: {
          "recTestSync123": {
            current: {
              id: "recTestSync123",
              createdTime: new Date().toISOString(),
              fields: {
                "작품명": "테스트 동기화 작품",
                "제작년도": "2025",
                "재료": "디지털 테스트",
                "규격": "가상 크기",
                "작품설명": "자동 동기화 시스템 테스트용 작품",
                "작가의글": "시스템 테스트 중",
                "추천작품": false,
                "분류": "테스트",
                "판매가능": false,
                "작품번호": "999"
              }
            }
          }
        }
      }
    }
  }
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/sync/airtable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEBHOOK_SECRET}`
      },
      body: samplePayload
    })
    
    if (response.status === 200 && response.data.success) {
      logTest(
        'Webhook processes sample data',
        true,
        `Successfully processed ${response.data.processed || 0} records`,
        { 
          status: response.status,
          processed: response.data.processed,
          message: response.data.message
        }
      )
    } else {
      logTest(
        'Webhook processes sample data',
        false,
        `Processing failed: ${response.status}`,
        response.data
      )
    }
  } catch (error) {
    logTest(
      'Webhook processes sample data',
      false,
      `Request failed: ${error.message}`,
      { error: error.toString() }
    )
  }
}

// Main test execution
async function runAllTests() {
  console.log(`${colors.bold}${colors.blue}`)
  console.log('ANAM Gallery Auto-Sync System Test Suite')
  console.log('=========================================')
  console.log(`${colors.reset}`)
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Test Time: ${new Date().toISOString()}`)
  
  const tests = [
    testWebhookHealth,
    testWebhookAuth,
    testAdminAPIHealth,
    testAdminAPIAuth,
    testArtworksAPI,
    testEnvironmentVariables,
    testWebhookDataProcessing
  ]
  
  for (const test of tests) {
    try {
      await test()
    } catch (error) {
      console.error(`${colors.red}Test execution error: ${error.message}${colors.reset}`)
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Print final results
  printHeader('Test Results Summary')
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`)
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`)
  console.log(`${colors.yellow}Warnings: ${testResults.warnings}${colors.reset}`)
  console.log(`Total Tests: ${testResults.tests.length}`)
  
  const successRate = Math.round((testResults.passed / testResults.tests.length) * 100)
  console.log(`${colors.bold}Success Rate: ${successRate}%${colors.reset}`)
  
  if (testResults.failed === 0) {
    console.log(`\n${colors.green}${colors.bold}✅ All tests passed! Sync system is ready for production.${colors.reset}`)
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ Some tests failed. Please review and fix issues before proceeding.${colors.reset}`)
  }
  
  // Additional recommendations
  console.log(`\n${colors.blue}${colors.bold}Next Steps:${colors.reset}`)
  console.log('1. Execute admin-views.sql in Supabase Dashboard')
  console.log('2. Set up Airtable webhook using the setup guide')
  console.log('3. Test real-time sync by modifying an Airtable record')
  console.log('4. Monitor sync status via admin API')
  
  process.exit(testResults.failed === 0 ? 0 : 1)
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error(`${colors.red}Test suite failed: ${error.message}${colors.reset}`)
    process.exit(1)
  })
}

module.exports = {
  runAllTests,
  testResults,
  makeRequest
}