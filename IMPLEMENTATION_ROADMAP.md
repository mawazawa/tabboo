# Mistral OCR Implementation Roadmap

**Status**: Research Complete - Ready for Execution
**Last Updated**: 2025-11-17
**Priority**: P0 - Critical Path for JUSTICE-262

## Executive Summary

This roadmap provides a step-by-step execution plan to fix the 5 critical bugs in the Mistral OCR implementation and deliver the cutting-edge improvements researched in `MISTRAL_OCR_RESEARCH.md`.

**Current State**: Prototype implementation with documented bugs
**Target State**: Production-ready Mistral OCR with 99%+ accuracy and advanced UX

## Critical Path: Bug Fixes (P0)

### Phase 1: Core API Integration (2-3 hours)
**Priority**: P0 - Blocking
**Dependencies**: None
**Risk**: High - Core functionality broken

#### 1.1 Fix API Method (Critical Bug #1)
**File**: `src/lib/mistral-ocr-client.ts`

**Current Code** (Lines 176-195):
```typescript
// ❌ WRONG: Using chat completion
const response = await this.mistralClient.chat({
  model: 'mistral-large-latest',
  messages: [...]
});
```

**Correct Implementation**:
```typescript
// ✅ CORRECT: Three-stage Mistral OCR workflow
async extractDocument(file: File | Blob): Promise<ExtractedDocument> {
  const startTime = Date.now();

  try {
    // Validate file before upload
    await this.validateFile(file);

    // Stage 1: Upload to Mistral's file service
    const uploadedFile = await this.mistralClient.files.upload({
      file: {
        file_name: file instanceof File ? file.name : 'document.pdf',
        content: await file.arrayBuffer()
      },
      purpose: 'ocr'
    });

    // Stage 2: Get signed URL (1 hour expiry)
    const signedUrl = await this.mistralClient.files.getSignedUrl({
      file_id: uploadedFile.id,
      expiry: 1 // hours
    });

    // Stage 3: Process with dedicated OCR endpoint
    const ocrResponse = await this.mistralClient.ocr.process({
      document: {
        document_url: signedUrl.url
      },
      model: 'mistral-ocr-latest', // NOT mistral-large-latest
      include_image_base64: true // Get images for visual verification
    });

    // Parse OCR response (different structure than chat)
    const extractionTime = Date.now() - startTime;

    return {
      markdown: ocrResponse.content, // Direct content property
      images: ocrResponse.images?.map(img => img.image_base64) || [],
      tables: this.extractTablesFromMarkdown(ocrResponse.content),
      confidence: ocrResponse.metadata?.confidence || 0.95,
      documentType: this.classifyDocument(ocrResponse.content),
      metadata: {
        pageCount: ocrResponse.metadata?.pages || 1,
        extractionTime,
        model: 'mistral-ocr-latest'
      }
    };
  } catch (error) {
    console.error('Mistral OCR extraction error:', error);
    throw new Error(`Failed to extract document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

**Testing**:
- Upload driver's license (should return 99%+ confidence)
- Upload FL-320 court form (should extract all fields)
- Upload 10-page PDF (should handle all pages)

**Success Criteria**:
- ✅ No TypeScript errors
- ✅ Successful file upload to Mistral
- ✅ Signed URL generated
- ✅ OCR response parsed correctly
- ✅ Confidence score ≥ 0.95 for identity documents

---

#### 1.2 Add File Validation (Critical Bug #3)
**File**: `src/lib/mistral-ocr-client.ts`

**Add New Method**:
```typescript
/**
 * Validate file before upload to Mistral
 * Mistral limits: 50MB max, 1000 pages max
 */
private async validateFile(file: File | Blob): Promise<void> {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
  const MAX_PAGES = 1000;

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds Mistral's 50MB limit`
    );
  }

  // Check file type
  const mimeType = file instanceof File ? file.type : 'application/octet-stream';
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ];

  if (!validTypes.includes(mimeType)) {
    throw new Error(
      `Unsupported file type: ${mimeType}. Only images and PDFs are supported.`
    );
  }

  // For PDFs, check page count (requires pdfjs-dist)
  if (mimeType === 'application/pdf') {
    const pageCount = await this.getPDFPageCount(file);
    if (pageCount > MAX_PAGES) {
      throw new Error(
        `PDF has ${pageCount} pages, exceeding Mistral's ${MAX_PAGES} page limit`
      );
    }
  }
}

