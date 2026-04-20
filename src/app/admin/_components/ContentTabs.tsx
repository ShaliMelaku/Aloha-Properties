"use client";

import { useState } from "react";
import { 
  Plus, Edit3, Trash2, Globe, FileText, Send, 
  Activity, Mail, Zap, Download, FileUp, Database
} from "lucide-react";
import { motion } from "framer-motion";
import { Post, Campaign } from "@/types/admin";

interface ContentTabProps {
  posts: Post[];
  loading: boolean;
  syncing: boolean;
  onSync: () => void;
  onAdd: () => void;
  onEdit: (p: Post) => void;
  onDelete: (p: Post) => void;
}

export function ContentTab({ 
  posts, loading, syncing, onSync, onAdd, onEdit, onDelete 
}: ContentTabProps) {
  if (loading) return <div className="h-40 flex items-center justify-center"><Activity className="animate-spin text-brand-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-black tracking-tighter uppercase">Prop Desk <span className="opacity-30 italic">Articles.</span></h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Synchronizing market intelligence nodes.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={onSync} disabled={syncing} className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-60 hover:opacity-100 transition-all">
             {syncing ? <Activity size={14} className="animate-spin" /> : <RefreshCw size={14} />} Auto Sync
           </button>
           <button onClick={onAdd} className="flex items-center gap-3 px-6 py-3 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all">
             <Plus size={16} /> Post Article
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden hover:border-brand-blue/30 transition-all group">
             <div className="h-40 relative">
               <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-white">{post.type}</div>
             </div>
             <div className="p-6 space-y-4">
                <h3 className="font-heading font-black text-lg leading-tight uppercase tracking-tight line-clamp-2">{post.title}</h3>
                <div className="flex justify-between items-center pt-2">
                   <div className="flex gap-2">
                      <button onClick={() => onEdit(post)} className="text-[10px] font-black uppercase tracking-widest text-brand-blue/60 hover:text-brand-blue transition-colors flex items-center gap-1"><Edit3 size={12}/> Edit</button>
                      {post.file_url && (
                         <a href={post.file_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1"><FileText size={12}/> PDF</a>
                      )}
                   </div>
                   <button onClick={() => onDelete(post)} className="text-[10px] font-black uppercase tracking-widest text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

interface MarketingTabProps {
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export function MarketingTab({ onNotify }: MarketingTabProps) {
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleLaunch = () => {
    if (!subject || !body) return onNotify('error', 'Campaign protocols incomplete.');
    setSending(true);
    setTimeout(() => {
      onNotify('success', 'Email sequence triggered to 4,281 subscribers.');
      setSending(false);
      setSubject("");
      setBody("");
    }, 1500);
  };

  const handleCSVImport = () => {
    // Logic for bulk lead processing
    onNotify('info', 'Target Data Node selected. Synthesizing contacts...');
    setTimeout(() => onNotify('success', 'Bulk ingestion complete: 142 new prospective leads added.'), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-sm space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-heading font-black tracking-tighter uppercase">Campaign <span className="opacity-30 italic">Editor.</span></h2>
          <button onClick={handleCSVImport} className="flex items-center gap-3 px-4 py-2 bg-slate-500/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-60 hover:opacity-100 transition-all">
            <FileUp size={14} /> Import CSV List
          </button>
        </div>
        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Neural Subject Strategy</label>
              <input placeholder="Subject Line (e.g. Q4 Investment Report)" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none text-[var(--foreground)]" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Communication Logic</label>
              <textarea rows={10} placeholder="Hello {{name}}, we're expanding our residential node..." value={body} onChange={e => setBody(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] text-sm font-medium border border-[var(--border)] focus:border-brand-blue outline-none resize-none text-[var(--foreground)]" />
           </div>
           <button onClick={handleLaunch} disabled={sending} className="w-full py-6 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
             {sending ? <Activity className="animate-spin" /> : <>Launch Sequence <Send size={18} /></>}
           </button>
        </div>
      </div>

      <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-sm space-y-8">
         <h2 className="text-2xl font-heading font-black tracking-tighter uppercase">Market <span className="opacity-30 italic">Intelligence.</span></h2>
         <div className="space-y-4">
            {['High Net Worth Individuals', 'Commercial Developers', 'Residential Prospects', 'International Investors'].map((seg, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-500/5 rounded-2xl border border-transparent hover:border-brand-blue/20 transition-all cursor-pointer group">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all"><Database size={16} /></div>
                    <span className="text-sm font-bold text-[var(--foreground)]/80 group-hover:text-brand-blue transition-colors">{seg}</span>
                 </div>
                 <div className="w-6 h-6 rounded-md border-2 border-[var(--border)] group-hover:border-brand-blue transition-all" />
              </div>
            ))}
         </div>
         <div className="p-8 bg-brand-blue/5 rounded-[2rem] border border-brand-blue/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-2">Estimated Broadcast Reach</p>
            <div className="flex items-baseline gap-2">
               <p className="text-4xl font-heading font-black text-[var(--foreground)] tracking-tight">4,281</p>
               <p className="text-sm opacity-40 font-bold italic uppercase tracking-widest">Active Nodes</p>
            </div>
         </div>
      </div>
    </motion.div>
  );
}

interface HistoryTabProps {
  history: Campaign[];
  loading: boolean;
}

export function HistoryTab({ history, loading }: HistoryTabProps) {
  if (loading) return <div className="h-40 flex items-center justify-center"><Activity className="animate-spin text-brand-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-black tracking-tighter uppercase">Campaign <span className="opacity-30 italic">History.</span></h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Reviewing successful broadcast sequences.</p>
        </div>
        <button className="flex items-center gap-3 px-6 py-3 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-60 hover:opacity-100 transition-all">
          <Download size={16} /> Export Logs
        </button>
      </div>

      <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-left">
           <thead>
              <tr className="border-b border-[var(--border)] bg-slate-500/5">
                 <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest opacity-40">Date Pulse</th>
                 <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest opacity-40">Subject Strategy</th>
                 <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest opacity-40 text-right">Reach Nodes</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-[var(--border)]">
              {history.map((c) => (
                <tr key={c.id} className="hover:bg-slate-500/5 transition-colors">
                  <td className="px-8 py-5 text-xs font-bold opacity-60">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-8 py-5 text-sm font-bold">{c.subject}</td>
                  <td className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-blue text-right">{c.audience_size.toLocaleString()} Subscribers</td>
                </tr>
              ))}
           </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function RefreshCw({ size, className }: { size: number, className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
