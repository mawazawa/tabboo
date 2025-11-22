/**
 * Plaid Service
 *
 * Purpose: Client-side Plaid integration for FL-150 financial auto-fill
 *
 * Features:
 * - Link token creation
 * - Public token exchange
 * - Transaction sync with cursor pagination
 * - Category mapping to FL-150 expense categories
 * - Assets and liabilities retrieval
 *
 * Sandbox Configuration:
 * - Endpoint: sandbox.plaid.com
 * - Test user: user_good / pass_good
 * - Dynamic transactions: user_transactions_dynamic / any password
 *
 * Environment Variables (Supabase Edge Functions):
 * - PLAID_CLIENT_ID
 * - PLAID_SECRET (sandbox secret)
 * - PLAID_ENV=sandbox
 *
 * @see https://plaid.com/docs/sandbox/
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type PlaidEnvironment = 'sandbox' | 'development' | 'production';

export interface PlaidAccount {
  accountId: string;
  name: string;
  officialName: string | null;
  type: 'depository' | 'credit' | 'loan' | 'investment' | 'other';
  subtype: string;
  mask: string;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
    isoCurrencyCode: string;
  };
}

export interface PlaidTransaction {
  transactionId: string;
  accountId: string;
  amount: number;
  date: string;
  name: string;
  merchantName: string | null;
  category: string[];
  personalFinanceCategory: {
    primary: string;
    detailed: string;
  } | null;
  pending: boolean;
}

export interface PlaidInstitution {
  institutionId: string;
  name: string;
}

export interface LinkTokenResponse {
  linkToken: string;
  expiration: string;
}

export interface PublicTokenExchangeResponse {
  success: boolean;
  itemId: string;
  accounts: PlaidAccount[];
  institution: PlaidInstitution;
}

export interface TransactionSyncResponse {
  added: PlaidTransaction[];
  modified: PlaidTransaction[];
  removed: string[];
  hasMore: boolean;
  nextCursor: string;
}

export interface FL150ExpenseCategory {
  category: string;
  label: string;
  amount: number;
  transactions: PlaidTransaction[];
}

export interface FL150FinancialData {
  // Income (Item 10-13)
  monthlyGrossIncome: number;
  incomeSources: Array<{
    source: string;
    amount: number;
  }>;

  // Expenses (Item 14)
  expenses: FL150ExpenseCategory[];
  totalMonthlyExpenses: number;

  // Assets (Item 17)
  checkingAccounts: PlaidAccount[];
  savingsAccounts: PlaidAccount[];
  totalLiquidAssets: number;

  // Liabilities (Item 18)
  creditCards: Array<{
    name: string;
    balance: number;
    limit: number;
  }>;
  loans: Array<{
    name: string;
    balance: number;
    monthlyPayment: number;
  }>;
  totalDebt: number;
  totalMonthlyDebtPayments: number;

  // Metadata
  dataAsOfDate: string;
  institutionName: string;
}

// ============================================================================
// Plaid Category to FL-150 Category Mapping
// ============================================================================

/**
 * Maps Plaid personal_finance_category to FL-150 expense categories
 * FL-150 categories from California Judicial Council form
 */
