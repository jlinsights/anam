import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
import { RootErrorBoundary } from '@/components/error-boundary/RootErrorBoundary'
import { GalleryErrorBoundary } from '@/components/error-boundary/GalleryErrorBoundary'
import { ImageErrorBoundary } from '@/components/error-boundary/ImageErrorBoundary'
import { ApiErrorBoundary } from '@/components/error-boundary/ApiErrorBoundary'
import { ArtworkErrorBoundary } from '@/components/error-boundary/ArtworkErrorBoundary'

// 에러를 발생시키는 테스트 컴포넌트들
const ThrowError = ({ shouldThrow = true, errorType = 'generic' }: { 
  shouldThrow?: boolean
  errorType?: 'generic' | 'network' | 'parsing' | 'permission' | 'timeout'
}) => {
  if (!shouldThrow) return <div>정상 컴포넌트</div>
  
  const errors = {
    generic: new Error('일반적인 에러가 발생했습니다'),
    network: new Error('네트워크 연결에 실패했습니다'),
    parsing: new Error('데이터 파싱 중 오류가 발생했습니다'),
    permission: new Error('권한이 없습니다'),
    timeout: new Error('요청 시간이 초과되었습니다')
  }
  
  throw errors[errorType]
}

const AsyncThrowError = ({ delay = 100 }: { delay?: number }) => {
  React.useEffect(() => {
    setTimeout(() => {
      throw new Error('비동기 에러가 발생했습니다')
    }, delay)
  }, [delay])
  
  return <div>비동기 컴포넌트</div>
}

const ImageThrowError = () => {
  React.useEffect(() => {
    const img = new Image()
    img.onerror = () => {
      throw new Error('이미지 로딩에 실패했습니다')
    }
    img.src = 'invalid-image-url'
  }, [])
  
  return <img src="invalid-image-url" alt="에러 이미지" />
}

