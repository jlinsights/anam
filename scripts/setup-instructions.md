# ⚠️ artists 테이블 생성 필요

현재 `artworks` 테이블은 존재하지만 `artists` 테이블이 없습니다.

## 📝 해결 방법

### 방법 1: Supabase SQL Editor에서 실행 (권장)

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New Query** 클릭
5. 다음 SQL 코드 복사 후 실행:

```sql
-- Artists Table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  statement TEXT,
  profile_image_url TEXT,
  birth_year INTEGER,
  education JSONB DEFAULT '[]'::jsonb,
  exhibitions JSONB DEFAULT '[]'::jsonb,
  awards JSONB DEFAULT '[]'::jsonb,
  collections JSONB DEFAULT '[]'::jsonb,
  website TEXT,
  email TEXT,
  phone TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  birth_place TEXT,
  current_location TEXT,
  specialties JSONB DEFAULT '[]'::jsonb,
  influences JSONB DEFAULT '[]'::jsonb,
  teaching_experience JSONB DEFAULT '[]'::jsonb,
  publications JSONB DEFAULT '[]'::jsonb,
  memberships JSONB DEFAULT '[]'::jsonb,
  philosophy TEXT,
  techniques JSONB DEFAULT '[]'::jsonb,
  materials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public read access for artists" ON artists;
CREATE POLICY "Public read access for artists"
  ON artists FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role full access to artists" ON artists;
CREATE POLICY "Service role full access to artists"
  ON artists FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

### 방법 2: 전체 스키마 재실행

`lib/supabase/schema.sql` 파일 전체를 Supabase SQL Editor에서 실행하세요.
(기존 데이터는 보존됩니다 - `CREATE TABLE IF NOT EXISTS` 사용)

## ✅ 확인

테이블 생성 후 다음 명령으로 확인:

```bash
node scripts/check-supabase-setup.js
```

## 🚀 다음 단계

테이블 생성 확인 후 마이그레이션 실행:

```bash
node scripts/migrate-airtable-to-supabase.js
```

