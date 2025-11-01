# Supabase 마이그레이션 가이드

이 가이드는 ANAM Gallery 프로젝트에서 Airtable 대신 Supabase를 사용하도록 전환하는 완전한 가이드입니다.

## 📋 개요

이 프로젝트는 이제 **Supabase**를 주 데이터 소스로 사용하며, 다음과 같은 fallback 체계를 가지고 있습니다:

```
Supabase (Primary) → Airtable (Fallback) → Local Static Data (Final Fallback)
```

이를 통해 안정성과 유연성을 확보했습니다.

## ✅ 완료된 작업

1. ✅ Supabase 패키지 설치 (`@supabase/supabase-js`)
2. ✅ Supabase 데이터베이스 스키마 생성
3. ✅ Airtable → Supabase 마이그레이션 스크립트 작성
4. ✅ API 라우트를 Supabase 기반으로 변경
5. ✅ 데이터 페칭 함수를 Supabase 우선으로 전환

## 🚀 시작하기

### 1단계: Supabase 프로젝트 설정

1. **Supabase 프로젝트 생성**
   - [Supabase Dashboard](https://app.supabase.com)에 로그인
   - 새 프로젝트 생성
   - 프로젝트 이름: `anam-gallery` (또는 원하는 이름)

2. **환경 변수 설정**
   - Supabase Dashboard에서 프로젝트 설정 → API 섹션으로 이동
   - 다음 정보를 복사:
     - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
     - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)
     - Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) - 클라이언트용

3. **`.env.local` 파일에 추가**
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   
   # Airtable (Fallback용, 선택사항)
   AIRTABLE_API_KEY=your_airtable_api_key
   AIRTABLE_BASE_ID=your_airtable_base_id
   ```

### 2단계: 데이터베이스 스키마 생성

1. **Supabase SQL Editor 열기**
   - Supabase Dashboard → SQL Editor

2. **스키마 파일 실행**
   - `lib/supabase/schema.sql` 파일의 내용을 복사
   - SQL Editor에 붙여넣고 실행
   - 성공 메시지 확인:
     ```
     Database schema created successfully!
     Tables: artists, artworks, sync_logs
     Indexes and triggers created
     ```

3. **Row Level Security (RLS) 확인**
   - Table Editor에서 `artworks`와 `artists` 테이블 확인
   - RLS가 활성화되어 있는지 확인

### 3단계: 데이터 마이그레이션

Airtable 데이터를 Supabase로 마이그레이션합니다:

```bash
# 마이그레이션 스크립트 실행
npx tsx scripts/migrate-airtable-to-supabase.ts
```

**마이그레이션 스크립트가 하는 일:**
1. Airtable에서 모든 작품 데이터 가져오기
2. Airtable에서 작가 정보 가져오기
3. Supabase에 데이터 삽입 (upsert 방식으로 중복 방지)
4. 마이그레이션 결과 확인

**예상 출력:**
```
🔄 Starting artwork migration from Airtable to Supabase...
📊 Found 61 artworks in Airtable
✅ Successfully migrated 61 artworks to Supabase

🔄 Starting artist migration from Airtable to Supabase...
📊 Found artist: 아남 배옥영
✅ Successfully migrated artist to Supabase: 아남 배옥영

✅ Migration completed successfully!
```

### 4단계: 데이터 검증

1. **Supabase Dashboard에서 확인**
   - Table Editor → `artworks` 테이블
   - 총 레코드 수 확인 (61개 작품)
   - 몇 개 작품 열어서 데이터 확인

2. **애플리케이션 테스트**
   ```bash
   npm run dev
   ```
   - 브라우저에서 `http://localhost:3000` 열기
   - 갤러리 페이지에서 작품들이 표시되는지 확인
   - 콘솔에서 "Loaded X artworks from Supabase" 메시지 확인

## 📊 데이터 플로우

### 현재 구조 (Multi-Fallback)

```
Request → Supabase (Primary)
    ↓ (실패 시)
Airtable (Secondary Fallback)
    ↓ (실패 시)
Local Static Data (Final Fallback)
```

### 장점

1. **높은 안정성**: 여러 데이터 소스로 장애 대응
2. **점진적 마이그레이션**: Airtable을 한 번에 제거하지 않음
3. **데이터 검증**: Supabase와 Airtable 데이터 비교 가능
4. **성능 최적화**: Supabase가 기본이므로 빠른 응답

## 🔧 주요 변경사항

### API 라우트

- **`app/api/artworks/route.ts`**: Supabase를 주 소스로 사용
- **`app/api/artist/route.ts`**: Supabase를 주 소스로 사용

### 데이터 페칭 함수

