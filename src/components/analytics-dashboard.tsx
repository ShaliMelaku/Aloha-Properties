"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Users, Globe2, BarChart3, Activity,
  Zap, RefreshCw, AlertTriangle, Mail, Home,
  Telescope, Star, Download,
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
  organic: "#10B981", direct: "#3B82F6", instagram: "#E1306C",
  linkedin: "#0A66C2", telegram: "#26A5E4", referral: "#A855F7", other: "#64748B",
};
const PIE_COLORS = ["#3B82F6", "#10B981", "#A855F7", "#F59E0B", "#EF4444", "#06B6D4", "#F97316", "#EC4899"];
const STATUS_CHIP: Record<string, string> = {
  new:       "bg-blue-500/20 text-blue-300 border-blue-500/30",
  contacted: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  viewing:   "bg-purple-500/20 text-purple-300 border-purple-500/30",
  qualified: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  closed:    "bg-green-700/20 text-green-400 border-green-700/30",
  lost:      "bg-red-500/20 text-red-300 border-red-500/30",
};

type TabId = "overview" | "traffic" | "countries" | "sources";

// ─── Data Builders ─────────────────────────────────────────────────────────────
function buildLeadTrend(leads: LeadRecord[]) {
  const now = Date.now();
  return Array.from({ length: 12 }, (_, i) => {
    const w = 11 - i;
    const count = leads.filter((l) => Math.floor((now - new Date(l.created_at || "").getTime()) / (7 * 24 * 60 * 60 * 1000)) === w).length;
    return { week: `W${12 - w}`, count };
  });
}

function buildTrafficTrend(visitors: VisitorRecord[]) {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      count: visitors.filter((v) => new Date(v.created_at).toDateString() === d.toDateString()).length,
    };
  });
}

function buildCountries(visitors: VisitorRecord[]) {
  const map: Record<string, { count: number; name: string }> = {};
  visitors.forEach((v) => {
    const code = v.country_code || "UN";
    if (!map[code]) map[code] = { count: 0, name: v.country || code };
    map[code].count++;
  });
  const getFlag = (c: string) => c.length === 2 ? c.toUpperCase().replace(/./g, ch => String.fromCodePoint(ch.charCodeAt(0) + 127397)) : "🌍";
  return Object.entries(map)
    .map(([code, { count, name }], i) => ({ code, name, flag: getFlag(code), value: count, color: PIE_COLORS[i % PIE_COLORS.length] }))
    .sort((a, b) => b.value - a.value).slice(0, 10);
}

