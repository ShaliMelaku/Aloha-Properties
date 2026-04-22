"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Target, Sparkles, Handshake, Lightbulb, Heart, ArrowUpRight } from "lucide-react";
import { StoryModal } from "./story-modal";

export function AboutSection() {
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  const values = [
    { icon: Sparkles,   title: "Excellence",   desc: "A tradition of excellence and knowledge spanning over 14 years in the Ethiopian real estate industry." },
    { icon: Handshake,  title: "Commitment",   desc: "Dedicated to our clients, company, and community in everything we do — always." },
    { icon: Lightbulb,  title: "Accountability", desc: "We take full ownership of our actions and results, treating your business as we would our own." },
    { icon: Heart,      title: "Respect",      desc: "We value every client — whether a property owner, tenant, or buyer — with personalized, individual care." }
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
              A TRADITION OF <br />
              <span className="text-[var(--foreground)]/40 italic">EXCELLENCE.</span>
            </motion.h2>
            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="text-lg text-[var(--foreground)]/60 font-medium leading-relaxed max-w-lg mb-8"
            >
              Aloha is a full-service, market-leading marketing and sales company that is changing the way you find, achieve, and maintain the greatest value of home in Addis and beyond. With over 14 years of experience, we offer a comprehensive line of brokerage, management, and consulting services — and at Aloha, you are number one.
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
                <p className="text-sm opacity-60 font-medium">To be the leading real estate service provider in the region — the preferred choice for property professionals and clients, built on transparency and mutual trust.</p>
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
                <p className="text-sm text-[var(--foreground)]/60 font-medium leading-relaxed">To maintain the highest level of service while providing accurate, up-to-date information, skilled analysis, and sound real estate advice — measured by the results delivered to our clients.</p>
             </motion.div>
          </div>
        </div>

        {/* C.A.R.E. Values Grid */}
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

        {/* Promise Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 p-10 rounded-[2.5rem] bg-brand-blue/5 border border-brand-blue/10 text-center max-w-3xl mx-auto"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue mb-4">Our Promise</p>
          <p className="text-xl font-heading font-black tracking-tight leading-snug text-[var(--foreground)]">
            &ldquo;We will treat your business as we would our own — with direct engagement from the top down, value at every level, an unwavering commitment to the highest standards, and a robust appetite for making <span className="text-brand-blue">GREAT</span> happen.&rdquo;
          </p>
        </motion.div>
      </div>

      <StoryModal isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />
    </section>
  );
}
