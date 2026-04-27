"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, LayoutGrid, MessageSquare, X, ExternalLink, Clock, Newspaper } from "lucide-react";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabase";

interface PartialProperty {
  id: string;
  name: string;
  location: string;
  cover_image?: string;
  images?: string[];
}

interface NewsArticle {
  title: string;
  description: string;
  content?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  source?: { name: string; url?: string };
  type?: string;
}

export function VisionTeaser() {
  return (
    <section className="py-20 md:py-32 px-6 bg-[var(--background)] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-6 md:space-y-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-px bg-brand-blue" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-blue">Aloha Vision</span>
            </div>
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-heading font-black tracking-tighter leading-[0.85]">
              DEFINING <br />
              <span className="opacity-30 italic text-brand-blue">EXCELLENCE.</span>
            </h2>
            <p className="text-lg md:text-xl opacity-60 font-medium leading-relaxed max-w-xl">
              From bespoke placement to global investment standards, Aloha is reshaping the Addis Ababa skyline with integrity and architectural soul.
            </p>
            <div className="pt-4">
              <Link href="/about" className="btn-premium-primary text-xs tracking-wider uppercase inline-flex items-center gap-3 group">
                Our Journey <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>

          <div className="flex-1 relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5]">
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border border-[var(--border)]"
            >
              <Image
                src="/images/home/vision-highrise.png"
                alt="Luxury Highrise in Addis"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>

            {/* Overlapping Detail Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50, x: 50 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-10 -left-10 md:-bottom-16 md:-left-16 w-3/5 aspect-square rounded-[2.5rem] overflow-hidden shadow-3xl border-8 border-[var(--background)] z-10"
            >
              <Image
                src="/images/home/vision-interior.png"
                alt="Bespoke Interior"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Floating Stats */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-12 -right-6 md:-right-12 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-[var(--border)] z-20 hidden sm:block"
            >
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-heading font-black text-brand-blue">98%</span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Client Satisfaction</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Clean, premium Product Card with subtle hover effects
function ProductCard({ prop, idx }: { prop: PartialProperty; idx: number }) {
  const FALLBACKS = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80',
  ];
  const imgSrc = prop.cover_image || prop.images?.[0] || FALLBACKS[idx % FALLBACKS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer shadow-xl border border-[var(--border)] bg-[var(--card)]"
    >
      <Image
        src={imgSrc}
        alt={prop.name}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
        sizes="(max-width: 768px) 100vw, 400px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      
      <div className="absolute top-6 right-6">
        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
           <ArrowRight size={18} />
        </div>
      </div>

      <div className="absolute bottom-8 left-8 right-8">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-blue">{prop.location}</span>
          <h4 className="text-xl font-heading font-black text-white tracking-tight leading-tight group-hover:text-brand-blue transition-colors duration-300">{prop.name}</h4>
          <div className="h-px w-0 group-hover:w-12 bg-brand-blue transition-all duration-500 mt-2" />
        </div>
      </div>
      <Link href={`/products?id=${prop.id}`} className="absolute inset-0 z-10" />
    </motion.div>
  );
}

export function ProductsTeaser() {
  const [properties, setProperties] = useState<PartialProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    async function fetchTopProperties() {
      const { data } = await supabaseClient
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10); 
      if (data) setProperties(data);
      setLoading(false);
    }
    fetchTopProperties();
  }, []);

  const controls = useAnimation();
  
  useEffect(() => {
    if (!loading && properties.length > 0) {
      controls.start({
        x: "-50%",
        transition: { 
          duration: 40, 
          repeat: Infinity, 
          ease: "linear" 
        }
      });
    }
  }, [loading, properties, controls]);

  useEffect(() => {
    if (isPaused) {
      controls.stop();
    } else if (!loading && properties.length > 0) {
      // Resume from current position is tricky with pure animate, 
      // but restarting the sequence is acceptable for a marquee.
      controls.start({
        x: "-50%",
        transition: { 
          duration: 40, 
          repeat: Infinity, 
          ease: "linear" 
        }
      });
    }
  }, [isPaused, controls, loading, properties]);

  // Marquee logic: Double the items for seamless loop
  const marqueeItems = [...properties, ...properties];

  return (
    <section className="py-32 bg-slate-500/5 border-y border-[var(--border)] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
        <div className="max-w-xl text-left">
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="flex items-center gap-2 mb-4"
          >
            <div className="w-8 h-px bg-brand-blue" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue">Registry Highlights</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tighter mb-4 text-[var(--foreground)]">
            PREMIUM <br />
            <span className="opacity-30 italic">PRODUCTS.</span>
          </h2>
          <p className="opacity-60 font-medium text-[var(--foreground)]">A selection of high-performance units from the Aloha Registry.</p>
        </div>
        <Link href="/products" className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-brand-blue text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-blue/20">
          Enter Registry <LayoutGrid size={16} className="group-hover:rotate-12 transition-transform" />
        </Link>
      </div>

      {/* Perfectly Smooth Marquee Slider */}
      <div 
        className="relative flex overflow-hidden group cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div 
          className="flex gap-8 whitespace-nowrap"
          animate={controls}
          style={{ width: "fit-content" }}
        >
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex-shrink-0 w-[300px] md:w-[400px] aspect-[4/5] rounded-[2rem] bg-slate-500/10 animate-pulse" />
            ))
          ) : (
            marqueeItems.map((prop, idx) => (
              <div key={`${prop.id}-${idx}`} className="flex-shrink-0 w-[300px] md:w-[400px]">
                <ProductCard prop={prop} idx={idx} />
              </div>
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Full Story Modal ─────────────────────────────────────── */
function NewsStoryModal({ article, onClose }: { article: NewsArticle; onClose: () => void }) {
  const isVideo = article.url && (article.url.includes('youtube') || article.url.includes('youtu.be') || article.url.includes('vimeo'));

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-lg flex items-end sm:items-center justify-center p-0 sm:p-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-[var(--background)] rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-[var(--border)]"
        >
          {/* Cover Image / Video */}
          {isVideo ? (
            <div className="relative w-full aspect-video flex-shrink-0 bg-black">
              <iframe
                src={article.url}
                title={article.title}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : article.image ? (
            <div className="relative w-full h-52 sm:h-64 flex-shrink-0 overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 640px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />
              {/* Breaking badge on image */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 bg-brand-blue text-white text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-full shadow-lg">
                  <Newspaper size={10} /> Breaking News
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-20 flex-shrink-0 bg-gradient-to-br from-brand-blue/20 to-transparent flex items-center px-8 pt-6">
              <span className="inline-flex items-center gap-1.5 bg-brand-blue text-white text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-full">
                <Newspaper size={10} /> Breaking News
              </span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            title="Close"
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all border border-white/10"
          >
            <X size={18} />
          </button>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-10 pb-8 pt-6">
            {/* Source + date */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {article.source?.name && (
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full">
                  {article.source.name}
                </span>
              )}
              {article.publishedAt && (
                <span className="flex items-center gap-1 text-[10px] font-bold opacity-40 uppercase tracking-widest">
                  <Clock size={10} />
                  {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
              {article.type && (
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30 border border-[var(--border)] px-2 py-0.5 rounded-full">
                  {article.type}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-[var(--foreground)] mb-4 leading-tight">
              {article.title}
            </h2>

            {/* Description */}
            {article.description && (
              <p className="text-base font-medium opacity-70 mb-6 leading-relaxed text-[var(--foreground)]">
                {article.description}
              </p>
            )}

            {/* Full content */}
            {article.content && article.content !== article.description && (
              <div className="prose-sm text-[var(--foreground)] opacity-80 leading-relaxed space-y-4 text-sm">
                {article.content.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i}>{para.replace(/\[\+\d+ chars\]$/, '').trim()}</p>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="my-6 h-px bg-[var(--border)]" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20"
                >
                  Open Full Article <ExternalLink size={14} />
                </a>
              )}
              <Link
                href="/market-trends"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-[var(--border)] text-[var(--foreground)] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-500/10 transition-all"
              >
                More Insights <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Trends Teaser Section ────────────────────────────────── */
export function TrendsTeaser() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      // 1. Fetch Manual Posts from Supabase
      const { data: manualPosts } = await supabaseClient
        .from('posts')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5);

      const manualArticles = (manualPosts || []).map(post => ({
        title: post.title,
        description: post.excerpt,
        content: post.content,
        url: `/blog/${post.slug}`,
        image: post.cover_image,
        publishedAt: post.created_at,
        source: { name: post.author_name || 'Aloha Research' },
        type: post.type
      }));

      // 2. Fetch External News as fallback/filler
      const res = await fetch('/api/news');
      const data = await res.json();
      const externalArticles = data.articles || [];

      // 3. Merge: Prioritize manual posts
      const merged = [...manualArticles, ...externalArticles];
      setArticles(merged.slice(0, 5));
      
    } catch (err) {
      console.error('News fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const topArticle = articles[0];
  const sideArticles = articles.slice(1, 4);

  return (
    <>
      {/* ── Full-Story Modal ── */}
      {selectedArticle && (
        <NewsStoryModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}

      <section className="py-20 md:py-32 px-6 bg-[var(--background)]">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <BookOpen size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--foreground)] opacity-40">Insights Highlights</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-heading font-black tracking-tighter text-[var(--foreground)]">
                MARKET PERFORMANCE <br />
                <span className="text-brand-blue italic">LIVE PULSE.</span>
              </h2>
            </div>
            <Link href="/market-trends" className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-brand-blue shrink-0 group">
              Full News Desk
              <div className="w-10 h-10 rounded-full border border-brand-blue/30 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all">
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>

          {loading ? (
            /* Loading skeleton */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-80 rounded-[2rem] bg-slate-500/10 animate-pulse" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-500/10 animate-pulse" />)}
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-slate-500/5 rounded-[2.5rem] p-10 md:p-20 border border-[var(--border)] text-center">
              <p className="text-lg opacity-50 font-medium">Live market insights arriving shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ── Hero article (left / top) ── */}
              {topArticle && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="md:col-span-2 group relative flex flex-col rounded-[2rem] overflow-hidden border border-[var(--border)] bg-[var(--card)] hover:border-brand-blue/30 transition-all shadow-xl cursor-pointer"
                  onClick={() => setSelectedArticle(topArticle)}
                >
                  {/* Cover image */}
                  {topArticle.image && (
                    <div className="relative h-48 sm:h-64 w-full overflow-hidden flex-shrink-0">
                      <Image
                        src={topArticle.image}
                        alt={topArticle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-black/20 to-transparent" />
                    </div>
                  )}
                  <div className="flex-1 p-6 sm:p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 bg-brand-blue text-white text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-full">
                        <Newspaper size={9} /> Breaking
                      </span>
                      {topArticle.source?.name && (
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{topArticle.source.name}</span>
                      )}
                      {topArticle.publishedAt && (
                        <span className="flex items-center gap-1 text-[10px] font-bold opacity-30 uppercase tracking-widest ml-auto">
                          <Clock size={10} />
                          {new Date(topArticle.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-black text-xl sm:text-2xl tracking-tight text-[var(--foreground)] mb-3 leading-tight group-hover:text-brand-blue transition-colors">
                      {topArticle.title}
                    </h3>
                    <p className="text-sm opacity-60 line-clamp-3 text-[var(--foreground)] leading-relaxed flex-1">
                      {topArticle.description}
                    </p>
                    {/* Read full story CTA */}
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedArticle(topArticle); }}
                      className="mt-6 self-start flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-blue group/btn"
                    >
                      Read the whole story
                      <span className="w-8 h-8 rounded-full border border-brand-blue/30 flex items-center justify-center group-hover/btn:bg-brand-blue group-hover/btn:text-white transition-all">
                        <ArrowRight size={13} />
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Side articles (right / below) ── */}
              <div className="flex flex-col gap-4">
                {sideArticles.map((art, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelectedArticle(art)}
                    className="group flex gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-brand-blue/30 hover:shadow-lg cursor-pointer transition-all"
                  >
                    {/* Thumbnail */}
                    {art.image && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <Image 
                          src={art.image} 
                          alt={art.title} 
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                          sizes="80px"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue mb-1 opacity-80">
                        {art.source?.name || 'Aloha News'}
                      </p>
                      <h4 className="text-sm font-bold text-[var(--foreground)] line-clamp-2 leading-snug group-hover:text-brand-blue transition-colors">
                        {art.title}
                      </h4>
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedArticle(art); }}
                        className="mt-2 text-[9px] font-black uppercase tracking-widest text-brand-blue/60 hover:text-brand-blue flex items-center gap-1 transition-colors"
                      >
                        Read story <ArrowRight size={10} />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* View all CTA */}
                <Link
                  href="/market-trends"
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-brand-blue/20 text-[10px] font-black uppercase tracking-widest text-brand-blue hover:bg-brand-blue/5 hover:border-brand-blue/40 transition-all"
                >
                  View All News <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}


export function ContactTeaser() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 p-12 bg-brand-blue rounded-[3rem] shadow-2xl shadow-brand-blue/20">
         <div className="max-w-lg text-center md:text-left">
            <h2 className="text-4xl font-heading font-black text-white tracking-tighter mb-4">READY TO ACQUIRE?</h2>
            <p className="text-white/60 font-medium text-sm">Our expert advisory team is standing by to guide your next placement.</p>
         </div>
         <Link href="/contact" className="px-10 py-4 bg-white text-brand-blue rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-transform">
            Inquire Now <MessageSquare size={16} />
         </Link>
      </div>
    </section>
  );
}