/**
 * Get PDF page count using pdfjs-dist
 */
private async getPDFPageCount(file: File | Blob): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Use pdfjs-dist (already in project)
    const { getDocument } = await import('pdfjs-dist');
    const pdf = await getDocument({ data: uint8Array }).promise;

    return pdf.numPages;
  } catch (error) {
    console.warn('Could not get PDF page count:', error);
    return 0; // Allow upload if page count check fails
  }
}
```

**Dependencies**:
- Already have `pdfjs-dist` in package.json ✅

**Testing**:
- Upload 51MB file (should reject)
- Upload 1001-page PDF (should reject)
- Upload .docx file (should reject)
- Upload 2MB PDF with 10 pages (should accept)

---

#### 1.3 Fix Response Structure (Critical Bug #4)
**File**: `src/lib/mistral-ocr-client.ts`

**Current Assumption** (Lines 197):
```typescript
const markdown = response.choices[0]?.message?.content || '';
// ❌ WRONG: OCR API doesn't use chat completion structure
```

**Correct Response Handling**:
```typescript
// OCR API Response Structure (from Mistral docs):
interface MistralOCRResponse {
  content: string; // Markdown text
  images?: Array<{
    image_base64: string;
    page: number;
  }>;
  metadata?: {
    pages: number;
    processing_time_ms: number;
    confidence: number;
  };
}

// In extractDocument():
const ocrResponse = await this.mistralClient.ocr.process({ ... });

// Direct access (no choices array):
const markdown = ocrResponse.content; // ✅ CORRECT
const images = ocrResponse.images || [];
const confidence = ocrResponse.metadata?.confidence || 0.95;
```

---

### Phase 2: SDK Package Verification (30 minutes)
**Priority**: P0 - Blocking
**Dependencies**: Phase 1
**Risk**: Medium

#### 2.1 Verify @mistralai/mistralai SDK Version
**File**: `package.json`

**Check Installation**:
```bash
npm list @mistralai/mistralai
# Should show: @mistralai/mistralai@1.10.0 (or latest)
```

**Verify SDK Has OCR Methods**:
```bash
# Check SDK documentation
npm info @mistralai/mistralai

# Or check node_modules
ls node_modules/@mistralai/mistralai/dist
```

**If OCR methods missing**:
```bash
# Update to latest version
npm install @mistralai/mistralai@latest

# Or use beta/alpha if OCR is in preview
npm install @mistralai/mistralai@next
```

**Success Criteria**:
- ✅ SDK version ≥ 1.10.0
- ✅ `client.files.upload()` exists
- ✅ `client.files.getSignedUrl()` exists
- ✅ `client.ocr.process()` exists

---

## Quick Wins: UX Enhancements (P1)

### Phase 3: Real-Time Progress Tracking (1-2 hours)
**Priority**: P1 - High Value
**Dependencies**: Phase 1, Phase 2
**Risk**: Low

#### 3.1 Five-Stage Progress Indicator
**File**: `src/components/DocumentUploadPanel.tsx`

**Current**: Simple 0-100% progress bar
**Improvement**: Detailed stage-by-stage tracking

**New Interface**:
```typescript
interface ExtractionStage {
  name: 'validating' | 'uploading' | 'processing' | 'extracting' | 'parsing';
  label: string;
  progress: number; // 0-100 for this stage
  startTime: number;
  endTime?: number;
}

