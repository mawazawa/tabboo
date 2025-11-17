/**
 * Process Extraction Edge Function (Background Worker)
 *
 * Purpose: Processes pending document extraction jobs using Mistral OCR
 *
 * Flow:
 * 1. Poll extraction_queue for next pending job (priority queue)
 * 2. Download file from Supabase Storage
 * 3. Upload to Mistral Files API
 * 4. Process with Mistral OCR (mistral-ocr-latest)
 * 5. Structure data with Mistral Large (mistral-large-latest)
 * 6. Store results in vault_document_extractions
 * 7. Update job status to completed
 * 8. Trigger vault merge
 *
 * Execution:
 * - Triggered by cron job every 30 seconds
 * - Or manually via POST request for immediate processing
 * - Uses service_role key for bypass RLS
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Mistral client (using fetch API, no SDK needed)
const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY') ?? '';
const MISTRAL_BASE_URL = 'https://api.mistral.ai/v1';

// ============================================================================
// Mistral OCR Client
// ============================================================================

/**
 * Upload file to Mistral Files API
 */
async function uploadFileToMistral(fileBytes: Uint8Array, fileName: string): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([fileBytes]);
  formData.append('file', blob, fileName);
  formData.append('purpose', 'ocr');

  const response = await fetch(`${MISTRAL_BASE_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral file upload failed: ${error}`);
  }

  const data = await response.json();
  return data.id; // file_id
}

/**
 * Get signed URL for uploaded file
 */
