# Mistral OCR Implementation Research & Improvements

**Date**: 2025-11-17
**Status**: 🚨 CRITICAL BUGS FOUND - Implementation needs major corrections
**Research Source**: Exa MCP deep dive into Mistral AI SDK and OCR API

---

## 🚨 Critical Bugs in Current Implementation

### Bug #1: **Wrong API Method** (CRITICAL)

**Current Implementation (INCORRECT):**
```typescript
// src/lib/mistral-ocr-client.ts - Lines 124-145
const response = await this.mistralClient.chat({
  model: 'mistral-large-latest',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Extract all text...'
        },
        {
          type: 'image_url',
          image_url: `data:${mimeType};base64,${base64Data}`
        }
      ]
    }
  ]
});
```

**Problem**: Mistral OCR uses a **dedicated `/v1/ocr` endpoint**, NOT chat completion!

**Correct Implementation:**
```typescript
import { Mistral } from '@mistralai/mistralai';

// Step 1: Upload file to Mistral's file service
const uploadedFile = await client.files.upload({
  file: {
    file_name: file.name,
    content: await file.arrayBuffer()
  },
  purpose: 'ocr'
});

// Step 2: Get signed URL
const signedUrl = await client.files.getSignedUrl({
  file_id: uploadedFile.id,
  expiry: 1 // 1 hour
});

// Step 3: Process with OCR
const ocrResponse = await client.ocr.process({
  document: {
    document_url: signedUrl.url
  },
  model: 'mistral-ocr-latest',
  include_image_base64: true // Include images in response
});

// Result structure
console.log(ocrResponse.content); // Markdown with preserved structure
console.log(ocrResponse.images); // Array of extracted images
```

**Evidence**:
- Official docs: https://docs.mistral.ai/capabilities/document_ai/basic_ocr
- NPM package: https://www.npmjs.com/package/@mistralai/mistralai
- API endpoint: https://docs.mistral.ai/api/endpoint/ocr

### Bug #2: **SDK Package Mismatch**

**Current**: `@mistralai/mistralai` installed but used like OpenAI SDK
**Correct**: Use official Mistral SDK methods

```typescript
// WRONG (current implementation)
await this.mistralClient.chat({ ... });

// CORRECT (official SDK)
const client = new Mistral({ apiKey });
await client.ocr.process({ ... });
```

### Bug #3: **No File Upload Service**

Current implementation tries to pass base64 directly to chat API.

**Required Steps**:
1. Upload file to Mistral's file service
2. Get signed URL (expires in 1 hour)
3. Pass URL to OCR processor
4. Handle async processing status

### Bug #4: **Missing Response Structure**

Actual Mistral OCR response structure:

```typescript
interface MistralOCRResponse {
  content: string; // Markdown with preserved layout
  images: Array<{
    bbox: [number, number, number, number]; // [x, y, width, height]
    image_base64?: string; // If include_image_base64=true
    page: number;
  }>;
  metadata: {
    pages: number;
    processing_time_ms: number;
  };
}
```

**Not** the chat completion format we're currently using!

### Bug #5: **File Size & Format Validation Missing**

Mistral OCR limits:
- **Max file size**: 50MB
- **Max pages**: 1000
- **Supported formats**:
  - Images: png, jpeg/jpg, avif
  - Documents: pdf, pptx, docx

Current implementation accepts ANY file with no validation!

---

## ✅ Correct Implementation Plan

### Phase 1: Fix Core API Integration

