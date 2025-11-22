/**
 * Unit tests for Plaid Service
 *
 * Tests category mapping, expense aggregation, and income calculation
 */

import { describe, it, expect } from 'vitest';
import {
  PLAID_TO_FL150_CATEGORY_MAP,
  FL150_CATEGORY_LABELS,
  aggregateExpenses,
  calculateMonthlyIncome,
  SANDBOX_CREDENTIALS,
  type PlaidTransaction,
} from '@/lib/plaid-service';

// ============================================================================
// Category Mapping Tests
// ============================================================================

describe('PLAID_TO_FL150_CATEGORY_MAP', () => {
  it('should map food categories to food_household', () => {
    expect(PLAID_TO_FL150_CATEGORY_MAP['FOOD_AND_DRINK']).toBe('food_household');
    expect(PLAID_TO_FL150_CATEGORY_MAP['FOOD_AND_DRINK_GROCERIES']).toBe('food_household');
    expect(PLAID_TO_FL150_CATEGORY_MAP['FOOD_AND_DRINK_RESTAURANT']).toBe('food_household');
  });

  it('should map rent to rent_mortgage', () => {
    expect(PLAID_TO_FL150_CATEGORY_MAP['RENT_AND_UTILITIES_RENT']).toBe('rent_mortgage');
  });

  it('should map utilities correctly', () => {
    expect(PLAID_TO_FL150_CATEGORY_MAP['RENT_AND_UTILITIES_GAS_AND_ELECTRICITY']).toBe('utilities');
    expect(PLAID_TO_FL150_CATEGORY_MAP['RENT_AND_UTILITIES_WATER']).toBe('utilities');
    expect(PLAID_TO_FL150_CATEGORY_MAP['RENT_AND_UTILITIES_TELEPHONE']).toBe('telephone');
  });

  it('should map transportation categories', () => {
    expect(PLAID_TO_FL150_CATEGORY_MAP['TRANSPORTATION']).toBe('transportation');
    expect(PLAID_TO_FL150_CATEGORY_MAP['TRANSPORTATION_GAS']).toBe('transportation');
  });

  it('should map medical to health_care', () => {
    expect(PLAID_TO_FL150_CATEGORY_MAP['MEDICAL']).toBe('health_care');
    expect(PLAID_TO_FL150_CATEGORY_MAP['MEDICAL_PHARMACIES_AND_SUPPLEMENTS']).toBe('health_care');
  });

  it('should have a label for each mapped category', () => {
    const mappedCategories = new Set(Object.values(PLAID_TO_FL150_CATEGORY_MAP));
    for (const category of mappedCategories) {
      expect(FL150_CATEGORY_LABELS[category]).toBeTruthy();
    }
  });
});

describe('FL150_CATEGORY_LABELS', () => {
  it('should have human-readable labels', () => {
    expect(FL150_CATEGORY_LABELS.rent_mortgage).toBe('Rent or mortgage payment');
    expect(FL150_CATEGORY_LABELS.food_household).toBe('Food and household supplies');
    expect(FL150_CATEGORY_LABELS.utilities).toBe('Utilities (gas, electric, water, trash)');
  });

  it('should cover all major FL-150 categories', () => {
    const requiredCategories = [
      'rent_mortgage',
      'food_household',
      'utilities',
      'telephone',
      'insurance',
      'health_care',
      'child_care',
      'education',
      'entertainment',
      'transportation',
    ];

    for (const category of requiredCategories) {
      expect(FL150_CATEGORY_LABELS[category]).toBeTruthy();
    }
  });
});

// ============================================================================
// Expense Aggregation Tests
// ============================================================================

