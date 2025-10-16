import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-form-assistant`;

export const useAIStream = () => {
  const [isLoading, setIsLoading] = useState(false);

  const streamChat = useCallback(async ({
    messages,
    userId,
    onDelta,
    onDone,
    onError,
  }: {
    messages: Message[];
    userId: string;
    onDelta: (deltaText: string) => void;
    onDone: () => void;
    onError?: (error: string) => void;
  }) => {
    setIsLoading(true);
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages, userId }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        onError?.(errorData.error || 'Failed to connect to AI assistant');
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        throw new Error('No response body');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
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

      onDone();
      setIsLoading(false);
    } catch (error) {
      console.error('Stream error:', error);
      onError?.(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }
  }, []);

  return { streamChat, isLoading };
};