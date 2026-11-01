/**
 * @jest-environment node
 */

// 2026-11-01 운영에서 Vercel 이미지 최적화(/_next/image)가 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED 를
// 돌려줘 모든 작품 이미지가 "이미지를 불러올 수 없습니다" 로 나왔다(한도 소진). 작품 이미지는 이미
// public/Images/Artworks/optimized/ 에 크기별(thumb·medium·large·full)로 만들어 두었으므로 최적화
// 서버를 거치지 않고 정적 파일을 그대로 준다. 이 설정이 빠지면 같은 장애가 다시 난다.
import fs from 'fs'
import path from 'path'

describe('next.config 이미지 설정', () => {
  it('Vercel 이미지 최적화를 쓰지 않는다 (images.unoptimized: true)', () => {
    const config = fs.readFileSync(
      path.join(__dirname, '..', '..', 'next.config.mjs'),
      'utf8'
    )
    const images = config.match(/images:\s*\{([\s\S]*?)\n  \},/)
    expect(images).not.toBeNull()
    expect(images![1]).toMatch(/^\s*unoptimized:\s*true,/m)
  })
})
