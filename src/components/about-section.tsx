"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Target, Sparkles, Handshake, Lightbulb, Heart, ArrowUpRight } from "lucide-react";
import { StoryModal } from "./story-modal";

export function AboutSection() {
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  const values = [
    { icon: Sparkles, title: "Excellence", desc: "Curating only the top 1% of Addis Ababa development projects." },
    { icon: Handshake, title: "Transparency", desc: "No hidden fees, full developer disclosure, and verified pricing." },
    { icon: Lightbulb, title: "Innovation", desc: "Cinematic drone tours and AI-driven market intelligence." },
    { icon: Heart, title: "Hospitality", desc: "The 'Aloha Spirit' is at the core of our customized service." }
  ];

  return (
    <section id="about" className="py-32 overflow-hidden relative">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-16 lg:gap-24 mb-32">
          <div className="flex-1">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="flex items-center gap-2 mb-6"
            >
              <div className="w-8 h-px bg-brand-blue" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue">Our Identity</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-4xl md:text-6xl font-black tracking-tighter mb-8"
            >
              BEYOND THE <br />
              <span className="text-[var(--foreground)]/40 italic">TRADITIONAL.</span>
            </motion.h2>
            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="text-lg text-[var(--foreground)]/60 font-medium leading-relaxed max-w-lg mb-8"
            >
              Aloha Properties is not just a listing aggregator. We are an exclusive marketing house designed to elevate exceptional properties through cinematic storytelling and strategic intelligence.
            </motion.p>
            <motion.button 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               onClick={() => setIsStoryOpen(true)}
               className="flex items-center gap-2 text-brand-blue font-black uppercase tracking-widest text-xs hover:gap-3 transition-all outline-none"
            >
              Read Our Full Story <ArrowUpRight size={16} />
            </motion.button>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-8 rounded-[2rem] bg-luxury-charcoal dark:bg-white text-white dark:text-luxury-charcoal flex flex-col justify-end min-h-[300px] relative overflow-hidden group"
             >
                <div className="absolute top-8 right-8 text-brand-blue group-hover:scale-110 transition-transform"><Eye size={32} /></div>
                <h3 className="text-2xl font-heading font-black tracking-tight mb-2">Vision</h3>
                <p className="text-sm opacity-60 font-medium">To be the most trusted name in Ethiopian luxury real estate, connecting global standards with local heritage.</p>
             </motion.div>

             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-8 rounded-[2rem] bg-slate-500/5 border border-[var(--border)] flex flex-col justify-end min-h-[300px] group relative overflow-hidden"
             >
                <div className="absolute top-8 right-8 text-brand-blue group-hover:scale-110 transition-transform"><Target size={32} /></div>
                <h3 className="text-2xl font-heading font-black tracking-tight mb-2">Mission</h3>
                <p className="text-sm text-[var(--foreground)]/60 font-medium leading-relaxed">To amplify exceptional properties through data-driven marketing and cinematic storytelling.</p>
             </motion.div>
          </div>
        </div>

        {/* Global Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {values.map((v, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all duration-300 shadow-lg shadow-brand-blue/5">
                <v.icon size={20} />
              </div>
              <h4 className="font-heading font-bold text-xl mb-3">{v.title}</h4>
              <p className="text-sm text-[var(--foreground)]/60 font-medium leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <StoryModal isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />
    </section>
  );
}
