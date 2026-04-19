"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProductProgress, calculateDiscount, getLoanPercentage } from "@/data/mock-db";
import { SupabaseProperty } from "@/hooks/use-properties";
import { ChevronDown, MapPin, HardHat, BedDouble, Bath, Maximize, Banknote, ArrowRight, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/context/currency-context";
import { useComparison } from "@/context/comparison-context";

export function PropertyCard({ property, index }: { property: SupabaseProperty, index: number }) {
  const { formatPrice } = useCurrency();
  const { toggleCompare, compared, setActivePulse } = useComparison();
  const [unitIdx, setUnitIdx] = useState(0);
  const [downPercent, setDownPercent] = useState(20);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const unit = property.units?.[unitIdx] || property.units?.[0];
  
  const dynamicProgress = property.progress?.[0];
  const progress = dynamicProgress ? {
    progress: dynamicProgress.percent,
    statusText: dynamicProgress.status_text,
    estimated: dynamicProgress.estimated_completion
  } : getProductProgress(property.name);
  const loanPercent = getLoanPercentage(property.developer, property.name);

  if (!unit) return null;

  const offer = calculateDiscount(unit.price, downPercent, unit.type, property.developer);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setActivePulse(property)}
      onMouseLeave={() => setActivePulse(null)}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-[var(--card)] rounded-luxury overflow-hidden border border-[var(--border)] transition-all duration-500 hover:shadow-2xl hover:shadow-brand-blue/5 hover:-translate-y-1"
    >
      {/* Comparison Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={() => toggleCompare(property)}
          title={compared.find(p => p.id === property.id) ? "Remove from Comparison" : "Add to Comparison"}
          className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${compared.find(p => p.id === property.id) ? 'bg-brand-blue border-brand-blue text-white' : 'bg-black/20 border-white/20 text-white hover:bg-black/40'}`}
        >
          <div className="relative">
             <LayoutGrid size={18} />
             {compared.find(p => p.id === property.id) && (
               <motion.div layoutId="check" className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-brand-blue" />
             )}
          </div>
        </button>
      </div>

      <div className="relative h-72 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <Image 
          src={unit.variety_img || property.cover_image || "/images/cover.jpg"} 
          alt={unit.type} 
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={true} // Set to true if external images fail optimization or to false for max speed if domains are whitelisted
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent opacity-80" />
        
        {loanPercent && (
          <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
            {loanPercent}
          </div>
        )}
      </div>

      <div className="p-8 relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-heading text-2xl font-black tracking-tight mb-1 group-hover:text-brand-blue transition-colors">
              {property.name}
            </h3>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <MapPin size={12} className="text-brand-blue" />
              {property.location}
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-500/5 border border-[var(--border)]">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">
            <span className="flex items-center gap-1.5" title={`${progress.progress}% Overall Completion`}><HardHat size={12}/> Development</span>
            <span className="text-brand-blue" title="Active Milestone Phase">{progress.statusText}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${progress.progress}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-brand-blue rounded-full shadow-[0_0_12px_rgba(0,102,255,0.4)]"
            />
          </div>
        </div>

        {/* Unit Selector & Info */}
        <div className="space-y-4 mb-8">
           <div className="relative">
              <select 
                value={unitIdx}
                onChange={(e) => setUnitIdx(Number(e.target.value))}
                title="Select Property Unit Type"
                className="w-full appearance-none bg-slate-500/5 border border-[var(--border)] rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none cursor-pointer transition-all"
              >
                {property.units.map((u, i) => (
                  <option key={i} value={i} className="dark:bg-luxury-charcoal">
                    {u.type} — {u.sqm}m²
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
           </div>

           <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-4 text-xs font-bold opacity-60">
                <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-brand-blue" /> {unit.beds}</span>
                <span className="flex items-center gap-1.5"><Bath size={14} className="text-brand-blue" /> {unit.baths}</span>
                <span className="flex items-center gap-1.5"><Maximize size={14} className="text-brand-blue" /> {unit.sqm}m²</span>
              </div>
           </div>
        </div>

        {/* Pricing */}
        <div className="flex flex-col items-center mb-8 py-6 rounded-3xl bg-brand-blue/5 border border-brand-blue/10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue mb-2">Exclusive Offer</span>
            <div className="text-3xl font-heading font-black tracking-tighter">
              {formatPrice(offer.discountedPrice)}
            </div>
            {offer.discountPercent > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-slate-400 line-through">{formatPrice(unit.price)}</span>
                <span className="text-[10px] font-black bg-brand-blue text-white px-2 py-0.5 rounded-md">SAVE {offer.discountPercent}%</span>
              </div>
            )}
            {property.downpayment_percentage && property.downpayment_percentage > 0 ? (
               <div className="mt-2 text-[10px] font-bold opacity-40 uppercase tracking-widest italic">
                 Starting from {property.downpayment_percentage}% Downpayment
               </div>
            ) : null}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-5 gap-3">
          <button 
            onClick={() => setAccordionOpen(!accordionOpen)}
            title="Toggle Payment Plans"
            className="col-span-1 flex items-center justify-center aspect-square rounded-2xl border border-[var(--border)] hover:bg-slate-500/5 transition-colors"
          >
            <Banknote size={20} className={accordionOpen ? 'text-brand-blue' : 'opacity-40'} />
          </button>
          <Link 
            href="#contact"
            className="col-span-4 btn-premium-primary w-full flex items-center justify-center gap-2 group/btn"
          >
             Secure Inquiry
             <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Expandable Payment Plans */}
        <AnimatePresence>
          {accordionOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-2">
                {[20, 30, 50, 70, 100].map((pct) => (
                  <button 
                    key={pct}
                    onClick={() => setDownPercent(pct)}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-2xl text-xs font-bold transition-all border
                      ${downPercent === pct 
                        ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-[1.02]' 
                        : 'bg-slate-500/5 border-transparent hover:border-slate-500/20'}
                    `}
                  >
                    <span>{pct === 100 ? '🎯 Full Payment' : `${pct}% Down`}</span>
                    {pct >= 20 && (
                      <span className={`px-2 py-0.5 rounded-md ${downPercent === pct ? 'bg-white/20' : 'bg-emerald-500 text-white'}`}>
                        +{pct === 100 ? '15' : pct === 70 ? '10' : pct === 50 ? '7' : pct === 30 ? '4' : '2'}% Disc.
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
