import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabaseClient } from "@/lib/supabase";
import { Activity, Users, Globe2, Target } from "lucide-react";

interface LeadRecord {
  id: string;
  source?: string;
  interest?: string;
  created_at: string;
}

export function VisitorAnalytics() {
  const [data, setData] = useState<{date: string, leads: number}[]>([]);
  const [sources, setSources] = useState<{name: string, value: number}[]>([]);
  const [regions, setRegions] = useState<{name: string, value: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const { data: leads } = await supabaseClient.from('leads').select('*').order('created_at', { ascending: true });
        
        if (leads && leads.length > 0) {
          // Process timeline
          const timelineMap = leads.reduce((acc: Record<string, number>, lead: LeadRecord) => {
            const date = new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});

          setData(Object.entries(timelineMap).map(([date, count]) => ({ date, leads: count as number })));

          // Process sources
          const sourceMap = leads.reduce((acc: Record<string, number>, lead: LeadRecord) => {
            const src = lead.source || 'Organic';
            acc[src] = (acc[src] || 0) + 1;
            return acc;
          }, {});
          setSources(Object.entries(sourceMap).map(([name, value]) => ({ name, value: value as number })));

          // Process regions (interests proxy for geography if actual regions missing)
          const regionMap = leads.reduce((acc: Record<string, number>, lead: LeadRecord) => {
            const reg = lead.interest || 'Unknown';
            acc[reg] = (acc[reg] || 0) + 1;
            return acc;
          }, {});
          setRegions(Object.entries(regionMap).map(([name, value]) => ({ name, value: value as number })).slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInsights();
  }, []);

  if (loading) {
    return <div className="w-full h-[400px] bg-slate-500/5 animate-pulse rounded-3xl" />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 cursor-default">
      {/* Main Trajectory */}
      <div className="lg:col-span-2 bg-[var(--card)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-xl">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl"><Activity size={24} /></div>
           <div>
             <h3 className="text-xl font-black heading tracking-tight">Acquisition Velocity</h3>
             <p className="text-sm opacity-50 font-medium">Daily lead ingestion rate over time</p>
           </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="leads" stroke="#0066FF" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Source Distribution */}
        <div className="flex-1 bg-[var(--card)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-xl flex flex-col justify-between">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Target size={20} /></div>
             <h3 className="font-black heading tracking-tight">Channel Source</h3>
           </div>
           <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sources} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#111', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* Region Distribution */}
        <div className="flex-1 bg-[var(--card)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-xl flex flex-col justify-between">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><Globe2 size={20} /></div>
             <h3 className="font-black heading tracking-tight">Active Markets</h3>
           </div>
           <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regions} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#111', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="value" fill="#A855F7" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
