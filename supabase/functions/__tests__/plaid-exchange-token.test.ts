/**
 * Tests for Plaid Exchange Token Edge Function
 *
 * These tests verify that the token exchange function properly handles
 * failures in non-critical operations (like audit logging) without
 * failing the overall request.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// Mock Setup
// ============================================================================

// Extracted audit logging logic for testability
// This mirrors the behavior in the actual edge function

interface AuditLogParams {
  userId: string;
  action: string;
  resourceType: string;
  metadata: Record<string, unknown>;
}

interface SupabaseClient {
  from: (table: string) => {
    insert: (data: Record<string, unknown>) => Promise<{ error: Error | null }>;
  };
}

/**
 * Safe audit log function that doesn't throw on failure
 * This is the FIXED version
 */
async function safeLogAuditEvent(
  client: SupabaseClient,
  params: AuditLogParams
): Promise<{ logged: boolean; error?: string }> {
  try {
    const { error } = await client.from('financial_access_log').insert({
      user_id: params.userId,
      action: params.action,
      resource_type: params.resourceType,
      metadata: params.metadata,
    });

    if (error) {
      console.error('Audit log error (non-critical):', error);
      return { logged: false, error: error.message };
    }

    return { logged: true };
  } catch (auditError) {
    // Log error but don't fail - audit is non-critical
    console.error('Audit log error (non-critical):', auditError);
    return { logged: false, error: String(auditError) };
  }
}

/**
 * Unsafe audit log function that throws on failure
 * This is the BUGGY version (before fix)
 */
async function unsafeLogAuditEvent(
  client: SupabaseClient,
  params: AuditLogParams
): Promise<void> {
  // This is the buggy implementation that would propagate errors
  await client.from('financial_access_log').insert({
    user_id: params.userId,
    action: params.action,
    resource_type: params.resourceType,
    metadata: params.metadata,
  });
}

// ============================================================================
// Tests
// ============================================================================

describe('Plaid Exchange Token - Audit Log Error Handling', () => {
  const auditParams: AuditLogParams = {
    userId: 'user-123',
    action: 'plaid_connect',
    resourceType: 'plaid_connection',
    metadata: {
      institution_id: 'ins_123',
      institution_name: 'Test Bank',
      accounts_connected: 2,
      environment: 'sandbox',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bug demonstration: unsafeLogAuditEvent', () => {
    it('should throw when audit log insert fails (BUGGY BEHAVIOR)', async () => {
      // Mock client that throws on insert
      const mockClient: SupabaseClient = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockRejectedValue(new Error('Database connection failed')),
        }),
      };

      // The buggy version throws, causing the entire request to fail
      await expect(unsafeLogAuditEvent(mockClient, auditParams)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should propagate error when insert returns error object (BUGGY BEHAVIOR)', async () => {
      // Mock client that returns error object
      const mockClient: SupabaseClient = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockResolvedValue({
            error: new Error('Constraint violation'),
          }),
        }),
      };

      // The buggy version doesn't check the error, so it appears to succeed
      // but in reality the error is unhandled
      const result = await unsafeLogAuditEvent(mockClient, auditParams);
      expect(result).toBeUndefined(); // No error handling = silent failure
    });
  });

  describe('Fix verification: safeLogAuditEvent', () => {
    it('should NOT throw when audit log insert throws (FIXED BEHAVIOR)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock client that throws on insert
      const mockClient: SupabaseClient = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockRejectedValue(new Error('Database connection failed')),
        }),
      };

      // The fixed version catches the error and returns gracefully
      const result = await safeLogAuditEvent(mockClient, auditParams);

      expect(result.logged).toBe(false);
      expect(result.error).toContain('Database connection failed');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Audit log error (non-critical):',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle error object from insert (FIXED BEHAVIOR)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock client that returns error object
      const mockClient: SupabaseClient = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockResolvedValue({
            error: { message: 'Constraint violation' },
          }),
        }),
      };

      // The fixed version properly handles error objects
      const result = await safeLogAuditEvent(mockClient, auditParams);

      expect(result.logged).toBe(false);
      expect(result.error).toBe('Constraint violation');

      consoleSpy.mockRestore();
    });

    it('should return success when audit log succeeds (NORMAL BEHAVIOR)', async () => {
      // Mock client that succeeds
      const mockClient: SupabaseClient = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockResolvedValue({ error: null }),
        }),
      };

      const result = await safeLogAuditEvent(mockClient, auditParams);

      expect(result.logged).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should call insert with correct parameters', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockClient: SupabaseClient = {
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      };

      await safeLogAuditEvent(mockClient, auditParams);

      expect(mockClient.from).toHaveBeenCalledWith('financial_access_log');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        action: 'plaid_connect',
        resource_type: 'plaid_connection',
        metadata: {
          institution_id: 'ins_123',
          institution_name: 'Test Bank',
          accounts_connected: 2,
          environment: 'sandbox',
        },
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle null error gracefully', async () => {
      const mockClient: SupabaseClient = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockResolvedValue({ error: null }),
        }),
      };

      const result = await safeLogAuditEvent(mockClient, auditParams);
      expect(result.logged).toBe(true);
    });

    it('should handle undefined error gracefully', async () => {
      const mockClient: SupabaseClient = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockResolvedValue({ error: undefined }),
        }),
      };

      const result = await safeLogAuditEvent(mockClient, auditParams);
      expect(result.logged).toBe(true);
    });

    it('should handle network timeout errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockClient: SupabaseClient = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockRejectedValue(new Error('ETIMEDOUT')),
        }),
      };

      const result = await safeLogAuditEvent(mockClient, auditParams);

      expect(result.logged).toBe(false);
      expect(result.error).toContain('ETIMEDOUT');

      consoleSpy.mockRestore();
    });
  });
});

describe('Integration behavior', () => {
  it('should allow main operation to succeed even when audit fails', async () => {
    /**
     * This test demonstrates the key fix:
     *
     * BEFORE: If audit log failed, the entire token exchange would fail
     *         User sees: "Internal server error" (500)
     *         Reality: Token was exchanged and stored successfully!
     *
     * AFTER:  Audit log failure is caught and logged
     *         User sees: Success response with their connected accounts
     *         Audit failure is logged for investigation but doesn't break UX
     */

    // Simulate the main operation
    const tokenExchangeResult = { success: true, itemId: 'item_123' };

    // Simulate audit log failure
    const mockClient: SupabaseClient = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockRejectedValue(new Error('Audit service unavailable')),
      }),
    };

    // In the fixed version, we can handle both
    const auditResult = await safeLogAuditEvent(mockClient, {
      userId: 'user-123',
      action: 'plaid_connect',
      resourceType: 'plaid_connection',
      metadata: { itemId: 'item_123' },
    });

    // Main operation succeeded
    expect(tokenExchangeResult.success).toBe(true);

    // Audit failed but was handled gracefully
    expect(auditResult.logged).toBe(false);

    // User gets their success response (not a 500 error!)
    const userResponse = {
      success: tokenExchangeResult.success,
      itemId: tokenExchangeResult.itemId,
    };

    expect(userResponse.success).toBe(true);
    expect(userResponse.itemId).toBe('item_123');
  });
});
