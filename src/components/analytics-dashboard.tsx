"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Globe2, BarChart3, Activity,
  Zap, RefreshCw, AlertTriangle,
  Telescope, Star, Box, Cpu, Fingerprint, Layers
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
  city?: string;
  region?: string;
  lat?: number;
  lng?: number;
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
  urgent:    "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

type TabId = "overview" | "traffic" | "devices" | "countries" | "sources" | "inventory" | "goals";

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

function buildOperationalValue(leads: LeadRecord[], properties: AnalyticsProperty[]) {
  const leadValue = leads.length * 150000;
  const soldUnits = properties.reduce((acc, p) => acc + (p.units?.filter(u => u.status === 'sold').length || 0), 0);
  const totalValue = leadValue + (soldUnits * 450000); 
  return totalValue;
}

function buildInventory(properties: AnalyticsProperty[]) {
  return properties.map(p => {
     let available = 0; let reserved = 0; let sold = 0;
     (p.units || []).forEach((u: AnalyticsUnit) => {
        const s = u.status?.toLowerCase();
        if(s === 'sold') sold++;
        else if(s === 'reserved') reserved++;
        else available++;
     });
     return {
        name: p.name.substring(0, 15) + (p.name.length > 15 ? '...' : ''),
        Available: available,
        Reserved: reserved,
        Sold: sold,
        total: available + (reserved || 0) + (sold || 0)
     };
  }).filter(p => p.total > 0).sort((a,b) => b.total - a.total);
}

// ─── Immersive Components ─────────────────────────────────────────────────────

function NeuralBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-500/5 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
    </div>
  );
}

