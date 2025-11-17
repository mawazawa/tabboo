/**
 * Secure Document Upload Edge Function
 *
 * Purpose: Validates, hashes, and securely uploads user documents to Supabase Storage
 *
 * Security Features:
 * - File validation (MIME type + magic bytes)
 * - SHA-256 hash for deduplication
 * - User-isolated storage paths ({user_id}/documents/{timestamp}-{filename})
 * - Rate limiting (10 uploads per hour per user)
 * - File size limits (10 MB max)
 * - Audit logging
 *
 * Flow:
 * 1. Authenticate user via JWT
 * 2. Validate file (type, size, signature)
 * 3. Calculate SHA-256 hash (deduplication)
 * 4. Check for existing extraction (cache hit)
 * 5. Upload to Supabase Storage with RLS path
 * 6. Create extraction job in queue
 * 7. Return job ID for client polling
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================================================
// Configuration
// ============================================================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

// File signature validation (magic bytes)
const FILE_SIGNATURES = {
  'image/jpeg': ['FFD8FF'],
  'image/jpg': ['FFD8FF'],
  'image/png': ['89504E47'],
  'application/pdf': ['25504446'],
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_UPLOADS = 10;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate file signature (magic bytes) to prevent file spoofing
 */
function validateFileSignature(fileBytes: Uint8Array, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];
  if (!signatures) return false;

  // Convert first 4 bytes to hex string
  const header = Array.from(fileBytes.slice(0, 4))
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');

  // Check if header starts with any of the valid signatures
  return signatures.some((sig) => header.startsWith(sig));
}

/**
 * Calculate SHA-256 hash of file for deduplication
 */
async function calculateFileHash(fileBytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check rate limit for user
 */
async function checkRateLimit(
  supabase: any,
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  const { data, error } = await supabase
    .from('extraction_queue')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', windowStart.toISOString());

  if (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: RATE_LIMIT_MAX_UPLOADS }; // Fail open
  }

  const uploadCount = data?.length || 0;
  const remaining = Math.max(0, RATE_LIMIT_MAX_UPLOADS - uploadCount);

  return {
    allowed: uploadCount < RATE_LIMIT_MAX_UPLOADS,
    remaining,
  };
}

/**
 * Check for existing extraction with same hash (deduplication)
 */
async function findExistingExtraction(
  supabase: any,
  userId: string,
  fileHash: string
): Promise<any | null> {
  const { data, error } = await supabase
    .from('extraction_queue')
    .select('*')
    .eq('user_id', userId)
    .eq('file_hash', fileHash)
    .eq('status', 'completed')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24h
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Existing extraction check error:', error);
    return null;
  }

  return data;
}

/**
 * Log audit event
 */
async function logAuditEvent(
  supabase: any,
  userId: string,
  eventType: string,
  eventAction: string,
  resourceType: string,
  resourceId: string | null,
  metadata: any = null
) {
  await supabase.rpc('log_audit_event', {
    p_user_id: userId,
    p_event_type: eventType,
    p_event_action: eventAction,
    p_resource_type: resourceType,
    p_resource_id: resourceId,
    p_ip_address: null,
    p_user_agent: null,
    p_old_value: null,
    p_new_value: metadata,
  });
}

// ============================================================================
// Main Handler
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // ========================================================================
    // 1. Authenticate User
    // ========================================================================

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Please sign in.' }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // Use service role for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ========================================================================
    // 2. Rate Limiting
    // ========================================================================

    const rateLimit = await checkRateLimit(supabaseAdmin, userId);

    if (!rateLimit.allowed) {
      await logAuditEvent(
        supabaseAdmin,
        userId,
        'document_upload',
        'CREATE',
        'rate_limit_exceeded',
        null,
        { remaining: rateLimit.remaining }
      );

      return new Response(
        JSON.stringify({
          error: `Rate limit exceeded. You can upload ${RATE_LIMIT_MAX_UPLOADS} documents per hour. Try again later.`,
          remaining: rateLimit.remaining,
          resetIn: RATE_LIMIT_WINDOW_MS / 1000, // seconds
        }),
        { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 3. Parse Multipart Form Data
    // ========================================================================

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided. Include file in multipart form data.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 4. Validate File
    // ========================================================================

    // 4a. Check file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: `File size ${(file.size / 1024 / 1024).toFixed(2)} MB exceeds maximum ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
        }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // 4b. Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: `File type ${file.type} not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // 4c. Read file bytes
    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    // 4d. Validate file signature (magic bytes)
    if (!validateFileSignature(fileBytes, file.type)) {
      return new Response(
        JSON.stringify({
          error: 'File signature mismatch. File may be corrupted or spoofed.',
        }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 5. Calculate File Hash (Deduplication)
    // ========================================================================

    const fileHash = await calculateFileHash(fileBytes);

    // Check for existing extraction with same hash
    const existingExtraction = await findExistingExtraction(supabaseAdmin, userId, fileHash);

    if (existingExtraction) {
      // Return cached result
      await logAuditEvent(
        supabaseAdmin,
        userId,
        'document_upload',
        'READ',
        'cache_hit',
        existingExtraction.id,
        { fileHash, fileName: file.name }
      );

      return new Response(
        JSON.stringify({
          jobId: existingExtraction.id,
          status: 'completed',
          extractedData: existingExtraction.extracted_data,
          fromCache: true,
          message: 'Duplicate document found. Returning cached extraction.',
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 6. Upload to Supabase Storage (User-Isolated Path)
    // ========================================================================

    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitize filename
    const storagePath = `${userId}/documents/${timestamp}-${sanitizedFilename}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('personal-documents')
      .upload(storagePath, fileBytes, {
        contentType: file.type,
        cacheControl: '3600', // 1 hour cache
        upsert: false, // Prevent overwriting
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);

      await logAuditEvent(
        supabaseAdmin,
        userId,
        'document_upload',
        'CREATE',
        'upload_failed',
        null,
        { error: uploadError.message, fileName: file.name }
      );

      return new Response(
        JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 7. Create Extraction Job in Queue
    // ========================================================================

    const { data: job, error: jobError } = await supabaseAdmin
      .from('extraction_queue')
      .insert({
        user_id: userId,
        storage_path: storagePath,
        file_name: file.name,
        file_size_bytes: file.size,
        file_hash: fileHash,
        mime_type: file.type,
        status: 'pending',
        priority: 5, // Default priority
      })
      .select()
      .single();

    if (jobError) {
      console.error('Job creation error:', jobError);

      // Clean up uploaded file
      await supabaseAdmin.storage.from('personal-documents').remove([storagePath]);

      return new Response(
        JSON.stringify({ error: `Job creation failed: ${jobError.message}` }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // 8. Log Audit Event
    // ========================================================================

    await logAuditEvent(
      supabaseAdmin,
      userId,
      'document_upload',
      'CREATE',
      'extraction_queue',
      job.id,
      {
        fileName: file.name,
        fileSize: file.size,
        fileHash,
        storagePath,
      }
    );

    // ========================================================================
    // 9. Return Success Response
    // ========================================================================

    const estimatedTimeSeconds = Math.ceil(file.size / (1024 * 1024)) * 2; // 2 seconds per MB

    return new Response(
      JSON.stringify({
        jobId: job.id,
        status: 'pending',
        message: 'Document uploaded successfully. Extraction in progress.',
        estimatedTimeSeconds,
        remaining: rateLimit.remaining - 1,
      }),
      {
        status: 202, // Accepted (async processing)
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown server error',
      }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
