"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.5 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } 
    }
  };

  const heroImageUrl = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1920&auto=format&fit=crop';

  return (
    <section 
      id="home" 
      ref={containerRef}
      className="relative h-[95vh] md:h-[100vh] w-full flex items-center justify-center overflow-hidden"
    >
      {/* Frame-to-frame Background */}
      <motion.div 
        style={{ opacity }}
        className="absolute inset-0 z-0"
      >
        <motion.div 
           initial={{ scale: 1.1 }}
           animate={{ scale: 1 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className="absolute inset-0"
        >
          <Image
            src={heroImageUrl}
            alt="Aloha Properties Luxury Estate"
            fill
            priority
            quality={85}
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50 transition-colors duration-700" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--background)]/80 via-[var(--background)]/20 to-transparent" />
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl px-6 md:px-12 flex flex-col justify-center">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
             <div className="w-12 h-[2px] bg-brand-blue" />
             <span className="text-xs font-black tracking-[0.3em] uppercase text-white drop-shadow-md">
               Premier Ethiopian Realty
             </span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="font-heading text-6xl md:text-[8rem] font-black leading-[0.85] text-white tracking-tighter mb-10 drop-shadow-2xl"
          >
            REDEFINING <br />
            <span className="text-white/30 italic">ETHIOPIAN</span> <br />
            ESTATE<span className="text-brand-blue">.</span>
          </motion.h1>
          
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-end gap-8 md:gap-12">
             <p className="text-base md:text-xl text-white/70 font-medium max-w-xl leading-relaxed backdrop-blur-sm p-4 rounded-2xl bg-white/5 border border-white/10">
               Aloha Properties curates the most prestigious residential developments in Addis Ababa, bridging the gap between global luxury and local soul.
             </p>
             
             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
               <Link href="/products" className="btn-premium-primary text-sm md:text-base px-8 md:px-12 py-4 md:py-6 flex items-center justify-center gap-3 group whitespace-nowrap">
                 Explore Products
                 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </Link>
               <Link href="/about" className="btn-premium px-8 md:px-12 py-4 md:py-6 text-sm md:text-base whitespace-nowrap bg-brand-blue/10 text-brand-blue border border-brand-blue/20 hover:bg-brand-blue/20 transition-all font-bold backdrop-blur-sm shadow-lg shadow-brand-blue/5 text-center">
                 Our Vision
               </Link>
             </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] font-black">Scroll</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1"
        >
           <motion.div className="w-1 h-2 bg-brand-blue rounded-full" animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} />
        </motion.div>
      </motion.div>

      {/* Side Decorative elements */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col gap-12 pr-12 border-r border-white/10 py-24 pointer-events-none">
          <div className="text-white/10 font-black text-[10px] vertical-text rotate-180 tracking-[1em] h-60">ALOHA PROPERTIES • EST. 202*</div>
      </div>
    </section>
  );
}
