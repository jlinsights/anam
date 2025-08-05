'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      registerSW()
    }
  }, [])

  return null
}

async function registerSW() {
  try {
    console.log('🔧 서비스 워커 등록 시작...')

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('✅ 서비스 워커 등록 성공:', registration.scope)

    registration.addEventListener('updatefound', () => {
      console.log('🔄 서비스 워커 업데이트 발견')

      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('📢 새 버전 사용 가능')
              showUpdateNotification()
            } else {
              console.log('📱 앱이 오프라인에서 사용 가능합니다')
              showInstallNotification()
            }
          }
        })
      }
    })

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 서비스 워커 컨트롤러 변경됨')
      window.location.reload()
    })
  } catch (error) {
    console.error('❌ 서비스 워커 등록 실패:', error)
  }
}

function showUpdateNotification() {
  if (confirm('새 버전이 사용 가능합니다. 지금 업데이트하시겠습니까?')) {
    navigator.serviceWorker.controller?.postMessage({ action: 'skipWaiting' })
  }
}

function showInstallNotification() {
  console.log('📱 앱이 설치되어 오프라인에서도 사용할 수 있습니다')
}
