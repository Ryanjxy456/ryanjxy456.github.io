import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Bot, X, Send, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
}

export default function AIChat({ articleContent }: { articleContent: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  const isDragging = useRef(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const variants = {
    idle: { 
      width: 56, 
      height: 56, 
      borderRadius: '28px', 
      x: 0, 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 25 } 
    },
    open: { 
      width: 450, 
      height: 580, 
      borderRadius: '16px', 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input, id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleContent, messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!response.ok) throw new Error('API request failed');
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let assistantMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { role: 'assistant', content: '', id: assistantMsgId }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const text = data.choices[0]?.delta?.content || '';
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content += text;
                return newMessages;
              });
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-40 right-6 z-[9999] pointer-events-none">
      <motion.div
        variants={variants}
        initial="idle"
        animate={isOpen ? "open" : "idle"}
        drag
        dragControls={controls}
        dragListener={!isOpen}
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={isOpen 
          ? { left: -window.innerWidth + 450, right: 0, top: -window.innerHeight + 580, bottom: 0 }
          : { left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 160, bottom: 0 }
        }
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={() => { 
          setTimeout(() => { isDragging.current = false; }, 150); 
        }}
        className="pointer-events-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden origin-bottom-right"
      >
        {!isOpen ? (
          <button 
            onClick={() => {
              if (!isDragging.current) {
                setIsOpen(true);
              }
            }} 
            className="w-full h-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
          >
            <Bot size={28} />
          </button>
        ) : (
          <>
            {/* Header */}
            <div 
              onPointerDown={(e) => controls.start(e)}
              className="p-4 bg-blue-600 text-white flex items-center justify-between cursor-move touch-none flex-shrink-0"
            >
              <div className="flex items-center gap-2 font-medium"><Bot size={20} /><span>AI 博客助手</span></div>
              <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
                <button onClick={() => setIsOpen(false)} title="关闭" className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && <div className="text-center text-zinc-500 text-sm mt-10">你可以问我关于这篇文章的问题。</div>}
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-700'}`}>
                    <div className="text-[10px] opacity-60 mb-1 font-bold">{m.role === 'user' ? 'YOU' : 'AI ASSISTANT'}</div>
                    <div className="whitespace-pre-wrap break-words overflow-hidden">{m.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start"><div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-none"><Loader2 size={16} className="animate-spin text-blue-600" /></div></div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-2 flex-shrink-0">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="询问关于文章的内容..." className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none dark:text-white" />
              <button type="submit" disabled={isLoading || !input.trim()} className="text-blue-600 disabled:opacity-50"><Send size={20} /></button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
