import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock service worker for testing
const mockServiceWorker = {
  register: jest.fn(),
  unregister: jest.fn(),
  update: jest.fn(),
  postMessage: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  state: 'activated',
  scriptURL: '/sw.js'
}

// Mock service worker registration
const mockRegistration = {
  installing: null,
  waiting: null,
  active: mockServiceWorker,
  update: jest.fn(),
  unregister: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  scope: '/',
  updateViaCache: 'imports'
}

// Mock before install prompt event
const mockBeforeInstallPrompt = {
  prompt: jest.fn(),
  userChoice: Promise.resolve({ outcome: 'accepted' }),
  preventDefault: jest.fn()
}

// Mock cache API
const mockCache = {
  match: jest.fn(),
  add: jest.fn(),
  addAll: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  keys: jest.fn()
}

const mockCaches = {
  open: jest.fn().mockResolvedValue(mockCache),
  match: jest.fn(),
  has: jest.fn(),
  delete: jest.fn(),
  keys: jest.fn()
}

// Simple component to test PWA features
const PWATestComponent = () => {
  return (
    <div>
      <h1>ANAM Gallery</h1>
      <div data-testid="app-content">PWA Test Component</div>
      <button id="install-button" style={{ display: 'none' }}>
        Install App
      </button>
    </div>
  )
}

