"use client";

import { useState } from "react";
import { useComparison } from "@/context/comparison-context";
import { useCurrency } from "@/context/currency-context";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutGrid, Check, HardHat, LandPlot, Building2, MapPin, Award } from "lucide-react";
import Image from "next/image";
import { SupabaseProperty } from "@/hooks/use-properties";

export function CompareBar() {
  const { compared, toggleCompare, clearCompare } = useComparison();
  const [showModal, setShowModal] = useState(false);
  const { formatPrice } = useCurrency();

  // Algorithm: Identify the "Recommended" project based on Best Value (Price/SQM)
  const topValueProperty = compared.length >= 2 ? compared.reduce((prev: SupabaseProperty, curr: SupabaseProperty) => {
    const prevAvg = (prev.units?.reduce((acc: number, u: { price: number; sqm: number }) => acc + (u.price / u.sqm), 0) || 0) / (prev.units?.length || 1);
    const currAvg = (curr.units?.reduce((acc: number, u: { price: number; sqm: number }) => acc + (u.price / u.sqm), 0) || 0) / (curr.units?.length || 1);
    return prevAvg < currAvg ? prev : curr;
  }) : null;

  if (compared.length === 0) return null;

  return (
    <>
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[250] flex justify-center p-6 pointer-events-none"
      >
        <div className="bg-luxury-charcoal dark:bg-black/90 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4 shadow-2xl flex items-center gap-8 pointer-events-auto">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white">
                <LayoutGrid size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Comparison Lab</p>
                <p className="text-sm font-bold text-white">{compared.length} {compared.length === 1 ? 'Project' : 'Projects'} Selected</p>
             </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="flex items-center gap-4">
            {compared.map((prop: SupabaseProperty) => (
              <motion.div 
                key={prop.id}
                layoutId={`compare-${prop.id}`}
                className="relative group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-brand-blue shadow-lg">
                  <Image 
                    src={prop.units?.[0]?.variety_img || "/images/cover.jpg"} 
                    alt={prop.name} 
                    width={48} 
                    height={48} 
                    className="object-cover" 
                  />
                </div>
                <button 
                  onClick={() => toggleCompare(prop)}
                  title={`Remove ${prop.name} from comparison`}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </motion.div>
            ))}
            
            {compared.length < 3 && (
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-white/20">
                 <span className="text-xl">+</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 ml-4">
             <button 
                onClick={() => setShowModal(true)}
                disabled={compared.length < 2}
                title="Open side-by-side comparison"
                className="btn-premium-primary text-[10px] py-3 px-6 disabled:opacity-30 disabled:grayscale transition-all"
             >
                Analyze side-by-side
             </button>
             <button 
                onClick={clearCompare} 
                title="Clear all selections"
                className="text-white/40 hover:text-white transition-colors"
             >
                <X size={18} />
             </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/95 z-[300] backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-12 z-[301] bg-[var(--background)] rounded-[3rem] overflow-hidden border border-[var(--border)] flex flex-col shadow-2xl"
            >
              <div className="p-8 md:p-12 flex justify-between items-center border-b border-[var(--border)] bg-slate-500/5">
                 <div>
                    <h2 className="text-4xl font-heading font-black tracking-tighter mb-2 italic uppercase">The Investment Matrix</h2>
                    <p className="text-sm font-bold opacity-40 uppercase tracking-[0.3em]">Bespoke Comparison Engine</p>
                 </div>
                 <button 
                  onClick={() => setShowModal(false)}
                  title="Close comparison matrix"
                  className="w-14 h-14 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-slate-500/5 transition-all"
                 >
                   <X size={24} />
                 </button>
              </div>

              <div className="flex-1 overflow-x-auto p-8 md:p-12">
                <table className="w-full min-w-[800px] border-separate border-spacing-x-4">
                  <thead>
                    <tr>
                      <th className="w-64"></th>
                      {compared.map((prop: SupabaseProperty) => (
                        <th key={prop.id} className={`pb-10 relative px-4 rounded-[2rem] transition-all duration-700 ${topValueProperty?.id === prop.id ? 'bg-brand-blue/5 border-x border-t border-brand-blue/20' : ''}`}>
                          {topValueProperty?.id === prop.id && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                               <div className="bg-brand-blue text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                                  <Award size={10} /> Recommended Acquisition
                               </div>
                            </div>
                          )}
                          <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 border border-[var(--border)]">
                            <Image src={prop.units?.[0]?.variety_img || "/images/cover.jpg"} alt={prop.name} fill className="object-cover" />
                          </div>
                          <h3 className="text-2xl font-heading font-black tracking-tight">{prop.name}</h3>
                          <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mt-1">{prop.developer}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-center font-bold">
                    <tr className="border-t border-[var(--border)]">
                      <td className="py-6 text-left opacity-40 uppercase text-[10px] tracking-widest"><MapPin size={16} className="inline mr-2" /> Neighborhood</td>
                      {compared.map((p: SupabaseProperty) => <td key={p.id} className={`py-6 rounded-b-[2rem] ${topValueProperty?.id === p.id ? 'bg-brand-blue/5 border-x border-brand-blue/20' : ''}`}>{p.location}</td>)}
                    </tr>
                    <tr className="bg-slate-500/5">
                      <td className="py-6 text-left opacity-40 uppercase text-[10px] tracking-widest"><Building2 size={16} className="inline mr-2" /> Start Price</td>
                      {compared.map((p: SupabaseProperty) => <td key={p.id} className={`py-6 ${topValueProperty?.id === p.id ? 'bg-brand-blue/5 border-x border-brand-blue/20' : ''} text-2xl font-heading text-brand-blue`}>{formatPrice(Math.min(...(p.units?.map((u: { price: number }) => u.price) || [0])))}</td>)}
                    </tr>
                    <tr>
                      <td className="py-6 text-left opacity-40 uppercase text-[10px] tracking-widest"><LandPlot size={16} className="inline mr-2" /> Avg SQM Price</td>
                      {compared.map((p: SupabaseProperty) => {
                        const units = p.units || [];
                        const avg = units.length > 0 ? units.reduce((acc: number, u: { price: number; sqm: number }) => acc + (u.price / u.sqm), 0) / units.length : 0;
                        return <td key={p.id} className={`py-6 ${topValueProperty?.id === p.id ? 'bg-brand-blue/5 border-x border-brand-blue/20' : ''} opacity-60`}>{formatPrice(avg)} / m²</td>
                      })}
                    </tr>
                    <tr className="bg-slate-500/5">
                      <td className="py-6 text-left opacity-40 uppercase text-[10px] tracking-widest"><HardHat size={16} className="inline mr-2" /> Phase</td>
                      {compared.map((p: SupabaseProperty) => (
                        <td key={p.id} className={`py-6 ${topValueProperty?.id === p.id ? 'bg-brand-blue/5 border-x border-brand-blue/20' : ''}`}>
                           <div className="flex flex-col items-center gap-1">
                              <span className="text-emerald-500">{p.progress?.[0]?.status_text || 'In Progress'}</span>
                              <div className="w-24 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${p.progress?.[0]?.percent || 0}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="bg-brand-blue h-full" 
                                  />
                              </div>
                           </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-6 text-left opacity-40 uppercase text-[10px] tracking-widest"><Check size={16} className="inline mr-2" /> Key Amenities</td>
                      {compared.map((p: SupabaseProperty) => (
                        <td key={p.id} className={`py-6 rounded-b-[2rem] ${topValueProperty?.id === p.id ? 'bg-brand-blue/5 border-x border-b border-brand-blue/20' : ''}`}>
                           <div className="flex flex-wrap justify-center gap-2">
                             {p.amenities.slice(0, 3).map((a: string, i: number) => (
                               <span key={i} className="px-2 py-1 rounded-md bg-brand-blue/10 text-brand-blue text-[9px] uppercase">{a}</span>
                             ))}
                           </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
