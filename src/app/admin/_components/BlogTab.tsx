"use client";

import { motion } from "framer-motion";
import { 
  Edit3, Plus, Activity, FileSpreadsheet, 
  Trash2, Bookmark
} from "lucide-react";
import Image from "next/image";
import { Post } from "@/types/admin";

interface BlogTabProps {
  posts: Post[];
  loading: boolean;
  syncing: boolean;
  syncNews: () => void;
  setIsAddingPost: (v: boolean) => void;
  setNewPost: React.Dispatch<React.SetStateAction<Partial<Post>>>;
  setEditingPost: (p: Post | null) => void;
  setConfirmDelete: (v: { type: 'property' | 'post' | 'lead', id: string, name: string } | null) => void;
}

export function BlogTab({
  posts,
  loading,
  syncing,
  syncNews,
  setIsAddingPost,
  setNewPost,
  setEditingPost,
  setConfirmDelete
}: BlogTabProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-10"
    >
      {/* Blog Control Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h2 className="text-4xl font-heading font-black tracking-tighter uppercase text-[var(--foreground)]">
            Content <span className="opacity-30 italic">Studio.</span>
          </h2>
          <p className="text-xs font-bold opacity-40 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <Bookmark size={14} className="text-brand-blue" /> Narrative & Market Intelligence
          </p>
        </div>
        <div className="flex gap-4">
           <button 
              onClick={syncNews}
              disabled={syncing}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border border-[var(--border)] text-[var(--foreground)] bg-[var(--card)] shadow-xl ${syncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-blue hover:text-white hover:border-brand-blue hover:-translate-y-1'}`}
           >
              <Activity size={18} className={syncing ? 'animate-spin' : ''} /> 
              {syncing ? 'Syncing...' : 'Sync Market Pulse'}
           </button>
           <button 
             onClick={() => { 
                setNewPost({ title: '', slug: '', excerpt: '', content: '', cover_image: '', video_url: '', source_label: '', source_url: '', type: 'article', file_url: '', is_deleted: false }); 
                setEditingPost(null); 
                setIsAddingPost(true); 
             }} 
             className="px-8 py-4 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-blue/20"
           >
              <Plus size={20} /> Create Manuscript
           </button>
        </div>
      </div>

      <div className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] p-12 shadow-2xl space-y-8">
         {loading ? (
           <div className="py-24 text-center">
              <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <p className="text-xs font-black uppercase tracking-[0.4em] opacity-30">Retrieving Archive...</p>
           </div>
         ) : posts.length === 0 ? (
           <div className="py-24 text-center space-y-6">
              <div className="w-20 h-20 bg-[var(--background)] rounded-3xl mx-auto flex items-center justify-center text-[var(--foreground)] opacity-20"><Edit3 size={40} /></div>
              <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Archive empty. Initialize transmission.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="flex flex-col lg:flex-row lg:items-center gap-8 p-8 rounded-[2.5rem] bg-[var(--background)] border border-[var(--border)] hover:border-brand-blue/30 transition-all group relative overflow-hidden shadow-sm">
                   <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity">
                      <Edit3 size={120} />
                   </div>
                   
                   <div className="w-full lg:w-48 h-32 rounded-2xl overflow-hidden bg-slate-500/20 border border-[var(--border)] shrink-0 relative shadow-xl">
                      <Image 
                        src={post.cover_image || "/images/cover.jpg"} 
                        alt={post.title} 
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>

                   <div className="flex-1 space-y-3 relative z-10">
                      <div className="flex items-center gap-4">
                         <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-widest rounded-lg border border-brand-blue/20">{post.type}</span>
                         <span className="text-[9px] font-black uppercase tracking-widest opacity-30 text-[var(--foreground)]">{new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                      </div>
                      <h3 className="font-heading font-black text-2xl text-[var(--foreground)] tracking-tighter leading-none group-hover:text-brand-blue transition-colors">{post.title}</h3>
                      <p className="text-[11px] font-black opacity-40 uppercase tracking-widest font-mono">/{post.slug}</p>
                   </div>

                   <div className="flex flex-wrap gap-4 items-center relative z-10 lg:border-l lg:border-[var(--border)] lg:pl-8 lg:h-20">
                       {post.file_url ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                             <FileSpreadsheet size={16} />
                             <span className="text-[10px] font-black uppercase tracking-widest leading-none">PDF Linked</span>
                          </div>
                       ) : (
                          <button 
                            onClick={() => { setEditingPost(post); setIsAddingPost(true); }}
                            className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/30 hover:text-brand-blue flex items-center gap-2 group/add px-4 py-2 rounded-full border border-[var(--border)] hover:border-brand-blue/30 transition-all"
                          >
                             <Plus size={14} className="group-hover/add:rotate-90 transition-transform" /> Attach Asset
                          </button>
                       )}
                       
                       <div className="flex gap-2">
                          <button title="Edit Article" onClick={() => { setEditingPost(post); setIsAddingPost(true); }} className="w-12 h-12 bg-[var(--card)] border border-[var(--border)] text-brand-blue rounded-xl flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all shadow-xl shadow-black/5 hover:-translate-y-1"><Edit3 size={18}/></button>
                          <button title="Delete Article" onClick={() => setConfirmDelete({ type: 'post', id: post.id, name: post.title })} className="w-12 h-12 bg-[var(--card)] border border-[var(--border)] text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-black/5 hover:-translate-y-1"><Trash2 size={18}/></button>
                       </div>
                   </div>
                </div>
              ))}
           </div>
         )}
      </div>
    </motion.div>
  );
}
