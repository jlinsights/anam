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

async function optimizeRemainingImages() {
  try {
    console.log('🎨 ANAM Gallery 나머지 이미지 최적화 시작...')

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

    // 43번부터 61번까지만 처리
    const targetFiles = imageFiles.filter((file) => {
      const slugNumber = file.match(/anam-(\d+)-/)?.[1]
      if (!slugNumber) return false
      const num = parseInt(slugNumber)
      return num >= 43 && num <= 61
    })

    console.log(`🎯 처리 대상: ${targetFiles.length}개 (43~61번)`)

    for (const file of targetFiles) {
      const originalPath = path.join(originalsDir, file)
      const fileName = path.parse(file).name // anam-43-2024
      const slugNumber = fileName.match(/anam-(\d+)-/)?.[1] // 43, 44, 45...

      if (!slugNumber) {
        console.log(`⚠️  slug 번호를 찾을 수 없습니다: ${file}`)
        continue
      }

      const paddedNumber = slugNumber.padStart(2, '0') // 43, 44, 45...
      const outputDir = path.join(optimizedDir, paddedNumber)

      // 개별 디렉토리 생성
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      console.log(`🖼️  처리 중: ${file} → ${paddedNumber}/`)

      // Sharp로 원본 이미지 로드
      const image = sharp(originalPath)
      const metadata = await image.metadata()
      console.log(
        `   📊 원본: ${metadata.width}x${metadata.height}, ${Math.round(metadata.size / 1024)}KB`
      )

      // 각 사이즈별로 최적화
      for (const [sizeName, config] of Object.entries(sizes)) {
        const outputPath = path.join(
          outputDir,
          `${paddedNumber}-${sizeName}.jpg`
        )

        // 이미 존재하는 파일은 건너뛰기
        if (fs.existsSync(outputPath)) {
          console.log(
            `   ⏭️  건너뜀: ${paddedNumber}-${sizeName}.jpg (이미 존재)`
          )
          continue
        }

        await image
          .resize(config.width, config.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({
            quality: config.quality,
            progressive: true,
            mozjpeg: true,
          })
          .toFile(outputPath)

        console.log(`   ✅ ${sizeName}: ${paddedNumber}-${sizeName}.jpg`)
      }

      // WebP 버전 (medium 사이즈만)
      const webpPath = path.join(outputDir, `${paddedNumber}-medium.webp`)
      if (!fs.existsSync(webpPath)) {
        await image
          .resize(sizes.medium.width, sizes.medium.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toFile(webpPath)

        console.log(`   ✅ WebP: ${paddedNumber}-medium.webp`)
      } else {
        console.log(`   ⏭️  건너뜀: ${paddedNumber}-medium.webp (이미 존재)`)
      }
    }

    console.log('\n🎉 나머지 이미지 최적화 완료!')
    console.log('\n📊 최종 통계:')

    // 최종 폴더 개수 확인
    const optimizedFolders = fs
      .readdirSync(optimizedDir)
      .filter((item) =>
        fs.statSync(path.join(optimizedDir, item)).isDirectory()
      )
    console.log(`   📁 생성된 폴더: ${optimizedFolders.length}개`)
    console.log(
      `   📋 폴더 목록: ${optimizedFolders.sort((a, b) => parseInt(a) - parseInt(b)).join(', ')}`
    )
  } catch (error) {
    console.error('❌ 최적화 중 오류 발생:', error)
    process.exit(1)
  }
}

// 스크립트 실행
optimizeRemainingImages()
