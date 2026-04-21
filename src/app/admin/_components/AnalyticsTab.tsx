"use client";

import React from 'react';
import { motion } from "framer-motion";
import { TrendingUp, Zap, Mail, ShieldCheck, PieChart, Activity, Globe, Users } from "lucide-react";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

interface Stats {
  totalLeads: number;
  activeProperties: number;
  campaignReach: number;
  growth: string;
}

interface AnalyticsTabProps {
  stats?: Stats;
}

export function AnalyticsTab({ stats = { totalLeads: 0, activeProperties: 0, campaignReach: 0, growth: '0%' } }: AnalyticsTabProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="space-y-6"
    >
      {/* Main Performance Dashboard */}
      <div className="relative">
        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">System Performance Metrics</h4>
             </div>
             <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-500/5 rounded-lg text-[9px] font-bold uppercase tracking-widest opacity-40">
                   <Activity size={10} /> Live Data
                </div>
             </div>
          </div>
          
          <div className="min-h-[400px]">
             <AnalyticsDashboard />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
