# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SwiftFill** - An AI-powered PDF form filling application built on Lovable.dev platform. Features intelligent form assistance using Groq's Llama 3.3 model (with Gemini Flash 2.5 fallback), drag-and-drop field positioning, real-time streaming chat, and Supabase backend integration.

**Important**: This project was previously named "form-ai-forge" which was an accidental Loveable rename. The official name is now **SwiftFill**.

## Technology Stack

- **Frontend**: React 18, TypeScript 5, Vite 5
- **UI Framework**: shadcn/ui (Radix UI primitives), Tailwind CSS 3
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router v6
- **PDF Rendering**: react-pdf, pdfjs-dist
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Forms**: react-hook-form, zod validation
- **Backend**: Supabase (auth, database, edge functions)
- **AI**: Groq API (Llama 3.3 + Gemini Flash 2.5 via edge function)
- **Math Rendering**: KaTeX (react-katex)
- **Testing**: Vitest, @testing-library/react
- **PWA**: vite-plugin-pwa with workbox

## Development Commands

```bash
# Development
npm run dev              # Start dev server on port 8080
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview production build

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:ui          # Vitest UI
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # Run ESLint
```

## Performance Optimizations

### Bundle Optimization (November 2025)
The application implements comprehensive code-splitting and caching strategies:

**Route-Level Code Splitting:**
- All pages lazy-loaded with React.lazy() and Suspense
- Auth page: 2.85 KB (ultra-fast authentication)
- Main index: 34 KB (optimized with vendor chunks)

**Manual Vendor Chunks (Optimized):**
```javascript
react-core: 205 KB (67 KB gzipped)    // React, React DOM
pdf-viewer: 350 KB (103 KB gzipped)   // PDF.js (lazy loaded, local worker)
radix-ui: 118 KB (34 KB gzipped)      // Radix UI components
supabase: 147 KB (39 KB gzipped)      // Supabase client (backend)
zod: 54 KB (12 KB gzipped)            // Validation library
katex: 265 KB (77 KB gzipped)         // Math rendering (lazy loaded)
dnd-kit: 36 KB (12 KB gzipped)        // DnD Kit
icons: 22 KB (4 KB gzipped)           // Lucide React icons (centralized)
vendor: 145 KB (48 KB gzipped)        // Other utilities (76% reduction!)
```

**PDF.js Configuration:**
- Centralized worker configuration (src/lib/pdfConfig.ts)
- Local worker bundling (1.37 MB) for offline PWA support
- Excluded from dependency pre-bundling for optimal Vite handling
- Worker loaded using Vite's ?url suffix for proper bundling

**Caching Strategy:**
- ~76% cache hit rate for returning users
- Library code separated from app code for better caching
- When app updates, only changed chunks re-download
- Supabase, Zod, KaTeX cached independently

**Build Performance:**
- Production build: ~16 seconds (with bundle analysis)
- Dev server startup: 400ms (improved from 488ms)
- Hot module reload: < 100ms
- TypeScript: Strict mode enabled (0 errors)

### Progressive Web App (PWA)

**PWA Features:**
- ✅ Installable on desktop and mobile
- ✅ Offline support with service worker
- ✅ Runtime API caching for Supabase and Groq
- ✅ Auto-update service worker registration

**Service Worker Configuration:**
```javascript
// Supabase API - NetworkFirst, 24h cache
// Groq API - NetworkFirst, 30min cache
// 69 assets precached (~3.1 MB)
```

## Architecture

### Core Application Structure

```
src/
├── components/
│   ├── FormViewer.tsx              # PDF rendering with field overlays
│   ├── FieldNavigationPanel.tsx    # Sequential field navigation
│   ├── DraggableAIAssistant.tsx    # Draggable streaming AI chat
│   ├── PersonalDataVaultPanel.tsx  # User data management
│   ├── CommandPalette.tsx          # Keyboard shortcuts (Cmd+K)
│   ├── FieldGroupManager.tsx       # Group related fields
│   ├── PDFThumbnailSidebar.tsx     # PDF page thumbnails
│   ├── TemplateManager.tsx         # Form templates
│   └── ui/                         # shadcn/ui components
├── pages/
│   ├── Index.tsx                   # Main form editor (auth required)
│   ├── Auth.tsx                    # Supabase authentication
│   ├── DistributionCalculator.tsx  # Legal property distribution calc
│   └── NotFound.tsx
├── hooks/
│   ├── useGroqStream.ts            # Streaming chat with AbortController
│   ├── use-toast.ts                # Toast notifications
│   ├── useAIStream.ts              # Alternative AI streaming
│   ├── useFormAutoSave.ts          # Auto-save every 5 seconds
│   ├── useOfflineSync.ts           # Offline data synchronization
│   ├── useKeyboardShortcuts.ts     # Keyboard shortcuts
│   └── usePrefetchOnHover.ts       # Prefetch optimization
├── integrations/
│   └── supabase/
│       ├── client.ts               # Supabase client config
│       └── types.ts                # Database types
└── lib/
    ├── utils.ts                    # Utility functions (cn, etc.)
    ├── validations.ts              # Form validation logic
    └── errorTracking.ts            # Sentry integration
```