async function getSignedUrl(fileId: string): Promise<string> {
  const response = await fetch(`${MISTRAL_BASE_URL}/files/${fileId}/url`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral signed URL failed: ${error}`);
  }

  const data = await response.json();
  return data.url;
}

/**
 * Process OCR with Mistral OCR Latest
 */
async function processOCR(signedUrl: string): Promise<any> {
  const response = await fetch(`${MISTRAL_BASE_URL}/ocr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      document: { document_url: signedUrl },
      model: 'mistral-ocr-latest',
      include_image_base64: false, // Don't include images (saves bandwidth)
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral OCR failed: ${error}`);
  }

  return await response.json();
}

/**
 * Structure OCR output with Mistral Large
 */
async function structureData(ocrMarkdown: string): Promise<any> {
  const systemPrompt = `You are an expert data extractor for legal documents. Extract structured data from the OCR text below and return ONLY valid JSON matching this schema:

{
  "documentType": "drivers_license" | "passport" | "court_form" | "legal_document" | "utility_bill" | "pay_stub" | "tax_return" | "opposing_counsel_filing" | "unknown",
  "personalInfo": {
    "legalFirstName": string,
    "legalLastName": string,
    "middleName": string,
    "dateOfBirth": "YYYY-MM-DD",
    "sex": "M" | "F" | "X",
    "height": string,
    "weight": string,
    "eyeColor": string,
    "hairColor": string
  },
  "contactInfo": {
    "currentAddress": {
      "street1": string,
      "street2": string,
      "city": string,
      "state": string,
      "zipCode": string
    },
    "phone": string,
    "email": string
  },
  "identificationDocuments": {
    "driversLicense": {
      "number": string,
      "state": string,
      "expirationDate": "YYYY-MM-DD",
      "class": string
    },
    "passport": {
      "number": string,
      "country": string,
      "expirationDate": "YYYY-MM-DD"
    }
  },
  "legalCase": {
    "caseNumber": string,
    "court": string,
    "county": string,
    "petitioner": string,
    "respondent": string,
    "filingDate": "YYYY-MM-DD"
  },
  "confidence": 0.0-1.0,
  "extractionSource": "mistral_ocr",
  "extractedAt": "ISO8601 timestamp"
}

IMPORTANT:
- Only include fields that are present in the OCR text
- Set confidence based on OCR quality (0.0 = poor, 1.0 = perfect)
- For dates, use ISO 8601 format (YYYY-MM-DD)
- Return ONLY the JSON object, no explanations or markdown`;

  const response = await fetch(`${MISTRAL_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: ocrMarkdown },
      ],
      temperature: 0.0, // Deterministic output
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral structuring failed: ${error}`);
  }

  const data = await response.json();
  const structuredData = JSON.parse(data.choices[0]?.message?.content || '{}');

  // Add metadata
  structuredData.extractionSource = 'mistral_ocr';
  structuredData.extractedAt = new Date().toISOString();

  return structuredData;
}

// ============================================================================
// Main Processing Logic
// ============================================================================

async function processNextJob() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // ========================================================================
  // 1. Get next pending job (priority queue)
  // ========================================================================

  const { data: job, error: jobError } = await supabase
    .from('extraction_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (jobError) {
    console.error('Job query error:', jobError);
    return { success: false, error: jobError.message };
  }

  if (!job) {
    return { success: true, message: 'No pending jobs' };
  }

  console.log(`Processing job ${job.id} for user ${job.user_id}`);

  // ========================================================================
  // 2. Mark job as processing
  // ========================================================================

  const startTime = Date.now();

  await supabase
    .from('extraction_queue')
    .update({
      status: 'processing',
      started_at: new Date().toISOString(),
    })
    .eq('id', job.id);

  try {
    // ======================================================================
    // 3. Download file from storage
    // ======================================================================

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('personal-documents')
      .download(job.storage_path);

    if (downloadError) {
      throw new Error(`File download failed: ${downloadError.message}`);
    }

    const fileBytes = new Uint8Array(await fileData.arrayBuffer());

    // ======================================================================
    // 4. Upload to Mistral Files API
    // ======================================================================

    const mistralFileId = await uploadFileToMistral(fileBytes, job.file_name);
    console.log(`Uploaded to Mistral: ${mistralFileId}`);

    // ======================================================================
    // 5. Get signed URL
    // ======================================================================

    const signedUrl = await getSignedUrl(mistralFileId);
    console.log(`Got signed URL`);

    // ======================================================================
    // 6. Process OCR
    // ======================================================================

    const ocrResult = await processOCR(signedUrl);
    const ocrMarkdown = ocrResult.content || ocrResult.text || '';
    console.log(`OCR complete: ${ocrMarkdown.length} characters`);

    // ======================================================================
    // 7. Structure data with Mistral Large
    // ======================================================================

    const structuredData = await structureData(ocrMarkdown);
    console.log(`Structured data: ${JSON.stringify(structuredData).substring(0, 200)}...`);

    const processingTime = Date.now() - startTime;

    // ======================================================================
    // 8. Store in vault_document_extractions
    // ======================================================================

    const { data: extraction, error: extractionError } = await supabase
      .from('vault_document_extractions')
      .insert({
        user_id: job.user_id,
        document_type: structuredData.documentType || 'unknown',
        file_name: job.file_name,
        file_size_bytes: job.file_size_bytes,
        mime_type: job.mime_type,
        storage_path: job.storage_path,
        extracted_markdown: ocrMarkdown,
        structured_data: structuredData,
        confidence_score: structuredData.confidence || 0.9,
        extraction_source: 'mistral_ocr',
        extraction_model: 'mistral-ocr-latest + mistral-large-latest',
        extraction_time_ms: processingTime,
        status: 'completed',
        fields_extracted: Object.keys(structuredData).filter(
          (k) => !['confidence', 'extractionSource', 'extractedAt', 'documentType'].includes(k)
        ),
        fields_count: Object.keys(structuredData).filter(
          (k) => !['confidence', 'extractionSource', 'extractedAt', 'documentType'].includes(k)
        ).length,
      })
      .select()
      .single();

    if (extractionError) {
      throw new Error(`Extraction storage failed: ${extractionError.message}`);
    }

    // ======================================================================
    // 9. Update job status to completed
    // ======================================================================

    await supabase
      .from('extraction_queue')
      .update({
        status: 'completed',
        extracted_data: structuredData,
        confidence_score: structuredData.confidence || 0.9,
        completed_at: new Date().toISOString(),
        processing_time_ms: processingTime,
      })
      .eq('id', job.id);

    // ======================================================================
    // 10. Merge to vault (automatic)
    // ======================================================================

    const { error: mergeError } = await supabase.rpc('merge_extraction_to_vault', {
      p_extraction_id: extraction.id,
      p_user_id: job.user_id,
    });

    if (mergeError) {
      console.error('Vault merge error (non-fatal):', mergeError);
    }

    // ======================================================================
    // 11. Log audit event
    // ======================================================================

    await supabase.rpc('log_audit_event', {
      p_user_id: job.user_id,
      p_event_type: 'extraction_complete',
      p_event_action: 'CREATE',
      p_resource_type: 'vault_document_extractions',
      p_resource_id: extraction.id,
      p_ip_address: null,
      p_user_agent: 'background_worker',
      p_old_value: null,
      p_new_value: { processingTimeMs: processingTime, fieldsExtracted: extraction.fields_count },
    });

    console.log(`Job ${job.id} completed successfully`);

    return {
      success: true,
      jobId: job.id,
      extractionId: extraction.id,
      processingTimeMs: processingTime,
      fieldsExtracted: extraction.fields_count,
    };
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);

    // ======================================================================
    // Handle failure with retry logic
    // ======================================================================

    const retryCount = (job.retry_count || 0) + 1;
    const newStatus = retryCount >= job.max_retries ? 'failed' : 'pending';

    await supabase
      .from('extraction_queue')
      .update({
        status: newStatus,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        retry_count: retryCount,
      })
      .eq('id', job.id);

    // Log audit event
    await supabase.rpc('log_audit_event', {
      p_user_id: job.user_id,
      p_event_type: 'extraction_failed',
      p_event_action: 'UPDATE',
      p_resource_type: 'extraction_queue',
      p_resource_id: job.id,
      p_ip_address: null,
      p_user_agent: 'background_worker',
      p_old_value: null,
      p_new_value: { error: error instanceof Error ? error.message : 'Unknown error', retryCount },
    });

    return {
      success: false,
      jobId: job.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      retryCount,
      willRetry: newStatus === 'pending',
    };
  }
}

// ============================================================================
// HTTP Handler
// ============================================================================

serve(async (req) => {
  // Allow GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const result = await processNextJob();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
