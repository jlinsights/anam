const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// 이미지 최적화 설정 - 현대적 포맷과 반응형 지원
const OPTIMIZATION_CONFIG = {
  // 썸네일 (갤러리 목록용) - 400x500
  thumbnail: {
    width: 400,
    height: 500,
    quality: {
      jpeg: 75,
      webp: 70,
      avif: 60,
    },
    suffix: '-thumb',
  },
  // 중간 크기 (개별 작품 페이지용) - 800x1000
  medium: {
    width: 800,
    height: 1000,
    quality: {
      jpeg: 85,
      webp: 80,
      avif: 70,
    },
    suffix: '-medium',
  },
  // 대형 (풀스크린 보기용) - 1200x1500
  large: {
    width: 1200,
    height: 1500,
    quality: {
      jpeg: 90,
      webp: 85,
      avif: 75,
    },
    suffix: '-large',
  },
}

// 지원하는 이미지 포맷
const OUTPUT_FORMATS = ['jpeg', 'webp', 'avif']

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

// 단일 포맷으로 이미지 최적화
async function optimizeImageFormat(inputPath, config, format) {
  const { name } = path.parse(inputPath)
  const outputExtension = format === 'jpeg' ? '.jpg' : `.${format}`
  const outputDir = config.outputDir || path.dirname(inputPath)
  const outputPath = path.join(
    outputDir,
    `${name}${config.suffix}${outputExtension}`
  )

  try {
    let sharpInstance = sharp(inputPath).resize(config.width, config.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })

    // 포맷별 최적화 설정
    switch (format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({
          quality: config.quality.jpeg,
          progressive: true,
          mozjpeg: true,
        })
        break
      case 'webp':
        sharpInstance = sharpInstance.webp({
          quality: config.quality.webp,
          effort: 6, // 최고 압축 노력
        })
        break
      case 'avif':
        sharpInstance = sharpInstance.avif({
          quality: config.quality.avif,
          effort: 9, // 최고 압축 노력
        })
        break
    }

    await sharpInstance.toFile(outputPath)

    const originalSize = fs.statSync(inputPath).size
    const optimizedSize = fs.statSync(outputPath).size
    const savings = (
      ((originalSize - optimizedSize) / originalSize) *
      100
    ).toFixed(1)

    console.log(`   ✅ ${format.toUpperCase()}: ${path.basename(outputPath)}`)
    console.log(
      `      크기: ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (${savings}% 절약)`
    )

    return { originalSize, optimizedSize, format, outputPath }
  } catch (error) {
    console.error(`   ❌ ${format.toUpperCase()} 변환 실패:`, error.message)
    return null
  }
}

// 모든 포맷으로 이미지 최적화
async function optimizeImage(inputPath, config) {
  const results = []

  for (const format of OUTPUT_FORMATS) {
    const result = await optimizeImageFormat(inputPath, config, format)
    if (result) {
      results.push(result)
    }
  }

  return results
}

// 메인 실행 함수
async function main() {
  const originalsDir = 'public/Images/Artworks/originals'

  if (!fs.existsSync(originalsDir)) {
    console.error('❌ Originals 디렉토리가 존재하지 않습니다:', originalsDir)
    return
  }

  console.log('🎨 고급 이미지 최적화를 시작합니다...')
  console.log('📦 JPEG, WebP, AVIF 포맷으로 3가지 크기 생성\n')

  const imageFiles = findImageFiles(originalsDir)
  console.log(`📁 총 ${imageFiles.length}개의 원본 이미지를 찾았습니다.\n`)

  let totalOriginalSize = 0
  let totalOptimizedSize = 0
  let processedCount = 0
  const formatStats = {}

  // 최적화된 이미지 저장할 디렉토리 생성
  const optimizedDir = 'public/Images/Artworks/optimized'
  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true })
  }

  for (const imagePath of imageFiles) {
    const originalName = path.basename(imagePath, path.extname(imagePath))
    const optimizedImageDir = path.join(optimizedDir, originalName)

    // 이미 최적화된 이미지가 있는지 확인
    if (fs.existsSync(optimizedImageDir)) {
      const files = fs.readdirSync(optimizedImageDir)
      // 모든 크기와 포맷이 있는지 확인 (3 sizes x 3 formats = 9 files)
      if (files.length >= 9) {
        console.log(
          `\n⏭️  건너뛰기: ${path.basename(imagePath)} (이미 최적화됨)`
        )
        processedCount++
        continue
      }
    }

    console.log(`\n🖼️  처리 중: ${path.basename(imagePath)}`)

    if (!fs.existsSync(optimizedImageDir)) {
      fs.mkdirSync(optimizedImageDir, { recursive: true })
    }

    const originalSize = fs.statSync(imagePath).size
    totalOriginalSize += originalSize

    // 각 크기별로 최적화된 이미지 생성
    for (const [sizeName, config] of Object.entries(OPTIMIZATION_CONFIG)) {
      console.log(
        `\n   📐 ${sizeName} 크기 (${config.width}x${config.height}) 생성:`
      )

      // config를 복사하고 출력 디렉토리 설정
      const configWithDir = {
        ...config,
        outputDir: optimizedImageDir,
        originalSize,
      }

      const results = await optimizeImage(imagePath, configWithDir)

      if (results && results.length > 0) {
        results.forEach((result) => {
          totalOptimizedSize += result.optimizedSize

          // 포맷별 통계 수집
          if (!formatStats[result.format]) {
            formatStats[result.format] = { count: 0, totalSize: 0 }
          }
          formatStats[result.format].count++
          formatStats[result.format].totalSize += result.optimizedSize
        })
      }
    }

    processedCount++
    const progress = ((processedCount / imageFiles.length) * 100).toFixed(1)
    console.log(
      `\n   📊 진행률: ${processedCount}/${imageFiles.length} (${progress}%)`
    )
  }

  console.log('\n🎉 이미지 최적화 완료!')
  console.log(
    `📊 총 절약된 용량: ${((totalOriginalSize - totalOptimizedSize) / 1024 / 1024).toFixed(2)}MB`
  )
  console.log(
    `📈 전체 압축률: ${(((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100).toFixed(1)}%`
  )

  console.log('\n📊 포맷별 통계:')
  Object.entries(formatStats).forEach(([format, stats]) => {
    console.log(
      `   ${format.toUpperCase()}: ${stats.count}개 파일, ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`
    )
  })

  console.log('\n💡 다음 단계:')
  console.log('1. ✅ optimized 폴더에 모든 최적화된 이미지 생성 완료')
  console.log('2. 🔄 lib/artworks.ts 데이터 구조 업데이트 필요')
  console.log('3. 🖼️  컴포넌트에서 반응형 이미지 사용 구현 필요')
  console.log('4. 🧪 최적화 결과 테스트 및 검증 필요')
}

// 에러 핸들링
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 처리되지 않은 오류:', reason)
  process.exit(1)
})
main().catch(console.error)
