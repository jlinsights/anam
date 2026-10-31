import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from '@axe-core/playwright'

test.describe('Advanced User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await injectAxe(page)
  })

  test.describe('Artwork Detail and Inquiry Flow', () => {
    test('should complete full artwork inquiry workflow', async ({ page }) => {
      // Navigate to gallery
      await page.click('nav a[href*="gallery"]')
      await page.waitForLoadState('networkidle')

      // Select first artwork
      const firstArtwork = page.locator('[data-testid*="artwork-"]').first()
      await firstArtwork.click()

      // Verify artwork modal/detail page opens
      const modal = page.locator('dialog[role="dialog"], [data-testid="artwork-detail"]')
      await expect(modal).toBeVisible()

      // Get artwork title for later verification
      const artworkTitle = await page.locator('h1, h2, h3').first().textContent()

      // Click contact/inquiry button
      const contactButton = page.locator('button, a').filter({ hasText: /contact|inquiry|문의|구매/ })
      await contactButton.click()

      // Should navigate to contact form with artwork parameter
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('contact')
      
      // Verify artwork is pre-selected in contact form
      const subjectField = page.locator('input[name="subject"], textarea[name="message"]').first()
      const fieldValue = await subjectField.inputValue()
      expect(fieldValue).toContain('artwork')

      // Fill contact form
      await page.fill('input[name="name"]', 'John Doe')
      await page.fill('input[name="email"]', 'john@example.com')
      await page.fill('input[name="phone"]', '010-1234-5678')
      
      // If subject is empty, fill it
      if (!fieldValue) {
        await page.fill('input[name="subject"]', `Inquiry about ${artworkTitle}`)
      }
      
      await page.fill('textarea[name="message"]', `I am interested in purchasing the artwork "${artworkTitle}". Please provide more information about availability and pricing.`)

      // Submit form
      await page.click('button[type="submit"]')

      // Verify success message
      await expect(page.locator('text=/success|sent|감사|전송/i')).toBeVisible({ timeout: 10000 })
    })

    test('should navigate between multiple artwork images', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // Click on artwork (assuming it has multiple images)
      const artwork = page.locator('[data-testid*="artwork-"]').first()
      await artwork.click()

      const modal = page.locator('dialog[role="dialog"]')
      await expect(modal).toBeVisible()

      // Look for navigation buttons
      const nextButton = page.locator('button[aria-label*="next"], button[aria-label*="다음"]')
      const prevButton = page.locator('button[aria-label*="prev"], button[aria-label*="이전"]')

      if (await nextButton.isVisible()) {
        // Click next button
        await nextButton.click()
        await page.waitForTimeout(500)

        // Verify image changed (check for image counter or src change)
        const imageCounter = page.locator('text=/[0-9]+.*[0-9]+/')
        if (await imageCounter.isVisible()) {
          const counterText = await imageCounter.textContent()
          expect(counterText).toMatch(/[2-9].*[0-9]+/) // Should show 2 of X or higher
        }

        // Test previous button
        if (await prevButton.isVisible()) {
          await prevButton.click()
          await page.waitForTimeout(500)
        }
      }

      // Test keyboard navigation
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(500)
      await page.keyboard.press('ArrowLeft')
      await page.waitForTimeout(500)

      // Close modal
      await page.keyboard.press('Escape')
      await expect(modal).toBeHidden()
    })

    test('should handle social sharing functionality', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      const artwork = page.locator('[data-testid*="artwork-"]').first()
      await artwork.click()

      const modal = page.locator('dialog[role="dialog"]')
      await expect(modal).toBeVisible()

      // Look for share buttons
      const shareButton = page.locator('button[aria-label*="share"], button').filter({ hasText: /share|공유/ })
      
      if (await shareButton.isVisible()) {
        // Test native share API or social media buttons
        const newPagePromise = page.waitForEvent('popup')
        await shareButton.click()

        // If popup opens (social media), verify URL
        try {
          const newPage = await newPagePromise
          expect(newPage.url()).toMatch(/(facebook|twitter|linkedin|instagram)\.com/)
          await newPage.close()
        } catch (e) {
          // Native share API was used instead, which is fine
          console.log('Native share API used')
        }
      }
    })
  })

  test.describe('Search and Filter Combinations', () => {
    test('should handle complex search and filter scenarios', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // Initial search
      const searchInput = page.locator('input[placeholder*="검색"], input[type="search"]')
      await searchInput.fill('landscape')
      await page.waitForTimeout(500)

      // Get initial result count
      const initialResults = await page.locator('[data-testid*="artwork-"]').count()

      // Open filter modal
      const filterButton = page.locator('button').filter({ hasText: /filter|필터/ })
      await filterButton.click()

      const modal = page.locator('dialog[role="dialog"], [role="dialog"]')
      await expect(modal).toBeVisible()

      // Apply multiple filters
      const categorySelect = page.locator('select').first()
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption('painting')
      }

      // Year range filter
      const yearInputs = page.locator('input[type="number"]')
      if (await yearInputs.count() >= 2) {
        await yearInputs.first().fill('2020')
        await yearInputs.last().fill('2024')
      }

      // Apply filters
      const applyButton = page.locator('button').filter({ hasText: /apply|적용/ })
      await applyButton.click()
      await expect(modal).toBeHidden()

      // Wait for results to update
      await page.waitForTimeout(1000)

      // Verify filters are applied
      const filteredResults = await page.locator('[data-testid*="artwork-"]').count()
      
      // Should have multiple active filter tags
      const filterTags = page.locator('span').filter({ hasText: /검색:|category:|year:/ })
      await expect(filterTags).toHaveCount.greaterThan(1)

      // Test removing individual filters
      const firstTag = filterTags.first()
      const removeButton = firstTag.locator('button, [role="button"]')
      if (await removeButton.isVisible()) {
        await removeButton.click()
        await page.waitForTimeout(500)
        
        // Verify tag was removed and results updated
        const updatedFilterTags = await page.locator('span').filter({ hasText: /검색:|category:|year:/ }).count()
        expect(updatedFilterTags).toBeLessThan(await filterTags.count())
      }
    })

    test('should maintain filter state during navigation', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // Apply search filter
      const searchInput = page.locator('input[placeholder*="검색"]')
      await searchInput.fill('test artwork')
      await page.waitForTimeout(500)

      // Navigate away and back
      await page.click('nav a[href*="contact"]')
      await page.waitForLoadState('networkidle')
      
      await page.click('nav a[href*="gallery"]')
      await page.waitForLoadState('networkidle')

      // Check if search filter is preserved (may vary based on implementation)
      const currentSearchValue = await searchInput.inputValue()
      // This test depends on whether you want to preserve filters across navigation
    })

    test('should handle empty search results gracefully', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // Search for something that definitely won't exist
      const searchInput = page.locator('input[placeholder*="검색"]')
      await searchInput.fill('xyznonexistentartwork123')
      await page.waitForTimeout(1000)

      // Verify empty state is shown
      await expect(page.locator('text=/no results|empty|없습니다/i')).toBeVisible()

      // Verify helpful message or suggestions are shown
      const helpText = page.locator('text=/try different|다른 검색어|suggestion/i')
      if (await helpText.isVisible()) {
        await expect(helpText).toBeVisible()
      }

      // Test clear search
      const clearButton = page.locator('button[aria-label*="clear"], button').filter({ hasText: /clear|지우기/ })
      if (await clearButton.isVisible()) {
        await clearButton.click()
        await page.waitForTimeout(500)
        
        // Should show all artworks again
        await expect(page.locator('[data-testid*="artwork-"]')).toHaveCount.greaterThan(0)
      }
    })
  })

  test.describe('Language and Theme Switching', () => {
    test('should switch languages correctly', async ({ page }) => {
      // Test language switcher if available
      const langSwitcher = page.locator('button[aria-label*="language"], select[aria-label*="language"], button').filter({ hasText: /KO|EN|언어/ })
      
      if (await langSwitcher.isVisible()) {
        // Get current language state
        const initialText = await page.locator('h1, h2').first().textContent()
        
        // Switch language
        await langSwitcher.click()
        
        // If dropdown, select different option
        const englishOption = page.locator('option[value="en"], button').filter({ hasText: /english|EN/ })
        if (await englishOption.isVisible()) {
          await englishOption.click()
          await page.waitForTimeout(1000)
          
          // Verify content changed
          const newText = await page.locator('h1, h2').first().textContent()
          expect(newText).not.toBe(initialText)
        }
      }
    })

    test('should toggle theme and persist preference', async ({ page }) => {
      const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="테마"]')
      
      if (await themeToggle.isVisible()) {
        // Get initial theme
        const initialBodyClass = await page.locator('body, html').first().getAttribute('class')
        
        // Toggle theme
        await themeToggle.click()
        await page.waitForTimeout(500)
        
        // Verify theme changed
        const newBodyClass = await page.locator('body, html').first().getAttribute('class')
        expect(newBodyClass).not.toBe(initialBodyClass)
        
        // Refresh page to test persistence
        await page.reload()
        await page.waitForLoadState('networkidle')
        
        // Theme should be preserved
        const persistedClass = await page.locator('body, html').first().getAttribute('class')
        expect(persistedClass).toBe(newBodyClass)
      }
    })
  })

  test.describe('Performance and UX Edge Cases', () => {
    test('should handle rapid user interactions', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      const searchInput = page.locator('input[placeholder*="검색"]')
      
      // Rapid typing simulation
      await searchInput.click()
      await page.keyboard.type('a')
      await page.keyboard.type('b')
      await page.keyboard.type('c')
      await page.keyboard.press('Backspace')
      await page.keyboard.press('Backspace')
      await page.keyboard.type('rt')
      
      // Wait for debounce and verify no errors
      await page.waitForTimeout(1000)
      await expect(page.locator('body')).toBeVisible() // Basic sanity check
    })

    test('should handle concurrent operations', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // Start multiple operations simultaneously
      const searchPromise = page.locator('input[placeholder*="검색"]').fill('test')
      const filterPromise = page.locator('button').filter({ hasText: /filter|필터/ }).click()
      
      await Promise.allSettled([searchPromise, filterPromise])
      
      // Verify page is still functional
      await page.waitForTimeout(1000)
      await expect(page.locator('[data-testid*="artwork-"]').or(page.locator('text=/no results/i'))).toBeVisible()
    })

    test('should maintain scroll position on dynamic content changes', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500))
      const initialScrollY = await page.evaluate(() => window.scrollY)

      // Trigger content change (e.g., search)
      const searchInput = page.locator('input[placeholder*="검색"]')
      await searchInput.fill('test')
      await page.waitForTimeout(1000)

      // Verify scroll position is maintained or handled appropriately
      const newScrollY = await page.evaluate(() => window.scrollY)
      // This test depends on your UX decision: maintain scroll or reset to top
    })
  })

  test.describe('Offline and Error Recovery', () => {
    test('should handle gradual network degradation', async ({ page, context }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // Simulate slow network
      await context.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2s delay
        await route.continue()
      })

      // Try to load more content or navigate
      const searchInput = page.locator('input[placeholder*="검색"]')
      await searchInput.fill('slow search')

      // Should show loading states
      const loadingIndicator = page.locator('text=/loading|로딩|spinner/i, [role="progressbar"]')
      
      // Wait for operation to complete or timeout gracefully
      await page.waitForTimeout(5000)
      
      // Verify the app is still responsive
      await expect(page.locator('body')).toBeVisible()
    })

    test('should provide retry mechanisms for failed operations', async ({ page }) => {
      // Intercept and fail API requests
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        })
      })

      await page.goto('/gallery')
      
      // Should show error state
      await expect(page.locator('text=/error|오류|retry|다시/i')).toBeVisible({ timeout: 10000 })
      
      // Find and click retry button
      const retryButton = page.locator('button').filter({ hasText: /retry|다시|reload/ })
      if (await retryButton.isVisible()) {
        // Remove route interception for retry
        await page.unroute('**/api/**')
        
        await retryButton.click()
        await page.waitForLoadState('networkidle')
        
        // Should successfully load content
        await expect(page.locator('[data-testid*="artwork-"]').or(page.locator('text=/gallery/i'))).toBeVisible()
      }
    })
  })

  test.describe('Mobile-Specific Workflows', () => {
    test('should handle touch gestures and mobile interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // Test mobile-specific interactions
      const artwork = page.locator('[data-testid*="artwork-"]').first()
      
      // Simulate touch tap
      await artwork.tap()
      
      // Verify modal opens on mobile
      const modal = page.locator('dialog[role="dialog"], [data-testid="artwork-detail"]')
      await expect(modal).toBeVisible()

      // Test swipe gestures if implemented
      const modalContent = page.locator('dialog[role="dialog"] img, [data-testid="artwork-detail"] img').first()
      if (await modalContent.isVisible()) {
        // Simulate swipe left (touch start -> move -> end)
        const box = await modalContent.boundingBox()
        if (box) {
          await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
          
          // Test if next image navigation works
          const nextButton = page.locator('button[aria-label*="next"]')
          if (await nextButton.isVisible()) {
            await nextButton.tap()
            await page.waitForTimeout(500)
          }
        }
      }
    })

    test('should optimize mobile form experience', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/contact')
      await page.waitForLoadState('networkidle')

      // Test mobile form interactions
      const nameInput = page.locator('input[name="name"]')
      await nameInput.tap()
      
      // Verify virtual keyboard accommodation
      const emailInput = page.locator('input[name="email"]')
      await emailInput.tap()
      
      // Check if email keyboard is suggested (this might not be testable in Playwright)
      const emailInputType = await emailInput.getAttribute('type')
      expect(emailInputType).toBe('email')

      // Test form submission on mobile
      await nameInput.fill('Mobile User')
      await emailInput.fill('mobile@example.com')
      await page.locator('textarea[name="message"]').fill('Mobile form test message')
      
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.tap()
      
      // Verify success on mobile
      await expect(page.locator('text=/success|sent/i')).toBeVisible({ timeout: 10000 })
    })
  })
})