describe('aggregateExpenses', () => {
  const createTransaction = (
    overrides: Partial<PlaidTransaction> = {}
  ): PlaidTransaction => ({
    transactionId: `txn-${Math.random()}`,
    accountId: 'acc-123',
    amount: 100,
    date: new Date().toISOString().split('T')[0],
    name: 'Test Transaction',
    merchantName: 'Test Merchant',
    category: ['Food and Drink'],
    personalFinanceCategory: {
      primary: 'FOOD_AND_DRINK',
      detailed: 'FOOD_AND_DRINK_GROCERIES',
    },
    pending: false,
    ...overrides,
  });

  it('should aggregate transactions by category', () => {
    const transactions: PlaidTransaction[] = [
      createTransaction({ amount: 50, personalFinanceCategory: { primary: 'FOOD_AND_DRINK', detailed: '' } }),
      createTransaction({ amount: 30, personalFinanceCategory: { primary: 'FOOD_AND_DRINK', detailed: '' } }),
      createTransaction({ amount: 100, personalFinanceCategory: { primary: 'TRANSPORTATION', detailed: '' } }),
    ];

    const expenses = aggregateExpenses(transactions, 1);

    const food = expenses.find(e => e.category === 'food_household');
    const transport = expenses.find(e => e.category === 'transportation');

    expect(food?.amount).toBe(80);
    expect(transport?.amount).toBe(100);
  });

  it('should exclude pending transactions', () => {
    const transactions: PlaidTransaction[] = [
      createTransaction({ amount: 50, pending: false }),
      createTransaction({ amount: 100, pending: true }),
    ];

    const expenses = aggregateExpenses(transactions, 1);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    expect(total).toBe(50);
  });

  it('should exclude negative amounts (deposits)', () => {
    const transactions: PlaidTransaction[] = [
      createTransaction({ amount: 50 }),
      createTransaction({ amount: -100 }), // This is a deposit
    ];

    const expenses = aggregateExpenses(transactions, 1);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    expect(total).toBe(50);
  });

  it('should calculate monthly average for multiple months', () => {
    const transactions: PlaidTransaction[] = [
      createTransaction({ amount: 100 }),
      createTransaction({ amount: 100 }),
    ];

    const expenses = aggregateExpenses(transactions, 2);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    expect(total).toBe(100); // 200 / 2 months
  });

  it('should sort expenses by amount descending', () => {
    const transactions: PlaidTransaction[] = [
      createTransaction({ amount: 50, personalFinanceCategory: { primary: 'FOOD_AND_DRINK', detailed: '' } }),
      createTransaction({ amount: 200, personalFinanceCategory: { primary: 'RENT_AND_UTILITIES_RENT', detailed: '' } }),
      createTransaction({ amount: 100, personalFinanceCategory: { primary: 'TRANSPORTATION', detailed: '' } }),
    ];

    const expenses = aggregateExpenses(transactions, 1);

    expect(expenses[0].amount).toBeGreaterThanOrEqual(expenses[1].amount);
    expect(expenses[1].amount).toBeGreaterThanOrEqual(expenses[2].amount);
  });

  it('should handle empty transactions array', () => {
    const expenses = aggregateExpenses([], 1);
    expect(expenses).toHaveLength(0);
  });

  it('should filter out old transactions', () => {
    const oldDate = new Date();
    oldDate.setMonth(oldDate.getMonth() - 2);

    const transactions: PlaidTransaction[] = [
      createTransaction({ amount: 100, date: new Date().toISOString().split('T')[0] }),
      createTransaction({ amount: 200, date: oldDate.toISOString().split('T')[0] }),
    ];

    const expenses = aggregateExpenses(transactions, 1);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    expect(total).toBe(100);
  });

  it('should map unknown categories to other', () => {
    const transactions: PlaidTransaction[] = [
      createTransaction({
        amount: 50,
        personalFinanceCategory: { primary: 'UNKNOWN_CATEGORY', detailed: '' },
      }),
    ];

    const expenses = aggregateExpenses(transactions, 1);
    const other = expenses.find(e => e.category === 'other');

    expect(other).toBeTruthy();
    expect(other?.amount).toBe(50);
  });

  it('should handle months = 0 without division by zero (Bug #1 fix)', () => {
    const transactions: PlaidTransaction[] = [
      createTransaction({ amount: 100 }),
    ];

    // Before fix: would return Infinity or NaN
    // After fix: treats 0 months as 1 month
    const expenses = aggregateExpenses(transactions, 0);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    expect(total).toBe(100);
    expect(Number.isFinite(total)).toBe(true);
    expect(Number.isNaN(total)).toBe(false);
  });

  it('should handle negative months by treating as 1 month', () => {
    const transactions: PlaidTransaction[] = [
      createTransaction({ amount: 100 }),
    ];

    const expenses = aggregateExpenses(transactions, -5);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    expect(total).toBe(100);
    expect(Number.isFinite(total)).toBe(true);
  });
});

// ============================================================================
// Income Calculation Tests
// ============================================================================

