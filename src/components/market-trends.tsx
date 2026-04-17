"use client";

import { useEffect, useState, useCallback } from "react";
import { useStatus } from "@/context/status-context";
import { supabaseClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, User, Share2, ExternalLink } from "lucide-react";
import Image from "next/image";

interface NewsArticle {
  title: string;
  url: string;
  description: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  video_url?: string;
  source_label?: string;
  source_url?: string;
  author_name: string;
  created_at: string;
}

export function MarketTrends() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [activeMode, setActiveMode] = useState<'editorial' | 'pulse'>('editorial');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useStatus();

  const handleShare = useCallback(async (post: Post) => {
    const url = `${window.location.origin}/blog/${post.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: url,
        });
        notify('success', 'Article shared successfully');
      } catch {
        notify('error', 'Error sharing article');
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        notify('success', 'Link copied to clipboard');
      } catch {
        notify('error', 'Failed to copy link');
      }
    }
  }, [notify]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch Editorial Posts
      const { data: postsData } = await supabaseClient.from('posts').select('*').order('created_at', { ascending: false }).limit(3);
      if (postsData) setPosts(postsData);

      // Fetch Live News
      try {
        const newsRes = await fetch('/api/news');
        const newsData = await newsRes.json();
        if (newsData.articles) setNews(newsData.articles);
      } catch {
        console.error("News fetch failed");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <section id="blog" className="py-32 bg-[var(--card)] border-y border-[var(--border)] overflow-hidden">
       <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 text-left">
             <div className="max-w-xl">
                 <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-px bg-brand-blue" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue">Market Trends</span>
                 </motion.div>
                 <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-4xl md:text-6xl font-black tracking-tighter text-[var(--foreground)]">
                   {activeMode === 'editorial' ? 'EDITORIAL ' : 'LIVE NEWS '}
                   <span className="opacity-30 italic">PULSE.</span>
                 </motion.h2>
             </div>
             
             <div className="flex items-center gap-2 p-1.5 bg-[var(--background)] rounded-2xl border border-[var(--border)] w-full md:w-auto">
                <button 
                  onClick={() => setActiveMode('editorial')}
                  className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'editorial' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'opacity-40 hover:opacity-100'}`}
                >
                  Insights
                </button>
                <button 
                  onClick={() => setActiveMode('pulse')}
                  className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'pulse' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'opacity-40 hover:opacity-100'}`}
                >
                  Live Feed
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="aspect-square rounded-[2.5rem] bg-slate-500/5 animate-pulse" />)
              ) : activeMode === 'editorial' ? (
                posts.map((post, idx) => (
                  <motion.div 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="block group cursor-pointer bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:border-brand-blue/40 transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full"
                  >
                      <div className="flex justify-between items-center mb-6">
                         <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full">{post.author_name}</span>
                         <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-2xl font-heading font-black tracking-tight mb-4 group-hover:text-brand-blue transition-colors text-[var(--foreground)]">{post.title}</h3>
                      <p className="text-sm font-medium opacity-60 line-clamp-3 mb-8 flex-1 text-[var(--foreground)]">{post.excerpt}</p>
                      
                      <div className="flex items-center text-xs font-black uppercase tracking-widest text-[var(--foreground)] group-hover:text-brand-blue transition-colors">
                         Read Article <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform" />
                      </div>
                  </motion.div>
                ))
              ) : (
                news.map((item, idx) => (
                  <motion.a 
                    key={idx}
                    href={item.url}
                    target="_blank"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:border-brand-blue/40 transition-all flex flex-col shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">{item.source.name}</span>
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{new Date(item.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-heading font-black tracking-tight mb-4 line-clamp-2 text-[var(--foreground)] group-hover:text-brand-blue">{item.title}</h3>
                    <p className="text-xs opacity-60 line-clamp-3 mb-6 flex-1 text-[var(--foreground)]">{item.description}</p>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">External Feed</span>
                       <ExternalLink size={14} className="text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.a>
                ))
              )}
          </div>
        </div>


        {/* Detailed Article Modal */}
        <AnimatePresence>
           {selectedPost && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
                 <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }} 
                   onClick={() => setSelectedPost(null)} 
                   className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
                 />
                 
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9, y: 40 }} 
                   animate={{ opacity: 1, scale: 1, y: 0 }} 
                   exit={{ opacity: 0, scale: 0.9, y: 40 }} 
                   className="relative w-full max-w-5xl max-h-[90vh] bg-[var(--background)] rounded-[3rem] border border-[var(--border)] overflow-hidden shadow-2xl flex flex-col"
                 >
                    {/* Header Action Bar */}
                    <div className="flex justify-between items-center p-6 border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-10">
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Market Intelligence</span>
                          <div className="w-1 h-1 rounded-full bg-slate-500/20" />
                          <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                       </div>
                       <button 
                         onClick={() => setSelectedPost(null)}
                         className="w-10 h-10 rounded-full bg-slate-500/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all font-bold"
                         title="Close Article"
                       >
                          <X size={20} />
                       </button>
                    </div>

                    <div className="overflow-y-auto flex-1 p-6 md:p-12">
                       <div className="max-w-3xl mx-auto">
                          <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight mb-8 leading-[1.1] text-[var(--foreground)]">
                             {selectedPost.title}
                          </h2>

                          <div className="flex items-center gap-6 mb-12">
                             <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue"><User size={14}/></div>
                                <span className="text-xs font-bold">{selectedPost.author_name}</span>
                             </div>
                             <button 
                               onClick={() => handleShare(selectedPost)}
                               className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-all ml-auto hover:text-brand-blue"
                               title="Share Article"
                             >
                                <Share2 size={14} />
                             </button>
                          </div>

                          {/* Media Section */}
                          {selectedPost.video_url ? (
                             <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 border border-[var(--border)] bg-black shadow-xl">
                                <iframe 
                                  title="Featured Video"
                                  src={selectedPost.video_url.replace('watch?v=', 'embed/')} 
                                  className="absolute inset-0 w-full h-full"
                                  allowFullScreen
                                />
                             </div>
                          ) : selectedPost.cover_image && (
                             <div className="relative aspect-[21/9] rounded-3xl overflow-hidden mb-12 border border-[var(--border)] shadow-xl">
                                <Image src={selectedPost.cover_image} alt={selectedPost.title} fill className="object-cover" />
                             </div>
                          )}

                          <div className="prose prose-luxury lg:prose-xl text-[var(--foreground)]">
                             <p className="text-xl font-bold italic opacity-60 leading-relaxed mb-8 border-l-4 border-brand-blue pl-6">
                                {selectedPost.excerpt}
                             </p>
                             <div className="whitespace-pre-wrap leading-loose font-medium opacity-80" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                          </div>

                          {selectedPost.source_url && (
                             <div className="mt-16 p-8 bg-brand-blue/5 rounded-3xl border border-brand-blue/10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-1">Verify Intelligence</p>
                                   <p className="text-sm font-bold opacity-60">Source: {selectedPost.source_label || 'External Report'}</p>
                                </div>
                                <a 
                                  href={selectedPost.source_url} 
                                  target="_blank" 
                                  className="px-6 py-3 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                   View Original Source <ExternalLink size={12} />
                                </a>
                             </div>
                          )}
                       </div>
                    </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>
     </section>
  );
}
