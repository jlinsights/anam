// 서비스 워커를 더는 쓰지 않는다 — 이미 설치된 방문자 브라우저에서 스스로 지우는 워커.
//
// 예전 sw.js(2.0.0)는 이미지 요청을 가로채 30일 캐시에서 먼저 꺼내고, 요청이 실패하면
// "이미지를 불러올 수 없습니다" SVG 를 진짜 이미지인 것처럼 돌려주었다. 2026-11-01 Vercel 이미지
// 최적화가 402 를 내자 작품 칸이 이 가짜 그림으로 채워졌다. 이 파일을 지우기만 하면 이미 설치된
// 워커가 남으므로, 같은 경로에 해제용 워커를 둔다(브라우저가 업데이트를 받아 이 코드를 실행한다).
// fetch 처리기가 없으므로 모든 요청은 네트워크로 그대로 간다.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.map((name) => caches.delete(name)))
      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: 'window' })
      clients.forEach((client) => client.navigate(client.url))
    })()
  )
})
