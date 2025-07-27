/*
  Airtable Automation Script: ANAM Gallery Revalidate
  ---------------------------------------------------
  목적: Airtable Base 내 레코드가 생성·업데이트·삭제될 때마다
        ANAM 갤러리 웹사이트의 캐시 태그("artworks")를 무효화합니다.
  사용 방법:
  1. Airtable → Automations → "When record updated / created / deleted" 트리거 선택.
  2. "Run a script" step 추가 후 본 스크립트 내용 붙여넣기.
  3. Variables 섹션에 다음 변수를 추가하세요:
     • WEBHOOK_URL: https://anam-gallery-1oss65kc1-jlinsights-projects.vercel.app/api/revalidate
     • WEBHOOK_SECRET: anam-gallery-2025-secure-webhook-key
  4. 테스트 실행 후 성공하면 Automation 을 켜세요.
*/

// Automation 입력 변수 (Settings > Variables)
const webhookUrl = WEBHOOK_URL // eslint-disable-line no-undef
const secret = WEBHOOK_SECRET // eslint-disable-line no-undef
const tag = 'artworks'

async function revalidate() {
  try {
    const payload = JSON.stringify({ tag, secret })

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    })

    if (!response.ok) {
      console.error(`Revalidate failed – ${response.status}`)
      output.set('status', 'failed')
      return
    }

    const data = await response.json()
    console.log('Revalidated:', data)
    output.set('status', 'success')
  } catch (error) {
    console.error('Revalidate error:', error)
    output.set('status', 'error')
  }
}

await revalidate()
