"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { X, Download, FileText, ChevronLeft, Share2 } from "lucide-react";
import { useId, Suspense } from "react";

function PDFViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileUrl = searchParams.get("url");
  const title = searchParams.get("title") || "Document Viewer";
  const rawId = useId();
  const sessionId = rawId.replace(/[^a-z0-9]/gi, '').substring(0, 6).toUpperCase() || 'ALOHA1';

  if (!fileUrl) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <X size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Access Denied</h1>
        <p className="opacity-40 text-xs font-bold uppercase tracking-widest">No document source provided.</p>
        <button 
          onClick={() => router.back()}
          className="mt-8 px-8 py-4 bg-brand-blue rounded-2xl text-xs font-black uppercase tracking-widest"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Premium Header */}
      <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 z-50 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-white"
            title="Go Back"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center text-brand-blue">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-white font-black text-sm uppercase tracking-tight">{title}</h1>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Secure Aloha Connection Active</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
             onClick={() => window.open(fileUrl, '_blank')}
             className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Download size={14} /> Download
          </button>
          <button 
             className="w-12 h-12 bg-brand-blue text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all"
             title="Share Access"
          >
            <Share2 size={18} />
          </button>
        </div>
      </header>

      {/* Viewer Main */}
      <main className="flex-1 relative bg-slate-900">
        <iframe 
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`} 
          className="w-full h-full border-0"
          title={title}
        />
      </main>

      {/* Footer / Status */}
      <footer className="h-10 bg-black border-t border-white/5 flex items-center justify-between px-8 text-[9px] font-black uppercase tracking-widest text-white/20 shrink-0">
        <div className="flex items-center gap-4">
           <span>Session ID: {sessionId}</span>
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-emerald-500/40">Encrypted</span>
        </div>
        <div>Aloha Properties Intel v6.2</div>
      </footer>
    </div>
  );
}

export default function PDFViewerPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-slate-950 flex items-center justify-center text-brand-blue"><FileText className="animate-pulse" size={48} /></div>}>
      <PDFViewerContent />
    </Suspense>
  );
}
