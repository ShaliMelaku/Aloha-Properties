"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { calculateDiscount, getLoanPercentage, getProductProgress } from "@/data/mock-db";
import { SupabaseProperty, SupabaseUnitType } from "@/hooks/use-properties";
import {
  ArrowRight,
  Banknote,
  Bath,
  BedDouble,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  LayoutGrid,
  MapPin,
  Maximize,
  Tag,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrency } from "@/context/currency-context";
import { useComparison } from "@/context/comparison-context";
import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("./property-map"), { ssr: false });

function AvailabilityBadge({ type }: { type: SupabaseUnitType }) {
  const total = type.total_units || (type.available_count || 0) + (type.reserved_count || 0) + (type.sold_count || 0);
  const available = type.available_count || 0;
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;

  if (type.status === 'sold_out' || (!type.status && available === 0)) {
    return (
      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
        <XCircle size={10} /> Sold Out
      </span>
    );
  }
  
  if (type.status === 'available' && available === 0) {
    return (
      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
        <CheckCircle size={10} /> Available
      </span>
    );
  }

  if (pct <= 20 && available > 0) {
    return (
      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
        <Clock size={10} /> {available} Left
      </span>
    );
  }
  
  return (
    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
      <CheckCircle size={10} /> {available > 0 ? `${available} Available` : 'Available'}
    </span>
  );
}

