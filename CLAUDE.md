# CLAUDE.md

> 이 파일이 에이전트 지침의 단일 출처다. `AGENTS.md`(Codex 등)는 이 파일을 가리키는 포인터일 뿐이니 내용은 여기에만 쓴다.

서예가 **아남 배옥영(芽南 裵玉永)** 의 작품 갤러리. Next.js App Router 사이트이고 Vercel 에 배포한다.

- 무엇을·누구를 위해 만드는지: `PRODUCT.md`
- 화면 디자인 원칙·색·글꼴: `DESIGN.md`
- 이 파일: 코드에서 지켜야 할 것과 실제 구조

현재 수치(작품 수·테스트 수·커버리지 기준 등)는 여기 옮겨 적지 않는다. 문서의 숫자는 금방 낡는다 — 필요하면 해당 파일이나 데이터를 직접 본다.

## 절대 규칙

1. **사실은 출처에서만.** 작가·작품 정보(약력·수상·생년·해설·SNS 주소 등)를 코드에 지어 넣지 않는다. 데이터를 못 받으면 비워 두거나 오류를 보여 준다.
   - 예전 `fallbackArtworksData`(영어 제목 작품 목록)·`fallbackArtistData`(수상·생년)·가짜 SNS 주소가 운영 화면에 실제처럼 나갔다. 2026-11-01 모두 삭제했다. 되살리지 않는다.
   - 테스트 `__tests__/lib/no-fabricated-artworks.test.ts`·`__tests__/lib/site-config.test.ts` 가 이를 지킨다.
2. **클라이언트 컴포넌트는 서버 로더를 부르지 않는다.** `'use client'` 파일에서 `getArtworks()` 같은 서버 함수를 부르면 브라우저에 데이터 출처 키가 없어 늘 빈 값이 된다. 클라이언트는 `/api/artworks`·`/api/artist` 를 쓴다(`hooks/use-artwork-api.ts` 의 `useArtworks`·`useArtist`, `lib/artworks.ts` 의 `fetchArtworksFromApi`).
3. **실패는 캐시하지 않는다.** `/api/artworks`·`/api/artist` 는 실제 데이터를 못 받으면 503 을 주고, 그 결과를 캐시에 넣지 않는다. 200 + `data: null` 을 돌려주면 `useFetch` 가 응답 봉투를 데이터로 착각한다.
4. **캐시를 비우는 엔드포인트는 인증한다.** 시크릿 비교는 `lib/server-secret.ts`(`isValidSecret`·`hasBearerSecret`, 타이밍 안전·빈 env 는 거부)를 쓴다.

## 명령

```bash
npm run dev            # localhost:3000
npm run type-check     # tsc --noEmit
npm run lint:check     # eslint . (확인만)
npm run lint           # eslint --fix . — 파일을 고친다. 실행 전후로 git status 를 비교할 것
npm test               # jest
npm run test:coverage  # 커버리지 기준은 jest.config.js 의 coverageThreshold
npm run build          # 프로덕션 빌드
npm run test:e2e       # Playwright (__tests__/e2e)
```

**Claude Code 에서 빌드·테스트할 때는 `env -u NODE_ENV` 를 붙인다.** 셸에 `NODE_ENV=development` 가 주입돼 있으면 `next build` 가 `/404` 프리렌더에서 `<Html> should not be imported` 로 실패한다.

## 데이터 흐름

원본은 작가 측이 관리하는 **Airtable** 하나다. 운영 작품 데이터는 그 **Supabase 사본**에서 읽는다.

| 무엇 | 어디서 읽나 | 파일 |
|---|---|---|
| 작품 목록(서버) | Supabase → 없으면 Airtable → 둘 다 없으면 `[]` | `lib/artworks.ts` `getArtworks()` |
| 작품 상세 `/gallery/[slug]` | Supabase 우선 | `lib/artworks.ts` `getArtworkBySlug()` |
| 작품 목록(클라이언트) | `/api/artworks` | `hooks/use-artwork-api.ts` `useArtworks()`, `fetchArtworksFromApi()` |
| 작가(서버 페이지) | Airtable | `lib/artist.ts` `fetchArtist()` |
| 작가(클라이언트) | `/api/artist` → Supabase | `useArtist()`, `app/api/artist/route.ts` |
| 전시 이력 | 작가 데이터에서 정리 | `lib/exhibition-history.ts` |

