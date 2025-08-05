# Agent OS - ANAM Gallery Integration

## Overview

Agent OS provides structured AI-assisted development methodology for the ANAM Gallery project, integrating bmad-method framework with Cultural Context Database implementation.

## Project Structure

This Agent OS implementation is specifically designed for:
- **Korean Calligraphy Gallery Platform**: Individual artist gallery for 아남 배옥영 (ANAM Bae Ok Young)
- **Cultural Context Database Integration**: Advanced cultural metadata and context management
- **Zen Brutalism Design System**: Traditional Korean aesthetics with modern interaction design

## Core Components

### 1. Product Specifications
- `/product/cultural-context-database.md` - Cultural Context Database specification
- `/product/gallery-enhancement.md` - Professional gallery platform requirements
- `/product/integration-plan.md` - BMad-method integration roadmap

### 2. Agent Development
- `/agents/cultural-context-agent.md` - Specialized cultural context analysis agent
- `/agents/gallery-enhancement-agent.md` - Gallery platform improvement agent
- `/agents/integration-coordinator.md` - Cross-system integration coordinator

### 3. Workflow Management
- `/workflows/cultural-analysis.md` - Cultural context analysis workflow
- `/workflows/gallery-improvement.md` - Gallery enhancement workflow
- `/workflows/integration-testing.md` - Integration testing and validation

## Integration with ANAM Gallery

### Current Architecture
- **Framework**: Next.js 15.3.3 with App Router
- **Design System**: Zen Brutalism Foundation (3-phase evolution)
- **Data Management**: Airtable CMS with local fallback (58 artworks)
- **Styling**: Tailwind CSS with custom Korean aesthetic tokens

### Cultural Context Database Features
- **Metadata Enhancement**: Advanced cultural context for each artwork
- **Semantic Analysis**: AI-powered analysis of calligraphy meanings and cultural significance
- **Historical Context**: Connection to Korean calligraphy traditions and periods
- **Educational Content**: Detailed explanations for cultural learning

### BMad-Method Integration Benefits
- **AI-Assisted Development**: Structured approach to feature development
- **Cultural Expertise**: Specialized agents for Korean cultural content
- **Quality Enhancement**: Professional gallery platform improvements
- **Scalable Architecture**: Framework for expanding to more artists/galleries

## Usage

### Creating Specifications
```bash
npm run agent-os:spec -- --type cultural-context
npm run agent-os:spec -- --type gallery-enhancement
```

### Running Cultural Analysis
```bash
npm run agent-os:analyze -- --focus cultural-context
npm run agent-os:analyze -- --focus gallery-improvement
```

### Integration Testing
```bash
npm run agent-os:test -- --workflow integration
npm run agent-os:validate -- --system cultural-database
```

## Development Roadmap

### Phase 1: Foundation Setup ✅
- [x] Agent OS directory structure
- [x] Cultural Context Database specification
- [x] Integration planning documentation

### Phase 2: Cultural Context Implementation
- [ ] Cultural metadata schema design
- [ ] AI-powered cultural analysis agent
- [ ] Integration with existing artwork data

### Phase 3: Gallery Enhancement
- [ ] Professional gallery features
- [ ] Advanced search and filtering
- [ ] Educational content presentation

### Phase 4: Advanced Integration
- [ ] Cross-cultural analysis capabilities
- [ ] Multi-artist platform scaling
- [ ] Advanced visualization features

## Configuration

The Agent OS is configured to work seamlessly with the existing ANAM Gallery infrastructure:
- Preserves existing Zen Brutalism design system
- Extends current Airtable data management
- Enhances existing TypeScript/React architecture
- Maintains current performance optimizations

## Support

For technical support or questions about the Agent OS integration:
- Review product specifications in `/product/`
- Check agent definitions in `/agents/`
- Follow workflows in `/workflows/`
- Refer to main ANAM Gallery documentation in `/CLAUDE.md`