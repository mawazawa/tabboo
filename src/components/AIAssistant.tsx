import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { useAIStream } from "@/hooks/useAIStream";
import { toast } from "sonner";
import aiAssistant from "@/assets/ai-assistant.png";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your SwiftFill Pro AI Assistant. I'm here to help you fill out your FL-320 form accurately and efficiently. \n\nTo get started, I can use your saved personal information or you can provide it now. What would you like help with?"
    }
  ]);
  const [input, setInput] = useState('');
  const { streamChat, isLoading } = useAIStream();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    let assistantContent = '';
    const tempAssistantMessage: Message = { role: 'assistant', content: '' };

    setMessages(prev => [...prev, tempAssistantMessage]);

    await streamChat({
      messages: [...messages, userMessage],
      userId: 'demo-user', // In production, use actual user ID from auth
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent };
          return newMessages;
        });
      },
      onDone: () => {
        console.log('Stream complete');
      },
      onError: (error) => {
        toast.error(error);
        setMessages(prev => prev.slice(0, -1));
      }
    });
  };

  return (
    <Card className="h-full flex flex-col border-2 shadow-medium">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-background p-1 shadow-glow">
            <img src={aiAssistant} alt="AI Assistant" className="w-full h-full object-contain" />
          </div>
          <div>
            <CardTitle className="text-xl">SwiftFill Pro AI</CardTitle>
            <p className="text-sm text-primary-foreground/80">Your intelligent form assistant</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-soft ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border-2'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border-2 rounded-2xl px-4 py-3 shadow-soft">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t-2 bg-background">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about the form..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};