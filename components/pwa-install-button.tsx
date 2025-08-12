'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Check, Smartphone, Monitor } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'

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

  if (isInstalled) {
    return (
      <Button variant="ghost" size="sm" className="gap-2" disabled>
        <Check className="h-4 w-4 text-green-600" />
        앱 설치됨
      </Button>
    )
  }

  if (!canInstall) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="gap-2 hover:bg-amber-50 border-amber-200"
      >
        <Download className="h-4 w-4" />
        앱 설치
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            {!installSuccess ? (
              <div className="space-y-6">
                {/* 앱 아이콘 */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-amber-800">芽</span>
                  </div>
                </div>

                {/* 설명 */}
                <div className="text-center space-y-2">
                  <h3 className="font-bold text-lg text-gray-900">
                    앱으로 더 편리하게
                  </h3>
                  <p className="text-gray-600 text-sm">
                    홈 화면에서 바로 접근하고 오프라인에서도 작품을 감상하세요
                  </p>
                </div>

                {/* 버튼들 */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleInstall}
                    disabled={isInstalling || !canInstall}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    {isInstalling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        설치 중...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        지금 설치하기
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8"
                  >
                    나중에
                  </Button>
                </div>

                {/* 디바이스별 설치 안내 */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm mb-2">
                    수동 설치 방법
                  </h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                      <Smartphone className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>모바일:</strong> 브라우저 메뉴 → "홈 화면에 추가"
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Monitor className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>데스크톱:</strong> 주소창 우측 설치 아이콘 클릭
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    설치 완료!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    홈 화면에서 ANAM Gallery를 찾아보세요
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export function PWAInstallPrompt() {
  const { canInstall, installPWA } = usePWA()

  if (!canInstall) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white border border-amber-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-amber-800">芽</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm">
              ANAM Gallery 앱
            </h3>
            <p className="text-gray-600 text-xs mt-1">
              앱으로 설치하여 더 빠르고 편리하게 이용하세요
            </p>
          </div>

          <Button
            size="sm"
            onClick={installPWA}
            className="bg-amber-600 hover:bg-amber-700 text-xs px-3 py-1 h-8"
          >
            설치
          </Button>
        </div>
      </div>
    </div>
  )
}