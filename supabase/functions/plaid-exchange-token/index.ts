/**
 * Plaid Exchange Token Edge Function
 *
 * Exchanges a public token from Plaid Link for an access token
 * Stores encrypted access token in database
 *
 * @see https://plaid.com/docs/api/items/#itempublic_tokenexchange
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Request validation
const requestSchema = z.object({
  publicToken: z.string().min(1),
  institutionId: z.string().min(1),
  institutionName: z.string().min(1),
  accounts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    subtype: z.string(),
    mask: z.string(),
  })),
  // Products enabled for this connection (from Plaid Link initialization)
  products: z.array(z.string()).optional().default(['transactions', 'assets', 'liabilities']),
});

// Plaid API configuration
const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox';
const PLAID_BASE_URL = PLAID_ENV === 'sandbox'
  ? 'https://sandbox.plaid.com'
  : PLAID_ENV === 'development'
    ? 'https://development.plaid.com'
    : 'https://production.plaid.com';

// Simple encryption for access token storage
// In production, use Supabase Vault or KMS
async function encryptToken(token: string): Promise<string> {
  const key = Deno.env.get('PLAID_TOKEN_ENCRYPTION_KEY') || 'default-key-change-in-production';
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user
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

    // Parse and validate request
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: parsed.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { publicToken, institutionId, institutionName, accounts, products } = parsed.data;

    // Get Plaid credentials
    const clientId = Deno.env.get('PLAID_CLIENT_ID');
    const secret = Deno.env.get('PLAID_SECRET');

    if (!clientId || !secret) {
      console.error('Missing Plaid credentials');
      return new Response(
        JSON.stringify({ error: 'Plaid not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await fetch(`${PLAID_BASE_URL}/item/public_token/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        public_token: publicToken,
      }),
    });

    if (!exchangeResponse.ok) {
      const errorData = await exchangeResponse.json();
      console.error('Plaid exchange error:', errorData);
      return new Response(
        JSON.stringify({
          error: 'Failed to exchange token',
          plaidError: errorData.error_message || errorData.error_code,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const exchangeData = await exchangeResponse.json();
    const accessToken = exchangeData.access_token;
    const itemId = exchangeData.item_id;

    // Encrypt access token for storage
    const encryptedToken = await encryptToken(accessToken);

    // Store in database using service role
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Upsert connection (update if same institution already connected)
    const { error: insertError } = await adminClient
      .from('plaid_connections')
      .upsert({
        user_id: user.id,
        institution_id: institutionId,
        institution_name: institutionName,
        access_token_encrypted: encryptedToken,
        item_id: itemId,
        products: products,
        status: 'active',
        last_synced_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,institution_id',
      });

    if (insertError) {
      console.error('Database error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store connection' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log for audit (non-critical - don't fail on audit log errors)
    try {
      await adminClient.from('financial_access_log').insert({
        user_id: user.id,
        action: 'plaid_connect',
        resource_type: 'plaid_connection',
        metadata: {
          institution_id: institutionId,
          institution_name: institutionName,
          accounts_connected: accounts.length,
          environment: PLAID_ENV,
        },
      });
    } catch (auditError) {
      // Log error but don't fail the request - audit is non-critical
      console.error('Audit log error (non-critical):', auditError);
    }

    // Get account balances
    const balancesResponse = await fetch(`${PLAID_BASE_URL}/accounts/balance/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        access_token: accessToken,
      }),
    });

    let accountsWithBalances = accounts;
    if (balancesResponse.ok) {
      const balancesData = await balancesResponse.json();
      accountsWithBalances = balancesData.accounts.map((acc: any) => ({
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
      }));
    }

    return new Response(
      JSON.stringify({
        success: true,
        itemId,
        accounts: accountsWithBalances,
        institution: {
          institutionId,
          name: institutionName,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error exchanging token:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
