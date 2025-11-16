import { useState, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FormContext {
  [key: string]: string | number | boolean | undefined;
}

interface StreamChatParams {
  messages: Message[];
  formContext?: FormContext;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export const useGroqStream = () => {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const streamChat = async ({ messages, formContext, onDelta, onDone, onError }: StreamChatParams) => {
    // Cancel any existing stream
    cancelStream();

    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    const CHAT_URL = `https://sbwgkocarqvonkdlitdx.supabase.co/functions/v1/groq-chat`;

    try {
      // Get auth token from session
      const token = (await import('@/integrations/supabase/client')).supabase.auth.getSession()
        .then(({ data }) => data.session?.access_token);

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await token}`,
        },
        body: JSON.stringify({ messages, formContext }),
        signal: controller.signal, // Pass abort signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect to AI');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        // Check if stream was cancelled
        if (controller.signal.aborted) {
          reader.cancel();
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Release reader lock
      reader.releaseLock();

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch { /* ignore */ }
        }
      }

      // Only call onDone if not aborted
      if (!controller.signal.aborted) {
        onDone();
      }
    } catch (error) {
      // Don't report AbortError as an actual error
      if (error instanceof Error && error.name === 'AbortError') {
        // Stream cancelled by user (silently handled)
        return;
      }

      // Stream error occurred - pass to error handler
      onError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      // Clean up controller reference
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  };

  return { streamChat, isLoading, cancelStream };
};
