"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { calculateDiscount, getLoanPercentage, getProductProgress } from "@/data/mock-db";
import { SupabaseProperty, SupabaseUnitType } from "@/hooks/use-properties";
import {
  ArrowRight,
  Bath,
  BedDouble,
  CheckCircle,
  Clock,
  FileText,
  LayoutGrid,
  MapPin,
  Maximize,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrency } from "@/context/currency-context";
import { useComparison } from "@/context/comparison-context";

// PropertyMap handled by parent gallery via onViewMap callback

function AvailabilityBadge({ type }: { type: SupabaseUnitType }) {
  const total = type.total_units || (type.available_count || 0) + (type.reserved_count || 0) + (type.sold_count || 0);
  const available = type.available_count || 0;
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;

  if (type.status === 'sold_out' || (!type.status && available === 0)) {
    return (
      <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
        <XCircle size={8} /> Sold Out
      </span>
    );
  }
  
  if (type.status === 'available' && available === 0) {
    return (
      <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
        <CheckCircle size={8} /> Available
      </span>
    );
  }

  if (pct <= 20 && available > 0) {
    return (
      <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
        <Clock size={8} /> {available} Left
      </span>
    );
  }
  
  return (
    <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
      <CheckCircle size={8} /> {available > 0 ? `${available} Avail.` : 'Avail.'}
    </span>
  );
}

