'use client'

import { useEffect } from 'react'

// 서비스 워커를 쓰지 않는다(public/sw.js 주석 참고). 예전에 등록된 워커가 남아 있으면 해제하고,
// 옛 워커가 남긴 캐시(static·api·images·runtime-v2.0.0)도 지운다. 이 사이트는 Cache Storage 를 쓰지 않는다.
// (페이지가 먼저 해제하면 해제용 워커가 활성화되지 못해 캐시가 남는다 — 2026-11-01 실제 브라우저에서 확인)
// 옛 워커가 이 탭을 제어 중이었다면 해제해도 탭을 놓지 않아 가짜 이미지·캐시가 이어지므로(Codex 리뷰),
// 정리가 끝난 뒤 한 번만 새로 고친다. sessionStorage 표시로 반복 새로 고침을 막는다
const RELOAD_FLAG = 'anam-sw-cleanup-reloaded'

async function removeOldServiceWorker(): Promise<void> {
  const controlledByOldWorker = Boolean(navigator.serviceWorker.controller)

  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(
    registrations.map((registration) => registration.unregister())
  )

  if ('caches' in window) {
    const names = await caches.keys()
    await Promise.all(names.map((name) => caches.delete(name)))
  }

  if (controlledByOldWorker && !sessionStorage.getItem(RELOAD_FLAG)) {
    sessionStorage.setItem(RELOAD_FLAG, '1')
    window.location.reload()
  }
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    removeOldServiceWorker().catch(() => {
      // 정리에 실패해도 화면은 그대로 쓸 수 있다 — public/sw.js 해제용 워커가 다음 업데이트 때 지운다
    })
  }, [])

  return null
}