export const PLAID_TO_FL150_CATEGORY_MAP: Record<string, string> = {
  // Food & Dining → Food and household supplies
  'FOOD_AND_DRINK': 'food_household',
  'FOOD_AND_DRINK_GROCERIES': 'food_household',
  'FOOD_AND_DRINK_RESTAURANT': 'food_household',
  'FOOD_AND_DRINK_COFFEE': 'food_household',
  'FOOD_AND_DRINK_FAST_FOOD': 'food_household',
  'FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR': 'food_household',

  // Housing → Rent/Mortgage
  'RENT_AND_UTILITIES': 'rent_mortgage',
  'RENT_AND_UTILITIES_RENT': 'rent_mortgage',

  // Utilities
  'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY': 'utilities',
  'RENT_AND_UTILITIES_WATER': 'utilities',
  'RENT_AND_UTILITIES_INTERNET_AND_CABLE': 'utilities',
  'RENT_AND_UTILITIES_TELEPHONE': 'telephone',
  'RENT_AND_UTILITIES_SEWAGE_AND_WASTE': 'utilities',

  // Transportation
  'TRANSPORTATION': 'transportation',
  'TRANSPORTATION_GAS': 'transportation',
  'TRANSPORTATION_PARKING': 'transportation',
  'TRANSPORTATION_PUBLIC_TRANSIT': 'transportation',
  'TRANSPORTATION_TAXIS_AND_RIDE_SHARES': 'transportation',
  'TRANSPORTATION_TOLLS': 'transportation',

  // Auto
  'LOAN_PAYMENTS_CAR_PAYMENT': 'auto_payments',
  'TRANSPORTATION_CAR_DEALERS_AND_LEASING': 'auto_payments',

  // Insurance
  'TRANSFER_OUT_INSURANCE': 'insurance',
  'GENERAL_SERVICES_INSURANCE': 'insurance',

  // Medical/Health
  'MEDICAL': 'health_care',
  'MEDICAL_PHARMACIES_AND_SUPPLEMENTS': 'health_care',
  'MEDICAL_DENTISTS_AND_ORTHODONTISTS': 'health_care',
  'MEDICAL_EYE_CARE': 'health_care',
  'MEDICAL_VETERINARY_SERVICES': 'health_care',

  // Childcare & Education
  'GENERAL_SERVICES_CHILDCARE': 'child_care',
  'GENERAL_SERVICES_EDUCATION': 'education',
  'BANK_FEES_AND_CHARGES_EDUCATION_LOAN': 'education',

  // Personal Care
  'PERSONAL_CARE': 'personal_care',
  'PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS': 'personal_care',
  'PERSONAL_CARE_HAIR_AND_BEAUTY': 'personal_care',
  'PERSONAL_CARE_LAUNDRY_AND_DRY_CLEANING': 'laundry_cleaning',

  // Entertainment
  'ENTERTAINMENT': 'entertainment',
  'ENTERTAINMENT_TV_AND_MOVIES': 'entertainment',
  'ENTERTAINMENT_MUSIC_AND_AUDIO': 'entertainment',
  'ENTERTAINMENT_SPORTING_EVENTS': 'entertainment',
  'ENTERTAINMENT_GAMES': 'entertainment',

  // Savings & Investments (not expenses, but track for assets)
  'TRANSFER_OUT_SAVINGS': 'savings',
  'TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS': 'savings',
};

/**
 * FL-150 expense category labels (matching form fields)
 */
