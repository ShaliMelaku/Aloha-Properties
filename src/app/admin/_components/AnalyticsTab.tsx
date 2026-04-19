"use client";

import React from 'react';
import { motion } from "framer-motion";
import { TrendingUp, Zap, Mail, ShieldCheck, PieChart } from "lucide-react";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { Property, Lead, Campaign } from "@/types/admin";

interface AnalyticsTabProps {
  stats: {
    totalLeads: number;
    activeProperties: number;
    campaignReach: number;
    growth: string;
  };
}

export function AnalyticsTab({ stats }: AnalyticsTabProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={TrendingUp} 
          label="Lead Momentum" 
          value={stats.totalLeads.toString()} 
          subtitle="Total Capture Records" 
          accent="emerald"
        />
        <StatCard 
          icon={Zap} 
          label="Campaign Reach" 
          value={stats.campaignReach.toLocaleString()} 
          subtitle="Global Audiences" 
          accent="blue"
        />
        <div className="bg-brand-blue p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group font-black text-white h-full flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-60 mb-2">Portfolio Density</p>
            <h3 className="text-4xl font-heading tracking-tight italic">{stats.activeProperties} Props</h3>
          </div>
          <p className="text-sm opacity-60 mt-4">Active Managed Listings</p>
        </div>
      </div>

      <AnalyticsDashboard />
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, subtitle, accent }: any) {
  const accentColors: any = {
    emerald: "bg-emerald-500/10 text-emerald-500",
    blue: "bg-brand-blue/10 text-brand-blue"
  };

  return (
    <div className="bg-[var(--card)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${accentColors[accent]}`}>
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2">{label}</p>
      <h3 className="text-4xl font-heading font-black tracking-tight text-[var(--foreground)]">{value}</h3>
      <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${accent === 'emerald' ? 'text-emerald-500' : 'text-brand-blue'}`}>
        {accent === 'emerald' ? <ShieldCheck size={14} /> : <Mail size={14} />}
        {subtitle}
      </p>
    </div>
  );
}
