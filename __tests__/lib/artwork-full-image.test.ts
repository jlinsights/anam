import {
  artworkNumber,
  fullImageFor,
  previewImageFor,
  sortByNumber,
} from '@/lib/artwork-full-image'

describe('artworkNumber', () => {
  it('슬러그 "01"과 "anam-01-2024", number 칸을 모두 두 자리 번호로 읽는다', () => {
    expect(artworkNumber({ slug: '1' })).toBe('01')
    expect(artworkNumber({ slug: 'anam-38-2024' })).toBe('38')
    expect(artworkNumber({ slug: 'unknown', number: 7 })).toBe('07')
  })

  it('번호를 알 수 없으면 null', () => {
    expect(artworkNumber({ slug: 'unknown' })).toBeNull()
  })
})

describe('fullImageFor', () => {
  it('잘리지 않은 상세 이미지 경로와 실제 크기를 돌려준다', () => {
    const image = fullImageFor({ slug: '61' })
    expect(image?.src).toBe('/Images/Artworks/optimized/61/61-full.jpg')
    // 61번은 세로로 긴 족자: 정사각형으로 잘리지 않아야 한다
    expect(image!.height).toBeGreaterThan(image!.width * 3)
  })

  it('목록에 없는 번호는 null', () => {
    expect(fullImageFor({ slug: '999' })).toBeNull()
  })
})

describe('sortByNumber', () => {
  it('작품 번호 순으로 정렬하고 원본 배열은 건드리지 않는다', () => {
    const input = [
      { slug: '10' },
      { slug: '02' },
      { slug: 'x' },
      { slug: '01' },
    ]
    expect(sortByNumber(input).map((a) => a.slug)).toEqual([
      '01',
      '02',
      '10',
      'x',
    ])
    expect(input[0].slug).toBe('10')
  })
})

// 이미지 최적화를 끈 뒤(next.config images.unoptimized) 상세의 "다른 작품" 칸(약 160px)이 1800px
// 원본(15번 655KB)을 받았다(Codex 리뷰). 작은 칸에는 잘리지 않은 800px 미리보기를 쓴다.
// 기존 medium 은 정사각형으로 잘려 있어(61점 중 41점) 쓰면 안 된다 — 실제 파일 비율까지 확인한다
function jpegSize(file: string): [number, number] {
  const fs = require('fs') as typeof import('fs')
  const buf = fs.readFileSync(file)
  let i = 2
  while (i < buf.length) {
    const marker = buf[i + 1]
    const length = buf.readUInt16BE(i + 2)
    if (marker >= 0xc0 && marker <= 0xc3) {
      return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)]
    }
    i += 2 + length
  }
  throw new Error(`JPEG 크기를 읽지 못함: ${file}`)
}

describe('previewImageFor', () => {
  it('잘리지 않은 미리보기 이미지를 원본 비율로 돌려준다', () => {
    const image = previewImageFor({ slug: '61' })
    expect(image?.src).toBe('/Images/Artworks/optimized/61/61-preview.jpg')
    expect(image!.height).toBeGreaterThan(image!.width * 3)
  })

  it('목록에 없는 번호는 null', () => {
    expect(previewImageFor({ slug: '999' })).toBeNull()
  })

  it('모든 작품의 미리보기 파일이 있고, 원본과 비율이 같으며(잘리지 않음) 긴 변이 800px 이하다', () => {
    const path = require('path') as typeof import('path')
    const sizes = require('@/lib/artwork-full-sizes.json') as Record<
      string,
      number[]
    >
    const problems = Object.entries(sizes).flatMap(([n, [w, h]]) => {
      const preview = previewImageFor({ slug: n })!
      const [pw, ph] = jpegSize(
        path.join(__dirname, '..', '..', 'public', preview.src)
      )
      const cropped = Math.abs(pw / ph - w / h) > 0.02
      const tooBig = Math.max(pw, ph) > 800
      const wrongSize =
        Math.abs(pw - preview.width) > 1 || Math.abs(ph - preview.height) > 1
      return cropped || tooBig || wrongSize ? [`${n}: ${pw}x${ph}`] : []
    })
    expect(problems).toEqual([])
  })
})
