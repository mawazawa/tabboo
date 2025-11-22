/**
 * Plaid Transactions Sync Edge Function
 *
 * Syncs transactions using cursor-based pagination
 *
 * @see https://plaid.com/docs/api/products/transactions/#transactionssync
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requestSchema = z.object({
  institutionId: z.string().min(1),
  cursor: z.string().optional(),
});

const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox';
const PLAID_BASE_URL = PLAID_ENV === 'sandbox'
  ? 'https://sandbox.plaid.com'
  : PLAID_ENV === 'development'
    ? 'https://development.plaid.com'
    : 'https://production.plaid.com';

// Decrypt access token
async function decryptToken(encrypted: string): Promise<string> {
  const key = Deno.env.get('PLAID_TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production';
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  // Decode base64
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: parsed.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { institutionId, cursor } = parsed.data;

    // Get connection with encrypted token
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: connection, error: connError } = await adminClient
      .from('plaid_connections')
      .select('access_token_encrypted, sync_cursor')
      .eq('user_id', user.id)
      .eq('institution_id', institutionId)
      .eq('status', 'active')
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: 'Connection not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt access token
    const accessToken = await decryptToken(connection.access_token_encrypted);

    const clientId = Deno.env.get('PLAID_CLIENT_ID');
    const secret = Deno.env.get('PLAID_SECRET');

    // Sync transactions
    const syncResponse = await fetch(`${PLAID_BASE_URL}/transactions/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        access_token: accessToken,
        cursor: cursor || connection.sync_cursor || '',
        count: 500,
      }),
    });

    if (!syncResponse.ok) {
      const errorData = await syncResponse.json();
      console.error('Plaid sync error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to sync transactions', plaidError: errorData.error_code }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const syncData = await syncResponse.json();

    // Update cursor in database
    await adminClient
      .from('plaid_connections')
      .update({
        sync_cursor: syncData.next_cursor,
        last_synced_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('institution_id', institutionId);

    // Log access
    await adminClient.from('financial_access_log').insert({
      user_id: user.id,
      action: 'plaid_sync',
      resource_type: 'transactions',
      metadata: {
        institution_id: institutionId,
        added_count: syncData.added?.length || 0,
        modified_count: syncData.modified?.length || 0,
        removed_count: syncData.removed?.length || 0,
      },
    });

    return new Response(
      JSON.stringify({
        added: (syncData.added || []).map((t: any) => ({
          transactionId: t.transaction_id,
          accountId: t.account_id,
          amount: t.amount,
          date: t.date,
          name: t.name,
          merchantName: t.merchant_name,
          category: t.category,
          personalFinanceCategory: t.personal_finance_category,
          pending: t.pending,
        })),
        modified: (syncData.modified || []).map((t: any) => ({
          transactionId: t.transaction_id,
          accountId: t.account_id,
          amount: t.amount,
          date: t.date,
          name: t.name,
          merchantName: t.merchant_name,
          category: t.category,
          personalFinanceCategory: t.personal_finance_category,
          pending: t.pending,
        })),
        removed: (syncData.removed || []).map((r: any) => r.transaction_id),
        hasMore: syncData.has_more,
        nextCursor: syncData.next_cursor,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing transactions:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
