# SwiftFill Production Deployment Checklist

**Version**: 1.0
**Target**: 100 Beta Test Users
**Last Updated**: November 2025

---

## Pre-Deployment Verification

### Code Quality ✅
- [ ] All tests pass: `npm run test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] No lint warnings: `npm run lint`
- [ ] E2E tests pass: `npx playwright test`
- [ ] Accessibility audit passes: `npx playwright test tests/accessibility-audit.spec.ts`

### Environment Configuration ✅
- [ ] `.env.example` is complete and documented
- [ ] All required secrets documented in deployment guide
- [ ] No hardcoded API keys in codebase

### Security Review ✅
- [ ] RLS enabled on all Supabase tables
- [ ] Edge functions have proper CORS headers
- [ ] Sensitive data encrypted (AES-256-GCM)
- [ ] No exposed credentials in commits

---

## Supabase Deployment

### Database Migrations
```bash
# Push all migrations to production
npx supabase db push

# Verify migrations applied
npx supabase db diff
```

**Required Migrations**:
- [ ] `20251123_rls_performance_indexes.sql` - RLS index optimization
- [ ] DV-100 field position migrations (20251119-20251122)
- [ ] DV-105 field position migrations

### Edge Functions
```bash
# Deploy all edge functions
./scripts/deploy-edge-functions.sh

# Or deploy individually:
npx supabase functions deploy groq-chat
npx supabase functions deploy upload-document-secure
npx supabase functions deploy process-extraction
# ... (see deploy script for full list)
```

**Functions to Deploy**:
- [ ] `ai-form-assistant`
- [ ] `clarification-api`
- [ ] `create-test-user`
- [ ] `get-knowledge-graph`
- [ ] `groq-chat`
- [ ] `plaid-balances`
- [ ] `plaid-exchange-token`
- [ ] `plaid-liabilities`
- [ ] `plaid-link-token`
- [ ] `plaid-transactions-sync`
- [ ] `process-extraction`
- [ ] `upload-document-secure`

### Secrets Configuration
```bash
# Set required secrets in Supabase dashboard or CLI
npx supabase secrets set GROQ_API_KEY=your_key
npx supabase secrets set MISTRAL_API_KEY=your_key
npx supabase secrets set GEMINI_API_KEY=your_key
npx supabase secrets set PLAID_CLIENT_ID=your_id
npx supabase secrets set PLAID_SECRET=your_secret
npx supabase secrets set PLAID_TOKEN_ENCRYPTION_KEY=your_key

# Verify secrets are set
npx supabase secrets list
```

---

## Lovable Platform Deployment

### Environment Variables
Set in Lovable Dashboard → Settings → Environment Variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `VITE_SENTRY_DSN` | Sentry error tracking | ✅ |
| `VITE_ENCRYPTION_KEY` | Client-side encryption | ✅ |
| `VITE_GOOGLE_MAPS_API_KEY` | Address autocomplete | Optional |

### Deploy to Production
1. Open Lovable dashboard
2. Click "Share" → "Publish"
3. Wait for build to complete
4. Verify deployment URL is accessible

---

## Post-Deployment Validation

### Automated Validation
```bash
# Run deployment validation script
node scripts/validate-deployment.mjs https://your-app-url.lovable.app
```

### Manual Verification Checklist

**Authentication Flow**:
- [ ] Can create new account
- [ ] Can sign in with existing account
- [ ] Can sign out
- [ ] Session persists on refresh
- [ ] Protected routes redirect to login

**Form Editor**:
- [ ] PDF loads correctly
- [ ] Field overlays position correctly
- [ ] Can type in form fields
- [ ] Auto-save triggers (check network tab)
- [ ] Data persists after refresh

**AI Assistant**:
- [ ] Chat opens and closes
- [ ] Can send messages
- [ ] Receives streaming responses
- [ ] Form context is included

**TRO Workflow**:
- [ ] Landing page loads for unauthenticated users
- [ ] Type selection works for authenticated users
- [ ] DVRO workflow starts correctly
- [ ] Progress tracking displays

**Error Handling**:
- [ ] Sentry receives test error (check Sentry dashboard)
- [ ] Error boundary displays gracefully
- [ ] Offline indicator works when disconnected

---

## Beta User Onboarding

### Invite Process
1. User fills beta signup form
2. Admin reviews and approves
3. Welcome email sent with:
   - Account creation link
   - Quick start guide
   - Feedback form link

### Support Channels
- In-app feedback button
- Email: support@swiftfill.app
- Documentation: /docs or help center

### Monitoring
- [ ] Sentry error alerts configured
- [ ] Database usage monitoring enabled
- [ ] Edge function logs accessible

---

## Rollback Plan

### If Critical Issues Detected

1. **Immediate**: Revert to previous Lovable deployment
2. **Database**:
   ```bash
   # Rollback last migration if needed
   npx supabase db reset --linked
   ```
3. **Edge Functions**: Redeploy previous version from git

### Issue Escalation
- P0 (Site Down): Rollback immediately, notify all users
- P1 (Major Feature Broken): Rollback feature, hotfix in 4 hours
- P2 (Minor Issues): Document, fix in next release

---

## Success Metrics

### Launch Criteria
- [ ] 0 critical Sentry errors in first hour
- [ ] < 5 error reports from beta users
- [ ] Auth flow success rate > 95%
- [ ] Form save success rate > 99%

### Week 1 Goals
- 100 beta users onboarded
- < 10 support tickets
- NPS score > 30 from feedback

---

## Contacts

- **Engineering**: [Your team contact]
- **Supabase Support**: support@supabase.io
- **Lovable Support**: support@lovable.dev
- **Sentry**: Through dashboard

---

**Deployment approved by**: _________________ **Date**: _________________
