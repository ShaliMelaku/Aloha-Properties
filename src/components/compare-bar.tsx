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

  const topValueProperty = compared.length >= 2 ? compared.reduce((prev: SupabaseProperty, curr: SupabaseProperty) => {
    const prevAvg = (prev.units?.reduce((acc: number, u: { price: number; sqm: number }) => acc + (u.price / u.sqm), 0) || 0) / (prev.units?.length || 1);
    const currAvg = (curr.units?.reduce((acc: number, u: { price: number; sqm: number }) => acc + (u.price / u.sqm), 0) || 0) / (curr.units?.length || 1);
    return prevAvg < currAvg ? prev : curr;
  }) : null;

  if (compared.length === 0) return null;

  return (
    <>
      {/* ── Floating Bar ── */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[250] flex justify-center p-3 md:p-6 pointer-events-none"
      >
        <div className="bg-luxury-charcoal dark:bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-full px-4 md:px-8 py-3 md:py-4 shadow-2xl flex flex-wrap sm:flex-nowrap items-center gap-3 md:gap-8 pointer-events-auto w-full max-w-2xl">
          {/* Label */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <LayoutGrid size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40 leading-none">Comparison Lab</p>
              <p className="text-sm font-bold text-white leading-tight">{compared.length} {compared.length === 1 ? 'Project' : 'Projects'}</p>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10 flex-shrink-0" />

          {/* Thumbnails */}
          <div className="flex items-center gap-3 flex-1">
            {compared.map((prop: SupabaseProperty) => (
              <motion.div key={prop.id} layoutId={`compare-${prop.id}`} className="relative group flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border-2 border-brand-blue shadow-lg">
                  <img
                    src={prop.units?.[0]?.variety_img || "/images/cover.jpg"}
                    alt={prop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => toggleCompare(prop)}
                  title={`Remove ${prop.name}`}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </motion.div>
            ))}
            {compared.length < 3 && (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-white/20 flex-shrink-0">
                <span className="text-lg">+</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <button
              onClick={() => setShowModal(true)}
              disabled={compared.length < 2}
              title="Open comparison"
              className="btn-premium-primary text-[9px] md:text-[10px] py-2 md:py-3 px-4 md:px-6 disabled:opacity-30 disabled:grayscale transition-all whitespace-nowrap"
            >
              Compare
            </button>
            <button onClick={clearCompare} title="Clear all" className="text-white/40 hover:text-white transition-colors p-1">
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Comparison Modal ── */}
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
              className="fixed inset-2 sm:inset-4 md:inset-12 z-[301] bg-[var(--background)] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-[var(--border)] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 md:p-12 flex justify-between items-center border-b border-[var(--border)] bg-slate-500/5 flex-shrink-0">
                <div>
                  <h2 className="text-2xl md:text-4xl font-heading font-black tracking-tighter mb-1 italic uppercase">The Investment Matrix</h2>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">Bespoke Comparison Engine</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  title="Close"
                  className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-slate-500/5 transition-all flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body — desktop: table, mobile: cards */}
              <div className="flex-1 overflow-y-auto p-5 md:p-12">

                {/* ── MOBILE: Card Stack ── */}
                <div className="block md:hidden space-y-6">
                  {compared.map((prop: SupabaseProperty) => {
                    const isTop = topValueProperty?.id === prop.id;
                    const minPrice = Math.min(...(prop.units?.map((u: { price: number }) => u.price) || [0]));
                    const units = prop.units || [];
                    const avgSqm = units.length > 0 ? units.reduce((acc: number, u: { price: number; sqm: number }) => acc + (u.price / u.sqm), 0) / units.length : 0;
                    return (
                      <div key={prop.id} className={`rounded-3xl border overflow-hidden ${isTop ? 'border-brand-blue/40 shadow-xl shadow-brand-blue/10' : 'border-[var(--border)]'}`}>
                        {isTop && (
                          <div className="bg-brand-blue text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 flex items-center justify-center gap-2">
                            <Award size={10} /> Recommended Acquisition
                          </div>
                        )}
                        <div className="relative h-48">
                          <img src={prop.units?.[0]?.variety_img || "/images/cover.jpg"} alt={prop.name} className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <h3 className="text-xl font-heading font-black text-white">{prop.name}</h3>
                            <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{prop.developer}</p>
                          </div>
                        </div>
                        <div className="p-4 space-y-3 bg-[var(--card)]">
                          {[
                            { icon: MapPin, label: 'Location', value: prop.location },
                            { icon: Building2, label: 'Start Price', value: formatPrice(minPrice), highlight: true },
                            { icon: LandPlot, label: 'Avg SQM Price', value: `${formatPrice(avgSqm)} / m²` },
                            { icon: HardHat, label: 'Phase', value: prop.progress?.[0]?.status_text || 'In Progress' },
                          ].map(({ icon: Icon, label, value, highlight }) => (
                            <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                              <div className="flex items-center gap-2 opacity-50">
                                <Icon size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                              </div>
                              <span className={`text-sm font-bold ${highlight ? 'text-brand-blue text-base font-heading' : ''}`}>{value}</span>
                            </div>
                          ))}
                          <div className="pt-1">
                            <div className="flex items-center gap-2 opacity-50 mb-2">
                              <Check size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Amenities</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {prop.amenities.slice(0, 4).map((a: string, i: number) => (
                                <span key={i} className="px-2 py-1 rounded-md bg-brand-blue/10 text-brand-blue text-[9px] uppercase font-black">{a}</span>
                              ))}
                            </div>
                          </div>
                          {prop.progress?.[0] && (
                            <div>
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${prop.progress[0].percent || 0}%` }}
                                  transition={{ duration: 0.8 }}
                                  className="bg-brand-blue h-full"
                                />
                              </div>
                              <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">{prop.progress[0].percent}% complete</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── DESKTOP: Table ── */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[700px] border-separate border-spacing-x-4">
                    <thead>
                      <tr>
                        <th className="w-52" />
                        {compared.map((prop: SupabaseProperty) => (
                          <th key={prop.id} className={`pb-10 relative px-4 rounded-[2rem] transition-all duration-700 ${topValueProperty?.id === prop.id ? 'bg-brand-blue/5 border-x border-t border-brand-blue/20' : ''}`}>
                            {topValueProperty?.id === prop.id && (
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <div className="bg-brand-blue text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                                  <Award size={10} /> Recommended
                                </div>
                              </div>
                            )}
                            <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-6 border border-[var(--border)]">
                              <img src={prop.units?.[0]?.variety_img || "/images/cover.jpg"} alt={prop.name} className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                            <h3 className="text-xl font-heading font-black tracking-tight">{prop.name}</h3>
                            <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mt-1">{prop.developer}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-center font-bold">
                      {[
                        { icon: MapPin, label: 'Neighborhood', getValue: (p: SupabaseProperty) => p.location },
                        { icon: Building2, label: 'Start Price', getValue: (p: SupabaseProperty) => formatPrice(Math.min(...(p.units?.map((u: { price: number }) => u.price) || [0]))), highlight: true },
                        { icon: LandPlot, label: 'Avg SQM Price', getValue: (p: SupabaseProperty) => { const u = p.units||[]; const avg = u.length>0?u.reduce((a:number,v:{price:number;sqm:number})=>a+(v.price/v.sqm),0)/u.length:0; return `${formatPrice(avg)} / m²`; } },
                        { icon: HardHat, label: 'Phase', getValue: (p: SupabaseProperty) => p.progress?.[0]?.status_text || 'In Progress' },
                      ].map(({ icon: Icon, label, getValue, highlight }, ri) => (
                        <tr key={label} className={ri % 2 === 1 ? 'bg-slate-500/5' : ''}>
                          <td className="py-5 text-left opacity-40 uppercase text-[10px] tracking-widest">
                            <Icon size={14} className="inline mr-2" />{label}
                          </td>
                          {compared.map((p: SupabaseProperty) => (
                            <td key={p.id} className={`py-5 ${topValueProperty?.id === p.id ? 'bg-brand-blue/5 border-x border-brand-blue/20' : ''} ${highlight ? 'text-2xl font-heading text-brand-blue' : ''}`}>
                              {getValue(p)}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td className="py-5 text-left opacity-40 uppercase text-[10px] tracking-widest"><Check size={14} className="inline mr-2" />Amenities</td>
                        {compared.map((p: SupabaseProperty) => (
                          <td key={p.id} className={`py-5 rounded-b-[2rem] ${topValueProperty?.id === p.id ? 'bg-brand-blue/5 border-x border-b border-brand-blue/20' : ''}`}>
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
