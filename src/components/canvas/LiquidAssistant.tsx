import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Sparkles, X } from '@/icons';
import { useGroqStream } from '@/hooks/useGroqStream';

interface LiquidAssistantProps {
  context: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

// Vector math helpers
const friction = 0.92; // Slide decay
const bounceFactor = -0.6; // Bounciness against walls

export const LiquidAssistant: React.FC<LiquidAssistantProps> = ({ context, isOpen, onToggle, onClose }) => {
  // -- State --
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Ready to assist with your legal forms.' }
  ]);
  const [input, setInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Use existing Groq streaming hook
  const { streamMessage, isStreaming, cancelStream } = useGroqStream();

  // -- Refs for Physics (Mutable to avoid re-renders) --
  const pos = useRef({ x: typeof window !== 'undefined' ? window.innerWidth - 80 : 0, y: typeof window !== 'undefined' ? window.innerHeight - 80 : 0 });
  const vel = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // -- Scroll to bottom --
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // -- Physics Loop --
  const animate = useCallback(() => {
    if (!isDragging) {
      // Apply Physics
      vel.current.x *= friction;
      vel.current.y *= friction;

      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;

      // Boundary Checks (Bounce)
      const el = containerRef.current;
      if (el) {
        const bounds = el.getBoundingClientRect();
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const padding = 10;

        // X Walls
        if (pos.current.x < padding) {
          pos.current.x = padding;
          vel.current.x *= bounceFactor;
        } else if (pos.current.x + bounds.width > screenW - padding) {
          pos.current.x = screenW - bounds.width - padding;
          vel.current.x *= bounceFactor;
        }

        // Y Walls
        if (pos.current.y < padding) {
          pos.current.y = padding;
          vel.current.y *= bounceFactor;
        } else if (pos.current.y + bounds.height > screenH - padding) {
          pos.current.y = screenH - bounds.height - padding;
          vel.current.y *= bounceFactor;
        }

        // Stop tiny movements to save battery
        if (Math.abs(vel.current.x) < 0.1) vel.current.x = 0;
        if (Math.abs(vel.current.y) < 0.1) vel.current.y = 0;

        // Apply transform
        el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [isDragging]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate, isOpen]);

  // -- Drag Handlers --
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY };
    lastPos.current = { x: clientX, y: clientY };
    lastTime.current = performance.now();
    vel.current = { x: 0, y: 0 }; // Stop moving when grabbed
    hasMoved.current = false;
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const dx = clientX - lastPos.current.x;
    const dy = clientY - lastPos.current.y;

    // Track velocity for the "toss"
    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
       vel.current = { x: dx, y: dy }; // Instant velocity
    }

    pos.current.x += dx;
    pos.current.y += dy;

    // Direct DOM update for lag-free drag
    if (containerRef.current) {
       containerRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
    }

    lastPos.current = { x: clientX, y: clientY };
    lastTime.current = now;

    if (Math.hypot(clientX - dragStart.current.x, clientY - dragStart.current.y) > 5) {
      hasMoved.current = true;
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (!hasMoved.current) {
      onToggle();
    }
  };

  // -- Chat Logic --
  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    // Create a placeholder for the streaming response
    setMessages(prev => [...prev, { role: 'assistant', text: '' }]);

    try {
      const response = await streamMessage(
        [{ role: 'user', content: `Context: ${context}\n\nUser Query: ${userMsg}` }],
        { systemPrompt: 'You are "Liquid Assistant", a highly capable legal aide for California Judicial Council forms. Be professional, concise, and helpful. Keep responses under 150 words.' },
        (chunk) => {
          // Update the last message with streaming content
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.text += chunk;
            }
            return newMessages;
          });
        }
      );

      // Final update with complete response
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.text = response;
        }
        return newMessages;
      });
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.text = "I'm having trouble connecting right now. Please try again.";
        }
        return newMessages;
      });
    }
  };

  return (
    <>
      <style>{`
        @keyframes neon-pulse {
          0%, 100% { box-shadow: 0 0 10px #3b82f6, 0 0 20px #2563eb inset; opacity: 0.8; transform: scale(1); }
          50% { box-shadow: 0 0 25px #3b82f6, 0 0 40px #2563eb inset; opacity: 1; transform: scale(1.1); }
        }
        .glass-ball {
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.1));
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
      `}</style>

      <div
        ref={containerRef}
        className="fixed z-[100] touch-none select-none"
        style={{
          transform: `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        // Mouse Events
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        // Touch Events
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
      >
        {!isOpen ? (
          /* --- CRYSTAL BALL MODE --- */
          <div className="w-16 h-16 rounded-full glass-ball flex items-center justify-center relative transition-transform active:scale-95">
            {/* The Neon Core */}
            <div
              className="w-4 h-4 rounded-full bg-blue-500"
              style={{ animation: 'neon-pulse 3s infinite ease-in-out' }}
            ></div>
            {/* Specular highlight */}
            <div className="absolute top-3 left-4 w-4 h-2 bg-white/40 rounded-full rotate-[-45deg] blur-[2px]"></div>
          </div>
        ) : (
          /* --- CHAT WINDOW MODE --- */
          <div
            className="
              w-[300px] h-[400px] sm:w-[340px] sm:h-[500px]
              bg-white/70 backdrop-blur-xl
              rounded-3xl shadow-2xl border border-white/50
              flex flex-col overflow-hidden
              animate-in zoom-in-95 duration-200
            "
          >
            {/* Drag Handle Header */}
            <div className="h-12 shrink-0 border-b border-white/20 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing bg-white/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]"></div>
                <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">Liquid Assistant</span>
              </div>
              <button
                // Prevent drag from triggering on close button
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); if (onClose) { onClose(); } else { onToggle(); } }}
                className="w-6 h-6 rounded-full hover:bg-slate-200/50 flex items-center justify-center text-slate-500"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 cursor-auto"
              onMouseDown={e => e.stopPropagation()} // Allow text selection inside chat
              onTouchStart={e => e.stopPropagation()} // Allow scroll inside chat
            >
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`
                      max-w-[85%] p-2.5 rounded-2xl text-xs leading-relaxed shadow-sm backdrop-blur-sm
                      ${msg.role === 'user'
                        ? 'bg-slate-800/90 text-white rounded-br-sm'
                        : 'bg-white/60 border border-white/60 text-slate-800 rounded-bl-sm'
                      }
                    `}
                  >
                    {msg.text || (isStreaming && idx === messages.length - 1 ? '...' : '')}
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="bg-white/40 p-2 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                    <Sparkles size={12} className="text-blue-500 animate-spin" />
                    <span className="text-[10px] text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="p-3 bg-white/40 border-t border-white/30 cursor-auto"
              onMouseDown={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
            >
              <div className="relative flex items-center gap-2">
                <input
                  className="w-full bg-white/50 border-none rounded-full pl-4 pr-10 py-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 transition-all outline-none placeholder-slate-400 shadow-inner"
                  placeholder="Ask Liquid..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  disabled={isStreaming}
                />
                <button
                  onClick={handleSend}
                  disabled={isStreaming}
                  className="absolute right-1 top-1 p-1.5 bg-slate-800 text-white rounded-full hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
