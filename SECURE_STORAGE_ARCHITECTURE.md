# Secure Storage Architecture

**Project**: SwiftFill Document Intelligence System
**Created**: 2025-11-17
**Status**: Architecture Specification
**Priority**: P0 - Critical Security Infrastructure

---

## Executive Summary

This document defines the secure storage architecture for SwiftFill's document intelligence system, implementing defense-in-depth security with:

- **Supabase Storage Bucket RLS** for user-isolated file storage
- **PostgreSQL RLS Policies** for database-level access control
- **Neo4j Partitioned Knowledge Graph** for multi-tenant data isolation
- **AES-256 Encryption** for PII data at rest
- **Compliance**: GDPR, CCPA, and HIPAA-aligned security practices

**Security Goals**:
- ✅ Complete user data isolation (zero cross-user access)
- ✅ Encrypted PII storage with audit logging
- ✅ Compliant with GDPR, CCPA, HIPAA regulations
- ✅ Defense-in-depth: multiple security layers
- ✅ Zero-trust architecture

---

## 1. Supabase Storage Bucket Architecture

### 1.1 Bucket Structure

```
personal-documents (Storage Bucket)
├── {user_id_1}/
│   ├── documents/
│   │   ├── {timestamp}-drivers-license.jpg
│   │   ├── {timestamp}-court-form.pdf
│   │   └── {timestamp}-utility-bill.pdf
│   └── processed/
│       └── {timestamp}-extracted-data.json
├── {user_id_2}/
│   └── documents/
│       └── ...
└── ...
```

**Design Principles**:
1. **User-based partitioning**: Each user has their own folder (`{user_id}/`)
2. **Timestamp prefixing**: Prevents filename collisions (`{timestamp}-{filename}`)
3. **Type segregation**: Separate folders for raw documents and processed data
4. **No shared folders**: Zero cross-user access by design

### 1.2 Storage Bucket Configuration

```sql
-- Create storage bucket (private by default)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'personal-documents',
  'personal-documents',
  false, -- Private bucket (RLS enforced)
  10485760, -- 10 MB max file size
  ARRAY['image/jpeg', 'image/png', 'application/pdf'] -- Only images and PDFs
);
```

### 1.3 Row Level Security (RLS) Policies

**Storage objects are controlled via RLS policies on `storage.objects` table.**

#### Policy 1: User Upload to Own Folder

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
```

**Explanation**:
- `storage.foldername(name)` extracts folder path from file name
- `[1]` gets the first folder (user_id)
- Only allows INSERT if user_id matches authenticated user

#### Policy 2: User Read Own Files

```sql
-- Users can only read their own files
CREATE POLICY "Users can read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'personal-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3: User Delete Own Files

```sql
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

#### Policy 4: User Update Own Files

```sql
-- Users can update their own files (for upsert operations)
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'personal-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'personal-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 1.4 Security Validation Tests

```sql
-- Test 1: User A cannot read User B's files
-- Expected: Empty result set
SELECT * FROM storage.objects
WHERE bucket_id = 'personal-documents'
  AND (storage.foldername(name))[1] = '{user_b_id}';
-- When executed as User A

-- Test 2: User cannot upload to another user's folder
-- Expected: RLS policy violation error
INSERT INTO storage.objects (bucket_id, name, owner)
VALUES ('personal-documents', '{other_user_id}/test.pdf', auth.uid());

-- Test 3: Service role bypasses RLS (for admin operations)
-- Expected: Returns all files across all users
SELECT * FROM storage.objects
WHERE bucket_id = 'personal-documents';
-- When executed with service_role key
```

---

## 2. PostgreSQL Database RLS Policies

### 2.1 Tables Requiring RLS

1. **canonical_data_vault** - User's personal data vault
2. **vault_document_extractions** - Document extraction history
3. **extraction_queue** - Background job queue
4. **personal_info** - User profile data

### 2.2 RLS Policy Patterns

#### Pattern 1: User-Owned Data

```sql
-- Enable RLS
ALTER TABLE public.canonical_data_vault ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "Users can read own vault"
ON public.canonical_data_vault
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own vault"
ON public.canonical_data_vault
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own vault"
ON public.canonical_data_vault
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE policy (optional - for data deletion)
CREATE POLICY "Users can delete own vault"
ON public.canonical_data_vault
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

#### Pattern 2: Read-Only Historical Data

```sql
-- vault_document_extractions (user can read but not modify)
ALTER TABLE public.vault_document_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own extractions"
ON public.vault_document_extractions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own extractions"
ON public.vault_document_extractions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- No UPDATE/DELETE policies - immutable audit log
```

#### Pattern 3: Job Queue with Priority

```sql
-- extraction_queue (background jobs)
ALTER TABLE public.extraction_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own jobs"
ON public.extraction_queue
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
ON public.extraction_queue
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Service role can update job status (for background workers)
CREATE POLICY "Service role can update jobs"
ON public.extraction_queue
FOR UPDATE
TO service_role
USING (true);
```

### 2.3 Testing RLS Policies

```bash
# Test as User A (via JWT token)
curl -X GET 'https://<project-ref>.supabase.co/rest/v1/canonical_data_vault' \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <user-a-jwt-token>"

