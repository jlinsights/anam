-- ANAM Gallery Supabase Database Schema
-- Execute this script in your Supabase Dashboard SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS sync_logs CASCADE;
DROP TABLE IF EXISTS artworks CASCADE;
DROP TABLE IF EXISTS artists CASCADE;

-- 1. Artists Table
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  statement TEXT,
  profile_image_url TEXT,
  birth_year INTEGER,
  education JSONB DEFAULT '[]'::jsonb, -- Array of strings
  exhibitions JSONB DEFAULT '[]'::jsonb, -- Array of strings
  awards JSONB DEFAULT '[]'::jsonb, -- Array of strings
  collections JSONB DEFAULT '[]'::jsonb, -- Array of strings
  website TEXT,
  email TEXT,
  phone TEXT,
  social_links JSONB DEFAULT '{}'::jsonb, -- Object with social media links
  birth_place TEXT,
  current_location TEXT,
  specialties JSONB DEFAULT '[]'::jsonb, -- Array of strings
  influences JSONB DEFAULT '[]'::jsonb, -- Array of strings
  teaching_experience JSONB DEFAULT '[]'::jsonb, -- Array of strings
  publications JSONB DEFAULT '[]'::jsonb, -- Array of strings
  memberships JSONB DEFAULT '[]'::jsonb, -- Array of strings
  philosophy TEXT,
  techniques JSONB DEFAULT '[]'::jsonb, -- Array of strings
  materials JSONB DEFAULT '[]'::jsonb, -- Array of strings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Artworks Table
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  medium TEXT NOT NULL,
  dimensions TEXT,
  aspect_ratio TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  image_url_query TEXT,
  image_id TEXT, -- For optimized image system (e.g., "01", "02")
  number TEXT, -- Artwork number (e.g., "01", "02")
  artist_note TEXT,
  featured BOOLEAN DEFAULT false,
  category TEXT,
  tags JSONB DEFAULT '[]'::jsonb, -- Array of strings
  price DECIMAL(10, 2),
  available BOOLEAN DEFAULT true,
  exhibition TEXT,
  series TEXT,
  technique TEXT,
  inspiration TEXT,
  symbolism TEXT,
  cultural_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sync Logs Table (for tracking data sync from Airtable if needed)
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL DEFAULT 'airtable',
  operation TEXT NOT NULL, -- 'create', 'update', 'delete'
  record_id TEXT,
  table_name TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_artworks_slug ON artworks(slug);
CREATE INDEX idx_artworks_year ON artworks(year DESC);
CREATE INDEX idx_artworks_featured ON artworks(featured) WHERE featured = true;
CREATE INDEX idx_artworks_category ON artworks(category);
CREATE INDEX idx_artworks_tags ON artworks USING GIN(tags);
CREATE INDEX idx_artworks_search ON artworks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_artworks_number ON artworks(number);
CREATE INDEX idx_artworks_created_at ON artworks(created_at DESC);
CREATE INDEX idx_artworks_updated_at ON artworks(updated_at DESC);

CREATE INDEX idx_sync_logs_timestamp ON sync_logs(timestamp DESC);
CREATE INDEX idx_sync_logs_success ON sync_logs(success);
CREATE INDEX idx_sync_logs_operation ON sync_logs(operation);
CREATE INDEX idx_sync_logs_record_id ON sync_logs(record_id);
CREATE INDEX idx_sync_logs_table_name ON sync_logs(table_name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_artworks_updated_at
  BEFORE UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for artworks"
  ON artworks FOR SELECT
  USING (true);

CREATE POLICY "Public read access for artists"
  ON artists FOR SELECT
  USING (true);

CREATE POLICY "Service role full access to artworks"
  ON artworks FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access to artists"
  ON artists FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access to sync_logs"
  ON sync_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Success message
SELECT 'Database schema created successfully!' as status;
SELECT 'Tables: artists, artworks, sync_logs' as tables_created;
SELECT 'Indexes and triggers created' as indexes_triggers;

