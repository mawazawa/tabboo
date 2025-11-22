/**
 * Plaid Balances Edge Function
 *
 * Gets current account balances
 *
 * @see https://plaid.com/docs/api/products/balance/
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
});

const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox';
const PLAID_BASE_URL = PLAID_ENV === 'sandbox'
  ? 'https://sandbox.plaid.com'
  : PLAID_ENV === 'development'
    ? 'https://development.plaid.com'
    : 'https://production.plaid.com';

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
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { institutionId } = parsed.data;

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: connection, error: connError } = await adminClient
      .from('plaid_connections')
      .select('access_token_encrypted')
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

    const accessToken = await decryptToken(connection.access_token_encrypted);
    const clientId = Deno.env.get('PLAID_CLIENT_ID');
    const secret = Deno.env.get('PLAID_SECRET');

    const balanceResponse = await fetch(`${PLAID_BASE_URL}/accounts/balance/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        access_token: accessToken,
      }),
    });

    if (!balanceResponse.ok) {
      const errorData = await balanceResponse.json();
      return new Response(
        JSON.stringify({ error: 'Failed to get balances', plaidError: errorData.error_code }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const balanceData = await balanceResponse.json();

    // Log access
    await adminClient.from('financial_access_log').insert({
      user_id: user.id,
      action: 'plaid_view',
      resource_type: 'assets',
      metadata: { institution_id: institutionId },
    });

    return new Response(
      JSON.stringify({
        accounts: (balanceData.accounts || []).map((acc: any) => ({
          accountId: acc.account_id,
          name: acc.name,
          officialName: acc.official_name,
          type: acc.type,
          subtype: acc.subtype,
          mask: acc.mask,
          balances: {
            available: acc.balances.available,
            current: acc.balances.current,
            limit: acc.balances.limit,
            isoCurrencyCode: acc.balances.iso_currency_code,
          },
        })),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error getting balances:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
