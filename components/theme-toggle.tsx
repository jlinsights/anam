'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 완전히 마운트될 때까지 아무것도 렌더링하지 않음
  if (!mounted) {
    return (
      <div className='w-9 h-9 flex items-center justify-center'>
        {/* 빈 공간 유지 */}
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='w-9 h-9 flex items-center justify-center rounded-md text-ink-light hover:text-ink hover:bg-ink/5 transition-colors duration-200'
      aria-label='테마 변경'
      type='button'
    >
      {isDark ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
    </button>
  )
}

