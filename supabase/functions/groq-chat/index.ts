import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(4000)
    })
  ).min(1).max(50),
  formContext: z.record(
    z.string().max(500)
  ).optional().refine(
    (ctx) => !ctx || Object.keys(ctx).length <= 50,
    { message: 'Form context too large' }
  ).refine(
    (ctx) => {
      if (!ctx) return true;
      const size = JSON.stringify(ctx).length;
      return size <= 10000;
    },
    { message: 'Form context payload exceeds 10KB' }
  )
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and parse request body
    const body = await req.json();
    const validated = chatRequestSchema.parse(body);
    const { messages, formContext } = validated;
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    console.log('Received chat request with', messages.length, 'messages');
    
    if (formContext) {
      const sanitized = Object.keys(formContext).reduce((acc, key) => {
        acc[key] = formContext[key]?.toString().substring(0, 100) || '';
        return acc;
      }, {} as Record<string, string>);
      console.log('Form context fields:', Object.keys(sanitized));
    }

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

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // Try Groq first
    let response: Response | null = null;
    let usingFallback = false;

    if (GROQ_API_KEY) {
      console.log('Attempting Groq API with model: llama-3.3-70b-versatile');
      
      try {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: chatMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Groq API error:', { status: response.status, error: errorText });
          response = null; // Will trigger fallback
        } else {
          console.log('✓ Groq API successful');
        }
      } catch (error) {
        console.error('Groq API exception:', error);
        response = null;
      }
    }

    // Fallback to Lovable AI (Google Gemini Flash 2.5)
    if (!response && LOVABLE_API_KEY) {
      console.log('Falling back to Lovable AI (Google Gemini Flash 2.5)');
      usingFallback = true;

      try {
        response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: chatMessages,
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Lovable AI error:', { status: response.status, error: errorText });
          
          if (response.status === 429) {
            return new Response(
              JSON.stringify({ error: 'Rate limit exceeded on fallback service. Please try again in a moment.' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          return new Response(
            JSON.stringify({ error: 'Both AI services unavailable', details: errorText.substring(0, 200) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('✓ Lovable AI (Gemini Flash 2.5) successful');
      } catch (error) {
        console.error('Lovable AI exception:', error);
        return new Response(
          JSON.stringify({ error: 'All AI services failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!response) {
      return new Response(
        JSON.stringify({ error: 'No AI service available. Please check API keys.' }),
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
        'X-AI-Provider': usingFallback ? 'lovable-gemini' : 'groq-llama',
      },
    });
  } catch (error) {
    console.error('Error in groq-chat function:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name || 'Unknown'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
