// 작품 상세용 "전체" 이미지를 만든다.
// optimize-slug-images.js의 large(1200×1200, fit: cover)는 가로·세로 작품을 정사각형으로 잘라 낸다.
// 여기서는 원본 비율을 그대로 두고(fit: inside) 긴 변 1800px, sRGB(원본 다수가 CMYK)로 내보낸다.
// 같은 방식(fit: inside)으로 긴 변 800px 미리보기(`NN-preview.jpg`)도 만든다 — 상세의 "다른 작품" 같은
// 작은 칸용. 기존 medium(800×800)은 fit: cover 라 61점 중 41점이 정사각형으로 잘려 있어 쓰지 않는다.
// 사용: node scripts/generate-full-images.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const originalsDir = path.join(root, 'public/Images/Artworks/originals')
const optimizedDir = path.join(root, 'public/Images/Artworks/optimized')
const manifestPath = path.join(root, 'lib/artwork-full-sizes.json')
const LONG_EDGE = 1800
const PREVIEW_LONG_EDGE = 800

const files = fs
  .readdirSync(originalsDir)
  .filter((file) => /^anam-\d+-\d{4}\.jpe?g$/i.test(file))
  .sort()

const manifest = {}
for (const file of files) {
  const number = file.match(/^anam-(\d+)-/)[1].padStart(2, '0')
  const outDir = path.join(optimizedDir, number)
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `${number}-full.jpg`)

  const info = await sharp(path.join(originalsDir, file))
    .rotate()
    .resize(LONG_EDGE, LONG_EDGE, { fit: 'inside', withoutEnlargement: true })
    .toColourspace('srgb')
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(outPath)

  await sharp(path.join(originalsDir, file))
    .rotate()
    .resize(PREVIEW_LONG_EDGE, PREVIEW_LONG_EDGE, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toColourspace('srgb')
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(outDir, `${number}-preview.jpg`))

  manifest[number] = [info.width, info.height]
  console.log(
    `${number}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)}KB`
  )
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
console.log(
  `\n${files.length}개 생성, 크기 목록: ${path.relative(root, manifestPath)}`
)
