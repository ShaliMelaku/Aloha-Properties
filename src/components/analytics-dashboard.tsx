"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Users, Globe2, BarChart3, Activity,
  Zap, RefreshCw, AlertTriangle,
  Telescope, Star, Smartphone, Box
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

interface AnalyticsUnit {
  status: string;
}
interface AnalyticsProperty {
  name: string;
  units: AnalyticsUnit[];
  unit_types: unknown[];
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

type TabId = "overview" | "traffic" | "devices" | "countries" | "sources" | "inventory";

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

function buildDevices(visitors: VisitorRecord[]) {
  const map: Record<string, number> = {};
  visitors.forEach((v) => { const d = v.device_type || "Desktop"; map[d] = (map[d] || 0) + 1; });
  return Object.entries(map).map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] })).sort((a, b) => b.value - a.value);
}

function buildInventory(properties: AnalyticsProperty[]) {
  return properties.map(p => {
     let available = 0; let reserved = 0; let sold = 0;
     p.units?.forEach(u => {
        if(u.status === 'sold') sold++;
        else if(u.status === 'reserved') reserved++;
        else available++;
     });
     return {
        name: p.name.substring(0, 15) + (p.name.length > 15 ? '...' : ''),
        Available: available,
        Reserved: reserved,
        Sold: sold,
        total: available + reserved + sold
     };
  }).filter(p => p.total > 0).sort((a,b) => b.total - a.total);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, unit = "" }: { active?: boolean; payload?: Array<{ value: number; name?: string; color?: string }>; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-xs">
      <p className="font-black uppercase tracking-widest text-cyan-400 mb-2">{label || payload[0].name}</p>
      {payload.map((p, i) => (
         <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
               <span className="opacity-60 uppercase font-black tracking-widest">{p.name}</span>
            </div>
            <p className="font-bold text-white">{p.value} {unit}</p>
         </div>
      ))}
    </div>
  );
}

function Counter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    if (start === value) return;
    const step = Math.max(1, Math.floor(value / 20));
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

