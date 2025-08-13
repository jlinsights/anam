module.exports = {
  defaults: {
    // WCAG 2.1 AA compliance
    standard: 'WCAG2AA',
    
    // Timeout for page loads
    timeout: 30000,
    
    // Wait time after page load
    wait: 2000,
    
    // Browser settings
    chromeLaunchConfig: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    },
    
    // Viewport size
    viewport: {
      width: 1440,
      height: 900
    },
    
    // Actions to perform before testing
    actions: [
      'wait for element [data-testid="app"] to be visible',
      'wait for 2000ms'
    ],
    
    // Elements to ignore during testing
    hideElements: [
      '.loading-spinner',
      '.skeleton-loader',
      '[data-testid="loading"]'
    ],
    
    // Include additional accessibility checks
    includeNotices: false,
    includeWarnings: false,
    
    // Custom reporter
    reporter: 'pa11y-reporter-html',
    
    // Output settings
    log: {
      debug: false,
      error: true,
      info: true
    }
  },
  
  // URL configurations
  urls: [
    {
      url: 'http://localhost:3000/',
      name: 'Homepage',
      actions: [
        'wait for element main to be visible',
        'wait for 3000ms'
      ]
    },
    {
      url: 'http://localhost:3000/gallery',
      name: 'Gallery Page',
      actions: [
        'wait for element [data-testid="gallery-container"] to be visible',
        'wait for 3000ms'
      ]
    },
    {
      url: 'http://localhost:3000/gallery/01',
      name: 'Artwork Detail Page',
      actions: [
        'wait for element [data-testid="artwork-detail"] to be visible',
        'wait for 3000ms'
      ]
    },
    {
      url: 'http://localhost:3000/contact',
      name: 'Contact Page',
      actions: [
        'wait for element form to be visible',
        'wait for 2000ms'
      ]
    },
    {
      url: 'http://localhost:3000/artist',
      name: 'Artist Page',
      actions: [
        'wait for element main to be visible',
        'wait for 2000ms'
      ]
    },
    {
      url: 'http://localhost:3000/exhibition',
      name: 'Exhibition Page',
      actions: [
        'wait for element main to be visible',
        'wait for 2000ms'
      ]
    }
  ],
  
  // Ignore specific issues (use sparingly and document reasons)
  ignore: [
    // Ignore color contrast issues on decorative elements
    'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Abs',
    
    // Ignore issues with third-party embedded content
    'WCAG2AA.Principle1.Guideline1_1.1_1_1.H37.3.NoAlt'
  ]
}