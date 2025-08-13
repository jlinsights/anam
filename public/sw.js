// 서비스 워커 버전 및 캐시 관리
const VERSION = '2.0.0'
const CACHE_NAME = `anam-gallery-v${VERSION}`
const STATIC_CACHE = `static-v${VERSION}`
const IMAGES_CACHE = `images-v${VERSION}`
const API_CACHE = `api-v${VERSION}`
const RUNTIME_CACHE = `runtime-v${VERSION}`

// 캐시 유효기간 (밀리초)
const CACHE_MAX_AGE = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7일
  API: 24 * 60 * 60 * 1000,        // 1일
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30일
  RUNTIME: 2 * 60 * 60 * 1000      // 2시간
}

// 캐시할 정적 자원들 (App Shell Pattern)
const STATIC_FILES = [
  '/',
  '/gallery',
  '/artist',
  '/offline',
  '/manifest.json',
  '/globals.css',
  '/favicon.ico'
]

// 우선순위 캐싱 (Core Resources)
const CRITICAL_RESOURCES = [
  '/api/artworks',
  '/api/artist',
  '/api/exhibitions'
]

// 이미지 파일 확장자 및 패턴
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif', '.bmp']
const IMAGE_QUALITY_REGEX = /(\?|&)(w|h|quality|format)=/

// Background Sync Tags
const SYNC_TAGS = {
  CONTACT_FORM: 'contact-form-sync',
  NEWSLETTER: 'newsletter-sync',
  CACHE_UPDATE: 'cache-update-sync'
}

// 설치 이벤트 - 필수 파일들을 캐시
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Installing version', VERSION)

  event.waitUntil(
    Promise.all([
      // Static files 캐싱
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static files')
        return cache.addAll(STATIC_FILES)
      }),
      // Critical API resources 캐싱
      caches.open(API_CACHE).then((cache) => {
        console.log('📦 Pre-caching critical API resources')
        return Promise.allSettled(
          CRITICAL_RESOURCES.map(url => 
            fetch(url)
              .then(response => response.ok ? cache.put(url, response) : null)
              .catch(error => console.warn('Failed to pre-cache:', url, error))
          )
        )
      })
    ])
    .then(() => {
      console.log('📦 Service Worker: Installation complete')
      // 즉시 활성화하여 업데이트 적용
      return self.skipWaiting()
    })
    .catch((error) => {
      console.error('📦 Service Worker: Installation failed', error)
    })
  )
})

// 활성화 이벤트 - 오래된 캐시 정리 및 최적화
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating version', VERSION)

  event.waitUntil(
    Promise.all([
      // 오래된 캐시 정리
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 현재 버전이 아닌 캐시 삭제
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== IMAGES_CACHE &&
              cacheName !== API_CACHE &&
              cacheName !== RUNTIME_CACHE
            ) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // 만료된 캐시 항목 정리
      cleanupExpiredCaches()
    ])
    .then(() => {
      console.log('🚀 Service Worker: Activation complete')
      // 모든 클라이언트에서 즉시 제어
      return self.clients.claim()
    })
    .then(() => {
      // 클라이언트에게 업데이트 알림
      return notifyClients({ type: 'SW_UPDATED', version: VERSION })
    })
  )
})

// Fetch 이벤트 - 고급 네트워크 요청 처리
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // POST 요청에 대한 Background Sync 처리
  if (request.method === 'POST') {
    if (url.pathname.includes('/contact') || url.pathname.includes('/newsletter')) {
      event.respondWith(handlePostRequest(request))
    }
    return
  }

  // GET 요청만 처리
  if (request.method !== 'GET') return

  // 외부 도메인 요청은 무시 (CDN 제외)
  if (url.origin !== location.origin && !isTrustedCDN(url.origin)) return

  // 요청 타입에 따른 스마트 캐싱 전략
  if (isImageRequest(request)) {
    // 이미지: Smart Cache with quality optimization
    event.respondWith(smartImageCacheStrategy(request))
  } else if (isStaticAsset(request)) {
    // 정적 자원: Cache First with freshness check
    event.respondWith(cacheFirstWithFreshnessStrategy(request, STATIC_CACHE))
  } else if (isAPIRequest(request)) {
    // API: Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request, API_CACHE))
  } else if (isPageRequest(request)) {
    // 페이지: Network First with offline fallback
    event.respondWith(networkFirstWithOfflineStrategy(request))
  } else {
    // 기타: Runtime caching
    event.respondWith(runtimeCacheStrategy(request))
  }
})

