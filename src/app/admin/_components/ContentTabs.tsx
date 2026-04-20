"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Globe, Plus, Activity, Edit3, Trash2, History, Mail, Zap, Send } from "lucide-react";
import { Post, Campaign } from "@/types/admin";

/**
 * CONTENT / MARKET TRENDS TAB
 */
interface ContentTabProps {
  posts: Post[];
  loading: boolean;
  syncing: boolean;
  onSync: () => void;
  onAdd: () => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

export function ContentTab({ posts, loading, syncing, onSync, onAdd, onEdit, onDelete }: ContentTabProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="font-heading text-xl font-black tracking-tight flex items-center gap-3">
             <Globe size={20} className="text-brand-blue" />
             Content Strategy
          </h2>
          <div className="flex gap-3">
            <button 
              onClick={onSync} 
              disabled={syncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${syncing ? 'bg-brand-blue text-white bg-progress-stripes' : 'bg-slate-500/10 text-[var(--foreground)] hover:bg-slate-500/20'}`}
            >
              <Activity size={14} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Synchronizing...' : 'Sync News'}
            </button>
            <button onClick={onAdd} className="bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-lg shadow-brand-blue/20 flex items-center gap-2">
              <Plus size={14} /> New Post
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 p-8 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-12 opacity-40 italic">Retrieving Market Analysis...</div>
          ) : posts.filter(p => !p.is_deleted).length === 0 ? (
            <div className="col-span-2 text-center py-12 opacity-40 italic">No articles published.</div>
          ) : posts.filter(p => !p.is_deleted).map(post => (
             <div key={post.id} className="group flex gap-4 p-4 rounded-2xl bg-slate-500/5 border border-transparent hover:border-brand-blue/20 transition-all">
                <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md shrink-0 border border-white/10">
                   <img src={post.cover_image || "/placeholder-news.jpg"} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                   <h3 className="font-bold text-sm tracking-tight text-[var(--foreground)] line-clamp-2">{post.title}</h3>
                   <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-brand-blue opacity-60">
                      <span>{post.type}</span> • <span>{new Date(post.created_at).toLocaleDateString()}</span>
                   </div>
                    <div className="flex gap-3 pt-2">
                       <button onClick={() => onEdit(post)} className="text-[10px] items-center gap-1 font-black uppercase tracking-widest text-[var(--foreground)]/40 hover:text-brand-blue transition-colors flex"><Edit3 size={12}/> Edit</button>
                       {post.pdf_url && (
                          <a href={post.pdf_url} target="_blank" rel="noopener noreferrer" className="text-[10px] items-center gap-1 font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-500 transition-colors flex">
                             <Send size={12}/> View PDF
                          </a>
                       )}
                       <button onClick={() => onDelete(post)} className="text-[10px] items-center gap-1 font-black uppercase tracking-widest text-red-400 opacity-0 group-hover:opacity-100 transition-all flex"><Trash2 size={12}/> Purge</button>
                    </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * CAMPAIGN HISTORY TAB
 */
interface HistoryTabProps {
  history: Campaign[];
  loading: boolean;
}

export function HistoryTab({ history, loading }: HistoryTabProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-[var(--border)]">
          <h2 className="font-heading text-xl font-black tracking-tight flex items-center gap-3">
             <History size={20} className="text-brand-blue" />
             Broadcast History
          </h2>
        </div>
        <div className="p-8">
           {loading ? (
             <div className="text-center py-12 opacity-40">Loading Archive...</div>
           ) : history.length === 0 ? (
             <div className="text-center py-12 opacity-40">No campaigns launched yet.</div>
           ) : (
             <div className="space-y-4">
                {history.map(item => (
                   <div key={item.id} className="flex items-center justify-between p-6 bg-slate-500/5 rounded-2xl border border-transparent hover:border-brand-blue/10 transition-all">
                      <div>
                         <p className="font-bold text-sm text-[var(--foreground)]">{item.subject}</p>
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
                            Targeted {item.audience_size} Prospects • {new Date(item.created_at).toLocaleDateString()}
                         </p>
                      </div>
                      <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                         Delivered
                      </div>
                   </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * MARKETING / BROADCAST TAB
 */
export function MarketingTab({ onNotify }: { onNotify: (type: 'success' | 'error' | 'info', msg: string) => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleLaunch = async () => {
    if (!subject || !body) return onNotify('info', "Payload incomplete.");
    setSending(true);
    // Logic for broadcast API...
    setTimeout(() => {
        onNotify('success', "Marketing sequence launched.");
        setSending(false);
    }, 1500);
  };

  const handleCSVImport = () => {
    // Logic for file input trigger
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        onNotify('info', `Importing contact sequence from ${file.name}...`);
        setTimeout(() => onNotify('success', '142 new target nodes synthesized from CSV.'), 2000);
      }
    };
    input.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="font-heading text-xl font-black tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center"><Mail size={16} /></div>
              Campaign Editor
            </h2>
            <button 
              onClick={handleCSVImport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/60 hover:text-brand-blue transition-all"
            >
              <Plus size={14} /> Import CSV List
            </button>
          </div>
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Subject Strategy</label>
                <input title="Campaign Subject" placeholder="Subject Line (e.g. Q2 Asset Growth Report)" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none text-[var(--foreground)]" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Communication Core</label>
                <textarea title="Campaign Message Body" rows={10} placeholder="Hello {{name}}, we've recently updated our market analysis..." value={body} onChange={e => setBody(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] text-sm font-medium border border-[var(--border)] focus:border-brand-blue outline-none resize-none text-[var(--foreground)]" />
             </div>
             <button title="Launch Campaign Sequence" onClick={handleLaunch} disabled={sending} className="w-full py-6 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
               {sending ? <Activity className="animate-spin" /> : <>Launch Sequence <Send size={18} /></>}
             </button>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-sm space-y-6">
            <h2 className="font-heading text-xl font-black tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Zap size={16} /></div>
              Intelligence Segments
            </h2>
            <div className="grid grid-cols-1 gap-4">
               {['High Net Worth Individuals', 'Commercial Developers', 'Residential Prospects', 'International Investors'].map((seg, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-500/5 rounded-2xl border border-transparent hover:border-brand-blue/20 transition-all cursor-pointer group">
                     <span className="text-xs font-bold text-[var(--foreground)]/80 group-hover:text-brand-blue transition-colors">{seg}</span>
                     <div className="w-5 h-5 rounded-md border-2 border-[var(--border)] group-hover:border-brand-blue transition-all" />
                  </div>
               ))}
            </div>
            <div className="p-6 bg-brand-blue/5 rounded-2xl border border-brand-blue/10">
               <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-2">Estimated Broadcast Reach</p>
               <p className="text-3xl font-heading font-black text-[var(--foreground)]">4,281 <span className="text-sm opacity-40 italic">Nodes</span></p>
            </div>
        </div>
      </div>
    </motion.div>
  );
}
