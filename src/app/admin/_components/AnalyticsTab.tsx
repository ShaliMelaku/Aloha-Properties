"use client";

import React from 'react';
import { motion } from "framer-motion";
import { TrendingUp, Zap, Mail, ShieldCheck } from "lucide-react";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10"
    >
      {/* Premium KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-[var(--card)] p-10 rounded-[3rem] border border-[var(--border)] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={120} className="text-brand-blue" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-8">
                <TrendingUp size={28} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 text-[var(--foreground)] mb-3">Lead Momentum</p>
              <h3 className="text-6xl font-heading font-black tracking-tighter text-[var(--foreground)]">{stats.totalLeads.toLocaleString()}</h3>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${stats.growth.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {stats.growth} Growth
              </span>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Since last cluster</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] p-8 rounded-[3rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-6">
            <Zap size={24} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2">Campaign Reach</p>
          <h3 className="text-4xl font-heading font-black tracking-tight text-[var(--foreground)]">{stats.campaignReach.toLocaleString()}</h3>
          <p className="text-[10px] font-bold text-brand-blue mt-4 flex items-center gap-2 uppercase tracking-widest">
            <Mail size={14} /> Global Audiences
          </p>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl group-hover:bg-brand-blue/10 transition-all" />
        </div>

        <div className="bg-brand-blue p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group font-black text-white">
          <div className="absolute top-0 right-0 p-4 opacity-20 capitalize text-[8rem] select-none pointer-events-none italic font-heading">
            {stats.activeProperties}
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-2">Portfolio Density</p>
              <h3 className="text-4xl font-heading tracking-tight italic">{stats.activeProperties} Props</h3>
            </div>
            <p className="text-[10px] uppercase tracking-widest opacity-60 mt-8 flex items-center gap-2">
              <ShieldCheck size={14} /> System Verified
            </p>
          </div>
        </div>
      </div>

      {/* Main Analytics Engine */}
      <div className="relative">
        <div className="absolute -left-12 top-0 h-full w-px bg-gradient-to-b from-brand-blue/50 via-transparent to-transparent hidden xl:block" />
        <div className="bg-[var(--card)] rounded-[4rem] border border-[var(--border)] p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-12">
             <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
             <h4 className="text-xs font-black uppercase tracking-[0.5em] text-[var(--foreground)] opacity-40">Operational Intel Engine v4.0</h4>
          </div>
          <AnalyticsDashboard />
        </div>
      </div>
    </motion.div>
  );
}
