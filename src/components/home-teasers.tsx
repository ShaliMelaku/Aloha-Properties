"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Front card — full intensity tilt
  const rotateXFront = useTransform(mouseY, [-0.5, 0.5], [12, -12]);
  const rotateYFront = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  // Back-left card — exaggerated Y for strong parallax
  const rotateXBackL = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
  const rotateYBackL = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
  // Back-right card — inverted Y for depth separation
  const rotateXBackR = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
  const rotateYBackR = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <section className="py-20 md:py-32 px-6 bg-[var(--background)] overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex-1 space-y-6 md:space-y-8 text-center md:text-left"
        >
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-px bg-brand-blue" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-blue">Aloha Vision</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-heading font-black tracking-tighter leading-[0.9]">
            DEFINING <br />
            <span className="opacity-30 italic">LUXURY.</span>
          </h2>
          <p className="text-base md:text-lg opacity-60 font-medium leading-relaxed max-w-md mx-auto md:mx-0">
            From bespoke placement to global investment standards, discover how we are reshaping the Addis Ababa skyline.
          </p>
          <Link href="/about" className="btn-premium-primary text-xs tracking-wider uppercase inline-flex items-center gap-2 group">
            Our Journey <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>

        {/* Interactive Poker Card Stack */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="flex-1 relative w-full h-[280px] sm:h-[440px] md:h-[600px] flex items-center justify-center"
          style={{ perspective: '1200px', cursor: 'crosshair' }}
        >
          {/* Card 1 — Back Left */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotate: 0 }}
            whileInView={{ opacity: 1, x: -55, rotate: -10 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ rotateX: rotateXBackL, rotateY: rotateYBackL, position: 'absolute', zIndex: 10 }}
            className="aspect-[4/5] w-48 sm:w-52 md:w-64 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group"
          >
            <Image
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80"
              alt="Luxury Residence"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 30vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white/70 text-[10px] font-medium italic leading-snug">&quot;Architecture is where art meets science.&quot;</p>
            </div>
          </motion.div>

          {/* Card 2 — Back Right */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotate: 0 }}
            whileInView={{ opacity: 1, x: 55, rotate: 10 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            style={{ rotateX: rotateXBackR, rotateY: rotateYBackR, position: 'absolute', zIndex: 10 }}
            className="aspect-[4/5] w-48 sm:w-52 md:w-64 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group"
          >
            <Image
              src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80"
              alt="Luxury Interior"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 30vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white/70 text-[10px] font-medium italic leading-snug">&quot;The finest homes are silent poetry.&quot;</p>
            </div>
          </motion.div>

          {/* Card 3 — Center Front (primary) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            style={{ rotateX: rotateXFront, rotateY: rotateYFront, position: 'absolute', zIndex: 20 }}
            whileHover={{ scale: 1.03 }}
            className="aspect-[4/5] w-52 sm:w-60 md:w-72 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/20 group"
          >
            <Image
              src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80"
              alt="Aloha Signature Property"
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 60vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-5 md:bottom-8 left-5 md:left-8 right-5 md:right-8">
              <div className="w-8 md:w-12 h-1 bg-brand-blue mb-3 md:mb-4" />
              <p className="text-white text-sm md:text-lg font-heading font-black tracking-tight leading-tight">
                &quot;Integrity is the bedrock of our investment strategy.&quot;
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Interactive property poker card with 3D mouse-tracking tilt and unique quote
function PropertyPokerCard({ prop, idx }: { prop: PartialProperty; idx: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);

  const QUOTES = [
    '"Crafted for the visionary few."',
    '"Where heritage meets modern luxury."',
    '"The art of living, elevated."',
  ];
  const FALLBACKS = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80',
  ];
  const imgSrc = prop.cover_image || prop.images?.[0] || FALLBACKS[idx % FALLBACKS.length];
  const quote = QUOTES[idx % QUOTES.length];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      onMouseMove={(e) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      style={{ rotateX, rotateY, perspective: 1000 }}
      whileHover={{ scale: 1.03, boxShadow: '0 32px 64px rgba(0,0,0,0.45)' }}
      className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden cursor-pointer"
    >
      <Image
        src={imgSrc}
        alt={prop.name}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-700"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute bottom-8 left-8 right-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-1">{prop.location}</p>
        <h4 className="text-2xl font-heading font-black text-white tracking-tight mb-3">{prop.name}</h4>
        <p className="text-xs text-white/60 italic font-medium leading-snug
          translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-500 ease-out">{quote}</p>
      </div>
      <Link href={`/portfolio?id=${prop.id}`} className="absolute inset-0 z-10" />
    </motion.div>
  );
}

export function PortfolioTeaser() {
  const [properties, setProperties] = useState<PartialProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopProperties() {
      const { data } = await supabaseClient
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) setProperties(data);
      setLoading(false);
    }
    fetchTopProperties();
  }, []);

  return (
    <section className="py-32 px-6 bg-slate-500/5 border-y border-[var(--border)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
        <div className="max-w-xl text-left">
          <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tighter mb-4 text-[var(--foreground)]">
            CURATED <br />
            <span className="opacity-30 italic">COLLECTIONS.</span>
          </h2>
          <p className="opacity-60 font-medium text-[var(--foreground)]">A selection of premium high-performance units from the Aloha Registry.</p>
        </div>
        <Link href="/portfolio" className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-brand-blue text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-blue/20">
          Enter Registry <LayoutGrid size={16} className="group-hover:rotate-12 transition-transform" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="aspect-[3/4] rounded-[2.5rem] bg-slate-500/10 animate-pulse" />)
        ) : properties.map((prop, idx) => (
          <PropertyPokerCard key={prop.id} prop={prop} idx={idx} />
        ))}
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
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles.slice(0, 5));
      }
    } catch {
      // silent fallback
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