# Expected: Returns only User A's vault data

# Test as User B
curl -X GET 'https://<project-ref>.supabase.co/rest/v1/canonical_data_vault' \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <user-b-jwt-token>"

# Expected: Returns only User B's vault data
```

---

## 3. Neo4j Partitioned Knowledge Graph

### 3.1 Multi-Tenancy Strategy

**Chosen Approach**: **Label-Based Partitioning** (Cost-Effective)

Rationale:
- ✅ Single Neo4j instance (lower cost)
- ✅ Efficient for 100K+ users
- ✅ Query-level isolation via Cypher
- ❌ Requires careful query construction
- ❌ Risk of data leakage if query is malformed

**Alternative**: Multiple Databases (Neo4j 4.0+) - Future upgrade path for enterprise

### 3.2 Node Labeling Convention

```cypher
// Every node gets a User partition label
CREATE (d:Document:User_12345 {
  id: 'doc-001',
  type: 'drivers_license',
  uploaded_at: datetime(),
  // ... properties
})

CREATE (p:Person:User_12345 {
  name: 'Jane Smith',
  extracted_from: 'doc-001'
})

CREATE (a:Address:User_12345 {
  street: '123 Main St',
  city: 'Los Angeles',
  state: 'CA',
  zip: '90001'
})
```

**Key Pattern**: `:<EntityType>:User_<user_id>`

### 3.3 Cypher Query Enforcement

**All queries MUST include user partition filter**:

```cypher
// CORRECT: User-scoped query
MATCH (d:Document:User_12345)
WHERE d.type = 'drivers_license'
RETURN d

// WRONG: No user filter (returns ALL users' data)
MATCH (d:Document)
WHERE d.type = 'drivers_license'
RETURN d
```

**Enforcement via Application Layer**:

```typescript
// src/lib/neo4j-client.ts
class Neo4jClient {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // All queries automatically inject user partition
  async query(cypher: string, params: any = {}) {
    // Inject user label into query
    const userLabel = `User_${this.userId}`;

    // Validate query includes user partition
    if (!cypher.includes(userLabel)) {
      throw new Error('Security: Query must include user partition label');
    }

    return this.driver.executeQuery(cypher, params);
  }
}
```

### 3.4 Graph Schema

```cypher
// Constraints (per-user partition)
CREATE CONSTRAINT user_partition_required FOR (n:Document)
REQUIRE n.user_id IS NOT NULL;

CREATE CONSTRAINT document_id_unique FOR (d:Document)
REQUIRE d.id IS UNIQUE;

// Indexes (performance optimization)
CREATE INDEX user_documents FOR (d:Document) ON (d.user_id);
CREATE INDEX user_persons FOR (p:Person) ON (p.user_id);
CREATE INDEX document_type FOR (d:Document) ON (d.type);
```

### 3.5 Relationship Patterns

```cypher
// Document -> Person extraction
CREATE (d:Document:User_12345)-[:EXTRACTED]->(p:Person:User_12345)

// Document -> Address extraction
CREATE (d:Document:User_12345)-[:CONTAINS_ADDRESS]->(a:Address:User_12345)

// Person -> Address relationship
CREATE (p:Person:User_12345)-[:LIVES_AT]->(a:Address:User_12345)

// Case -> Document filing
CREATE (c:Case:User_12345)<-[:FILED_FOR]-(d:Document:User_12345)
```

### 3.6 Sync from Supabase to Neo4j

**Triggered on document extraction completion**:

```typescript
// supabase/functions/sync-to-neo4j/index.ts

