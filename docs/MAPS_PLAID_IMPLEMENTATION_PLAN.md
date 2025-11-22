# Google Maps & Plaid API Implementation Plan

**Created**: November 21, 2025
**Status**: In Progress
**Target Completion**: 12 weeks

## Executive Summary

This plan outlines the integration of Google Maps API and Plaid API into SwiftFill to create a defensible competitive moat through:
- **85% reduction** in address-related form rejections
- **88% reduction** in FL-150 completion time (2 hours → 15 minutes)
- **Premium tier pricing** at $149/month

---

## Phase 1: Google Maps Integration (Weeks 1-4)

### Week 1: Infrastructure Setup

**Tasks:**
1. Set up Google Cloud Platform project
2. Enable required APIs:
   - Places API (New)
   - Address Validation API
   - Geocoding API
   - Routes API (Compute Route Matrix)
3. Configure API key restrictions (HTTP referrer, API restrictions)
4. Set up environment variables in Supabase

**Deliverables:**
- [ ] GCP project created
- [ ] API keys generated and restricted
- [ ] `VITE_GOOGLE_MAPS_API_KEY` configured
- [ ] Billing alerts set up ($50, $100 thresholds)

### Week 2: Address Autocomplete Component

**Tasks:**
1. Create `src/lib/googleMapsService.ts` - Core service class
2. Create `src/components/AddressAutocomplete.tsx` - React component
3. Implement session token management for billing optimization
4. Add California Address Confidentiality Program support
5. Integrate with Liquid Justice Input component styling

**Technical Specifications:**
```typescript
// Session token management
interface AutocompleteSession {
  token: string;
  createdAt: number;
  requestCount: number;
}

// Address result structure
interface AddressResult {
  formattedAddress: string;
  streetNumber: string;
  route: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  placeId: string;
}
```

**Privacy Safeguards:**
- Support "Address Confidential" checkbox
- PO Box detection and warning for protected persons
- Never log full addresses (only county for analytics)
- Clear address cache on session end

### Week 3: Address Validation Integration

**Tasks:**
1. Add validation on form blur/submit
2. Display inline validation errors with suggestions
3. Implement USPS standardization
4. Handle undeliverable addresses gracefully

**Validation Response Handling:**
```typescript
interface ValidationResult {
  isValid: boolean;
  verdict: 'CONFIRMED' | 'UNCONFIRMED_BUT_PLAUSIBLE' | 'SUSPICIOUS';
  standardizedAddress: AddressResult;
  missingComponents: string[];
  suggestions: string[];
}
```

### Week 4: Court Location Finder

**Tasks:**
1. Pre-populate database with 58 California Superior Court locations
2. Create `src/data/californiaСourts.ts` with court metadata
3. Implement county-to-court mapping
4. Add distance calculation for accessibility planning
5. Display court hours and filing instructions

**Court Data Structure:**
```typescript
interface CaliforniaCourt {
  county: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  hours: string;
  filingUrl: string;
  dvSpecificInfo?: string;
}
```

---

## Phase 2: Plaid Integration (Weeks 5-12)

### Week 5-6: Plaid Setup & Authentication

**Tasks:**
1. Create Plaid developer account
2. Complete production access application (2-4 weeks approval)
3. Set up sandbox environment for development
4. Create Supabase Edge Function for token exchange
5. Implement Plaid Link React component

**Required Plaid Products:**
- `transactions` - Expense categorization
- `assets` - Account balances, holdings
- `income_verification` - Bank income
- `liabilities` - Debts, loans

**Edge Function: `/functions/v1/plaid-link-token`**
```typescript
// Creates link token for Plaid Link initialization
interface LinkTokenRequest {
  userId: string;
  products: string[];
}

interface LinkTokenResponse {
  linkToken: string;
  expiration: string;
}
```

**Edge Function: `/functions/v1/plaid-exchange-token`**
```typescript
// Exchanges public token for access token
interface ExchangeRequest {
  publicToken: string;
  metadata: PlaidLinkMetadata;
}

interface ExchangeResponse {
  success: boolean;
  institutionName: string;
  accounts: Account[];
}
```

### Week 7-8: Transactions Integration

**Tasks:**
1. Implement `/transactions/get` endpoint integration
2. Create category mapping: Plaid → FL-150 expense categories
3. Build expense aggregation logic (last 30/60/90 days)
4. Create `usePlaidTransactions` hook
5. Design auto-fill UI for FL-150 Item 14 (Expense Summary)