export const FL150_CATEGORY_LABELS: Record<string, string> = {
  rent_mortgage: 'Rent or mortgage payment',
  food_household: 'Food and household supplies',
  utilities: 'Utilities (gas, electric, water, trash)',
  telephone: 'Telephone, cell phone, email',
  laundry_cleaning: 'Laundry and cleaning',
  clothing: 'Clothing',
  insurance: 'Insurance (life, accident, health)',
  education: 'Education',
  child_care: 'Child care',
  health_care: 'Health care (not covered by insurance)',
  transportation: 'Transportation and auto expenses',
  auto_payments: 'Auto payments',
  entertainment: 'Entertainment, gifts, vacation',
  personal_care: 'Personal care',
  savings: 'Savings and investments',
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a Plaid Link token
 * Call this before opening Plaid Link
 *
 * @param userId - User ID for the link session
 * @param products - Plaid products to initialize
 * @returns Link token for Plaid Link
 */
export async function createLinkToken(
  userId: string,
  products: string[] = ['transactions', 'assets', 'liabilities']
): Promise<LinkTokenResponse> {
  const { data, error } = await supabase.functions.invoke('plaid-link-token', {
    body: {
      userId,
      products,
    },
  });

  if (error) {
    console.error('Error creating link token:', error);
    throw new Error(`Failed to create link token: ${error.message}`);
  }

  return data;
}

/**
 * Exchange public token for access token
 * Call this in the Plaid Link onSuccess callback
 *
 * @param publicToken - Public token from Plaid Link
 * @param metadata - Metadata from Plaid Link
 * @returns Exchange result with accounts
 */
export async function exchangePublicToken(
  publicToken: string,
  metadata: {
    institution: { institution_id: string; name: string };
    accounts: Array<{ id: string; name: string; type: string; subtype: string; mask: string }>;
  }
): Promise<PublicTokenExchangeResponse> {
  const { data, error } = await supabase.functions.invoke('plaid-exchange-token', {
    body: {
      publicToken,
      institutionId: metadata.institution.institution_id,
      institutionName: metadata.institution.name,
      accounts: metadata.accounts,
    },
  });

  if (error) {
    console.error('Error exchanging token:', error);
    throw new Error(`Failed to exchange token: ${error.message}`);
  }

  return data;
}

/**
 * Sync transactions for a connected institution
 *
 * @param institutionId - Institution ID to sync
 * @param cursor - Optional cursor for pagination
 * @returns Transaction sync results
 */
export async function syncTransactions(
  institutionId: string,
  cursor?: string
): Promise<TransactionSyncResponse> {
  const { data, error } = await supabase.functions.invoke('plaid-transactions-sync', {
    body: {
      institutionId,
      cursor,
    },
  });

  if (error) {
    console.error('Error syncing transactions:', error);
    throw new Error(`Failed to sync transactions: ${error.message}`);
  }

  return data;
}

/**
 * Get all transactions (handles pagination automatically)
 *
 * @param institutionId - Institution ID
 * @param maxPages - Maximum number of pages to fetch (default 20, ~10k transactions)
 * @returns All transactions
 */
export async function getAllTransactions(
  institutionId: string,
  maxPages: number = 20
): Promise<PlaidTransaction[]> {
  const allTransactions: PlaidTransaction[] = [];
  let cursor: string | undefined;
  let hasMore = true;
  let pageCount = 0;

  while (hasMore && pageCount < maxPages) {
    const response = await syncTransactions(institutionId, cursor);
    allTransactions.push(...response.added);
    cursor = response.nextCursor;
    hasMore = response.hasMore;
    pageCount++;

    // Safety check: if we're getting empty responses, stop
    if (response.added.length === 0 && response.modified.length === 0) {
      break;
    }
  }

  if (pageCount >= maxPages && hasMore) {
    console.warn(`Transaction sync stopped at ${maxPages} pages. More data may be available.`);
  }

  return allTransactions;
}

/**
 * Get account balances (for assets)
 *
 * @param institutionId - Institution ID
 * @returns Account balances
 */
export async function getAccountBalances(
  institutionId: string
): Promise<PlaidAccount[]> {
  const { data, error } = await supabase.functions.invoke('plaid-balances', {
    body: {
      institutionId,
    },
  });

  if (error) {
    console.error('Error getting balances:', error);
    throw new Error(`Failed to get balances: ${error.message}`);
  }

  return data.accounts;
}

/**
 * Get liabilities (credit cards, loans)
 *
 * @param institutionId - Institution ID
 * @returns Liabilities data
 */
export async function getLiabilities(
  institutionId: string
): Promise<{
  creditCards: Array<{ name: string; balance: number; limit: number }>;
  loans: Array<{ name: string; balance: number; monthlyPayment: number }>;
}> {
  const { data, error } = await supabase.functions.invoke('plaid-liabilities', {
    body: {
      institutionId,
    },
  });

  if (error) {
    console.error('Error getting liabilities:', error);
    throw new Error(`Failed to get liabilities: ${error.message}`);
  }

  return data;
}

// ============================================================================
// Data Processing Functions
// ============================================================================

/**
 * Aggregate transactions into FL-150 expense categories
 *
 * @param transactions - Raw Plaid transactions
 * @param months - Number of months to aggregate (default 1)
 * @returns Categorized expenses for FL-150
 */
export function aggregateExpenses(
  transactions: PlaidTransaction[],
  months: number = 1
): FL150ExpenseCategory[] {
  // Validate months to prevent division by zero
  const validMonths = Math.max(1, months);

  // Filter to last N months and non-pending
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - validMonths);

  const relevantTransactions = transactions.filter(
    t => !t.pending && new Date(t.date) >= cutoffDate && t.amount > 0
  );

  // Group by FL-150 category
  const categoryMap = new Map<string, { amount: number; transactions: PlaidTransaction[] }>();

  for (const transaction of relevantTransactions) {
    // Get FL-150 category from Plaid category
    const plaidCategory = transaction.personalFinanceCategory?.primary ||
      transaction.category?.[0] ||
      'OTHER';
    const fl150Category = PLAID_TO_FL150_CATEGORY_MAP[plaidCategory] || 'other';

    const existing = categoryMap.get(fl150Category) || { amount: 0, transactions: [] };
    existing.amount += transaction.amount;
    existing.transactions.push(transaction);
    categoryMap.set(fl150Category, existing);
  }

  // Convert to array and calculate monthly average
  const expenses: FL150ExpenseCategory[] = [];

  for (const [category, data] of categoryMap.entries()) {
    expenses.push({
      category,
      label: FL150_CATEGORY_LABELS[category] || category,
      amount: Math.round((data.amount / validMonths) * 100) / 100,
      transactions: data.transactions,
    });
  }

  // Sort by amount descending
  expenses.sort((a, b) => b.amount - a.amount);

  return expenses;
}

