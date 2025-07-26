'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function SimpleThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 로컬 스토리지에서 테마 설정 읽기
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches

    const shouldBeDark =
      savedTheme === 'dark' || (!savedTheme && systemPrefersDark)
    setIsDark(shouldBeDark)
    updateTheme(shouldBeDark)
  }, [])

  const updateTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    updateTheme(newIsDark)
  }

  // 마운트될 때까지 아무것도 렌더링하지 않음 (hydration 에러 방지)
  if (!mounted) {
    return (
      <div className='w-9 h-9 flex items-center justify-center'>
        {/* 빈 공간 유지 */}
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className='w-9 h-9 flex items-center justify-center rounded-md text-ink-light hover:text-ink hover:bg-ink/5 transition-colors duration-200'
      aria-label='테마 변경'
      type='button'
    >
      {isDark ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
    </button>
  )
}