**Category Mapping:**
```typescript
const PLAID_TO_FL150_CATEGORIES: Record<string, FL150Category> = {
  'FOOD_AND_DRINK': 'food_household',
  'FOOD_AND_DRINK_GROCERIES': 'food_household',
  'RENT_AND_UTILITIES': 'rent_mortgage',
  'RENT_AND_UTILITIES_RENT': 'rent_mortgage',
  'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY': 'utilities',
  'TRANSPORTATION': 'transportation',
  'TRANSPORTATION_GAS': 'transportation',
  'MEDICAL': 'health_care',
  'MEDICAL_HEALTH_CARE': 'health_care',
  'PERSONAL_CARE': 'personal_care',
  'ENTERTAINMENT': 'entertainment',
  'TRANSFER_OUT': 'installment_payments',
  // ... complete mapping
};
```

### Week 9-10: Income & Assets Integration

**Tasks:**
1. Implement `/assets/report/get` for FL-150 Item 17
2. Implement bank income verification for Item 10
3. Build income aggregation (gross monthly from deposits)
4. Create `usePlaidAssets` and `usePlaidIncome` hooks
5. Handle multi-account scenarios

**Asset Report Structure:**
```typescript
interface AssetSummary {
  checkingAccounts: AccountBalance[];
  savingsAccounts: AccountBalance[];
  investmentAccounts: InvestmentAccount[];
  retirementAccounts: RetirementAccount[];
  totalLiquidAssets: number;
}

interface AccountBalance {
  institutionName: string;
  accountName: string;
  currentBalance: number;
  availableBalance: number;
}
```

### Week 11-12: Liabilities & Polish

**Tasks:**
1. Implement `/liabilities/get` for FL-150 Item 18
2. Build debt summary aggregation
3. Create comprehensive FL-150 auto-fill flow
4. Implement error handling and retry logic
5. Add "Disconnect Account" functionality
6. Implement data refresh mechanism

**Liabilities Structure:**
```typescript
interface LiabilitySummary {
  creditCards: CreditCard[];
  mortgages: Mortgage[];
  studentLoans: StudentLoan[];
  autoLoans: AutoLoan[];
  otherLoans: Loan[];
  totalDebt: number;
  totalMonthlyPayments: number;
}
```

---

## Database Schema

### New Tables

```sql
-- Plaid connection metadata
CREATE TABLE plaid_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL, -- AES-256-GCM encrypted
  item_id TEXT NOT NULL,
  products TEXT[] NOT NULL,
  consent_expiration TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  error_code TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, institution_id)
);

-- Cached financial data for FL-150
CREATE TABLE fl150_financial_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES tro_workflows(id),

  -- Income data (encrypted)
  monthly_income JSONB,
  income_sources JSONB,

  -- Expense data
  monthly_expenses JSONB,
  expense_categories JSONB,

  -- Assets (encrypted)
  assets_summary JSONB,

  -- Liabilities
  liabilities_summary JSONB,

  -- Metadata
  data_as_of_date DATE NOT NULL,
  cache_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Address validation cache
CREATE TABLE address_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  input_address TEXT NOT NULL,
  validated_address JSONB NOT NULL,
  validation_result TEXT NOT NULL,
  place_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Cache for 30 days
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- California court locations (reference data)
CREATE TABLE california_courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county TEXT NOT NULL UNIQUE,
  court_name TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'CA',
  zip_code TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  hours TEXT,
  filing_url TEXT,
  dv_specific_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for financial data access
CREATE TABLE financial_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'connect', 'sync', 'view', 'export', 'disconnect'
  resource_type TEXT NOT NULL, -- 'transactions', 'assets', 'income', 'liabilities'
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

```sql
-- plaid_connections: Users can only access own connections
ALTER TABLE plaid_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own Plaid connections"
  ON plaid_connections FOR ALL
  USING (auth.uid() = user_id);

-- fl150_financial_cache: Users can only access own cache
ALTER TABLE fl150_financial_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own financial cache"
  ON fl150_financial_cache FOR ALL
  USING (auth.uid() = user_id);

-- address_validations: Users can access own or anonymous validations
ALTER TABLE address_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own address validations"
  ON address_validations FOR ALL
  USING (user_id IS NULL OR auth.uid() = user_id);

-- financial_access_log: Users can only view own logs
ALTER TABLE financial_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial access logs"
  ON financial_access_log FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Security Requirements

### DV-Specific Privacy Safeguards

1. **No Joint Account Alerts**: Don't notify other account holders
2. **Auto-Logout**: 5-minute idle timeout when viewing financial data
3. **No Email Confirmations**: Don't send emails about connections
4. **Separate Session**: Financial data requires re-authentication
5. **Audit Trail**: Log all financial data access

### Encryption Requirements

