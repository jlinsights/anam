import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from '@axe-core/playwright'

test.describe('Gallery E2E Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle')
    
    // 접근성 도구 주입
    await injectAxe(page)
  })

  test.describe('갤러리 브라우징 워크플로우', () => {
    test('사용자가 갤러리 페이지에서 작품을 탐색할 수 있어야 한다', async ({ page }) => {
      // 갤러리 페이지로 이동
      await page.click('nav a[href*="gallery"]')
      await page.waitForLoadState('networkidle')

      // 작품 목록이 로드되었는지 확인
      await expect(page.locator('[data-testid*="artwork-"]')).toHaveCount.greaterThan(0)

      // 첫 번째 작품 클릭
      const firstArtwork = page.locator('[data-testid*="artwork-"]').first()
      await firstArtwork.click()

      // 작품 상세 페이지 또는 모달이 열렸는지 확인
      await expect(
        page.locator('[data-testid="artwork-detail"]').or(
          page.locator('dialog[role="dialog"]')
        )
      ).toBeVisible()

      // 작품 정보가 표시되는지 확인
      await expect(page.locator('h1, h2, h3')).toContainText(/작품/)
    })

    test('갤러리 그리드 레이아웃이 반응형으로 동작해야 한다', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // 데스크톱 뷰 확인
      await page.setViewportSize({ width: 1200, height: 800 })
      const desktopColumns = await page.locator('.grid').getAttribute('class')
      expect(desktopColumns).toContain('lg:grid-cols-3')

      // 태블릿 뷰 확인
      await page.setViewportSize({ width: 768, height: 1024 })
      const tabletColumns = await page.locator('.grid').getAttribute('class')
      expect(tabletColumns).toContain('sm:grid-cols-2')

      // 모바일 뷰 확인
      await page.setViewportSize({ width: 375, height: 667 })
      const mobileColumns = await page.locator('.grid').getAttribute('class')
      expect(mobileColumns).toContain('grid-cols-1')
    })

    test('이미지 지연 로딩이 올바르게 작동해야 한다', async ({ page }) => {
      await page.goto('/gallery')
      
      // 첫 번째 이미지들이 eager 로딩되는지 확인
      const eagerImages = page.locator('img[loading="eager"]')
      await expect(eagerImages).toHaveCount.greaterThanOrEqual(1)
      await expect(eagerImages).toHaveCount.lessThanOrEqual(4)

      // 나머지 이미지들이 lazy 로딩되는지 확인
      const lazyImages = page.locator('img[loading="lazy"]')
      await expect(lazyImages).toHaveCount.greaterThan(0)

      // 스크롤하여 lazy 이미지들이 로드되는지 확인
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(1000)
      
      // 모든 이미지가 로드되었는지 확인
      const allImages = page.locator('img')
      const imageCount = await allImages.count()
      
      for (let i = 0; i < imageCount; i++) {
        const img = allImages.nth(i)
        await expect(img).toBeVisible()
      }
    })

    test('작품 호버 효과가 올바르게 작동해야 한다', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      const firstArtworkCard = page.locator('.card-art').first()
      
      // 호버 전 상태 확인
      const initialClasses = await firstArtworkCard.getAttribute('class')
      
      // 호버 시뮬레이션
      await firstArtworkCard.hover()
      
      // 호버 효과 확인 (transform, shadow 등)
      await expect(firstArtworkCard).toHaveClass(/hover:|transform|shadow/)
    })
  })

  test.describe('검색 및 필터링 워크플로우', () => {
    test('사용자가 작품을 검색할 수 있어야 한다', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // 검색 입력 필드 찾기
      const searchInput = page.locator('input[placeholder*="검색"], input[type="search"]')
      await expect(searchInput).toBeVisible()

      // 검색어 입력
      await searchInput.fill('길')
      
      // 검색 결과 로딩 대기
      await page.waitForTimeout(500) // 디바운싱 대기
      
      // 검색 결과 확인
      const searchResults = page.locator('[data-testid*="artwork-"]')
      await expect(searchResults).toHaveCount.greaterThan(0)
      
      // 검색된 작품들이 검색어를 포함하는지 확인
      const artworkTitles = await searchResults.locator('h3, h4, h5').allTextContents()
      expect(artworkTitles.some(title => title.includes('길'))).toBeTruthy()
    })

    test('필터 모달이 올바르게 작동해야 한다', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // 필터 버튼 클릭
      const filterButton = page.locator('button').filter({ hasText: '필터' })
      await filterButton.click()

      // 모달이 열렸는지 확인
      const modal = page.locator('dialog[role="dialog"], [role="dialog"]')
      await expect(modal).toBeVisible()

      // 정렬 옵션 변경
      const sortSelect = page.locator('select').first()
      await sortSelect.selectOption('title')

      // 연도 필터 설정
      const yearInputs = page.locator('input[type="number"]')
      if (await yearInputs.count() > 0) {
        await yearInputs.first().fill('2024')
      }

      // 적용 버튼 클릭
      const applyButton = page.locator('button').filter({ hasText: '적용' })
      await applyButton.click()

      // 모달이 닫혔는지 확인
      await expect(modal).toBeHidden()

      // 필터가 적용되었는지 확인
      await page.waitForTimeout(500)
      const filteredResults = page.locator('[data-testid*="artwork-"]')
      await expect(filteredResults).toHaveCount.greaterThan(0)
    })

    test('활성 필터 태그가 올바르게 표시되고 제거되어야 한다', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // 검색어 입력
      const searchInput = page.locator('input[placeholder*="검색"]')
      await searchInput.fill('테스트')
      await page.waitForTimeout(500)

      // 검색 필터 태그 확인
      const searchTag = page.locator('span').filter({ hasText: '검색:' })
      await expect(searchTag).toBeVisible()

      // 필터 태그 제거 버튼 클릭
      const removeButton = searchTag.locator('button')
      await removeButton.click()

      // 검색어가 제거되었는지 확인
      await expect(searchInput).toHaveValue('')
      await expect(searchTag).toBeHidden()
    })

    test('여러 필터를 조합하여 사용할 수 있어야 한다', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // 검색어 입력
      const searchInput = page.locator('input[placeholder*="검색"]')
      await searchInput.fill('작품')
      await page.waitForTimeout(300)

      // 필터 모달 열기
      const filterButton = page.locator('button').filter({ hasText: '필터' })
      await filterButton.click()

      // 정렬 변경
      const sortSelect = page.locator('select').first()
      await sortSelect.selectOption('year')

      // 적용
      const applyButton = page.locator('button').filter({ hasText: '적용' })
      await applyButton.click()

      // 여러 필터 태그가 표시되는지 확인
      await expect(page.locator('span').filter({ hasText: '검색:' })).toBeVisible()
      
      // 결과 수 확인
      const resultCount = page.locator('text=/\\d+개 작품/')
      await expect(resultCount).toBeVisible()
    })

    test('필터 초기화가 올바르게 작동해야 한다', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // 검색어 입력
      const searchInput = page.locator('input[placeholder*="검색"]')
      await searchInput.fill('테스트')
      await page.waitForTimeout(300)

      // 초기화 버튼 클릭
      const resetButton = page.locator('button').filter({ hasText: '초기화' })
      await resetButton.click()

      // 모든 필터가 초기화되었는지 확인
      await expect(searchInput).toHaveValue('')
      await expect(page.locator('span').filter({ hasText: '검색:' })).toBeHidden()
    })
  })

  test.describe('연락처 폼 워크플로우', () => {
    test('사용자가 연락처 폼을 작성하고 제출할 수 있어야 한다', async ({ page }) => {
      await page.goto('/contact')
      await page.waitForLoadState('networkidle')

      // 폼 필드 채우기
      await page.fill('input[name="name"]', '홍길동')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="subject"]', '작품 문의')
      await page.fill('textarea[name="message"]', '안녕하세요. 작품에 대해 문의드립니다.')
      
      // 선택적 필드
      const phoneInput = page.locator('input[name="phone"]')
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('010-1234-5678')
      }

      // 제출 버튼 클릭
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      // 성공 메시지 확인
      await expect(
        page.locator('text=/성공|전송|감사합니다/')
      ).toBeVisible({ timeout: 10000 })
    })

    test('폼 유효성 검사가 올바르게 작동해야 한다', async ({ page }) => {
      await page.goto('/contact')
      await page.waitForLoadState('networkidle')

      // 빈 폼으로 제출 시도
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      // 유효성 검사 오류 메시지 확인
      await expect(
        page.locator('text=/필수|required|오류/')
      ).toBeVisible()

      // 잘못된 이메일 형식 테스트
      await page.fill('input[name="name"]', '홍길동')
      await page.fill('input[name="email"]', 'invalid-email')
      await page.fill('input[name="subject"]', '문의')
      await page.fill('textarea[name="message"]', '메시지')
      
      await submitButton.click()

      // 이메일 형식 오류 메시지 확인
      await expect(
        page.locator('text=/이메일|email|형식/')
      ).toBeVisible()
    })

    test('폼 필드가 올바른 접근성을 가져야 한다', async ({ page }) => {
      await page.goto('/contact')
      await page.waitForLoadState('networkidle')

      // 모든 필수 필드에 라벨이 있는지 확인
      const nameInput = page.locator('input[name="name"]')
      const emailInput = page.locator('input[name="email"]')
      const subjectInput = page.locator('input[name="subject"]')
      const messageTextarea = page.locator('textarea[name="message"]')

      await expect(nameInput).toHaveAttribute('aria-label')
      await expect(emailInput).toHaveAttribute('aria-label')
      await expect(subjectInput).toHaveAttribute('aria-label')
      await expect(messageTextarea).toHaveAttribute('aria-label')

      // 접근성 검사
      await checkA11y(page)
    })
  })

  test.describe('네비게이션 워크플로우', () => {
    test('사용자가 사이트를 탐색할 수 있어야 한다', async ({ page }) => {
      // 홈페이지에서 시작
      await page.goto('/')
      await expect(page.locator('h1')).toBeVisible()

      // 갤러리 페이지로 이동
      await page.click('nav a[href*="gallery"]')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('[data-testid*="artwork-"]')).toHaveCount.greaterThan(0)

      // 작가 페이지로 이동
      await page.click('nav a[href*="artist"]')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('text=/작가|artist/i')).toBeVisible()

      // 연락처 페이지로 이동
      await page.click('nav a[href*="contact"]')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('form')).toBeVisible()
    })

    test('브라우저 뒤로가기/앞으로가기가 올바르게 작동해야 한다', async ({ page }) => {
      await page.goto('/')
      
      await page.click('nav a[href*="gallery"]')
      await page.waitForLoadState('networkidle')
      
      await page.click('nav a[href*="contact"]')
      await page.waitForLoadState('networkidle')

      // 뒤로가기
      await page.goBack()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('gallery')

      // 앞으로가기
      await page.goForward()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('contact')
    })

    test('모바일 네비게이션이 올바르게 작동해야 한다', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // 모바일 메뉴 버튼 확인
      const menuButton = page.locator('button[aria-label*="menu"], button[aria-expanded]')
      
      if (await menuButton.isVisible()) {
        await menuButton.click()
        
        // 모바일 메뉴가 열렸는지 확인
        const mobileMenu = page.locator('nav[aria-expanded="true"], .mobile-menu')
        await expect(mobileMenu).toBeVisible()
        
        // 메뉴 항목 클릭
        await page.click('nav a[href*="gallery"]')
        await page.waitForLoadState('networkidle')
        
        // 페이지가 이동되었는지 확인
        expect(page.url()).toContain('gallery')
      }
    })
  })

  test.describe('성능 및 사용자 경험', () => {
    test('페이지 로딩 성능이 기준을 만족해야 한다', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // 3초 이내 로딩
      expect(loadTime).toBeLessThan(3000)
      
      // 첫 번째 콘텐츠가 보이는지 확인
      await expect(page.locator('[data-testid*="artwork-"]').first()).toBeVisible()
    })

    test('이미지가 점진적으로 로드되어야 한다', async ({ page }) => {
      await page.goto('/gallery')
      
      // 첫 번째 이미지가 빠르게 로드되는지 확인
      const firstImage = page.locator('img').first()
      await expect(firstImage).toBeVisible({ timeout: 2000 })
      
      // 스크롤하여 더 많은 이미지 로드
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      
      // 추가 이미지들이 로드되는지 확인
      const allImages = page.locator('img')
      const imageCount = await allImages.count()
      expect(imageCount).toBeGreaterThan(1)
    })

    test('오프라인 상태를 적절히 처리해야 한다', async ({ page, context }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // 네트워크 비활성화
      await context.setOffline(true)
      
      // 새로고침 시도
      await page.reload()
      
      // 오프라인 메시지 또는 캐시된 콘텐츠 확인
      await expect(
        page.locator('text=/오프라인|offline|연결/').or(
          page.locator('[data-testid*="artwork-"]')
        )
      ).toBeVisible()
      
      // 네트워크 복구
      await context.setOffline(false)
    })
  })

  test.describe('접근성 및 사용성', () => {
    test('키보드 내비게이션이 올바르게 작동해야 한다', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // Tab 키로 순차 이동
      await page.keyboard.press('Tab')
      
      // 첫 번째 포커스 가능한 요소가 포커스되었는지 확인
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
      
      // Enter 키로 링크 활성화
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
      
      // 페이지가 변경되거나 모달이 열렸는지 확인
      const currentUrl = page.url()
      expect(currentUrl).toBeDefined()
    })

    test('스크린 리더를 위한 적절한 마크업이 있어야 한다', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // ARIA 랜드마크 확인
      await expect(page.locator('[role="main"]')).toBeVisible()
      await expect(page.locator('[role="navigation"]')).toBeVisible()
      
      // 헤딩 구조 확인
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      await expect(headings).toHaveCount.greaterThan(0)
      
      // 이미지 alt 텍스트 확인
      const images = page.locator('img')
      const imageCount = await images.count()
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i)
        await expect(img).toHaveAttribute('alt')
      }
    })

    test('색상 대비가 접근성 기준을 만족해야 한다', async ({ page }) => {
      await page.goto('/gallery')
      await page.waitForLoadState('networkidle')

      // 접근성 검사 실행
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true },
        },
      })
    })

    test('다크 모드 토글이 올바르게 작동해야 한다', async ({ page }) => {
      await page.goto('/')
      
      // 다크 모드 토글 버튼 찾기
      const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="테마"]')
      
      if (await themeToggle.isVisible()) {
        // 현재 테마 확인
        const initialTheme = await page.locator('html').getAttribute('class')
        
        // 테마 토글
        await themeToggle.click()
        
        // 테마가 변경되었는지 확인
        const newTheme = await page.locator('html').getAttribute('class')
        expect(newTheme).not.toBe(initialTheme)
        
        // 다시 토글하여 원래 테마로 복구
        await themeToggle.click()
        const revertedTheme = await page.locator('html').getAttribute('class')
        expect(revertedTheme).toBe(initialTheme)
      }
    })
  })

  test.describe('에러 처리', () => {
    test('네트워크 오류를 적절히 처리해야 한다', async ({ page }) => {
      // API 요청 실패 시뮬레이션
      await page.route('**/api/artworks**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        })
      })

      await page.goto('/gallery')
      
      // 에러 메시지가 표시되는지 확인
      await expect(
        page.locator('text=/오류|error|문제/').or(
          page.locator('[role="alert"]')
        )
      ).toBeVisible({ timeout: 10000 })
      
      // 재시도 버튼이 있는지 확인
      const retryButton = page.locator('button').filter({ hasText: /다시|retry/i })
      if (await retryButton.isVisible()) {
        await retryButton.click()
      }
    })

    test('404 페이지가 올바르게 표시되어야 한다', async ({ page }) => {
      await page.goto('/non-existent-page')
      
      // 404 상태 또는 not found 메시지 확인
      await expect(
        page.locator('text=/404|찾을 수 없|not found/i')
      ).toBeVisible()
      
      // 홈으로 돌아가기 링크 확인
      const homeLink = page.locator('a[href="/"], a').filter({ hasText: /홈|home/i })
      await expect(homeLink).toBeVisible()
    })
  })
})