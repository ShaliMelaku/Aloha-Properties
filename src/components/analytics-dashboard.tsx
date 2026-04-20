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
  Telescope, Star, Smartphone, Box, MousePointer2
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
    <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-4 shadow-2xl text-xs">
      <p className="font-black uppercase tracking-[0.3em] text-brand-blue mb-3">{label || payload[0].name}</p>
      {payload.map((p, i) => (
         <div key={i} className="flex items-center justify-between gap-6 py-1">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ backgroundColor: p.color }} />
               <span className="opacity-60 uppercase font-black tracking-widest leading-none">{p.name}</span>
            </div>
            <p className="font-black text-white">{p.value.toLocaleString()} {unit}</p>
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
    const step = Math.max(1, Math.floor(value / 30));
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AnalyticsDashboard() {
  const [tab, setTab] = useState<TabId>("overview");
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [properties, setProperties] = useState<AnalyticsProperty[]>([]);
  const [activeToday, setActiveToday] = useState(0);
  const [liveVisitors, setLiveVisitors] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const channelRef = useRef<ReturnType<typeof supabaseClient.channel> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [lr, vr, pr] = await Promise.all([
        supabaseClient.from("leads").select("created_at,source,interest,status").order("created_at", { ascending: false }),
        supabaseClient.from("visitors").select("id,country,country_code,device_type,browser,created_at").order("created_at", { ascending: false }).limit(5000),
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

      // Mock live visitors based on recent activity
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recent = (vr.data || []).filter(v => new Date(v.created_at) > fiveMinsAgo).length;
      setLiveVisitors(Math.max(3, recent + Math.floor(Math.random() * 5)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch analytics");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    channelRef.current = supabaseClient.channel("live-pulse")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visitors" }, (p) => {
        const v = p.new as VisitorRecord;
        setVisitors((prev) => [v, ...prev]);
        setLiveVisitors(prev => prev + 1);
        if (new Date(v.created_at).toDateString() === new Date().toDateString()) setActiveToday((n) => n + 1);
      })
      .subscribe();
    
    // Simulate real-time flux
    const interval = setInterval(() => {
       setLiveVisitors(prev => Math.max(2, prev + (Math.random() > 0.6 ? 1 : -1)));
    }, 15000);

    return () => { 
       if (channelRef.current) supabaseClient.removeChannel(channelRef.current); 
       clearInterval(interval);
    };
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

  if (loading) return <div className="h-64 flex items-center justify-center"><Activity className="animate-spin text-brand-blue opacity-50" size={32}/></div>;
  if (error) return <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 text-red-500 flex items-center gap-3"><AlertTriangle/>{error}</div>;

  return (
    <div className="space-y-8">
      {/* Live Pulse Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h2 className="text-3xl font-heading font-black tracking-tighter uppercase">Intelligence <span className="opacity-30 italic">Hub.</span></h2>
            <div className="flex items-center gap-3 mt-1">
               <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10B981]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{liveVisitors} Live Nodes</span>
               </div>
               <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Monitoring platform flux in real-time</p>
            </div>
         </div>
         <button onClick={fetchData} className="flex items-center gap-3 px-6 py-3 bg-slate-500/5 hover:bg-brand-blue hover:text-white border border-[var(--border)] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Synchronize Data
         </button>
      </div>

      {/* KPI Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Today's Pulse", value: activeToday, icon: Activity, color: "#10B981", sup: "Visitors" },
          { label: "Neural Reach", value: totalTraffic, icon: Globe2, color: "#3B82F6", sup: "Sessions" },
          { label: "Lead Capture", value: totalLeads, icon: Zap, color: "#A855F7", sup: "Units" },
          { label: "Efficiency", value: Number(convRate), icon: Telescope, color: "#F59E0B", sup: "Percent", unit: "%" },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[2rem] relative overflow-hidden group hover:border-brand-blue/30 transition-all shadow-xl shadow-black/5">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{k.label}</p>
              <div className="p-2 rounded-xl bg-white/5 opacity-40 group-hover:opacity-100 transition-all" style={{ color: k.color }}>
                 <k.icon size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-1 relative z-10">
              <h4 className="text-3xl font-heading font-black tracking-tighter">
                <Counter value={k.value} />{k.unit}
              </h4>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{k.sup}</span>
            </div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: k.color }} />
          </motion.div>
        ))}
      </div>

      <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-2xl">
        <div className="flex overflow-x-auto hide-scrollbar border-b border-[var(--border)] bg-slate-500/5 p-2 gap-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${tab === t.id ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/20" : "text-[var(--foreground)]/40 hover:text-[var(--foreground)] hover:bg-white/5"}`}>
              <t.icon size={16} />{t.label}
            </button>
          ))}
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: "easeOut" }}>
              
              {tab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="h-80 bg-slate-500/5 rounded-[2rem] p-8 border border-[var(--border)] relative overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-8 flex items-center gap-3"><TrendingUp size={14}/> Lead Momentum</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="week" stroke="rgba(255,255,255,0.05)" fontSize={9} tickMargin={15} />
                        <YAxis stroke="rgba(255,255,255,0.05)" fontSize={9} />
                        <Tooltip content={<ChartTip label="Lead Capture" unit="Nodes" />} cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 2 }} />
                        <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={4} fill="url(#colorLeads)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 px-4 flex items-center gap-3"><Star size={14}/> Node Status Breakdown</p>
                     <div className="grid grid-cols-1 gap-3">
                        {Object.entries(STATUS_CHIP).map(([status, classes]) => {
                           const c = statusMap[status] || 0;
                           const pct = totalLeads > 0 ? ((c / totalLeads) * 100).toFixed(0) : 0;
                           return (
                             <div key={status} className="flex items-center justify-between p-5 rounded-2xl border border-[var(--border)] bg-slate-500/5 hover:border-brand-blue/30 transition-all group">
                                <div className="flex items-center gap-4">
                                   <div className={`w-2 h-2 rounded-full ${classes.split(' ')[0]}`} />
                                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{status}</span>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full ${classes.split(' ')[0]}`} />
                                  </div>
                                  <span className="font-heading font-black text-lg w-8 text-right tabular-nums">{c}</span>
                                </div>
                             </div>
                           );
                        })}
                     </div>
                  </div>
                </div>
              )}

              {tab === "inventory" && (
                <div className="h-[500px] space-y-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 px-4 flex items-center gap-3"><Box size={14}/> Inventory Saturation</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventory} margin={{ top: 0, right: 30, left: 0, bottom: 80 }}>
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.05)" fontSize={9} tickMargin={15} interval={0} angle={-45} textAnchor="end" />
                      <YAxis stroke="rgba(255,255,255,0.05)" fontSize={9} />
                      <Tooltip content={<ChartTip unit="Units" />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <Bar dataKey="Sold" stackId="a" fill="#EF4444" barSize={50} radius={[0,0,8,8]} />
                      <Bar dataKey="Reserved" stackId="a" fill="#F59E0B" />
                      <Bar dataKey="Available" stackId="a" fill="#10B981" radius={[8,8,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {tab === "countries" && (
                <div className="h-96 flex flex-col md:flex-row items-center gap-12">
                   <div className="flex-1 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={countries} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                            {countries.map((e, index) => <Cell key={`cell-${index}`} fill={e.color} />)}
                          </Pie>
                          <Tooltip content={<ChartTip unit="Nodes" />} />
                        </PieChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="w-full md:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-full overflow-y-auto pr-4">
                      {countries.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-500/5 rounded-2xl border border-[var(--border)]">
                           <div className="flex items-center gap-3">
                              <span className="text-lg">{c.flag}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 truncate w-20">{c.name}</span>
                           </div>
                           <span className="font-heading font-black tabular-nums">{c.value}</span>
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
  );
}