function buildSources(leads: LeadRecord[]) {
  const map: Record<string, number> = {};
  leads.forEach((l) => { const s = (l.source || "organic").toLowerCase(); map[s] = (map[s] || 0) + 1; });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value, color: CHANNEL_COLORS[name] || CHANNEL_COLORS.other }))
    .sort((a, b) => b.value - a.value);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, unit = "" }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-xs">
      <p className="font-black uppercase tracking-widest text-cyan-400 mb-1">{label}</p>
      <p className="font-bold text-white">{payload[0].value} {unit}</p>
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const step = Math.max(1, Math.floor(end / 20));
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function Empty({ icon: Icon, label }: { icon: typeof Activity; label: string }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center gap-3 text-white/20">
      <Icon size={28} />
      <p className="text-xs font-black uppercase tracking-widest">{label}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AnalyticsDashboard() {
  const [tab, setTab] = useState<TabId>("overview");
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [activeToday, setActiveToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const channelRef = useRef<ReturnType<typeof supabaseClient.channel> | null>(null);

  // ── Analytics fetch ──────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [lr, vr] = await Promise.all([
        supabaseClient.from("leads").select("created_at,source,interest,status").order("created_at", { ascending: false }),
        supabaseClient.from("visitors").select("id,country,country_code,device_type,browser,created_at").order("created_at", { ascending: false }).limit(2000),
      ]);
      if (lr.error) throw lr.error;
      if (vr.error) throw vr.error;
      setLeads(lr.data || []);
      setVisitors(vr.data || []);
      const today = new Date().toDateString();
      setActiveToday((vr.data || []).filter((v) => new Date(v.created_at).toDateString() === today).length);
      setLastSync(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch analytics");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    channelRef.current = supabaseClient.channel("analytics-v5")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visitors" }, (p) => {
        const v = p.new as VisitorRecord;
        setVisitors((prev) => [v, ...prev]);
        if (new Date(v.created_at).toDateString() === new Date().toDateString()) setActiveToday((n) => n + 1);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (p) => {
        setLeads((prev) => [p.new as LeadRecord, ...prev]);
      })
      .subscribe();
    return () => { if (channelRef.current) supabaseClient.removeChannel(channelRef.current); };
  }, [fetchData]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const trendData   = buildLeadTrend(leads);
  const trafficData = buildTrafficTrend(visitors);
  const countries   = buildCountries(visitors);
  const sources     = buildSources(leads);
  const statusMap   = leads.reduce((acc, l) => { const s = l.status || "new"; acc[s] = (acc[s] || 0) + 1; return acc; }, {} as Record<string, number>);

  const totalLeads   = leads.length;
  const totalTraffic = visitors.length;
  const convRate     = totalTraffic > 0 ? ((totalLeads / totalTraffic) * 100).toFixed(1) : "0.0";
  const thisW        = trendData[trendData.length - 1]?.count ?? 0;
  const lastW        = trendData[trendData.length - 2]?.count ?? 0;
  const weekGrowth   = lastW > 0 ? `${(((thisW - lastW) / lastW) * 100).toFixed(0)}%` : thisW > 0 ? "∞%" : "—";

  const TABS: { id: TabId; label: string; icon: typeof Activity }[] = [
    { id: "overview",   label: "Overview",      icon: BarChart3 },
    { id: "traffic",    label: "Traffic Pulse",  icon: Activity },
    { id: "countries",  label: "Global Reach",   icon: Globe2 },
    { id: "sources",    label: "Lead Sources",   icon: TrendingUp },
  ];

  const kpis = [
    { label: "Today",       value: activeToday,     text: String(activeToday),   icon: Users,    color: "#10B981", sup: "Visitors" },
    { label: "Total Reach", value: totalTraffic,    text: String(totalTraffic),  icon: Globe2,   color: "#3B82F6", sup: "Sessions" },
    { label: "Leads",       value: totalLeads,      text: String(totalLeads),    icon: Mail,     color: "#A855F7", sup: "Captured" },
    { label: "Conv. Rate",  value: 0,               text: `${convRate}%`,        icon: Zap,      color: "#F59E0B", sup: "Lead/Visit" },
    { label: "New Leads",   value: statusMap["new"] || 0, text: String(statusMap["new"] || 0), icon: TrendingUp, color: "#06B6D4", sup: "Uncontacted" },
    { label: "Week Growth", value: 0,               text: weekGrowth,            icon: Activity, color: "#F97316", sup: "vs Last Week" },
  ];

  return (
    <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">

      {/* ── Luxury Background ── */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-slate-950 via-indigo-950/60 to-slate-950" />
        {/* Overlay grid */}
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(59,130,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.03) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10">

        {/* Header */}
        <div className="p-8 md:p-10 border-b border-white/5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 backdrop-blur flex items-center justify-center">
                <Activity size={30} className="text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Live Insights</span>
                </div>
                <h2 className="text-3xl font-heading font-black tracking-tighter text-white uppercase">
                  Market <span className="text-cyan-400 italic">Command</span>
                </h2>
                {lastSync && (
                  <p className="text-[9px] text-white/20 mt-0.5">Synced {lastSync.toLocaleTimeString()}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-cyan-500/10 text-white/40 hover:text-cyan-400 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                {loading ? "Syncing…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-4"
                style={{ boxShadow: `0 0 40px ${kpi.color}08` }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-30" style={{ background: kpi.color }} />
                <div className="flex items-center gap-2 mb-3">
                  <kpi.icon size={13} style={{ color: kpi.color }} />
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/30">{kpi.label}</p>
                </div>
                <p className="text-2xl font-black tracking-tight text-white mb-0.5" style={{ textShadow: `0 0 20px ${kpi.color}` }}>
                  {kpi.text.includes('%') || kpi.text === "—" || kpi.text.includes('∞') ? kpi.text : <Counter value={kpi.value} />}
                </p>
                <p className="text-[8px] uppercase tracking-widest text-white/20">{kpi.sup}</p>
              </motion.div>
            ))}
          </div>

          {/* Lead Status Funnel */}
          {Object.keys(statusMap).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(statusMap).map(([s, n]) => (
                <span key={s} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${STATUS_CHIP[s] ?? "bg-white/5 text-white/30 border-white/10"}`}>
                  {s}: {n}
                </span>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  tab === t.id
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-white/5 text-white/30 hover:text-white border border-white/8"
                }`}
              >
                <t.icon size={14} />{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="p-8 md:p-10 min-h-[360px]">
          {error ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
              <AlertTriangle size={32} className="text-amber-400" />
              <p className="text-sm font-black text-white">{error}</p>
              <button onClick={fetchData} className="px-6 py-2.5 bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90">
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <div className="relative w-12 h-12">
                <span className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
                <Activity size={24} className="absolute inset-0 m-auto text-cyan-400 animate-spin" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Loading data feed…</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">

              {/* Overview Tab */}
              {tab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">12-Week Lead Acquisition Trend</p>
                  {leads.length === 0 ? <Empty icon={TrendingUp} label="No lead data yet" /> : (
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="lGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="week" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontWeight: 900 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTip unit="leads" />} />
                        <Area type="monotone" dataKey="count" stroke="#06B6D4" strokeWidth={2.5} fill="url(#lGrad)" dot={{ fill: "#06B6D4", r: 3 }} activeDot={{ r: 6 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {/* Marketing metrics row */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Avg. Leads/Week", value: totalLeads > 0 ? (totalLeads / 12).toFixed(1) : "—" },
                      { label: "Peak Week",        value: Math.max(0, ...trendData.map(d => d.count)) || "—" },
                      { label: "Properties Online", value: "—" },
                      { label: "Campaign Reach",    value: "—" },
                    ].map((m) => (
                      <div key={m.label} className="bg-white/4 border border-white/8 rounded-2xl p-4">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">{m.label}</p>
                        <p className="text-xl font-black text-cyan-400">{m.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Traffic Tab */}
              {tab === "traffic" && (
                <motion.div key="traffic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">7-Day Visitor Intensity</p>
                  {visitors.length === 0 ? <Empty icon={Activity} label="No visitor data yet" /> : (
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={trafficData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontWeight: 900 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTip unit="visitors" />} />
                        <Area type="monotone" dataKey="count" stroke="#A855F7" strokeWidth={2.5} fill="url(#tGrad)" dot={{ fill: "#A855F7", r: 3 }} activeDot={{ r: 6 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>
              )}

              {/* Countries Tab */}
              {tab === "countries" && (
                <motion.div key="countries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">Global Reach by Country</p>
                  {countries.length === 0 ? <Empty icon={Globe2} label="No geographic data yet" /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={countries} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                            {countries.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) =>
                              active && payload?.length ? (
                                <div className="bg-black/80 backdrop-blur border border-white/10 rounded-xl px-4 py-3 text-xs shadow-xl">
                                  <p className="font-black text-cyan-400">{(payload[0].payload as { flag?: string; name?: string }).flag} {(payload[0].payload as { name?: string }).name}</p>
                                  <p className="font-bold text-white">{payload[0].value} visits</p>
                                </div>
                              ) : null
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                        {countries.map((r) => (
                          <div key={r.code} className="p-3 bg-white/4 rounded-xl border border-white/8">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-lg">{r.flag}</span>
                              <span className="text-[10px] font-black text-cyan-400">{Math.round((r.value / Math.max(1, totalTraffic)) * 100)}%</span>
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{r.code}</p>
                            <p className="text-sm font-bold text-white mt-0.5">{r.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Sources Tab */}
              {tab === "sources" && (
                <motion.div key="sources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">Lead Acquisition by Channel</p>
                  {sources.length === 0 ? <Empty icon={BarChart3} label="No channel data yet" /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={sources} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontWeight: 900 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", fontWeight: 900 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<ChartTip unit="leads" />} />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {sources.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="space-y-3">
                        {sources.map((s) => {
                          const pct = Math.round((s.value / Math.max(1, totalLeads)) * 100);
                          return (
                            <div key={s.name} className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{s.name}</span>
                                  <span className="text-[10px] font-black" style={{ color: s.color }}>{pct}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: s.color }} />
                                </div>
                              </div>
                              <span className="text-xs font-bold text-white/30 w-5 text-right">{s.value}</span>
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
      </div>
    </div>
  );
}