/**
 * Calculate monthly income from deposits
 *
 * @param transactions - Raw Plaid transactions
 * @param months - Number of months to analyze
 * @returns Monthly income estimate
 */
export function calculateMonthlyIncome(
  transactions: PlaidTransaction[],
  months: number = 3
): { total: number; sources: Array<{ source: string; amount: number }> } {
  // Validate months to prevent division by zero
  const validMonths = Math.max(1, months);

  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - validMonths);

  // Income = negative amounts (deposits) in certain categories
  const incomeCategories = [
    'INCOME',
    'INCOME_WAGES',
    'INCOME_DIVIDENDS',
    'INCOME_INTEREST_EARNED',
    'INCOME_RETIREMENT_PENSION',
    'INCOME_TAX_REFUND',
    'INCOME_UNEMPLOYMENT',
    'INCOME_OTHER_INCOME',
    'TRANSFER_IN_DEPOSIT',
  ];

  const incomeTransactions = transactions.filter(t => {
    if (t.pending || new Date(t.date) < cutoffDate) return false;
    if (t.amount >= 0) return false; // Deposits are negative in Plaid

    const category = t.personalFinanceCategory?.primary || '';
    return incomeCategories.some(ic => category.includes(ic));
  });

  // Group by source (merchant/name)
  const sourceMap = new Map<string, number>();

  for (const t of incomeTransactions) {
    const source = t.merchantName || t.name || 'Other Income';
    const existing = sourceMap.get(source) || 0;
    sourceMap.set(source, existing + Math.abs(t.amount));
  }

  // Calculate totals
  const sources = Array.from(sourceMap.entries()).map(([source, total]) => ({
    source,
    amount: Math.round((total / validMonths) * 100) / 100,
  }));

  const totalMonthlyIncome = sources.reduce((sum, s) => sum + s.amount, 0);

  return {
    total: Math.round(totalMonthlyIncome * 100) / 100,
    sources: sources.sort((a, b) => b.amount - a.amount),
  };
}

/**
 * Build complete FL-150 financial data from Plaid data
 *
 * @param institutionId - Connected institution ID
 * @returns Complete FL-150 financial data
 */
