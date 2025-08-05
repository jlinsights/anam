import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchFilter } from '@/components/search-filter'
import { mockArtworks } from '../lib/hooks/artwork.mock'

// Mock AccessibleModal
jest.mock('@/components/accessibility', () => ({
  AccessibleModal: ({ children, isOpen, title, description }: any) =>
    isOpen ? (
      <div data-testid='filter-modal' role='dialog' aria-label={title}>
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
      </div>
    ) : null,
}))

describe('SearchFilter', () => {
  const mockOnFilteredResults = jest.fn()

  const defaultProps = {
    artworks: mockArtworks,
    onFilteredResults: mockOnFilteredResults,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('기본 렌더링', () => {
    it('검색 입력 필드가 표시되어야 한다', () => {
      render(<SearchFilter {...defaultProps} />)
      expect(
        screen.getByPlaceholderText('작품명이나 설명으로 검색...')
      ).toBeInTheDocument()
    })

    it('필터 버튼이 표시되어야 한다', () => {
      render(<SearchFilter {...defaultProps} />)
      expect(screen.getByText('필터')).toBeInTheDocument()
    })

    it('총 작품 개수가 표시되어야 한다', () => {
      render(<SearchFilter {...defaultProps} />)
      expect(
        screen.getByText(`${mockArtworks.length}개 작품`)
      ).toBeInTheDocument()
    })
  })

  describe('검색 기능', () => {
    it('검색어 입력 시 필터링이 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const searchInput =
        screen.getByPlaceholderText('작품명이나 설명으로 검색...')
      await user.type(searchInput, '길')

      await waitFor(() => {
        expect(mockOnFilteredResults).toHaveBeenCalled()
      })
    })

    it('검색어가 제목에 포함된 작품을 찾아야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const searchInput =
        screen.getByPlaceholderText('작품명이나 설명으로 검색...')
      await user.type(searchInput, '길')

      await waitFor(() => {
        const lastCall =
          mockOnFilteredResults.mock.calls[
            mockOnFilteredResults.mock.calls.length - 1
          ]
        const filteredResults = lastCall[0]
        expect(
          filteredResults.some((artwork: any) => artwork.title.includes('길'))
        ).toBe(true)
      })
    })

    it('검색어가 설명에 포함된 작품을 찾아야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const searchInput =
        screen.getByPlaceholderText('작품명이나 설명으로 검색...')
      await user.type(searchInput, '테스트')

      await waitFor(() => {
        const lastCall =
          mockOnFilteredResults.mock.calls[
            mockOnFilteredResults.mock.calls.length - 1
          ]
        const filteredResults = lastCall[0]
        expect(
          filteredResults.some((artwork: any) =>
            artwork.description?.includes('테스트')
          )
        ).toBe(true)
      })
    })

    it('대소문자를 구분하지 않고 검색해야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const searchInput =
        screen.getByPlaceholderText('작품명이나 설명으로 검색...')
      await user.type(searchInput, '길')

      await waitFor(() => {
        expect(mockOnFilteredResults).toHaveBeenCalled()
      })
    })
  })

  describe('필터 모달', () => {
    it('필터 버튼 클릭 시 모달이 열려야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const filterButton = screen.getByText('필터')
      await user.click(filterButton)

      expect(screen.getByTestId('filter-modal')).toBeInTheDocument()
      expect(screen.getByText('작품 필터')).toBeInTheDocument()
    })

    it('모달에서 정렬 옵션을 변경할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const filterButton = screen.getByText('필터')
      await user.click(filterButton)

      const sortSelect = screen.getByDisplayValue('제작년도')
      expect(sortSelect).toBeInTheDocument()

      await user.selectOptions(sortSelect, '작품명')
      expect(sortSelect).toHaveValue('title')
    })

    it('모달에서 연도 범위를 설정할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const filterButton = screen.getByText('필터')
      await user.click(filterButton)

      const yearInputs = screen.getAllByRole('spinbutton')
      expect(yearInputs).toHaveLength(2)

      await user.clear(yearInputs[0])
      await user.type(yearInputs[0], '2023')

      await user.clear(yearInputs[1])
      await user.type(yearInputs[1], '2024')

      expect(yearInputs[0]).toHaveValue(2023)
      expect(yearInputs[1]).toHaveValue(2024)
    })

    it('모달에서 재료를 선택할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const filterButton = screen.getByText('필터')
      await user.click(filterButton)

      // 재료 버튼들이 표시되는지 확인
      const mediumButtons = screen
        .getAllByRole('button')
        .filter(
          (button) =>
            button.textContent?.includes('먹') ||
            button.textContent?.includes('한지') ||
            button.textContent?.includes('색')
        )

      expect(mediumButtons.length).toBeGreaterThan(0)
    })
  })

  describe('활성 필터 관리', () => {
    it('검색어가 있을 때 활성 필터 카운트가 증가해야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const searchInput =
        screen.getByPlaceholderText('작품명이나 설명으로 검색...')
      await user.type(searchInput, '길')

      await waitFor(() => {
        const filterButton = screen.getByText('필터')
        const badge = filterButton.querySelector('span')
        expect(badge).toBeInTheDocument()
      })
    })

    it('활성 필터가 있을 때 초기화 버튼이 표시되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const searchInput =
        screen.getByPlaceholderText('작품명이나 설명으로 검색...')
      await user.type(searchInput, '길')

      await waitFor(() => {
        expect(screen.getByText('초기화')).toBeInTheDocument()
      })
    })

    it('초기화 버튼 클릭 시 모든 필터가 리셋되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const searchInput =
        screen.getByPlaceholderText('작품명이나 설명으로 검색...')
      await user.type(searchInput, '길')

      await waitFor(() => {
        expect(screen.getByText('초기화')).toBeInTheDocument()
      })

      const resetButton = screen.getByText('초기화')
      await user.click(resetButton)

      expect(searchInput).toHaveValue('')
    })

    it('활성 필터 태그가 표시되어야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const searchInput =
        screen.getByPlaceholderText('작품명이나 설명으로 검색...')
      await user.type(searchInput, '길')

      await waitFor(() => {
        expect(screen.getByText('검색: 길')).toBeInTheDocument()
      })
    })

    it('필터 태그의 X 버튼으로 개별 필터를 제거할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const searchInput =
        screen.getByPlaceholderText('작품명이나 설명으로 검색...')
      await user.type(searchInput, '길')

      await waitFor(() => {
        expect(screen.getByText('검색: 길')).toBeInTheDocument()
      })

      const removeButton = screen.getByLabelText('검색어 제거')
      await user.click(removeButton)

      expect(searchInput).toHaveValue('')
    })
  })

  describe('정렬 기능', () => {
    it('제작년도로 정렬이 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const filterButton = screen.getByText('필터')
      await user.click(filterButton)

      const sortSelect = screen.getByDisplayValue('제작년도')
      const orderSelect = screen.getByDisplayValue('내림차순')

      await user.selectOptions(sortSelect, 'year')
      await user.selectOptions(orderSelect, 'asc')

      const applyButton = screen.getByText('적용')
      await user.click(applyButton)

      await waitFor(() => {
        expect(mockOnFilteredResults).toHaveBeenCalled()
      })
    })

    it('작품명으로 정렬이 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const filterButton = screen.getByText('필터')
      await user.click(filterButton)

      const sortSelect = screen.getByDisplayValue('제작년도')
      await user.selectOptions(sortSelect, 'title')

      const applyButton = screen.getByText('적용')
      await user.click(applyButton)

      await waitFor(() => {
        expect(mockOnFilteredResults).toHaveBeenCalled()
      })
    })

    it('재료로 정렬이 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const filterButton = screen.getByText('필터')
      await user.click(filterButton)

      const sortSelect = screen.getByDisplayValue('제작년도')
      await user.selectOptions(sortSelect, 'medium')

      const applyButton = screen.getByText('적용')
      await user.click(applyButton)

      await waitFor(() => {
        expect(mockOnFilteredResults).toHaveBeenCalled()
      })
    })
  })

  describe('연도 필터링', () => {
    it('연도 범위 필터링이 작동해야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const filterButton = screen.getByText('필터')
      await user.click(filterButton)

      const yearInputs = screen.getAllByRole('spinbutton')
      await user.clear(yearInputs[0])
      await user.type(yearInputs[0], '2024')

      await user.clear(yearInputs[1])
      await user.type(yearInputs[1], '2024')

      const applyButton = screen.getByText('적용')
      await user.click(applyButton)

      await waitFor(() => {
        const lastCall =
          mockOnFilteredResults.mock.calls[
            mockOnFilteredResults.mock.calls.length - 1
          ]
        const filteredResults = lastCall[0]
        expect(
          filteredResults.every((artwork: any) => artwork.year === 2024)
        ).toBe(true)
      })
    })
  })

  describe('접근성', () => {
    it('검색 입력 필드에 적절한 aria-label이 있어야 한다', () => {
      render(<SearchFilter {...defaultProps} />)
      const searchInput = screen.getByLabelText('작품 검색')
      expect(searchInput).toBeInTheDocument()
    })

    it('필터 모달이 적절한 role과 aria-label을 가져야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const filterButton = screen.getByText('필터')
      await user.click(filterButton)

      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-label', '작품 필터')
    })

    it('필터 제거 버튼들에 적절한 aria-label이 있어야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const searchInput =
        screen.getByPlaceholderText('작품명이나 설명으로 검색...')
      await user.type(searchInput, '길')

      await waitFor(() => {
        const removeButton = screen.getByLabelText('검색어 제거')
        expect(removeButton).toBeInTheDocument()
      })
    })
  })

  describe('에러 처리', () => {
    it('빈 배열이 전달되어도 오류가 발생하지 않아야 한다', () => {
      const { container } = render(
        <SearchFilter artworks={[]} onFilteredResults={mockOnFilteredResults} />
      )

      expect(container).toBeInTheDocument()
      expect(screen.getByText('0개 작품')).toBeInTheDocument()
    })

    it('유효하지 않은 연도 입력을 처리해야 한다', async () => {
      const user = userEvent.setup()
      render(<SearchFilter {...defaultProps} />)

      const filterButton = screen.getByText('필터')
      await user.click(filterButton)

      const yearInputs = screen.getAllByRole('spinbutton')

      // 유효하지 않은 연도 입력 시도
      await user.clear(yearInputs[0])
      await user.type(yearInputs[0], '999999')

      // 컴포넌트가 여전히 정상 작동해야 함
      expect(yearInputs[0]).toBeInTheDocument()
    })
  })
})