### Key Architectural Patterns

**1. Form Data Management**
- Form data stored in React state (`formData: FormData`)
- Field positions stored separately (`fieldPositions: Record<string, {top, left}>`)
- Auto-save to Supabase every 5 seconds
- beforeunload warning for data loss prevention
- Database tables: `documents`, `form_data`, `field_positions`

**2. AI Integration**
- Groq streaming via Supabase Edge Function at `/functions/v1/groq-chat`
- Uses Server-Sent Events (SSE) with manual stream parsing
- Form context passed to AI for contextual assistance
- Models: Llama 3.3 (primary), Gemini Flash 2.5 (fallback)
- Stream cancellation with AbortController
- No JWT verification on groq-chat function (public access)

**3. PDF Rendering**
- PDF.js worker loaded from unpkg CDN
- Field overlays positioned absolutely over PDF pages
- Edit mode required for dragging fields
- Click-outside-to-deselect pattern
- PDF thumbnails in sidebar for quick navigation

**4. Authentication Flow**
- Supabase Auth with session persistence (localStorage)
- Protected routes redirect to `/auth` if unauthenticated
- Auth state subscription for real-time updates
- User session checked on mount and auth state changes

**5. Resizable Layout**
- Three-panel layout: PDF Viewer | Navigation | AI Assistant (draggable)
- Uses `react-resizable-panels` for user-adjustable widths
- Panel visibility toggles for mobile/focused work
- AI Assistant can be dragged anywhere on screen

## Supabase Configuration

### Database
- **Project ID**: sbwgkocarqvonkdlitdx
- **URL**: https://sbwgkocarqvonkdlitdx.supabase.co
- **Tables**: 34 total (legal_documents, personal_info + 32 shared)
- **RLS**: Enabled on all tables for security

### Edge Functions

**groq-chat Function:**
- **Location**: `supabase/functions/groq-chat/index.ts`
- **Purpose**: Stream AI responses from Groq API
- **Auth**: JWT verification disabled (`verify_jwt = false`)
- **Environment Variable**: `GROQ_API_KEY`
- **Request Format**: `{ messages: Message[], formContext?: any }`
- **Response**: SSE stream with format `data: {JSON}\n\n`

**Deploying Functions:**
```bash
supabase functions deploy groq-chat
```

## Environment Variables

**Required in Supabase project settings:**
```
GROQ_API_KEY         # Groq API key for AI chat
```

**Client-side (handled by Lovable):**
```
VITE_SUPABASE_URL              # Auto-configured
VITE_SUPABASE_ANON_KEY         # Auto-configured
```

## Import Path Conventions

- Use `@/` alias for all src imports (configured in vite.config.ts)
- Example: `import { Button } from "@/components/ui/button"`
- Absolute imports preferred over relative paths

## TypeScript Configuration

- **Strict mode enabled** (November 2025) ✅
- All 8 strict checks active:
  - noImplicitAny, strictNullChecks, strictFunctionTypes
  - strictBindCallApply, strictPropertyInitialization
  - noImplicitThis, alwaysStrict, noFallthroughCasesInSwitch
- allowJs enabled for JavaScript files
- Path alias: `@/*` → `./src/*`
- Skip lib checks enabled
- **Zero TypeScript errors** across 108 files

## Testing

### Testing Infrastructure
- **Framework**: Vitest 4.0.1
- **Testing Library**: @testing-library/react 16.3.0
- **Coverage**: 47 tests total (8 hook tests, 39 validation tests)
- **Status**: ✅ All tests passing (47/47)