// 요청 타입 확인 헬퍼 함수들
function isImageRequest(request) {
  const url = new URL(request.url)
  return (
    IMAGE_EXTENSIONS.some((ext) => url.pathname.toLowerCase().includes(ext)) ||
    request.destination === 'image' ||
    url.pathname.includes('/images/') ||
    url.pathname.includes('/artwork/')
  )
}

function isStaticAsset(request) {
  const url = new URL(request.url)
  return (
    url.pathname.includes('/_next/') ||
    url.pathname.includes('/static/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ico')
  )
}

function isAPIRequest(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/')
}

function isPageRequest(request) {
  return (
    request.mode === 'navigate' ||
    (request.method === 'GET' &&
      request.headers.get('accept')?.includes('text/html'))
  )
}

function isTrustedCDN(origin) {
  const trustedCDNs = [
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ]
  return trustedCDNs.includes(origin)
}

// 고급 캐싱 전략들

// Smart Image Cache with Quality Optimization
async function smartImageCacheStrategy(request) {
  const url = new URL(request.url)
  const cache = await caches.open(IMAGES_CACHE)
  
  try {
    // 캐시에서 먼저 확인
    const cachedResponse = await cache.match(request)
    if (cachedResponse && !isExpired(cachedResponse, CACHE_MAX_AGE.IMAGES)) {
      console.log('💾 Image cache hit:', request.url)
      return cachedResponse
    }

    // 네트워크에서 가져오기
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // 이미지 최적화 헤더 추가
      const optimizedResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers),
          'Cache-Control': 'public, max-age=2592000', // 30일
          'X-Cache-Time': Date.now().toString()
        }
      })
      
      cache.put(request, optimizedResponse.clone())
      return optimizedResponse
    }
    
    // 캐시된 버전이 있으면 만료되어도 반환
    if (cachedResponse) return cachedResponse
    
    return createImagePlaceholder()
    
  } catch (error) {
    console.warn('Image cache failed:', error)
    const cachedResponse = await cache.match(request)
    return cachedResponse || createImagePlaceholder()
  }
}

// Cache First with Freshness Check
async function cacheFirstWithFreshnessStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  
  try {
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse && !isExpired(cachedResponse, CACHE_MAX_AGE.STATIC)) {
      console.log('💾 Fresh cache hit:', request.url)
      return cachedResponse
    }

    // Background update if cache is stale
    if (cachedResponse) {
      updateCacheInBackground(request, cache)
      return cachedResponse
    }

    // Network fallback
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const responseWithHeaders = addCacheHeaders(networkResponse.clone())
      cache.put(request, responseWithHeaders)
    }
    return networkResponse
    
  } catch (error) {
    const cachedResponse = await cache.match(request)
    return cachedResponse || createErrorResponse(request)
  }
}

// Stale While Revalidate for API
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  
  const cachedResponse = cache.match(request)
  const networkResponse = fetch(request)
    .then(response => {
      if (response.ok) {
        const responseWithHeaders = addCacheHeaders(response.clone())
        cache.put(request, responseWithHeaders)
      }
      return response
    })
    .catch(() => null)

  try {
    const cached = await cachedResponse
    if (cached && !isExpired(cached, CACHE_MAX_AGE.API)) {
      console.log('💾 SWR cache hit:', request.url)
      // Update in background
      networkResponse.catch(() => {})
      return cached
    }
    
    console.log('🌐 SWR network:', request.url)
    return await networkResponse || cached || createErrorResponse(request)
    
  } catch (error) {
    return (await cachedResponse) || createErrorResponse(request)
  }
}

// Network First with Offline Strategy
async function networkFirstWithOfflineStrategy(request) {
  try {
    console.log('🌐 Network first (page):', request.url)
    const networkResponse = await fetch(request, { timeout: 3000 })
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('💾 Network failed, trying cache:', request.url)
    
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Offline page fallback
    return (await cache.match('/offline')) || createOfflineResponse()
  }
}

// Runtime Cache Strategy
async function runtimeCacheStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  
  try {
    const cachedResponse = await cache.match(request)
    if (cachedResponse && !isExpired(cachedResponse, CACHE_MAX_AGE.RUNTIME)) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const responseWithHeaders = addCacheHeaders(networkResponse.clone())
      cache.put(request, responseWithHeaders)
    }
    
    return networkResponse
    
  } catch (error) {
    const cachedResponse = await cache.match(request)
    return cachedResponse || createErrorResponse(request)
  }
}

// 유틸리티 헬퍼 함수들
function isExpired(response, maxAge) {
  const cacheTime = response.headers.get('X-Cache-Time')
  if (!cacheTime) return true
  return Date.now() - parseInt(cacheTime) > maxAge
}

