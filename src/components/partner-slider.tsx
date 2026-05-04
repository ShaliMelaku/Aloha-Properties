"use client";

import { motion } from "framer-motion";
import { Building2, Landmark, TowerControl, Verified } from "lucide-react";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import { TrustedCompany } from "@/types/admin";
import Image from "next/image";

export function PartnerSlider() {
  const [partners, setPartners] = useState<TrustedCompany[]>([]);
  
  useEffect(() => {
    const fetchPartners = async () => {
      const { data } = await supabaseClient
        .from('trusted_companies')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (data) setPartners(data);
    };
    fetchPartners();
  }, []);

  const fallbackIcons: Record<string, typeof Building2> = {
    'Developer': Building2,
    'Bank': Landmark,
    'Architecture': TowerControl,
    'default': Building2
  };

  if (partners.length === 0) return null;

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

      <div className="flex flex-col gap-6">
        {/* First Line: Normal Speed, Leftward */}
        <div className="flex select-none">
          <motion.div
            animate={{ x: ["0%", "-33.333%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 35,
            }}
            className="flex gap-6 md:gap-12 px-3 md:px-6 w-max items-center"
          >
            {duplicatedPartners.map((partner, idx) => {
              const Icon = fallbackIcons[partner.category || 'default'] || fallbackIcons.default;
              return (
                <a 
                  key={`row1-${idx}`} 
                  href={partner.website_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 px-8 py-5 bg-slate-500/5 hover:bg-brand-blue transition-all duration-500 rounded-[2rem] border border-[var(--border)]"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-luxury-charcoal flex items-center justify-center text-brand-blue group-hover:bg-white transition-colors relative overflow-hidden shrink-0">
                    {partner.logo_url ? (
                      <Image src={partner.logo_url} alt={partner.name} fill className="object-contain p-2" sizes="40px" />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  <div className="flex flex-col">
                     <span className="font-bold text-sm group-hover:text-white transition-colors whitespace-nowrap">{partner.name}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:text-white/60 transition-colors flex items-center gap-1">
                        <Verified size={10} /> {partner.category || 'Verified Partner'}
                     </span>
                  </div>
                </a>
              );
            })}
          </motion.div>
        </div>

        {/* Second Line: Off-speed, Rightward */}
        <div className="flex select-none">
          <motion.div
            animate={{ x: ["-33.333%", "0%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 45,
            }}
            className="flex gap-6 md:gap-12 px-3 md:px-6 w-max items-center"
          >
            {duplicatedPartners.map((partner, idx) => {
              const Icon = fallbackIcons[partner.category || 'default'] || fallbackIcons.default;
              return (
                <a 
                  key={`row2-${idx}`} 
                  href={partner.website_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 px-8 py-5 bg-slate-500/5 hover:bg-brand-blue transition-all duration-500 rounded-[2rem] border border-[var(--border)]"
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-luxury-charcoal flex items-center justify-center text-brand-blue group-hover:bg-white transition-colors relative overflow-hidden shrink-0">
                    {partner.logo_url ? (
                      <Image src={partner.logo_url} alt={partner.name} fill className="object-contain p-2" sizes="40px" />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  <div className="flex flex-col">
                     <span className="font-bold text-sm group-hover:text-white transition-colors whitespace-nowrap">{partner.name}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:text-white/60 transition-colors flex items-center gap-1">
                        <Verified size={10} /> {partner.category || 'Verified Partner'}
                     </span>
                  </div>
                </a>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
