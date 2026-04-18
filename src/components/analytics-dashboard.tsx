"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, Globe2, BarChart3, PieChart as PieIcon, Activity,
  MapPin, Zap, ArrowUpRight,
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase";

interface LeadRecord {
  created_at?: string;
  source?: string;
  interest?: string;
  status?: string;
}

// Static lookup for interest → city label
const INTEREST_CITY: Record<string, string> = {
  "Addis Ababa": "Addis Ababa",
  "Bole": "Bole, AA",
  "CMC": "CMC, AA",
  "Sarbet": "Sarbet, AA",
  "Dubai": "Dubai, UAE",
  "London": "London, UK",
  "Nairobi": "Nairobi, KE",
  "General": "General Inquiry",
};

const CHANNEL_COLORS: Record<string, string> = {
  "organic": "#10B981",
  "direct": "#3B82F6",
  "instagram": "#E1306C",
  "linkedin": "#0A66C2",
  "telegram": "#26A5E4",
  "referral": "#A855F7",
  "other": "#64748B",
};

const PIE_COLORS = ["#3B82F6", "#10B981", "#A855F7", "#F59E0B", "#EF4444", "#06B6D4"];

type TabId = "leads" | "channels" | "regions";

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: "leads", label: "Lead Trend", icon: TrendingUp },
  { id: "channels", label: "Channels", icon: BarChart3 },
  { id: "regions", label: "Regions", icon: PieIcon },
];

function buildLeadTrend(leads: LeadRecord[]) {
  const weeks: Record<string, number> = {};
  const now = Date.now();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
    const key = `W${12 - i}`;
    weeks[key] = 0;
    leads.forEach((l) => {
      const t = new Date(l.created_at || "").getTime();
      const diff = (now - t) / (7 * 24 * 60 * 60 * 1000);
      if (Math.floor(diff) === i) weeks[key]++;
    });
  }
  return Object.entries(weeks).map(([week, count]) => ({ week, count }));
}

function buildChannels(leads: LeadRecord[]) {
  const map: Record<string, number> = {};
  leads.forEach((l) => {
    const src = (l.source || "organic").toLowerCase();
    map[src] = (map[src] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value, color: CHANNEL_COLORS[name] || CHANNEL_COLORS["other"] }))
    .sort((a, b) => b.value - a.value);
}

