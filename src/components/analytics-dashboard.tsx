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

// ─── Components ─────────────────────────────────────────────────────────────

function VisualBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-brand-blue/5 blur-[80px] rounded-full" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-purple-500/5 blur-[80px] rounded-full" />
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
    </div>
  );
}

const getBgClass = (color?: string) => {
  if (!color) return "bg-transparent";
  const map: Record<string, string> = {
    "#3B82F6": "bg-blue-500",
    "#10B981": "bg-emerald-500",
    "#F59E0B": "bg-amber-500",
    "#A855F7": "bg-purple-500",
    "#EC4899": "bg-pink-500",
    "#64748B": "bg-slate-500"
  };
  return map[color] || "bg-brand-blue";
};

function ChartTip({ active, payload, label, unit = "" }: { active?: boolean; payload?: Array<{ value: number; name?: string; color?: string }>; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 shadow-2xl">
      <p className="font-bold uppercase tracking-wider text-brand-blue mb-2 text-[9px]">{label || payload[0].name}</p>
      {payload.map((p, i) => (
         <div key={i} className="flex items-center justify-between gap-8 py-1">
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${getBgClass(p.color)}`} />
               <span className="opacity-50 uppercase font-bold tracking-widest text-[8px]">{p.name}</span>
            </div>
            <p className="font-bold text-white text-xs">{p.value.toLocaleString()} {unit}</p>
         </div>
      ))}
    </div>
  );
}

function Counter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 800;
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
  const [liveVisitors, setLiveVisitors] = useState(0);
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
      const todayVisitors = (vr.data || []).filter((v) => new Date(v.created_at).toDateString() === today);
      setActiveToday(todayVisitors.length);
      setLastSync(new Date());

      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      setLiveVisitors((vr.data || []).filter(v => new Date(v.created_at) > fiveMinsAgo).length);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Data connection error: Stream interrupted");
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
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => { fetchData(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, () => { fetchData(); })
      .subscribe();
    
    return () => { 
       if (channelRef.current) supabaseClient.removeChannel(channelRef.current); 
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
    { id: "overview",   label: "Overview",      icon: BarChart3 },
    { id: "inventory",  label: "Inventory",     icon: Box },
    { id: "goals",      label: "Goals",         icon: Star },
    { id: "traffic",    label: "Traffic",       icon: Activity },
    { id: "countries",  label: "Geography",     icon: Globe2 },
    { id: "sources",    label: "Sources",       icon: Layers },
    { id: "devices",    label: "Devices",       icon: Cpu },
  ];

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
       <Activity className="animate-spin text-brand-blue" size={48}/>
       <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">Loading Analytics...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-500/5 p-8 rounded-3xl border border-red-500/20 text-red-500 flex flex-col items-center gap-4">
       <AlertTriangle size={32} />
       <p className="text-sm font-bold opacity-60 text-center">{error}</p>
       <button onClick={fetchData} className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px]">Retry Connection</button>
    </div>
  );

  return (
    <div className="relative min-h-screen space-y-10 pb-10">
      <VisualBackground />

      {/* Hero Header */}
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-4">
         <div className="flex items-center gap-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
               <Fingerprint size={32} />
            </motion.div>
            <div>
               <h2 className="text-4xl font-heading font-black tracking-tight uppercase leading-none mb-2">
                  Platform <span className="text-brand-blue">Analytics.</span>
               </h2>
               <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">{liveVisitors} Live Now</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand-blue/10 border border-brand-blue/20 rounded-full">
                     <Activity size={10} className="text-brand-blue" />
                     <span className="text-[9px] font-bold uppercase tracking-wider text-brand-blue">Status: Active</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="hidden sm:flex flex-col items-end px-6 border-r border-white/5">
               <span className="text-[9px] font-bold uppercase tracking-widest opacity-30 mb-0.5">Last Sync</span>
               <span className="text-xs font-bold tabular-nums opacity-60">{lastSync?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <button onClick={fetchData} className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-brand-blue text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-blue/20">
               <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
            </button>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: "Today's Hits", value: activeToday, icon: Activity, color: "emerald", sub: "Live interactions" },
          { label: "Total Traffic", value: totalTraffic, icon: Globe2, color: "blue", sub: "Platform footprint" },
          { label: "New Leads", value: totalLeads, icon: Zap, color: "purple", sub: "Qualified registry" },
          { label: "Est. Revenue", value: opValue, icon: TrendingUp, color: "amber", sub: "Potential value", isCurrency: true },
        ].map((k, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }} 
            className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl overflow-hidden hover:bg-white/10 transition-all cursor-default"
          >
            <div className="flex justify-between items-center mb-6">
              <div className={`p-3 rounded-xl bg-white/5 text-${k.color}-500`}>
                 <k.icon size={20} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{k.label}</p>
            </div>
            <div className="space-y-0.5">
              <h4 className="text-3xl font-heading font-black tracking-tighter tabular-nums">
                {k.isCurrency && "$"}
                <Counter value={k.value} />
              </h4>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-30">{k.sub}</p>
            </div>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${k.color}-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-[60px] opacity-10 bg-${k.color}-500`} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-white/5 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-white/5 bg-white/2 p-2 gap-2">
          {TABS.map((t) => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)} 
              className={`flex items-center gap-3 px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all relative ${tab === t.id ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            >
              <t.icon size={14} />
              {t.label}
              {tab === t.id && (
                <motion.div layoutId="activeTab" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div 
              key={tab} 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              
              {tab === "overview" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                  <div className="xl:col-span-2 space-y-8">
                    <div className="flex justify-between items-end">
                       <div>
                          <h3 className="text-xl font-heading font-black tracking-tight uppercase">Leads <span className="opacity-30 italic">Growth.</span></h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">Weekly lead acquisition trends</p>
                       </div>
                       <div className="flex gap-4">
                          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-brand-blue" /> Actual</div>
                          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest opacity-20"><div className="w-2 h-2 bg-white/10 rounded-full" /> Baseline</div>
                       </div>
                    </div>
                    <div className="h-[350px] w-full rounded-2xl bg-white/2 border border-white/5 p-4">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={trendData}>
                           <defs>
                             <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <XAxis dataKey="week" stroke="rgba(255,255,255,0.1)" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                           <YAxis stroke="rgba(255,255,255,0.1)" fontSize={10} axisLine={false} tickLine={false} />
                           <Tooltip content={<ChartTip label="Lead Feed" unit="New" />} />
                           <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={4} fill="url(#colorLeads)" />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="space-y-6">
                     <h3 className="text-xl font-heading font-black tracking-tight uppercase">Lead <span className="opacity-30 italic">Status.</span></h3>
                     <div className="space-y-3">
                        {Object.entries(STATUS_CHIP).map(([status, classes]) => {
                           const c = statusMap[status] || 0;
                           const pct = totalLeads > 0 ? ((c / totalLeads) * 100).toFixed(0) : 0;
                           return (
                             <div key={status} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-4">
                                   <div className={`w-2 h-2 rounded-full ${classes.split(' ')[0]}`} />
                                   <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{status}</span>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="hidden 2xl:block w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                                     <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full ${classes.split(' ')[0]}`} />
                                  </div>
                                  <span className="font-heading font-black text-xl tabular-nums">{c}</span>
                                </div>
                             </div>
                           );
                        })}
                     </div>
                  </div>
                </div>
              )}

              {tab === "goals" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[
                      { label: "New Leads", current: totalLeads, target: 500, color: "#3B82F6", desc: "Pipeline throughput targets" },
                      { label: "Total Traffic", current: totalTraffic, target: 10000, color: "#10B981", desc: "Visitor volume goals" },
                      { label: "Conversion Rate", current: Number(convRate), target: 5, color: "#F59E0B", unit: "%", desc: "Marketing efficiency" },
                      { label: "Inventory Depth", current: properties.length, target: 20, color: "#A855F7", desc: "Listed properties count" },
                   ].map((goal, i) => {
                      const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
                      return (
                         <div key={i} className="p-8 rounded-3xl bg-white/2 border border-white/5 group hover:border-brand-blue/30 transition-all">
                            <div className="flex justify-between items-start mb-8">
                               <div>
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-brand-blue mb-2">{goal.label}</p>
                                  <h5 className="text-3xl font-heading font-black tracking-tighter">{goal.current}{goal.unit || ''}</h5>
                                  <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest">{goal.desc}</p>
                               </div>
                               <div className="w-16 h-16 rounded-full border-2 border-white/5 flex items-center justify-center relative">
                                  <span className="text-sm font-black text-brand-blue">{pct}%</span>
                                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                                     <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                                     <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="176" strokeDashoffset={176 - (176 * pct) / 100} className="text-brand-blue transition-all duration-1000" />
                                  </svg>
                               </div>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-brand-blue shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                            </div>
                         </div>
                      );
                   })}
                </div>
              )}

              {tab === "countries" && (
                <div className="flex flex-col lg:flex-row items-center gap-12 py-4">
                   <div className="flex-1 w-full aspect-square lg:h-[400px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={countries} cx="50%" cy="50%" innerRadius={100} outerRadius={160} paddingAngle={5} dataKey="value" stroke="none">
                            {countries.map((e, index) => <Cell key={`cell-${index}`} fill={e.color} />)}
                          </Pie>
                          <Tooltip content={<ChartTip unit="Visitors" />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-[9px] font-bold uppercase tracking-widest opacity-30 mb-1">Total Geo</span>
                         <span className="text-4xl font-heading font-black">{countries.length}</span>
                      </div>
                   </div>
                   <div className="w-full lg:w-[350px] grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                      {countries.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5 hover:border-brand-blue/30 transition-all">
                           <div className="flex items-center gap-4">
                              <span className="text-2xl">{c.flag}</span>
                              <div>
                                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{c.name}</span>
                              </div>
                           </div>
                           <span className="font-heading font-black text-xl tabular-nums">{c.value}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {tab === "inventory" && (
                <div className="space-y-8">
                   <h3 className="text-xl font-heading font-black tracking-tight uppercase">Property <span className="opacity-30 italic">Inventory.</span></h3>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {buildInventory(properties).map((item, i) => (
                       <div key={i} className="p-8 rounded-3xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all">
                          <div className="flex justify-between items-start mb-6">
                             <h5 className="text-lg font-bold uppercase tracking-tight">{item.name}</h5>
                             <div className="text-right">
                                <span className="text-2xl font-black tabular-nums">{item.total}</span>
                                <p className="text-[8px] font-bold uppercase tracking-widest opacity-30">Units</p>
                             </div>
                          </div>
                          <div className="space-y-4">
                             {[
                                { label: 'Available', val: item.Available, color: '#10B981' },
                                { label: 'Reserved', val: item.Reserved, color: '#F59E0B' },
                                { label: 'Sold', val: item.Sold, color: '#3B82F6' }
                             ].map((s, j) => (
                                <div key={j} className="space-y-1.5">
                                   <div className="flex justify-between items-center px-1">
                                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{s.label}</span>
                                      <span className="text-[10px] font-bold tabular-nums">{s.val}</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${(s.val / item.total) * 100}%` }} 
                                        className={`h-full ${getBgClass(s.color)}`} 
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

              {tab === "traffic" && (
                <div className="space-y-8">
                   <div className="flex justify-between items-end">
                      <div>
                         <h3 className="text-xl font-heading font-black tracking-tight uppercase">Daily <span className="opacity-30 italic">Traffic.</span></h3>
                         <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">Weekly visitor pulse</p>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[9px] font-bold uppercase tracking-widest">Live Sync Active</span>
                      </div>
                   </div>
                   <div className="h-[350px] w-full bg-white/2 rounded-2xl border border-white/5 p-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={buildTrafficTrend(visitors)}>
                          <defs>
                            <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" stroke="rgba(255,255,255,0.1)" fontSize={10} axisLine={false} tickLine={false} tickMargin={15} />
                          <YAxis stroke="rgba(255,255,255,0.1)" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTip label="Daily Visitors" unit="Total" />} />
                          <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={4} fill="url(#colorTraffic)" />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              )}

              {(tab === "sources" || tab === "devices") && (
                <div className="flex flex-col lg:flex-row items-center gap-12 py-4">
                   <div className="flex-1 w-full lg:h-[400px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={tab === "sources" ? buildSources(leads) : buildDevices(visitors)} 
                            cx="50%" cy="50%" innerRadius={100} outerRadius={160} paddingAngle={5} dataKey="value"
                          >
                            {(tab === "sources" ? buildSources(leads) : buildDevices(visitors)).map((e, i) => (
                               <Cell key={i} fill={e.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTip unit={tab === "sources" ? "Leads" : "Visitors"} />} />
                        </PieChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="w-full lg:w-[350px] space-y-3">
                      {(tab === "sources" ? buildSources(leads) : buildDevices(visitors)).map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                           <div className="flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full ${getBgClass(s.color)}`} />
                              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{s.name}</span>
                           </div>
                           <span className="font-heading font-black text-xl tabular-nums">{s.value}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Insights */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 p-8 rounded-3xl bg-brand-blue/5 border border-brand-blue/10 backdrop-blur-xl flex items-center gap-8">
            <div className="w-16 h-16 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue">
               <Telescope size={32} />
            </div>
            <div>
               <h4 className="text-xl font-bold uppercase tracking-tight mb-1">Smart <span className="opacity-30">Insights.</span></h4>
               <p className="text-xs font-medium opacity-40 leading-relaxed">
                  Based on current trends, lead conversion is up {convRate}% compared to last period. Most traction is coming from {countries[0]?.name || 'global nodes'}.
               </p>
            </div>
         </div>
         <div className="p-8 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-xl flex flex-col justify-center">
            <div className="flex justify-between items-center mb-4">
               <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Visitor Load</span>
               <span className="font-black text-xl tabular-nums">{Math.min(100, Math.round((liveVisitors / 50) * 100))}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (liveVisitors / 50) * 100)}%` }} className="h-full bg-white opacity-20" />
            </div>
            <p className="text-[8px] font-bold opacity-20 uppercase tracking-widest mt-4 text-center">Active Platform Utilization</p>
         </div>
      </div>
    </div>
  );
}