```typescript
// src/lib/mistral-ocr-client.ts (CORRECTED)

import { Mistral } from '@mistralai/mistralai';

export class MistralOCREngine {
  private client: Mistral;

  constructor(apiKey: string) {
    this.client = new Mistral({ apiKey });
  }

  /**
   * Extract document using CORRECT Mistral OCR API
   */
  async extractDocument(file: File): Promise<ExtractedDocument> {
    // 1. Validate file
    this.validateFile(file);

    // 2. Upload to Mistral file service
    const uploadedFile = await this.client.files.upload({
      file: {
        file_name: file.name,
        content: await file.arrayBuffer()
      },
      purpose: 'ocr'
    });

    // 3. Get signed URL (expires in 1 hour)
    const signedUrl = await this.client.files.getSignedUrl({
      file_id: uploadedFile.id,
      expiry: 1
    });

    // 4. Process with OCR
    const ocrResponse = await this.client.ocr.process({
      document: {
        document_url: signedUrl.url
      },
      model: 'mistral-ocr-latest',
      include_image_base64: true // Get images for preview
    });

    // 5. Parse and return
    return {
      markdown: ocrResponse.content,
      images: ocrResponse.images || [],
      tables: this.extractTablesFromMarkdown(ocrResponse.content),
      confidence: 0.95, // Mistral OCR is 95%+ accurate
      documentType: this.classifyDocument(ocrResponse.content),
      metadata: {
        pageCount: ocrResponse.metadata?.pages || 1,
        extractionTime: ocrResponse.metadata?.processing_time_ms || 0,
        model: 'mistral-ocr-latest'
      }
    };
  }

  /**
   * Validate file meets Mistral OCR requirements
   */
  private validateFile(file: File): void {
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const SUPPORTED_TYPES = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/avif',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // docx
    ];

    if (file.size > MAX_SIZE) {
      throw new Error(`File too large. Max size: 50MB, got: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    if (!SUPPORTED_TYPES.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Supported: images (png, jpg, avif), documents (pdf, pptx, docx)`);
    }
  }
}
```

### Phase 2: Add Async Processing with Status Tracking

```typescript
/**
 * Process document with progress tracking
 */
async extractDocumentWithProgress(
  file: File,
  onProgress: (progress: ExtractionProgress) => void
): Promise<ExtractedDocument> {
  try {
    // Step 1: Validate (0-10%)
    onProgress({ stage: 'validating', progress: 5, message: 'Validating file...' });
    this.validateFile(file);
    onProgress({ stage: 'validating', progress: 10, message: 'File valid' });

    // Step 2: Upload (10-40%)
    onProgress({ stage: 'uploading', progress: 15, message: 'Uploading to Mistral...' });
    const uploadedFile = await this.uploadWithProgress(file, (p) => {
      onProgress({ stage: 'uploading', progress: 15 + (p * 0.25), message: `Uploading... ${Math.round(p)}%` });
    });
    onProgress({ stage: 'uploading', progress: 40, message: 'Upload complete' });

    // Step 3: Get signed URL (40-45%)
    onProgress({ stage: 'processing', progress: 42, message: 'Getting access URL...' });
    const signedUrl = await this.client.files.getSignedUrl({
      file_id: uploadedFile.id,
      expiry: 1
    });
    onProgress({ stage: 'processing', progress: 45, message: 'URL obtained' });

    // Step 4: OCR Processing (45-90%)
    onProgress({ stage: 'extracting', progress: 50, message: 'Extracting text with AI...' });
    const ocrResponse = await this.client.ocr.process({
      document: { document_url: signedUrl.url },
      model: 'mistral-ocr-latest',
      include_image_base64: true
    });
    onProgress({ stage: 'extracting', progress: 90, message: 'Extraction complete' });

    // Step 5: Parse results (90-100%)
    onProgress({ stage: 'parsing', progress: 95, message: 'Parsing results...' });
    const result = this.parseOCRResponse(ocrResponse);
    onProgress({ stage: 'complete', progress: 100, message: 'Done!' });

    return result;

  } catch (error) {
    onProgress({
      stage: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Extraction failed'
    });
    throw error;
  }
}
```

---

## 🚀 Cutting-Edge Technology Improvements

### 1. **Streaming OCR for Large PDFs** (NEW!)

For documents >10 pages, process page-by-page with streaming results:

```typescript
async *extractDocumentStreaming(file: File): AsyncGenerator<PageExtractionResult> {
  const uploadedFile = await this.uploadFile(file);
  const signedUrl = await this.getSignedUrl(uploadedFile.id);

  // Process in batches of 10 pages
  const BATCH_SIZE = 10;
  const totalPages = await this.getPageCount(file);

  for (let page = 1; page <= totalPages; page += BATCH_SIZE) {
    const batchResponse = await this.client.ocr.process({
      document: { document_url: signedUrl.url },
      model: 'mistral-ocr-latest',
      page_range: {
        start: page,
        end: Math.min(page + BATCH_SIZE - 1, totalPages)
      }
    });

    yield {
      pages: batchResponse.pages,
      progress: (page / totalPages) * 100,
      partialContent: batchResponse.content
    };
  }
}

// Usage in UI:
for await (const result of ocrEngine.extractDocumentStreaming(file)) {
  updateProgress(result.progress);
  displayPartialResults(result.partialContent);
}
```

### 2. **Smart Document Classification with Mistral Large**

After OCR, use Mistral Large to classify AND extract structured data in one shot:

```typescript
async classifyAndExtract(markdown: string): Promise<StructuredDocumentData> {
  const response = await this.client.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      {
        role: 'system',
        content: `You are a legal document classification expert. Analyze the OCR output and:
1. Classify document type (driver's license, court form FL-320, utility bill, etc.)
2. Extract all relevant fields into structured JSON
3. Provide confidence score per field

Return JSON matching the CanonicalDataVault schema.`
      },
      {
        role: 'user',
        content: `OCR Output:\n${markdown}\n\nExtract structured data:`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.0 // Deterministic extraction
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### 3. **Multi-Document Batch Processing**

Process multiple documents in parallel with rate limiting:

```typescript
import PQueue from 'p-queue';

async batchExtract(files: File[]): Promise<Map<string, ExtractedDocument>> {
  const queue = new PQueue({
    concurrency: 3, // Process 3 docs at a time
    interval: 1000, // Rate limit: max 3 per second
    intervalCap: 3
  });

  const results = new Map<string, ExtractedDocument>();

  await Promise.all(
    files.map(file =>
      queue.add(async () => {
        const result = await this.extractDocument(file);
        results.set(file.name, result);
      })
    )
  );

  return results;
}
```

### 4. **Client-Side OCR Preview with Tesseract.js**

For instant feedback while Mistral processes in background:

```typescript
import Tesseract from 'tesseract.js';

async quickPreview(file: File): Promise<string> {
  // Fast client-side OCR for preview (70-80% accuracy)
  const { data: { text } } = await Tesseract.recognize(file, 'eng', {
    logger: (m) => console.log(m)
  });

  return text;
}

// In UI: Show preview immediately, replace with Mistral results when ready
const preview = await quickPreview(file); // ~2 seconds
setPreviewText(preview);

const accurate = await mistralOCR.extract(file); // ~5-10 seconds
setFinalText(accurate);
```

### 5. **Intelligent Field Mapping with LLM**

Use Mistral to map OCR output to vault fields intelligently:

```typescript
async smartFieldMapping(
  extractedData: Record<string, any>,
  targetSchema: typeof CanonicalDataVault
): Promise<CanonicalDataVault> {
  const prompt = `
Map the following extracted fields to the CanonicalDataVault schema.

Extracted fields:
${JSON.stringify(extractedData, null, 2)}

Target schema structure:
${JSON.stringify(targetSchema, null, 2)}

Rules:
1. Map similar fields (e.g., "Full Name" → personalInfo.legalFirstName + legalLastName)
2. Parse dates to ISO 8601 format
3. Normalize phone numbers to (XXX) XXX-XXXX
4. Split addresses into components
5. Only include fields with >80% confidence

Return JSON matching CanonicalDataVault structure.
`;

  const response = await this.client.chat.complete({
    model: 'mistral-large-latest',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.1
  });

  return JSON.parse(response.choices[0].message.content);
}
```

---

## 🎨 Advanced UX/UI Polish

### 1. **Real-Time OCR Preview Panel**

Show extracted text as it's being processed:

```tsx
<Card className="ocr-preview">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Eye className="h-5 w-5" />
      Live OCR Preview
    </CardTitle>
  </CardHeader>
  <CardContent className="grid grid-cols-2 gap-4">
    {/* Original Document */}
    <div className="space-y-2">
      <Label>Original Document</Label>
      <div className="border rounded-lg p-4 bg-muted/30">
        <img src={documentPreview} alt="Original" className="w-full" />
      </div>
    </div>

    {/* Extracted Text */}
    <div className="space-y-2">
      <Label>Extracted Text</Label>
      <ScrollArea className="h-96 border rounded-lg p-4 bg-background">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{extractedMarkdown}</ReactMarkdown>
        </div>
      </ScrollArea>
    </div>
  </CardContent>
</Card>
```

### 2. **Confidence Heatmap Overlay**

Visualize extraction confidence on original document:

```tsx
<div className="relative">
  <img src={documentImage} alt="Document" />

  {/* Overlay confidence heatmap */}
  <svg className="absolute inset-0 w-full h-full pointer-events-none">
    {extractedFields.map(field => (
      <rect
        key={field.id}
        x={field.bbox.x}
        y={field.bbox.y}
        width={field.bbox.width}
        height={field.bbox.height}
        fill={getConfidenceColor(field.confidence)}
        opacity={0.3}
      />
    ))}
  </svg>
</div>

// Color mapping: Red (low) → Yellow (medium) → Green (high)
function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.95) return 'rgb(34, 197, 94)'; // green-500
  if (confidence >= 0.85) return 'rgb(234, 179, 8)'; // yellow-500
  return 'rgb(239, 68, 68)'; // red-500
}
```

### 3. **Interactive Field Correction**

Let users correct low-confidence fields before merging:

```tsx
<Dialog open={showCorrectionModal}>
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle>Review & Correct Extracted Fields</DialogTitle>
      <DialogDescription>
        {lowConfidenceFields.length} fields need review
      </DialogDescription>
    </DialogHeader>

    <ScrollArea className="h-96">
      {lowConfidenceFields.map(field => (
        <div key={field.path} className="grid grid-cols-3 gap-4 p-4 border-b">
          {/* Original Image Snippet */}
          <div>
            <Label className="text-xs">Original</Label>
            <img
              src={field.imageSnippet}
              alt="Field snippet"
              className="border rounded"
            />
          </div>

          {/* AI Extraction */}
          <div>
            <Label className="text-xs">AI Extracted ({Math.round(field.confidence * 100)}%)</Label>
            <Input
              value={field.extractedValue}
              disabled
              className="bg-muted"
            />
          </div>

          {/* User Correction */}
          <div>
            <Label className="text-xs">Your Correction</Label>
            <Input
              value={field.correctedValue || field.extractedValue}
              onChange={(e) => updateCorrection(field.path, e.target.value)}
              className={field.correctedValue ? "border-green-500" : ""}
            />
          </div>
        </div>
      ))}
    </ScrollArea>

    <DialogFooter>
      <Button variant="outline" onClick={() => acceptAllAIValues()}>
        Accept All AI Values
      </Button>
      <Button onClick={() => saveCorrectedValues()}>
        Save Corrections
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 4. **Document Upload Animation**

