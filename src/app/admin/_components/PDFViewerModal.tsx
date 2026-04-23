"use client";

import { X, FileText, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function PDFViewerModal({ isOpen, onClose, url, title }: PDFViewerModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-2xl"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#050505] rounded-[2.5rem] border border-white/10 w-full max-w-6xl h-full flex flex-col overflow-hidden shadow-[0_0_100px_rgba(43,171,226,0.1)]"
        >
          {/* Modal Header */}
          <header className="h-20 border-b border-white/5 bg-black/60 flex items-center justify-between px-6 md:px-10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-blue/20 rounded-2xl flex items-center justify-center text-brand-blue border border-brand-blue/30 shadow-lg shadow-brand-blue/5">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-white font-black text-base uppercase tracking-tight truncate max-w-[180px] md:max-w-md">{title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Secured Document Protocol v3.1</p>
                </div>
              </div>
            </div>

            <button 
                onClick={onClose}
                className="w-12 h-12 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group"
                title="Close Viewer"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform" />
            </button>
          </header>

          {/* PDF Viewport */}
          <div className="flex-1 bg-[#0a0a0a] relative">
             <iframe 
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + url)}&embedded=true`} 
                className="w-full h-full border-0"
                title={title}
             />
          </div>

          {/* Footer Status */}
          <footer className="h-12 bg-black/80 border-t border-white/5 flex items-center justify-between px-10 text-[9px] font-black uppercase tracking-widest text-white/30 shrink-0">
             <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-brand-blue" />
                   Aloha Secure Node
                </span>
                <span className="flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-emerald-500" />
                   End-to-End Encrypted
                </span>
             </div>
             <div className="hidden md:flex items-center gap-3">
                <Maximize2 size={12} /> Optimization Level: Maximum
             </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