- **Airtable 만 고치면 작품 화면은 바뀌지 않는다.** Supabase 사본도 맞춰야 한다: `scripts/migrate-airtable-to-supabase.ts`. 절차는 `docs/SUPABASE_MIGRATION_GUIDE.md`.
- 캐시: `lib/cache.ts` 의 공용 메모리 저장소(`getCachedData`·`setCachedData`·`clearCache`)와 `clearCacheAndRevalidate(tag)`(메모리 캐시를 비우고 `revalidateTag`). API 라우트 캐시도 여기 둬야 동기화가 함께 비운다.
- 동기화 경로: `/api/admin/sync`(`ADMIN_SYNC_TOKEN`), `/api/sync/airtable`(Airtable 웹훅, `AIRTABLE_WEBHOOK_SECRET`), `/api/revalidate`(`REVALIDATE_SECRET`). 셋 다 캐시만 비운다 — Supabase 사본을 갱신하지는 않는다. 웹훅 설정은 `docs/AIRTABLE_WEBHOOK_SETUP.md`.
- 메모리 캐시는 서버리스 인스턴스마다 따로 있다. 한 인스턴스를 비워도 다른 인스턴스는 TTL 까지 이전 값을 줄 수 있다.
- 작품 이미지: `public/Images/Artworks/`. 잘리지 않은 상세용 `NN-full.jpg`(긴 변 1800)와 작은 칸용 `NN-preview.jpg`(긴 변 800)는 `scripts/generate-full-images.mjs` 로 만들고, 크기 표는 `lib/artwork-full-sizes.json`, 경로는 `lib/artwork-full-image.ts`(`fullImageFor`·`previewImageFor`). **`NN-medium`·`NN-large` 는 정사각형으로 잘려 있다**(61점 중 41점) — 작품 전체를 보여 줄 자리에 쓰지 않는다.
- **작품 이미지는 정적 파일을 그대로 준다.** `next.config.mjs` 의 `images.unoptimized: true` — Vercel 이미지 최적화(`/_next/image`)는 2026-11-01 한도가 소진돼 402 를 냈다. 크기별 파일(thumb·medium·large·full)을 이미 만들어 두었으니 최적화 서버에 기대지 않는다.
- **이미지에 로딩 효과를 넣지 않는다.** 스피너·깜빡이는 덮개·투명도 페이드·IntersectionObserver 로 src 늦게 넣기 모두 금지. `<img loading="lazy" decoding="async">`(첫 화면은 `eager`)와 종이색 바탕이면 된다 — seonggok.com 방식. 예전 효과들은 실패 시 스피너만 영원히 돌거나 그림을 반투명하게 덮었다. `components/common/ProgressiveImage.tsx`·홈 작품 칸 테스트가 지킨다.
- **서비스 워커를 쓰지 않는다.** 예전 `public/sw.js` 는 이미지 실패를 "이미지를 불러올 수 없습니다" 가짜 그림으로 바꾸고 30일 캐시했다. 지금 `public/sw.js` 는 이미 설치된 방문자 브라우저에서 스스로 해제하는 워커이고, `components/service-worker-registration.tsx` 는 등록 대신 해제·캐시 삭제를 한다. 둘 다 지우지 않는다(옛 워커가 남은 방문자가 있다).

## 구조

```
app/
  page.tsx               # 첫 화면 (client) — /api 로 작품·작가를 받는다
  gallery/page.tsx       # 전체 작품 (client)
  gallery/[slug]/        # 작품 상세 (server, force-dynamic)
  artist/ contact/ exhibition/ offline/
  single-page/           # 실험 경로. 운영에 공개돼 있고 유지 여부 미정(PRODUCT.md). /aceternity-demo 는 2026-11-01 삭제
  api/                   # artworks · artist · contact · revalidate · admin/sync · sync/airtable · health …
                         # debug·debug-images 는 lib/debug-guard.ts(ENABLE_DEBUG_ROUTES)로, test-*·performance·
                         # security·rate-limit 는 각 라우트의 NODE_ENV==='production' 검사로 운영에서 막는다
components/
  sections/ single-page/ exhibition/ layout/ artwork-detail/ common/ error-boundary/ ui/
hooks/                   # use-api-request.ts(useApiRequest·useFetch), use-artwork-api.ts(useArtworks·useArtist 등)
lib/
  artworks.ts artist.ts airtable.ts supabase/   # 데이터 로더
  cache.ts server-secret.ts rate-limit.ts debug-guard.ts error-handler.ts
  constants/site-config.ts                      # 사이트 메타·SNS(확인된 계정만)
  types.ts schemas.ts content-text.ts exhibition-history.ts
scripts/                 # 이관·이미지·점검용 Node 스크립트 (앱 번들에 들어가지 않음)
__tests__/               # Jest. _quarantine/ 은 깨진 채 격리된 테스트 — jest·tsc 둘 다 건너뛴다
```