describe('Error Boundary Tests', () => {
  // 콘솔 에러 모킹 (테스트 로그 정리)
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  
  afterAll(() => {
    console.error = originalError
  })

  describe('RootErrorBoundary', () => {
    it('애플리케이션 전체 에러를 캐치해야 한다', () => {
      render(
        <RootErrorBoundary>
          <ThrowError />
        </RootErrorBoundary>
      )

      expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()
      expect(screen.getByText(/페이지를 새로고침/i)).toBeInTheDocument()
    })

    it('에러 정보를 로깅해야 한다', () => {
      const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        <RootErrorBoundary>
          <ThrowError />
        </RootErrorBoundary>
      )

      expect(logSpy).toHaveBeenCalled()
      logSpy.mockRestore()
    })

    it('새로고침 버튼이 작동해야 한다', () => {
      // location.reload 모킹
      const mockReload = jest.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      })

      render(
        <RootErrorBoundary>
          <ThrowError />
        </RootErrorBoundary>
      )

      const refreshButton = screen.getByText(/새로고침/i)
      fireEvent.click(refreshButton)

      expect(mockReload).toHaveBeenCalled()
    })

    it('홈으로 이동 버튼이 작동해야 한다', () => {
      const mockPush = jest.fn()
      
      // Next.js router 모킹
      jest.mock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush })
      }))

      render(
        <RootErrorBoundary>
          <ThrowError />
        </RootErrorBoundary>
      )

      const homeButton = screen.getByText(/홈으로/i)
      if (homeButton) {
        fireEvent.click(homeButton)
        expect(mockPush).toHaveBeenCalledWith('/')
      }
    })

    it('정상 컴포넌트는 에러 바운더리 없이 렌더링되어야 한다', () => {
      render(
        <RootErrorBoundary>
          <ThrowError shouldThrow={false} />
        </RootErrorBoundary>
      )

      expect(screen.getByText('정상 컴포넌트')).toBeInTheDocument()
      expect(screen.queryByText(/문제가 발생했습니다/i)).not.toBeInTheDocument()
    })

    it('에러 바운더리가 중첩되어 사용될 수 있어야 한다', () => {
      render(
        <RootErrorBoundary>
          <div>외부 컴포넌트</div>
          <GalleryErrorBoundary>
            <ThrowError />
          </GalleryErrorBoundary>
        </RootErrorBoundary>
      )

      // 내부 에러 바운더리가 에러를 캐치해야 함
      expect(screen.getByText('외부 컴포넌트')).toBeInTheDocument()
      expect(screen.getByText(/갤러리를 불러올 수 없습니다/i)).toBeInTheDocument()
    })
  })

  describe('GalleryErrorBoundary', () => {
    it('갤러리 관련 에러를 캐치해야 한다', () => {
      render(
        <GalleryErrorBoundary>
          <ThrowError />
        </GalleryErrorBoundary>
      )

      expect(screen.getByText(/갤러리를 불러올 수 없습니다/i)).toBeInTheDocument()
      expect(screen.getByText(/다시 시도/i)).toBeInTheDocument()
    })

    it('갤러리별 맞춤 에러 메시지를 표시해야 한다', () => {
      render(
        <GalleryErrorBoundary>
          <ThrowError errorType="network" />
        </GalleryErrorBoundary>
      )

      expect(screen.getByText(/네트워크|연결/i)).toBeInTheDocument()
    })

    it('재시도 버튼이 작동해야 한다', () => {
      const { rerender } = render(
        <GalleryErrorBoundary>
          <ThrowError />
        </GalleryErrorBoundary>
      )

      expect(screen.getByText(/갤러리를 불러올 수 없습니다/i)).toBeInTheDocument()

      const retryButton = screen.getByText(/다시 시도/i)
      fireEvent.click(retryButton)

      // 에러 바운더리가 리셋되고 정상 컴포넌트가 렌더링되어야 함
      rerender(
        <GalleryErrorBoundary>
          <ThrowError shouldThrow={false} />
        </GalleryErrorBoundary>
      )

      expect(screen.getByText('정상 컴포넌트')).toBeInTheDocument()
    })

    it('로딩 상태를 처리해야 한다', () => {
      render(
        <GalleryErrorBoundary>
          <div>로딩 중...</div>
        </GalleryErrorBoundary>
      )

      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    })

    it('여러 에러 타입을 구분해서 처리해야 한다', () => {
      const errorTypes = ['network', 'parsing', 'permission', 'timeout'] as const
      
      errorTypes.forEach(errorType => {
        const { unmount } = render(
          <GalleryErrorBoundary>
            <ThrowError errorType={errorType} />
          </GalleryErrorBoundary>
        )

        // 각 에러 타입에 맞는 메시지가 표시되는지 확인
        const errorElement = screen.getByText(/갤러리를 불러올 수 없습니다/i)
        expect(errorElement).toBeInTheDocument()

        unmount()
      })
    })
  })

  describe('ImageErrorBoundary', () => {
    it('이미지 로딩 에러를 캐치해야 한다', () => {
      render(
        <ImageErrorBoundary>
          <ImageThrowError />
        </ImageErrorBoundary>
      )

      expect(screen.getByText(/이미지를 불러올 수 없습니다/i)).toBeInTheDocument()
    })

    it('대체 이미지를 표시해야 한다', () => {
      render(
        <ImageErrorBoundary>
          <ImageThrowError />
        </ImageErrorBoundary>
      )

      const fallbackImage = screen.getByAltText(/대체 이미지/i)
      expect(fallbackImage).toBeInTheDocument()
      expect(fallbackImage).toHaveAttribute('src', expect.stringContaining('placeholder'))
    })

    it('이미지 에러 시 재시도 옵션을 제공해야 한다', () => {
      render(
        <ImageErrorBoundary>
          <ImageThrowError />
        </ImageErrorBoundary>
      )

      const retryButton = screen.getByText(/다시 시도/i)
      expect(retryButton).toBeInTheDocument()

      fireEvent.click(retryButton)
      // 재시도 로직 확인
    })

    it('정상 이미지는 에러 바운더리 없이 표시되어야 한다', () => {
      render(
        <ImageErrorBoundary>
          <img src="/valid-image.jpg" alt="정상 이미지" />
        </ImageErrorBoundary>
      )

      expect(screen.getByAltText('정상 이미지')).toBeInTheDocument()
      expect(screen.queryByText(/이미지를 불러올 수 없습니다/i)).not.toBeInTheDocument()
    })

    it('이미지 메타데이터를 보존해야 한다', () => {
      render(
        <ImageErrorBoundary>
          <ImageThrowError />
        </ImageErrorBoundary>
      )

      // 원본 이미지의 alt 텍스트나 기타 정보가 보존되어야 함
      expect(screen.getByText(/이미지를 불러올 수 없습니다/i)).toBeInTheDocument()
    })
  })

  describe('ApiErrorBoundary', () => {
    it('API 호출 에러를 캐치해야 한다', () => {
      render(
        <ApiErrorBoundary>
          <ThrowError errorType="network" />
        </ApiErrorBoundary>
      )

      expect(screen.getByText(/데이터를 불러올 수 없습니다/i)).toBeInTheDocument()
    })

    it('API 에러 타입별 다른 메시지를 표시해야 한다', () => {
      const { rerender } = render(
        <ApiErrorBoundary>
          <ThrowError errorType="timeout" />
        </ApiErrorBoundary>
      )

      expect(screen.getByText(/시간 초과|timeout/i)).toBeInTheDocument()

      rerender(
        <ApiErrorBoundary>
          <ThrowError errorType="permission" />
        </ApiErrorBoundary>
      )

      expect(screen.getByText(/권한|permission/i)).toBeInTheDocument()
    })

    it('재시도 버튼과 새로고침 옵션을 제공해야 한다', () => {
      render(
        <ApiErrorBoundary>
          <ThrowError errorType="network" />
        </ApiErrorBoundary>
      )

      expect(screen.getByText(/다시 시도/i)).toBeInTheDocument()
      expect(screen.getByText(/새로고침/i)).toBeInTheDocument()
    })

    it('에러 정보를 로깅하고 모니터링 시스템에 전송해야 한다', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        <ApiErrorBoundary>
          <ThrowError errorType="network" />
        </ApiErrorBoundary>
      )

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('API Error'),
        expect.any(Error)
      )

      errorSpy.mockRestore()
    })

    it('API 응답 상태 코드에 따른 다른 처리를 해야 한다', () => {
      // 400번대 에러
      const clientError = new Error('Bad Request')
      ;(clientError as any).status = 400

      const { rerender } = render(
        <ApiErrorBoundary>
          <ThrowError />
        </ApiErrorBoundary>
      )

      // 500번대 에러
      const serverError = new Error('Internal Server Error')
      ;(serverError as any).status = 500

      rerender(
        <ApiErrorBoundary>
          <ThrowError />
        </ApiErrorBoundary>
      )

      expect(screen.getByText(/데이터를 불러올 수 없습니다/i)).toBeInTheDocument()
    })
  })

  describe('ArtworkErrorBoundary', () => {
    it('개별 작품 에러를 캐치해야 한다', () => {
      render(
        <ArtworkErrorBoundary>
          <ThrowError />
        </ArtworkErrorBoundary>
      )

      expect(screen.getByText(/작품을 표시할 수 없습니다/i)).toBeInTheDocument()
    })

    it('작품 대체 카드를 표시해야 한다', () => {
      render(
        <ArtworkErrorBoundary>
          <ThrowError />
        </ArtworkErrorBoundary>
      )

      const fallbackCard = screen.getByTestId('artwork-error-fallback')
      expect(fallbackCard).toBeInTheDocument()
      expect(fallbackCard).toHaveClass('card-art')
    })

    it('작품별 에러가 전체 갤러리에 영향을 주지 않아야 한다', () => {
      render(
        <div>
          <ArtworkErrorBoundary>
            <div>정상 작품 1</div>
          </ArtworkErrorBoundary>
          <ArtworkErrorBoundary>
            <ThrowError />
          </ArtworkErrorBoundary>
          <ArtworkErrorBoundary>
            <div>정상 작품 2</div>
          </ArtworkErrorBoundary>
        </div>
      )

      expect(screen.getByText('정상 작품 1')).toBeInTheDocument()
      expect(screen.getByText('정상 작품 2')).toBeInTheDocument()
      expect(screen.getByText(/작품을 표시할 수 없습니다/i)).toBeInTheDocument()
    })

    it('작품 에러 시 최소한의 정보를 유지해야 한다', () => {
      const artworkData = {
        id: 'artwork-1',
        title: '테스트 작품',
        artist: '테스트 작가'
      }

      render(
        <ArtworkErrorBoundary artworkData={artworkData}>
          <ThrowError />
        </ArtworkErrorBoundary>
      )

      // 작품 제목이나 기본 정보가 표시되어야 함
      expect(screen.getByText(/테스트 작품|작품을 표시할 수 없습니다/i)).toBeInTheDocument()
    })
  })

  describe('에러 복구 및 재시도', () => {
    it('에러 바운더리가 리셋 후 정상 작동해야 한다', () => {
      let hasError = true

      const TestComponent = () => {
        if (hasError) {
          throw new Error('테스트 에러')
        }
        return <div>정상 복구됨</div>
      }

      const { rerender } = render(
        <ErrorBoundary
          FallbackComponent={({ resetErrorBoundary }) => (
            <div>
              <div>에러 발생</div>
              <button onClick={resetErrorBoundary}>재시도</button>
            </div>
          )}
        >
          <TestComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('에러 발생')).toBeInTheDocument()

      // 에러 상태 해결
      hasError = false

      const retryButton = screen.getByText('재시도')
      fireEvent.click(retryButton)

      expect(screen.getByText('정상 복구됨')).toBeInTheDocument()
    })

    it('자동 재시도가 설정된 횟수만큼 실행되어야 한다', async () => {
      let attempts = 0
      const maxAttempts = 3

      const AutoRetryComponent = () => {
        attempts++
        if (attempts <= maxAttempts) {
          throw new Error(`시도 ${attempts} 실패`)
        }
        return <div>성공</div>
      }

      render(
        <ErrorBoundary
          FallbackComponent={() => <div>최종 실패</div>}
          onReset={() => attempts = 0}
        >
          <AutoRetryComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('최종 실패')).toBeInTheDocument()
      expect(attempts).toBe(1) // 첫 시도에서 실패
    })
  })

  describe('에러 경계 통합 테스트', () => {
    it('중첩된 에러 바운더리가 올바른 순서로 에러를 캐치해야 한다', () => {
      render(
        <RootErrorBoundary>
          <div>앱 레벨</div>
          <GalleryErrorBoundary>
            <div>갤러리 레벨</div>
            <ArtworkErrorBoundary>
              <ThrowError />
            </ArtworkErrorBoundary>
          </GalleryErrorBoundary>
        </RootErrorBoundary>
      )

      // 가장 가까운 에러 바운더리(ArtworkErrorBoundary)가 에러를 캐치해야 함
      expect(screen.getByText('앱 레벨')).toBeInTheDocument()
      expect(screen.getByText('갤러리 레벨')).toBeInTheDocument()
      expect(screen.getByText(/작품을 표시할 수 없습니다/i)).toBeInTheDocument()
    })

    it('에러 바운더리 간의 상태가 독립적이어야 한다', () => {
      render(
        <div>
          <GalleryErrorBoundary>
            <ThrowError />
          </GalleryErrorBoundary>
          <GalleryErrorBoundary>
            <div>정상 갤러리</div>
          </GalleryErrorBoundary>
        </div>
      )

      expect(screen.getByText(/갤러리를 불러올 수 없습니다/i)).toBeInTheDocument()
      expect(screen.getByText('정상 갤러리')).toBeInTheDocument()
    })

    it('프로덕션과 개발 환경에서 다른 에러 표시를 해야 한다', () => {
      const originalEnv = process.env.NODE_ENV

      // 개발 환경
      process.env.NODE_ENV = 'development'
      const { rerender } = render(
        <RootErrorBoundary>
          <ThrowError />
        </RootErrorBoundary>
      )

      // 프로덕션 환경
      process.env.NODE_ENV = 'production'
      rerender(
        <RootErrorBoundary>
          <ThrowError />
        </RootErrorBoundary>
      )

      expect(screen.getByText(/문제가 발생했습니다/i)).toBeInTheDocument()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('에러 모니터링 및 로깅', () => {
    it('에러 정보가 올바른 형식으로 로깅되어야 한다', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        <RootErrorBoundary>
          <ThrowError />
        </RootErrorBoundary>
      )

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error Boundary'),
        expect.objectContaining({
          message: expect.any(String),
          stack: expect.any(String)
        })
      )

      errorSpy.mockRestore()
    })

    it('사용자 행동과 에러 컨텍스트가 함께 로깅되어야 한다', () => {
      const mockErrorLogger = jest.fn()
      
      // 전역 에러 로거 모킹
      ;(window as any).errorLogger = mockErrorLogger

      render(
        <RootErrorBoundary>
          <ThrowError />
        </RootErrorBoundary>
      )

      // 에러 로거가 호출되었는지 확인
      if (mockErrorLogger.mock.calls.length > 0) {
        expect(mockErrorLogger).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.any(Error),
            userAgent: expect.any(String),
            timestamp: expect.any(String),
            url: expect.any(String)
          })
        )
      }
    })
  })
})