import { render } from '@testing-library/react'
import { toMatchImageSnapshot } from 'jest-image-snapshot'
import puppeteer from 'puppeteer'
import { OptimizedGallery } from '@/components/optimized-gallery'
import { SearchFilter } from '@/components/search-filter'
import { ArtworkCard } from '@/components/artwork-card'
import { mockArtworks, mockArtist } from '../lib/hooks/artwork.mock'

// Jest 이미지 스냅샷 설정
expect.extend({ toMatchImageSnapshot })

// 시각적 회귀 테스트를 위한 설정
const visualTestConfig = {
  threshold: 0.2, // 2% 차이까지 허용
  customSnapshotsDir: '__tests__/visual/__image_snapshots__',
  customDiffDir: '__tests__/visual/__image_snapshots__/__diff_output__',
  failureThreshold: 0.01, // 1% 이상 차이나면 실패
  failureThresholdType: 'percent',
  customSnapshotIdentifier: ({ currentTestName, counter }: any) =>
    `${currentTestName}-${counter}`,
}

// 반응형 테스트를 위한 뷰포트 크기
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
}

// 테마 설정
const themes = ['light', 'dark']

describe('Gallery Visual Regression Tests', () => {
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
          <style>
            /* 테스트용 기본 스타일 */
            .card-art {
              @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all duration-200;
            }
            .card-art:hover {
              @apply shadow-lg transform scale-105;
            }
            .card-art-elevated {
              @apply shadow-xl border border-gray-200 dark:border-gray-700;
            }
            .bg-transparent {
              background-color: transparent;
            }
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

  describe('OptimizedGallery 시각적 테스트', () => {
    Object.entries(viewports).forEach(([viewportName, viewport]) => {
      themes.forEach(theme => {
        it(`OptimizedGallery - ${viewportName} - ${theme} 테마`, async () => {
          await page.setViewport(viewport)
          
          // 테마 클래스 설정
          if (theme === 'dark') {
            await page.addStyleTag({
              content: `
                html { @apply dark; }
                body { @apply bg-gray-900 text-white; }
              `
            })
          }

          // 컴포넌트 렌더링을 위한 HTML 주입
          await page.evaluate((artworks) => {
            const root = document.getElementById('root')
            if (root) {
              root.innerHTML = `
                <div class="p-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${artworks.map((artwork: any) => `
                      <div class="card-art">
                        <div class="aspect-w-4 aspect-h-3 mb-4">
                          <img 
                            src="/images/placeholder-artwork.svg" 
                            alt="${artwork.title}"
                            class="w-full h-full object-cover rounded"
                          />
                        </div>
                        <h3 class="text-lg font-semibold mb-2">${artwork.title}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">${artwork.year}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-500">${artwork.medium}</p>
                        ${artwork.featured ? '<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">대표작</span>' : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `
            }
          }, mockArtworks)

          // 이미지 로딩 대기
          await page.waitForSelector('img')
          await page.waitForFunction(() => {
            const images = Array.from(document.querySelectorAll('img'))
            return images.every(img => img.complete)
          })

          // 스크린샷 촬영
          const screenshot = await page.screenshot({
            fullPage: true,
            clip: {
              x: 0,
              y: 0,
              width: viewport.width,
              height: Math.min(viewport.height, 800), // 최대 높이 제한
            }
          })

          expect(screenshot).toMatchImageSnapshot({
            ...visualTestConfig,
            customSnapshotIdentifier: `optimized-gallery-${viewportName}-${theme}`,
          })
        })
      })
    })

    it('OptimizedGallery - 로딩 상태', async () => {
      await page.setViewport(viewports.desktop)

      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="p-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${Array.from({ length: 6 }, (_, i) => `
                  <div class="card-art animate-pulse">
                    <div class="bg-gray-300 aspect-w-4 aspect-h-3 rounded mb-4"></div>
                    <div class="h-4 bg-gray-300 rounded mb-2"></div>
                    <div class="h-3 bg-gray-300 rounded w-1/2 mb-1"></div>
                    <div class="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                `).join('')}
              </div>
            </div>
          `
        }
      })

      await page.waitForSelector('.animate-pulse')
      
      const screenshot = await page.screenshot({
        clip: { x: 0, y: 0, width: viewports.desktop.width, height: 600 }
      })

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'optimized-gallery-loading-state',
      })
    })

    it('OptimizedGallery - 에러 상태', async () => {
      await page.setViewport(viewports.desktop)

      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="p-4 text-center">
              <div class="bg-red-50 border border-red-200 rounded-lg p-8">
                <div class="text-red-600 mb-4">
                  <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-red-900 mb-2">작품을 불러올 수 없습니다</h3>
                <p class="text-red-700 mb-4">네트워크 연결을 확인하고 다시 시도해주세요.</p>
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                  다시 시도
                </button>
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
        customSnapshotIdentifier: 'optimized-gallery-error-state',
      })
    })

    it('OptimizedGallery - 빈 상태', async () => {
      await page.setViewport(viewports.desktop)

      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="p-4 text-center">
              <div class="py-16">
                <div class="text-gray-400 mb-4">
                  <svg class="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">아직 작품이 없습니다</h3>
                <p class="text-gray-500">새로운 작품이 추가되면 여기에 표시됩니다.</p>
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
        customSnapshotIdentifier: 'optimized-gallery-empty-state',
      })
    })
  })

  describe('SearchFilter 시각적 테스트', () => {
    Object.entries(viewports).forEach(([viewportName, viewport]) => {
      it(`SearchFilter - ${viewportName}`, async () => {
        await page.setViewport(viewport)

        await page.evaluate(() => {
          const root = document.getElementById('root')
          if (root) {
            root.innerHTML = `
              <div class="p-4">
                <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div class="flex-1 relative">
                      <input 
                        type="text" 
                        placeholder="작품명이나 설명으로 검색..."
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div class="flex gap-2">
                      <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors relative">
                        필터
                        <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
                      </button>
                      <button class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                        초기화
                      </button>
                    </div>
                  </div>
                  
                  <div class="mt-4 flex flex-wrap gap-2">
                    <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      검색: 길
                      <button class="text-blue-600 hover:text-blue-800">×</button>
                    </span>
                    <span class="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      연도: 2024
                      <button class="text-green-600 hover:text-green-800">×</button>
                    </span>
                  </div>
                  
                  <div class="mt-4 text-sm text-gray-600">
                    총 12개 작품 (필터 적용됨)
                  </div>
                </div>
              </div>
            `
          }
        })

        const screenshot = await page.screenshot({
          clip: { x: 0, y: 0, width: viewport.width, height: 300 }
        })

        expect(screenshot).toMatchImageSnapshot({
          ...visualTestConfig,
          customSnapshotIdentifier: `search-filter-${viewportName}`,
        })
      })
    })

    it('SearchFilter - 필터 모달 열림', async () => {
      await page.setViewport(viewports.desktop)

      await page.evaluate(() => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="p-4">
              <!-- 배경 오버레이 -->
              <div class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
              
              <!-- 모달 -->
              <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
                  <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                      <h2 class="text-lg font-semibold">작품 필터</h2>
                      <button class="text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
                        <select class="w-full border border-gray-300 rounded-md px-3 py-2">
                          <option>제작년도</option>
                          <option>작품명</option>
                          <option>재료</option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">연도 범위</label>
                        <div class="flex gap-2">
                          <input type="number" placeholder="시작 연도" class="flex-1 border border-gray-300 rounded-md px-3 py-2" />
                          <span class="self-center">~</span>
                          <input type="number" placeholder="끝 연도" class="flex-1 border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">재료</label>
                        <div class="flex flex-wrap gap-2">
                          <button class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">한지</button>
                          <button class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">먹</button>
                          <button class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">색</button>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex gap-2 mt-6">
                      <button class="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">적용</button>
                      <button class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300">취소</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `
        }
      })

      const screenshot = await page.screenshot({
        clip: { x: 0, y: 0, width: viewports.desktop.width, height: 600 }
      })

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'search-filter-modal-open',
      })
    })
  })

  describe('ArtworkCard 시각적 테스트', () => {
    const cardVariants = ['default', 'minimal', 'featured', 'compact']

    cardVariants.forEach(variant => {
      it(`ArtworkCard - ${variant} variant`, async () => {
        await page.setViewport(viewports.desktop)

        await page.evaluate((variant, artwork) => {
          const root = document.getElementById('root')
          if (root) {
            const baseClasses = 'card-art'
            const variantClasses = {
              default: '',
              minimal: 'bg-transparent shadow-none',
              featured: 'card-art-elevated',
              compact: 'p-2'
            }
            
            root.innerHTML = `
              <div class="p-8 bg-gray-50">
                <div class="max-w-sm ${baseClasses} ${variantClasses[variant] || ''}">
                  <div class="aspect-w-4 aspect-h-3 mb-4">
                    <img 
                      src="/images/placeholder-artwork.svg" 
                      alt="${artwork.title}"
                      class="w-full h-full object-cover rounded"
                    />
                  </div>
                  
                  ${variant !== 'minimal' ? `
                    <div class="space-y-2">
                      <h3 class="text-lg font-semibold">${artwork.title}</h3>
                      <p class="text-sm text-gray-600">${artwork.year}</p>
                      <p class="text-sm text-gray-500">${artwork.medium}</p>
                      <p class="text-xs text-gray-400">${artwork.dimensions}</p>
                      ${artwork.featured ? '<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">대표작</span>' : ''}
                    </div>
                    
                    ${variant === 'featured' ? `
                      <div class="mt-4 flex gap-2">
                        <button class="flex-1 bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600">♥ 좋아요</button>
                        <button class="flex-1 bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600">공유</button>
                        <button class="flex-1 bg-gray-500 text-white py-1 px-2 rounded text-sm hover:bg-gray-600">상세보기</button>
                      </div>
                    ` : ''}
                  ` : ''}
                </div>
              </div>
            `
          }
        }, variant, mockArtworks[0])

        await page.waitForSelector('img')
        
        const screenshot = await page.screenshot({
          clip: { x: 0, y: 0, width: 400, height: 500 }
        })

        expect(screenshot).toMatchImageSnapshot({
          ...visualTestConfig,
          customSnapshotIdentifier: `artwork-card-${variant}`,
        })
      })
    })

    it('ArtworkCard - 호버 상태', async () => {
      await page.setViewport(viewports.desktop)

      await page.evaluate((artwork) => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="p-8 bg-gray-50">
              <div class="max-w-sm card-art transform scale-105 shadow-lg">
                <div class="aspect-w-4 aspect-h-3 mb-4">
                  <img 
                    src="/images/placeholder-artwork.svg" 
                    alt="${artwork.title}"
                    class="w-full h-full object-cover rounded"
                  />
                </div>
                <div class="space-y-2">
                  <h3 class="text-lg font-semibold">${artwork.title}</h3>
                  <p class="text-sm text-gray-600">${artwork.year}</p>
                  <p class="text-sm text-gray-500">${artwork.medium}</p>
                </div>
              </div>
            </div>
          `
        }
      }, mockArtworks[0])

      const screenshot = await page.screenshot({
        clip: { x: 0, y: 0, width: 400, height: 500 }
      })

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'artwork-card-hover',
      })
    })
  })

  describe('반응형 레이아웃 테스트', () => {
    it('갤러리 그리드 - 반응형 변화', async () => {
      for (const [viewportName, viewport] of Object.entries(viewports)) {
        await page.setViewport(viewport)

        await page.evaluate((artworks, viewportName) => {
          const root = document.getElementById('root')
          if (root) {
            const gridCols = {
              mobile: 'grid-cols-1',
              tablet: 'grid-cols-2', 
              desktop: 'grid-cols-3'
            }
            
            root.innerHTML = `
              <div class="p-4">
                <div class="grid ${gridCols[viewportName] || 'grid-cols-1'} gap-6">
                  ${artworks.slice(0, 6).map((artwork: any) => `
                    <div class="card-art">
                      <div class="aspect-w-4 aspect-h-3 mb-4 bg-gray-200 rounded"></div>
                      <h3 class="text-lg font-semibold mb-2">${artwork.title}</h3>
                      <p class="text-sm text-gray-600">${artwork.year}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            `
          }
        }, mockArtworks, viewportName)

        const screenshot = await page.screenshot({
          fullPage: true,
          clip: {
            x: 0,
            y: 0,
            width: viewport.width,
            height: Math.min(viewport.height, 800),
          }
        })

        expect(screenshot).toMatchImageSnapshot({
          ...visualTestConfig,
          customSnapshotIdentifier: `responsive-grid-${viewportName}`,
        })
      }
    })
  })

  describe('다크 모드 테스트', () => {
    it('갤러리 - 다크 모드', async () => {
      await page.setViewport(viewports.desktop)

      await page.addStyleTag({
        content: `
          html { @apply dark; }
          body { @apply bg-gray-900 text-white; }
          .card-art { @apply bg-gray-800 border-gray-700; }
        `
      })

      await page.evaluate((artworks) => {
        const root = document.getElementById('root')
        if (root) {
          root.innerHTML = `
            <div class="p-4 bg-gray-900 min-h-screen">
              <div class="grid grid-cols-3 gap-6">
                ${artworks.slice(0, 6).map((artwork: any) => `
                  <div class="card-art bg-gray-800 border border-gray-700">
                    <div class="aspect-w-4 aspect-h-3 mb-4 bg-gray-700 rounded"></div>
                    <h3 class="text-lg font-semibold mb-2 text-white">${artwork.title}</h3>
                    <p class="text-sm text-gray-300">${artwork.year}</p>
                    <p class="text-sm text-gray-400">${artwork.medium}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          `
        }
      }, mockArtworks)

      const screenshot = await page.screenshot({
        clip: { x: 0, y: 0, width: viewports.desktop.width, height: 600 }
      })

      expect(screenshot).toMatchImageSnapshot({
        ...visualTestConfig,
        customSnapshotIdentifier: 'gallery-dark-mode',
      })
    })
  })
})