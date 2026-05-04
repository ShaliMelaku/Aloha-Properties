"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type StatusType = 'success' | 'error' | 'info';

interface StatusMessage {
  id: string;
  type: StatusType;
  message: string;
}

interface StatusContextType {
  notify: (type: StatusType, message: string) => void;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export function StatusProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<StatusMessage[]>([]);

  const notify = useCallback((type: StatusType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setMessages((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 5000);
  }, []);

  return (
    <StatusContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className="glass-card flex items-center gap-4 px-6 py-4 rounded-2xl min-w-[320px] shadow-2xl border-white/10 overflow-hidden relative group">
                {/* Accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  m.type === 'success' ? 'bg-emerald-500' : 
                  m.type === 'error' ? 'bg-red-500' : 'bg-brand-blue'
                }`} />
                
                <div className={`${
                  m.type === 'success' ? 'text-emerald-500' : 
                  m.type === 'error' ? 'text-red-500' : 'text-brand-blue'
                }`}>
                  {m.type === 'success' && <CheckCircle2 size={24} />}
                  {m.type === 'error' && <AlertCircle size={24} />}
                  {m.type === 'info' && <Info size={24} />}
                </div>

                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5">{m.type}</p>
                   <p className="text-sm font-bold tracking-tight">{m.message}</p>
                </div>

                <button 
                  onClick={() => setMessages(prev => prev.filter(msg => msg.id !== m.id))}
                  className="opacity-20 hover:opacity-100 transition-opacity"
                  aria-label="Close notification"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </StatusContext.Provider>
  );
}

export function useStatus() {
  const context = useContext(StatusContext);
  if (!context) throw new Error('useStatus must be used within StatusProvider');
  return context;
}