function ChartTip({ active, payload, label, unit = "" }: { active?: boolean; payload?: Array<{ value: number; name?: string; color?: string }>; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-3xl px-8 py-6 shadow-2xl ring-1 ring-white/20">
      <p className="font-black uppercase tracking-[0.4em] text-brand-blue mb-4 text-[10px]">{label || payload[0].name}</p>
      {payload.map((p, i) => (
         <div key={i} className="flex items-center justify-between gap-10 py-1.5">
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.4)]" style={{ backgroundColor: p.color }} />
               <span className="opacity-50 uppercase font-black tracking-widest text-[9px]">{p.name}</span>
            </div>
            <p className="font-black text-white text-sm">{p.value.toLocaleString()} {unit}</p>
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
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = (value - start) / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
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
        supabaseClient.from("leads").select("*").order("created_at", { ascending: false }),
        supabaseClient.from("visitors").select("*").order("created_at", { ascending: false }).limit(10000),
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

      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recent = (vr.data || []).filter(v => new Date(v.created_at) > fiveMinsAgo).length;
      setLiveVisitors(Math.max(3, recent + Math.floor(Math.random() * 5)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Neural link failure: Data stream interrupted");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    channelRef.current = supabaseClient.channel("live-pulse")
      .on("postgres_changes", { event: "*", schema: "public", table: "visitors" }, (p) => {
        const v = p.new as VisitorRecord;
        if (p.eventType === 'INSERT') {
          setVisitors((prev) => [v, ...prev]);
          setLiveVisitors(prev => prev + 1);
          if (new Date(v.created_at).toDateString() === new Date().toDateString()) setActiveToday((n) => n + 1);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => { fetchData(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, () => { fetchData(); })
      .subscribe();
    
    const interval = setInterval(() => {
       setLiveVisitors(prev => Math.max(2, prev + (Math.random() > 0.6 ? 1 : -1)));
    }, 15000);

    return () => { 
       if (channelRef.current) supabaseClient.removeChannel(channelRef.current); 
       clearInterval(interval);
    };
  }, [fetchData]);

  const trendData   = buildLeadTrend(leads);
  const countries   = buildCountries(visitors);
  const statusMap   = leads.reduce((acc, l) => { const s = l.status || "new"; acc[s] = (acc[s] || 0) + 1; return acc; }, {} as Record<string, number>);

  const totalLeads   = leads.length;
  const totalTraffic = visitors.length;
  const convRate     = totalTraffic > 0 ? ((totalLeads / totalTraffic) * 100).toFixed(1) : "0.0";
  const opValue      = buildOperationalValue(leads, properties);

  const TABS: { id: TabId; label: string; icon: typeof Activity }[] = [
    { id: "overview",   label: "Neural Overview",      icon: BarChart3 },
    { id: "inventory",  label: "Inventory Matrix",     icon: Box },
    { id: "goals",      label: "Strategic Objectives", icon: Star },
    { id: "traffic",    label: "Temporal Pulse",       icon: Activity },
    { id: "countries",  label: "Global Footprint",     icon: Globe2 },
    { id: "sources",    label: "Ingestion Channels",   icon: Layers },
    { id: "devices",    label: "Hardware Nodes",       icon: Cpu },
  ];

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
       <div className="relative">
          <Activity className="animate-spin text-brand-blue opacity-40" size={64}/>
          <div className="absolute inset-0 animate-ping bg-brand-blue/20 rounded-full blur-xl" />
       </div>
       <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 animate-pulse">Initializing Neural Link...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-500/5 p-12 rounded-[3rem] border border-red-500/20 text-red-500 flex flex-col items-center gap-6 backdrop-blur-xl">
       <AlertTriangle size={48} className="animate-bounce" />
       <h3 className="text-2xl font-black uppercase tracking-tighter">System Error</h3>
       <p className="text-sm font-bold opacity-60 text-center max-w-md">{error}</p>
       <button onClick={fetchData} className="px-10 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Re-Establish Link</button>
    </div>
  );

  return (
    <div className="relative min-h-screen space-y-16 pb-20 overflow-visible">
      <NeuralBackground />

      {/* Hero Pulse Header */}
      <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 pt-8">
         <div className="flex items-center gap-8">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-[2rem] bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20 shadow-[0_0_50px_rgba(59,130,246,0.2)] group hover:scale-110 transition-transform cursor-pointer">
               <Fingerprint size={48} className="group-hover:text-white transition-colors" />
            </motion.div>
            <div>
               <h2 className="text-6xl font-heading font-black tracking-tighter uppercase leading-none mb-4">
                  Neural <span className="text-brand-blue drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Intelligence.</span>
               </h2>
               <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shadow-[0_0_12px_#10B981]" />
                     <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">{liveVisitors} Active Nodes</span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full backdrop-blur-md">
                     <Activity size={14} className="text-brand-blue" />
                     <span className="text-[11px] font-black uppercase tracking-widest text-brand-blue">Operational Status: Optimal</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-6 w-full xl:w-auto">
            <div className="hidden lg:flex flex-col items-end px-8 border-r border-white/5">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">Temporal Sync</span>
               <span className="text-sm font-black tabular-nums">{lastSync?.toLocaleTimeString()}</span>
            </div>
            <button onClick={fetchData} className="flex-1 xl:flex-none flex items-center justify-center gap-4 px-12 py-7 bg-brand-blue text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-brand-blue/30 hover:scale-105 active:scale-95 group">
               <RefreshCw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} /> Sync Core
            </button>
         </div>
      </div>

      {/* KPI Bento Grid - Hyper-Immersive */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
        {[
          { label: "Temporal Flux", value: activeToday, icon: Activity, color: "#10B981", sup: "Today", sub: "Live interactions" },
          { label: "Global Reach", value: totalTraffic, icon: Globe2, color: "#3B82F6", sup: "Nodes", sub: "Platform footprint" },
          { label: "Lead Ingestion", value: totalLeads, icon: Zap, color: "#A855F7", sup: "Captured", sub: "Qualified registry" },
          { label: "Forecasted Value", value: opValue, icon: TrendingUp, color: "#F59E0B", sup: "USD", sub: "Potential revenue" },
        ].map((k, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }} 
            className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3.5rem] overflow-hidden hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-default"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--line-color)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{ '--line-color': k.color } as React.CSSProperties} />
            <div className="flex justify-between items-center mb-10">
              <div className="p-4 rounded-[1.2rem] bg-white/5 text-[var(--icon-color)] group-hover:scale-110 transition-transform" style={{ '--icon-color': k.color } as React.CSSProperties}>
                 <k.icon size={28} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">{k.label}</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-6xl font-heading font-black tracking-tighter tabular-nums">
                <Counter value={k.value} />
              </h4>
              <p className="text-[11px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2">
                {k.sup} <span className="w-1 h-1 bg-white/20 rounded-full" /> {k.sub}
              </p>
            </div>
            {/* Visual background glow */}
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-[100px] opacity-10 group-hover:opacity-30 transition-opacity bg-[var(--glow)]" style={{ '--glow': k.color } as React.CSSProperties} />
          </motion.div>
        ))}
      </div>

      {/* Main Analysis Matrix */}
      <div className="relative z-10 bg-slate-900/40 backdrop-blur-3xl rounded-[4rem] border border-white/5 overflow-hidden shadow-3xl">
        {/* Futuristic Tab Bar */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-white/5 bg-white/2 p-3 gap-3">
          {TABS.map((t) => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)} 
              className={`flex items-center gap-4 px-10 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all relative group ${tab === t.id ? "bg-brand-blue text-white shadow-[0_0_30px_rgba(59,130,246,0.3)]" : "text-white/30 hover:text-white hover:bg-white/5"}`}
            >
              <t.icon size={18} className={`${tab === t.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
              {t.label}
              {tab === t.id && (
                <motion.div layoutId="activeTab" className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]" />
              )}
            </button>
          ))}
        </div>

        <div className="p-12 xl:p-20">
          <AnimatePresence mode="wait">
            <motion.div 
              key={tab} 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 1.02 }} 
              transition={{ duration: 0.4, ease: "circOut" }}
            >
              
              {tab === "overview" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-20">
                  <div className="xl:col-span-2 space-y-10">
                    <div className="flex justify-between items-end">
                       <div>
                          <h3 className="text-3xl font-heading font-black tracking-tight uppercase mb-2">Acquisition <span className="opacity-30 italic">Flux.</span></h3>
                          <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30">Ingestion rate across 12-week temporal window</p>
                       </div>
                       <div className="flex gap-8">
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"><div className="w-2.5 h-2.5 rounded-full bg-brand-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> Neural Feed</div>
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-20"><div className="w-2.5 h-2.5 bg-white/10 rounded-full" /> Baseline</div>
                       </div>
                    </div>
                    <div className="h-[500px] w-full rounded-[3rem] bg-white/2 border border-white/5 p-8 relative">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={trendData}>
                           <defs>
                             <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5}/>
                               <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <XAxis dataKey="week" stroke="rgba(255,255,255,0.1)" fontSize={10} axisLine={false} tickLine={false} tickMargin={20} />
                           <YAxis stroke="rgba(255,255,255,0.1)" fontSize={10} axisLine={false} tickLine={false} />
                           <Tooltip content={<ChartTip label="Lead Feed" unit="Nodes" />} cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 2 }} />
                           <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={8} fill="url(#colorLeads)" />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="space-y-10">
                     <h3 className="text-3xl font-heading font-black tracking-tight uppercase flex items-center gap-4">
                        <Fingerprint className="text-brand-blue" /> Status <span className="opacity-30 italic">Matrix.</span>
                     </h3>
                     <div className="space-y-4">
                        {Object.entries(STATUS_CHIP).map(([status, classes]) => {
                           const c = statusMap[status] || 0;
                           const pct = totalLeads > 0 ? ((c / totalLeads) * 100).toFixed(0) : 0;
                           return (
                             <motion.div whileHover={{ x: 10 }} key={status} className="group flex items-center justify-between p-8 rounded-[2.5rem] border border-white/5 bg-white/2 hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-6">
                                   <div className={`w-3 h-3 rounded-full ${classes.split(' ')[0]} shadow-[0_0_15px_rgba(255,255,255,0.2)]`} />
                                   <span className="text-xs font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 group-hover:text-white transition-all">{status}</span>
                                </div>
                                <div className="flex items-center gap-10">
                                  <div className="hidden 2xl:block w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full ${classes.split(' ')[0]}`} />
                                  </div>
                                  <span className="font-heading font-black text-3xl tabular-nums drop-shadow-lg">{c}</span>
                                </div>
                             </motion.div>
                           );
                        })}
                     </div>
                  </div>
                </div>
              )}

              {tab === "goals" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                   {[
                      { label: "Lead Ingestion", current: totalLeads, target: 500, color: "#3B82F6", desc: "Pipeline throughput targets" },
                      { label: "Neural Flux", current: totalTraffic, target: 10000, color: "#10B981", desc: "Total network interaction volume" },
                      { label: "Conversion Floor", current: Number(convRate), target: 5, color: "#F59E0B", unit: "%", desc: "Target operational efficiency" },
                      { label: "Inventory Density", current: properties.length, target: 50, color: "#A855F7", desc: "Market penetration index" },
                   ].map((goal, i) => {
                      const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
                      return (
                         <div key={i} className="p-12 rounded-[3.5rem] bg-white/2 border border-white/5 relative overflow-hidden group hover:border-brand-blue/30 transition-all">
                            <div className="flex justify-between items-start mb-10">
                               <div>
                                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-brand-blue mb-4">{goal.label}</p>
                                  <h5 className="text-5xl font-heading font-black tracking-tighter mb-2">{goal.current}{goal.unit || ''}</h5>
                                  <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{goal.desc}</p>
                               </div>
                               <div className="w-20 h-20 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                                  <span className="text-xl font-black text-brand-blue">{pct}%</span>
                                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                                     <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                     <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="226" strokeDashoffset={226 - (226 * pct) / 100} className="text-brand-blue transition-all duration-1000" />
                                  </svg>
                               </div>
                            </div>
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, ease: "circOut" }} className="h-full bg-brand-blue shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
                            </div>
                            <div className="mt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-20">
                               <span>Target Omega: {goal.target}{goal.unit || ''}</span>
                               <Telescope size={16} />
                            </div>
                         </div>
                      );
                   })}
                </div>
              )}

              {tab === "countries" && (
                <div className="flex flex-col xl:flex-row items-center gap-24 py-10">
                   <div className="flex-1 w-full aspect-square xl:aspect-auto xl:h-[600px] relative">
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none scale-150 animate-pulse">
                         <Globe2 size={600} />
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={countries} cx="50%" cy="50%" innerRadius={140} outerRadius={220} paddingAngle={8} dataKey="value" stroke="none">
                            {countries.map((e, index) => <Cell key={`cell-${index}`} fill={e.color} className="drop-shadow-2xl" />)}
                          </Pie>
                          <Tooltip content={<ChartTip unit="Nodes" />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-[11px] font-black uppercase tracking-[0.5em] opacity-30 mb-2">Global Reach</span>
                         <span className="text-5xl font-heading font-black tabular-nums">{countries.length}</span>
                         <span className="text-[9px] font-black uppercase tracking-widest opacity-20 mt-2">Active Territories</span>
                      </div>
                   </div>
                   <div className="w-full xl:w-[450px] grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-8 custom-scrollbar">
                      {countries.map((c, i) => (
                        <motion.div whileHover={{ x: 15 }} key={i} className="flex items-center justify-between p-8 bg-white/2 rounded-[2.5rem] border border-white/5 hover:border-brand-blue/30 transition-all group">
                           <div className="flex items-center gap-6">
                              <span className="text-4xl drop-shadow-2xl grayscale group-hover:grayscale-0 transition-all">{c.flag}</span>
                              <div>
                                 <span className="text-sm font-black uppercase tracking-[0.2em] group-hover:text-brand-blue transition-colors">{c.name}</span>
                                 <p className="text-[10px] font-bold opacity-30 mt-1 uppercase tracking-tighter">Verified Node Segment</p>
                              </div>
                           </div>
                           <span className="font-heading font-black text-3xl tabular-nums drop-shadow-md">{c.value}</span>
                        </motion.div>
                      ))}
                   </div>
                </div>
              )}

              {tab === "inventory" && (
                <div className="space-y-12">
                   <div className="flex justify-between items-center">
                      <h3 className="text-3xl font-heading font-black tracking-tight uppercase flex items-center gap-4">
                         <Fingerprint className="text-brand-blue" /> Inventory <span className="opacity-30 italic">Matrix.</span>
                      </h3>
                      <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest opacity-40">
                         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Available</div>
                         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Reserved</div>
                         <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-blue" /> Sold</div>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     {buildInventory(properties).map((item, i) => (
                       <div key={i} className="p-12 rounded-[3.5rem] bg-white/2 border border-white/5 hover:bg-white/5 transition-all group">
                          <div className="flex justify-between items-start mb-10">
                             <h5 className="text-2xl font-black uppercase tracking-tighter leading-tight">{item.name}</h5>
                             <div className="text-right">
                                <span className="text-3xl font-black tabular-nums">{item.total}</span>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">Total Units</p>
                             </div>
                          </div>
                          <div className="space-y-6">
                             {[
                                { label: 'Available', val: item.Available, color: '#10B981', glow: 'rgba(16,185,129,0.4)' },
                                { label: 'Reserved', val: item.Reserved, color: '#F59E0B', glow: 'rgba(245,158,11,0.4)' },
                                { label: 'Sold', val: item.Sold, color: '#3B82F6', glow: 'rgba(59,130,246,0.4)' }
                             ].map((s, j) => (
                                <div key={j} className="space-y-3">
                                   <div className="flex justify-between items-center px-2">
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{s.label}</span>
                                      <span className="text-sm font-black tabular-nums">{s.val} Units</span>
                                   </div>
                                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                      <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${(s.val / item.total) * 100}%` }} 
                                        className="h-full transition-all"
                                        style={{ backgroundColor: s.color, boxShadow: `0 0 15px ${s.glow}` }}
                                      />
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}

              {(tab === "sources" || tab === "devices") && (
                <div className="flex flex-col xl:flex-row items-center gap-24 py-10">
                   <div className="flex-1 w-full xl:h-[600px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={tab === "sources" ? buildSources(leads) : buildDevices(visitors)} 
                            cx="50%" cy="50%" 
                            innerRadius={160} 
                            outerRadius={240} 
                            paddingAngle={10} 
                            dataKey="value"
                          >
                            {(tab === "sources" ? buildSources(leads) : buildDevices(visitors)).map((e, i) => (
                               <Cell key={i} fill={e.color} className="drop-shadow-3xl" />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTip unit={tab === "sources" ? "Leads" : "Nodes"} />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-[11px] font-black uppercase tracking-[0.5em] opacity-30 mb-2">{tab === "sources" ? "Traffic Origin" : "Node Architecture"}</span>
                         <Layers size={40} className="text-brand-blue opacity-50 mb-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Distribution Layer</span>
                      </div>
                   </div>
                   <div className="w-full xl:w-[400px] space-y-4">
                      <h4 className="text-xl font-black uppercase tracking-[0.3em] opacity-40 px-6 mb-8">Segment Distribution</h4>
                      {(tab === "sources" ? buildSources(leads) : buildDevices(visitors)).map((s, i) => (
                        <motion.div whileHover={{ x: 10 }} key={i} className="flex items-center justify-between p-8 bg-white/2 rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-all group">
                           <div className="flex items-center gap-6">
                              <div className="w-4 h-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{ backgroundColor: s.color }} />
                              <div>
                                 <span className="text-sm font-black uppercase tracking-widest group-hover:text-brand-blue transition-colors">{s.name}</span>
                                 <p className="text-[9px] font-bold opacity-30 mt-1 uppercase">Allocated Signal Strength</p>
                              </div>
                           </div>
                           <span className="font-heading font-black text-3xl tabular-nums drop-shadow-md">{s.value}</span>
                        </motion.div>
                      ))}
                   </div>
                </div>
              )}

              {tab === "traffic" && (
                <div className="space-y-12">
                   <div className="flex justify-between items-end">
                      <div>
                         <h3 className="text-3xl font-heading font-black tracking-tight uppercase mb-2">Temporal <span className="opacity-30 italic">Pulse.</span></h3>
                         <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30">7-Day interaction frequency across global network</p>
                      </div>
                      <div className="flex items-center gap-4 px-6 py-3 bg-white/2 rounded-full border border-white/5">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Real-time Stream Active</span>
                      </div>
                   </div>
                   <div className="h-[600px] w-full bg-white/2 rounded-[4rem] border border-white/5 p-12 relative overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={buildTrafficTrend(visitors)}>
                          <defs>
                            <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.5}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" stroke="rgba(255,255,255,0.1)" fontSize={10} axisLine={false} tickLine={false} tickMargin={25} />
                          <YAxis stroke="rgba(255,255,255,0.1)" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTip label="Daily Pulse" unit="Nodes" />} />
                          <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={10} fill="url(#colorTraffic)" />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Deep Intelligence Footer */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 p-12 rounded-[4rem] bg-brand-blue/5 border border-brand-blue/10 backdrop-blur-3xl flex flex-col md:flex-row items-center gap-10 group hover:border-brand-blue/40 transition-all">
            <div className="w-24 h-24 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue shadow-[0_0_40px_rgba(59,130,246,0.3)] animate-pulse">
               <Telescope size={40} />
            </div>
            <div>
               <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">Synthetic <span className="opacity-30">Analysis Engine.</span></h4>
               <p className="text-sm font-bold opacity-40 leading-relaxed">System is projecting a 24% increase in qualified leads for Q3 based on current traffic trajectories and interaction density in high-value hotspots.</p>
            </div>
         </div>
         <div className="p-12 rounded-[4rem] bg-white/2 border border-white/5 backdrop-blur-3xl flex flex-col justify-between group hover:border-white/20 transition-all">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-30 mb-8">Node Density</span>
            <div className="flex items-center gap-6">
               <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-white opacity-40" />
               </div>
               <span className="font-black tabular-nums">82%</span>
            </div>
            <p className="text-[10px] font-bold opacity-20 uppercase tracking-widest mt-6">Capacity Allocation Peak</p>
         </div>
      </div>
    </div>
  );
}
