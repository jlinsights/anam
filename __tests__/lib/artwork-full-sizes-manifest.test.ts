import fs from 'node:fs'
import path from 'node:path'
import sizes from '@/lib/artwork-full-sizes.json'

const optimized = path.join(process.cwd(), 'public/Images/Artworks/optimized')

// 크기 목록과 실제 파일이 어긋나면 상세·갤러리 칸이 깨진다.
// generate-full-images.mjs 를 다시 돌려 원본이 저장소에 없는 작품(書境 2026)이 목록에서 빠지는 일도 여기서 잡는다
describe('lib/artwork-full-sizes.json', () => {
  const entries = Object.entries(sizes as Record<string, number[]>)

  it('목록의 모든 작품에 full·preview 파일이 있다', () => {
    for (const [number] of entries) {
      for (const kind of ['full', 'preview']) {
        expect(
          fs.existsSync(path.join(optimized, number, `${number}-${kind}.jpg`))
        ).toBe(true)
      }
    }
  })

  it('full 파일이 있는 작품은 모두 목록에 있다', () => {
    const dirs = fs
      .readdirSync(optimized)
      .filter((dir) =>
        fs.existsSync(path.join(optimized, dir, `${dir}-full.jpg`))
      )
    expect(dirs.sort()).toEqual(entries.map(([n]) => n).sort())
  })
})
