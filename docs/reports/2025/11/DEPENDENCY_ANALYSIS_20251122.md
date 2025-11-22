# SwiftFill Dependency Analysis & Optimization Report
**Date**: November 22, 2025
**React Version**: 19.2.0

## Executive Summary

This analysis identifies dependency conflicts, outdated packages, and optimization opportunities based on November 2025 cutting-edge releases. Key findings:

- **3 Critical Conflicts**: Packages with incompatible React 19 peer dependencies
- **5 Recommended Upgrades**: Major version updates available
- **2 Deprecation Warnings**: Packages to replace or monitor
- **1 Architecture Change**: Consider Tailwind CSS v4 migration

---

## Current Dependency Conflicts

### 1. react-day-picker v8.10.1 ❌ Critical
**Issue**: Peer dependency declares `react@"^16.8.0 || ^17.0.0 || ^18.0.0"` - no React 19 support.

**Solution**: Upgrade to **v9.11.1**
```bash
npm install react-day-picker@^9.11.1 --legacy-peer-deps
```

**Migration Notes**:
- v9 has breaking API changes
- Update shadcn/ui calendar component
- See: [Upgrading to v9](https://daypicker.dev/upgrading)

### 2. next-themes v0.3.0 ⚠️ Moderate
**Issue**: Peer dependency declares `react@"^16.8 || ^17 || ^18"` - no React 19 support.

**Solution Options**:
1. Continue with `--legacy-peer-deps` (works fine functionally)
2. Wait for maintainer update ([Issue #296](https://github.com/pacocoursey/next-themes/issues/296))
3. Replace with custom theme provider using CSS variables

### 3. @liquid-justice/design-system v1.0.0 ⚠️ Internal
**Issue**: Peer dependency declares `react@"^18.0.0"` - internal package needs update.

**Solution**: Update the design system's package.json to support React 19:
```json
"peerDependencies": {
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

---

## Recommended Package Upgrades

### 1. Vitest 4.0.1 → 4.0.12 ✅ Minor
**Current**: 4.0.1
**Latest**: 4.0.12 (November 20, 2025)

**New Features**:
- Browser Mode now stable
- Visual Regression Testing support
- Playwright Trace support

```bash
npm install vitest@^4.0.12 @vitest/ui@^4.0.12 --save-dev --legacy-peer-deps
```

### 2. Supabase JS SDK 2.75.0 → 2.84.0 ✅ Recommended
**Current**: 2.75.0
**Latest**: 2.84.0 (November 22, 2025)

**Important**: Node.js 18 support dropped in v2.79.0 (EOL April 30, 2025)

```bash
npm install @supabase/supabase-js@^2.84.0 --legacy-peer-deps
```

### 3. react-day-picker 8.10.1 → 9.11.1 ⚠️ Major (Breaking)
**Current**: 8.10.1
**Latest**: 9.11.1

Required for React 19 compatibility. Major API changes - see migration guide.

### 4. TypeScript 5.8.3 → 5.9.x 📋 Optional
**Current**: 5.8.3
**Latest**: 5.9 (beta)

**New Features in 5.9**:
- Improved inference
- Better error messages

**Recommendation**: Wait for stable release, 5.8.3 is production-ready.

### 5. pdfjs-dist Version Alignment
**Current**: 4.8.69
**react-pdf bundled**: 5.3.31 (in react-pdf 10.2.0)

**Issue**: Potential version mismatch causing "API version does not match Worker version" errors.

**Solution**: Remove explicit pdfjs-dist dependency, let react-pdf manage it:
```bash
npm uninstall pdfjs-dist
```

Then update imports to use react-pdf's bundled version.

---

## Major Architecture Decisions

### Tailwind CSS v4 Migration 🔄 Consider

**Current**: v3.4.17
**Available**: v4.0 (stable since January 2025)

**Benefits**:
- 5x faster full builds
- 100x faster incremental builds
- Zero configuration
- Built-in Vite plugin
- Modern CSS features (cascade layers, @property, color-mix)

**Considerations**:
- Requires Safari 16.4+, Chrome 111+, Firefox 128+
- Breaking changes in configuration and some utilities
- Migration tool available: `npx @tailwindcss/upgrade@next`

**Recommendation**: Plan migration for Q1 2026 after stabilization of ecosystem (shadcn/ui, Liquid Justice Design System).

### Vite 6 Migration 🔄 Consider

**Current**: 5.4.19
**Available**: 6.0 (November 2024)

**Benefits**:
- New Environment API
- Better module federation support
- Improved dev performance

**Considerations**:
- Rolldown (Rust-based bundler) coming in Vite 7
- Current setup works well with React Compiler

**Recommendation**: Upgrade to Vite 6 after confirming all plugins are compatible.

---

## Consolidated Radix UI Package

**Current**: 20+ separate @radix-ui/* packages
**Available**: Unified `radix-ui` package (tree-shakable)

**Benefits**:
- Single dependency to manage
- Automatic deduplication
- Easier updates

```bash
npm install radix-ui --legacy-peer-deps
```

Then update imports:
```tsx
// Before
import { Dialog } from '@radix-ui/react-dialog';
import { Tooltip } from '@radix-ui/react-tooltip';

// After
import { Dialog, Tooltip } from 'radix-ui';
```

**Note**: Radix UI is "working vigorously on fixing incompatibility bugs" for React 19. Monitor for stable release.

---

## Recommended package.json Updates

### Immediate Actions (Safe)

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.84.0",
    "react-day-picker": "^9.11.1"
  },
  "devDependencies": {
    "vitest": "^4.0.12",
    "@vitest/ui": "^4.0.12"
  }
}
```

### Remove (Redundant)

```json
{
  "dependencies": {
    "pdfjs-dist": "^4.8.69"  // Let react-pdf manage this
  }
}
```

### Short-term (After Testing)

```json
{
  "dependencies": {
    "radix-ui": "^1.4.3"  // Replace individual @radix-ui/* packages
  }
}
```

### Future (Q1 2026)

- Tailwind CSS v4 migration
- Vite 6 migration
- TypeScript 5.9 upgrade

---

## Dependency Tree Optimization

### Current Issues

1. **Duplicate React instances**: Some packages bundle their own React
2. **Heavy vendor chunk**: 1,343 KB due to multiple large libraries
3. **Peer dependency warnings**: 40+ warnings during install

### Optimization Strategy

1. **Dedupe React**:
```bash
npm dedupe
```

2. **Audit dependencies**:
```bash
npm ls react --all | grep -E "^[├└]"
```

3. **Override problematic versions** in package.json:
```json
{
  "overrides": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  }
}
```

---

## Security Vulnerabilities

Current audit shows: **12 vulnerabilities** (8 moderate, 1 high, 3 critical)

```bash
npm audit fix
```

For breaking fixes:
```bash
npm audit fix --force
```

**Note**: Always test thoroughly after forced fixes.

---

## Performance Optimizations

### 1. Use React Compiler Effectively

The compiler is already enabled. Ensure no violations by checking DevTools for "Memo ✨" badges.

### 2. Lazy Load Heavy Dependencies

Already implemented for:
- KaTeX (265 KB)
- PDF viewer (350 KB)
- Recharts

Consider lazy loading:
- @react-pdf/renderer (for PDF export)
- react-force-graph-2d

### 3. Tree Shaking Improvements

With unified `radix-ui` package, better tree shaking is possible:
- Only imported components are bundled
- Reduced duplicate code

---

## Migration Commands

### Phase 1: Safe Updates (Now)

```bash
# Update minor versions
npm install @supabase/supabase-js@^2.84.0 vitest@^4.0.12 @vitest/ui@^4.0.12 --save-dev --legacy-peer-deps

# Fix security vulnerabilities
npm audit fix
```

### Phase 2: react-day-picker v9 (Requires Testing)

```bash
# Upgrade with breaking changes
npm install react-day-picker@^9.11.1 --legacy-peer-deps

# Update calendar component imports
# See: https://daypicker.dev/upgrading
```

### Phase 3: Radix UI Consolidation (After Stable Release)

```bash
# Wait for stable React 19 support announcement
npm install radix-ui --legacy-peer-deps

# Update all imports to use unified package
```

### Phase 4: Future Major Upgrades

```bash
# Tailwind v4 (Q1 2026)
npx @tailwindcss/upgrade@next

# Vite 6 (after plugin compatibility confirmed)
npm install vite@^6.0.0 --save-dev
```

---

## Monitoring & Maintenance

### Package Release Tracking

Monitor these repositories for React 19 compatibility updates:
- [radix-ui/primitives](https://github.com/radix-ui/primitives/releases)
- [pacocoursey/next-themes](https://github.com/pacocoursey/next-themes/issues/296)
- [TanStack/query](https://github.com/tanstack/query/releases)

### Automated Updates

Consider using:
- Renovate Bot for automated PRs
- `npm outdated` in CI pipeline
- Dependabot alerts for security

---

## Summary Table

| Package | Current | Latest | Action | Priority |
|---------|---------|--------|--------|----------|
| @supabase/supabase-js | 2.75.0 | 2.84.0 | Upgrade | High |
| react-day-picker | 8.10.1 | 9.11.1 | Upgrade (breaking) | High |
| vitest | 4.0.1 | 4.0.12 | Upgrade | Medium |
| @vitest/ui | 4.0.1 | 4.0.12 | Upgrade | Medium |
| pdfjs-dist | 4.8.69 | - | Remove | Medium |
| next-themes | 0.3.0 | 0.3.0 | Monitor | Low |
| radix-ui | individual | unified | Wait for stable | Low |
| Tailwind CSS | 3.4.17 | 4.0.x | Plan for Q1 2026 | Future |
| Vite | 5.4.19 | 6.0.x | Plan migration | Future |

---

## Sources

- [React 19.2 Release](https://react.dev/blog/2025/10/01/react-19-2)
- [Radix UI Releases](https://www.radix-ui.com/primitives/docs/overview/releases)
- [TanStack Query](https://tanstack.com/query/latest)
- [Supabase JS Releases](https://github.com/supabase/supabase-js/releases)
- [Vitest 4.0](https://vitest.dev/blog/vitest-4)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [TypeScript 5.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html)
- [react-day-picker v9](https://daypicker.dev/upgrading)
- [react-pdf Releases](https://github.com/wojtekmaj/react-pdf/releases)

---

*Report generated by Claude Code on November 22, 2025*
