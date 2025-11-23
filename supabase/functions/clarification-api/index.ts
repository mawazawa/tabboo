import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ClarificationEngine } from "../../../src/lib/ai/clarification-engine.ts";
import neo4j from "https://esm.sh/neo4j-driver@5.12.0";

// A placeholder for a real Neo4j client implementation
const neo4jDriver = neo4j.driver(
  Deno.env.get("NEO4J_URI")!,
  neo4j.auth.basic(
    Deno.env.get("NEO4J_USERNAME")!,
    Deno.env.get("NEO4J_PASSWORD")!
  )
);

// A simple CORS header utility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * The main server function for the clarification API.
 * It handles GET requests to fetch candidates and POST requests to submit answers.
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // This is a simplified way to get the user ID.
    // In a real application, you would get this from the JWT token.
    const userId = "user_12345"; // Placeholder user ID

    if (req.method === 'GET') {
      // --- Fetch Clarification Candidates ---
      const session = neo4jDriver.session();
      try {
        const engine = new ClarificationEngine(userId, session);
        const candidates = await engine.generateCandidates();
        
        return new Response(JSON.stringify(candidates), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } finally {
        await session.close();
      }

    } else if (req.method === 'POST') {
      // --- Submit an Answer ---
      const body = await req.json();
      const { candidateId, answer } = body;

      if (!candidateId || !answer) {
        return new Response(JSON.stringify({ error: 'Missing candidateId or answer' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Process the answer and update the Neo4j graph
      const { recalibrate } = body;
      console.log(`Processing answer for candidate ${candidateId}: ${answer} (recalibrate: ${recalibrate})`);

      const session = neo4jDriver.session();
      try {
        // Parse candidate ID to determine type and nodes
        // Format: "type-nodeId1-nodeId2" e.g., "dup-person-1-2"
        const [type, ...nodeIds] = candidateId.split('-');

        if (type === 'dup') {
          // Handle duplicate detection resolution
          if (answer.toLowerCase().includes('same')) {
            // Merge duplicate nodes
            await session.run(`
              MATCH (n1) WHERE id(n1) = $id1
              MATCH (n2) WHERE id(n2) = $id2
              WITH n1, n2
              SET n1 += properties(n2)
              WITH n1, n2
              MATCH (n2)-[r]->(m)
              CREATE (n1)-[r2:MERGED_FROM]->(m)
              SET r2 = properties(r)
              WITH n1, n2
              DETACH DELETE n2
              RETURN n1
            `, { id1: parseInt(nodeIds[1]), id2: parseInt(nodeIds[2]) });
          } else if (answer.toLowerCase().includes('different')) {
            // Mark as distinct (create relationship to prevent future matching)
            await session.run(`
              MATCH (n1) WHERE id(n1) = $id1
              MATCH (n2) WHERE id(n2) = $id2
              MERGE (n1)-[:DISTINCT_FROM]->(n2)
            `, { id1: parseInt(nodeIds[1]), id2: parseInt(nodeIds[2]) });
          }
          // "related but different" - no action needed, just log
        } else if (type === 'amb') {
          // Handle ambiguous data resolution
          // Update node with confirmed/corrected data based on answer
          if (answer.toLowerCase() === 'yes') {
            await session.run(`
              MATCH (n) WHERE id(n) = $id
              SET n.confirmed = true, n.confirmed_at = datetime()
            `, { id: parseInt(nodeIds[1]) });
          } else if (answer.toLowerCase() === 'no') {
            await session.run(`
              MATCH (n) WHERE id(n) = $id
              SET n.confirmed = false, n.needs_review = true
            `, { id: parseInt(nodeIds[1]) });
          }
          // "previous address" - mark as historical
        }

        // Log the resolution for audit
        await session.run(`
          CREATE (r:ClarificationResolution {
            candidate_id: $candidateId,
            answer: $answer,
            user_id: $userId,
            resolved_at: datetime(),
            recalibrated: $recalibrate
          })
        `, { candidateId, answer, userId, recalibrate: recalibrate || false });

        // If recalibrate flag is set, trigger recalibration engine
        if (recalibrate) {
          console.log('Triggering recalibration engine for user:', userId);
          // In a full implementation, this would trigger the RecalibrationEngine
          // to update related data across all forms
        }

      } finally {
        await session.close();
      }

      return new Response(JSON.stringify({ success: true, message: "Answer processed and graph updated" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

console.log(`Clarification API function running...`);