// Simple skip to main content link - no styled-jsx
export function SkipToContent() {
  return (
    <a
      href='#main-content'
      className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-ink text-white p-3 rounded-md z-50 transition-all'
    >
      본문으로 건너뛰기
    </a>
  )
}