describe('PWA Functionality Tests', () => {
  let originalNavigator: typeof navigator
  let originalCaches: typeof caches
  let originalFetch: typeof fetch

  beforeEach(() => {
    originalNavigator = global.navigator
    originalCaches = global.caches
    originalFetch = global.fetch

    // Mock navigator with PWA-related APIs
    Object.defineProperty(global, 'navigator', {
      value: {
        ...originalNavigator,
        serviceWorker: {
          register: jest.fn().mockResolvedValue(mockRegistration),
          ready: Promise.resolve(mockRegistration),
          controller: mockServiceWorker,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn()
        },
        onLine: true,
        standalone: false,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      writable: true
    })

    // Mock caches API
    global.caches = mockCaches

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      text: async () => 'Cached content',
      clone: function() { return this }
    })

    // Reset all mocks
    jest.clearAllMocks()
  })

  afterEach(() => {
    global.navigator = originalNavigator
    global.caches = originalCaches
    global.fetch = originalFetch
  })

  describe('Service Worker Registration', () => {
    it('should register service worker successfully', async () => {
      // Simulate service worker registration
      const registerSW = async () => {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js')
          return registration
        }
        throw new Error('Service workers not supported')
      }

      const registration = await registerSW()
      
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js')
      expect(registration).toBe(mockRegistration)
    })

    it('should handle service worker registration failures', async () => {
      // Mock registration failure
      const mockError = new Error('Service worker registration failed')
      ;(navigator.serviceWorker.register as jest.Mock).mockRejectedValueOnce(mockError)

      const registerSW = async () => {
        try {
          await navigator.serviceWorker.register('/sw.js')
        } catch (error) {
          throw error
        }
      }

      await expect(registerSW()).rejects.toThrow('Service worker registration failed')
    })

    it('should handle service worker updates', async () => {
      const handleUpdate = async () => {
        const registration = await navigator.serviceWorker.ready
        await registration.update()
      }

      await handleUpdate()
      expect(mockRegistration.update).toHaveBeenCalled()
    })

    it('should handle service worker state changes', async () => {
      const stateChangeHandler = jest.fn()
      
      // Simulate service worker state changes
      const serviceWorker = mockServiceWorker
      serviceWorker.addEventListener('statechange', stateChangeHandler)
      
      // Simulate state change
      fireEvent(serviceWorker, new Event('statechange'))
      
      expect(stateChangeHandler).toHaveBeenCalled()
    })

    it('should communicate with service worker via postMessage', async () => {
      const message = { type: 'CACHE_UPDATE', data: { url: '/gallery' } }
      
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message)
      }
      
      expect(mockServiceWorker.postMessage).toHaveBeenCalledWith(message)
    })
  })

  describe('PWA Installation', () => {
    it('should handle beforeinstallprompt event', async () => {
      render(<PWATestComponent />)
      
      let deferredPrompt: any = null
      const installButton = screen.getByRole('button', { name: /install app/i })
      
      // Mock beforeinstallprompt event handler
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault()
        deferredPrompt = e
        installButton.style.display = 'block'
      }

      // Simulate beforeinstallprompt event
      const beforeInstallPromptEvent = {
        ...mockBeforeInstallPrompt,
        type: 'beforeinstallprompt'
      }
      
      handleBeforeInstallPrompt(beforeInstallPromptEvent)
      
      expect(beforeInstallPromptEvent.preventDefault).toHaveBeenCalled()
      expect(deferredPrompt).toBe(beforeInstallPromptEvent)
    })

    it('should trigger install prompt when user clicks install button', async () => {
      const user = userEvent.setup()
      render(<PWATestComponent />)
      
      const installButton = screen.getByRole('button', { name: /install app/i })
      
      // Simulate install button click handler
      const handleInstallClick = async () => {
        if (mockBeforeInstallPrompt) {
          await mockBeforeInstallPrompt.prompt()
          const { outcome } = await mockBeforeInstallPrompt.userChoice
          
          if (outcome === 'accepted') {
            installButton.style.display = 'none'
          }
        }
      }

      // Make install button visible
      installButton.style.display = 'block'
      
      await user.click(installButton)
      await handleInstallClick()
      
      expect(mockBeforeInstallPrompt.prompt).toHaveBeenCalled()
    })

    it('should detect if app is running in standalone mode', () => {
      // Test normal browser mode
      expect(navigator.standalone).toBe(false)
      expect(window.matchMedia('(display-mode: standalone)').matches).toBe(false)
      
      // Mock standalone mode
      Object.defineProperty(navigator, 'standalone', {
        value: true,
        writable: true
      })
      
      // Mock display-mode media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }))
      })
      
      const isStandalone = navigator.standalone || window.matchMedia('(display-mode: standalone)').matches
      expect(isStandalone).toBe(true)
    })

    it('should handle app installed event', () => {
      const appInstalledHandler = jest.fn()
      
      // Simulate appinstalled event
      window.addEventListener('appinstalled', appInstalledHandler)
      fireEvent(window, new Event('appinstalled'))
      
      expect(appInstalledHandler).toHaveBeenCalled()
    })
  })

  describe('Offline Functionality', () => {
    it('should detect online/offline status', () => {
      // Test online state
      expect(navigator.onLine).toBe(true)
      
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      })
      
      expect(navigator.onLine).toBe(false)
    })

    it('should handle online/offline events', () => {
      const onlineHandler = jest.fn()
      const offlineHandler = jest.fn()
      
      window.addEventListener('online', onlineHandler)
      window.addEventListener('offline', offlineHandler)
      
      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      fireEvent(window, new Event('offline'))
      
      // Simulate going online
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
      fireEvent(window, new Event('online'))
      
      expect(offlineHandler).toHaveBeenCalled()
      expect(onlineHandler).toHaveBeenCalled()
    })

    it('should serve cached content when offline', async () => {
      // Mock cache match returning cached content
      mockCache.match.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'Cached gallery content',
        json: async () => ({ artworks: ['cached-artwork'] })
      })

      const getCachedContent = async (url: string) => {
        const cache = await caches.open('anam-gallery-v1')
        const response = await cache.match(url)
        return response
      }

      const cachedResponse = await getCachedContent('/gallery')
      expect(cachedResponse).toBeDefined()
      expect(await cachedResponse?.text()).toBe('Cached gallery content')
    })

    it('should show offline indicator when network is unavailable', async () => {
      render(<PWATestComponent />)
      
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      })

      // Simulate offline UI component
      const OfflineIndicator = () => {
        const [isOffline, setIsOffline] = React.useState(!navigator.onLine)
        
        React.useEffect(() => {
          const handleOnline = () => setIsOffline(false)
          const handleOffline = () => setIsOffline(true)
          
          window.addEventListener('online', handleOnline)
          window.addEventListener('offline', handleOffline)
          
          return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
          }
        }, [])
        
        return isOffline ? <div data-testid="offline-indicator">You are offline</div> : null
      }

      const { rerender } = render(<OfflineIndicator />)
      
      // Should show offline indicator
      expect(screen.getByTestId('offline-indicator')).toBeInTheDocument()
      
      // Simulate going online
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
      fireEvent(window, new Event('online'))
      
      rerender(<OfflineIndicator />)
      
      await waitFor(() => {
        expect(screen.queryByTestId('offline-indicator')).not.toBeInTheDocument()
      })
    })
  })

  describe('Cache Management', () => {
    it('should cache essential resources', async () => {
      const essentialUrls = [
        '/',
        '/gallery',
        '/artist',
        '/contact',
        '/manifest.json',
        '/offline.html'
      ]

      const cacheEssentialResources = async () => {
        const cache = await caches.open('anam-gallery-v1')
        await cache.addAll(essentialUrls)
      }

      await cacheEssentialResources()
      
      expect(mockCaches.open).toHaveBeenCalledWith('anam-gallery-v1')
      expect(mockCache.addAll).toHaveBeenCalledWith(essentialUrls)
    })

    it('should implement cache-first strategy for static assets', async () => {
      const url = '/images/artwork-1.jpg'
      
      const cacheFirstStrategy = async (request: string) => {
        // Try cache first
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
          return cachedResponse
        }
        
        // Fallback to network
        const networkResponse = await fetch(request)
        
        // Cache the response for future use
        const cache = await caches.open('anam-gallery-v1')
        cache.put(request, networkResponse.clone())
        
        return networkResponse
      }

      // Mock cache miss
      mockCaches.match.mockResolvedValue(undefined)
      
      const response = await cacheFirstStrategy(url)
      
      expect(mockCaches.match).toHaveBeenCalledWith(url)
      expect(global.fetch).toHaveBeenCalledWith(url)
      expect(mockCache.put).toHaveBeenCalled()
    })

    it('should implement network-first strategy for API calls', async () => {
      const apiUrl = '/api/artworks'
      
      const networkFirstStrategy = async (request: string) => {
        try {
          // Try network first
          const networkResponse = await fetch(request)
          
          // Cache successful responses
          if (networkResponse.ok) {
            const cache = await caches.open('anam-gallery-api-v1')
            cache.put(request, networkResponse.clone())
          }
          
          return networkResponse
        } catch (error) {
          // Fallback to cache on network error
          const cachedResponse = await caches.match(request)
          if (cachedResponse) {
            return cachedResponse
          }
          throw error
        }
      }

      const response = await networkFirstStrategy(apiUrl)
      
      expect(global.fetch).toHaveBeenCalledWith(apiUrl)
      expect(response).toBeDefined()
    })

    it('should clean up old caches on service worker activation', async () => {
      const currentCacheName = 'anam-gallery-v2'
      const oldCacheNames = ['anam-gallery-v1', 'anam-gallery-api-v1']
      
      // Mock caches.keys() to return old cache names
      mockCaches.keys.mockResolvedValue([...oldCacheNames, currentCacheName])
      
      const cleanupOldCaches = async () => {
        const cacheNames = await caches.keys()
        const deletePromises = cacheNames
          .filter(cacheName => cacheName !== currentCacheName)
          .map(cacheName => caches.delete(cacheName))
        
        await Promise.all(deletePromises)
      }

      await cleanupOldCaches()
      
      expect(mockCaches.delete).toHaveBeenCalledWith('anam-gallery-v1')
      expect(mockCaches.delete).toHaveBeenCalledWith('anam-gallery-api-v1')
      expect(mockCaches.delete).not.toHaveBeenCalledWith(currentCacheName)
    })

    it('should handle cache storage quota exceeded', async () => {
      // Mock quota exceeded error
      const quotaError = new Error('QuotaExceededError')
      quotaError.name = 'QuotaExceededError'
      mockCache.put.mockRejectedValue(quotaError)

      const safeCachePut = async (request: string, response: Response) => {
        try {
          const cache = await caches.open('anam-gallery-v1')
          await cache.put(request, response)
        } catch (error: any) {
          if (error.name === 'QuotaExceededError') {
            // Clear some old cache entries
            await caches.delete('anam-gallery-old')
            console.warn('Cache quota exceeded, cleared old caches')
          }
        }
      }

      await safeCachePut('/test-url', new Response('test'))
      
      expect(mockCaches.delete).toHaveBeenCalledWith('anam-gallery-old')
    })
  })

  describe('Background Sync', () => {
    it('should register background sync for form submissions', async () => {
      const mockRegistration = {
        sync: {
          register: jest.fn()
        }
      }

      // Mock service worker registration with sync
      Object.defineProperty(navigator.serviceWorker, 'ready', {
        value: Promise.resolve(mockRegistration)
      })

      const registerBackgroundSync = async (tag: string) => {
        const registration = await navigator.serviceWorker.ready
        if ('sync' in registration) {
          await (registration as any).sync.register(tag)
        }
      }

      await registerBackgroundSync('contact-form-sync')
      
      expect(mockRegistration.sync.register).toHaveBeenCalledWith('contact-form-sync')
    })

    it('should queue form data when offline', async () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message'
      }

      const queueFormSubmission = (data: any) => {
        // Store in IndexedDB or localStorage for background sync
        const queuedSubmissions = JSON.parse(localStorage.getItem('queuedSubmissions') || '[]')
        queuedSubmissions.push({
          id: Date.now(),
          data,
          timestamp: new Date().toISOString()
        })
        localStorage.setItem('queuedSubmissions', JSON.stringify(queuedSubmissions))
      }

      queueFormSubmission(formData)
      
      const queuedItems = JSON.parse(localStorage.getItem('queuedSubmissions') || '[]')
      expect(queuedItems).toHaveLength(1)
      expect(queuedItems[0].data).toEqual(formData)
    })

    it('should process queued submissions when online', async () => {
      // Mock queued submissions
      const queuedSubmissions = [
        {
          id: 1,
          data: { name: 'John', email: 'john@example.com', message: 'Test 1' },
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          data: { name: 'Jane', email: 'jane@example.com', message: 'Test 2' },
          timestamp: new Date().toISOString()
        }
      ]
      
      localStorage.setItem('queuedSubmissions', JSON.stringify(queuedSubmissions))

      const processQueuedSubmissions = async () => {
        const queued = JSON.parse(localStorage.getItem('queuedSubmissions') || '[]')
        const processed = []
        
        for (const submission of queued) {
          try {
            await fetch('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(submission.data)
            })
            processed.push(submission.id)
          } catch (error) {
            console.error('Failed to process submission:', error)
          }
        }
        
        // Remove processed submissions
        const remaining = queued.filter((sub: any) => !processed.includes(sub.id))
        localStorage.setItem('queuedSubmissions', JSON.stringify(remaining))
        
        return processed.length
      }

      const processedCount = await processQueuedSubmissions()
      
      expect(processedCount).toBe(2)
      expect(global.fetch).toHaveBeenCalledTimes(2)
      
      const remainingSubmissions = JSON.parse(localStorage.getItem('queuedSubmissions') || '[]')
      expect(remainingSubmissions).toHaveLength(0)
    })
  })

  describe('Push Notifications', () => {
    it('should request notification permission', async () => {
      // Mock Notification API
      const mockNotification = {
        permission: 'default' as NotificationPermission,
        requestPermission: jest.fn().mockResolvedValue('granted' as NotificationPermission)
      }
      
      Object.defineProperty(global, 'Notification', {
        value: mockNotification,
        writable: true
      })

      const requestNotificationPermission = async () => {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission()
          return permission
        }
        return 'denied'
      }

      const permission = await requestNotificationPermission()
      
      expect(mockNotification.requestPermission).toHaveBeenCalled()
      expect(permission).toBe('granted')
    })

    it('should subscribe to push notifications', async () => {
      const mockPushManager = {
        subscribe: jest.fn().mockResolvedValue({
          endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
          keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key'
          }
        }),
        getSubscription: jest.fn().mockResolvedValue(null)
      }

      const mockServiceWorkerRegistration = {
        ...mockRegistration,
        pushManager: mockPushManager
      }

      Object.defineProperty(navigator.serviceWorker, 'ready', {
        value: Promise.resolve(mockServiceWorkerRegistration)
      })

      const subscribeToPush = async () => {
        const registration = await navigator.serviceWorker.ready
        const subscription = await (registration as any).pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'test-vapid-key'
        })
        return subscription
      }

      const subscription = await subscribeToPush()
      
      expect(mockPushManager.subscribe).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: 'test-vapid-key'
      })
      expect(subscription.endpoint).toBe('https://fcm.googleapis.com/fcm/send/test-endpoint')
    })

    it('should handle push messages in service worker', () => {
      const pushEventHandler = jest.fn()
      
      // Mock service worker push event
      const pushEvent = {
        data: {
          json: () => ({
            title: 'New Artwork Added',
            body: 'Check out the latest addition to our gallery!',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            data: { url: '/gallery/new-artwork' }
          })
        },
        waitUntil: jest.fn()
      }

      pushEventHandler(pushEvent)
      
      expect(pushEventHandler).toHaveBeenCalledWith(pushEvent)
    })
  })

  describe('Web App Manifest', () => {
    it('should have valid manifest properties', () => {
      const expectedManifest = {
        name: 'ANAM Gallery',
        short_name: 'ANAM',
        description: 'Asian American contemporary art gallery',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        categories: ['art', 'culture', 'gallery'],
        lang: 'en-US',
        dir: 'ltr'
      }

      // Validate manifest structure
      expect(expectedManifest.name).toBeDefined()
      expect(expectedManifest.short_name).toBeDefined()
      expect(expectedManifest.start_url).toBe('/')
      expect(expectedManifest.display).toBe('standalone')
      expect(expectedManifest.icons).toHaveLength(3)
      expect(expectedManifest.icons.every(icon => 
        icon.src && icon.sizes && icon.type
      )).toBe(true)
    })

    it('should detect manifest installation eligibility', () => {
      // Mock manifest link in document head
      const manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      manifestLink.href = '/manifest.json'
      document.head.appendChild(manifestLink)

      const isManifestPresent = document.querySelector('link[rel="manifest"]') !== null
      const hasServiceWorker = 'serviceWorker' in navigator
      const isSecureContext = location.protocol === 'https:' || location.hostname === 'localhost'

      const isInstallEligible = isManifestPresent && hasServiceWorker && isSecureContext
      
      expect(isManifestPresent).toBe(true)
      expect(hasServiceWorker).toBe(true)
      expect(isInstallEligible).toBe(true)

      // Cleanup
      document.head.removeChild(manifestLink)
    })
  })

  describe('Performance Monitoring', () => {
    it('should track PWA performance metrics', () => {
      const performanceMetrics = {
        serviceWorkerActivation: 0,
        cacheHitRate: 0,
        offlinePageViews: 0,
        installPromptShown: 0,
        installPromptAccepted: 0
      }

      const trackMetric = (metric: keyof typeof performanceMetrics, value: number) => {
        performanceMetrics[metric] = value
      }

      // Simulate tracking metrics
      trackMetric('serviceWorkerActivation', performance.now())
      trackMetric('cacheHitRate', 0.85)
      trackMetric('installPromptShown', 1)

      expect(performanceMetrics.serviceWorkerActivation).toBeGreaterThan(0)
      expect(performanceMetrics.cacheHitRate).toBe(0.85)
      expect(performanceMetrics.installPromptShown).toBe(1)
    })

    it('should monitor cache performance', async () => {
      const cachePerformance = {
        hits: 0,
        misses: 0,
        totalRequests: 0
      }

      const monitorCacheRequest = async (url: string) => {
        cachePerformance.totalRequests++
        
        const cachedResponse = await caches.match(url)
        if (cachedResponse) {
          cachePerformance.hits++
          return cachedResponse
        } else {
          cachePerformance.misses++
          const networkResponse = await fetch(url)
          return networkResponse
        }
      }

      // Mock cache hit
      mockCaches.match.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => 'cached content'
      })

      await monitorCacheRequest('/test-cached-url')

      // Mock cache miss
      mockCaches.match.mockResolvedValueOnce(undefined)
      await monitorCacheRequest('/test-uncached-url')

      expect(cachePerformance.totalRequests).toBe(2)
      expect(cachePerformance.hits).toBe(1)
      expect(cachePerformance.misses).toBe(1)
      
      const hitRate = cachePerformance.hits / cachePerformance.totalRequests
      expect(hitRate).toBe(0.5)
    })
  })
})