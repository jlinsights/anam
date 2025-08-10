'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Check, Smartphone, Monitor } from 'lucide-react'

export function PWAInstallButton() {
  const { canInstall, isInstalled, installPWA } = usePWA()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [installSuccess, setInstallSuccess] = useState(false)

  const handleInstall = async () => {
    setIsInstalling(true)
    const success = await installPWA()

    if (success) {
      setInstallSuccess(true)
      setTimeout(() => {
        setIsModalOpen(false)
        setInstallSuccess(false)
      }, 2000)
    }

    setIsInstalling(false)
  }

  if (isInstalled || !canInstall) {
    return null
  }

  return (
    <>
      <HoverCard>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant='outline'
          size='sm'
          className='bg-background border-border hover:bg-stone-50 dark:hover:bg-slate-800'
        >
          <Download className='w-4 h-4 mr-2' />앱 설치
        </Button>
      </HoverCard>

      <AnimatedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className='max-w-md mx-auto'
      >
        <div className='bg-background rounded-xl shadow-2xl border border-border overflow-hidden'>
          {/* Header */}
          <div className='p-6 border-b border-border'>
            <FadeInContainer>
              <div className='text-center space-y-3'>
                <div className='w-16 h-16 bg-ink rounded-2xl flex items-center justify-center mx-auto'>
                  <span className='text-white font-display text-xl'>
                    먹, 그리고...
                  </span>
                </div>
                <div>
                  <h3 className='font-display text-xl text-ink'>
                    먹, 그리고... - 아남 배옥영 개인전
                  </h3>
                  <p className='text-sm text-ink-light mt-1'>
                    언제든지 쉽게 작품을 감상하세요
                  </p>
                </div>
              </div>
            </FadeInContainer>
          </div>

          {/* Benefits */}
          <div className='p-6 space-y-4'>
            <FadeInContainer delay={0.2}>
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
                    <Smartphone className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div className='text-sm'>
                    <div className='font-medium text-ink'>오프라인 접근</div>
                    <div className='text-ink-light'>
                      인터넷 없이도 작품 감상
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center'>
                    <Monitor className='w-4 h-4 text-green-600 dark:text-green-400' />
                  </div>
                  <div className='text-sm'>
                    <div className='font-medium text-ink'>빠른 실행</div>
                    <div className='text-ink-light'>홈 화면에서 바로 접근</div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center'>
                    <Download className='w-4 h-4 text-purple-600 dark:text-purple-400' />
                  </div>
                  <div className='text-sm'>
                    <div className='font-medium text-ink'>네이티브 경험</div>
                    <div className='text-ink-light'>앱처럼 부드러운 사용감</div>
                  </div>
                </div>
              </div>
            </FadeInContainer>
          </div>

          {/* Actions */}
          <div className='p-6 border-t border-border'>
            <FadeInContainer delay={0.4}>
              <div className='space-y-3'>
                {installSuccess ? (
                  <div className='flex items-center justify-center gap-2 text-green-600 dark:text-green-400'>
                    <Check className='w-5 h-5' />
                    <span className='font-medium'>설치 완료!</span>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={handleInstall}
                      disabled={isInstalling}
                      className='w-full bg-ink hover:bg-ink/90 text-white'
                      size='lg'
                    >
                      {isInstalling ? (
                        <>
                          <div className='w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin' />
                          설치 중...
                        </>
                      ) : (
                        <>
                          <Download className='w-4 h-4 mr-2' />
                          지금 설치하기
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => setIsModalOpen(false)}
                      variant='ghost'
                      className='w-full'
                    >
                      나중에
                    </Button>
                  </>
                )}
              </div>
            </FadeInContainer>
          </div>

          {/* Footer */}
          <div className='px-6 pb-6'>
            <p className='text-xs text-ink-light text-center'>
              💡 설치하면 스토리지 용량을 거의 사용하지 않으며
              <br />
              언제든지 쉽게 제거할 수 있습니다
            </p>
          </div>
        </div>
      </AnimatedModal>
    </>
  )
}

// 헤더나 네비게이션에서 사용할 수 있는 간단한 버전
export function PWAInstallPrompt() {
  const { canInstall, isInstalled } = usePWA()

  if (isInstalled || !canInstall) {
    return null
  }

  return (
    <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3'>
      <div className='flex items-center gap-3'>
        <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0'>
          <Download className='w-4 h-4 text-white' />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
            앱으로 설치하기
          </p>
          <p className='text-xs text-blue-700 dark:text-blue-300'>
            더 빠르고 편리한 접근
          </p>
        </div>
        <PWAInstallButton />
      </div>
    </div>
  )
}

