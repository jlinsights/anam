# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-05-cultural-context-database/spec.md

## Endpoints

### GET /api/cultural-context/[artworkId]

**Purpose:** Retrieve cultural context information for a specific artwork
**Parameters:** 
- `artworkId` (path): Artwork slug identifier
- `lang` (query, optional): Language preference ('ko', 'en', 'zh'), defaults to 'ko'
- `include` (query, optional): Comma-separated fields to include ('all', 'basic', 'educational', 'technical')
**Response:** 
```json
{
  "success": true,
  "data": {
    "id": "123",
    "artworkId": "anam-eternal-spring-2024",
    "historicalPeriod": "조선후기",
    "calligraphySchool": "추사체",
    "philosophicalBackground": "...",
    "culturalSignificance": "...",
    "techniqueAnalysis": "...",
    "educationalThemes": ["zen-philosophy", "brush-technique"],
    "content": {
      "overview": "...",
      "historical": "...",
      "philosophical": "...",
      "technical": "..."
    },
    "reviewStatus": "published",
    "expertAuthor": "김문화",
    "lastUpdated": "2025-08-05T10:30:00Z"
  }
}
```
**Errors:** 404 if artwork not found, 403 if cultural context not published

### POST /api/admin/cultural-context

**Purpose:** Create new cultural context entry (admin only)
**Parameters:** 
- Request body with cultural context data structure
- Requires admin authentication via existing auth system
**Response:** 
```json
{
  "success": true,
  "data": {
    "id": "124",
    "artworkId": "anam-winter-silence-2023",
    "reviewStatus": "draft",
    "message": "Cultural context entry created successfully"
  }
}
```
**Errors:** 400 for validation errors, 401 for unauthorized, 409 if context already exists

### PUT /api/admin/cultural-context/[contextId]

**Purpose:** Update existing cultural context entry (admin only)
**Parameters:** 
- `contextId` (path): Cultural context entry ID
- Request body with updated fields
- `action` (query, optional): 'save-draft', 'submit-review', 'approve', 'publish'
**Response:** 
```json
{
  "success": true,
  "data": {
    "id": "124",
    "reviewStatus": "review",
    "message": "Cultural context updated and submitted for review"
  }
}
```
**Errors:** 400 for validation errors, 401 for unauthorized, 404 if context not found

### GET /api/cultural-context/search

**Purpose:** Search cultural context by themes, periods, and concepts
**Parameters:** 
- `q` (query): General search query
- `period` (query, optional): Historical period filter
- `school` (query, optional): Calligraphy school filter
- `theme` (query, optional): Educational theme filter
- `lang` (query, optional): Language preference
- `limit` (query, optional): Results limit (default 20, max 100)
- `offset` (query, optional): Pagination offset
**Response:** 
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "artworkId": "anam-eternal-spring-2024",
        "title": "영원한 봄",
        "historicalPeriod": "조선후기",
        "calligraphySchool": "추사체",
        "culturalThemes": ["zen-philosophy", "seasonal-aesthetics"],
        "relevanceScore": 0.95
      }
    ],
    "total": 24,
    "hasMore": true
  }
}
```
**Errors:** 400 for invalid search parameters

### GET /api/admin/cultural-context/workflow

**Purpose:** Get cultural context entries by review status (admin only)
**Parameters:** 
- `status` (query): Review status filter ('draft', 'review', 'approved', 'published')
- `author` (query, optional): Filter by expert author
- `limit` (query, optional): Results limit
- `offset` (query, optional): Pagination offset
**Response:** 
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "125",
        "artworkId": "anam-autumn-reflection-2022",
        "reviewStatus": "review",
        "expertAuthor": "이전통",
        "createdAt": "2025-08-04T15:20:00Z",
        "completenessScore": 0.85
      }
    ],
    "counts": {
      "draft": 12,
      "review": 5,
      "approved": 8,
      "published": 33
    }
  }
}
```
**Errors:** 401 for unauthorized

## Controllers

### CulturalContextController

**Actions:**
- `getCulturalContext(artworkId, options)` - Retrieve cultural context with language and inclusion preferences
- `searchCulturalContext(query, filters)` - Search across cultural context entries with full-text search
- `validateContextCompleteness(contextData)` - Validate required fields and content quality

**Business Logic:**
- Language fallback: ko → en → zh for missing translations
- Content filtering based on review status (only published for public)
- Rich text content processing and sanitization
- Cultural content caching with 1-hour TTL

**Error Handling:**
- Graceful degradation when cultural context unavailable
- Detailed validation error messages for admin interface
- Rate limiting for search endpoints (100 requests/hour)

### AdminCulturalContextController

**Actions:**
- `createCulturalContext(contextData, expertId)` - Create new cultural context entry
- `updateCulturalContext(contextId, updates, action)` - Update with workflow state management
- `getWorkflowQueue(status, filters)` - Retrieve entries by review status
- `approveCulturalContext(contextId, reviewerId)` - Approve entry for publication

**Business Logic:**
- Workflow state transitions with proper authorization checks
- Content versioning and change tracking
- Expert author attribution and responsibility tracking
- Automated completeness scoring based on required fields

**Error Handling:**
- Workflow state validation preventing invalid transitions
- Duplicate context prevention for same artwork
- Expert authorization validation for content creation/modification