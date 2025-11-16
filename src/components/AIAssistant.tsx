import { useState, useRef, useEffect, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Sparkles } from "@/icons";
import { useGroqStream } from "@/hooks/useGroqStream";
import { toast } from "sonner";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import aiAssistant from "@/assets/ai-assistant.png";
import type { FormData, PersonalVaultData } from "@/types/FormData";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SuggestedAction {
  label: string;
  action: string;
  icon?: React.ReactNode;
}

interface AIAssistantProps {
  formContext?: FormData;
  vaultData?: PersonalVaultData | null;
}

export const AIAssistant = ({ formContext, vaultData }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your SwiftFill Pro AI Assistant powered by Groq Llama 3.3 (with Gemini Flash 2.5 fallback). I can see your form data and Personal Data Vault. I'll help you fill out forms accurately and flag any missing required information. What would you like help with?"
    }
  ]);
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const { streamChat, isLoading, cancelStream } = useGroqStream();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAnalyzed = useRef(false);

  // Cleanup on unmount - cancel any ongoing streams
  useEffect(() => {
    return () => {
      cancelStream();
    };
  }, [cancelStream]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Analyze vault and form data on mount
  useEffect(() => {
    if (vaultData && !hasAnalyzed.current) {
      hasAnalyzed.current = true;
      
      // Check for missing vault fields
      const requiredVaultFields = [
        'full_name', 'street_address', 'city', 'state', 'zip_code', 
        'telephone_no', 'email_address'
      ];
      const missingVaultFields = requiredVaultFields.filter(
        field => !vaultData[field]
      );

      // Check for missing form fields
      const requiredFormFields = [
        'partyName', 'streetAddress', 'city', 'state', 'zipCode', 
        'telephoneNo', 'email'
      ];
      const missingFormFields = requiredFormFields.filter(
        field => !formContext?.[field]
      );

      if (missingVaultFields.length > 0 || missingFormFields.length > 0) {
        let analysisMessage = "📋 **Analysis:**\n\n";
        const actions: SuggestedAction[] = [];
        
        if (missingVaultFields.length > 0) {
          analysisMessage += `🔴 Your Personal Data Vault is missing **${missingVaultFields.length} fields**:\n`;
          analysisMessage += missingVaultFields.map(f => `  • ${f.replace(/_/g, ' ')}`).join('\n');
          analysisMessage += '\n\n';
          actions.push({
            label: `Fill ${missingVaultFields.length} Vault Fields`,
            action: `Help me fill in the missing vault fields: ${missingVaultFields.slice(0, 3).join(', ')}${missingVaultFields.length > 3 ? '...' : ''}`
          });
        }

        if (missingFormFields.length > 0) {
          analysisMessage += `📝 The current form is missing **${missingFormFields.length} required fields**:\n`;
          analysisMessage += missingFormFields.map(f => `  • ${f}`).join('\n');
          analysisMessage += '\n\n';
          actions.push({
            label: `Complete ${missingFormFields.length} Form Fields`,
            action: `Help me fill in the missing form fields: ${missingFormFields.slice(0, 3).join(', ')}${missingFormFields.length > 3 ? '...' : ''}`
          });
        }

        analysisMessage += "💡 I can help you fill these fields. Just provide the information, and I'll save it to both your vault and the form!";

        setMessages(prev => [...prev, { role: 'assistant', content: analysisMessage }]);
        setSuggestedActions(actions);
      }
    }
  }, [vaultData, formContext]);

  const handleSuggestedAction = (action: string) => {
    setInput(action);
    handleSend(action);
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowInput(false);
    setSuggestedActions([]);

    let assistantContent = '';
    const tempAssistantMessage: Message = { role: 'assistant', content: '' };

    setMessages(prev => [...prev, tempAssistantMessage]);

    // Prepare form context with vault data as strings
    const missingVaultFields = vaultData ? 
      ['full_name', 'street_address', 'city', 'state', 'zip_code', 'telephone_no', 'email_address']
        .filter(field => !vaultData[field]) : [];

    await streamChat({
      messages: [...messages, userMessage],
      formContext: {
        ...formContext,
        vaultData: vaultData ? JSON.stringify(vaultData) : '{}',
        missingVaultFields: missingVaultFields.join(', '),
      },
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent };
          return newMessages;
        });
      },
      onDone: () => {
        // Stream completed successfully
      },
      onError: (error) => {
        // Stream error occurred - show user toast
        toast.error(error, {
          description: "The AI service encountered an error. Please try again.",
          duration: 5000
        });
        setMessages(prev => prev.slice(0, -1));
      }
    });
  };

  return (
    <Card className="h-full flex flex-col border-2 shadow-medium">
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-background p-1 shadow-glow">
            <ProgressiveImage 
              src={aiAssistant} 
              alt="AI Assistant" 
              className="w-full h-full object-contain"
            />
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
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={0.5} />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Compact Interactive Widget */}
        <div className="p-4 border-t bg-gradient-to-b from-background to-muted/20">
          {/* Suggested Actions */}
          {suggestedActions.length > 0 && !showInput && (
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Suggested actions</span>
              </div>
              <div className="flex flex-col gap-2">
                {suggestedActions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleSuggestedAction(suggestion.action)}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-soft"
                  >
                    <span className="text-sm font-medium">{suggestion.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Widget */}
          {showInput ? (
            <div className="flex gap-2 items-end">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                className="flex-1 rounded-xl border-2 focus-visible:border-primary/50"
                autoFocus
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-soft h-10 w-10"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  setShowInput(false);
                  setInput('');
                }}
                disabled={isLoading}
                variant="ghost"
                size="icon"
                className="rounded-xl h-10 w-10"
              >
                ✕
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowInput(true)}
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-medium h-12 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ask something else...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Wrap with memo to prevent unnecessary re-renders
export default memo(AIAssistant);