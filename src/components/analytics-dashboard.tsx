"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Users, Globe2, BarChart3, Activity,
  Zap, RefreshCw, AlertTriangle, Home, Mail,
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
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
  device_type?: string;
  browser?: string;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CHANNEL_COLORS: Record<string, string> = {
  organic: "#10B981",
  direct: "#3B82F6",
  instagram: "#E1306C",
  linkedin: "#0A66C2",
  telegram: "#26A5E4",
  referral: "#A855F7",
  other: "#64748B",
};
const PIE_COLORS = ["#3B82F6", "#10B981", "#A855F7", "#F59E0B", "#EF4444", "#06B6D4", "#F97316", "#EC4899"];

type TabId = "leads" | "traffic" | "countries" | "sources";

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: "leads",     label: "Lead Trend",    icon: TrendingUp },
  { id: "traffic",   label: "Traffic Pulse", icon: Activity },
  { id: "countries", label: "Global Reach",  icon: Globe2 },
  { id: "sources",   label: "Lead Sources",  icon: BarChart3 },
];

// ─── Data Builders ─────────────────────────────────────────────────────────────
function buildLeadTrend(leads: LeadRecord[]) {
  const now = Date.now();
  return Array.from({ length: 12 }, (_, i) => {
    const weekIndex = 11 - i;
    const count = leads.filter((l) => {
      const t = new Date(l.created_at || "").getTime();
      return Math.floor((now - t) / (7 * 24 * 60 * 60 * 1000)) === weekIndex;
    }).length;
    return { week: `W${12 - weekIndex}`, count };
  });
}

function buildTrafficTrend(visitors: VisitorRecord[]) {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-US", { weekday: "short" });
    const count = visitors.filter((v) => new Date(v.created_at).toDateString() === d.toDateString()).length;
    return { day: key, count };
  });
}

