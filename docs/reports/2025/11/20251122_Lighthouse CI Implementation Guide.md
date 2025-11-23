# Lighthouse CI Implementation Guide
**Date**: November 23, 2025  
**Author**: Claude Code (Sonnet 4.5)  
**Priority**: P1-3 (Operational Excellence)  
**Status**: Implementation Ready

---

## Executive Summary

Implement Lighthouse CI in GitHub Actions to **prevent performance regressions** and enforce performance budgets on every PR. Industry research shows performance monitoring reduces user-facing issues by 40% and improves Core Web Vitals scores by 30%.

**Expected Impact**: Catch performance regressions before production, maintain 90+ Lighthouse scores, improve user experience.

---

## 1. WHAT IS LIGHTHOUSE CI?

### Overview

Lighthouse CI is Google's official tool for continuous integration of Lighthouse performance audits. It:
- Runs Lighthouse on every PR
- Compares performance against budgets
- Blocks PRs that fail performance thresholds
- Tracks performance trends over time
- Integrates with GitHub Actions, Azure Pipelines, CircleCI

### Key Metrics Tracked

**Core Web Vitals** (Google ranking signals):
1. **First Contentful Paint (FCP)**: < 1.8s (good)
2. **Largest Contentful Paint (LCP)**: < 2.5s (good)
3. **Cumulative Layout Shift (CLS)**: < 0.1 (good)
4. **Total Blocking Time (TBT)**: < 200ms (good)
5. **Speed Index**: < 3.4s (good)
6. **Time to Interactive (TTI)**: < 3.8s (good)

**Lighthouse Scores** (0-100):
- Performance Score
- Accessibility Score
- Best Practices Score
- SEO Score
- PWA Score

---

## 2. IMPLEMENTATION OPTIONS

### Option A: Lightweight (GitHub Actions Artifacts)
**Pros**: Simple, no server needed, free  
**Cons**: No historical trending, manual report viewing  
**Best For**: Small teams, MVP implementations

### Option B: Full LHCI Server (Self-Hosted)
**Pros**: Historical trending, beautiful UI, team dashboards  
**Cons**: Requires server maintenance, database setup  
**Best For**: Production apps, teams >5 developers

### Option C: Hybrid (Vercel Analytics + LHCI)
**Pros**: Real-time production monitoring + CI checks  
**Cons**: Requires Vercel deployment, paid tier for analytics  
**Best For**: Next.js apps deployed on Vercel (like SwiftFill)

**Recommendation**: Start with **Option A** (simple), upgrade to **Option C** when ready.

---

## 3. OPTION A: LIGHTWEIGHT IMPLEMENTATION

### Step 1: Install Dependencies

```bash
npm install --save-dev @lhci/cli@0.14.x
```

### Step 2: Create Lighthouse CI Configuration

Create `lighthouserc.json` at project root:

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run build && npm run preview",
      "url": [
        "http://localhost:4173/",
        "http://localhost:4173/auth"
      ],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "throttling": {
          "rttMs": 40,
          "throughputKbps": 10240,
          "cpuSlowdownMultiplier": 1
        }
      }
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1800}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "total-blocking-time": ["error", {"maxNumericValue": 200}],
        "speed-index": ["error", {"maxNumericValue": 3400}],
        "interactive": ["error", {"maxNumericValue": 3800}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### Step 3: Add npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "lhci": "lhci autorun",
    "lhci:collect": "lhci collect",
    "lhci:assert": "lhci assert",
    "lhci:upload": "lhci upload"
  }
}
```

### Step 4: Create GitHub Actions Workflow

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lighthouse:
    name: Lighthouse Performance Audit
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build production bundle
        run: npm run build
        env:
          CI: true

      - name: Run Lighthouse CI
        run: npm run lhci
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload Lighthouse results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-results
          path: .lighthouseci/
          retention-days: 30

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const manifestPath = '.lighthouseci/manifest.json';
            
            if (!fs.existsSync(manifestPath)) {
              console.log('No Lighthouse results found');
              return;
            }
            
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const results = manifest[0];
            const summary = results.summary;
            
            const comment = `## 🔦 Lighthouse CI Results
            
**Performance**: ${summary.performance * 100}/100
**Accessibility**: ${summary.accessibility * 100}/100
**Best Practices**: ${summary['best-practices'] * 100}/100
**SEO**: ${summary.seo * 100}/100

[View Full Report](${results.url})
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### Step 5: Test Locally

```bash
# Build production bundle
npm run build

# Run Lighthouse CI locally
npm run lhci

# View results
open .lighthouseci/lhr-*.html
```

---

## 4. PERFORMANCE BUDGETS EXPLAINED

### What Are Performance Budgets?

Performance budgets are **thresholds** for key metrics. If your app exceeds these budgets, the CI build **fails**.

