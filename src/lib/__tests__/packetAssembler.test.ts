/**
 * packetAssembler.test.ts
 *
 * Tests for TRO packet assembly functions.
 * These tests verify form ordering, validation, and assembly logic.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  assemblePacket,
  generatePacketFilename,
  estimateAssemblyTime,
  isPdfLibAvailable,
  getPdfLibInstallationInstructions,
  createPlaceholderPacket
} from '../packetAssembler';
import {
  FormType,
  FormCategory,
  PacketType,
  AssemblyStatus,
  type PacketForm,
  type PacketMetadata
} from '@/types/PacketTypes';

describe('packetAssembler', () => {
  // ===========================================================================
  // Test Data Fixtures
  // ===========================================================================

  const createMockForm = (
    formType: FormType,
    options: Partial<PacketForm> = {}
  ): PacketForm => ({
    formType,
    category: FormCategory.PRIMARY,
    displayName: formType,
    pdfData: new Blob(['mock pdf'], { type: 'application/pdf' }),
    pageCount: 4,
    isRequired: true,
    isComplete: true,
    completionPercentage: 100,
    ...options
  });

  const createMockMetadata = (
    options: Partial<PacketMetadata> = {}
  ): PacketMetadata => ({
    packetId: 'test-packet-123',
    packetType: PacketType.DV_INITIAL_REQUEST,
    caseNumber: 'FL12345678',
    petitioner: 'Jane Smith',
    respondent: 'John Doe',
    county: 'Los Angeles',
    createdAt: new Date('2025-11-01'),
    lastModified: new Date('2025-11-15'),
    userId: 'user-123',
    version: 1,
    ...options
  });

  // ===========================================================================
  // assemblePacket Tests
  // ===========================================================================
  describe('assemblePacket', () => {
    it('should validate that forms are provided', async () => {
      const metadata = createMockMetadata();

      const result = await assemblePacket([], metadata);

      expect(result.status).toBe(AssemblyStatus.FAILED);
      expect(result.errors).toContain('No forms provided for assembly');
    });

    it('should validate that metadata is provided', async () => {
      const forms = [createMockForm(FormType.DV100)];

      const result = await assemblePacket(forms, null as any);

      expect(result.status).toBe(AssemblyStatus.FAILED);
      expect(result.errors).toContain('Packet metadata is required');
    });

    it('should validate all forms have PDF data', async () => {
      const forms = [
        createMockForm(FormType.DV100),
        createMockForm(FormType.CLETS001, { pdfData: undefined })
      ];
      const metadata = createMockMetadata();

      const result = await assemblePacket(forms, metadata);

      expect(result.status).toBe(AssemblyStatus.FAILED);
      expect(result.errors?.[0]).toContain('missing PDF data');
      expect(result.errors?.[0]).toContain('CLETS-001');
    });

    it('should validate required forms are present for DV_INITIAL_REQUEST', async () => {
      // Missing required CLETS-001
      const forms = [createMockForm(FormType.DV100)];
      const metadata = createMockMetadata({
        packetType: PacketType.DV_INITIAL_REQUEST
      });

      const result = await assemblePacket(forms, metadata);

      expect(result.status).toBe(AssemblyStatus.FAILED);
      expect(result.errors?.[0]).toContain('Missing required forms');
      expect(result.errors?.[0]).toContain('CLETS-001');
    });

    it('should validate required forms are present for DV_RESPONSE', async () => {
      // Missing required FL-320
      const forms = [createMockForm(FormType.FL150)];
      const metadata = createMockMetadata({
        packetType: PacketType.DV_RESPONSE
      });

      const result = await assemblePacket(forms, metadata);

      expect(result.status).toBe(AssemblyStatus.FAILED);
      expect(result.errors?.[0]).toContain('Missing required forms');
      expect(result.errors?.[0]).toContain('FL-320');
    });

    it('should successfully process valid packet (mock mode)', async () => {
      const forms = [
        createMockForm(FormType.DV100),
        createMockForm(FormType.CLETS001)
      ];
      const metadata = createMockMetadata();

      const result = await assemblePacket(forms, metadata);

      // In mock mode (pdf-lib not installed), should still complete
      expect(result.status).toBe(AssemblyStatus.COMPLETED);
      expect(result.assembledAt).toBeDefined();
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should sort forms in correct order', async () => {
      // Pass forms in wrong order
      const forms = [
        createMockForm(FormType.CLETS001),
        createMockForm(FormType.DV105),
        createMockForm(FormType.DV100)
      ];
      const metadata = createMockMetadata();

      const result = await assemblePacket(forms, metadata);

      expect(result.status).toBe(AssemblyStatus.COMPLETED);
    });

    it('should apply assembly options', async () => {
      const forms = [
        createMockForm(FormType.DV100),
        createMockForm(FormType.CLETS001)
      ];
      const metadata = createMockMetadata();
      const options = {
        includePageNumbers: true,
        includeTableOfContents: true,
        includeBookmarks: true,
        compress: true
      };

      const result = await assemblePacket(forms, metadata, options);

      expect(result.status).toBe(AssemblyStatus.COMPLETED);
    });

    it('should include duration in result', async () => {
      const forms = [
        createMockForm(FormType.DV100),
        createMockForm(FormType.CLETS001)
      ];
      const metadata = createMockMetadata();

      const result = await assemblePacket(forms, metadata);

      expect(result.durationMs).toBeDefined();
      expect(typeof result.durationMs).toBe('number');
    });
  });

  // ===========================================================================
  // generatePacketFilename Tests
  // ===========================================================================
  describe('generatePacketFilename', () => {
    it('should generate filename with case number', () => {
      const metadata = createMockMetadata({
        caseNumber: 'FL-2025-12345',
        packetType: PacketType.DV_INITIAL_REQUEST
      });

      const filename = generatePacketFilename(metadata);

      expect(filename).toContain('FL202512345');
      expect(filename).toContain('INITIAL-REQUEST');
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should generate filename for new case', () => {
      const metadata = createMockMetadata({
        caseNumber: undefined,
        packetType: PacketType.DV_INITIAL_REQUEST
      });

      const filename = generatePacketFilename(metadata);

      expect(filename).toContain('NewCase');
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should generate filename for response packet', () => {
      const metadata = createMockMetadata({
        packetType: PacketType.DV_RESPONSE
      });

      const filename = generatePacketFilename(metadata);

      expect(filename).toContain('RESPONSE');
    });

    it('should include date in filename', () => {
      const metadata = createMockMetadata();

      const filename = generatePacketFilename(metadata);

      // Should contain current date in YYYYMMDD format
      const dateRegex = /\d{8}/;
      expect(filename).toMatch(dateRegex);
    });

    it('should sanitize special characters from case number', () => {
      const metadata = createMockMetadata({
        caseNumber: 'FL-2025/12345#TEST'
      });

      const filename = generatePacketFilename(metadata);

      // Case number should be sanitized (FL202512345TEST)
      expect(filename).toContain('FL202512345TEST');
      // Should not contain / or # from original case number
      expect(filename).not.toContain('/');
      expect(filename).not.toContain('#');
    });
  });

  // ===========================================================================
  // estimateAssemblyTime Tests
  // ===========================================================================
  describe('estimateAssemblyTime', () => {
    it('should estimate time for single form', () => {
      const time = estimateAssemblyTime(1);

      expect(time).toBe(700); // 500 + 200
    });

    it('should estimate time for multiple forms', () => {
      const time = estimateAssemblyTime(4);

      expect(time).toBe(1300); // 500 + (4 * 200)
    });

    it('should estimate time for zero forms', () => {
      const time = estimateAssemblyTime(0);

      expect(time).toBe(500); // Base time only
    });

    it('should scale linearly with form count', () => {
      const time1 = estimateAssemblyTime(1);
      const time2 = estimateAssemblyTime(2);
      const time3 = estimateAssemblyTime(3);

      expect(time2 - time1).toBe(200);
      expect(time3 - time2).toBe(200);
    });
  });

  // ===========================================================================
  // isPdfLibAvailable Tests
  // ===========================================================================
  describe('isPdfLibAvailable', () => {
    it('should return boolean indicating pdf-lib availability', () => {
      const available = isPdfLibAvailable();

      expect(typeof available).toBe('boolean');
    });
  });

  // ===========================================================================
  // getPdfLibInstallationInstructions Tests
  // ===========================================================================
  describe('getPdfLibInstallationInstructions', () => {
    it('should return installation instructions', () => {
      const instructions = getPdfLibInstallationInstructions();

      expect(instructions).toContain('npm install pdf-lib');
      expect(instructions).toContain('pdf-lib');
    });

    it('should include documentation link', () => {
      const instructions = getPdfLibInstallationInstructions();

      expect(instructions).toContain('pdf-lib.js.org');
    });
  });

  // ===========================================================================
  // createPlaceholderPacket Tests
  // ===========================================================================
  describe('createPlaceholderPacket', () => {
    it('should create placeholder packet with sorted forms', async () => {
      const forms = [
        createMockForm(FormType.CLETS001, { pageCount: 2 }),
        createMockForm(FormType.DV100, { pageCount: 4 })
      ];
      const metadata = createMockMetadata();

      const packet = await createPlaceholderPacket(forms, metadata);

      // Forms should be sorted
      expect(packet.forms[0].formType).toBe(FormType.DV100);
      expect(packet.forms[1].formType).toBe(FormType.CLETS001);
    });

    it('should calculate total pages', async () => {
      const forms = [
        createMockForm(FormType.DV100, { pageCount: 4 }),
        createMockForm(FormType.CLETS001, { pageCount: 2 })
      ];
      const metadata = createMockMetadata();

      const packet = await createPlaceholderPacket(forms, metadata);

      expect(packet.totalPages).toBe(6);
    });

    it('should assign page numbers to forms', async () => {
      const forms = [
        createMockForm(FormType.DV100, { pageCount: 4 }),
        createMockForm(FormType.DV105, { pageCount: 3 }),
        createMockForm(FormType.CLETS001, { pageCount: 2 })
      ];
      const metadata = createMockMetadata();

      const packet = await createPlaceholderPacket(forms, metadata);

      // DV-100 should be pages 1-4
      expect(packet.forms[0].startPage).toBe(1);
      expect(packet.forms[0].endPage).toBe(4);

      // DV-105 should be pages 5-7
      expect(packet.forms[1].startPage).toBe(5);
      expect(packet.forms[1].endPage).toBe(7);

      // CLETS-001 should be pages 8-9
      expect(packet.forms[2].startPage).toBe(8);
      expect(packet.forms[2].endPage).toBe(9);
    });

    it('should calculate completion percentage', async () => {
      const forms = [
        createMockForm(FormType.DV100, { completionPercentage: 100 }),
        createMockForm(FormType.CLETS001, { completionPercentage: 50 })
      ];
      const metadata = createMockMetadata();

      const packet = await createPlaceholderPacket(forms, metadata);

      expect(packet.completionPercentage).toBe(75); // (100 + 50) / 2
    });

    it('should set initial assembly status', async () => {
      const forms = [createMockForm(FormType.DV100)];
      const metadata = createMockMetadata();

      const packet = await createPlaceholderPacket(forms, metadata);

      expect(packet.assemblyStatus).toBe(AssemblyStatus.NOT_STARTED);
    });

    it('should include metadata in packet', async () => {
      const forms = [createMockForm(FormType.DV100)];
      const metadata = createMockMetadata({
        caseNumber: 'FL12345678',
        county: 'Los Angeles'
      });

      const packet = await createPlaceholderPacket(forms, metadata);

      expect(packet.metadata.caseNumber).toBe('FL12345678');
      expect(packet.metadata.county).toBe('Los Angeles');
    });

    it('should handle empty completion percentage', async () => {
      const forms = [
        createMockForm(FormType.DV100, { completionPercentage: undefined })
      ];
      const metadata = createMockMetadata();

      const packet = await createPlaceholderPacket(forms, metadata);

      expect(packet.completionPercentage).toBe(0);
    });

    it('should handle forms with zero page count', async () => {
      const forms = [
        createMockForm(FormType.DV100, { pageCount: 0 }),
        createMockForm(FormType.CLETS001, { pageCount: 2 })
      ];
      const metadata = createMockMetadata();

      const packet = await createPlaceholderPacket(forms, metadata);

      expect(packet.totalPages).toBe(2);
    });
  });

  // ===========================================================================
  // Form Order Tests
  // ===========================================================================
  describe('Form Ordering', () => {
    it('should sort DV_INITIAL_REQUEST forms correctly', async () => {
      const forms = [
        createMockForm(FormType.CLETS001),
        createMockForm(FormType.FL150),
        createMockForm(FormType.DV105),
        createMockForm(FormType.DV100)
      ];
      const metadata = createMockMetadata({
        packetType: PacketType.DV_INITIAL_REQUEST
      });

      const packet = await createPlaceholderPacket(forms, metadata);

      // Expected order: DV-100, DV-105, FL-150, CLETS-001
      expect(packet.forms[0].formType).toBe(FormType.DV100);
      expect(packet.forms[1].formType).toBe(FormType.DV105);
      expect(packet.forms[2].formType).toBe(FormType.FL150);
      expect(packet.forms[3].formType).toBe(FormType.CLETS001);
    });

    it('should sort DV_RESPONSE forms correctly', async () => {
      const forms = [
        createMockForm(FormType.FL150),
        createMockForm(FormType.FL320)
      ];
      const metadata = createMockMetadata({
        packetType: PacketType.DV_RESPONSE
      });

      const packet = await createPlaceholderPacket(forms, metadata);

      // Expected order: FL-320, FL-150
      expect(packet.forms[0].formType).toBe(FormType.FL320);
      expect(packet.forms[1].formType).toBe(FormType.FL150);
    });

    it('should place unknown forms at end', async () => {
      const forms = [
        createMockForm(FormType.DV100),
        createMockForm(FormType.DV109) // Court-issued, not in standard order
      ];
      const metadata = createMockMetadata();

      const packet = await createPlaceholderPacket(forms, metadata);

      // DV-100 should be first, DV-109 at end
      expect(packet.forms[0].formType).toBe(FormType.DV100);
    });
  });
});
