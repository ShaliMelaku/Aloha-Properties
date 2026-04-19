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
export function MarketingTab({ onNotify }: { onNotify: any }) {
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-sm">
        <h2 className="font-heading text-xl font-black tracking-tight mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center"><Mail size={16} /></div>
          Campaign Editor
        </h2>
        <div className="space-y-6">
           <input title="Campaign Subject" placeholder="Subject Line" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-500/5 text-sm font-bold outline-none border border-transparent focus:border-brand-blue text-[var(--foreground)]" />
           <textarea title="Campaign Message Body" rows={10} placeholder="Personalize with {{name}}..." value={body} onChange={e => setBody(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-500/5 text-sm font-medium outline-none border border-transparent focus:border-brand-blue resize-none text-[var(--foreground)]" />
           <button title="Launch Campaign Sequence" onClick={handleLaunch} disabled={sending} className="btn-premium-primary w-full py-5 flex items-center justify-center gap-3 text-xs tracking-widest font-heading">
             {sending ? <Activity className="animate-spin" /> : <>Launch Sequence <Send size={18} /></>}
           </button>
        </div>
      </div>
    </motion.div>
  );
}
