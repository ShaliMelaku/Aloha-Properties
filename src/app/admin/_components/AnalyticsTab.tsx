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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-10"
    >
      {/* Premium KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-[var(--card)] p-10 rounded-[3rem] border border-[var(--border)] shadow-2xl relative overflow-hidden group">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={160} className="text-brand-blue" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-8 shadow-inner">
                <Users size={28} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 text-[var(--foreground)] mb-3">Investor Pipeline</p>
              <h3 className="text-6xl font-heading font-black tracking-tighter text-[var(--foreground)] tabular-nums">{stats.totalLeads.toLocaleString()}</h3>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${stats.growth.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {stats.growth} Periodic Growth
              </span>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Market Momentum</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] p-8 rounded-[3rem] border border-[var(--border)] shadow-xl relative overflow-hidden group flex flex-col justify-between">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-6 shadow-inner">
              <Mail size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2">Campaign Outreach</p>
            <h3 className="text-4xl font-heading font-black tracking-tight text-[var(--foreground)] tabular-nums">{stats.campaignReach.toLocaleString()}</h3>
          </div>
          <div className="relative z-10 mt-6">
             <div className="flex items-center gap-2 text-brand-blue text-[9px] font-black uppercase tracking-widest">
                <Globe size={14} /> Global Audiences
             </div>
          </div>
          {/* Subtle glow */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl group-hover:bg-brand-blue/10 transition-all" />
        </div>

        <div className="bg-brand-blue p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group font-black text-white flex flex-col justify-between">
          {/* Large background number */}
          <div className="absolute top-0 right-0 p-4 opacity-10 capitalize text-[9rem] select-none pointer-events-none italic font-heading transform translate-x-1/4 -translate-y-1/4">
            {stats.activeProperties}
          </div>
          
          <div className="relative z-10">
             <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm">
                <PieChart size={24} />
             </div>
             <p className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-2">Asset Concentration</p>
             <h3 className="text-4xl font-heading tracking-tight italic tabular-nums">{stats.activeProperties} Properties</h3>
          </div>
          
          <div className="relative z-10 mt-8">
             <p className="text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-2 font-bold">
               <ShieldCheck size={14} /> Certified Portfolio
             </p>
          </div>
        </div>
      </div>

      {/* Main Performance Dashboard */}
      <div className="relative group">
        <div className="absolute -left-12 top-0 h-full w-px bg-gradient-to-b from-brand-blue/30 via-transparent to-transparent hidden xl:block" />
        <div className="bg-[var(--card)] rounded-[4rem] border border-[var(--border)] p-12 shadow-2xl transition-all hover:border-brand-blue/20">
          <div className="flex items-center justify-between mb-12">
             <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse shadow-[0_0_10px_rgba(0,112,243,0.5)]" />
                <h4 className="text-xs font-black uppercase tracking-[0.5em] text-[var(--foreground)] opacity-40">System Performance Metrics</h4>
             </div>
             <div className="flex gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-500/5 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-40">
                   <Activity size={12} /> Live Sync
                </div>
             </div>
          </div>
          
          <div className="min-h-[400px]">
             <AnalyticsDashboard />
          </div>
        </div>
        
        {/* Subtle decorative glow */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-brand-blue/5 blur-[120px] rounded-full opacity-50" />
      </div>
    </motion.div>
  );
}
