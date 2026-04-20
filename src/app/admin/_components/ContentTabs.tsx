"use client";

import { useState, useRef } from "react";
import { 
  Plus, Edit3, Trash2, Globe, FileText, Send, 
  Activity, Mail, Zap, Download, FileUp, Database,
  Search, X, File, Image as ImageIcon, CheckCircle2,
  AlertCircle, ChevronRight, Share2, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Post, Campaign } from "@/types/admin";
import { MediaUpload } from "./MediaUpload";
import { savePost } from "@/lib/admin-actions";

interface ContentTabProps {
  posts: Post[];
  loading: boolean;
  syncing: boolean;
  onSync: () => void;
  onRefresh: () => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
  setConfirmDelete: (v: { type: 'property' | 'post' | 'lead' | 'unit', id: string, name: string } | null) => void;
}

export function ContentTab({ 
  posts, loading, syncing, onSync, onRefresh, onNotify, setConfirmDelete
}: ContentTabProps) {
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);

  const handleSaveArticle = async () => {
    if (!editingPost) return;
    try {
      await savePost(editingPost);
      onNotify('success', 'Intelligence Node Synchronized.');
      setIsAddingPost(false);
      setEditingPost(null);
      onRefresh();
    } catch (e: unknown) {
      onNotify('error', e instanceof Error ? e.message : 'Article Sync Fault');
    }
  };

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
             {(syncing) ? <Activity size={14} className="animate-spin text-brand-blue" /> : "Auto Sync Intelligence"}
           </button>
           <button onClick={() => { setEditingPost({ type: 'article' }); setIsAddingPost(true); }} className="flex items-center gap-3 px-6 py-3 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all">
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
                       <button onClick={() => { setEditingPost(post); setIsAddingPost(true); }} className="text-[10px] font-black uppercase tracking-widest text-brand-blue/60 hover:text-brand-blue transition-colors flex items-center gap-1"><Edit3 size={12}/> Edit</button>
                       {post.file_url ? (
                          <a href={post.file_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1 transition-all hover:scale-105 active:scale-95"><FileText size={12}/> View PDF</a>
                       ) : (
                          <button onClick={() => { setEditingPost(post); setIsAddingPost(true); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Eye size={12}/> View Details</button>
                       )}
                    </div>
                    <button 
                       onClick={() => setConfirmDelete({ type: 'post', id: post.id!, name: post.title })} 
                       className="text-[10px] font-black uppercase tracking-widest text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                       aria-label={`Delete ${post.title}`}
                       title="Delete Intelligent Node"
                    >
                       <Trash2 size={14}/>
                    </button>
                 </div>
             </div>
          </div>
        ))}
      </div>

      {/* ─── ARTICLE EDITOR MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddingPost && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] w-full max-w-4xl p-10 overflow-y-auto max-h-[90vh] grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="md:col-span-2 flex justify-between items-start">
                  <div className="space-y-1">
                     <h2 className="text-3xl font-heading font-black tracking-tighter uppercase">Intelligence <span className="opacity-30 italic">Editor.</span></h2>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Publish articles, market reports, or guides.</p>
                  </div>
                   <button 
                      onClick={() => setIsAddingPost(false)} 
                      className="p-2 opacity-40 hover:opacity-100 transition-opacity"
                      aria-label="Close Editor"
                      title="Close"
                   >
                      <X/>
                   </button>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Content Category</label>
                     <div className="grid grid-cols-3 gap-2">
                        {(['article', 'report', 'guide'] as const).map(t => (
                           <button key={t} onClick={() => setEditingPost({...editingPost, type: t})} className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${editingPost?.type === t ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-[var(--border)] opacity-40 hover:opacity-100'}`}>{t}</button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Headline Identity</label>
                     <input placeholder="e.g. Q4 Real Estate Forecast" value={editingPost?.title || ''} onChange={e => setEditingPost({...editingPost, title: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] focus:border-brand-blue outline-none font-bold text-sm" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Source Intelligence (Link)</label>
                     <input placeholder="https://source-link.com" value={editingPost?.source_url || ''} onChange={e => setEditingPost({...editingPost, source_url: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] focus:border-brand-blue outline-none text-xs" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Content Stratum</label>
                     <textarea rows={6} placeholder="Enter article content or executive summary..." value={editingPost?.content || ''} onChange={e => setEditingPost({...editingPost, content: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] focus:border-brand-blue outline-none text-sm resize-none custom-scrollbar" />
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 px-2 flex items-center gap-2"><ImageIcon size={12}/> Cover Asset</label>
                     <MediaUpload bucket="media-assets" onUploadComplete={(url) => setEditingPost({...editingPost, cover_image: url})} label="Drop article cover image" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 px-2 flex items-center gap-2"><FileText size={12}/> PDF Brochure / Guide</label>
                     <MediaUpload bucket="media-assets" accept="application/pdf" onUploadComplete={(url) => setEditingPost({...editingPost, file_url: url})} label="Drop PDF asset here" />
                     {editingPost?.file_url && (
                        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                           <CheckCircle2 className="text-emerald-500" size={16}/>
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">PDF Sync Established</span>
                        </div>
                     )}
                  </div>
                  <button onClick={handleSaveArticle} className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all">Synchronize Intelligence</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface MarketingTabProps {
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
  onRefreshLeads: () => void;
}

export function MarketingTab({ onNotify, onRefreshLeads }: MarketingTabProps) {
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVImport = async (file: File) => {
    setIsIngesting(true);
    onNotify('info', `Ingesting Contact Node Cluster: ${file.name}`);
    
    // Simulate parsing and injection
    setTimeout(() => {
      onNotify('success', '142 new target nodes synthesized into Lead Registry.');
      setIsIngesting(false);
      onRefreshLeads();
    }, 2500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-10 shadow-sm space-y-10 relative overflow-hidden group">
        <div className="flex justify-between items-center relative z-10">
          <h2 className="text-3xl font-heading font-black tracking-tighter uppercase">Campaign <span className="opacity-30 italic">Orchestrator.</span></h2>
          <Zap className="text-brand-blue/20" size={32} />
        </div>
        
        <div className="space-y-6 relative z-10">
           <div className="space-y-2">
              <label htmlFor="target-recipient" className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Target Recipient (Leave empty for broadcast)</label>
              <input id="target-recipient" placeholder="Email or Group Node..." className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] font-bold text-xs border border-[var(--border)] focus:border-brand-blue outline-none" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Neural Subject</label>
              <input placeholder="Subject Line..." value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-[var(--background)] font-bold text-sm border border-[var(--border)] focus:border-brand-blue outline-none" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Communication Sequence</label>
              <textarea rows={10} placeholder="Lead engagement logic..." value={body} onChange={e => setBody(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-[var(--background)] text-sm border border-[var(--border)] focus:border-brand-blue outline-none resize-none" />
           </div>
           <button onClick={() => onNotify('success', 'Campaign triggered.')} disabled={sending} className="w-full py-6 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-brand-blue/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
             {sending ? <Activity className="animate-spin" /> : <>Ignite Broadcast <Send size={18} /></>}
           </button>
        </div>

        {/* Neural Grid Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-blue/5 to-transparent pointer-events-none" />
      </div>

      <div className="space-y-8">
         <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-10 space-y-8">
            <h2 className="text-2xl font-heading font-black tracking-tighter uppercase">CSV <span className="opacity-30 italic">Ingestor.</span></h2>
            <div 
               onDragOver={e => { e.preventDefault(); setIsIngesting(true); }}
               onDragLeave={() => setIsIngesting(false)}
               onDrop={e => { e.preventDefault(); handleCSVImport(e.dataTransfer.files[0]); }}
               onClick={() => fileInputRef.current?.click()}
               className={`h-64 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${isIngesting ? 'bg-brand-blue/10 border-brand-blue scale-[0.98]' : 'bg-slate-500/5 border-[var(--border)] hover:border-brand-blue/40'}`}
            >
               <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={e => handleCSVImport(e.target.files![0])} />
               <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-[var(--foreground)] opacity-40">
                  <Database size={32} />
               </div>
               <div className="text-center space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest">Drop Contact Manifest</p>
                  <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest italic">Standard CSV format supported</p>
               </div>
            </div>
         </div>

         <div className="p-8 bg-brand-blue rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Subscriber Liquidity</p>
               <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-heading font-black tracking-tighter">4,281</p>
                  <p className="text-xs font-bold opacity-60 italic uppercase tracking-widest">Active Nodes</p>
               </div>
               <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest">82% Opened</span>
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest">12% Conversion</span>
               </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform"><Database size={160} /></div>
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

      <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
        <table className="w-full text-left">
           <thead>
              <tr className="border-b border-[var(--border)] bg-slate-500/5">
                 <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Date Pulse</th>
                 <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Subject Strategy</th>
                 <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40 text-right">Reach Nodes</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-[var(--border)]">
              {history.map((c) => (
                <tr key={c.id} className="hover:bg-brand-blue/5 transition-all">
                  <td className="px-8 py-6 text-xs font-bold opacity-60 tabular-nums">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-8 py-6 text-sm font-bold">{c.subject}</td>
                  <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-blue text-right">{c.audience_size.toLocaleString()} Subscribers</td>
                </tr>
              ))}
           </tbody>
        </table>
      </div>
    </motion.div>
  );
}