2026-11-01 어디서도 import 되지 않던 파일을 정리했다. 새 파일을 만들기 전에 비슷한 것이 이미 있는지 먼저 찾고, 만든 파일은 실제로 어딘가에서 쓰이게 한다.

## 테스트

- Jest + Testing Library. 새 동작·버그 수정에는 테스트를 먼저 쓴다(실패 확인 → 구현).
- **커버리지 하한은 래칫이다.** `jest.config.js` 의 `coverageThreshold` 는 목표치가 아니라 지금 실측을 내림한 바닥값이다. 테스트를 늘려 실측이 오르면 값을 올리고, 내리지 않는다. 코드를 지워 실측이 오를 때도 올린다.
- `__tests__/_quarantine/` 은 되살릴 때만 손댄다. 방법과 목록은 그 폴더의 `README.md`.
- 라우트 테스트에서 `jest.mock('@/lib/cache', …)` 를 쓰면 라우트가 쓰는 함수(`getCachedData`·`setCachedData`·`clearCache`·`clearCacheAndRevalidate`)를 모두 목에 넣는다. 빠지면 라우트가 500 을 낸다.
- 접근성 CI(`.github/workflows/accessibility.yml`): jest-axe(`__tests__/accessibility/`)는 구조를, Lighthouse 는 실제 빌드에서 색 대비를 본다. 둘 다 실패하면 머지를 막는다. Pa11y 는 참고용.
  - jsdom 은 색을 그리지 않는다 — 대비 문제는 Lighthouse 에서만 드러난다.
  - CI 에는 데이터 키가 없어 Lighthouse 는 **데이터가 빈 상태**(홈 오류 안내, 빈 갤러리)만 본다. 작품 상세는 not-found 가 200 으로 나와 검사 대상에서 뺐다(`lighthouserc.js`). 실제 작품이 그려진 화면의 색 대비는 CI 가 지키지 못한다.
  - **글자가 든 요소의 투명도를 움직이지 않는다** — 등장 페이드든 스크롤 연동(`useTransform(scrollY, …, [1, 0.3])`)이든. Lighthouse 는 검사 중 스크롤하고 애니메이션 도중도 찍는다. 홈 히어로가 스크롤 300px 에서 투명도 0.3 이 되어 버튼 대비가 1.9:1 로 떨어졌다. 움직임은 위치(`x`·`y`)로 준다.

## 환경 변수

| 변수 | 용도 |
|---|---|
| `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` | 원본 데이터 |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 운영 작품 데이터 읽기. 앱은 anon 키만 쓴다(`lib/supabase/server.ts`, RLS 공개 읽기 정책) |
| `SUPABASE_SERVICE_ROLE_KEY` | `scripts/` 의 이관 스크립트 전용(RLS 우회, `createSupabaseAdminClient()`). 앱 코드는 가져오지 않는다(테스트가 막음) — anon 키가 없을 때 대신 쓰지도 않는다 |
| `REVALIDATE_SECRET`, `ADMIN_SYNC_TOKEN`, `AIRTABLE_WEBHOOK_SECRET` | 캐시 갱신·동기화 인증 (비어 있으면 요청을 거부) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL` | 문의 메일 |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | 오류 수집 |
| `ENABLE_DEBUG_ROUTES` | 운영에서 debug 라우트 허용 (기본 꺼짐) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console |

## 배포

- Vercel. `main` 에 머지하면 배포된다. 배포 주소 `anam-gallery.vercel.app`, 운영 주소 `anam.orientalcalligraphy.org`.
- 데이터를 고친 뒤에는 Supabase 사본 갱신 → `/api/admin/sync` 또는 `/api/revalidate` 로 캐시를 비운다.

## 작업 규칙

- 코드 변경 시 `.commit_message.txt` 에 한 줄 설명(이모지 포함, 한국어)을 기록한다.
- 커밋 메시지·PR·저장소 문서는 한국어로 쓴다.
- 루트의 `*_SUMMARY.md`·`*_REPORT.md` 류는 과거 작업 기록이라 지금 코드와 다를 수 있다. 사실 확인은 코드로 한다.
