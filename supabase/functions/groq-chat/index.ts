import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, formContext } = await req.json();
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    console.log('Received chat request with', messages.length, 'messages');
    console.log('Form context provided:', !!formContext);

    // Build system prompt with form context
    let systemPrompt = `You are SwiftFill Pro AI, an intelligent legal form assistant. You help users fill out California legal forms accurately and efficiently.

You have access to the user's current form data and can help them with:
- Understanding form requirements
- Filling out fields correctly
- Providing legal guidance for California family law
- Calculating values and dates
- Formatting information properly`;

    if (formContext) {
      systemPrompt += `\n\nCurrent form data:\n${JSON.stringify(formContext, null, 2)}`;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2-instruct-0905',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in groq-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
