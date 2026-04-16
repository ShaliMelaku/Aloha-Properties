"use client";

import { useEffect, useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  FileText, 
  Search, 
  Filter, 
  X, 
  ExternalLink, 
  Download,
  Share2,
  User,
  Calendar,
  Play
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useStatus } from "@/context/status-context";
import { BlogShareButton } from "@/components/blog-share-button";

interface Publication {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  created_at: string;
  cover_image: string;
  video_url: string;
  source_label: string;
  source_url: string;
  type: 'article' | 'report' | 'guide';
  file_url: string;
  author_name: string;
}

export default function MarketTrendsHub() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filtered, setFiltered] = useState<Publication[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Publication | null>(null);
  const [viewingPDF, setViewingPDF] = useState<Publication | null>(null);
  const { notify } = useStatus();

  useEffect(() => {
    async function fetchDocs() {
      const { data } = await supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setPublications(data);
        setFiltered(data);
      }
    }
    fetchDocs();
  }, []);

  useEffect(() => {
    let result = publications;
    if (activeCategory !== 'all') {
      result = result.filter(p => p.type === activeCategory);
    }
    if (searchQuery) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFiltered(result);
  }, [activeCategory, searchQuery, publications]);

  const handleShare = useCallback(async (post: Publication) => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url });
        notify('success', 'Shared successfully');
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(url);
      notify('success', 'Link copied to clipboard');
    }
  }, [notify]);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden border-b border-[var(--border)]">
         <div className="absolute top-0 left-0 w-full h-full noise-bg opacity-20 pointer-events-none" />
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 blur-[120px] rounded-full -mr-64 -mt-64" />
         
         <div className="max-w-6xl mx-auto relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-brand-blue" />
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-blue">Aloha Market Trends</span>
               </div>
               <h1 className="text-5xl md:text-8xl font-heading font-black tracking-tighter leading-[0.85] mb-8 text-[var(--foreground)]">
                  RESEARCH <span className="opacity-30 italic">DESK.</span>
               </h1>
               <p className="text-lg md:text-xl font-medium opacity-60 max-w-xl leading-relaxed text-[var(--foreground)]">
                  Bespoke market research, strategic insights, and luxury performance analytics for the visionary investor.
               </p>
            </motion.div>
         </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="sticky top-[80px] z-[50] py-6 px-6 glass-nav border-b border-[var(--border)]">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 p-1 bg-slate-500/5 rounded-2xl border border-[var(--border)] w-full md:w-auto overflow-x-auto no-scrollbar">
               {['all', 'article', 'report', 'guide'].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      activeCategory === cat 
                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                        : 'text-[var(--foreground)] opacity-40 hover:opacity-100'
                    }`}
                  >
                     {cat}s
                  </button>
               ))}
            </div>

            <div className="relative w-full md:w-80 group">
               <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--foreground)] opacity-20 group-focus-within:text-brand-blue transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search Trends..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 className="w-full pl-14 pr-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-xs font-bold text-[var(--foreground)] transition-all"
               />
            </div>
         </div>
      </section>

      {/* Content Grid */}
      <section className="py-20 px-6 pb-40">
         <div className="max-w-6xl mx-auto">
            {filtered.length === 0 ? (
               <div className="py-40 text-center opacity-20 italic">No publications found matching your criteria.</div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filtered.map((pub, idx) => (
                     <motion.div 
                        key={pub.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden hover:border-brand-blue/40 transition-all hover:shadow-2xl h-full"
                     >
                        <div className="aspect-[16/10] relative overflow-hidden">
                           <Image 
                             src={pub.cover_image || 'https://images.unsplash.com/photo-1460472178825-e5240623abe5?auto=format&fit=crop&q=80'} 
                             alt={pub.title} 
                             fill 
                             className="object-cover group-hover:scale-105 transition-transform duration-700"
                           />
                           <div className="absolute top-6 left-6">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/40 text-white backdrop-blur-md border border-white/20 flex items-center gap-2`}>
                                 {pub.type === 'report' ? <FileText size={10} /> : <BookOpen size={10} />} {pub.type}
                              </span>
                           </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                           <div className="flex justify-between items-center mb-4 text-[10px] font-bold opacity-40 uppercase tracking-widest">
                              <span>{pub.author_name}</span>
                              <span>{new Date(pub.created_at).toLocaleDateString()}</span>
                           </div>
                           <h3 className="text-xl font-heading font-black tracking-tight mb-4 group-hover:text-brand-blue transition-colors leading-tight">
                              {pub.title}
                           </h3>
                           <p className="text-sm font-medium opacity-60 line-clamp-2 mb-8 flex-1 leading-relaxed">
                              {pub.excerpt}
                           </p>
                           
                           <div className="flex gap-3">
                              <button 
                                onClick={() => pub.type === 'report' ? setViewingPDF(pub) : setSelectedPost(pub)}
                                className="flex-1 py-3 bg-brand-blue/5 border border-brand-blue/10 text-brand-blue rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                {pub.type === 'report' ? 'View PDF' : 'Read Article'} <ArrowRight size={14} />
                              </button>
                               <button 
                                 onClick={() => handleShare(pub)}
                                 className="w-12 h-12 border border-[var(--border)] rounded-xl flex items-center justify-center opacity-40 hover:opacity-100 transition-all"
                                 title="Share Publication"
                               >
                                  <Share2 size={16} />
                               </button>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </div>
            )}
         </div>
      </section>

      {/* Integrated PDF Viewer Modal */}
      <AnimatePresence>
         {viewingPDF && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }} 
                 onClick={() => setViewingPDF(null)} 
                 className="absolute inset-0 bg-black/95 backdrop-blur-xl" 
               />
               
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 exit={{ opacity: 0, scale: 0.9 }} 
                 className="relative w-full max-w-7xl h-full bg-slate-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col"
               >
                  <div className="flex justify-between items-center p-6 bg-slate-900 border-b border-white/5">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue border border-brand-blue/30">
                           <FileText size={20} />
                        </div>
                        <div>
                           <h4 className="text-sm font-black uppercase tracking-tight text-white">{viewingPDF.title}</h4>
                           <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-white">Full Publication • {viewingPDF.source_label || "Aloha Research"}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <a 
                          href={viewingPDF.file_url} 
                          download 
                          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-blue transition-all"
                          title="Download PDF"
                        >
                           <Download size={18} />
                        </a>
                        <button 
                          onClick={() => setViewingPDF(null)}
                          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-red-500 transition-all font-bold"
                          title="Close PDF Viewer"
                        >
                           <X size={20} />
                        </button>
                     </div>
                  </div>
                  
                  <div className="flex-1 bg-slate-800 relative">
                     {viewingPDF.file_url ? (
                        <iframe 
                          src={`${viewingPDF.file_url}#toolbar=0&view=FitH`} 
                          className="absolute inset-0 w-full h-full border-0"
                          title={`PDF Viewer: ${viewingPDF.title}`}
                        />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-white opacity-20">
                           <FileText size={48} />
                           <p className="text-xs uppercase font-black tracking-widest">Document not available</p>
                        </div>
                     )}
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Article Modal (re-used from home for sync) */}
      <AnimatePresence>
         {selectedPost && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPost(null)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-5xl max-h-[90vh] bg-[var(--background)] rounded-[3rem] border border-[var(--border)] overflow-hidden shadow-2xl flex flex-col">
                  <div className="flex justify-between items-center p-6 border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-10">
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">{selectedPost.type === 'report' ? 'Verified Report' : 'Market Analysis'}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-500/20" />
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                     </div>
                     <button onClick={() => setSelectedPost(null)} className="w-10 h-10 rounded-full bg-slate-500/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all font-bold" title="Close Article"><X size={20} /></button>
                  </div>
                  <div className="overflow-y-auto flex-1 p-6 md:p-12">
                     <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight mb-8 leading-[1.1] text-[var(--foreground)]">{selectedPost.title}</h2>
                        <div className="flex items-center gap-6 mb-12">
                           <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue"><User size={14}/></div><span className="text-xs font-bold">{selectedPost.author_name}</span></div>
                        </div>
                        {selectedPost.video_url ? (
                           <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 border border-[var(--border)] bg-black shadow-xl">
                              <iframe title="Video" src={selectedPost.video_url.replace('watch?v=', 'embed/')} className="absolute inset-0 w-full h-full" allowFullScreen />
                           </div>
                        ) : selectedPost.cover_image && (
                           <div className="relative aspect-[21/9] rounded-3xl overflow-hidden mb-12 border border-[var(--border)] shadow-xl">
                              <Image src={selectedPost.cover_image} alt={selectedPost.title} fill className="object-cover" />
                           </div>
                        )}
                        <div className="prose prose-luxury lg:prose-xl text-[var(--foreground)]">
                           <p className="text-xl font-bold italic opacity-60 leading-relaxed mb-8 border-l-4 border-brand-blue pl-6">{selectedPost.excerpt}</p>
                           <div className="whitespace-pre-wrap leading-loose font-medium opacity-80" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
