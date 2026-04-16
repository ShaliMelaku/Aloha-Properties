"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Globe, LayoutGrid, MessageSquare } from "lucide-react";
import Image from "next/image";

export function VisionTeaser() {
  return (
    <section className="py-32 px-6 bg-[var(--background)] overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex-1 space-y-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-px bg-brand-blue" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-blue">Aloha Vision</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-heading font-black tracking-tighter leading-[0.9]">
             DEFINING <br />
             <span className="opacity-30 italic">LUXURY.</span>
          </h2>
          <p className="text-lg opacity-60 font-medium leading-relaxed max-w-md">
             From bespoke placement to global investment standards, discover how we are reshaping the Addis Ababa skyline.
          </p>
          <Link href="/about" className="btn-premium-primary text-xs tracking-wider uppercase inline-flex items-center gap-2 group">
             Our Journey <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex-1 relative aspect-[4/5] w-full max-w-md rounded-[3rem] overflow-hidden"
        >
          <Image 
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80" 
            alt="Aloha Luxury" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12">
             <div className="w-16 h-1 bg-white/40 mb-4" />
             <p className="text-white text-xl font-heading font-black tracking-tight leading-tight">"Integrity is the bedrock of our investment strategy."</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function PortfolioTeaser() {
  return (
    <section className="py-32 px-6 bg-slate-500/5 border-y border-[var(--border)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
        <div className="max-w-xl">
           <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tighter mb-4">
              CURATED <br />
              <span className="opacity-30 italic">COLLECTIONS.</span>
           </h2>
           <p className="opacity-60 font-medium">A selection of premium high-performance units for the sophisticated buyer.</p>
        </div>
        <Link href="/portfolio" className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-brand-blue text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-blue/20">
           Enter Registry <LayoutGrid size={16} className="group-hover:rotate-12 transition-transform" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "The Sovereign", loc: "Old Airport", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80" },
          { title: "Metro Sky", loc: "Bole Atlas", img: "https://images.unsplash.com/photo-1460317442991-0ec23933a26d?auto=format&fit=crop&q=80" },
          { title: "Enyi Apex", loc: "Summit", img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80" }
        ].map((item, idx) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden"
          >
            <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
               <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-1">{item.loc}</p>
               <h4 className="text-2xl font-heading font-black text-white tracking-tight">{item.title}</h4>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function TrendsTeaser() {
  return (
    <section className="py-32 px-6 bg-[var(--background)]">
      <div className="max-w-6xl mx-auto bg-slate-500/5 rounded-[3rem] p-8 md:p-20 border border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-full bg-brand-blue/5 -skew-x-12 -mr-32" />
        
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="text-brand-blue" size={24} />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[var(--foreground)] opacity-40">Intelligence Highlights</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tighter mb-8 text-[var(--foreground)]">
             MARKET PERFORMANCE <br />
             <span className="text-brand-blue italic">Q1 REPORT.</span>
          </h2>
          <p className="text-lg opacity-60 font-medium mb-12">Access the latest deep-dives on the Ethiopia capital growth rates and investment yields.</p>
          <Link href="/market-trends" className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-brand-blue group">
             Enter Trends Hub <div className="w-12 h-12 rounded-full border border-brand-blue/30 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all"><ArrowRight size={18} /></div>
          </Link>
        </div>
      </div>
    </section>
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