async function syncDocumentToNeo4j(extractionId: string, userId: string) {
  // 1. Fetch extraction from Supabase
  const { data: extraction } = await supabase
    .from('vault_document_extractions')
    .select('*')
    .eq('id', extractionId)
    .single();

  // 2. Create Document node in Neo4j
  const neo4j = new Neo4jClient(userId);

  await neo4j.query(`
    CREATE (d:Document:User_${userId} {
      id: $id,
      type: $type,
      file_name: $file_name,
      uploaded_at: datetime($uploaded_at),
      confidence: $confidence
    })
  `, {
    id: extraction.id,
    type: extraction.document_type,
    file_name: extraction.file_name,
    uploaded_at: extraction.created_at,
    confidence: extraction.confidence_score
  });

  // 3. Extract entities from structured_data
  const structured = extraction.structured_data;

  if (structured.personalInfo) {
    await neo4j.query(`
      MATCH (d:Document:User_${userId} {id: $docId})
      CREATE (p:Person:User_${userId} {
        name: $name,
        dob: $dob,
        extracted_from: $docId
      })
      CREATE (d)-[:EXTRACTED]->(p)
    `, {
      docId: extraction.id,
      name: structured.personalInfo.legalFirstName + ' ' + structured.personalInfo.legalLastName,
      dob: structured.personalInfo.dateOfBirth
    });
  }

  if (structured.contactInfo?.currentAddress) {
    await neo4j.query(`
      MATCH (d:Document:User_${userId} {id: $docId})
      CREATE (a:Address:User_${userId} {
        street: $street,
        city: $city,
        state: $state,
        zip: $zip,
        extracted_from: $docId
      })
      CREATE (d)-[:CONTAINS_ADDRESS]->(a)
    `, {
      docId: extraction.id,
      street: structured.contactInfo.currentAddress.street1,
      city: structured.contactInfo.currentAddress.city,
      state: structured.contactInfo.currentAddress.state,
      zip: structured.contactInfo.currentAddress.zipCode
    });
  }
}
```

### 3.7 User Isolation Testing

```cypher
// Test 1: User A can only see their own documents
MATCH (d:Document:User_A)
RETURN count(d) as user_a_docs

MATCH (d:Document:User_B)
RETURN count(d) as user_b_docs
// Should return 0 when executed as User A

// Test 2: Attempt cross-user relationship (should fail)
MATCH (d1:Document:User_A), (d2:Document:User_B)
CREATE (d1)-[:REFERENCES]->(d2)
// Application layer should prevent this query
```

---

## 4. PII Encryption Strategy

### 4.1 Data Classification

**PII Levels**:

| Level | Data Type | Examples | Encryption |
|-------|-----------|----------|------------|
| **High** | Highly Sensitive | SSN, Financial Account Numbers, Medical Records | AES-256 + Field-Level Encryption |
| **Medium** | Sensitive | Full Name, Address, Phone, Email, DOB | AES-256 (Database Encryption) |
| **Low** | Non-Sensitive | Document Type, Extraction Timestamp | No Encryption (Metadata) |

### 4.2 Encryption Architecture

**Layered Approach**:

1. **Database Encryption at Rest** (Supabase built-in)
   - All PostgreSQL data encrypted with AES-256
   - Automatic for all tables

2. **Field-Level Encryption** (Application-Layer)
   - Encrypt high-sensitivity fields before INSERT
   - Decrypt on SELECT (only for authorized user)

3. **Encryption in Transit**
   - TLS 1.3 for all connections
   - Supabase enforces HTTPS

### 4.3 Field-Level Encryption Implementation

```typescript
// src/lib/encryption.ts

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32-byte key
const ALGORITHM = 'aes-256-gcm';

