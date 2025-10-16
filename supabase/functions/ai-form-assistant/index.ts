import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's personal info from vault
    const { data: personalInfo, error: dbError } = await supabase
      .from('personal_info')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // System prompt with context about the form and user data
    const systemPrompt = `You are SwiftFill Pro AI Assistant, an intelligent legal form filling assistant.

Your role is to help users fill out California FL-320 Responsive Declaration to Request for Order forms accurately and efficiently.

${personalInfo ? `User's Personal Information:
- Full Name: ${personalInfo.full_name || 'Not provided'}
- Street Address: ${personalInfo.street_address || 'Not provided'}
- City: ${personalInfo.city || 'Not provided'}
- State: ${personalInfo.state || 'Not provided'}
- ZIP Code: ${personalInfo.zip_code || 'Not provided'}
- Telephone: ${personalInfo.telephone_no || 'Not provided'}
- Fax: ${personalInfo.fax_no || 'Not provided'}
- Email: ${personalInfo.email_address || 'Not provided'}
- Attorney Name: ${personalInfo.attorney_name || 'Not provided'}
- Firm Name: ${personalInfo.firm_name || 'Not provided'}
- Bar Number: ${personalInfo.bar_number || 'Not provided'}` : 'No personal information stored yet. Ask the user to provide their information first.'}

When helping fill forms:
1. Use the user's stored personal information when appropriate
2. Ask clarifying questions about case-specific details
3. Provide legal context about each section (without giving legal advice)
4. Suggest appropriate responses based on common scenarios
5. Help format responses properly for legal documents

Always maintain professional tone and remind users to consult with an attorney for legal advice.`;

    // Call Lovable AI Gateway with streaming
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI gateway error:', response.status, error);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error in ai-form-assistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});