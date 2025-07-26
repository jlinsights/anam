const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// 이미지 최적화 설정
const OPTIMIZATION_CONFIG = {
  // 썸네일 (갤러리 목록용)
  thumbnail: {
    width: 400,
    height: 500,
    quality: 75,
    suffix: '-thumb',
  },
  // 중간 크기 (개별 작품 페이지용)
  medium: {
    width: 800,
    height: 1000,
    quality: 85,
    suffix: '-medium',
  },
  // 대형 (풀스크린 보기용)
  large: {
    width: 1200,
    height: 1500,
    quality: 90,
    suffix: '-large',
  },
}

// 재귀적으로 디렉토리 스캔
function findImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      findImageFiles(filePath, fileList)
    } else if (
      /\.(jpg|jpeg|png)$/i.test(file) &&
      !file.includes('-thumb') &&
      !file.includes('-medium') &&
      !file.includes('-large')
    ) {
      fileList.push(filePath)
    }
  })

  return fileList
}

// 이미지 최적화 함수
async function optimizeImage(inputPath, config) {
  const { dir, name, ext } = path.parse(inputPath)
  const outputPath = path.join(dir, `${name}${config.suffix}${ext}`)

  try {
    await sharp(inputPath)
      .resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: config.quality,
        progressive: true,
      })
      .toFile(outputPath)

    const originalSize = fs.statSync(inputPath).size
    const optimizedSize = fs.statSync(outputPath).size
    const savings = (
      ((originalSize - optimizedSize) / originalSize) *
      100
    ).toFixed(1)

    console.log(`✅ ${path.basename(inputPath)} → ${path.basename(outputPath)}`)
    console.log(
      `   크기: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(
        optimizedSize /
        1024 /
        1024
      ).toFixed(2)}MB (${savings}% 절약)`
    )

    return { originalSize, optimizedSize }
  } catch (error) {
    console.error(`❌ 오류 처리 중: ${inputPath}`, error.message)
    return null
  }
}

// 메인 실행 함수
async function main() {
  const artworksDir = 'public/Images/Artworks'

  if (!fs.existsSync(artworksDir)) {
    console.error('❌ Artworks 디렉토리가 존재하지 않습니다:', artworksDir)
    return
  }

  console.log('🎨 이미지 최적화를 시작합니다...\n')

  const imageFiles = findImageFiles(artworksDir)
  console.log(`📁 총 ${imageFiles.length}개의 이미지를 찾았습니다.\n`)

  let totalOriginalSize = 0
  let totalOptimizedSize = 0
  let processedCount = 0

  for (const imagePath of imageFiles) {
    console.log(`\n🖼️  처리 중: ${path.relative('.', imagePath)}`)

    // 각 크기별로 최적화된 이미지 생성
    for (const [sizeName, config] of Object.entries(OPTIMIZATION_CONFIG)) {
      console.log(`   → ${sizeName} 크기 생성...`)
      const result = await optimizeImage(imagePath, config)

      if (result) {
        totalOriginalSize += result.originalSize
        totalOptimizedSize += result.optimizedSize
      }
    }

    processedCount++
    console.log(
      `   진행률: ${processedCount}/${imageFiles.length} (${(
        (processedCount / imageFiles.length) *
        100
      ).toFixed(1)}%)`
    )
  }

  console.log('\n🎉 이미지 최적화 완료!')
  console.log(
    `📊 총 절약된 용량: ${(
      (totalOriginalSize - totalOptimizedSize) /
      1024 /
      1024
    ).toFixed(2)}MB`
  )
  console.log(
    `📈 전체 압축률: ${(
      ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) *
      100
    ).toFixed(1)}%`
  )

  console.log('\n💡 다음 단계:')
  console.log('1. lib/artworks.js에서 이미지 경로를 최적화된 버전으로 업데이트')
  console.log('2. 반응형 이미지를 위한 컴포넌트 업데이트')
  console.log('3. 원본 이미지는 백업 후 삭제 고려')
}

// 에러 핸들링
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 처리되지 않은 오류:', reason)
  process.exit(1)
})
main().catch(console.error)
