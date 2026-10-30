import { render, screen } from '@testing-library/react'
import {
  useGalleryFilters,
  useModalState,
} from '@/lib/stores/gallery-store-safe'

// zustand v5는 셀렉터 결과를 Object.is로 비교하므로, 매번 새 객체를 반환하면
// 렌더마다 스냅샷이 바뀐 것으로 보고 무한 렌더(React #185)에 빠진다
function FiltersProbe() {
  const { searchTerm, selectedYear } = useGalleryFilters()
  return (
    <p>
      filters:{searchTerm}|{String(selectedYear)}
    </p>
  )
}

function ModalProbe() {
  const { isOpen } = useModalState()
  return <p>modal:{String(isOpen)}</p>
}

describe('gallery-store-safe 객체 셀렉터', () => {
  it('useGalleryFilters는 무한 렌더 없이 렌더된다', () => {
    render(<FiltersProbe />)
    expect(screen.getByText(/^filters:/)).toBeInTheDocument()
  })

  it('useModalState는 무한 렌더 없이 렌더된다', () => {
    render(<ModalProbe />)
    expect(screen.getByText('modal:false')).toBeInTheDocument()
  })
})
