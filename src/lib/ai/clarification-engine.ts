// NOTE: This is a placeholder for the Neo4j client.
// A proper implementation would be imported.
interface Neo4jClient {
  query(cypher: string, params?: any): Promise<any>;
}

/**
 * Represents a candidate for user clarification.
 */
export interface ClarificationCandidate {
  id: string;
  question: string;
  suggestedAnswers: string[];
  importance: number; // A score from 1-10
  type: 'DUPLICATE_PERSON' | 'AMBIGUOUS_ADDRESS' | 'LOW_CONFIDENCE_EXTRACTION';
  metadata: Record<string, any>; // To store node IDs, etc.
}

/**
 * The ClarificationEngine is responsible for identifying areas of uncertainty
 * in the user's knowledge graph and generating questions to resolve them.
 */
export class ClarificationEngine {
  private neo4jClient: Neo4jClient;
  private userId: string;

  constructor(userId: string, neo4jClient: Neo4jClient) {
    this.userId = userId;
    this.neo4jClient = neo4jClient;
  }

  /**
   * Generates a list of clarification candidates by running various checks
   * against the knowledge graph.
   * @returns A promise that resolves to an array of sorted ClarificationCandidate objects.
   */
  public async generateCandidates(): Promise<ClarificationCandidate[]> {
    const candidates: ClarificationCandidate[] = [];

    // Run all finder methods in parallel for efficiency
    const [
      duplicatePersons,
      ambiguousAddresses,
      lowConfidenceExtractions,
    ] = await Promise.all([
      this.findPotentialDuplicatePersons(),
      this.findAmbiguousAddresses(),
      this.findLowConfidenceExtractions(),
    ]);

    candidates.push(...duplicatePersons, ...ambiguousAddresses, ...lowConfidenceExtractions);

    // Sort candidates by importance, descending
    const sortedCandidates = candidates.sort((a, b) => b.importance - a.importance);
    
    return sortedCandidates;
  }

  /**
   * Finds pairs of Person nodes with similar names that are not connected.
   * This suggests they might be duplicates.
   */
  private async findPotentialDuplicatePersons(): Promise<ClarificationCandidate[]> {
    // This query uses the APOC procedure for Levenshtein distance to find similar names.
    // It looks for pairs of Persons where names are very close (distance < 3) but they
    // are not already linked in any way.
    const query = `
      MATCH (p1:Person:User_${this.userId}), (p2:Person:User_${this.userId})
      WHERE id(p1) < id(p2)
        AND apoc.text.levenshteinDistance(p1.name, p2.name) > 0
        AND apoc.text.levenshteinDistance(p1.name, p2.name) < 3
        AND NOT (p1)-[]-(p2)
      RETURN p1.name AS name1, id(p1) AS id1, p2.name AS name2, id(p2) AS id2
      LIMIT 5
    `;

    try {
      const results = await this.neo4jClient.query(query);
      return results.map((record: any) => ({
        id: `dup-person-${record.id1}-${record.id2}`,
        question: `Are "${record.name1}" and "${record.name2}" the same person?`,
        suggestedAnswers: ['Yes, they are the same', 'No, they are different people', 'They are related, but different'],
        importance: 8,
        type: 'DUPLICATE_PERSON',
        metadata: { node1_id: record.id1, node2_id: record.id2 },
      }));
    } catch (error) {
      console.error('Error finding duplicate persons:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Finds Person and Address nodes that were extracted from the same Document
   * but do not have a direct :LIVES_AT relationship.
   */
  private async findAmbiguousAddresses(): Promise<ClarificationCandidate[]> {
    // This query identifies a common pattern: a Person and Address are extracted from
    // the same source document but the AI wasn't confident enough to create a :LIVES_AT link.
    const query = `
      MATCH (p:Person:User_${this.userId})<-[:EXTRACTED]-(d:Document:User_${this.userId})-[:CONTAINS_ADDRESS]->(a:Address:User_${this.userId})
      WHERE NOT (p)-[:LIVES_AT]->(a)
      RETURN p.name AS personName, id(p) as personId, a.street AS street, id(a) as addressId
      LIMIT 5
    `;

    try {
      const results = await this.neo4jClient.query(query);
      return results.map((record: any) => ({
        id: `amb-addr-${record.personId}-${record.addressId}`,
        question: `Does ${record.personName} live at ${record.street}?`,
        suggestedAnswers: ['Yes', 'No', "It's a previous address"],
        importance: 6,
        type: 'AMBIGUOUS_ADDRESS',
        metadata: { personId: record.personId, addressId: record.addressId },
      }));
    } catch (error) {
      console.error('Error finding ambiguous addresses:', error);
      return [];
    }
  }

  /**
   * Finds Document nodes where the extraction confidence was low.
   */
  private async findLowConfidenceExtractions(): Promise<ClarificationCandidate[]> {
    const query = `
      MATCH (d:Document:User_${this.userId})
      WHERE d.confidence < 0.8
      RETURN d.id as docId, d.type as docType, d.confidence as confidence
      ORDER BY d.confidence ASC
      LIMIT 5
    `;

    try {
      const results = await this.neo4jClient.query(query);
      return results.map((record: any) => ({
        id: `low-conf-${record.docId}`,
        question: `I extracted data from the document "${record.docType}" with low confidence (${Math.round(record.confidence * 100)}%). Would you like to review it?`,
        suggestedAnswers: ['Yes, review now', 'Remind me later', 'Ignore'],
        importance: 5,
        type: 'LOW_CONFIDENCE_EXTRACTION',
        metadata: { docId: record.docId },
      }));
    } catch (error) {
      console.error('Error finding low confidence extractions:', error);
      return [];
    }
  }
}
