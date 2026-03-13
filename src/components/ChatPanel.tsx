import React, { useState, useRef, useEffect } from 'react';
import { chatWithDocument } from '../services/gemini';
import { MessageSquare, Send, Loader2, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatPanelProps {
  content: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatPanel({ content }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const response = await chatWithDocument(content, userMessage, history);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-morphism rounded-[32px] p-8 shadow-sm flex flex-col h-[600px]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-[24px] font-display font-bold text-white">Chat with Document</h2>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-12">
            <Bot className="w-12 h-12 text-white/10 mb-4" />
            <p className="text-white/40 text-[14px]">
              Ask anything about the document. I can help you find specific information or explain complex concepts.
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl flex gap-3 ${
                m.role === 'user' 
                  ? 'bg-emerald-500 text-black font-medium' 
                  : 'bg-white/5 border border-white/10 text-white/80'
              }`}>
                <div className="flex-shrink-0 mt-1">
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <p className="text-[14px] text-white/40">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-14 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-2 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
