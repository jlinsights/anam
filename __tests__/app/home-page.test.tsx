import { fireEvent, render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

// 홈은 클라이언트 페이지다. 예전에는 마운트 직후·300ms·1초·API 오류 때마다 브라우저에서
// getArtworks() 를 불러(브라우저엔 데이터 출처 키가 없음) 지어낸 작품('Tranquility' 등)을 먼저 그렸다.
// 이제 /api/artworks(useArtworks) 만 쓰고, 실패하면 오류와 다시 시도를 보여 준다
const getArtworks = jest.fn()
jest.mock('@/lib/artworks', () => ({
  getArtworks: (...args: unknown[]) => getArtworks(...args),
}))

const retry = jest.fn()
const artworksState = {
  data: null as unknown,
  loading: false,
  error: null as string | null,
  retry,
}
jest.mock('@/hooks/use-artwork-api', () => ({
  useArtworks: () => artworksState,
  useArtist: () => ({ data: null, loading: false, error: 'HTTP 503' }),
}))

jest.mock('@/components/sections/HeroSection', () => ({
  HeroSection: () => null,
}))
jest.mock('@/components/layout/MinimalHeader', () => ({
  MinimalHeader: () => null,
}))

const realArtwork = {
  id: 'rec1',
  slug: 'anam-35',
  title: '남도의 아침 Ⅱ',
  year: 2024,
  medium: '화선지',
  dimensions: '70 x 140 cm',
  imageUrl: '/Images/Artworks/anam-35.jpg',
}

beforeEach(() => {
  jest.clearAllMocks()
  artworksState.data = null
  artworksState.loading = false
  artworksState.error = null
})

describe('홈 작품 갤러리', () => {
  it('API 의 실제 작품을 보여 주고, 브라우저에서 getArtworks() 를 부르지 않는다', async () => {
    artworksState.data = [realArtwork]

    render(<HomePage />)

    expect(
      (await screen.findAllByText('남도의 아침 Ⅱ')).length
    ).toBeGreaterThan(0)
    expect(getArtworks).not.toHaveBeenCalled()
  })

  it('API 가 실패하면 지어낸 작품 대신 오류와 다시 시도를 보여 준다', async () => {
    artworksState.error = 'HTTP error! status: 503'

    render(<HomePage />)

    expect(
      await screen.findByText('작품을 불러오지 못했습니다.')
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(retry).toHaveBeenCalled()

    // 예전의 1초 타이머 fallback 도 돌지 않아야 한다
    await new Promise((resolve) => setTimeout(resolve, 1200))
    expect(getArtworks).not.toHaveBeenCalled()
  })
})

// 2026-11-01 홈 작품 칸이 "로딩 중" 처럼 보였다. 칸마다 animate-pulse + opacity-0 덮개가 있었는데
// Tailwind pulse 키프레임이 opacity 를 0.5 로 올려 덮개가 늘 회색으로 깜빡였고, 작품 칸 전체도
// opacity-0 에서 순서대로 페이드인했다(회전할 때마다 다시). 성곡(seonggok.com)처럼 그림은 바로 보여 준다
describe('홈 작품 칸 이미지 표시', () => {
  it('작품 칸에 깜빡이는 로딩 덮개·투명 페이드가 없다', async () => {
    artworksState.data = [realArtwork]

    const { container } = render(<HomePage />)
    const img = await screen.findByRole('img', { name: '남도의 아침 Ⅱ' })
    const tile = img.closest('a') as HTMLElement

    expect(tile).not.toBeNull()
    expect(tile.className).not.toMatch(/opacity-0|animate-fade-in/)
    expect(tile.querySelector('.animate-pulse, .animate-spin')).toBeNull()
    expect(container.querySelector('#gallery .animate-spin')).toBeNull()
  })
})