function buildCountries(visitors: VisitorRecord[]) {
  const map: Record<string, { count: number; name: string }> = {};
  visitors.forEach((v) => {
    const code = v.country_code || "UN";
    if (!map[code]) map[code] = { count: 0, name: v.country || code };
    map[code].count++;
  });
  const getFlag = (code: string) =>
    code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397));
  return Object.entries(map)
    .map(([code, { count, name }], i) => ({
      code, name, flag: code.length === 2 ? getFlag(code) : "🌍",
      value: count, color: PIE_COLORS[i % PIE_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

function buildLeadSources(leads: LeadRecord[]) {
  const map: Record<string, number> = {};
  leads.forEach((l) => {
    const src = (l.source || "organic").toLowerCase();
    map[src] = (map[src] || 0) + 1;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value, color: CHANNEL_COLORS[name] || CHANNEL_COLORS.other }))
    .sort((a, b) => b.value - a.value);
}

function buildLeadStatuses(leads: LeadRecord[]) {
  const order = ["new", "contacted", "viewing", "qualified", "closed", "lost"];
  const map: Record<string, number> = {};
  leads.forEach((l) => {
    const s = l.status || "new";
    map[s] = (map[s] || 0) + 1;
  });
  return order.filter((s) => map[s] > 0).map((s) => ({ name: s, value: map[s] }));
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, unit = "" }: {
  active?: boolean; payload?: Array<{ value: number; color?: string }>; label?: string; unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-2xl text-xs">
      <p className="font-black uppercase tracking-widest text-brand-blue mb-1">{label}</p>
      <p className="font-bold text-[var(--foreground)]">{payload[0].value} {unit}</p>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400",
  contacted: "bg-amber-500/20 text-amber-400",
  viewing: "bg-purple-500/20 text-purple-400",
  qualified: "bg-emerald-500/20 text-emerald-400",
  closed: "bg-emerald-700/20 text-emerald-600",
  lost: "bg-red-500/20 text-red-400",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("leads");
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [activeToday, setActiveToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const channelRef = useRef<ReturnType<typeof supabaseClient.channel> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadsRes, visitorsRes] = await Promise.all([
        supabaseClient
          .from("leads")
          .select("created_at, source, interest, status")
          .order("created_at", { ascending: false }),
        supabaseClient
          .from("visitors")
          .select("id, country, country_code, device_type, browser, created_at")
          .order("created_at", { ascending: false })
          .limit(2000),
      ]);

      if (leadsRes.error) throw leadsRes.error;
      if (visitorsRes.error) throw visitorsRes.error;

      const leadsData = leadsRes.data || [];
      const visitorsData = visitorsRes.data || [];

      setLeads(leadsData);
      setVisitors(visitorsData);

      // "Active today" — visitors whose created_at date matches today (UTC)
      const todayStr = new Date().toDateString();
      setActiveToday(visitorsData.filter((v) => new Date(v.created_at).toDateString() === todayStr).length);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Real-time subscription
    channelRef.current = supabaseClient
      .channel("analytics-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visitors" }, (payload) => {
        const v = payload.new as VisitorRecord;
        setVisitors((prev) => [v, ...prev]);
        const todayStr = new Date().toDateString();
        if (new Date(v.created_at).toDateString() === todayStr) {
          setActiveToday((prev) => prev + 1);
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload) => {
        const l = payload.new as LeadRecord;
        setLeads((prev) => [l, ...prev]);
      })
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[Analytics] Real-time channel error — operating in polling mode");
        }
      });

    return () => {
      if (channelRef.current) supabaseClient.removeChannel(channelRef.current);
    };
  }, [fetchData]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const trendData      = buildLeadTrend(leads);
  const trafficData    = buildTrafficTrend(visitors);
  const countryData    = buildCountries(visitors);
  const sourceData     = buildLeadSources(leads);
  const statusData     = buildLeadStatuses(leads);

  const totalLeads   = leads.length;
  const totalTraffic = visitors.length;
  const convRate     = totalTraffic > 0 ? ((totalLeads / totalTraffic) * 100).toFixed(1) : "0.0";
  const newLeads     = leads.filter((l) => l.status === "new").length;

  const thisWeek   = trendData[trendData.length - 1]?.count ?? 0;
  const lastWeek   = trendData[trendData.length - 2]?.count ?? 0;
  const weekGrowth = lastWeek > 0 ? (((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1) : (thisWeek > 0 ? "∞" : "0.0");

  // ── KPI Cards ─────────────────────────────────────────────────────────────
  const kpis = [
    { label: "Visitors Today",  value: activeToday,  icon: Users,       color: "text-emerald-400",  bg: "bg-emerald-500/10" },
    { label: "Total Reach",     value: totalTraffic,  icon: Globe2,       color: "text-brand-blue",   bg: "bg-brand-blue/10" },
    { label: "Total Leads",     value: totalLeads,    icon: Mail,         color: "text-purple-400",   bg: "bg-purple-500/10" },
    { label: "New Leads",       value: newLeads,      icon: TrendingUp,   color: "text-amber-400",    bg: "bg-amber-500/10" },
    { label: "Conv. Rate",      value: `${convRate}%`,icon: Zap,          color: "text-pink-400",     bg: "bg-pink-500/10" },
    { label: "Week Growth",     value: `${weekGrowth}%`, icon: Activity, color: "text-cyan-400",     bg: "bg-cyan-500/10" },
  ];

  return (
    <div className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] overflow-hidden shadow-2xl">

      {/* ── Header ── */}
      <div className="p-8 md:p-10 border-b border-[var(--border)]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
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
              {lastUpdated && (
                <p className="text-[9px] opacity-30 mt-1">
                  Last sync: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-500/10 hover:bg-brand-blue/10 text-[var(--foreground)]/50 hover:text-brand-blue rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Refresh"}
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`${kpi.bg} rounded-2xl p-4 border border-[var(--border)]`}
            >
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon size={13} className={kpi.color} />
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--foreground)]/40 leading-tight">{kpi.label}</p>
              </div>
              <p className={`text-xl font-black tracking-tight ${kpi.color}`}>{kpi.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Lead Status Strip */}
        {statusData.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {statusData.map((s) => (
              <span key={s.name} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[s.name] ?? "bg-slate-500/10 text-[var(--foreground)]/40"}`}>
                {s.name}: {s.value}
              </span>
            ))}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 mt-6">
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

      {/* ── Chart Area ── */}
      <div className="p-8 md:p-10">
        {error ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
            <AlertTriangle size={32} className="text-amber-400" />
            <div>
              <p className="text-sm font-black text-[var(--foreground)]">Analytics Unavailable</p>
              <p className="text-xs opacity-40 mt-1">{error}</p>
            </div>
            <button
              onClick={fetchData}
              className="px-6 py-2.5 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity"
            >
              Retry Connection
            </button>
          </div>
        ) : loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <Activity size={32} className="text-brand-blue animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Decrypting intelligence feed...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ── Lead Trend ── */}
            {activeTab === "leads" && (
              <motion.div key="leads" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-6">
                  12-Week Lead Acquisition Trend
                </p>
                {leads.length === 0 ? (
                  <EmptyState icon={TrendingUp} label="No leads recorded yet" sub="Lead data will appear here as contacts are captured." />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.4, fontWeight: 900 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.4, fontWeight: 900 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip unit="leads" />} />
                      <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2.5} fill="url(#leadGrad)" dot={{ fill: "#3B82F6", r: 3 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            )}

            {/* ── Traffic Pulse ── */}
            {activeTab === "traffic" && (
              <motion.div key="traffic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-6">
                  7-Day Visitor Intensity Trend
                </p>
                {visitors.length === 0 ? (
                  <EmptyState icon={Activity} label="No visitor data yet" sub="Visitors are tracked automatically when someone opens the site." />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={trafficData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.4, fontWeight: 900 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.4, fontWeight: 900 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip unit="visitors" />} />
                      <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2.5} fill="url(#trafficGrad)" dot={{ fill: "#10B981", r: 3 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            )}

            {/* ── Global Reach ── */}
            {activeTab === "countries" && (
              <motion.div key="countries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-6">
                  Global Reach by Country
                </p>
                {countryData.length === 0 ? (
                  <EmptyState icon={Globe2} label="No geographic data yet" sub="Country distribution populates once visitors are tracked." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={countryData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                          {countryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) =>
                            active && payload?.length ? (
                              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-xs shadow-xl">
                                <p className="font-black text-brand-blue">{(payload[0].payload as { flag?: string; name?: string }).flag} {(payload[0].payload as { name?: string }).name}</p>
                                <p className="font-bold">{payload[0].value} visitors</p>
                              </div>
                            ) : null
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                      {countryData.map((r) => {
                        const pct = Math.round((r.value / Math.max(1, totalTraffic)) * 100);
                        return (
                          <div key={r.code} className="p-4 bg-slate-500/5 rounded-2xl border border-[var(--border)]">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xl">{r.flag}</span>
                              <span className="text-[10px] font-black text-brand-blue">{pct}%</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{r.code}</p>
                            <p className="text-sm font-bold mt-1">{r.value} {r.value === 1 ? "visit" : "visits"}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Lead Sources ── */}
            {activeTab === "sources" && (
              <motion.div key="sources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-6">
                  Lead Acquisition by Channel
                </p>
                {sourceData.length === 0 ? (
                  <EmptyState icon={BarChart3} label="No source data yet" sub="Channel breakdown populates once leads include source tags." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={sourceData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.4, fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "var(--foreground)", opacity: 0.4, fontWeight: 900 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip unit="leads" />} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {sourceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {sourceData.map((s) => {
                        const pct = Math.round((s.value / Math.max(1, totalLeads)) * 100);
                        return (
                          <div key={s.name} className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
                                <span className="text-[10px] font-black" style={{ color: s.color }}>{pct}%</span>
                              </div>
                              <div className="mt-1 h-1.5 bg-slate-500/10 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: s.color }} />
                              </div>
                            </div>
                            <span className="text-xs font-bold opacity-50 w-6 text-right">{s.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-10 py-5 bg-slate-500/5 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-2">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--foreground)]/20">
          Powered by Supabase Real-Time Analytics
        </p>
        <div className="flex items-center gap-2">
          <Globe2 size={12} className="text-brand-blue" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/30">
            Aloha Intelligence Suite v4
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, label, sub }: { icon: typeof Activity; label: string; sub: string }) {
  return (
    <div className="h-64 flex flex-col items-center justify-center gap-3 opacity-30 text-center">
      <Icon size={32} />
      <p className="text-sm font-black">{label}</p>
      <p className="text-xs max-w-xs">{sub}</p>
    </div>
  );
}