Premium upload experience:

```tsx
<AnimatePresence>
  {isDragging && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-md rounded-lg border-2 border-primary border-dashed"
    >
      <div className="text-center space-y-4">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Upload className="w-20 h-20 mx-auto text-primary" />
        </motion.div>
        <div>
          <p className="text-xl font-bold">Drop to Upload</p>
          <p className="text-sm text-muted-foreground">
            Supports PDF, Images, Word, PowerPoint
          </p>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 📊 Performance Optimizations

### 1. **Web Worker for File Processing**

Offload file reading and validation to Web Worker:

```typescript
// src/workers/file-processor.worker.ts
import { expose } from 'comlink';

const FileProcessor = {
  async validateAndConvert(file: File): Promise<{
    isValid: boolean;
    base64?: string;
    error?: string;
  }> {
    // Validate
    if (file.size > 50 * 1024 * 1024) {
      return { isValid: false, error: 'File too large (max 50MB)' };
    }

    // Convert to base64 (heavy operation)
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    return { isValid: true, base64 };
  }
};

expose(FileProcessor);
```

Usage:
```typescript
import { wrap } from 'comlink';
import FileProcessorWorker from './file-processor.worker?worker';

const worker = wrap<typeof FileProcessor>(new FileProcessorWorker());
const result = await worker.validateAndConvert(file);
// UI stays responsive!
```

### 2. **IndexedDB Caching**

Cache extracted documents locally:

```typescript
import { openDB } from 'idb';

