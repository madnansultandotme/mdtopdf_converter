# Markdown to PDF Converter - Project TODO

## Phase 1: Project Setup & Design System
- [x] Initialize Next.js project with server, db, and user features
- [x] Set up Scandinavian design system (colors, typography, spacing)
- [x] Configure Tailwind CSS with custom color palette
- [x] Create global styles and theme variables
- [x] Set up Google Fonts (bold sans-serif + thin subtitles)

## Phase 2: Markdown Editor & Input Handling
- [x] Install and integrate Monaco Editor or CodeMirror
- [x] Create Markdown editor component with syntax highlighting
- [x] Implement file upload (.md) functionality
- [x] Implement paste/text input functionality
- [x] Add GitHub-flavored Markdown (GFM) support
- [ ] Create sample Markdown templates for testing

## Phase 3: Formatting Rules Engine
- [x] Design database schema for formatting rules
- [x] Create formatting rules configuration UI
- [x] Implement typography rules (heading levels, fonts, spacing)
- [x] Implement layout rules (page size, margins, headers/footers)
- [x] Implement Markdown-specific rules (code blocks, tables, lists, blockquotes)
- [x] Implement pagination rules (page breaks, orphan prevention)
- [ ] Add preset formatting templates (resume, PRD, technical doc)

## Phase 4: AST-based PDF Generation Pipeline
- [x] Set up Markdown parser (remark/markdown-it)
- [x] Implement AST transformation layer
- [x] Create HTML rendering engine with locked CSS
- [ ] Integrate PDF rendering engine (Playwright or PDFKit)
- [ ] Implement font embedding
- [x] Add support for complex Markdown features (tables, nested lists, code blocks)
- [x] Optimize for deterministic output

## Phase 5: PDF Preview & Side-by-Side View
- [x] Create PDF preview component
- [x] Implement side-by-side Markdown and PDF view
- [ ] Add preview refresh on content/rules change
- [ ] Optimize preview performance

## Phase 6: Export Functionality
- [ ] Implement PDF download functionality
- [ ] Implement JSON config export (save formatting rules)
- [ ] Implement JSON config import (load formatting rules)
- [ ] Add file naming and metadata handling

## Phase 7: User Experience & Polish
- [ ] Create responsive layout for mobile/tablet
- [ ] Add loading states and error handling
- [ ] Implement undo/redo for editor
- [ ] Add keyboard shortcuts
- [ ] Create help/documentation
- [ ] Optimize performance for large files (100+ pages)
- [ ] Test with various Markdown edge cases

## Phase 8: Testing & Optimization
- [ ] Write unit tests for formatting rules engine
- [ ] Write integration tests for PDF generation
- [ ] Test with large Markdown files
- [ ] Test with special characters and Unicode
- [ ] Performance optimization (< 3 seconds for average docs)
- [ ] Memory usage optimization (support up to 5 MB files)

## Phase 9: Deployment & Documentation
- [ ] Create user documentation
- [ ] Set up analytics tracking
- [ ] Final testing and QA
- [ ] Create checkpoint and prepare for deployment


## Debugging & Fixes
- [x] Fix Monaco Editor integration with proper state management
- [x] Fix PDF generation endpoint and error handling
- [x] Implement proper preview rendering (HTML or PDF)
- [x] Add error boundaries and user feedback
- [ ] Test full workflow from Markdown input to PDF output