export function PropertyCard({ property, onViewPdf, onViewMap }: { property: SupabaseProperty, onViewPdf: (id: string, title: string) => void, onViewMap: (p: any) => void }) {
  const { formatPrice } = useCurrency();
  const { toggleCompare, compared, setActivePulse } = useComparison();
  const [typeIdx, setTypeIdx] = useState<number | null>(null);
  const [downPercent, setDownPercent] = useState(20);
  const [accordionOpen, setAccordionOpen] = useState(false);

  // Use unit_types (new model) with fallback to legacy units
  const hasTypes = property.unit_types && property.unit_types.length > 0;
  const activeType: SupabaseUnitType | null = (hasTypes && typeIdx !== null) ? property.unit_types[typeIdx] : null;

  // Fallback to legacy unit model if no types
  const legacyUnit = (!hasTypes && typeIdx !== null) ? (property.units?.[typeIdx] || property.units?.[0]) : null;

  const dynamicProgress = property.progress && property.progress.length > 0 ? property.progress[0] : null;
  const progress = dynamicProgress ? {
    progress: dynamicProgress.percentage || dynamicProgress.percent,
    statusText: dynamicProgress.label || dynamicProgress.status_text,
    estimated: dynamicProgress.estimated_completion || 'TBD'
  } : getProductProgress(property.name);

  const loanPercent = property.loan_percentage ? `${property.loan_percentage}% Bank Financing` : getLoanPercentage(property.developer, property.name);

  // Pricing from active type or legacy unit
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
      className="group relative bg-[var(--card)] rounded-luxury overflow-hidden border border-[var(--border)] transition-all duration-500 hover:shadow-2xl hover:shadow-brand-blue/5 hover:-translate-y-1"
    >
      {/* Comparison Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => toggleCompare(property)}
          title={compared.find(p => p.id === property.id) ? "Remove from Comparison" : "Add to Comparison"}
          className={`h-9 px-3 rounded-full backdrop-blur-md border flex items-center gap-2 transition-all shadow-lg ${compared.find(p => p.id === property.id) ? 'bg-brand-blue border-brand-blue text-white' : 'bg-black/40 border-white/20 text-white hover:bg-black/60 hover:scale-105 active:scale-95'}`}
        >
          <LayoutGrid size={14} className={compared.find(p => p.id === property.id) ? 'animate-pulse' : ''} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Compare</span>
          {compared.find(p => p.id === property.id) && (
            <motion.div layoutId="check" className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          )}
        </button>
      </div>

      {/* Cover / Type Image — switches with type selector */}
      <div className="relative h-72 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent opacity-80" />

        {loanPercent && (
          <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
            {loanPercent}
          </div>
        )}

        {/* Type count badge */}
        {hasTypes && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={10} /> {property.unit_types.length} Types
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
            <button onClick={() => onViewMap(property)} className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-brand-blue transition-colors text-left" title="View Property on Map">
              <MapPin size={12} className="text-brand-blue" />
              {property.location}
            </button>
          </div>
        </div>

        {/* Construction Progress */}
        <div className="mb-6 p-4 rounded-3xl bg-brand-blue/5 border border-brand-blue/10 relative overflow-hidden group/progress">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <span className="flex items-center gap-2 text-brand-blue">
               <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
               Project Pulse
            </span>
            <div className="flex items-center gap-3">
              <span className="bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded font-black tabular-nums">{progress.progress}%</span>
              <span className="opacity-30">{progress.statusText}</span>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-500/10 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progress.progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-brand-blue rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </div>
          <div className="mt-2 text-[8px] font-black uppercase tracking-[0.3em] opacity-20 flex justify-between">
             <span>Phase: {progress.statusText}</span>
             <span>Est. Completion: {progress.estimated}</span>
          </div>
        </div>

        {/* Unit Type Selector */}
        <div className="space-y-4 mb-8">
          {hasTypes ? (
            <>
              {/* Type Cards — clickable thumbnails */}
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Select Apartment Type</p>
              {property.unit_types.length <= 4 ? (
                <div className="grid grid-cols-2 gap-2">
                  {property.unit_types.map((ut, i) => (
                    <button
                      key={ut.id}
                      onClick={() => setTypeIdx(typeIdx === i ? null : i)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all text-left p-3 ${typeIdx === i ? 'border-brand-blue bg-brand-blue/5' : 'border-[var(--border)] bg-slate-500/5 hover:border-brand-blue/40'}`}
                    >
                      {ut.type_image && (
                        <div className="relative h-14 w-full rounded-lg overflow-hidden mb-2">
                          <Image src={ut.type_image} alt={ut.name} fill className="object-cover" unoptimized />
                        </div>
                      )}
                      <p className="text-[10px] font-black uppercase tracking-widest leading-tight truncate">{ut.name}</p>
                      <p className="text-[9px] opacity-50 mt-0.5">{ut.beds}B/{ut.baths}Ba · {ut.sqm}m²</p>
                      <div className="mt-1.5">
                        <AvailabilityBadge type={ut} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={typeIdx ?? ''}
                    onChange={(e) => setTypeIdx(e.target.value === '' ? null : Number(e.target.value))}
                    title="Select Apartment Type"
                    className="w-full appearance-none bg-slate-500/5 border border-[var(--border)] rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none cursor-pointer transition-all"
                  >
                    <option value="">Property Overview</option>
                    {property.unit_types.map((ut, i) => (
                      <option key={ut.id} value={i}>
                        {ut.name} — {ut.sqm}m² · {ut.available_count || 0} avail.
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                </div>
              )}

              {/* Specs row */}
              {activeType && (
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-4 text-xs font-bold opacity-60">
                    <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-brand-blue" /> {beds} Bed{beds !== 1 ? 's' : ''}</span>
                    <span className="flex items-center gap-1.5"><Bath size={14} className="text-brand-blue" /> {baths} Bath{baths !== 1 ? 's' : ''}</span>
                    <span className="flex items-center gap-1.5"><Maximize size={14} className="text-brand-blue" /> {sqm}m²</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Legacy unit dropdown for properties without types yet */
            <div className="relative">
              <select
                value={typeIdx ?? ''}
                onChange={(e) => setTypeIdx(e.target.value === '' ? null : Number(e.target.value))}
                title="Select Unit"
                className="w-full appearance-none bg-slate-500/5 border border-[var(--border)] rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-blue outline-none cursor-pointer transition-all"
              >
                <option value="">Property Overview</option>
                {property.units?.map((u, i) => (
                  <option key={i} value={i}>{u.type} — {u.sqm}m²</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
              <div className="flex justify-between items-center px-2 mt-3">
                <div className="flex items-center gap-4 text-xs font-bold opacity-60">
                  <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-brand-blue" /> {beds}</span>
                  <span className="flex items-center gap-1.5"><Bath size={14} className="text-brand-blue" /> {baths}</span>
                  <span className="flex items-center gap-1.5"><Maximize size={14} className="text-brand-blue" /> {sqm}m²</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="flex flex-col items-center mb-8 py-6 rounded-3xl bg-brand-blue/5 border border-brand-blue/10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue mb-2">
            {activeType ? 'Starting From' : 'Exclusive Offer'}
          </span>
          <div className="text-3xl font-heading font-black tracking-tighter">
            {formatPrice(offer.discountedPrice)}
          </div>
          {offer.discountPercent > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-slate-400 line-through">{formatPrice(basePrice)}</span>
              <span className="text-[10px] font-black bg-brand-blue text-white px-2 py-0.5 rounded-md">SAVE {offer.discountPercent}%</span>
            </div>
          )}
          {property.downpayment_percentage && property.downpayment_percentage > 0 ? (
            <div className="mt-2 text-[10px] font-bold opacity-40 uppercase tracking-widest italic">
              Starting from {property.downpayment_percentage}% Downpayment
            </div>
          ) : null}
          {/* Inventory summary */}
          {hasTypes && activeType && activeType.total_units > 0 && (
            <div className="mt-3 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
              <span className="text-emerald-400">{activeType.available_count || 0} Available</span>
              <span className="text-amber-400">{activeType.reserved_count || 0} Reserved</span>
              <span className="text-red-400">{activeType.sold_count || 0} Sold</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-5 gap-3">
            <button
              onClick={() => setAccordionOpen(!accordionOpen)}
              title="Toggle Payment Plans"
              className="col-span-1 flex items-center justify-center aspect-square rounded-2xl border border-[var(--border)] hover:bg-slate-500/5 transition-colors"
            >
              <Banknote size={20} className={accordionOpen ? 'text-brand-blue' : 'opacity-40'} />
            </button>
            <Link
              href={`/contact?interest=${encodeURIComponent(property.name)}`}
              className="col-span-4 btn-premium-primary w-full flex items-center justify-center gap-2 group/btn"
            >
              Secure Inquiry
              <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          {property.pdf_brochure_url && (
            <button 
              onClick={() => onViewPdf(property.id, `${property.name} - Brief`)}
              className="w-full py-4 rounded-2xl bg-slate-500/5 border border-[var(--border)] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/10 hover:text-brand-blue transition-all"
            >
              <FileText size={14} />
              View Brief
            </button>
          )}
        </div>



        {/* Payment Plans */}
        <AnimatePresence>
          {accordionOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
                {property.discount_conditions && (
                  <div className="p-4 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue mb-1">Offer Terms</p>
                    <p className="text-[11px] font-bold opacity-80 leading-relaxed italic">&quot;{property.discount_conditions}&quot;</p>
                  </div>
                )}
                {(() => {
                  const rules = activeType?.discount_rules || property.discount_rules || [
                    { downpayment: 20, discount: 2 }, 
                    { downpayment: 50, discount: 7 }, 
                    { downpayment: 100, discount: 15 }
                  ];
                  return rules.sort((a: { downpayment: number; discount: number }, b: { downpayment: number; discount: number }) => a.downpayment - b.downpayment).map((rule: { downpayment: number; discount: number }, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setDownPercent(rule.downpayment)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl text-xs font-bold transition-all border ${downPercent === rule.downpayment ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-[1.02]' : 'bg-slate-500/5 border-transparent hover:border-slate-500/20'}`}
                    >
                      <span>{rule.downpayment === 100 ? '🎯 Full Payment' : `${rule.downpayment}% Down`}</span>
                      {rule.discount > 0 && (
                        <span className={`px-2 py-0.5 rounded-md ${downPercent === rule.downpayment ? 'bg-white/20' : 'bg-emerald-500 text-white'}`}>
                          +{rule.discount}% Disc.
                        </span>
                      )}
                    </button>
                  ));
                })()}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between items-center opacity-40">
           <span className="text-[9px] font-black uppercase tracking-widest">Schedule: {property.payment_schedule || 'Flexible'}</span>
           <span className="text-[9px] font-black uppercase tracking-widest">Type: {property.property_type || 'Apartment'}</span>
        </div>
      </div>
      {/* PDF and Map Modals handled by parent gallery */}
    </motion.div>
  );
}