export function PropertyCard({ property, onViewPdf, onViewMap }: { property: SupabaseProperty, onViewPdf: (id: string, title: string) => void, onViewMap: (p: SupabaseProperty) => void }) {
  const { formatPrice } = useCurrency();
  const { toggleCompare, compared, setActivePulse } = useComparison();
  const [typeIdx, setTypeIdx] = useState<number | null>(null);
  const [downPercent, setDownPercent] = useState(20);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'units' | 'payments'>('units');

  const hasTypes = property.unit_types && property.unit_types.length > 0;
  const activeType: SupabaseUnitType | null = (hasTypes && typeIdx !== null) ? property.unit_types[typeIdx] : null;
  const legacyUnit = (!hasTypes && typeIdx !== null) ? (property.units?.[typeIdx] || property.units?.[0]) : null;

  const dynamicProgress = property.progress && property.progress.length > 0 ? property.progress[0] : null;
  const progress = dynamicProgress ? {
    progress: dynamicProgress.percentage || dynamicProgress.percent,
    statusText: dynamicProgress.label || dynamicProgress.status_text,
    estimated: dynamicProgress.estimated_completion || 'TBD'
  } : getProductProgress(property.name);

  const loanPercent = property.loan_percentage ? `${property.loan_percentage}% Bank Financing` : getLoanPercentage(property.developer, property.name);

  const basePrice = activeType?.price_from || legacyUnit?.price || property.price_start || 0;
  const unitTypeName = activeType?.name || legacyUnit?.type || property.name;
  const unitImage = activeType?.type_image || legacyUnit?.variety_img || property.cover_image || "/images/cover.jpg";
  const beds = activeType?.beds ?? legacyUnit?.beds ?? 0;
  const baths = activeType?.baths ?? legacyUnit?.baths ?? 0;
  const sqm = activeType?.sqm ?? legacyUnit?.sqm ?? 0;

  const offer = calculateDiscount(basePrice, downPercent, unitTypeName, property.developer);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setActivePulse(property)}
      onMouseLeave={() => setActivePulse(null)}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative bg-[var(--card)] rounded-[2rem] overflow-hidden border border-[var(--border)] transition-all duration-500 hover:shadow-2xl hover:shadow-brand-blue/5"
    >
      {/* Comparison Toggle */}
      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={() => toggleCompare(property)}
          title={compared.find(p => p.id === property.id) ? "Remove from Comparison" : "Add to Comparison"}
          className={`h-7 px-2 rounded-full backdrop-blur-md border flex items-center gap-1.5 transition-all shadow-lg ${compared.find(p => p.id === property.id) ? 'bg-brand-blue border-brand-blue text-white' : 'bg-black/40 border-white/20 text-white hover:bg-black/60 active:scale-95'}`}
        >
          <LayoutGrid size={12} className={compared.find(p => p.id === property.id) ? 'animate-pulse' : ''} />
          <span className="text-[8px] font-black uppercase tracking-widest">Compare</span>
        </button>
      </div>

      {/* Compact Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={unitImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src={unitImage}
              alt={unitTypeName}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 20vw"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent opacity-80" />

        {loanPercent && (
          <div className="absolute bottom-3 left-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
            {loanPercent}
          </div>
        )}
      </div>

      <div className="p-5 relative">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-heading text-lg font-black tracking-tight mb-0.5 truncate group-hover:text-brand-blue transition-colors">
            {property.name}
          </h3>
          <button onClick={() => onViewMap(property)} className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-brand-blue transition-colors text-left truncate w-full" title="View Property on Map">
            <MapPin size={10} className="text-brand-blue shrink-0" />
            <span className="truncate">{property.location}</span>
          </button>
        </div>

        {/* Compact Pricing Section */}
        <div className="flex flex-col items-center py-4 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 mb-4">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-blue mb-1">
            {activeType ? 'Starting From' : 'Project Registry'}
          </span>
          <div className="text-xl font-heading font-black tracking-tighter">
            {formatPrice(offer.discountedPrice)}
          </div>
          {offer.discountPercent > 0 && (
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-[10px] text-slate-400 line-through tabular-nums">{formatPrice(basePrice)}</span>
              <span className="text-[8px] font-black bg-brand-blue text-white px-1.5 py-0.5 rounded">-{offer.discountPercent}%</span>
            </div>
          )}
        </div>

        {/* Primary Stats */}
        <div className="flex items-center justify-between mb-4 px-1">
           <div className="flex items-center gap-3 text-[10px] font-bold opacity-40">
              <span className="flex items-center gap-1"><BedDouble size={12} /> {beds}</span>
              <span className="flex items-center gap-1"><Bath size={12} /> {baths}</span>
              <span className="flex items-center gap-1"><Maximize size={12} /> {sqm}m²</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[8px] font-black bg-slate-500/10 px-2 py-1 rounded-md uppercase tracking-widest opacity-60">
                 {progress.progress}%
              </span>
           </div>
        </div>

        {/* Actions Grid */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setAccordionOpen(!accordionOpen)}
              title={accordionOpen ? "Close Details" : "Show Units & Payment Plans"}
              className={`col-span-1 flex items-center justify-center aspect-square rounded-xl border transition-all ${accordionOpen ? 'bg-brand-blue border-brand-blue text-white' : 'border-[var(--border)] hover:bg-slate-500/5'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <Link
              href={`/contact?interest=${encodeURIComponent(property.name)}`}
              className="col-span-3 h-12 rounded-xl bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-blue-deep transition-all shadow-lg shadow-brand-blue/10"
            >
              Inquire
              <ArrowRight size={14} />
            </Link>
          </div>
          
          {property.pdf_brochure_url && (
            <button 
              onClick={() => onViewPdf(property.id, `${property.name} - Brief`)}
              className="w-full py-3 rounded-xl bg-slate-500/5 border border-[var(--border)] flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue/10 hover:text-brand-blue transition-all"
            >
              <FileText size={12} /> View Details
            </button>
          )}
        </div>

        {/* Unified Accordion with Inner Tabs */}
        <AnimatePresence>
          {accordionOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
                <div className="pt-6 space-y-6">
                  {/* Inner Tab Selector */}
                  <div className="flex gap-2 p-1 bg-slate-500/5 rounded-xl border border-[var(--border)]">
                     <button 
                       onClick={() => setActiveTab('units')}
                       className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'units' ? 'bg-white dark:bg-slate-800 shadow-md text-brand-blue' : 'opacity-40 hover:opacity-100'}`}
                     >
                       Units
                     </button>
                     <button 
                       onClick={() => setActiveTab('payments')}
                       className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'payments' ? 'bg-white dark:bg-slate-800 shadow-md text-brand-blue' : 'opacity-40 hover:opacity-100'}`}
                     >
                       Payment Plans
                     </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === 'units' ? (
                      <motion.div 
                        key="units"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-3"
                      >
                        {hasTypes ? (
                          <div className="grid grid-cols-1 gap-2">
                            {property.unit_types.map((ut, i) => (
                              <button
                                key={ut.id}
                                onClick={() => setTypeIdx(typeIdx === i ? null : i)}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${typeIdx === i ? 'border-brand-blue bg-brand-blue/5' : 'border-transparent bg-slate-500/5 hover:border-slate-500/20'}`}
                              >
                                <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0">
                                   <Image src={ut.type_image || property.cover_image || "/images/cover.jpg"} alt={ut.name} fill className="object-cover" unoptimized />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-black uppercase truncate">{ut.name}</p>
                                  <p className="text-[8px] opacity-50">{ut.beds}B/{ut.baths}Ba · {ut.sqm}m²</p>
                                </div>
                                <AvailabilityBadge type={ut} />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-slate-500/5 rounded-2xl border border-dashed border-[var(--border)]">
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Individual Units Coming Soon</p>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="payments"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-1 gap-2">
                          {(() => {
                            const rules = activeType?.discount_rules || property.discount_rules || [
                              { downpayment: 20, discount: 2 }, 
                              { downpayment: 50, discount: 7 }, 
                              { downpayment: 100, discount: 15 }
                            ];
                            return rules.sort((a: { downpayment: number }, b: { downpayment: number }) => a.downpayment - b.downpayment).map((rule: { downpayment: number; discount: number }, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => setDownPercent(rule.downpayment)}
                                className={`flex items-center justify-between p-3 rounded-xl text-[10px] font-bold transition-all border ${downPercent === rule.downpayment ? 'bg-brand-blue border-brand-blue text-white' : 'bg-slate-500/5 border-transparent hover:border-slate-500/20'}`}
                              >
                                <span>{rule.downpayment}% Downpayment</span>
                                {rule.discount > 0 && (
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] ${downPercent === rule.downpayment ? 'bg-white/20' : 'bg-emerald-500 text-white'}`}>
                                    -{rule.discount}% Discount
                                  </span>
                                )}
                              </button>
                            ));
                          })()}
                        </div>
                        {property.discount_conditions && (
                          <div className="p-3 bg-brand-blue/5 border border-brand-blue/10 rounded-xl">
                            <p className="text-[8px] font-black uppercase tracking-widest text-brand-blue mb-1">Offer Terms</p>
                            <p className="text-[9px] font-bold opacity-60 leading-relaxed italic">&quot;{property.discount_conditions}&quot;</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between items-center opacity-40 text-[8px] font-black uppercase tracking-widest">
           <span>{property.property_type || 'Residential'}</span>
           <span className="flex items-center gap-1"><Clock size={8} /> {progress.estimated}</span>
        </div>
      </div>
    </motion.div>
  );
}
