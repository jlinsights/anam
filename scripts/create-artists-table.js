/**
 * artists 테이블이 없을 경우 생성하는 스크립트
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const createArtistsTableSQL = `
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
CREATE POLICY IF NOT EXISTS "Public read access for artists"
  ON artists FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Service role full access to artists"
  ON artists FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
`

async function createArtistsTable() {
  console.log('🔧 artists 테이블 생성 중...\n')

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // RPC를 통해 SQL 실행 (Supabase에서는 직접 SQL 실행이 제한적이므로)
    // 대신 필요한 컬럼만 확인하고 없으면 추가
    const { data: existing, error: checkError } = await supabase
      .from('artists')
      .select('id')
      .limit(1)

    if (!checkError) {
      console.log('  ✅ artists 테이블이 이미 존재합니다.')
      return true
    }

    if (checkError.code === 'PGRST116' || checkError.message.includes('relation') || checkError.message.includes('does not exist')) {
      console.log('  ⚠️  artists 테이블이 존재하지 않습니다.')
      console.log('  📝 Supabase Dashboard → SQL Editor에서 다음 SQL을 실행하세요:\n')
      console.log('='.repeat(60))
      console.log(createArtistsTableSQL)
      console.log('='.repeat(60))
      console.log('\n  또는 전체 schema.sql 파일을 실행하세요: lib/supabase/schema.sql')
      return false
    }

    throw checkError
  } catch (error) {
    console.error('  ❌ 오류:', error.message)
    return false
  }
}

createArtistsTable().then(success => {
  if (success) {
    console.log('\n✅ 준비 완료!')
    process.exit(0)
  } else {
    console.log('\n⚠️  SQL을 실행한 후 다시 확인하세요.')
    process.exit(1)
  }
})

