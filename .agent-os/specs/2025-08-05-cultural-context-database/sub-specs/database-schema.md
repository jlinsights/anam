# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-05-cultural-context-database/spec.md

## Schema Changes

### New Table: CulturalContext

```sql
CREATE TABLE cultural_context (
  id SERIAL PRIMARY KEY,
  artwork_id VARCHAR(255) NOT NULL,
  
  -- Core Cultural Information
  historical_period VARCHAR(100),
  calligraphy_school VARCHAR(100),
  philosophical_background TEXT,
  cultural_significance TEXT,
  
  -- Technical Analysis
  technique_analysis TEXT,
  brush_technique VARCHAR(100),
  ink_composition VARCHAR(100),
  paper_type VARCHAR(100),
  
  -- Educational Metadata
  difficulty_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'expert'
  educational_themes TEXT[], -- Array of educational themes
  learning_objectives TEXT[],
  related_concepts TEXT[],
  
  -- Cultural Context
  seasonal_context VARCHAR(50),
  ceremonial_context VARCHAR(100),
  literary_source TEXT,
  cultural_symbolism TEXT,
  
  -- Multi-language Support
  content_ko JSONB, -- Korean content structure
  content_en JSONB, -- English content structure  
  content_zh JSONB, -- Chinese content structure
  
  -- Metadata
  expert_author VARCHAR(255),
  review_status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'review', 'approved', 'published'
  approval_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key Constraint
  CONSTRAINT fk_cultural_context_artwork 
    FOREIGN KEY (artwork_id) REFERENCES artworks(slug)
    ON DELETE CASCADE ON UPDATE CASCADE
);
```

### Indexes and Performance

```sql
-- Primary indexes for lookups
CREATE INDEX idx_cultural_context_artwork_id ON cultural_context(artwork_id);
CREATE INDEX idx_cultural_context_historical_period ON cultural_context(historical_period);
CREATE INDEX idx_cultural_context_calligraphy_school ON cultural_context(calligraphy_school);
CREATE INDEX idx_cultural_context_review_status ON cultural_context(review_status);

-- Full-text search indexes
CREATE INDEX idx_cultural_context_philosophical_search 
  ON cultural_context USING gin(to_tsvector('korean', philosophical_background));
CREATE INDEX idx_cultural_context_significance_search 
  ON cultural_context USING gin(to_tsvector('korean', cultural_significance));

-- Multi-language content indexes
CREATE INDEX idx_cultural_context_content_ko ON cultural_context USING gin(content_ko);
CREATE INDEX idx_cultural_context_content_en ON cultural_context USING gin(content_en);
CREATE INDEX idx_cultural_context_content_zh ON cultural_context USING gin(content_zh);
```

### Existing Table Modifications

```sql
-- Add cultural context reference to existing artworks table
ALTER TABLE artworks 
ADD COLUMN has_cultural_context BOOLEAN DEFAULT FALSE;

-- Update trigger to maintain cultural context flag
CREATE OR REPLACE FUNCTION update_artwork_cultural_context_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE artworks 
    SET has_cultural_context = TRUE 
    WHERE slug = NEW.artwork_id AND NEW.review_status = 'published';
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artworks 
    SET has_cultural_context = (
      SELECT COUNT(*) > 0 
      FROM cultural_context 
      WHERE artwork_id = OLD.artwork_id AND review_status = 'published'
    ) 
    WHERE slug = OLD.artwork_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cultural_context_flag
  AFTER INSERT OR UPDATE OR DELETE ON cultural_context
  FOR EACH ROW EXECUTE FUNCTION update_artwork_cultural_context_flag();
```

## Migration Strategy

### Phase 1: Schema Creation
1. Create `cultural_context` table with all indexes
2. Add `has_cultural_context` column to `artworks` table
3. Create triggers for maintaining cultural context flags

### Phase 2: Data Migration
1. Create initial cultural context entries for priority artworks (Phase 1: ~20 artworks)
2. Populate basic historical period and calligraphy school information
3. Set up content workflow for expert review and approval

### Phase 3: Content Population
1. Expert content creation for philosophical background and cultural significance
2. Multi-language content translation and cultural adaptation
3. Educational metadata and learning objective definition

## Data Integrity Rules

- **Referential Integrity**: Cultural context entries must reference valid artwork slugs
- **Review Workflow**: Only 'published' status cultural context appears in public interface
- **Content Completeness**: Minimum required fields for publication: `historical_period`, `cultural_significance`, `content_ko`
- **Multi-language Consistency**: Content translations must maintain cultural accuracy and context
- **Expert Attribution**: All cultural content must be attributed to qualified cultural experts