export async function buildFL150Data(
  institutionId: string
): Promise<FL150FinancialData> {
  // Fetch all data in parallel
  const [transactions, accounts, liabilities] = await Promise.all([
    getAllTransactions(institutionId),
    getAccountBalances(institutionId),
    getLiabilities(institutionId),
  ]);

  // Process transactions
  const expenses = aggregateExpenses(transactions, 1); // Last month
  const income = calculateMonthlyIncome(transactions, 3); // 3-month average

  // Separate accounts by type
  const checkingAccounts = accounts.filter(a => a.subtype === 'checking');
  const savingsAccounts = accounts.filter(a => a.subtype === 'savings');

  // Calculate totals
  const totalLiquidAssets = accounts
    .filter(a => a.type === 'depository')
    .reduce((sum, a) => sum + (a.balances.current || 0), 0);

  const totalDebt = liabilities.creditCards.reduce((sum, c) => sum + c.balance, 0) +
    liabilities.loans.reduce((sum, l) => sum + l.balance, 0);

  const totalMonthlyDebtPayments = liabilities.loans.reduce(
    (sum, l) => sum + l.monthlyPayment,
    0
  );

  return {
    monthlyGrossIncome: income.total,
    incomeSources: income.sources,
    expenses,
    totalMonthlyExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    checkingAccounts,
    savingsAccounts,
    totalLiquidAssets,
    creditCards: liabilities.creditCards,
    loans: liabilities.loans,
    totalDebt,
    totalMonthlyDebtPayments,
    dataAsOfDate: new Date().toISOString().split('T')[0],
    institutionName: '', // Will be filled by caller
  };
}

// ============================================================================
// Connection Management
// ============================================================================

/**
 * Get user's connected Plaid institutions
 *
 * @returns Array of connected institutions
 */
export async function getConnectedInstitutions(): Promise<Array<{
  institutionId: string;
  institutionName: string;
  status: string;
  lastSynced: string | null;
}>> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('plaid_connections')
    .select('institution_id, institution_name, status, last_synced_at')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching connections:', error);
    throw new Error(`Failed to fetch connections: ${error.message}`);
  }

  return (data || []).map(row => ({
    institutionId: row.institution_id,
    institutionName: row.institution_name,
    status: row.status,
    lastSynced: row.last_synced_at,
  }));
}

/**
 * Disconnect a Plaid institution
 *
 * @param institutionId - Institution to disconnect
 */
export async function disconnectInstitution(institutionId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('plaid-disconnect', {
    body: {
      institutionId,
    },
  });

  if (error) {
    console.error('Error disconnecting:', error);
    throw new Error(`Failed to disconnect: ${error.message}`);
  }
}

// ============================================================================
// Sandbox Helpers
// ============================================================================

/**
 * Sandbox test credentials
 * Use these when testing in Plaid Link
 */
export const SANDBOX_CREDENTIALS = {
  // Basic test user
  basic: {
    username: 'user_good',
    password: 'pass_good',
  },
  // User with dynamic transactions (fires webhooks)
  dynamic: {
    username: 'user_transactions_dynamic',
    password: 'any_password',
  },
  // Test institution
  institution: {
    id: 'ins_109508', // First Platypus Bank
    name: 'First Platypus Bank',
  },
  // MFA code when prompted
  mfaCode: '1234',
};

/**
 * Create a sandbox public token directly (bypasses Link UI)
 * Useful for automated testing
 *
 * @param institutionId - Institution ID (default: First Platypus Bank)
 * @param products - Products to initialize
 * @returns Public token
 */
export async function createSandboxPublicToken(
  institutionId: string = 'ins_109508',
  products: string[] = ['transactions']
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('plaid-sandbox-token', {
    body: {
      institutionId,
      products,
    },
  });

  if (error) {
    console.error('Error creating sandbox token:', error);
    throw new Error(`Failed to create sandbox token: ${error.message}`);
  }

  return data.publicToken;
}
