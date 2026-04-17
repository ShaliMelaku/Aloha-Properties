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
  type?: 'article' | 'report' | 'guide';
  file_url?: string;
}

export function MarketTrends() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeMode, setActiveMode] = useState<'all' | 'article' | 'reports' | 'guides' | 'news'>('all');
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
      // 1. Supabase editorial posts
      const { data: postsData } = await supabaseClient
        .from('posts').select('*').order('created_at', { ascending: false });

      // 2. Live news API articles
      let apiPosts: Post[] = [];
      try {
        const res = await fetch('/api/news');
        const data = await res.json();
        if (data.articles && Array.isArray(data.articles)) {
          apiPosts = (data.articles as Array<{
            title: string; description?: string; content?: string;
            url?: string; image?: string; publishedAt?: string;
            source?: { name: string }; type?: string;
          }>).map((a, i) => ({
            id: `api-${i}-${(a.title || '').slice(0, 20)}`,
            title: a.title || 'Untitled',
            slug: `news-${(a.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)}-${i}`,
            excerpt: a.description || '',
            content: a.content || a.description || '',
            cover_image: a.image || undefined,
            source_url: a.url || undefined,
            source_label: a.source?.name || 'Aloha Intelligence',
            author_name: 'Aloha Intelligence',
            created_at: a.publishedAt || new Date().toISOString(),
            type: 'article' as const,
          }));
        }
      } catch { /* silent */ }

      // 3. Merge: editorial first, then API. Deduplicate by title prefix.
      const supabasePosts: Post[] = postsData || [];
      const supabaseTitles = new Set(supabasePosts.map(p => p.title.toLowerCase().slice(0, 40)));
      const uniqueApiPosts = apiPosts.filter(p => !supabaseTitles.has(p.title.toLowerCase().slice(0, 40)));
      setPosts([...supabasePosts, ...uniqueApiPosts]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredPosts = posts.filter(post => {
    if (activeMode === 'all') return true;
    // Treat null/undefined type as 'article' (legacy AI posts stored without type)
    const postType = post.type ?? 'article';
    if (activeMode === 'reports') return postType === 'report';
    if (activeMode === 'guides') return postType === 'guide';
    if (activeMode === 'news') return post.author_name === 'Aloha Intelligence';
    if (activeMode === 'article') return post.author_name !== 'Aloha Intelligence' && postType === 'article';
    return true;
  });

  return (
    <section id="blog" className="py-32 bg-[var(--card)] border-y border-[var(--border)] overflow-hidden">
       <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 text-left">
             <div className="max-w-xl">
                 <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-px bg-brand-blue" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue">News & Market Intelligence</span>
                 </motion.div>
                 <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-4xl md:text-6xl font-black tracking-tighter text-[var(--foreground)]">
                   GLOBAL MARKET <br className="hidden md:block"/>
                   <span className="opacity-30 italic">INSIGHTS.</span>
                 </motion.h2>
             </div>
             
             <div className="flex items-center gap-1 p-1.5 bg-[var(--background)] rounded-2xl border border-[var(--border)] w-full overflow-x-auto no-scrollbar whitespace-nowrap md:w-auto">
                {(['all', 'article', 'reports', 'guides', 'news'] as const).map((mode) => (
                  <button 
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    className={`px-4 md:px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === mode ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'opacity-40 hover:opacity-100'}`}
                  >
                    {mode === 'article' ? 'Articles' : mode}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="aspect-square rounded-[2.5rem] bg-slate-500/5 animate-pulse" />)
              ) : (
                filteredPosts.slice(0, 9).map((post, idx) => (
                  <motion.div 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="block group cursor-pointer bg-[var(--background)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden hover:border-brand-blue/40 transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full"
                  >
                      {/* Cover image â€” shown for API news that has images */}
                      {post.cover_image && (
                        <div className="relative h-44 w-full overflow-hidden flex-shrink-0">
                          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
                        </div>
                      )}
                      <div className="flex flex-col flex-1 p-8">
                        <div className="flex justify-between items-center mb-6">
                           <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full">{post.source_label || post.author_name}</span>
                           <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-heading font-black tracking-tight mb-4 group-hover:text-brand-blue transition-colors text-[var(--foreground)]">{post.title}</h3>
                        <p className="text-xs font-medium opacity-60 line-clamp-3 mb-8 flex-1 text-[var(--foreground)]">{post.excerpt}</p>
                        <div className="flex items-center text-xs font-black uppercase tracking-widest text-[var(--foreground)] group-hover:text-brand-blue transition-colors">
                           Read Story <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                  </motion.div>
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
                           <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">News</span>
                           <div className="w-1 h-1 rounded-full bg-slate-500/20" />
                           <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                           {selectedPost.source_label && (
                             <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest hidden sm:block">â€” {selectedPost.source_label}</span>
                           )}
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedPost.source_url && (
                            <a href={selectedPost.source_url} target="_blank" rel="noopener noreferrer" title="Open Original Source"
                               className="w-9 h-9 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all">
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button 
                            onClick={() => setSelectedPost(null)}
                            className="w-10 h-10 rounded-full bg-slate-500/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all font-bold"
                            title="Close Article"
                          >
                             <X size={20} />
                          </button>
                        </div>
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
                                <img src={selectedPost.cover_image} alt={selectedPost.title} className="absolute inset-0 w-full h-full object-cover" />
                             </div>
                          )}

                          <div className="prose prose-luxury lg:prose-xl text-[var(--foreground)]">
                             <p className="text-xl font-bold italic opacity-60 leading-relaxed mb-8 border-l-4 border-brand-blue pl-6">
                                {selectedPost.excerpt}
                             </p>
                             {selectedPost.source_url ? (
                               <div className="w-full h-[60vh] rounded-3xl overflow-hidden border border-brand-blue/20 bg-white shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] mt-8 mb-12">
                                 <iframe 
                                   src={selectedPost.source_url} 
                                   className="w-full h-full" 
                                   title={selectedPost.title} 
                                   sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                 />
                               </div>
                             ) : (
                               <div className="whitespace-pre-wrap leading-loose font-medium opacity-80" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                             )}
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
