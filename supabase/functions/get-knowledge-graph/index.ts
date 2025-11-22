import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import neo4j from "https://esm.sh/neo4j-driver@5.12.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify Supabase Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // 2. Connect to Neo4j
    const neo4jUri = Deno.env.get('NEO4J_URI');
    const neo4jUser = Deno.env.get('NEO4J_USERNAME');
    const neo4jPassword = Deno.env.get('NEO4J_PASSWORD');

    if (!neo4jUri || !neo4jUser || !neo4jPassword) {
      console.error("Missing Neo4j credentials");
      // Fallback to mock data if credentials are missing (for demo/dev)
      return new Response(JSON.stringify({
        nodes: [
          { id: "Root", label: "Project", color: "#ff0000" },
          { id: "Gemini", label: "Agent", color: "#00ff00" },
          { id: "Claude", label: "Agent", color: "#0000ff" }
        ],
        links: [
          { source: "Root", target: "Gemini" },
          { source: "Root", target: "Claude" }
        ],
        warning: "Neo4j credentials not set. Using mock data."
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const driver = neo4j.driver(
      neo4jUri,
      neo4j.auth.basic(neo4jUser, neo4jPassword)
    );

    const session = driver.session();

    // 3. Query Graph
    // Limit to 1000 nodes to prevent exploding the browser
    const result = await session.run(`
      MATCH (n)-[r]->(m)
      RETURN n, r, m
      LIMIT 500
    `);

    const nodes = new Map();
    const links = [];

    result.records.forEach(record => {
      const n = record.get('n');
      const m = record.get('m');
      const r = record.get('r');

      if (!nodes.has(n.identity.toString())) {
        nodes.set(n.identity.toString(), {
          id: n.identity.toString(),
          label: n.labels[0] || 'Node',
          properties: n.properties,
          val: 5 // Size
        });
      }

      if (!nodes.has(m.identity.toString())) {
        nodes.set(m.identity.toString(), {
          id: m.identity.toString(),
          label: m.labels[0] || 'Node',
          properties: m.properties,
          val: 5
        });
      }

      links.push({
        source: n.identity.toString(),
        target: m.identity.toString(),
        label: r.type
      });
    });

    await session.close();
    await driver.close();

    return new Response(JSON.stringify({
      nodes: Array.from(nodes.values()),
      links: links
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