1. **Plaid Access Tokens**: AES-256-GCM encrypted in database
2. **Financial Data Cache**: Encrypt income, assets, SSN fields
3. **Address Data**: Don't log full addresses (county only)
4. **Transmission**: HTTPS only, no plaintext API keys in client

### Compliance

1. **CCPA**: Implement "Delete My Data" for California users
2. **VAWA**: Never share financial data without explicit consent
3. **SOC 2**: Follow Supabase's SOC 2 practices for data handling

---

## API Cost Estimates

### Google Maps (10,000 MAU)

| API | Monthly Usage | Cost |
|-----|---------------|------|
| Places Autocomplete | 50,000 | $0 (session pricing) |
| Address Validation | 10,000 | $0 (free tier) |
| Geocoding | 5,000 | $0 (free tier) |
| Route Matrix | 2,000 | $10 |
| **Total** | | **~$10-50/month** |

### Plaid (3,000 Premium Users)

| Product | Monthly Usage | Cost |
|---------|---------------|------|
| Auth | 3,000 | $1,500-6,000 |
| Transactions | 3,000 | $1,500-3,000 |
| Assets | 3,000 | $9,000-15,000 |
| Income | 1,000 | $3,000-5,000 |
| **Total** | | **$15,000-29,000/month** |

### Cost Optimization Strategies

1. **Tiered Access**: Only fetch Assets/Income on demand
2. **Caching**: 30-day cache for financial data
3. **Batching**: Aggregate requests where possible
4. **Volume Discounts**: Negotiate at 10K+ MAU

---

## Success Metrics

### Technical KPIs

- [ ] Address validation accuracy: >98%
- [ ] FL-150 auto-fill coverage: >80% of fields
- [ ] API error rate: <1%
- [ ] Plaid connection success rate: >95%
- [ ] Cache hit rate: >70%

### Business KPIs

- [ ] Premium tier adoption: >30%
- [ ] Time to complete FL-150: <15 minutes
- [ ] Form rejection rate: <5%
- [ ] User satisfaction (NPS): >60

### Safety KPIs

- [ ] Zero privacy incidents
- [ ] 100% audit log coverage
- [ ] CCPA deletion compliance: <72 hours

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|------------|
| Plaid API downtime | Graceful fallback to manual entry |
| Google Maps rate limits | Session management, request queuing |
| Token expiration | Automatic refresh, user notification |
| Data sync failures | Retry with exponential backoff |

### Business Risks

| Risk | Mitigation |
|------|------------|
| Low bank connection rate | Clear privacy messaging, optional |
| Plaid pricing increases | Annual contracts, abstraction layer |
| User confusion | Progressive disclosure, tooltips |

### Privacy Risks

| Risk | Mitigation |
|------|------------|
| Abuser access | Re-auth, auto-logout, no emails |
| Joint account exposure | Warning before connecting |
| Data breach | Field-level encryption, short retention |

---

## Testing Plan

### Unit Tests

- [ ] Google Maps service: 20+ tests
- [ ] Plaid service: 30+ tests
- [ ] Category mapping: 50+ tests
- [ ] Encryption: 10+ tests

### Integration Tests

- [ ] Complete FL-150 auto-fill flow
- [ ] Address validation → form population
- [ ] Multi-account aggregation
- [ ] Error recovery scenarios

### E2E Tests

- [ ] Bank connection happy path
- [ ] Form completion with auto-fill
- [ ] Disconnect and data deletion
- [ ] Offline fallback behavior

### Security Tests

- [ ] Penetration testing for financial endpoints
- [ ] Token handling audit
- [ ] RLS policy verification
- [ ] Encryption key rotation

---

## Deployment Checklist

### Phase 1 (Google Maps)

- [ ] GCP project and API keys
- [ ] Environment variables in Supabase
- [ ] Database migrations applied
- [ ] Court locations seeded
- [ ] Feature flag enabled for beta

### Phase 2 (Plaid)

- [ ] Plaid production access approved
- [ ] Edge functions deployed
- [ ] Secrets configured
- [ ] Audit logging enabled
- [ ] CCPA deletion endpoint ready

---

## Timeline Summary

| Week | Milestone |
|------|-----------|
| 1 | GCP setup, API keys |
| 2 | Address autocomplete component |
| 3 | Address validation integration |
| 4 | Court location finder |
| 5-6 | Plaid setup, Link component |
| 7-8 | Transactions integration |
| 9-10 | Income & Assets integration |
| 11-12 | Liabilities, polish, testing |

---

## Next Steps

1. ✅ Research APIs (completed)
2. 🔄 Create database migration
3. 🔄 Build Google Maps service
4. ⏳ Apply for Plaid production access
5. ⏳ Create Linear project for tracking

---

*Document maintained by Claude Code*
*Last updated: November 21, 2025*
