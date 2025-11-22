import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(4000)
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(50)
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    
    // Validate and sanitize input
    let validated;
    try {
      validated = requestSchema.parse(body);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return new Response(JSON.stringify({ 
        error: 'Invalid input format',
        details: validationError instanceof Error ? validationError.message : 'Validation failed'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { messages } = validated;

    // Fetch user's personal info from vault - only when explicitly needed
    const { data: personalInfo, error: dbError } = await supabase
      .from('personal_info')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Sanitize and filter PII - only include when explicitly needed
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const needsPersonalInfo = lastUserMessage.includes('my name') || 
                              lastUserMessage.includes('my address') || 
                              lastUserMessage.includes('my contact') ||
                              lastUserMessage.includes('my information') ||
                              lastUserMessage.includes('fill out') ||
                              lastUserMessage.includes('attorney');

    // Safe fields whitelist - never include sensitive fields
    const safeFields = ['full_name', 'city', 'state', 'attorney_name'];
    let personalContext = '';
    
    if (needsPersonalInfo && personalInfo) {
      // Only include whitelisted fields and only when explicitly requested
      personalContext = `\n\nAvailable user information (use only when relevant):`;
      if (personalInfo.full_name && lastUserMessage.includes('name') && safeFields.includes('full_name')) {
        personalContext += `\n- Name: ${personalInfo.full_name}`;
      }
      if ((personalInfo.city || personalInfo.state) && lastUserMessage.includes('address')) {
        if (safeFields.includes('city')) personalContext += `\n- City: ${personalInfo.city || ''}`;
        if (safeFields.includes('state')) personalContext += `\n- State: ${personalInfo.state || ''}`;
      }
      if (personalInfo.attorney_name && lastUserMessage.includes('attorney') && safeFields.includes('attorney_name')) {
        personalContext += `\n- Attorney: ${personalInfo.attorney_name}`;
      }
    } else if (!personalInfo) {
      personalContext = '\n\nNo personal information stored. Ask user to save their information in the Personal Data Vault first.';
    }

    // System prompt with minimal PII exposure
    const systemPrompt = `You are SwiftFill Pro AI Assistant, an intelligent legal form filling assistant.

Your role is to help users fill out California FL-320 Responsive Declaration to Request for Order forms accurately and efficiently.${personalContext}

When helping fill forms:
1. Only request user's personal information when absolutely necessary for the specific form field
2. If you need to ask a clarifying question, wrap it in a [question] tag. For example: [question]What is your case number?[/question]
3. Provide legal context about each section (without giving legal advice)
4. Suggest appropriate responses based on common scenarios
5. Help format responses properly for legal documents

Always maintain professional tone and remind users to consult with an attorney for legal advice.`;

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt + messages.map(m => m.content).join('\n') }],
          }
        ]
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
      
      throw new Error(`AI gateway error: ${response.status}`);
    }
    
    const jsonResponse = await response.json();
    const message = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!message) {
       throw new Error('Invalid response format from AI provider');
    }

    // Check for clarifying question
    const questionMatch = message.match(/\[question\](.*?)\[\/question\]/);
    if (questionMatch) {
      return new Response(JSON.stringify({
        status: 'question',
        question: questionMatch[1],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return standard response
    return new Response(JSON.stringify({
      status: 'ok',
      message: message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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