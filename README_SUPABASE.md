# 🚀 Supabase 마이그레이션 완료

ANAM Gallery가 이제 **Supabase**를 주 데이터 소스로 사용합니다!

## ✅ 완료된 작업

1. ✅ Supabase 패키지 설치
2. ✅ 데이터베이스 스키마 생성 (`lib/supabase/schema.sql`)
3. ✅ Supabase 데이터 페칭 함수 구현 (`lib/supabase/artworks.ts`)
4. ✅ API 라우트 전환 (`app/api/artworks`, `app/api/artist`)
5. ✅ 메인 데이터 페칭 함수 업데이트 (`lib/artworks.ts`)
6. ✅ 마이그레이션 스크립트 작성

## 📋 다음 단계

### 1. Supabase 프로젝트 설정

1. [Supabase Dashboard](https://app.supabase.com)에서 새 프로젝트 생성
2. `.env.local` 파일에 다음 환경 변수 추가:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key  # 선택사항
```

### 2. 데이터베이스 스키마 생성

1. Supabase Dashboard → SQL Editor
2. `lib/supabase/schema.sql` 파일 내용 복사 후 실행

### 3. 데이터 마이그레이션

```bash
# Airtable 데이터를 Supabase로 마이그레이션
node scripts/migrate-airtable-to-supabase.js
```

### 4. 테스트

```bash
npm run dev
```

브라우저 콘솔에서 다음 메시지 확인:
- ✅ "Loaded X artworks from Supabase"

## 🔄 데이터 플로우

현재 시스템은 **multi-fallback** 구조를 가지고 있습니다:

```
Supabase (Primary)
    ↓ (실패 시)
Airtable (Fallback)
    ↓ (실패 시)
Local Static Data (Final Fallback)
```

이를 통해 최대한의 안정성을 보장합니다.

## 📚 자세한 가이드

전체 마이그레이션 가이드는 [`docs/SUPABASE_MIGRATION_GUIDE.md`](./docs/SUPABASE_MIGRATION_GUIDE.md)를 참조하세요.