interface UploadedDocument {
  // ... existing fields
  stages: ExtractionStage[];
  currentStage: ExtractionStage['name'];
}
```

**Implementation**:
```typescript
const processDocument = async (doc: UploadedDocument) => {
  try {
    // Stage 1: Validating (0-10%)
    updateDocumentStage(doc.id, 'validating', 0);
    await ocrEngine.validateFile(doc.file);
    updateDocumentStage(doc.id, 'validating', 100);

    // Stage 2: Uploading (10-40%)
    updateDocumentStage(doc.id, 'uploading', 0);
    const uploadedFile = await ocrEngine.uploadFile(doc.file, (progress) => {
      updateDocumentStage(doc.id, 'uploading', progress);
    });
    updateDocumentStage(doc.id, 'uploading', 100);

    // Stage 3: Processing (40-45%)
    updateDocumentStage(doc.id, 'processing', 0);
    const signedUrl = await ocrEngine.getSignedUrl(uploadedFile.id);
    updateDocumentStage(doc.id, 'processing', 100);

    // Stage 4: Extracting (45-90%)
    updateDocumentStage(doc.id, 'extracting', 0);
    const ocrResult = await ocrEngine.processOCR(signedUrl, (progress) => {
      updateDocumentStage(doc.id, 'extracting', progress);
    });
    updateDocumentStage(doc.id, 'extracting', 100);

    // Stage 5: Parsing (90-100%)
    updateDocumentStage(doc.id, 'parsing', 0);
    const structured = await ocrEngine.structureData(ocrResult);
    updateDocumentStage(doc.id, 'parsing', 100);

    updateDocument(doc.id, { status: 'completed', extractedData: structured });
  } catch (error) {
    updateDocument(doc.id, { status: 'failed', error: error.message });
  }
};
```

**UI Component**:
```typescript
// In DocumentUploadPanel.tsx render:
{doc.stages && (
  <div className="space-y-1">
    {doc.stages.map((stage, index) => (
      <div key={stage.name} className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-full ${
          stage.endTime
            ? 'bg-green-500'
            : stage.name === doc.currentStage
            ? 'bg-blue-500 animate-pulse'
            : 'bg-gray-300'
        }`} />
        <span className="text-xs">{stage.label}</span>
        {stage.name === doc.currentStage && (
          <span className="text-xs text-muted-foreground">
            {Math.round(stage.progress)}%
          </span>
        )}
      </div>
    ))}
  </div>
)}
```

**Benefits**:
- Users see exactly what's happening
- Reduces perceived wait time
- Builds trust in the AI system

---

#### 3.2 Preview Modal with Diff View
**File**: `src/components/DocumentUploadPanel.tsx` (new component)

**Create**: `src/components/DocumentPreviewModal.tsx`

```typescript
interface DocumentPreviewModalProps {
  document: UploadedDocument;
  extractedData: StructuredDocumentData;
  onClose: () => void;
  onAccept: () => void;
}

export const DocumentPreviewModal = ({
  document,
  extractedData,
  onClose,
  onAccept
}: DocumentPreviewModalProps) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Review Extracted Data</DialogTitle>
          <DialogDescription>
            Verify the accuracy before merging into your vault
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 overflow-y-auto">
          {/* Left: Original document */}
          <div>
            <h3 className="text-sm font-medium mb-2">Original Document</h3>
            <div className="border rounded p-2 bg-muted">
              {/* Show PDF or image preview */}
              <DocumentPreview file={document.file} />
            </div>
          </div>

          {/* Right: Extracted data */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              Extracted Data
              <Badge variant="secondary" className="ml-2">
                {Math.round(extractedData.confidence * 100)}% confidence
              </Badge>
            </h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {Object.entries(extractedData).map(([category, data]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-xs">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onAccept}>Accept & Merge</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

---

## Advanced Features: Cutting-Edge Tech (P2)

### Phase 4: Streaming OCR for Large PDFs (3-4 hours)
**Priority**: P2 - Nice to Have
**Dependencies**: Phase 1-3
**Risk**: Medium

#### 4.1 Page-by-Page Streaming
**File**: `src/lib/mistral-ocr-client.ts`

**New Method**:
```typescript
/**
 * Stream OCR extraction for large PDFs (>10 pages)
 * Processes 10 pages at a time to avoid timeout
 */
async *streamExtractLargePDF(
  file: File,
  onProgress?: (current: number, total: number) => void
): AsyncGenerator<Partial<ExtractedDocument>, ExtractedDocument, void> {
  const pageCount = await this.getPDFPageCount(file);

  if (pageCount <= 10) {
    // Small PDF, use standard extraction
    yield await this.extractDocument(file);
    return;
  }

  // Split into chunks of 10 pages
  const chunkSize = 10;
  const chunks = Math.ceil(pageCount / chunkSize);

  let allMarkdown = '';
  let allImages: string[] = [];
  let allTables: string[][] = [];

  for (let i = 0; i < chunks; i++) {
    const startPage = i * chunkSize;
    const endPage = Math.min((i + 1) * chunkSize, pageCount);

    // Extract this chunk
    const chunkFile = await this.extractPDFPages(file, startPage, endPage);
    const chunkResult = await this.extractDocument(chunkFile);

    // Accumulate results
    allMarkdown += chunkResult.markdown + '\n\n';
    allImages.push(...chunkResult.images);
    allTables.push(...chunkResult.tables);

    // Yield partial result
    onProgress?.(endPage, pageCount);
    yield {
      markdown: allMarkdown,
      images: allImages,
      tables: allTables,
      confidence: chunkResult.confidence,
      metadata: {
        pageCount: endPage,
        extractionTime: Date.now(),
        model: 'mistral-ocr-latest'
      }
    };
  }

  // Final complete result
  return {
    markdown: allMarkdown,
    images: allImages,
    tables: allTables,
    confidence: 0.95,
    metadata: {
      pageCount,
      extractionTime: Date.now(),
      model: 'mistral-ocr-latest'
    }
  };
}
```

**UI Integration**:
```typescript
// In DocumentUploadPanel.tsx:
const processLargeDocument = async (doc: UploadedDocument) => {
  const generator = ocrEngine.streamExtractLargePDF(
    doc.file,
    (current, total) => {
      const progress = (current / total) * 100;
      updateDocument(doc.id, { progress });
    }
  );

  for await (const partial of generator) {
    // Show real-time extraction progress
    updateDocument(doc.id, {
      extractedData: partial as StructuredDocumentData
    });
  }
};
```

---

### Phase 5: Batch Processing with Rate Limiting (2 hours)
**Priority**: P2
**Dependencies**: Phase 4
**Risk**: Low

#### 5.1 PQueue Integration
**Install**:
```bash
npm install p-queue
```

**Implementation**:
```typescript
import PQueue from 'p-queue';

export class MistralOCREngine {
  private queue: PQueue;

  constructor(apiKey: string) {
    this.mistralClient = new MistralClient({ apiKey });

    // Rate limiting: 3 concurrent, 10 requests/minute
    this.queue = new PQueue({
      concurrency: 3,
      interval: 60000, // 1 minute
      intervalCap: 10
    });
  }

  async extractDocument(file: File): Promise<ExtractedDocument> {
    return this.queue.add(() => this._extractDocument(file));
  }

  private async _extractDocument(file: File): Promise<ExtractedDocument> {
    // Actual extraction logic (from Phase 1)
  }
}
```

**Benefits**:
- Prevents API rate limit errors
- Handles multiple uploads gracefully
- Better user experience during bulk operations

---

### Phase 6: Client-Side Preview with Tesseract.js (3 hours)
**Priority**: P2 - Premium Feature
**Dependencies**: None (runs in parallel)
**Risk**: Low

#### 6.1 Instant Preview Before Mistral Upload
**Install**:
```bash
npm install tesseract.js
```

**Implementation**:
```typescript
import Tesseract from 'tesseract.js';

/**
 * Client-side OCR preview (fast, lower quality)
 * Gives instant feedback while Mistral processes
 */
async getInstantPreview(file: File): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(file, 'eng', {
    logger: (m) => console.log(m) // Progress updates
  });

  return text;
}
```

**UI Flow**:
1. User drops file
2. Tesseract.js runs immediately (2-5 seconds)
3. Show instant preview
4. Mistral OCR runs in background (15-30 seconds)
5. Replace preview with high-quality Mistral extraction

**Benefits**:
- Immediate user feedback
- Perceived performance boost
- Offline capability (fallback)

---

## Testing Strategy

### Unit Tests (Jest/Vitest)
```typescript
// src/lib/__tests__/mistral-ocr-client.test.ts

describe('MistralOCREngine', () => {
  describe('File Validation', () => {
    it('should reject files > 50MB', async () => {
      const largefile = new File([new ArrayBuffer(51 * 1024 * 1024)], 'large.pdf');
      await expect(engine.validateFile(largefile)).rejects.toThrow('50MB limit');
    });

    it('should reject PDFs > 1000 pages', async () => {
      // Mock PDF with 1001 pages
      await expect(engine.validateFile(largePDF)).rejects.toThrow('1000 page limit');
    });

    it('should accept valid files', async () => {
      const validFile = new File([new ArrayBuffer(1024)], 'valid.pdf', {
        type: 'application/pdf'
      });
      await expect(engine.validateFile(validFile)).resolves.not.toThrow();
    });
  });

  describe('OCR Extraction', () => {
    it('should extract from driver license with 99%+ confidence', async () => {
      const result = await engine.extractDocument(driverLicenseFile);
      expect(result.confidence).toBeGreaterThanOrEqual(0.99);
      expect(result.documentType).toBe('drivers_license');
    });

    it('should handle OCR API errors gracefully', async () => {
      // Mock API error
      await expect(engine.extractDocument(corruptedFile)).rejects.toThrow();
    });
  });
});
```

### E2E Tests (Playwright)
```typescript
// tests/e2e/document-upload.spec.ts

test('complete document upload flow', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Personal Data Vault').click();
  await page.getByText('Upload Documents').click();

  // Upload driver's license
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('./test-files/drivers-license.jpg');

  // Wait for extraction
  await page.waitForSelector('text=Extracting data...', { timeout: 5000 });
  await page.waitForSelector('text=Extracted', { timeout: 30000 });

  // Verify confidence badge
  const confidence = await page.locator('[data-testid="confidence-badge"]').textContent();
  expect(parseInt(confidence)).toBeGreaterThan(95);

  // Preview modal
  await page.getByText('Preview').click();
  await expect(page.locator('[data-testid="preview-modal"]')).toBeVisible();

  // Accept and merge
  await page.getByText('Accept & Merge').click();

  // Verify data in vault
  await page.getByText('Manual Entry').click();
  const nameField = await page.locator('#full_name').inputValue();
  expect(nameField).toBeTruthy();
});
```

### Performance Benchmarks
```typescript
// tests/performance/ocr-benchmarks.ts

const benchmarks = {
  'drivers_license_1_page': {
    maxTime: 2000, // 2 seconds
    minConfidence: 0.99
  },
  'court_form_4_pages': {
    maxTime: 5000, // 5 seconds
    minConfidence: 0.95
  },
  'legal_doc_10_pages': {
    maxTime: 11000, // 11 seconds
    minConfidence: 0.95
  }
};

for (const [name, benchmark] of Object.entries(benchmarks)) {
  test(`${name} meets performance targets`, async () => {
    const startTime = Date.now();
    const result = await engine.extractDocument(testFiles[name]);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(benchmark.maxTime);
    expect(result.confidence).toBeGreaterThanOrEqual(benchmark.minConfidence);
  });
}
```

---

## Rollback Plan

### If Phase 1 Fails (API Integration)
1. **Immediate**: Revert to `main` branch
2. **Fallback**: Use Tesseract.js for basic OCR (lower quality)
3. **Communication**: Display notice about enhanced OCR "coming soon"

```typescript
// Fallback implementation in mistral-ocr-client.ts:
async extractDocument(file: File): Promise<ExtractedDocument> {
  try {
    // Try Mistral OCR first
    return await this.extractWithMistral(file);
  } catch (error) {
    console.error('Mistral OCR failed, falling back to Tesseract:', error);
    // Fallback to Tesseract.js
    return await this.extractWithTesseract(file);
  }
}
```

### If Performance Issues
1. **Reduce concurrent uploads**: Lower PQueue concurrency from 3 to 1
2. **Disable streaming**: Use standard extraction for all files
3. **Add loading states**: Better user communication during delays

### If Accuracy Issues
1. **Two-pass extraction**: Run Mistral OCR twice and compare
2. **Human-in-the-loop**: Require manual verification for low confidence (<0.80)
3. **Field-level confidence**: Show confidence per field, not just document

---

## Code Review Checklist

Before committing Phase 1 fixes:

### Functionality
- [ ] File upload to Mistral succeeds
- [ ] Signed URL generation works
- [ ] OCR endpoint returns valid response
- [ ] Response structure matches documentation
- [ ] File validation rejects invalid files
- [ ] Error messages are user-friendly

### TypeScript
- [ ] No `any` types used
- [ ] All interfaces exported
- [ ] JSDoc comments on public methods
- [ ] TypeScript strict mode passes
- [ ] No unused imports or variables

### Testing
- [ ] Unit tests pass (>80% coverage)
- [ ] E2E tests pass
- [ ] Manual testing on real documents completed
- [ ] Performance benchmarks met

### Security
- [ ] API key stored in environment variable
- [ ] No API key in client-side code
- [ ] File size validation prevents DoS
- [ ] User input sanitized before DB insertion

### Documentation
- [ ] DOCUMENT_INTELLIGENCE.md updated
- [ ] Code comments explain complex logic
- [ ] API changes documented
- [ ] Breaking changes noted

---

## Risk Assessment

### High Risk
- **Mistral OCR SDK availability**: If OCR methods not in v1.10.0
  - **Mitigation**: Check SDK source, use beta version, or implement REST API directly

- **API rate limits**: Unknown Mistral OCR rate limits
  - **Mitigation**: Implement PQueue, monitor for 429 errors, add exponential backoff

### Medium Risk
- **Large file processing time**: 10+ page PDFs may timeout
  - **Mitigation**: Implement streaming (Phase 4), show progress, increase timeout

- **Accuracy on handwritten forms**: Mistral OCR may struggle
  - **Mitigation**: Warn users, manual correction UI, confidence thresholds

### Low Risk
- **Browser compatibility**: FileReader, ArrayBuffer support
  - **Mitigation**: Modern browsers only, feature detection, polyfills

---

## Performance Expectations

### After Phase 1-2 (Core Fixes)
- **Driver's License (1 page)**: 2-3 seconds, 99%+ accuracy
- **Court Form (4 pages)**: 5-7 seconds, 95%+ accuracy
- **Legal Doc (10 pages)**: 11-15 seconds, 95%+ accuracy

### After Phase 3 (UX Enhancements)
- **Perceived Performance**: 30% faster (progress indicators)
- **User Confidence**: Higher (preview modal, diff view)

### After Phase 4-6 (Advanced Features)
- **Large PDFs (50 pages)**: Streamable, no timeout
- **Batch Upload (10 files)**: Queued processing, no errors
- **Instant Preview**: <5 seconds with Tesseract.js

---

## Deployment Strategy

### Development
1. Create feature branch: `feature/mistral-ocr-fixes`
2. Implement Phase 1 fixes
3. Run full test suite
4. Manual testing with real documents

### Staging
1. Deploy to staging environment
2. Internal testing with 10+ different document types
3. Performance monitoring (Sentry)
4. User acceptance testing (3-5 SRLs)

### Production
1. Feature flag: `ENABLE_MISTRAL_OCR_V2`
2. Gradual rollout: 10% → 50% → 100%
3. Monitor error rates, extraction times
4. Rollback if error rate > 5%

---

## Next Steps

### Immediate (When User Approves)
1. [ ] Create feature branch
2. [ ] Implement Phase 1.1 (API method fix)
3. [ ] Implement Phase 1.2 (file validation)
4. [ ] Implement Phase 1.3 (response structure)
5. [ ] Run `npm run typecheck`
6. [ ] Run `npm run test`
7. [ ] Manual test with 3 document types
8. [ ] Commit to feature branch

### Short-term (Next Sprint)
9. [ ] Phase 2 (SDK verification)
10. [ ] Phase 3 (progress tracking + preview modal)
11. [ ] E2E tests
12. [ ] Code review
13. [ ] Merge to main

### Long-term (Future Sprints)
14. [ ] Phase 4 (streaming for large PDFs)
15. [ ] Phase 5 (batch processing)
16. [ ] Phase 6 (Tesseract.js preview)
17. [ ] Performance optimization
18. [ ] Production deployment

---

## Questions for Product Team

1. **Accuracy Threshold**: What's the minimum acceptable confidence for auto-merge?
   - Current proposal: 0.95 for auto-merge, 0.80+ requires manual verification

2. **File Size Limits**: Should we match Mistral's 50MB limit or set lower?
   - Current proposal: 50MB max (Mistral limit)

3. **Cost Budget**: How many documents/month are we budgeting for?
   - Current estimate: $0.01-$0.05 per user/month

4. **Error Handling**: How should we handle extraction failures?
   - Current proposal: Fallback to Tesseract.js, notify user

5. **Data Retention**: How long should we keep extracted documents?
   - Current proposal: Delete after vault merge, keep only structured data

---

**Status**: Ready for execution when approved
**Blockers**: None - all dependencies documented
**Estimated Total Time**: 8-12 hours for Phases 1-3
**Risk Level**: Medium (API changes, untested SDK methods)
**Reward**: Production-ready 99%+ accuracy OCR system

Last Updated: 2025-11-17 by Claude Code Research Agent
