"use client";

import { useComparison } from "@/context/comparison-context";
import { TrendingUp, Sparkles, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SocialPulse() {
  const { activePulse } = useComparison();

  if (!activePulse) return null;

  // Contextual data generation (In production, these could be real stats from Supabase)
  const getContextualInfo = () => {
    const isHighEnd = activePulse.developer.includes("Getas") || activePulse.developer.includes("Metro");
    
    if (isHighEnd) {
      return {
        icon: Sparkles,
        text: `8 professional investors analyzed ${activePulse.name} this week.`,
        color: "text-purple-500",
        label: "Elite interest"
      };
    }

    const isConstruction = activePulse.progress?.[0]?.percent && activePulse.progress[0].percent < 80;
    if (isConstruction) {
       return {
         icon: TrendingUp,
         text: `Phase ${activePulse.progress![0].status_text} active. Demand at 94%.`,
         color: "text-emerald-500",
         label: "Project Momentum"
       };
    }

    return {
      icon: Eye,
      text: `Currently viewing: ${activePulse.name} in ${activePulse.location}.`,
      color: "text-brand-blue",
      label: "Live Insight"
    };
  };

  const info = getContextualInfo();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.9, y: 100 }}
        animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
        exit={{ opacity: 0, x: 50, scale: 0.9, y: 20 }}
        className="fixed bottom-24 right-6 z-[200] max-w-[300px] p-5 bg-[var(--card)]/80 backdrop-blur-2xl border border-brand-blue/20 rounded-3xl shadow-[0_20px_50px_rgba(0,102,255,0.15)] flex items-start gap-4"
      >
        <div className={`mt-0.5 p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-xl ${info.color}`}>
          <info.icon size={20} />
        </div>
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 mb-1.5">{info.label}</div>
          <p className="text-[12px] font-bold leading-snug text-[var(--foreground)] tracking-tight">
            {info.text}
          </p>
        </div>
        
        {/* Decorative corner indicator */}
        <div className="absolute top-2 right-2 flex gap-1">
           <span className="w-1 h-1 rounded-full bg-brand-blue animate-pulse" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
