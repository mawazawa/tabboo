# Plaid Sandbox Setup Guide

**Last Updated**: November 21, 2025

## Quick Start

### 1. Set Environment Variables in Supabase

```bash
# Required for Plaid integration
npx supabase secrets set PLAID_CLIENT_ID=your_client_id_here
npx supabase secrets set PLAID_SECRET=your_sandbox_secret_here
npx supabase secrets set PLAID_ENV=sandbox
npx supabase secrets set PLAID_TOKEN_ENCRYPTION_KEY=$(openssl rand -hex 32)
```

### 2. Deploy Edge Functions

```bash
npx supabase functions deploy plaid-link-token
npx supabase functions deploy plaid-exchange-token
```

### 3. Apply Database Migration

```bash
npx supabase db push
```

## Testing in Plaid Link

When Plaid Link opens, use these test credentials:

### Basic Test User
- **Username**: `user_good`
- **Password**: `pass_good`
- **MFA Code** (if prompted): `1234`

### Dynamic Transactions User
For more realistic transaction data:
- **Username**: `user_transactions_dynamic`
- **Password**: any non-empty string
- **MFA Code**: `1234`

### Test Institution
- **Name**: First Platypus Bank
- **ID**: `ins_109508`

## Testing Different Scenarios

### Error Testing
Use `user_good` with modified passwords to trigger errors:

| Password | Error |
|----------|-------|
| `error_ITEM_LOCKED` | Account locked |
| `error_INSTITUTION_DOWN` | Institution unavailable |
| `error_INVALID_CREDENTIALS` | Wrong credentials |
| `error_MFA_NOT_SUPPORTED` | MFA not supported |

### Persona-Based Testing
For specific user profiles:

| Username | Profile |
|----------|---------|
| `user_ewa_user` | Early wage access user |
| `user_yuppie` | High-income professional |
| `user_small_business` | Small business owner |

## Usage in SwiftFill

### Basic Integration

```tsx
import { usePlaidLink } from '@/hooks/usePlaidLink';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

function ConnectBankButton() {
  const { open, ready, loading, error } = usePlaidLink({
    products: ['transactions', 'assets', 'liabilities'],
    onSuccess: (data) => {
      console.log('Connected:', data.institution.name);
      console.log('Accounts:', data.accounts);
      // Trigger FL-150 auto-fill
    },
    onError: (err) => {
      console.error('Connection failed:', err.message);
    },
  });

  return (
    <Button
      onClick={open}
      disabled={!ready || loading}
      className="gap-2"
    >
      <Building2 className="h-4 w-4" />
      {loading ? 'Connecting...' : 'Connect Bank Account'}
    </Button>
  );
}
```

### FL-150 Auto-Fill Integration

```tsx
import { buildFL150Data } from '@/lib/plaidService';

async function handlePlaidSuccess(data: PublicTokenExchangeResponse) {
  // Build FL-150 data from connected account
  const fl150Data = await buildFL150Data(data.institution.institutionId);

  // Auto-fill FL-150 form
  setFormData({
    // Item 10: Gross monthly income
    grossMonthlyIncome: fl150Data.monthlyGrossIncome,

    // Item 14: Monthly expenses
    rentMortgage: fl150Data.expenses.find(e => e.category === 'rent_mortgage')?.amount || 0,
    foodHousehold: fl150Data.expenses.find(e => e.category === 'food_household')?.amount || 0,
    utilities: fl150Data.expenses.find(e => e.category === 'utilities')?.amount || 0,
    // ... more categories

    // Item 17: Assets
    checkingAccounts: fl150Data.totalLiquidAssets,

    // Item 18: Debts
    totalDebt: fl150Data.totalDebt,
  });
}
```

## Sandbox Limitations

1. **No Real Data**: All data is simulated
2. **No Webhooks by Default**: Must configure webhook URL
3. **Limited Institutions**: Some production institutions not available
4. **Transaction Dates**: May be in the past

## Production Checklist

Before going to production:

- [ ] Apply for production access in Plaid Dashboard
- [ ] Update `PLAID_SECRET` to production secret
- [ ] Set `PLAID_ENV=production`
- [ ] Configure webhook URL
- [ ] Complete Plaid security review
- [ ] Test with real bank accounts
- [ ] Implement token refresh flow
- [ ] Add rate limiting

## API Reference

### Edge Functions

| Function | Purpose | Method |
|----------|---------|--------|
| `plaid-link-token` | Create Link token | POST |
| `plaid-exchange-token` | Exchange public token | POST |

### Client Functions

| Function | Purpose |
|----------|---------|
| `createLinkToken()` | Get token for Plaid Link |
| `exchangePublicToken()` | Exchange after Link success |
| `syncTransactions()` | Fetch transactions |
| `getAccountBalances()` | Fetch balances |
| `buildFL150Data()` | Build FL-150 auto-fill data |

## Troubleshooting

### "Plaid not configured" error
- Check that `PLAID_CLIENT_ID` and `PLAID_SECRET` are set in Supabase secrets

### "Failed to create link token"
- Verify your Plaid credentials are for sandbox environment
- Check Supabase function logs: `npx supabase functions logs plaid-link-token`

### Link opens but can't connect
- Make sure you're using sandbox test credentials
- Check browser console for errors

### Empty transaction data
- Use `user_transactions_dynamic` for realistic transactions
- Some test users have limited data

## Resources

- [Plaid Sandbox Docs](https://plaid.com/docs/sandbox/)
- [Test Credentials](https://plaid.com/docs/sandbox/test-credentials/)
- [Plaid API Reference](https://plaid.com/docs/api/)
- [Quickstart Guide](https://plaid.com/docs/quickstart/)

---

*SwiftFill Plaid Integration - November 2025*
