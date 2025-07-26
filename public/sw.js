// 서비스 워커 버전
const CACHE_NAME = 'calligraphy-catalog-v1.0.0'
const STATIC_CACHE = 'static-v1.0.0'
const IMAGES_CACHE = 'images-v1.0.0'
const API_CACHE = 'api-v1.0.0'

// 캐시할 정적 자원들
const STATIC_FILES = [
  '/',
  '/gallery',
  '/manifest.json',
  '/globals.css',
  // 오프라인 페이지
  '/offline'
]

// 이미지 파일 확장자
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']

// 설치 이벤트 - 필수 파일들을 캐시
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('📦 Service Worker: Installation complete')
        // 즉시 활성화
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('📦 Service Worker: Installation failed', error)
      })
  )
})

// 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 현재 버전이 아닌 캐시 삭제
            if (cacheName !== STATIC_CACHE && 
                cacheName !== IMAGES_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('🚀 Service Worker: Activation complete')
        // 모든 클라이언트에서 즉시 제어
        return self.clients.claim()
      })
  )
})

// Fetch 이벤트 - 네트워크 요청 처리
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // GET 요청만 처리
  if (request.method !== 'GET') return
  
  // 외부 도메인 요청은 무시
  if (url.origin !== location.origin) return
  
  // 요청 타입에 따른 캐시 전략
  if (isImageRequest(request)) {
    // 이미지: Cache First (캐시 우선)
    event.respondWith(cacheFirstStrategy(request, IMAGES_CACHE))
  } else if (isStaticAsset(request)) {
    // 정적 자원: Cache First
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
  } else if (isPageRequest(request)) {
    // 페이지: Network First (네트워크 우선)
    event.respondWith(networkFirstStrategy(request, STATIC_CACHE))
  } else {
    // 기타: Network First
    event.respondWith(networkFirstStrategy(request, API_CACHE))
  }
})

// 이미지 요청 확인
function isImageRequest(request) {
  const url = new URL(request.url)
  return IMAGE_EXTENSIONS.some(ext => url.pathname.includes(ext)) ||
         request.destination === 'image'
}

// 정적 자원 확인
function isStaticAsset(request) {
  const url = new URL(request.url)
  return url.pathname.includes('/_next/') ||
         url.pathname.includes('/static/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.woff2')
}

// 페이지 요청 확인
function isPageRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'))
}

// Cache First 전략 (캐시 우선)
async function cacheFirstStrategy(request, cacheName) {
  try {
    // 캐시에서 먼저 찾기
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      console.log('💾 Cache hit:', request.url)
      return cachedResponse
    }
    
    // 캐시에 없으면 네트워크에서 가져오기
    console.log('🌐 Cache miss, fetching:', request.url)
    const networkResponse = await fetch(request)
    
    // 성공적인 응답만 캐시
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ Cache first strategy failed:', error)
    
    // 이미지 요청 실패 시 placeholder 반환
    if (isImageRequest(request)) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="currentColor"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">이미지를 로드할 수 없습니다</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      )
    }
    
    // 페이지 요청 실패 시 오프라인 페이지
    if (isPageRequest(request)) {
      const cache = await caches.open(STATIC_CACHE)
      return cache.match('/offline') || new Response('오프라인 상태입니다', {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }
    
    throw error
  }
}

// Network First 전략 (네트워크 우선)
async function networkFirstStrategy(request, cacheName) {
  try {
    // 네트워크에서 먼저 시도
    console.log('🌐 Network first:', request.url)
    const networkResponse = await fetch(request)
    
    // 성공적인 응답은 캐시에 저장
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('💾 Network failed, trying cache:', request.url)
    
    // 네트워크 실패 시 캐시에서 찾기
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // 캐시에도 없으면 오프라인 페이지
    if (isPageRequest(request)) {
      return cache.match('/offline') || new Response('오프라인 상태입니다', {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      })
    }
    
    throw error
  }
}

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  console.log('🔄 Background sync triggered')
  // 여기에 백그라운드에서 처리할 작업 추가
}

// 푸시 알림 (선택사항)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: '작품 보기',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'close',
          title: '닫기'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/gallery')
    )
  }
}) 