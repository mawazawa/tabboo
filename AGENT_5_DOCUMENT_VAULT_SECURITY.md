# Agent 5: Secure Document Upload & Personal Data Vault Integration

**Your Mission**: Implement secure document upload system with Personal Data Vault sync, Supabase storage bucket with RLS, and Neo4j partitioned knowledge graph integration.

**Context**:
- Read `DOCUMENT_INTELLIGENCE.md` for current implementation
- Study `src/components/DocumentUploadPanel.tsx` and `PersonalDataVaultPanel.tsx`
- Review `ARCHITECTURE_ENHANCEMENTS.md` for storage architecture
- Current system has basic upload but needs security hardening and Neo4j integration

**Your Tasks** (in order):

1. **Research Secure Storage Architecture** (2-3 hours)
   - Use Exa MCP to research:
     - Supabase storage bucket RLS policies for user isolation
     - Secure document upload patterns (encryption, access control)
     - Neo4j partitioned knowledge graph for multi-tenant data
     - Best practices for PII storage (GDPR, CCPA, HIPAA considerations)
   - Create `SECURE_STORAGE_ARCHITECTURE.md` documenting:
     - Storage bucket structure (`user_id/documents/`)
     - RLS policies for storage buckets
     - SQL table RLS policies
     - Neo4j partition strategy (user-based partitioning)
   - Log research to Memory MCP and create Linear issues

2. **Create Supabase Storage Bucket with RLS** (2-3 hours)
   - Create migration: `supabase/migrations/[timestamp]_secure_document_storage.sql`
   - Create storage bucket: `personal-documents` (or `document-uploads`)
   - Implement RLS policies for storage:
     ```sql
     -- Users can only upload to their own folder
     CREATE POLICY "Users can upload to own folder"
     ON storage.objects
     FOR INSERT
     TO authenticated
     WITH CHECK (
       bucket_id = 'personal-documents' AND
       (storage.foldername(name))[1] = auth.uid()::text
     );

     -- Users can only read their own files
     CREATE POLICY "Users can read own files"
     ON storage.objects
     FOR SELECT
     TO authenticated
     USING (
       bucket_id = 'personal-documents' AND
       (storage.foldername(name))[1] = auth.uid()::text
     );

     -- Users can delete their own files
     CREATE POLICY "Users can delete own files"
     ON storage.objects
     FOR DELETE
     TO authenticated
     USING (
       bucket_id = 'personal-documents' AND
       (storage.foldername(name))[1] = auth.uid()::text
     );
     ```
   - Test policies with different users
   - Document in `SECURE_STORAGE_ARCHITECTURE.md`

3. **Enhance SQL Tables with RLS** (2-3 hours)
   - Review existing tables: `canonical_data_vault`, `vault_document_extractions`
   - Ensure RLS is enabled on all tables
   - Add/update RLS policies:
     ```sql
     -- canonical_data_vault RLS
     ALTER TABLE public.canonical_data_vault ENABLE ROW LEVEL SECURITY;

     CREATE POLICY "Users can read own vault"
     ON public.canonical_data_vault
     FOR SELECT
     USING (auth.uid() = user_id);

     CREATE POLICY "Users can update own vault"
     ON public.canonical_data_vault
     FOR UPDATE
     USING (auth.uid() = user_id);

     CREATE POLICY "Users can insert own vault"
     ON public.canonical_data_vault
     FOR INSERT
     WITH CHECK (auth.uid() = user_id);

     -- vault_document_extractions RLS
     ALTER TABLE public.vault_document_extractions ENABLE ROW LEVEL SECURITY;

     CREATE POLICY "Users can read own extractions"
     ON public.vault_document_extractions
     FOR SELECT
     USING (auth.uid() = user_id);

     CREATE POLICY "Users can insert own extractions"
     ON public.vault_document_extractions
     FOR INSERT
     WITH CHECK (auth.uid() = user_id);
     ```
   - Test policies prevent cross-user access
   - Create migration file

