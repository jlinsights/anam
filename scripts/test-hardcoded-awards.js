// 5개 수상경력 하드코딩 테스트
const fiveAwards = [
  '2024 | 국제공모전 Art Beyond Boundaries | 국제예술상',
  '2023 | 제63회 Kaishin 서법원대전 | 우수상',
  '2022 | 동양서예협회 신인전 | 신인상',
  '2021 | 제1회 아시아서예대전 | 장려상',
  '2020 | 김포시 문화예술제 | 대상',
]

console.log('🏆 5개 수상경력 테스트 데이터:')
console.log(`총 ${fiveAwards.length}개의 수상경력`)

fiveAwards.forEach((award, index) => {
  console.log(`${index + 1}. ${award}`)
})

// 년도별 그룹화 테스트
console.log('\n📅 년도별 그룹화 테스트:')
const awardsByYear = fiveAwards.reduce((acc, award) => {
  const parts = award.split(' | ')
  const year = parts[0]
  const contest = parts[1]
  const awardName = parts[2]

  if (!acc[year]) {
    acc[year] = []
  }
  acc[year].push({ contest, awardName, original: award })
  return acc
}, {})

Object.keys(awardsByYear)
  .sort((a, b) => b.localeCompare(a)) // 최신순 정렬
  .forEach((year) => {
    console.log(`\n${year}년 (${awardsByYear[year].length}건):`)
    awardsByYear[year].forEach((award, index) => {
      console.log(`  ${index + 1}. ${award.contest} - ${award.awardName}`)
    })
  })
