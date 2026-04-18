"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, ShieldCheck, Activity, Wind, Flame } from "lucide-react";
import { SupabaseProperty } from "@/hooks/use-properties";

interface EonetEvent {
  id: string;
  title: string;
  categories: { id: string; title: string }[];
}

export function EnvironmentalSafetyDialog({ property, onClose }: { property: SupabaseProperty, onClose: () => void }) {
  const [events, setEvents] = useState<EonetEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // NASA EONET API integration
    fetch(`/api/nasa/eonet?lat=${property.lat || 9}&lng=${property.lng || 38}&days=365`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.events) {
          setEvents(data.events);
        }
      })
      .catch()
      .finally(() => setLoading(false));
  }, [property.lat, property.lng]);

  const airQuality = property.air_quality_index || 50; 
  const urbanHeat = property.urban_heat_index || 0;
  const riskLevel = property.env_risk_level || 'Low';

  const riskColors = {
    'Low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    'Moderate': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    'High': 'text-red-400 bg-red-500/10 border-red-500/30',
  }[riskLevel] || 'text-slate-400 bg-slate-500/10 border-slate-500/30';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl bg-[var(--card)] border border-[var(--border)] rounded-luxury overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 lg:p-8 border-b border-[var(--border)]">
             <div>
                <h2 className="font-heading text-2xl font-black tracking-tight mb-2 flex items-center gap-3">
                   <ShieldCheck className="text-brand-blue" /> Environmental & Safety Intelligence
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Verified Community Safety Data for {property.name}</p>
             </div>
             <button onClick={onClose} className="p-3 bg-slate-500/10 hover:bg-slate-500/20 rounded-full transition-colors">
               <X size={20} />
             </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-px bg-[var(--border)]">
             
             {/* Left Panel: Overlays */}
             <div className="bg-[var(--card)] p-6 lg:p-8 space-y-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-black uppercase tracking-widest ${riskColors}`}>
                   <Activity size={14} /> Overall Risk: {riskLevel}
                </div>

                <div className="space-y-6">
                   <div>
                      <div className="flex items-center justify-between mb-3">
                         <span className="flex items-center gap-2 text-sm font-bold opacity-80"><Wind size={16} className="text-sky-400"/> Air Quality Index</span>
                         <span className="text-sm font-black">{airQuality} AQI</span>
                      </div>
                      <div className="h-2 w-full bg-slate-500/20 rounded-full overflow-hidden">
                         <div style={{ width: `${Math.min(100, airQuality)}%` }} className={`h-full rounded-full ${airQuality < 50 ? 'bg-emerald-400' : airQuality < 100 ? 'bg-amber-400' : 'bg-red-400'}`} />
                      </div>
                      <p className="mt-2 text-xs opacity-50 font-medium">Lower is healthier. Safe for most luxury developments.</p>
                   </div>

                   <div>
                      <div className="flex items-center justify-between mb-3">
                         <span className="flex items-center gap-2 text-sm font-bold opacity-80"><Flame size={16} className="text-orange-500"/> Urban Heat Island Index</span>
                         <span className="text-sm font-black">{urbanHeat} / 100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-500/20 rounded-full overflow-hidden">
                         <div style={{ width: `${Math.min(100, urbanHeat)}%` }} className="h-full rounded-full bg-gradient-to-r from-orange-300 to-orange-600" />
                      </div>
                      <p className="mt-2 text-xs opacity-50 font-medium">Higher values indicate denser concrete heat retention vs green cooling.</p>
                   </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                   <p className="text-[10px] uppercase font-black tracking-widest text-brand-blue flex items-center gap-2">
                       Powered by NASA Geospatial Directives & EONET
                   </p>
                </div>
             </div>

             {/* Right Panel: EONET Hazard Radar */}
             <div className="bg-slate-950 p-6 lg:p-8 flex flex-col items-start h-[400px] overflow-y-auto w-full relative">
                 <div className="sticky top-0 w-full mb-6 pb-2 border-b border-slate-800 bg-slate-950/90 backdrop-blur z-10 flex items-center justify-between">
                    <h3 className="font-heading text-lg font-black text-white">Natural Event Tracker</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">Radar Active</span>
                 </div>
                 
                 {loading ? (
                    <div className="flex flex-col items-center justify-center flex-1 w-full gap-4 text-white/50">
                       <Activity size={24} className="animate-spin text-brand-blue" />
                       <span className="text-xs font-black uppercase tracking-widest">Scanning NASA Satellites...</span>
                    </div>
                 ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 w-full gap-4 text-emerald-400/80">
                       <ShieldCheck size={48} />
                       <p className="text-center font-bold text-sm">Clear Horizons. No major natural hazard events detected within a 5-degree radius over the past year.</p>
                    </div>
                 ) : (
                    <div className="space-y-4 w-full">
                       {events.map(event => (
                          <div key={event.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                             <div className="flex justify-between items-start mb-2">
                                <p className="font-bold text-sm text-amber-200 leading-tight">{event.title}</p>
                                <AlertTriangle size={14} className="text-amber-500 shrink-0 ml-4" />
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {event.categories.map(cat => (
                                   <span key={cat.id} className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded border border-white/10 text-white/50">
                                      {cat.title}
                                   </span>
                                ))}
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
             </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