function addCacheHeaders(response) {
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers),
      'X-Cache-Time': Date.now().toString()
    }
  })
}

async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const responseWithHeaders = addCacheHeaders(response.clone())
      cache.put(request, responseWithHeaders)
    }
  } catch (error) {
    console.warn('Background cache update failed:', error)
  }
}

function createImagePlaceholder() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="100%" height="100%" fill="#f8f9fa"/>
      <g transform="translate(200, 150)">
        <circle cx="0" cy="-20" r="20" fill="#e9ecef"/>
        <rect x="-25" y="5" width="50" height="30" rx="4" fill="#e9ecef"/>
        <text x="0" y="55" text-anchor="middle" fill="#6c757d" font-family="Arial, sans-serif" font-size="14">
          이미지를 불러올 수 없습니다
        </text>
      </g>
    </svg>
  `
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' }
  })
}

function createErrorResponse(request) {
  if (isPageRequest(request)) {
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>오프라인</title></head>
        <body><h1>인터넷 연결을 확인해주세요</h1></body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 503
    })
  }
  
  return new Response(JSON.stringify({ error: '네트워크 오류' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 503
  })
}

function createOfflineResponse() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="utf-8">
        <title>오프라인 - 아남 서예 갤러리</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                 text-align: center; padding: 50px; color: #333; }
          h1 { color: #1a1a1a; }
          p { color: #666; line-height: 1.6; }
          .retry-btn { background: #1a1a1a; color: white; padding: 12px 24px; 
                       border: none; border-radius: 4px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>🎨 오프라인 상태</h1>
        <p>인터넷 연결이 끊어졌습니다.<br>연결을 확인한 후 다시 시도해주세요.</p>
        <button class="retry-btn" onclick="window.location.reload()">다시 시도</button>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    status: 503
  })
}

async function cleanupExpiredCaches() {
  const cacheNames = [STATIC_CACHE, IMAGES_CACHE, API_CACHE, RUNTIME_CACHE]
  
  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      
      for (const request of requests) {
        const response = await cache.match(request)
        if (response && isExpired(response, CACHE_MAX_AGE.STATIC)) {
          await cache.delete(request)
        }
      }
    } catch (error) {
      console.warn('Cache cleanup failed for:', cacheName, error)
    }
  }
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll()
  clients.forEach(client => client.postMessage(message))
}

// POST 요청 처리 (Background Sync용)
async function handlePostRequest(request) {
  try {
    const response = await fetch(request.clone())
    if (response.ok) {
      return response
    }
    throw new Error('Network request failed')
    
  } catch (error) {
    // 오프라인이거나 요청 실패 시 Background Sync 등록
    console.log('📤 Queueing request for background sync')
    
    const formData = await request.formData()
    const data = Object.fromEntries(formData)
    
    // IndexedDB에 저장 (실제 구현에서는 더 복잡한 큐 시스템 필요)
    await storeFailedRequest({
      url: request.url,
      method: request.method,
      data,
      timestamp: Date.now()
    })
    
    // Background Sync 등록
    await self.registration.sync.register(SYNC_TAGS.CONTACT_FORM)
    
    return new Response(JSON.stringify({ 
      success: false,
      message: '요청이 대기열에 추가되었습니다. 연결이 복구되면 자동으로 전송됩니다.'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 202
    })
  }
}

// 간단한 IndexedDB 저장 함수 (실제로는 더 복잡한 구현 필요)
async function storeFailedRequest(requestData) {
  // 실제 구현에서는 IndexedDB 사용
  console.log('Storing failed request:', requestData)
}

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync event:', event.tag)
  
  switch (event.tag) {
    case SYNC_TAGS.CONTACT_FORM:
      event.waitUntil(syncContactForm())
      break
    case SYNC_TAGS.NEWSLETTER:
      event.waitUntil(syncNewsletter())
      break
    case SYNC_TAGS.CACHE_UPDATE:
      event.waitUntil(updateCriticalResources())
      break
    default:
      console.log('Unknown sync tag:', event.tag)
  }
})

async function syncContactForm() {
  console.log('🔄 Syncing contact forms')
  // 실제 구현에서는 IndexedDB에서 대기 중인 요청들을 처리
}

async function syncNewsletter() {
  console.log('🔄 Syncing newsletter subscriptions')
  // 실제 구현에서는 IndexedDB에서 대기 중인 구독 요청들을 처리
}

async function updateCriticalResources() {
  console.log('🔄 Updating critical resources')
  const cache = await caches.open(API_CACHE)
  
  for (const url of CRITICAL_RESOURCES) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        await cache.put(url, response)
      }
    } catch (error) {
      console.warn('Failed to update critical resource:', url, error)
    }
  }
}

// 고급 푸시 알림 시스템
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received')
  
  if (!event.data) {
    console.warn('Push event without data')
    return
  }

  try {
    const data = event.data.json()
    const notificationOptions = createNotificationOptions(data)
    
    event.waitUntil(
      self.registration.showNotification(data.title || '아남 서예 갤러리', notificationOptions)
    )
  } catch (error) {
    console.error('Push notification error:', error)
  }
})

function createNotificationOptions(data) {
  const baseOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || Date.now(),
      url: data.url || '/gallery'
    },
    requireInteraction: data.urgent || false,
    silent: data.silent || false
  }

  switch (data.type) {
    case 'exhibition':
      return {
        ...baseOptions,
        body: data.body || '새로운 전시회가 열렸습니다.',
        tag: 'exhibition',
        renotify: true,
        actions: [
          {
            action: 'view_exhibition',
            title: '전시회 보기',
            icon: '/icons/icon-96x96.png'
          },
          {
            action: 'dismiss',
            title: '나중에 보기'
          }
        ]
      }
      
    case 'artwork':
      return {
        ...baseOptions,
        body: data.body || '새로운 작품이 추가되었습니다.',
        tag: 'artwork',
        image: data.image,
        actions: [
          {
            action: 'view_artwork',
            title: '작품 보기',
            icon: '/icons/icon-96x96.png'
          },
          {
            action: 'share',
            title: '공유하기'
          }
        ]
      }
      
    case 'news':
      return {
        ...baseOptions,
        body: data.body || '새로운 소식이 있습니다.',
        tag: 'news',
        actions: [
          {
            action: 'read_news',
            title: '자세히 보기'
          },
          {
            action: 'dismiss',
            title: '닫기'
          }
        ]
      }
      
    default:
      return {
        ...baseOptions,
        body: data.body || '아남 서예 갤러리에서 새로운 소식이 있습니다.',
        tag: 'general',
        actions: [
          {
            action: 'open_app',
            title: '갤러리 열기'
          }
        ]
      }
  }
}

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event.action)
  
  event.notification.close()
  
  const notificationData = event.notification.data
  const action = event.action
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        const targetUrl = getTargetUrl(action, notificationData)
        
        // 이미 열린 탭이 있는지 확인
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // 새 탭에서 열기
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
  )
})

function getTargetUrl(action, data) {
  const baseUrl = data.url || '/'
  
  switch (action) {
    case 'view_exhibition':
      return '/exhibitions'
    case 'view_artwork':
      return data.artworkUrl || '/gallery'
    case 'read_news':
      return data.newsUrl || '/news'
    case 'share':
      // 공유 기능은 Web Share API 사용
      if (navigator.share) {
        navigator.share({
          title: data.title,
          text: data.body,
          url: data.shareUrl || baseUrl
        })
      }
      return baseUrl
    case 'open_app':
    case 'dismiss':
    default:
      return baseUrl
  }
}

// 알림 닫기 처리
self.addEventListener('notificationclose', (event) => {
  console.log('📱 Notification closed:', event.notification.tag)
  
  // 알림 상호작용 추적 (옵션)
  trackNotificationInteraction('closed', event.notification.data)
})

// 알림 상호작용 추적 (선택사항)
async function trackNotificationInteraction(action, data) {
  try {
    // 실제 구현에서는 분석 API로 전송
    console.log('📊 Notification interaction:', { action, data })
  } catch (error) {
    console.warn('Failed to track notification interaction:', error)
  }
}

// 주기적 백그라운드 동기화 (Periodic Background Sync)
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic background sync:', event.tag)
  
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContentInBackground())
  }
})

async function syncContentInBackground() {
  console.log('🔄 Syncing content in background')
  
  try {
    // 새로운 작품이나 전시회 정보 확인
    const response = await fetch('/api/latest-updates')
    if (response.ok) {
      const updates = await response.json()
      
      // 캐시 업데이트
      const cache = await caches.open(API_CACHE)
      cache.put('/api/latest-updates', response.clone())
      
      // 중요한 업데이트가 있으면 알림 전송
      if (updates.hasImportantUpdates) {
        await showUpdateNotification(updates)
      }
    }
  } catch (error) {
    console.warn('Background content sync failed:', error)
  }
}

async function showUpdateNotification(updates) {
  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    self.registration.showNotification('새로운 소식', {
      body: '갤러리에 새로운 콘텐츠가 추가되었습니다.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'content-update',
      data: { url: '/gallery', type: 'update' }
    })
  }
}