4. **Implement Secure Document Upload Edge Function** (3-4 hours)
   - Create `supabase/functions/upload-document-secure/index.ts`:
     - Validate file type (images, PDFs only)
     - Validate file size (max 10MB per file)
     - Calculate SHA-256 hash for deduplication
     - Upload to Supabase storage with path: `${user_id}/documents/${timestamp}-${filename}`
     - Create extraction job in `extraction_queue` table
     - Return secure signed URL (1 hour expiry) for processing
   - Implement file validation:
     - MIME type checking
     - File signature validation (magic bytes)
     - Virus scanning (if available)
   - Add rate limiting (10 uploads per hour per user)
   - Test with various file types and sizes

5. **Integrate Mistral OCR with Secure Storage** (2-3 hours)
   - Update `src/lib/mistral-ocr-client.ts`:
     - Use secure upload edge function instead of direct client upload
     - Handle signed URLs for document access
     - Implement retry logic for failed extractions
     - Add progress tracking
   - Update `src/components/DocumentUploadPanel.tsx`:
     - Use secure upload endpoint
     - Show upload progress
     - Handle errors gracefully
     - Display extraction status

6. **Implement Neo4j Partitioned Knowledge Graph** (4-5 hours)
   - Design partition strategy:
     - Each user gets isolated Neo4j database/partition
     - Or use node labels with user_id property + RLS
   - Create `src/lib/neo4j-vault-sync.ts`:
     - Sync extracted data from Supabase to Neo4j
     - Create nodes: Document, Person, Address, Case, etc.
     - Create relationships: EXTRACTED_FROM, CONTAINS, REFERENCES
     - Implement user isolation (partition by user_id)
   - Create Neo4j schema:
     ```cypher
     // User partition (each user isolated)
     CREATE CONSTRAINT user_partition IF NOT EXISTS
     FOR (n:UserData)
     REQUIRE n.user_id IS NOT NULL;

     // Document nodes
     CREATE CONSTRAINT document_id IF NOT EXISTS
     FOR (d:Document)
     REQUIRE d.id IS UNIQUE;

     // Indexes for performance
     CREATE INDEX user_documents IF NOT EXISTS
     FOR (d:Document)
     ON (d.user_id);
     ```
   - Implement sync function:
     - On document extraction complete → sync to Neo4j
     - On vault update → sync to Neo4j
     - Handle conflicts (Supabase is source of truth)
   - Test user isolation (user A cannot see user B's data)

7. **Personal Data Vault Sync System** (3-4 hours)
   - Create `src/lib/vault-sync.ts`:
     - Sync extracted data to `canonical_data_vault` table
     - Merge data intelligently (handle conflicts)
     - Track provenance (source document, confidence, timestamp)
     - Update Personal Data Vault UI automatically
   - Update `src/components/PersonalDataVaultPanel.tsx`:
     - Show data sources (which document extracted which field)
     - Allow user to verify/override extracted data
     - Display confidence scores
     - Show merge conflicts and resolution UI
   - Implement data merging logic:
     - Higher confidence wins
     - User verification overrides auto-extraction
     - Track all changes with audit log

8. **Support Multiple Document Types** (2-3 hours)
   - Enhance document type detection:
     - Driver's license (front/back)
     - Passport
     - Court forms (DV-100, FL-320, etc.)
     - Utility bills
     - Pay stubs
     - Tax returns
   - Create document type handlers:
     - `src/lib/document-handlers/drivers-license.ts`
     - `src/lib/document-handlers/court-form.ts`
     - `src/lib/document-handlers/utility-bill.ts`
   - Each handler:
     - Validates document structure
     - Extracts type-specific fields
     - Maps to Personal Data Vault schema
   - Test with real documents (driver's license, forms)

9. **Security Hardening** (2-3 hours)
   - Implement encryption at rest:
     - Encrypt sensitive fields (SSN, financial data) before storage
     - Use Supabase encryption or application-level encryption
   - Add audit logging:
     - Log all document uploads
     - Log all vault access
     - Log all Neo4j queries
   - Implement data retention policies:
     - Auto-delete documents after 90 days (configurable)
     - Allow user to manually delete
   - Add PII sanitization:
     - Sanitize extracted data before storage
     - Remove unnecessary PII from logs
   - Test security:
     - Attempt cross-user access (should fail)
     - Attempt unauthorized upload (should fail)
     - Verify RLS policies work correctly

10. **Testing & Validation** (3-4 hours)
    - Write integration tests:
      - Test secure upload with RLS
      - Test document extraction → vault sync
      - Test vault → Neo4j sync
      - Test user isolation (user A cannot access user B's data)
    - Write E2E tests:
      - Upload driver's license → verify extraction → verify vault update
      - Upload court form → verify extraction → verify vault update
      - Test cross-user isolation
    - Performance testing:
      - Test concurrent uploads
      - Test large file uploads (10MB PDF)
      - Test Neo4j sync performance
    - Security testing:
      - Test RLS policies
      - Test storage bucket access
      - Test encryption
    - Run `npm run test:all` - all tests must pass

11. **Documentation** (2 hours)
    - Create `SECURE_DOCUMENT_UPLOAD_GUIDE.md`:
      - Architecture overview
      - Security model
      - RLS policy documentation
      - Neo4j partition strategy
      - API documentation
    - Update `DOCUMENT_INTELLIGENCE.md` with security enhancements
    - Update `CLAUDE.md` with new architecture
    - Create user guide for document upload
    - Log completion to Memory MCP and Linear

**Success Criteria**:
- ✅ Secure Supabase storage bucket with RLS policies
- ✅ All SQL tables have RLS enabled and tested
- ✅ Document upload uses secure edge function
- ✅ Personal Data Vault syncs from document extraction
- ✅ Neo4j partitioned knowledge graph with user isolation
- ✅ Support for driver's license, forms, utility bills, etc.
- ✅ Encryption at rest for sensitive data
- ✅ Audit logging implemented
- ✅ User isolation tested and verified
- ✅ Zero TypeScript errors
- ✅ All tests passing (unit + integration + E2E)
- ✅ Security audit passed
- ✅ Git commits for each milestone
- ✅ Linear issues created and updated

**Files You'll Create/Modify**:
- `SECURE_STORAGE_ARCHITECTURE.md` (new)
- `SECURE_DOCUMENT_UPLOAD_GUIDE.md` (new)
- `supabase/migrations/[timestamp]_secure_document_storage.sql` (new)
- `supabase/migrations/[timestamp]_vault_rls_policies.sql` (new)
- `supabase/functions/upload-document-secure/index.ts` (new)
- `src/lib/neo4j-vault-sync.ts` (new)
- `src/lib/vault-sync.ts` (new)
- `src/lib/document-handlers/drivers-license.ts` (new)
- `src/lib/document-handlers/court-form.ts` (new)
- `src/lib/document-handlers/utility-bill.ts` (new)
- `src/lib/mistral-ocr-client.ts` (enhance)
- `src/components/DocumentUploadPanel.tsx` (enhance)
- `src/components/PersonalDataVaultPanel.tsx` (enhance)
- Test files (new)

**Dependencies**: 
- Can work independently
- Will integrate with Agents 1-4's work when forms are ready
- Needs SUPABASE_SERVICE_ROLE_KEY (get from dashboard)

**Estimated Time**: 25-35 hours

**Critical Security Requirements**:
1. **Storage Bucket RLS**: Users can ONLY access files in their own `user_id/` folder
2. **SQL RLS**: All tables enforce `auth.uid() = user_id` for all operations
3. **Neo4j Partitioning**: User data completely isolated (partition by user_id)
4. **Encryption**: Sensitive fields encrypted at rest
5. **Audit Logging**: All access logged for compliance
6. **Data Retention**: Configurable retention policies
7. **PII Sanitization**: Remove PII from logs and error messages

**Coordination**:
- Use Memory MCP to log progress
- Create Linear issues for all work
- Commit to git frequently (every 30-60 min)
- Check Neo4j for existing knowledge graph structure
- Coordinate with other agents via Linear comments

**Start by researching secure storage architecture, then implement storage bucket and RLS policies.**

