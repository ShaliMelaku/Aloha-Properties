"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Target, Sparkles, Heart, Quote } from "lucide-react";
import Image from "next/image";

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoryModal({ isOpen, onClose }: StoryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[300] cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 bg-[var(--background)] rounded-[3rem] z-[301] shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row"
          >
            {/* Sidebar / Branding */}
            <div className="w-full md:w-80 bg-luxury-charcoal dark:bg-black p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                   <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-brand-blue rounded-full blur-[100px]" />
               </div>

               <div className="relative z-10">
                  <div className="w-16 h-16 relative mb-8 group-hover:scale-105 transition-transform">
                    <Image 
                      src="/images/brand/aloha-logo.png" 
                      alt="Aloha Logo" 
                      fill 
                      className="object-contain"
                    />
                  </div>
                  <h2 className="font-heading font-black text-3xl text-white leading-none uppercase tracking-tighter">
                    THE ALOHA <br />
                    <span className="text-brand-blue italic">STORY.</span>
                  </h2>
               </div>

               <div className="relative z-10 hidden md:block">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 font-sans">Corporate Identity</p>
                  <div className="space-y-4">
                     {[
                       { icon: Sparkles, text: "Curated Excellence" },
                       { icon: Target, text: "Strategic Intelligence" },
                       { icon: Heart, text: "Hospitality First" }
                     ].map((item, idx) => (
                       <div key={idx} className="flex items-center gap-3 text-white/60">
                          <item.icon size={14} className="text-brand-blue" />
                          <span className="text-xs font-bold">{item.text}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-500/5 noise-bg p-8 md:p-16 lg:p-24 relative">
               <button 
                onClick={onClose}
                title="Close Modal"
                className="absolute top-8 right-8 md:top-12 md:right-12 w-12 h-12 rounded-full bg-white dark:bg-black/40 border border-[var(--border)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20 group"
               >
                 <X size={20} className="group-hover:rotate-90 transition-transform" />
               </button>

               <div className="max-w-3xl space-y-24">
                  {/* 01. The Genesis */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                       <span className="text-[10px] font-black text-brand-blue border border-brand-blue/30 px-2 py-1 rounded">01</span>
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Our Genesis</h3>
                    </div>
                    <h4 className="text-4xl md:text-5xl font-heading font-black tracking-tighter mb-8 italic">
                      Bridging the gap between <br />
                      <span className="opacity-30 not-italic">vision and reality.</span>
                    </h4>
                    <p className="text-lg md:text-xl text-[var(--foreground)]/70 font-medium leading-relaxed mb-6">
                      Established in 2021, Aloha Properties was born from a singular observation: Addis Ababa&apos;s skyline was evolving faster than its marketing standards. While world-class developments were rising, the narrative around them remained transactional and static.
                    </p>
                    <p className="text-lg text-[var(--foreground)]/50 font-medium leading-relaxed">
                      We set out to change that by introducing cinematic storytelling, digital-first acquisition strategies, and a premium service level previously unseen in the Horn of Africa.
                    </p>
                  </section>

                  {/* 02. The Visionary (Founder) */}
                  <section className="bg-white dark:bg-luxury-charcoal p-8 md:p-12 rounded-[2.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden">
                     <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="w-full md:w-1/2 aspect-[4/5] relative rounded-[2rem] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
                           <Image 
                             src="/images/about/founder.png" 
                             alt="Mr Asmelash - Founder of Aloha Properties"
                             fill
                             className="object-cover"
                           />
                        </div>
                        <div className="w-full md:w-1/2">
                           <div className="w-12 h-12 bg-brand-blue/10 text-brand-blue flex items-center justify-center rounded-2xl mb-6">
                             <Quote size={24} />
                           </div>
                           <h4 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-4">The Visionary</h4>
                            <h5 className="text-3xl font-heading font-black tracking-tight mb-6 text-[var(--foreground)]">Mr Asmelash</h5>
                            <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed italic mb-8 border-l-2 border-brand-blue/20 pl-4 py-1">
                              &quot;My goal was never to build the largest agency. It was to build the most impactful one—an agency that understands that real estate is not just about square meters, but about the legacy of the visionary who builds it.&quot;
                            </p>
                            <div className="h-px w-full bg-[var(--border)] mb-6" />
                            <p className="text-xs font-bold opacity-60 uppercase tracking-widest text-[var(--foreground)]">Founder & CEO</p>
                        </div>
                     </div>
                  </section>

                  {/* 03. Mission & Impact */}
                  <section className="grid md:grid-cols-2 gap-12">
                     <div>
                        <div className="flex items-center gap-3 mb-6">
                           <span className="text-[10px] font-black text-brand-blue border border-brand-blue/30 px-2 py-1 rounded">03</span>
                           <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Our Mission</h3>
                        </div>
                        <h4 className="text-3xl font-heading font-black tracking-tight mb-6">To Elevate the <br />Ethiopian Standard.</h4>
                        <p className="text-sm text-[var(--foreground)]/60 font-medium leading-relaxed">
                          We exist to empower developers to tell their stories and investors to secure their futures. Through data-driven insights and a commitment to transparency, we are redefining the transactional landscape of Addis Ababa.
                        </p>
                     </div>
                     <div className="space-y-6">
                        {[
                          { title: "Impact", val: "500+", desc: "Verified properties curated since inception." },
                          { title: "Reach", val: "15k+", desc: "Investors engaged across the globe." },
                          { title: "Volume", val: "2.4B", desc: "ETB in property value represented." }
                        ].map((stat, i) => (
                          <div key={i} className="p-6 rounded-2xl bg-white dark:bg-luxury-charcoal/50 border border-[var(--border)] flex justify-between items-center group hover:bg-brand-blue/5 transition-all">
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{stat.title}</p>
                                <p className="text-xs font-bold text-[var(--foreground)]/60">{stat.desc}</p>
                             </div>
                             <p className="text-3xl font-heading font-black text-brand-blue">{stat.val}</p>
                          </div>
                        ))}
                     </div>
                  </section>

                  <div className="text-center pt-12">
                     <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20">Aloha Properties Premium Real Estate Marketing</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