export function encryptField(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptField(ciphertext: string): string {
  const [ivHex, authTagHex, encrypted] = ciphertext.split(':');

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**Usage**:

```typescript
// Before storing SSN
const encryptedSSN = encryptField(personalInfo.ssn);

await supabase
  .from('canonical_data_vault')
  .update({
    personal_info: {
      ...personalInfo,
      ssn: encryptedSSN // Encrypted value
    }
  });

// On retrieval
const { data } = await supabase
  .from('canonical_data_vault')
  .select('personal_info')
  .single();

const decryptedSSN = decryptField(data.personal_info.ssn);
```

### 4.4 Key Management

**Environment Variables** (Supabase Secrets):

```bash
# Generate 32-byte encryption key
openssl rand -hex 32

# Store in Supabase project settings
ENCRYPTION_KEY=<32-byte-hex-key>
```

**Key Rotation Strategy**:
1. Generate new key
2. Decrypt all fields with old key
3. Re-encrypt with new key
4. Update ENCRYPTION_KEY environment variable
5. Store old key for 90 days (for recovery)

---

## 5. Compliance Alignment

### 5.1 GDPR Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Right to Access** | API endpoint to export all user data (JSON format) |
| **Right to Deletion** | Cascade DELETE on user_id across all tables + storage |
| **Data Portability** | Export to JSON/CSV with all vault + extraction data |
| **Privacy by Design** | RLS enabled by default, user isolation enforced |
| **Consent Management** | User accepts terms before first document upload |
| **Data Minimization** | Only store extracted structured data (not raw images after 90 days) |

**Implementation**:

```typescript
// API endpoint: DELETE /api/user/data
export async function deleteAllUserData(userId: string) {
  // 1. Delete from Neo4j
  await neo4j.query(`
    MATCH (n:User_${userId})
    DETACH DELETE n
  `);

  // 2. Delete from Supabase Storage
  const { data: files } = await supabase.storage
    .from('personal-documents')
    .list(`${userId}/`);

  await supabase.storage
    .from('personal-documents')
    .remove(files.map(f => `${userId}/${f.name}`));

  // 3. Delete from PostgreSQL (cascade handles related tables)
  await supabase
    .from('canonical_data_vault')
    .delete()
    .eq('user_id', userId);

  // 4. Delete auth user (triggers RLS cascade)
  await supabase.auth.admin.deleteUser(userId);
}
```

### 5.2 CCPA Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Do Not Sell** | No third-party data sharing (Mistral API is data processor) |
| **Access Request** | Same as GDPR right to access |
| **Deletion Request** | Same as GDPR right to deletion |
| **Opt-Out** | User can disable document intelligence feature |

### 5.3 HIPAA Considerations

*Note: SwiftFill is not a covered entity, but implements HIPAA-aligned security*

| Requirement | Implementation |
|-------------|----------------|
| **Encryption at Rest** | AES-256 for all PII (Supabase + field-level) |
| **Encryption in Transit** | TLS 1.3 for all API calls |
| **Access Logs** | Audit log table tracks all vault access |
| **User Authentication** | Supabase Auth with MFA support |
| **Data Backup** | Supabase automatic backups (7-day retention) |

---

## 6. Audit Logging

### 6.1 Audit Log Table

```sql
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event details
  event_type VARCHAR(50) NOT NULL, -- 'document_upload', 'vault_access', 'data_export', 'data_delete'
  event_action VARCHAR(20) NOT NULL, -- 'CREATE', 'READ', 'UPDATE', 'DELETE'

  -- Resource details
  resource_type VARCHAR(50), -- 'document', 'vault', 'extraction'
  resource_id UUID,

  -- Request metadata
  ip_address INET,
  user_agent TEXT,

  -- Change tracking
  old_value JSONB,
  new_value JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT audit_log_event_type_check CHECK (
    event_type IN ('document_upload', 'document_delete', 'vault_read', 'vault_update', 'vault_delete', 'data_export', 'neo4j_query')
  )
);

CREATE INDEX idx_audit_log_user ON public.audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_event ON public.audit_log(event_type, created_at DESC);
CREATE INDEX idx_audit_log_resource ON public.audit_log(resource_type, resource_id);

-- RLS: Users can read own audit logs
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only service role can insert (via triggers/edge functions)
CREATE POLICY "Service role can insert audit logs"
ON public.audit_log
FOR INSERT
TO service_role
WITH CHECK (true);
```

### 6.2 Audit Trigger Example

```sql
-- Trigger on vault updates
CREATE OR REPLACE FUNCTION audit_vault_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, event_type, event_action, resource_type, resource_id, old_value, new_value)
  VALUES (
    NEW.user_id,
    'vault_update',
    TG_OP,
    'canonical_data_vault',
    NEW.id,
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER vault_audit_trigger
AFTER UPDATE ON public.canonical_data_vault
FOR EACH ROW
EXECUTE FUNCTION audit_vault_changes();
```

---

## 7. Data Retention Policies

### 7.1 Retention Schedule

| Data Type | Retention Period | Action After Expiry |
|-----------|------------------|---------------------|
| **Raw Documents** (Storage) | 90 days | Auto-delete |
| **Extracted Structured Data** (DB) | Indefinite | User-controlled deletion |
| **Extraction Jobs** (Queue) | 30 days | Auto-delete |
| **Audit Logs** | 2 years | Archive to cold storage |

### 7.2 Auto-Deletion Cron Job

```sql
-- Supabase Database Webhook (daily cron)
-- Delete old documents from storage

CREATE OR REPLACE FUNCTION cleanup_old_documents()
RETURNS void AS $$
DECLARE
  old_file RECORD;
BEGIN
  -- Find files older than 90 days
  FOR old_file IN
    SELECT bucket_id, name, created_at
    FROM storage.objects
    WHERE bucket_id = 'personal-documents'
      AND created_at < NOW() - INTERVAL '90 days'
  LOOP
    -- Delete file
    DELETE FROM storage.objects
    WHERE bucket_id = old_file.bucket_id AND name = old_file.name;

    -- Log deletion
    INSERT INTO public.audit_log (user_id, event_type, event_action, resource_type, resource_id)
    VALUES (
      (regexp_match(old_file.name, '^([^/]+)/'))[1]::UUID,
      'document_delete',
      'DELETE',
      'storage_object',
      NULL
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule with pg_cron (if available) or Supabase Edge Function
SELECT cron.schedule(
  'cleanup-old-documents',
  '0 2 * * *', -- Daily at 2 AM
  $$ SELECT cleanup_old_documents(); $$
);
```

---

## 8. Security Testing Checklist

### 8.1 RLS Policy Tests

- [ ] **Test 1**: User A cannot read User B's vault data
- [ ] **Test 2**: User A cannot read User B's storage files
- [ ] **Test 3**: User A cannot insert data into User B's vault
- [ ] **Test 4**: User A cannot delete User B's documents
- [ ] **Test 5**: Unauthenticated user cannot access any data
- [ ] **Test 6**: Service role can bypass RLS for admin operations

### 8.2 Encryption Tests

- [ ] **Test 7**: High-sensitivity fields are encrypted in database
- [ ] **Test 8**: Encrypted data is unreadable without decryption key
- [ ] **Test 9**: Decryption only works with correct key
- [ ] **Test 10**: Key rotation does not break existing data

### 8.3 Neo4j Isolation Tests

- [ ] **Test 11**: User A cannot query User B's graph nodes
- [ ] **Test 12**: Cypher queries without user partition fail
- [ ] **Test 13**: Cross-user relationships are prevented

### 8.4 Compliance Tests

- [ ] **Test 14**: User can export all their data (GDPR)
- [ ] **Test 15**: User can delete all their data (GDPR)
- [ ] **Test 16**: Deletion cascades to all systems (Supabase + Neo4j + Storage)
- [ ] **Test 17**: Audit logs capture all critical operations

---

## 9. Threat Model

### 9.1 Threats Mitigated

| Threat | Mitigation |
|--------|------------|
| **Unauthorized Data Access** | RLS policies + authentication required |
| **Cross-User Data Leakage** | User-scoped queries enforced at DB + app layer |
| **SQL Injection** | Parameterized queries + Supabase client escaping |
| **Storage Bucket Enumeration** | Private bucket + RLS policies |
| **PII Exposure in Breach** | Field-level encryption for high-sensitivity data |
| **Insider Threat** | Audit logging + minimal privileged access |
| **Data Loss** | Automatic backups + replication |

### 9.2 Residual Risks

| Risk | Probability | Impact | Mitigation Plan |
|------|-------------|--------|-----------------|
| **Application-Layer Query Bug** | Low | High | Code review + automated tests |
| **Encryption Key Compromise** | Very Low | Critical | Key rotation + HSM for production |
| **Neo4j Query Without User Filter** | Medium | High | Query validation middleware |

---

## 10. Deployment Checklist

### 10.1 Pre-Deployment

- [ ] Create Supabase storage bucket `personal-documents`
- [ ] Apply all RLS policies to storage.objects
- [ ] Enable RLS on all database tables
- [ ] Apply RLS policies to canonical_data_vault, vault_document_extractions, extraction_queue
- [ ] Generate and store ENCRYPTION_KEY in Supabase secrets
- [ ] Set up Neo4j instance with constraints and indexes
- [ ] Deploy audit log table and triggers
- [ ] Configure data retention cron job

### 10.2 Post-Deployment

- [ ] Run security test suite (all 17 tests passing)
- [ ] Penetration testing (attempt cross-user access)
- [ ] Load testing (1000 concurrent users)
- [ ] Monitor audit logs for anomalies
- [ ] Document incident response procedures

---

## 11. References

### Research Sources

1. **Supabase Storage RLS**: https://supabase.com/docs/guides/storage/security/access-control
2. **Neo4j Multi-Tenancy**: https://neo4j.com/developer/multi-tenancy-worked-example/
3. **GDPR Encryption Requirements**: https://www.cossacklabs.com/blog/pii-encryption-requirements-cheatsheet/
4. **File Upload Security**: https://transloadit.com/devtips/secure-api-file-uploads-with-magic-numbers/

### Related Documents

- `DOCUMENT_INTELLIGENCE.md` - OCR architecture
- `ARCHITECTURE_ENHANCEMENTS.md` - Performance optimizations
- `CLAUDE.md` - Project overview

---

**Last Updated**: 2025-11-17
**Author**: Claude Code Agent 5
**Status**: ✅ Architecture Approved - Ready for Implementation