function Empty({ icon: Icon, label }: { icon: typeof Activity; label: string }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center gap-3 text-[var(--foreground)] opacity-20">
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
  const [properties, setProperties] = useState<AnalyticsProperty[]>([]);
  const [activeToday, setActiveToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const channelRef = useRef<ReturnType<typeof supabaseClient.channel> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [lr, vr, pr] = await Promise.all([
        supabaseClient.from("leads").select("created_at,source,interest,status").order("created_at", { ascending: false }),
        supabaseClient.from("visitors").select("id,country,country_code,device_type,browser,created_at").order("created_at", { ascending: false }).limit(2000),
        supabaseClient.from("properties").select("name, units:property_units(status), unit_types:property_unit_types(*)"),
      ]);
      if (lr.error) throw lr.error;
      if (vr.error) throw vr.error;
      if (pr.error) throw pr.error;
      
      setLeads(lr.data || []);
      setVisitors(vr.data || []);
      setProperties(pr.data || []);
      
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

  const trendData   = buildLeadTrend(leads);
  const trafficData = buildTrafficTrend(visitors);
  const countries   = buildCountries(visitors);
  const sources     = buildSources(leads);
  const devices     = buildDevices(visitors);
  const inventory   = buildInventory(properties);
  const statusMap   = leads.reduce((acc, l) => { const s = l.status || "new"; acc[s] = (acc[s] || 0) + 1; return acc; }, {} as Record<string, number>);

  const totalLeads   = leads.length;
  const totalTraffic = visitors.length;
  const convRate     = totalTraffic > 0 ? ((totalLeads / totalTraffic) * 100).toFixed(1) : "0.0";

  const TABS: { id: TabId; label: string; icon: typeof Activity }[] = [
    { id: "overview",   label: "Overview",      icon: BarChart3 },
    { id: "inventory",  label: "Inventory",     icon: Box },
    { id: "traffic",    label: "Traffic Pulse",  icon: Activity },
    { id: "devices",    label: "Devices",       icon: Smartphone },
    { id: "countries",  label: "Global Reach",   icon: Globe2 },
    { id: "sources",    label: "Lead Sources",   icon: TrendingUp },
  ];

  const kpis = [
    { label: "Today",       value: activeToday,     text: String(activeToday),   icon: Users,    color: "#10B981", sup: "Visitors" },
    { label: "Total Reach", value: totalTraffic,    text: String(totalTraffic),  icon: Globe2,   color: "#3B82F6", sup: "Sessions" },
    { label: "Lead Volume", value: totalLeads,      text: String(totalLeads),    icon: Zap,      color: "#A855F7", sup: "Captured" },
    { label: "Conv Rate",   value: Number(convRate),text: `${convRate}%`,        icon: Telescope,color: "#F59E0B", sup: "Global" },
  ];

  if (loading) return <div className="h-64 flex items-center justify-center"><Activity className="animate-spin text-brand-blue opacity-50" size={32}/></div>;
  if (error) return <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 text-red-500 flex items-center gap-3"><AlertTriangle/>{error}</div>;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">{k.label}</p>
              <k.icon size={14} style={{ color: k.color }} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-baseline gap-1">
              <h4 className="text-2xl font-heading font-black text-[var(--foreground)] tracking-tight">
                {typeof k.value === 'number' ? <Counter value={k.value} /> : k.value}
                {k.label === "Conv Rate" && "%"}
              </h4>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">{k.sup}</span>
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: k.color }} />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          </motion.div>
        ))}
      </div>

      <div className="bg-[var(--card)]/80 backdrop-blur-3xl rounded-[3rem] border border-[var(--border)] overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute -top-24 -left-24 w-96 h-96 bg-brand-blue/10 rounded-full blur-[120px]" />
           <motion.div animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 40, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10">
          {/* Navigation */}
          <div className="flex overflow-x-auto hide-scrollbar border-b border-[var(--border)] bg-white/5">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${tab === t.id ? "border-brand-blue text-brand-blue bg-white/5" : "border-transparent text-[var(--foreground)]/40 hover:text-[var(--foreground)]"}`}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
          <div className="ml-auto flex items-center px-4">
             <button onClick={fetchData} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 hover:text-brand-blue transition-colors px-3 py-1.5 rounded-lg border border-[var(--border)] bg-slate-500/5">
               <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> {lastSync ? lastSync.toLocaleTimeString() : 'Sync'}
             </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              
              {tab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 ml-6 flex items-center gap-2 text-[var(--foreground)]"><TrendingUp size={12}/> Lead Acquisition (12 Weeks)</p>
                    {trendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="week" stroke="rgba(255,255,255,0.1)" fontSize={10} tickMargin={10} />
                          <YAxis stroke="rgba(255,255,255,0.1)" fontSize={10} />
                          <Tooltip content={<ChartTip label="Acquisition" unit="Leads" />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                          <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fill="url(#colorLeads)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : <Empty icon={TrendingUp} label="No Data" />}
                  </div>
                  <div className="flex flex-col">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2 text-[var(--foreground)]"><Star size={12}/> Lead Pipeline Status</p>
                     <div className="flex-1 bg-slate-500/5 rounded-2xl border border-[var(--border)] p-4 overflow-y-auto space-y-2">
                        {Object.entries(STATUS_CHIP).map(([status, classes]) => {
                           const c = statusMap[status] || 0;
                           const pct = totalLeads > 0 ? ((c / totalLeads) * 100).toFixed(0) : 0;
                           return (
                             <div key={status} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                               <div className="flex items-center gap-3">
                                  <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${classes}`}>{status}</div>
                               </div>
                               <div className="flex items-center gap-4">
                                 <span className="text-[10px] opacity-40 font-bold w-8 text-right">{pct}%</span>
                                 <span className="font-bold text-sm text-[var(--foreground)] w-8 text-right">{c}</span>
                               </div>
                             </div>
                           );
                        })}
                     </div>
                  </div>
                </div>
              )}

              {tab === "inventory" && (
                <div className="h-80">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 ml-6 flex items-center gap-2 text-[var(--foreground)]"><Box size={12}/> Unit Sales & Inventory</p>
                  {inventory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inventory} margin={{ top: 0, right: 30, left: 0, bottom: 20 }}>
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} interval={0} angle={-30} textAnchor="end" />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} />
                        <Tooltip content={<ChartTip unit="Units" />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                        <Bar dataKey="Sold" stackId="a" fill="#EF4444" radius={[0,0,4,4]} barSize={40} />
                        <Bar dataKey="Reserved" stackId="a" fill="#F59E0B" />
                        <Bar dataKey="Available" stackId="a" fill="#10B981" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <Empty icon={Box} label="No inventory tracked" />}
                </div>
              )}

              {tab === "traffic" && (
                <div className="h-80">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 ml-6 flex items-center gap-2 text-[var(--foreground)]"><Activity size={12}/> Daily Unique Traffic</p>
                  {trafficData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.1)" fontSize={10} tickMargin={10} />
                        <YAxis stroke="rgba(255,255,255,0.1)" fontSize={10} />
                        <Tooltip content={<ChartTip label="Traffic" unit="Sessions" />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                        <Bar dataKey="count" fill="#3B82F6" radius={[4,4,0,0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <Empty icon={Activity} label="No traffic data" />}
                </div>
              )}

              {tab === "devices" && (
                <div className="h-80 flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="w-full md:w-1/2 h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={devices} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                          {devices.map((e, index) => <Cell key={`cell-${index}`} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<ChartTip unit="Sessions" />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2 max-h-full overflow-y-auto pr-2">
                     {devices.map((e, i) => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                         <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">{e.name}</span>
                         </div>
                         <span className="font-bold text-sm text-[var(--foreground)]/60">{e.value}</span>
                       </div>
                     ))}
                  </div>
                </div>
              )}

              {tab === "countries" && (
                <div className="h-80 flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="w-full md:w-1/2 h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={countries} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                          {countries.map((e, index) => <Cell key={`cell-${index}`} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<ChartTip unit="Hits" />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2 max-h-full overflow-y-auto pr-2">
                     {countries.map((c, i) => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                         <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-sm">{c.flag}</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] truncate max-w-[120px]" title={c.name}>{c.name}</span>
                         </div>
                         <div className="flex items-center gap-4">
                           <span className="text-[10px] opacity-40 font-bold">{totalTraffic ? ((c.value / totalTraffic) * 100).toFixed(1) : 0}%</span>
                           <span className="font-bold text-sm text-[var(--foreground)]/60 w-8 text-right">{c.value}</span>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              )}

              {tab === "sources" && (
                <div className="h-80 flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="w-full md:w-1/2 h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sources} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                          {sources.map((e, index) => <Cell key={`cell-${index}`} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<ChartTip unit="Leads" />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                      <Globe2 size={24} className="text-white/20 mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Channels</span>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2 max-h-full overflow-y-auto pr-2">
                     {sources.map((s, i) => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                         <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">{s.name}</span>
                         </div>
                         <div className="flex items-center gap-4">
                           <span className="text-[10px] opacity-40 font-bold">{totalLeads > 0 ? ((s.value / totalLeads) * 100).toFixed(1) : 0}%</span>
                           <span className="font-bold text-sm text-[var(--foreground)]/60 w-8 text-right">{s.value}</span>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      </div>
    </div>
  );
}