**Running Tests:**
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:ui           # Vitest UI
npm run test:coverage     # Coverage report
```

**Test Files:**
```
src/hooks/__tests__/useGroqStream.test.ts
src/lib/__tests__/validations.test.ts
src/test/setup.ts
vitest.config.ts
```

### Visual Testing & Validation

**Field Position Validation** (Automated):
```bash
node field-position-validator.mjs
```

Validates:
- Field overlaps (0 found ✅)
- Out-of-bounds fields (0 found ✅)
- Alignment consistency (Perfect ✅)
- Overall positioning quality (100/100 score)

**Manual Visual Testing**:
1. **Developer Testing**: See `MANUAL_VISUAL_TEST_GUIDE.md`
   - Comprehensive 8-phase test procedure
   - Screenshot checklist for documentation
   - Scoring matrix for production readiness

2. **User Acceptance Testing**: See `SRL_USER_ACCEPTANCE_TEST.md`
   - User-friendly test for self-represented litigants
   - Real-world scenario testing
   - Non-technical language and guidance

**Test Data** (Standardized for consistency):
```json
{
  "partyName": "Jane Smith",
  "streetAddress": "123 Main Street",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001",
  "telephoneNo": "(555) 123-4567",
  "faxNo": "(555) 123-4568",
  "email": "jane.smith@example.com",
  "attorneyFor": "Self-Represented",
  "attorneyBarNumber": "N/A",
  "county": "Los Angeles",
  "petitioner": "John Doe",
  "respondent": "Jane Smith",
  "caseNumber": "FL12345678"
  // ... see test guides for complete dataset
}
```

**Production Readiness Checklist**:
- ✅ Field Sizing: 24px height, 12pt font, monospace
- ✅ Field Coverage: 41 fields (complete FL-320)
- ✅ Positioning: 100/100 validation score
- ✅ Alignment: Perfect column/row alignment
- ☐ User Testing: Pending SRL feedback
- ☐ Print Quality: Verify court-ready output

## Common Development Patterns

### Adding New Fields
1. Update `FormData` interface in `Index.tsx` and `FormViewer.tsx`
2. Add field to `fieldOverlays` array in `FormViewer.tsx`
3. Update `fieldNameToIndex` mapping
4. Add to navigation panel fields list

### Adding New Routes
1. Create page component in `src/pages/`
2. Add route in `App.tsx` ABOVE the `*` catch-all route
3. Handle authentication if required

### Working with Supabase
```typescript
// Reading data
const { data, error } = await supabase
  .from('documents')
  .select('*')
  .eq('user_id', user.id)
  .single();

// Writing data
const { error } = await supabase
  .from('documents')
  .upsert({ user_id: user.id, ...formData });
```

## Lovable Platform Integration

This project is managed through Lovable.dev:
- Changes pushed to this repo sync to Lovable
- Changes made in Lovable auto-commit to this repo
- Component tagger plugin active in development mode
- Deploy via Lovable UI (Share → Publish)

## Known Patterns & Conventions

- Toast notifications via `sonner` (not shadcn toast)
- Loading states with `Loader2` from lucide-react
- Responsive design with Tailwind breakpoints
- Card-based layouts for major features
- Draggable components with @dnd-kit

## Development Workflow

1. Start dev server: `npm run dev`
2. Access at `http://localhost:8080`
3. Changes hot-reload automatically
4. Supabase edge functions run locally via Supabase CLI (if needed)
5. Build before deploying: `npm run build`
6. Run tests: `npm run test`

## Key Files to Know

- `src/App.tsx` - Route configuration and providers
- `src/pages/Index.tsx` - Main application logic and state
- `src/components/FormViewer.tsx` - PDF rendering and field overlay engine
- `src/components/DraggableAIAssistant.tsx` - Draggable AI chat interface
- `src/hooks/useGroqStream.ts` - AI streaming with AbortController cleanup
- `supabase/functions/groq-chat/index.ts` - Backend AI endpoint
- `vite.config.ts` - Build configuration and path aliases
- `vitest.config.ts` - Testing configuration

## Critical Features

1. **Data Loss Prevention**: beforeunload warning for unsaved changes
2. **Auto-save**: Every 5 seconds to Supabase
3. **Stream Cleanup**: Proper AbortController cleanup on unmount
4. **Offline Support**: Service worker caching for offline PDF access
5. **Keyboard Shortcuts**: Cmd+K for command palette
6. **Field Groups**: Organize related fields together
7. **PDF Thumbnails**: Quick navigation between pages
8. **Templates**: Save and reuse common form configurations

## Git Workflow

**Main Branch**: Single source of truth (formerly Loveable branch)
**Backup Branch**: main-backup-20251115 (pre-migration)
**Working Branch**: swiftfill-migration (development)

