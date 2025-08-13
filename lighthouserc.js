module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/gallery',
        'http://localhost:3000/gallery/01',
        'http://localhost:3000/contact',
        'http://localhost:3000/artist',
        'http://localhost:3000/exhibition'
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        onlyCategories: ['accessibility', 'best-practices', 'seo'],
        skipAudits: [
          // Skip audits that may be inconsistent in CI
          'is-on-https',
          'uses-http2'
        ]
      }
    },
    assert: {
      assertions: {
        // Accessibility score must be at least 90
        'categories:accessibility': ['error', { minScore: 0.9 }],
        
        // Best practices score should be high
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        
        // SEO score for discoverability
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Specific accessibility audits
        'aria-allowed-attr': 'error',
        'aria-hidden-body': 'error',
        'aria-hidden-focus': 'error',
        'aria-required-attr': 'error',
        'aria-required-children': 'error',
        'aria-required-parent': 'error',
        'aria-roles': 'error',
        'aria-valid-attr': 'error',
        'aria-valid-attr-value': 'error',
        'button-name': 'error',
        'bypass': 'error',
        'color-contrast': 'error',
        'document-title': 'error',
        'duplicate-id-active': 'error',
        'duplicate-id-aria': 'error',
        'form-field-multiple-labels': 'error',
        'frame-title': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        'image-alt': 'error',
        'input-image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'list': 'error',
        'listitem': 'error',
        'meta-refresh': 'error',
        'meta-viewport': 'error',
        'object-alt': 'error',
        'tabindex': 'error',
        'td-headers-attr': 'error',
        'th-has-data-cells': 'error',
        'valid-lang': 'error',
        'video-caption': 'error',
        
        // Performance audits that affect accessibility
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      // If using LHCI server
      // target: 'lhci',
      // token: process.env.LHCI_TOKEN,
      // serverBaseUrl: process.env.LHCI_SERVER_URL
    },
    wizard: {
      // Lighthouse CI wizard configuration
    }
  }
}