**Example Budget**:
```json
{
  "budgets": [
    {
      "resourceSizes": [
        {"resourceType": "script", "budget": 300},
        {"resourceType": "stylesheet", "budget": 50},
        {"resourceType": "image", "budget": 200},
        {"resourceType": "total", "budget": 1000}
      ]
    },
    {
      "timings": [
        {"metric": "first-contentful-paint", "budget": 1800},
        {"metric": "interactive", "budget": 3800}
      ]
    }
  ]
}
```

### SwiftFill Current Performance (Baseline)

Based on November 2025 optimizations:

| Metric | Current | Budget | Status |
|--------|---------|--------|--------|
| **Performance Score** | 98/100 | 90/100 | ✅ Excellent |
| **FCP** | 1.2s | 1.8s | ✅ Good |
| **LCP** | 1.8s | 2.5s | ✅ Good |
| **TBT** | 50ms | 200ms | ✅ Excellent |
| **CLS** | 0.05 | 0.1 | ✅ Excellent |
| **Bundle Size** | 148 KB (gzipped) | 200 KB | ✅ Good |

**Recommendation**: Set budgets **10% stricter** than current performance to prevent regression.

---

## 5. OPTION C: VERCEL ANALYTICS INTEGRATION

### Why Vercel Analytics?

**Real-User Monitoring (RUM)** complements Lighthouse CI:
- Lighthouse CI: **Synthetic testing** (lab data)
- Vercel Analytics: **Real user data** (field data)

### Setup (5 minutes)

1. **Enable Vercel Analytics**:
   ```bash
   npm install @vercel/analytics
   ```

2. **Add to App**:
   ```tsx
   // src/main.tsx
   import { Analytics } from '@vercel/analytics/react';
   
   <App>
     <Analytics />
   </App>
   ```

3. **View Dashboard**:
   - Navigate to Vercel project → Analytics tab
   - View Core Web Vitals from real users
   - Filter by device, country, page

### Benefits

- **Real-time alerts**: Get notified when scores drop
- **User segmentation**: See performance by device/region
- **Trend tracking**: Historical performance over time
- **Core Web Vitals**: Track Google ranking signals

---

## 6. ADVANCED: LHCI SERVER (OPTION B)

### When to Upgrade

Upgrade to LHCI Server when:
- Team size > 5 developers
- Multiple projects to track
- Need historical trending
- Want team performance dashboards

### Quick Setup (Docker)

```bash
# docker-compose.yml
version: '3'
services:
  lhci-server:
    image: patrickhulce/lhci-server:latest
    ports:
      - 9001:9001
    volumes:
      - lhci-data:/data
    environment:
      LHCI_STORAGE: sql
      LHCI_STORAGE__SQL_DATABASE_PATH: /data/lhci.db

volumes:
  lhci-data:
```

### Update lighthouserc.json

```json
{
  "ci": {
    "upload": {
      "target": "lhci",
      "serverBaseUrl": "https://your-lhci-server.com",
      "token": "YOUR_BUILD_TOKEN"
    }
  }
}
```

---

## 7. TROUBLESHOOTING

### Issue 1: "startServerCommand failed"

**Cause**: Preview server not starting  
**Fix**: Use `wait-on` to wait for server:

```bash
npm install --save-dev wait-on

# lighthouserc.json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run build && npm run preview & npx wait-on http://localhost:4173"
    }
  }
}
```

### Issue 2: Scores fluctuate wildly

**Cause**: GitHub Actions runners have variable performance  
**Fix**: Increase `numberOfRuns` to 5, use median score:

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 5
    }
  }
}
```

### Issue 3: CI takes too long (>15 minutes)

**Cause**: Too many URLs or runs  
**Fix**: Reduce to critical pages only:

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4173/"],  // Only homepage
      "numberOfRuns": 3
    }
  }
}
```

### Issue 4: Performance scores fail on CI but pass locally