- **`lib/artworks.ts`**:
  - `getArtworks()`: Supabase → Airtable → Fallback 순서
  - `getArtworkBySlug()`: Supabase 우선 조회
  - `fetchArtist()`: Supabase → Airtable → Fallback 순서

### 새로운 파일

- **`lib/supabase/artworks.ts`**: Supabase 전용 데이터 페칭 함수
- **`lib/supabase/schema.sql`**: 데이터베이스 스키마 정의
- **`scripts/migrate-airtable-to-supabase.ts`**: 마이그레이션 스크립트

## 🗄️ 데이터베이스 구조

### `artworks` 테이블

```sql
- id (UUID, Primary Key)
- slug (TEXT, Unique)
- title (TEXT)
- year (INTEGER)
- medium (TEXT)
- dimensions (TEXT)
- aspect_ratio (TEXT)
- description (TEXT)
- image_url (TEXT)
- image_id (TEXT)
- number (TEXT)
- artist_note (TEXT)
- featured (BOOLEAN)
- category (TEXT)
- tags (JSONB) -- Array of strings
- price (DECIMAL)
- available (BOOLEAN)
- exhibition (TEXT)
- series (TEXT)
- technique (TEXT)
- inspiration (TEXT)
- symbolism (TEXT)
- cultural_context (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### `artists` 테이블

```sql
- id (UUID, Primary Key)
- name (TEXT)
- bio (TEXT)
- statement (TEXT)
- profile_image_url (TEXT)
- birth_year (INTEGER)
- education (JSONB) -- Array of strings
- exhibitions (JSONB) -- Array of strings
- awards (JSONB) -- Array of strings
- collections (JSONB) -- Array of strings
- website (TEXT)
- email (TEXT)
- phone (TEXT)
- social_links (JSONB) -- Object
- birth_place (TEXT)
- current_location (TEXT)
- specialties (JSONB) -- Array of strings
- influences (JSONB) -- Array of strings
- teaching_experience (JSONB) -- Array of strings
- publications (JSONB) -- Array of strings
- memberships (JSONB) -- Array of strings
- philosophy (TEXT)
- techniques (JSONB) -- Array of strings
- materials (JSONB) -- Array of strings
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

## 🔍 트러블슈팅

### 문제 1: "Missing Supabase environment variables"

**해결 방법:**
- `.env.local` 파일에 Supabase 환경 변수가 설정되어 있는지 확인
- 환경 변수 이름이 정확한지 확인:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (클라이언트용, 선택사항)

### 문제 2: "No artworks found in Supabase"

**해결 방법:**
1. 마이그레이션 스크립트가 성공적으로 실행되었는지 확인
2. Supabase Dashboard에서 `artworks` 테이블에 데이터가 있는지 확인
3. RLS (Row Level Security) 정책이 올바르게 설정되었는지 확인

### 문제 3: "Row Level Security policy violation"

**해결 방법:**
- `lib/supabase/schema.sql`의 RLS 정책이 실행되었는지 확인
- Service Role Key를 사용하면 RLS를 우회할 수 있음

## 📝 다음 단계 (선택사항)

### Airtable 완전 제거 (권장하지 않음)

현재는 **multi-fallback 시스템**을 유지하는 것이 좋습니다. 하지만 완전히 Airtable을 제거하고 싶다면:

1. **코드에서 Airtable import 제거**
   ```typescript
   // lib/artworks.ts에서 Airtable fallback 코드 제거
   ```

2. **환경 변수 제거**
   ```bash
   # .env.local에서 제거
   # AIRTABLE_API_KEY=...
   # AIRTABLE_BASE_ID=...
   ```

3. **패키지 제거**
   ```bash
   npm uninstall airtable
   ```

**⚠️ 주의**: 완전히 제거하기 전에 Supabase 데이터가 안정적으로 작동하는지 충분히 테스트하세요.

## 🎯 성능 향상

Supabase를 사용함으로써 얻는 이점:

1. **빠른 응답 시간**: 직접 PostgreSQL 접근으로 API 호출 지연 없음
2. **확장성**: PostgreSQL의 강력한 쿼리 기능 활용
3. **실시간 기능**: Supabase Real-time 기능 활용 가능 (향후)
4. **비용 효율성**: 무료 플랜으로 시작 가능

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)

## ✅ 체크리스트

마이그레이션 완료 확인:

- [ ] Supabase 프로젝트 생성 완료
- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 스키마 생성 완료
- [ ] 데이터 마이그레이션 완료
- [ ] 애플리케이션에서 Supabase 데이터 확인
- [ ] Airtable fallback 작동 확인 (선택사항)

## 🎉 완료!

축하합니다! 이제 ANAM Gallery는 Supabase를 주 데이터 소스로 사용하며, 안정적인 multi-fallback 시스템을 가지고 있습니다.

