import { toMatchImageSnapshot } from 'jest-image-snapshot'
import puppeteer from 'puppeteer'

// Jest image snapshot setup
expect.extend({ toMatchImageSnapshot })

// Visual test configuration
const visualTestConfig = {
  threshold: 0.2,
  customSnapshotsDir: '__tests__/visual/__image_snapshots__',
  customDiffDir: '__tests__/visual/__image_snapshots__/__diff_output__',
  failureThreshold: 0.01,
  failureThresholdType: 'percent',
}

// Viewports for responsive testing
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
}

describe('Components Visual Regression Tests', () => {
  let browser: puppeteer.Browser
  let page: puppeteer.Page

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  })

  afterAll(async () => {
    await browser.close()
  })

  beforeEach(async () => {
    page = await browser.newPage()
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Visual Test</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; }
            .btn-primary { @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors; }
            .btn-secondary { @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors; }
            .form-input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500; }
            .form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
            .error-text { @apply text-red-600 text-sm mt-1; }
          </style>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `)
  })

  afterEach(async () => {
    await page.close()
  })

  describe('ContactForm Visual Tests', () => {
    it('ContactForm - Default State', async () => {
      await page.setViewport(viewports.desktop)
      
      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="max-w-2xl mx-auto p-8">
              <form class="bg-white rounded-lg shadow-lg p-8">
                <h2 class="text-2xl font-bold mb-6">Contact Us</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="form-label">Name <span class="text-red-500">*</span></label>
                    <input type="text" class="form-input" placeholder="Your name" />
                  </div>
                  
                  <div>
                    <label class="form-label">Email <span class="text-red-500">*</span></label>
                    <input type="email" class="form-input" placeholder="your@email.com" />
                  </div>
                  
                  <div>
                    <label class="form-label">Phone</label>
                    <input type="tel" class="form-input" placeholder="010-1234-5678" />
                  </div>
                  
                  <div>
                    <label class="form-label">Subject</label>
                    <input type="text" class="form-input" placeholder="Inquiry subject" />
                  </div>
                </div>
                
                <div class="mt-6">
                  <label class="form-label">Message <span class="text-red-500">*</span></label>
                  <textarea class="form-input" rows="6" placeholder="Your message..."></textarea>
                  <div class="text-right text-sm text-gray-500 mt-1">0 / 1000</div>
                </div>
                
                <div class="mt-6 text-sm text-gray-600">
                  By submitting this form, you agree to our <a href="#" class="text-blue-600 hover:underline">Privacy Policy</a>.
                </div>
                
                <button type="submit" class="btn-primary w-full mt-6">Send Message</button>
              </form>
            </div>
          `
        }
      })

      const screenshot = await page.screenshot({
        clip: { x: 0, y: 0, width: viewports.desktop.width, height: 800 }
      })

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'contact-form-default',
      })
    })

    it('ContactForm - With Validation Errors', async () => {
      await page.setViewport(viewports.desktop)
      
      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="max-w-2xl mx-auto p-8">
              <form class="bg-white rounded-lg shadow-lg p-8">
                <h2 class="text-2xl font-bold mb-6">Contact Us</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="form-label">Name <span class="text-red-500">*</span></label>
                    <input type="text" class="form-input border-red-500" placeholder="Your name" />
                    <p class="error-text">Name is required</p>
                  </div>
                  
                  <div>
                    <label class="form-label">Email <span class="text-red-500">*</span></label>
                    <input type="email" class="form-input border-red-500" value="invalid-email" />
                    <p class="error-text">Invalid email address</p>
                  </div>
                  
                  <div>
                    <label class="form-label">Phone</label>
                    <input type="tel" class="form-input" placeholder="010-1234-5678" />
                  </div>
                  
                  <div>
                    <label class="form-label">Subject</label>
                    <input type="text" class="form-input" placeholder="Inquiry subject" />
                  </div>
                </div>
                
                <div class="mt-6">
                  <label class="form-label">Message <span class="text-red-500">*</span></label>
                  <textarea class="form-input border-red-500" rows="6" placeholder="Your message..."></textarea>
                  <p class="error-text">Message must be at least 10 characters</p>
                  <div class="text-right text-sm text-gray-500 mt-1">0 / 1000</div>
                </div>
                
                <button type="submit" class="btn-primary w-full mt-6" disabled>Send Message</button>
              </form>
            </div>
          `
        }
      })

      const screenshot = await page.screenshot({
        clip: { x: 0, y: 0, width: viewports.desktop.width, height: 850 }
      })

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'contact-form-errors',
      })
    })

    it('ContactForm - Success State', async () => {
      await page.setViewport(viewports.desktop)
      
      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="max-w-2xl mx-auto p-8">
              <div class="bg-green-50 rounded-lg shadow-lg p-8 text-center">
                <div class="mb-4">
                  <svg class="w-16 h-16 mx-auto text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-green-800 mb-2">Message Sent Successfully!</h2>
                <p class="text-green-700 mb-6">We'll get back to you as soon as possible.</p>
                <button class="btn-primary">Send Another Message</button>
              </div>
            </div>
          `
        }
      })

      const screenshot = await page.screenshot({
        clip: { x: 0, y: 0, width: viewports.desktop.width, height: 400 }
      })

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'contact-form-success',
      })
    })
  })

  describe('ArtworkDetailModal Visual Tests', () => {
    it('ArtworkDetailModal - Single Image', async () => {
      await page.setViewport(viewports.desktop)
      
      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <!-- Backdrop -->
            <div class="fixed inset-0 bg-black bg-opacity-75 z-40"></div>
            
            <!-- Modal -->
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div class="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div class="relative">
                  <!-- Close button -->
                  <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                  
                  <div class="grid grid-cols-1 lg:grid-cols-2">
                    <!-- Image section -->
                    <div class="relative bg-gray-100">
                      <div class="aspect-w-4 aspect-h-3">
                        <img src="/placeholder.jpg" alt="Artwork" class="w-full h-full object-contain" />
                      </div>
                      <div class="absolute bottom-4 left-4 right-4">
                        <div class="bg-white bg-opacity-90 rounded px-3 py-2 text-center text-sm">
                          1 / 1
                        </div>
                      </div>
                    </div>
                    
                    <!-- Details section -->
                    <div class="p-8">
                      <h2 class="text-3xl font-bold mb-2">Mountain Landscape</h2>
                      <p class="text-xl text-gray-600 mb-6">John Doe</p>
                      
                      <div class="space-y-4 mb-8">
                        <div>
                          <span class="text-gray-500">Year:</span>
                          <span class="ml-2 font-medium">2024</span>
                        </div>
                        <div>
                          <span class="text-gray-500">Medium:</span>
                          <span class="ml-2 font-medium">Oil on Canvas</span>
                        </div>
                        <div>
                          <span class="text-gray-500">Size:</span>
                          <span class="ml-2 font-medium">100 × 80 cm</span>
                        </div>
                        <div>
                          <span class="text-gray-500">Price:</span>
                          <span class="ml-2 font-medium text-lg">₩5,000,000</span>
                        </div>
                      </div>
                      
                      <div class="mb-8">
                        <h3 class="font-semibold mb-2">Description</h3>
                        <p class="text-gray-700 leading-relaxed">
                          This stunning landscape captures the majesty of mountain peaks at sunset. 
                          The artist's masterful use of color and light creates a sense of depth and atmosphere 
                          that draws the viewer into the scene.
                        </p>
                      </div>
                      
                      <div class="flex gap-4">
                        <button class="btn-primary flex-1">Contact for Purchase</button>
                        <button class="btn-secondary">
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `
        }
      })

      const screenshot = await page.screenshot({
        fullPage: true
      })

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'artwork-detail-modal',
      })
    })

    it('ArtworkDetailModal - Mobile View', async () => {
      await page.setViewport(viewports.mobile)
      
      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="fixed inset-0 bg-white z-50 overflow-y-auto">
              <!-- Header -->
              <div class="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 class="text-lg font-semibold">Artwork Details</h2>
                <button class="text-gray-500">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              <!-- Image -->
              <div class="aspect-w-4 aspect-h-3 bg-gray-100">
                <img src="/placeholder.jpg" alt="Artwork" class="w-full h-full object-contain" />
              </div>
              
              <!-- Details -->
              <div class="p-4">
                <h1 class="text-2xl font-bold mb-1">Mountain Landscape</h1>
                <p class="text-lg text-gray-600 mb-4">John Doe</p>
                
                <div class="space-y-2 mb-6 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Year</span>
                    <span class="font-medium">2024</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Medium</span>
                    <span class="font-medium">Oil on Canvas</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Size</span>
                    <span class="font-medium">100 × 80 cm</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Price</span>
                    <span class="font-medium">₩5,000,000</span>
                  </div>
                </div>
                
                <div class="mb-6">
                  <h3 class="font-semibold mb-2">Description</h3>
                  <p class="text-gray-700 text-sm leading-relaxed">
                    This stunning landscape captures the majesty of mountain peaks at sunset.
                  </p>
                </div>
                
                <button class="btn-primary w-full mb-3">Contact for Purchase</button>
                <button class="btn-secondary w-full">Share</button>
              </div>
            </div>
          `
        }
      })

      const screenshot = await page.screenshot({
        fullPage: true
      })

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'artwork-detail-modal-mobile',
      })
    })
  })

  describe('Navigation Visual Tests', () => {
    it('Navigation - Desktop', async () => {
      await page.setViewport(viewports.desktop)
      
      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <nav class="bg-white shadow-sm border-b">
              <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between items-center h-16">
                  <div class="flex items-center">
                    <div class="text-2xl font-bold">ANAM</div>
                  </div>
                  
                  <div class="hidden md:flex space-x-8">
                    <a href="#" class="text-gray-900 font-medium border-b-2 border-blue-600 pb-1">Gallery</a>
                    <a href="#" class="text-gray-600 hover:text-gray-900">Artists</a>
                    <a href="#" class="text-gray-600 hover:text-gray-900">Exhibitions</a>
                    <a href="#" class="text-gray-600 hover:text-gray-900">About</a>
                    <a href="#" class="text-gray-600 hover:text-gray-900">Contact</a>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <button class="text-gray-600 hover:text-gray-900">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </button>
                    <button class="text-gray-600 hover:text-gray-900">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                    </button>
                    <button class="text-gray-600 hover:text-gray-900">
                      KO
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          `
        }
      })

      const screenshot = await page.screenshot({
        clip: { x: 0, y: 0, width: viewports.desktop.width, height: 80 }
      })

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'navigation-desktop',
      })
    })

    it('Navigation - Mobile Menu Open', async () => {
      await page.setViewport(viewports.mobile)
      
      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="relative">
              <nav class="bg-white shadow-sm border-b">
                <div class="px-4">
                  <div class="flex justify-between items-center h-16">
                    <div class="text-xl font-bold">ANAM</div>
                    <button class="text-gray-600">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </nav>
              
              <!-- Mobile menu -->
              <div class="absolute top-16 inset-x-0 bg-white shadow-lg z-50">
                <div class="px-4 py-2 space-y-1">
                  <a href="#" class="block py-3 text-gray-900 font-medium border-l-4 border-blue-600 pl-3 bg-blue-50">Gallery</a>
                  <a href="#" class="block py-3 text-gray-600 pl-4">Artists</a>
                  <a href="#" class="block py-3 text-gray-600 pl-4">Exhibitions</a>
                  <a href="#" class="block py-3 text-gray-600 pl-4">About</a>
                  <a href="#" class="block py-3 text-gray-600 pl-4">Contact</a>
                </div>
                <div class="border-t px-4 py-3 flex justify-around">
                  <button class="text-gray-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </button>
                  <button class="text-gray-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                  </button>
                  <button class="text-gray-600">KO</button>
                </div>
              </div>
            </div>
          `
        }
      })

      const screenshot = await page.screenshot({
        clip: { x: 0, y: 0, width: viewports.mobile.width, height: 450 }
      })

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'navigation-mobile-menu',
      })
    })
  })

  describe('Theme Toggle Visual Tests', () => {
    it('Theme Toggle States', async () => {
      await page.setViewport({ width: 300, height: 200 })
      
      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="p-8 bg-gray-50">
              <div class="space-y-4">
                <!-- Light mode active -->
                <button class="flex items-center justify-center w-12 h-12 rounded-lg bg-white shadow-md border border-gray-200 text-yellow-500">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                  </svg>
                </button>
                
                <!-- Dark mode active -->
                <button class="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-800 shadow-md border border-gray-700 text-blue-400">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                </button>
              </div>
            </div>
          `
        }
      })

      const screenshot = await page.screenshot()

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'theme-toggle-states',
      })
    })
  })

  describe('Language Switcher Visual Tests', () => {
    it('Language Switcher - Dropdown Open', async () => {
      await page.setViewport({ width: 200, height: 300 })
      
      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="p-4 bg-gray-50">
              <div class="relative">
                <button class="flex items-center space-x-2 px-3 py-2 bg-white rounded-md shadow-sm border">
                  <span class="text-sm font-medium">KO</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                
                <div class="absolute top-full mt-1 w-32 bg-white rounded-md shadow-lg border">
                  <div class="py-1">
                    <button class="w-full text-left px-4 py-2 text-sm bg-blue-50 text-blue-600 font-medium">
                      한국어
                    </button>
                    <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      English
                    </button>
                    <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      中文
                    </button>
                    <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      日本語
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `
        }
      })

      const screenshot = await page.screenshot()

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'language-switcher-open',
      })
    })
  })

  describe('Error States Visual Tests', () => {
    it('Error Boundary - Generic Error', async () => {
      await page.setViewport(viewports.desktop)
      
      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div class="mb-4">
                  <svg class="w-20 h-20 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                <p class="text-gray-600 mb-6">We're sorry, but something unexpected happened. Please try refreshing the page.</p>
                <div class="space-y-3">
                  <button class="btn-primary w-full">Refresh Page</button>
                  <button class="btn-secondary w-full">Go to Homepage</button>
                </div>
                <details class="mt-6 text-left">
                  <summary class="text-sm text-gray-500 cursor-pointer">Error details</summary>
                  <pre class="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
Error: Failed to load component
  at ComponentLoader.load
  at async Page.render
                  </pre>
                </details>
              </div>
            </div>
          `
        }
      })

      const screenshot = await page.screenshot()

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'error-boundary-generic',
      })
    })

    it('Error Boundary - 404 Not Found', async () => {
      await page.setViewport(viewports.desktop)
      
      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div class="text-center">
                <h1 class="text-9xl font-bold text-gray-200">404</h1>
                <p class="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</p>
                <p class="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
                <div class="space-x-4">
                  <button class="btn-primary">Go to Gallery</button>
                  <button class="btn-secondary">Contact Us</button>
                </div>
              </div>
            </div>
          `
        }
      })

      const screenshot = await page.screenshot()

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'error-404',
      })
    })
  })

  describe('Loading States Visual Tests', () => {
    it('Gallery Loading Skeleton', async () => {
      await page.setViewport(viewports.desktop)
      
      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="p-8 bg-gray-50">
              <div class="grid grid-cols-3 gap-6">
                ${Array(6).fill(null).map(() => `
                  <div class="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                    <div class="aspect-w-4 aspect-h-3 bg-gray-200"></div>
                    <div class="p-4 space-y-3">
                      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div class="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `
        }
      })

      const screenshot = await page.screenshot()

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'gallery-loading-skeleton',
      })
    })
  })
})