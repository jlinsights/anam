# 격리된 테스트 (quarantine)

2026-10-31 기준 `main`에서 깨져 있던 테스트를 이 폴더로 옮겼다. 당시 Jest 27개 스위트 중 23개가 실패(281건), 1개가 끝나지 않고 멈췄고, `tsc` 오류 261건 중 191건이 테스트 파일에서 나왔다. 대부분 지금은 바뀌었거나 지워진 컴포넌트를 기준으로 쓰인 테스트다.

- Jest는 `jest.config.js`의 `testPathIgnorePatterns`로, `tsc`는 `tsconfig.json`의 `exclude`로 이 폴더 전체를 건너뛴다.
- 되살릴 때는 고친 파일을 원래 경로(`__tests__/` 아래 같은 하위 경로)로 `git mv` 하고, 해당 테스트가 통과하는지 확인한다.
- 이 폴더를 지우면 아래 테스트가 기대하던 동작에 대한 기록도 사라진다. 지울지, 다시 쓸지는 하나씩 판단한다.

## 실패 원인별 목록

### 의존성·모듈 없음 (실행 자체가 안 됨)

| 파일 | 원인 |
|---|---|
| `error-boundary/error-boundary.test.tsx` | `react-error-boundary` 미설치 |
| `error-boundary/advanced-error-scenarios.test.tsx` | `react-error-boundary` 미설치 |
| `integration/api/artworks-slug.test.ts` | `app/api/artworks/[slug]/route` 라우트가 없음 |
| `integration/api/artworks.test.ts` | `jest.mock` 호이스팅으로 `api-handlers`를 초기화 전에 참조 |

### 지금 UI와 맞지 않음 (요소·문구·testid를 못 찾음)

| 파일 | 원인 |
|---|---|
| `accessibility/comprehensive-accessibility.test.tsx` | 모달 `role="dialog"` 없음 |
| `accessibility/focus-management.test.tsx` | 모달 `role="dialog"` 없음 |
| `components/contact-form.test.tsx` | 라벨 문구(`/name/i`) 불일치 |
| `performance/critical-journeys-performance.test.tsx` | `data-testid="gallery-container"` 없음 |

### 목·환경 문제

| 파일 | 원인 |
|---|---|
| `accessibility/regression.test.tsx` | 목 데이터가 `undefined` (`helpers/axe-testing.ts`는 jest-axe 설정 타입도 맞지 않음) |
| `integration/api/contact-comprehensive.test.ts` | `Response.json` 목이 함수가 아님 |
| `integration/api/contact.test.ts` | 응답 문구 기대값 불일치 |
| `pwa/pwa-functionality.test.tsx` | `dispatchEvent` 대상이 DOM 요소가 아님 |

### 기대값이 현재 구현과 다름

| 파일 | 원인 |
|---|---|
| `api/artworks.test.ts` | 반환 개수 기대값 불일치 |
| `lib/store/ui-store.test.ts` | 스토어 동작 기대값 불일치 |
| `lib/utils.test.ts` | 유틸 반환값 기대값 불일치 |

### Jest 기본 실행 밖에 있던 것

| 파일 | 원인 |
|---|---|
| `visual/components-visual-regression.test.tsx` | 실행 중인 서버와 Puppeteer가 필요하고, `jest-image-snapshot` 타입이 없음 |
| `e2e/*.spec.ts` (Playwright) | `@axe-core/playwright`에 없는 `injectAxe`/`checkA11y`와 없는 `expect(...).toHaveCount.greaterThan` 사용 |

## 함께 알아 둘 것

- `npm run test:a11y:regression`, `test:accessibility`, `test:performance`, `test:pwa`, `test:visual`, `test:e2e`는 대상 테스트가 모두 여기 있어 "No tests found"로 끝난다. `accessibility.yml` CI의 회귀 작업은 격리 전에도 실패하고 있었다.
- 여기 테스트만 쓰던 컴포넌트·라이브러리 34개(`components/optimized-gallery.tsx`, `lib/accessibility/*` 등)는 그대로 남아 있다. 테스트를 되살리지 않기로 하면 함께 지울 후보다.

## 2026-11-01 정리 — 대상 코드가 지워진 테스트

어디서도 import 되지 않던 컴포넌트·모듈을 지우면서(`chore/remove-dead-code`), 그 코드만 검사하던 테스트 10개도 함께 지웠다. 대상이 없으니 되살릴 수 없다.

- 지움: `artwork-card`, `artwork-detail-modal-client`, `gallery/enhanced-gallery-component`, `gallery/optimized-gallery`, `optimized-gallery-comprehensive`, `search-filter`, `lib/hooks/use-gallery-filter`, `accessibility/gallery-accessibility`, `performance/gallery-performance`, `visual/gallery-visual-regression`
- 남김(살아 있는 코드도 검사함) — 되살릴 때 지워진 import 를 먼저 걷어낸다:
  - `error-boundary/*` — `ApiErrorBoundary`·`GalleryErrorBoundary`·`ImageErrorBoundary` 삭제됨, `ArtworkErrorBoundary`·`RootErrorBoundary` 는 남음
  - `accessibility/{comprehensive-accessibility,focus-management,regression}`, `performance/critical-journeys-performance`, `helpers/axe-testing.ts` — `artwork-detail-modal-client`·`language-switcher`·`single-page/Navigation`·`social-share`·`lib/accessibility/*` 삭제됨
  - `lib/utils.test.ts` — `lib/security`·`lib/image-utils` 삭제됨, `cn`(`lib/utils`) 검사는 유효
