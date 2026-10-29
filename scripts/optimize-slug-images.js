const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// 디렉토리 경로 설정
const originalsDir = path.join(__dirname, '../public/Images/Artworks/originals')
const optimizedDir = path.join(__dirname, '../public/Images/Artworks/optimized')

// 이미지 사이즈 설정
const sizes = {
  thumb: { width: 400, height: 400, quality: 80 },
  medium: { width: 800, height: 800, quality: 85 },
  large: { width: 1200, height: 1200, quality: 90 },
}

async function optimizeImages() {
  try {
    console.log('🎨 ANAM Gallery 이미지 최적화 시작...')

    // optimized 디렉토리가 없으면 생성
    if (!fs.existsSync(optimizedDir)) {
      fs.mkdirSync(optimizedDir, { recursive: true })
    }

    // originals 디렉토리의 모든 파일 읽기
    const files = fs.readdirSync(originalsDir)
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    )

    console.log(`📁 발견된 이미지 파일: ${imageFiles.length}개`)

    for (const file of imageFiles) {
      const originalPath = path.join(originalsDir, file)
      const fileName = path.parse(file).name // anam-01-2024
      const slugNumber = fileName.match(/anam-(\d+)-/)?.[1] // 01, 02, 03...

      if (!slugNumber) {
        console.log(`⚠️  slug 번호를 찾을 수 없습니다: ${file}`)
        continue
      }

      const paddedNumber = slugNumber.padStart(2, '0') // 01, 02, 03...
      const outputDir = path.join(optimizedDir, paddedNumber)

      // 개별 디렉토리 생성
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      console.log(`🖼️  처리 중: ${file} → ${paddedNumber}/`)

      // 각 사이즈별로 최적화된 이미지 생성
      for (const [sizeName, config] of Object.entries(sizes)) {
        const outputFileName = `${paddedNumber}-${sizeName}.jpg`
        const outputPath = path.join(outputDir, outputFileName)

        try {
          await sharp(originalPath)
            .resize(config.width, config.height, {
              fit: 'cover',
              position: 'center',
            })
            .jpeg({
              quality: config.quality,
              progressive: true,
              mozjpeg: true,
            })
            .toFile(outputPath)

          console.log(`   ✅ ${sizeName}: ${outputFileName}`)
        } catch (error) {
          console.error(`   ❌ ${sizeName} 생성 실패: ${error.message}`)
        }
      }

      // WebP 버전도 생성 (modern browsers)
      try {
        const webpPath = path.join(outputDir, `${paddedNumber}-medium.webp`)
        await sharp(originalPath)
          .resize(800, 800, {
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: 85 })
          .toFile(webpPath)

        console.log(`   ✅ WebP: ${paddedNumber}-medium.webp`)
      } catch (error) {
        console.error(`   ❌ WebP 생성 실패: ${error.message}`)
      }
    }

    console.log('🎉 이미지 최적화 완료!')
    console.log(`📊 통계:`)
    console.log(`   - 처리된 원본 이미지: ${imageFiles.length}개`)
    console.log(
      `   - 생성된 최적화 이미지: ${imageFiles.length * 4}개 (thumb, medium, large, webp)`
    )
  } catch (error) {
    console.error('❌ 이미지 최적화 중 오류 발생:', error)
    process.exit(1)
  }
}

// 스크립트 실행
optimizeImages()
