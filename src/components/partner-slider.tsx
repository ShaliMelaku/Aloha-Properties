"use client";

import { motion } from "framer-motion";
import { Building2, Landmark, TowerControl, Verified } from "lucide-react";

export function PartnerSlider() {
  const partners = [
    { name: "Getas Real Estate", icon: Building2 },
    { name: "Enyi Real Estate", icon: Landmark },
    { name: "Metro Real Estate", icon: TowerControl },
    { name: "Sunshine Properties", icon: Building2 },
    { name: "Addis Luxury Homes", icon: Landmark },
    { name: "Tsehay Properties", icon: TowerControl }
  ];
  
  const duplicatedPartners = [...partners, ...partners, ...partners];

  return (
    <div className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-12 flex flex-col items-center">
         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-4"
         >
            <div className="w-4 h-px bg-brand-blue" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue">Strategic Alliances</span>
            <div className="w-4 h-px bg-brand-blue" />
         </motion.div>
         <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest text-center">
            Trusted by the Architects of Modern Addis
         </h3>
      </div>
      
      {/* Edge Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none" />

      <div className="flex select-none">
        <motion.div
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 35,
          }}
          className="flex gap-12 px-6 w-max items-center"
        >
          {duplicatedPartners.map((partner, idx) => (
            <div 
              key={idx} 
              className="group flex items-center gap-4 px-8 py-5 bg-slate-500/5 hover:bg-brand-blue transition-all duration-500 rounded-[2rem] border border-[var(--border)] group"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-luxury-charcoal flex items-center justify-center text-brand-blue group-hover:bg-white transition-colors">
                <partner.icon size={20} />
              </div>
              <div className="flex flex-col">
                 <span className="font-bold text-sm group-hover:text-white transition-colors whitespace-nowrap">{partner.name}</span>
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:text-white/60 transition-colors flex items-center gap-1">
                    <Verified size={10} /> Verified Partner
                 </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