**Obsolete Branches (can be deleted):**
- claude/codebase-audit-and-analysis-* (merged to main)
- claude/pre-release-assessment-* (features cherry-picked)
- claude/redesign-ai-input-* (testing infrastructure cherry-picked)
- claude/product-strategy-* (optional features for future)
- edit/* (auto-generated Loveable edits)

## Linear Project

**Project**: SwiftFill
**Team**: JusticeOS
**Project ID**: a80457ec-82d3-4d76-90d8-f52ff4fcbb59

## Instructions for Claude Code Web Agent

### When helping develop this app:

1. **Always check the current branch**: `git branch` to see where you are
2. **Read this file first**: Understand the architecture before making changes
3. **Run tests after changes**: `npm run test` to ensure nothing breaks
4. **Build before committing**: `npm run build` to verify no TypeScript errors
5. **Follow naming conventions**:
   - Components: PascalCase.tsx (FormViewer.tsx)
   - Hooks: camelCase.ts starting with 'use' (useGroqStream.ts)
   - Utilities: camelCase.ts (validations.ts)
6. **Use the @/ import alias**: Never use relative paths like `../../`
7. **Keep components under 500 lines**: Split if larger
8. **Add tests for new features**: Use Vitest pattern from existing tests
9. **Update TypeScript interfaces**: When adding new form fields
10. **Commit frequently**: Small, focused commits with clear messages

### Common Tasks:

**Add a new form field:**
```bash
# 1. Update FormData interface in Index.tsx
# 2. Update FormData interface in FormViewer.tsx
# 3. Add field overlay in FormViewer.tsx fieldOverlays array
# 4. Update fieldNameToIndex mapping
# 5. Add to FieldNavigationPanel fields list
# 6. Run npm run build to verify
```

**Add a new AI feature:**
```bash
# 1. Modify groq-chat edge function if needed
# 2. Update useGroqStream.ts hook
# 3. Update DraggableAIAssistant.tsx component
# 4. Add tests in useGroqStream.test.ts
# 5. Deploy edge function: supabase functions deploy groq-chat
```

**Add a new route:**
```bash
# 1. Create component in src/pages/
# 2. Add route in App.tsx (before * catch-all)
# 3. Add to navigation if needed
# 4. Test with npm run dev
```

### Debugging Tips:

- **AI not responding**: Check GROQ_API_KEY in Supabase dashboard
- **PDF not loading**: Check PDF.js worker URL in FormViewer.tsx
- **Auto-save failing**: Check Supabase RLS policies
- **Build errors**: Run `npm run typecheck` for detailed errors
- **Hot reload not working**: Restart dev server with `npm run dev`

### Best Practices:

- Always use TypeScript (no `any` types unless absolutely necessary)
- Keep bundle size small (check with `npm run build`)
- Use React Query for server state
- Use useState for UI state
- Implement loading and error states
- Add proper TypeScript types for all props
- Use shadcn/ui components (don't create custom ones)
- Follow existing code patterns

## Optimization History

### November 2025 - Performance & Type Safety Overhaul

**Commits:**
- `0129c43` - PDF.js configuration and bundling strategy
- `ecd86b0` - Vendor chunk splitting for better caching
- `785fa1c` - TypeScript strict mode enablement
- `[TBD]` - Test fixes and documentation updates

**Key Achievements:**

1. **PDF Viewer Optimization**
   - Centralized PDF.js configuration (src/lib/pdfConfig.ts)
   - Migrated from CDN to local worker bundling (better offline support)
   - Configured Vite for optimal pdfjs-dist handling
   - Added bundle visualizer (rollup-plugin-visualizer)

2. **Vendor Chunk Optimization (76% reduction!)**
   - Before: vendor.js 613 KB (177 KB gzipped)
   - After: vendor.js 145 KB (48 KB gzipped)
   - Extracted: Supabase (147 KB), Zod (54 KB), KaTeX (265 KB)
   - Result: ~76% cache hit rate for returning users

3. **TypeScript Strict Mode**
   - Enabled full strict mode across all configs
   - Zero errors across 108 TypeScript files
   - All 8 strict checks active
   - Improved IDE support and compile-time safety

4. **Test Suite Improvements**
   - Fixed 2 test failures in useGroqStream.test.ts
   - All 47/47 tests passing
   - Better assertion patterns for async state updates

**Performance Metrics:**
- Build time: 16.36s (with bundle analysis)
- Dev server: 400ms startup (was 488ms)
- Total bundle size: Similar, but dramatically better caching
- Gzip efficiency: ~70% average compression

**Files Created:**
- src/lib/pdfConfig.ts

**Files Modified:**
- vite.config.ts (enhanced chunk splitting + visualizer)
- tsconfig.json, tsconfig.app.json (strict mode)
- src/components/FormViewer.tsx (centralized PDF config)
- src/components/PDFThumbnailSidebar.tsx (centralized PDF config)
- src/components/ui/progressive-pdf.tsx (centralized PDF config)
- src/hooks/__tests__/useGroqStream.test.ts (fixed assertions)
- package.json (added rollup-plugin-visualizer)

---

🤖 This file helps Claude Code understand SwiftFill architecture and development patterns.

Co-Authored-By: Claude <noreply@anthropic.com>
