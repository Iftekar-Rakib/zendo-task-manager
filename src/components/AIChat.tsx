import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, User, Sparkles, Loader2, ListPlus, CalendarPlus, FilePlus } from 'lucide-react';
import { Task, Event, Note, Category } from '../types';

interface AIChatProps {
  onClose: () => void;
  onAddTask: (task: Partial<Task>) => void;
  onAddEvent: (event: Partial<Event>) => void;
  onAddNote: (note: Partial<Note>) => void;
  onAddFolder: (folder: Partial<Category>) => void;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  type?: 'action' | 'text';
  actionType?: 'task' | 'event' | 'note' | 'folder';
}

export default function AIChat({ onClose, onAddTask, onAddEvent, onAddNote, onAddFolder }: AIChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm your Flow assistant. How can I help you organize your day today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        })
      });

      const data = await response.json();

      if (data.functionCalls) {
        data.functionCalls.forEach((call: any) => {
          if (call.name === 'create_task') {
            onAddTask(call.args);
            setMessages(prev => [...prev, { 
              role: 'model', 
              content: `Created task: ${call.args.title}`, 
              type: 'action', 
              actionType: 'task' 
            }]);
          } else if (call.name === 'create_event') {
            onAddEvent(call.args);
            setMessages(prev => [...prev, { 
              role: 'model', 
              content: `Scheduled event: ${call.args.title}`, 
              type: 'action', 
              actionType: 'event' 
            }]);
          } else if (call.name === 'create_note') {
            onAddNote(call.args);
            setMessages(prev => [...prev, { 
              role: 'model', 
              content: `Added note: ${call.args.title}`, 
              type: 'action', 
              actionType: 'note' 
            }]);
          } else if (call.name === 'create_folder') {
            onAddFolder(call.args);
            setMessages(prev => [...prev, { 
              role: 'model', 
              content: `Created folder: ${call.args.name}`, 
              type: 'action', 
              actionType: 'folder' 
            }]);
          }
        });
      }

      if (data.text) {
        setMessages(prev => [...prev, { role: 'model', content: data.text }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[70] flex items-end justify-center sm:items-center p-4">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] flex flex-col h-[80vh] card-shadow overflow-hidden"
      >
        <header className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display italic">Flow AI</h2>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Neural Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {messages.map((m, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`mt-1 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  m.role === 'user' ? 'bg-neutral-100' : 'bg-neutral-900'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-neutral-600" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-neutral-100 text-neutral-900 rounded-tr-none' 
                    : m.type === 'action'
                    ? 'bg-neutral-50 border border-neutral-100 text-neutral-600 italic font-mono text-[11px] rounded-tl-none'
                    : 'bg-neutral-900 text-white rounded-tl-none shadow-lg shadow-neutral-900/10'
                }`}>
                  {m.type === 'action' && (
                    <div className="flex items-center space-x-2 mb-1">
                      {m.actionType === 'task' && <ListPlus className="w-3 h-3 text-neutral-400" />}
                      {m.actionType === 'event' && <CalendarPlus className="w-3 h-3 text-neutral-400" />}
                      {m.actionType === 'note' && <FilePlus className="w-3 h-3 text-neutral-400" />}
                      <span className="uppercase tracking-widest text-[8px] font-bold">Action Confirmed</span>
                    </div>
                  )}
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-[80%]">
                <div className="mt-1 w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 bg-neutral-50 text-neutral-400 text-[10px] rounded-2xl rounded-tl-none font-mono flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-neutral-300 rounded-full animate-bounce" />
                  </div>
                  <span>Processing intent...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-100 bg-neutral-50/50">
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Schedule a meeting tomorrow at 2 PM"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-white border border-neutral-200 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-neutral-900 transition-all shadow-inner text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-black transition-all disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 text-center mt-3 font-mono">FLOW NEURAL ENGINE v1.0.4</p>
        </div>
      </motion.div>
    </div>
  );
}
