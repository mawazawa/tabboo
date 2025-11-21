/**
 * Plaid Link Token Edge Function
 *
 * Creates a Plaid Link token for initializing Plaid Link
 *
 * Sandbox Configuration:
 * - PLAID_ENV=sandbox
 * - PLAID_CLIENT_ID (from Plaid Dashboard)
 * - PLAID_SECRET (sandbox secret from Plaid Dashboard)
 *
 * @see https://plaid.com/docs/api/link/#linktokencreate
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
  userId: z.string().uuid(),
  products: z.array(z.string()).min(1).max(10).default(['transactions']),
});

// Plaid API configuration
const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox';
const PLAID_BASE_URL = PLAID_ENV === 'sandbox'
  ? 'https://sandbox.plaid.com'
  : PLAID_ENV === 'development'
    ? 'https://development.plaid.com'
    : 'https://production.plaid.com';

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

    const { userId, products } = parsed.data;

    // Verify userId matches authenticated user
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Create Link token
    const linkTokenResponse = await fetch(`${PLAID_BASE_URL}/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        user: {
          client_user_id: userId,
        },
        client_name: 'SwiftFill',
        products: products,
        country_codes: ['US'],
        language: 'en',
        // Webhook for real-time updates (optional for sandbox)
        // webhook: 'https://your-domain.com/api/plaid-webhook',
      }),
    });

    if (!linkTokenResponse.ok) {
      const errorData = await linkTokenResponse.json();
      console.error('Plaid API error:', errorData);
      return new Response(
        JSON.stringify({
          error: 'Failed to create link token',
          plaidError: errorData.error_message || errorData.error_code,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const linkTokenData = await linkTokenResponse.json();

    // Log for audit
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await adminClient.from('financial_access_log').insert({
      user_id: userId,
      action: 'plaid_connect',
      resource_type: 'plaid_connection',
      metadata: {
        products,
        environment: PLAID_ENV,
      },
    });

    return new Response(
      JSON.stringify({
        linkToken: linkTokenData.link_token,
        expiration: linkTokenData.expiration,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating link token:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
