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

interface VisitorRecord {
  id: string;
  country: string;
  country_code: string;
  device_type: string;
  browser: string;
  created_at: string;
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

type TabId = "leads" | "traffic" | "countries";

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: "leads", label: "Lead Trend", icon: TrendingUp },
  { id: "traffic", label: "Traffic Pulse", icon: Activity },
  { id: "countries", label: "Global Reach", icon: Globe2 },
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

function buildTrafficTrend(visitors: VisitorRecord[]) {
  const days: Record<string, number> = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-US", { weekday: "short" });
    days[key] = 0;
    visitors.forEach((v) => {
      const vt = new Date(v.created_at).toDateString();
      if (vt === d.toDateString()) days[key]++;
    });
  }
  return Object.entries(days).map(([day, count]) => ({ day, count }));
}

function buildCountries(visitors: VisitorRecord[]) {
  const map: Record<string, number> = {};
  visitors.forEach((v) => {
    const code = v.country_code || "UN";
    map[code] = (map[code] || 0) + 1;
  });
  
  // Country code to flag helper
  const getFlag = (code: string) => {
    return code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
  };

  return Object.entries(map)
    .map(([code, value], i) => ({ 
      name: code, 
      label: `${getFlag(code)} ${code}`,
      value, 
      color: PIE_COLORS[i % PIE_COLORS.length] 
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
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
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [leadsRes, visitorsRes] = await Promise.all([
        supabaseClient.from("leads").select("created_at, source, interest, status").order("created_at", { ascending: false }),
        supabaseClient.from("visitors").select("*").order("created_at", { ascending: false }).limit(1000)
      ]);

      setLeads(leadsRes.data || []);
      setVisitors(visitorsRes.data || []);
      
      // Calculate active today
      const today = new Date().toDateString();
      const todayCount = (visitorsRes.data || []).filter(v => new Date(v.created_at).toDateString() === today).length;
      setActiveVisitors(todayCount);
      
      setLoading(false);
    };

    fetchData();

    // Real-time subscription for visitors
    const channel = supabaseClient
      .channel("live-traffic")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visitors" }, (payload) => {
        const newVisitor = payload.new as VisitorRecord;
        setVisitors(prev => [newVisitor, ...prev]);
        setActiveVisitors(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const trendData = buildLeadTrend(leads);
  const trafficData = buildTrafficTrend(visitors);
  const countryData = buildCountries(visitors);

  const totalLeads = leads.length;
  const totalTraffic = visitors.length;
  const convRate = totalTraffic > 0 ? ((totalLeads / totalTraffic) * 100).toFixed(1) : "0";
  const acquisitionGrowth = trendData.length >= 2 
    ? (((trendData[trendData.length - 1].count - trendData[trendData.length - 2].count) / (trendData[trendData.length - 2].count || 1)) * 100).toFixed(1)
    : "0";

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
              { label: "Active Today", value: activeVisitors, icon: Users, color: "text-emerald-500" },
              { label: "Total Reach", value: totalTraffic, icon: Globe2, color: "text-brand-blue" },
              { label: "Conv. Index", value: `${convRate}%`, icon: Zap, color: "text-amber-500" },
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

            {activeTab === "traffic" && (
              <motion.div key="traffic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-6">7-Day Visitor Intensity Trend</p>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={trafficData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.4, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.4, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2.5} fill="url(#trafficGrad)" dot={{ fill: "#10B981", r: 3 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {activeTab === "countries" && (
              <motion.div key="countries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-6">Global Reach Distribution by Country</p>
                {countryData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center opacity-30">
                    <p className="text-xs font-black uppercase tracking-widest">Awaiting visitor metrics...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={countryData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                          {countryData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) =>
                            active && payload?.length ? (
                              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs shadow-xl">
                                <p className="font-black text-brand-blue">{payload[0].name}</p>
                                <p className="font-bold">{payload[0].value} visitors</p>
                              </div>
                            ) : null
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-3">
                      {countryData.map((r, i) => {
                        const pct = Math.round((r.value / Math.max(1, totalTraffic)) * 100);
                        return (
                          <div key={r.name} className="p-4 bg-slate-500/5 rounded-2xl border border-[var(--border)]">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xl">{r.label?.split(' ')[0]}</span>
                              <span className="text-[10px] font-black text-brand-blue">{pct}%</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{r.name}</p>
                            <p className="text-sm font-bold mt-1">{r.value} Hits</p>
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
