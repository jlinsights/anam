// Pa11y CI 설정: CI 가 띄운 빌드(localhost:3000)를 WCAG 2.1 AA 로 검사한다
// 사용: npm run test:a11y:audit (pa11y-ci --config pa11y.config.js)
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

module.exports = {
  defaults: {
    standard: 'WCAG2AA',
    runners: ['axe', 'htmlcs'],
    timeout: 30000,
    wait: 1500,
    viewport: { width: 1440, height: 900 },
    chromeLaunchConfig: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    },
  },

  // /exhibition 은 /#exhibition 으로 넘기기만 하므로 넣지 않는다
  urls: ['/', '/gallery', '/gallery/01', '/gallery/61', '/contact', '/artist'].map(
    (path) => `${BASE_URL}${path}`
  ),
}