function buildRegions(leads: LeadRecord[]) {
  const map: Record<string, number> = {};
  leads.forEach((l) => {
    const reg = l.interest || "General";
    map[reg] = (map[reg] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, value], i) => ({ name: INTEREST_CITY[name] || name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

// Custom Tooltip
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-2xl text-xs">
      <p className="font-black uppercase tracking-widest text-brand-blue mb-1">{label}</p>
      <p className="font-bold text-[var(--foreground)]">{payload[0].value} leads</p>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("leads");
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseClient
      .from("leads")
      .select("created_at, source, interest, status")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLeads(data || []);
        setLoading(false);
      });
  }, []);

  const trendData = buildLeadTrend(leads);
  const channelData = buildChannels(leads);
  const regionData = buildRegions(leads);

  const totalLeads = leads.length;
  const thisWeek = trendData[trendData.length - 1]?.count ?? 0;
  const prevWeek = trendData[trendData.length - 2]?.count ?? 0;
  const growth = prevWeek > 0 ? (((thisWeek - prevWeek) / prevWeek) * 100).toFixed(1) : thisWeek > 0 ? "100" : "0";
  const qualified = leads.filter((l) => l.status === "qualified" || l.status === "closed").length;
  const convRate = totalLeads > 0 ? ((qualified / totalLeads) * 100).toFixed(1) : "0";

  return (
    <div className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-8 md:p-10 border-b border-[var(--border)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Activity size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Live Analytics</span>
              </div>
              <h2 className="text-2xl font-heading font-black tracking-tight text-[var(--foreground)] uppercase">
                Market Reach <span className="text-brand-blue italic">Pulse.</span>
              </h2>
            </div>
          </div>

          {/* KPI Chips */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { label: "Total Leads", value: totalLeads, icon: Users, color: "text-brand-blue" },
              { label: "WoW Growth", value: `${parseFloat(growth) >= 0 ? "+" : ""}${growth}%`, icon: TrendingUp, color: "text-emerald-500" },
              { label: "Conv. Rate", value: `${convRate}%`, icon: Zap, color: "text-amber-500" },
            ].map((kpi, idx) => (
              <motion.div 
                key={kpi.label} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-slate-500/5 rounded-2xl p-4 border border-[var(--border)]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon size={14} className={kpi.color} />
                  <p className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/40">{kpi.label}</p>
                </div>
                <p className={`text-xl font-black tracking-tight ${kpi.color}`}>{kpi.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                  : "bg-slate-500/5 text-[var(--foreground)]/40 hover:text-[var(--foreground)]"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-8 md:p-10">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Activity size={32} className="text-brand-blue animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "leads" && (
              <motion.div key="leads" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-6">12-Week Lead Acquisition Trend</p>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.4, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.4, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2.5} fill="url(#leadGrad)" dot={{ fill: "#3B82F6", r: 3 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {activeTab === "channels" && (
              <motion.div key="channels" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-6">Lead Acquisition by Channel</p>
                {channelData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center opacity-30">
                    <p className="text-xs font-black uppercase tracking-widest">No channel data yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={channelData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 40 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.6, fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          cursor={{ fill: "rgba(59,130,246,0.05)" }}
                          content={({ active, payload, label }) =>
                            active && payload?.length ? (
                              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-xl text-xs">
                                <p className="font-black text-brand-blue uppercase">{label}</p>
                                <p className="font-bold">{payload[0].value} leads</p>
                              </div>
                            ) : null
                          }
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                          {channelData.map((c, i) => (
                            <Cell key={i} fill={c.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {channelData.map((c) => {
                        const pct = Math.round((c.value / Math.max(1, totalLeads)) * 100);
                        return (
                          <div key={c.name} className="flex items-center justify-between p-3 bg-slate-500/5 rounded-xl">
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line react/forbid-dom-props */}
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                              <span className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]/60">{c.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* eslint-disable-next-line react/forbid-dom-props */}
                              <span className="text-sm font-black" style={{ color: c.color }}>{pct}%</span>
                              <ArrowUpRight size={12} className="text-[var(--foreground)]/20" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "regions" && (
              <motion.div key="regions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-6">Lead Distribution by Region / Interest</p>
                {regionData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center opacity-30">
                    <p className="text-xs font-black uppercase tracking-widest">No region data yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={regionData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                          {regionData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) =>
                            active && payload?.length ? (
                              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs shadow-xl">
                                <p className="font-black text-brand-blue">{payload[0].name}</p>
                                <p className="font-bold">{payload[0].value} leads</p>
                              </div>
                            ) : null
                          }
                        />
                        <Legend
                          formatter={(value) => (
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                               {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {regionData.map((r, i) => {
                        const pct = Math.round((r.value / Math.max(1, totalLeads)) * 100);
                        return (
                          <div key={r.name} className="flex items-center gap-3">
                            <MapPin size={14} style={{ color: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/60">{r.name}</span>
                                {/* eslint-disable-next-line react/forbid-dom-props */}
                                <span className="text-[10px] font-black" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{pct}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-500/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 1, delay: i * 0.1 }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-10 py-5 bg-slate-500/5 border-t border-[var(--border)] flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--foreground)]/20">
          Powered by Supabase Real-Time Analytics
        </p>
        <div className="flex items-center gap-2">
          <Globe2 size={12} className="text-brand-blue" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/30">Aloha Intelligence Suite v3</span>
        </div>
      </div>
    </div>
  );
}