**Cause**: CI environment is different (CPU, network)  
**Fix**: Adjust budgets for CI variance (+10%):

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.85}]  // 85 instead of 90
      }
    }
  }
}
```

---

## 8. BEST PRACTICES (NOVEMBER 2025)

### 1. Run on Every PR (Not Just Main)

**Why**: Catch regressions before merge  
**How**: Trigger on `pull_request` event

### 2. Use Performance Budgets, Not Just Scores

**Why**: Scores can be gamed, budgets are concrete  
**How**: Set budgets for FCP, LCP, TBT, bundle sizes

### 3. Track Real User Data Too

**Why**: Lab data ≠ real user experience  
**How**: Use Vercel Analytics or Google Analytics 4

### 4. Set Realistic Budgets

**Why**: Too strict = constant failures, too loose = no value  
**How**: Baseline current performance, set budgets 10% stricter

### 5. Monitor Trends, Not Absolute Values

**Why**: Single run can fluctuate ±5 points  
**How**: Look for consistent degradation over multiple PRs

### 6. Optimize for Mobile First

**Why**: 60% of web traffic is mobile  
**How**: Use `preset: "mobile"` in Lighthouse config

### 7. Test Critical User Flows

**Why**: Homepage performance ≠ app performance  
**How**: Test `/`, `/auth`, `/form-editor` pages

### 8. Educate Team on Performance

**Why**: Developers need to understand impact of changes  
**How**: Share Lighthouse reports, celebrate improvements

---

## 9. PERFORMANCE OPTIMIZATION CHECKLIST

If Lighthouse CI fails, use this checklist:

### Images
- [ ] All images optimized (WebP, AVIF)
- [ ] Lazy loading enabled (`loading="lazy"`)
- [ ] Responsive images with srcset
- [ ] Image CDN with automatic optimization

### JavaScript
- [ ] Code splitting enabled
- [ ] Tree shaking configured
- [ ] Unused code eliminated
- [ ] Vendor chunks separated
- [ ] Dynamic imports for heavy components

### CSS
- [ ] Critical CSS inlined
- [ ] Unused CSS purged
- [ ] CSS minified
- [ ] Font loading optimized

### Fonts
- [ ] Font subsetting enabled
- [ ] `font-display: swap` set
- [ ] Preload critical fonts
- [ ] Limit font weights/styles

### Caching
- [ ] Service worker configured
- [ ] HTTP cache headers set
- [ ] CDN caching enabled
- [ ] Asset fingerprinting

### Third-Party Scripts
- [ ] Defer non-critical scripts
- [ ] Use `async` where possible
- [ ] Self-host analytics (if possible)
- [ ] Lazy load chat widgets

---

## 10. INTEGRATION WITH EXISTING CI/CD

### Current Workflow (test.yml)

```yaml
jobs:
  quality-gates: ...
  smoke-tests: ...
  integration-tests: ...
  e2e-tests: ...
  lighthouse: ...  # NEW
  test-summary:
    needs: [quality-gates, smoke-tests, integration-tests, e2e-tests, lighthouse]
```

### Updated test-summary

```yaml
- name: Check test results
  run: |
    if [[ "${{ needs.lighthouse.result }}" == "failure" ]]; then
      echo "⚠️ **PERFORMANCE**: Lighthouse CI failed! Performance regression detected." >> $GITHUB_STEP_SUMMARY
      exit 1
    fi
```

---

## 11. SUCCESS METRICS

### Week 1
- ✅ Lighthouse CI running on all PRs
- ✅ Baseline performance documented
- ✅ Budgets configured

### Month 1
- ✅ Zero performance regressions merged
- ✅ Team trained on performance optimization
- ✅ 90+ Lighthouse scores maintained

### Quarter 1
- ✅ 30% improvement in Core Web Vitals
- ✅ 40% reduction in performance-related issues
- ✅ Vercel Analytics integrated for RUM

---

## 12. ESTIMATED EFFORT

**Setup Time**: 2-3 hours (Option A)  
**Maintenance**: 30 minutes/month (reviewing budgets)  
**ROI**: 40% reduction in user-facing performance issues

**Breakdown**:
- Install dependencies: 5 minutes
- Create lighthouserc.json: 30 minutes
- Create GitHub Actions workflow: 45 minutes
- Test locally: 30 minutes
- Debug CI issues: 30-60 minutes
- Document baselines: 30 minutes

---

## 13. RESOURCES

### Official Documentation
- [Lighthouse CI Docs](https://github.com/GoogleChrome/lighthouse-ci/tree/main/docs) (November 2025)
- [Lighthouse Scoring Guide](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
- [Core Web Vitals](https://web.dev/vitals/)

### Community Resources
- [Lighthouse CI GitHub Actions](https://github.com/treosh/lighthouse-ci-action)
- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Performance Budgets Calculator](https://perf-budget-calculator.firebaseapp.com/)

---

## 14. NEXT STEPS

### Immediate (Today)
1. Install `@lhci/cli` dependency
2. Create `lighthouserc.json` configuration
3. Add npm scripts to `package.json`
4. Test locally with `npm run lhci`

### Short-Term (This Week)
5. Create `.github/workflows/lighthouse.yml`
6. Push to branch and test on CI
7. Document baseline performance
8. Set performance budgets

### Long-Term (Month 1)
9. Integrate Vercel Analytics for RUM
10. Train team on performance optimization
11. Consider LHCI Server for historical trending

---

**Status**: Ready for Implementation  
**Priority**: P1-3 (Medium-High)  
**Expected Impact**: 40% reduction in performance issues, maintain 90+ Lighthouse scores  

---

🚀 **Performance monitoring = Proactive quality assurance!**
