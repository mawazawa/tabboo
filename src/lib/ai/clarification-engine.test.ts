import { describe, it, expect, vi } from 'vitest';
import { ClarificationEngine } from './clarification-engine';

// Mock Neo4jClient
const mockNeo4jClient = {
  query: vi.fn(),
};

describe('ClarificationEngine', () => {
  const userId = 'test_user_123';
  
  it('should generate a candidate for potential duplicate persons', async () => {
    // Arrange
    const mockResponse = [
      { name1: 'Jon Smith', id1: 1, name2: 'John Smith', id2: 2 },
    ];
    mockNeo4jClient.query.mockResolvedValue(mockResponse);
    const engine = new ClarificationEngine(userId, mockNeo4jClient as any);

    // Act
    const candidates = await engine.generateCandidates();

    // Assert
    const duplicatePersonCandidate = candidates.find(c => c.type === 'DUPLICATE_PERSON');
    expect(duplicatePersonCandidate).toBeDefined();
    expect(duplicatePersonCandidate?.question).toBe('Are "Jon Smith" and "John Smith" the same person?');
    expect(mockNeo4jClient.query).toHaveBeenCalledWith(expect.stringContaining('levenshteinDistance'));
  });

  it('should generate a candidate for an ambiguous address', async () => {
    // Arrange
    const mockResponse = [
      { personName: 'Jane Doe', personId: 3, street: '123 Main St', addressId: 4 },
    ];
    // Mock different responses for different queries
    mockNeo4jClient.query
      .mockResolvedValueOnce([]) // for duplicate persons
      .mockResolvedValueOnce(mockResponse); // for ambiguous addresses

    const engine = new ClarificationEngine(userId, mockNeo4jClient as any);

    // Act
    const candidates = await engine.generateCandidates();

    // Assert
    const ambiguousAddressCandidate = candidates.find(c => c.type === 'AMBIGUOUS_ADDRESS');
    expect(ambiguousAddressCandidate).toBeDefined();
    expect(ambiguousAddressCandidate?.question).toBe('Does Jane Doe live at 123 Main St?');
    expect(mockNeo4jClient.query).toHaveBeenCalledWith(expect.stringContaining('[:CONTAINS_ADDRESS]'));
  });

  it('should generate a candidate for a low-confidence extraction', async () => {
    // Arrange
    const mockResponse = [
      { docId: 5, docType: 'Form W-2', confidence: 0.75 },
    ];
    mockNeo4jClient.query
      .mockResolvedValueOnce([]) // duplicate persons
      .mockResolvedValueOnce([]) // ambiguous addresses
      .mockResolvedValueOnce(mockResponse); // low confidence

    const engine = new ClarificationEngine(userId, mockNeo4jClient as any);

    // Act
    const candidates = await engine.generateCandidates();
      
    // Assert
    const lowConfidenceCandidate = candidates.find(c => c.type === 'LOW_CONFIDENCE_EXTRACTION');
    expect(lowConfidenceCandidate).toBeDefined();
    expect(lowConfidenceCandidate?.question).toContain('low confidence (75%)');
    expect(mockNeo4jClient.query).toHaveBeenCalledWith(expect.stringContaining('d.confidence < 0.8'));
  });

  it('should return an empty array if no candidates are found', async () => {
    // Arrange
    mockNeo4jClient.query.mockResolvedValue([]); // All queries return empty
    const engine = new ClarificationEngine(userId, mockNeo4jClient as any);

    // Act
    const candidates = await engine.generateCandidates();

    // Assert
    expect(candidates).toHaveLength(0);
  });
});