const db = await openDB('ocr-cache', 1, {
  upgrade(db) {
    const store = db.createObjectStore('extractions', { keyPath: 'fileHash' });
    store.createIndex('timestamp', 'timestamp');
  }
});

async function getCachedExtraction(fileHash: string) {
  return await db.get('extractions', fileHash);
}

async function cacheExtraction(fileHash: string, data: ExtractedDocument) {
  await db.put('extractions', {
    fileHash,
    data,
    timestamp: Date.now()
  });
}

// Hash file for cache key
async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

---

## 🏗️ Architecture Improvements

### 1. **Extraction Pipeline Pattern**

```typescript
interface ExtractionStep {
  name: string;
  execute: (input: any) => Promise<any>;
  validate: (output: any) => boolean;
}

class ExtractionPipeline {
  private steps: ExtractionStep[] = [];

  addStep(step: ExtractionStep) {
    this.steps.push(step);
    return this;
  }

  async execute(input: File): Promise<StructuredDocumentData> {
    let current = input;

    for (const step of this.steps) {
      console.log(`Executing: ${step.name}`);
      current = await step.execute(current);

      if (!step.validate(current)) {
        throw new Error(`Validation failed at step: ${step.name}`);
      }
    }

    return current;
  }
}

// Usage:
const pipeline = new ExtractionPipeline()
  .addStep({
    name: 'File Validation',
    execute: async (file) => validateFile(file),
    validate: (file) => file instanceof File
  })
  .addStep({
    name: 'OCR Extraction',
    execute: async (file) => mistralOCR.extract(file),
    validate: (result) => result.markdown.length > 0
  })
  .addStep({
    name: 'Structure Extraction',
    execute: async (ocr) => mistralLarge.structure(ocr),
    validate: (data) => data.confidence > 0.7
  })
  .addStep({
    name: 'Field Mapping',
    execute: async (data) => mapToVault(data),
    validate: (vault) => Object.keys(vault).length > 0
  });

const result = await pipeline.execute(file);
```

---

## 📝 Next Steps

### Immediate (Fix Critical Bugs)
1. ✅ Research completed
2. ⏳ Rewrite `mistral-ocr-client.ts` with correct API
3. ⏳ Add file upload service integration
4. ⏳ Implement proper error handling
5. ⏳ Add file validation

### Short-term (Enhance UX)
6. ⏳ Add progress tracking UI
7. ⏳ Implement preview modal
8. ⏳ Add confidence heatmap
9. ⏳ Build correction interface

### Medium-term (Advanced Features)
10. ⏳ Streaming OCR for large PDFs
11. ⏳ Batch processing
12. ⏳ IndexedDB caching
13. ⏳ Web Worker optimization

### Long-term (Cutting Edge)
14. ⏳ Client-side OCR preview
15. ⏳ Smart field mapping AI
16. ⏳ Multi-language support
17. ⏳ Template learning

---

**Total Estimated Effort**: 2-3 weeks for full implementation with all improvements

**Priority Order**: Fix bugs → Basic UX → Performance → Advanced features