describe('calculateMonthlyIncome', () => {
  const createIncomeTransaction = (
    amount: number,
    source: string = 'Employer Inc'
  ): PlaidTransaction => ({
    transactionId: `txn-${Math.random()}`,
    accountId: 'acc-123',
    amount: -amount, // Deposits are negative in Plaid
    date: new Date().toISOString().split('T')[0],
    name: source,
    merchantName: source,
    category: ['Income'],
    personalFinanceCategory: {
      primary: 'INCOME_WAGES',
      detailed: 'INCOME_WAGES',
    },
    pending: false,
  });

  it('should calculate total monthly income', () => {
    const transactions: PlaidTransaction[] = [
      createIncomeTransaction(3000, 'Employer Inc'),
      createIncomeTransaction(3000, 'Employer Inc'),
      createIncomeTransaction(3000, 'Employer Inc'),
    ];

    const income = calculateMonthlyIncome(transactions, 3);

    expect(income.total).toBe(3000); // 9000 / 3 months
  });

  it('should group by source', () => {
    const transactions: PlaidTransaction[] = [
      createIncomeTransaction(3000, 'Main Job'),
      createIncomeTransaction(500, 'Side Gig'),
    ];

    const income = calculateMonthlyIncome(transactions, 1);

    expect(income.sources).toHaveLength(2);
    expect(income.sources.find(s => s.source === 'Main Job')?.amount).toBe(3000);
    expect(income.sources.find(s => s.source === 'Side Gig')?.amount).toBe(500);
  });

  it('should exclude expenses (positive amounts)', () => {
    const transactions: PlaidTransaction[] = [
      createIncomeTransaction(3000),
      {
        ...createIncomeTransaction(100),
        amount: 100, // This is an expense
      },
    ];

    const income = calculateMonthlyIncome(transactions, 1);

    expect(income.total).toBe(3000);
  });

  it('should sort sources by amount descending', () => {
    const transactions: PlaidTransaction[] = [
      createIncomeTransaction(1000, 'Small Job'),
      createIncomeTransaction(5000, 'Big Job'),
      createIncomeTransaction(2000, 'Medium Job'),
    ];

    const income = calculateMonthlyIncome(transactions, 1);

    expect(income.sources[0].amount).toBeGreaterThanOrEqual(income.sources[1].amount);
    expect(income.sources[1].amount).toBeGreaterThanOrEqual(income.sources[2].amount);
  });

  it('should handle empty transactions', () => {
    const income = calculateMonthlyIncome([], 1);

    expect(income.total).toBe(0);
    expect(income.sources).toHaveLength(0);
  });

  it('should use merchantName over name when available', () => {
    const transactions: PlaidTransaction[] = [
      {
        ...createIncomeTransaction(1000),
        name: 'Direct Deposit',
        merchantName: 'Acme Corp',
      },
    ];

    const income = calculateMonthlyIncome(transactions, 1);

    expect(income.sources[0].source).toBe('Acme Corp');
  });

  it('should round to 2 decimal places', () => {
    const transactions: PlaidTransaction[] = [
      createIncomeTransaction(1000.001),
      createIncomeTransaction(1000.002),
      createIncomeTransaction(1000.003),
    ];

    const income = calculateMonthlyIncome(transactions, 3);

    // Check that it's properly rounded
    expect(Number.isInteger(income.total * 100)).toBe(true);
  });

  it('should handle months = 0 without division by zero (Bug #1 fix)', () => {
    const transactions: PlaidTransaction[] = [
      createIncomeTransaction(3000),
    ];

    // Before fix: would return Infinity or NaN
    // After fix: treats 0 months as 1 month
    const income = calculateMonthlyIncome(transactions, 0);

    expect(income.total).toBe(3000);
    expect(Number.isFinite(income.total)).toBe(true);
    expect(Number.isNaN(income.total)).toBe(false);
  });

  it('should handle negative months by treating as 1 month', () => {
    const transactions: PlaidTransaction[] = [
      createIncomeTransaction(3000),
    ];

    const income = calculateMonthlyIncome(transactions, -5);

    expect(income.total).toBe(3000);
    expect(Number.isFinite(income.total)).toBe(true);
  });
});

// ============================================================================
// Sandbox Credentials Tests
// ============================================================================

describe('SANDBOX_CREDENTIALS', () => {
  it('should have basic test user credentials', () => {
    expect(SANDBOX_CREDENTIALS.basic.username).toBe('user_good');
    expect(SANDBOX_CREDENTIALS.basic.password).toBe('pass_good');
  });

  it('should have dynamic user credentials', () => {
    expect(SANDBOX_CREDENTIALS.dynamic.username).toBe('user_transactions_dynamic');
    expect(SANDBOX_CREDENTIALS.dynamic.password).toBeTruthy();
  });

  it('should have test institution', () => {
    expect(SANDBOX_CREDENTIALS.institution.id).toBe('ins_109508');
    expect(SANDBOX_CREDENTIALS.institution.name).toBe('First Platypus Bank');
  });

  it('should have MFA code', () => {
    expect(SANDBOX_CREDENTIALS.mfaCode).toBe('1234');
  });
});
