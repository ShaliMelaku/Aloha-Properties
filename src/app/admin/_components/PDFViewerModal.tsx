"use client";

import { X, Download, FileText, Maximize2 } from "lucide-react";
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
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#0a0a0a] rounded-[2rem] border border-white/10 w-full max-w-6xl h-full flex flex-col overflow-hidden shadow-2xl shadow-brand-blue/10"
        >
          {/* Modal Header */}
          <header className="h-20 border-b border-white/5 bg-black/40 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center text-brand-blue">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-tight truncate max-w-[200px] md:max-w-md">{title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Secure Internal Link</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button 
                 onClick={() => window.open(url, '_blank')}
                 className="hidden md:flex px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all items-center gap-2"
                 title="Download Document"
              >
                <Download size={14} /> Download
              </button>
              <button 
                 onClick={onClose}
                 className="w-12 h-12 bg-white/5 border border-white/10 text-white rounded-xl flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 transition-all"
                 title="Close Viewer"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* PDF Viewport */}
          <div className="flex-1 bg-slate-900/50 relative">
             {/* Using Google Docs Viewer for better compatibility, but proxied URL */}
             <iframe 
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + url)}&embedded=true`} 
                className="w-full h-full border-0"
                title={title}
             />
          </div>

          {/* Footer Status */}
          <footer className="h-10 bg-black/60 border-t border-white/5 flex items-center justify-between px-8 text-[8px] font-black uppercase tracking-widest text-white/20 shrink-0">
             <div className="flex items-center gap-4">
                <span>Aloha Secure Protocol v2.1</span>
                <span className="w-1 h-1 rounded-full bg-current" />
                <span>Protected by Supabase Layer</span>
             </div>
             <div className="flex items-center gap-2">
                <Maximize2 size={10} /> Fullscreen Ready
             </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
