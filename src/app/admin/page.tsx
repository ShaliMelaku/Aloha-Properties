"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { 
  Upload, Mail, Users, FileSpreadsheet, Send, Activity, 
  LogOut, Download, TrendingUp, 
  History, Lock, Key, PieChart, ShieldCheck, Zap, Moon, Sun, CheckCircle2, UserPlus,
  Home, Plus, Trash2, Edit3, MoreVertical, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStatus } from "@/context/status-context";
import { useTheme } from "next-themes";
import { VisitorGlobe } from "@/components/visitor-globe";
import { supabaseClient } from "@/lib/supabase";
import Image from "next/image";

interface Lead {
  id?: string;
  name: string;
  email: string;
  interest?: string;
  created_at?: string;
  status?: string;
  notes?: string;
  phone?: string;
}

interface Campaign {
  id: string;
  created_at: string;
  subject: string;
  audience_size: number;
}

interface PropertyProgress {
  id: string;
  property_id: string;
  percent: number;
  status: 'planning' | 'under-construction' | 'topping-out' | 'finishing' | 'delivered';
  status_text: string;
  created_at: string;
}

interface Property {
  id: string;
  name: string;
  location: string;
  developer: string;
  description?: string;
  lat?: number;
  lng?: number;
  amenities: string[];
  units?: Unit[];
  progress?: PropertyProgress[];
}

export interface Unit {
  id: string;
  type: string;
  beds: number;
  baths: number;
  sqm: number;
  price: number;
}



export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  created_at: string;
  cover_image: string;
  video_url: string;
  source_label: string;
  source_url: string;
  type: 'article' | 'report' | 'guide';
  file_url: string;
}

export default function AdminDashboard() {
  const { notify } = useStatus();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [dbLeads, setDbLeads] = useState<Lead[]>([]);
  const [campaignHistory, setCampaignHistory] = useState<Campaign[]>([]);
  const [broadcastLeads, setBroadcastLeads] = useState<Lead[]>([]);
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [manualEmails, setManualEmails] = useState("");
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newProp, setNewProp] = useState({ name: '', location: '', developer: '', lat: 9.0, lng: 38.7, amenities: [] as string[] });
  
  // Selection logic for CSV leads
  const [selectedLeadsIndices, setSelectedLeadsIndices] = useState<Set<number>>(new Set());

  // Solo Outreach State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [soloSubject, setSoloSubject] = useState("");
  const [soloBody, setSoloBody] = useState("");
  const [soloSending, setSoloSending] = useState(false);

  // CRM State
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  // Property Selection & Unit Management
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [newUnit, setNewUnit] = useState({ type: '', beds: 1, baths: 1, sqm: 50, price: 2000000 });

  // Security State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [emailAuth, setEmailAuth] = useState("");
  const [passwordAuth, setPasswordAuth] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);

  // Blog State
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newPost, setNewPost] = useState({ title: '', slug: '', excerpt: '', content: '', cover_image: '', video_url: '', source_label: '', source_url: '', type: 'article', file_url: '' });

  // Global Delete Confirmation State
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'property' | 'post', id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync Logic
  const [syncing, setSyncing] = useState(false);

  // Dynamic Analysis State
  const [stats, setStats] = useState({ 
    totalLeads: 0, 
    activeProperties: 0, 
    campaignReach: 0,
    growth: '0%'
  });

  const toggleLeadSelection = (idx: number) => {
    const newSet = new Set(selectedLeadsIndices);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setSelectedLeadsIndices(newSet);
  };

  const syncIntelligence = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success) {
        notify('success', `Intelligence Synchronized: ${data.posted} new articles integrated.`);
        fetchPosts();
      } else {
        notify('error', 'Sync failed: ' + (data.error || 'Unknown error'));
      }
    } catch {
      notify('error', 'Sync operational failure.');
    } finally {
      setSyncing(false);
    }
  };



  const fetchHistory = async () => {
    const { data } = await supabaseClient.from('campaigns').select('*').order('created_at', { ascending: false });
    setCampaignHistory(data || []);
    if (data) {
      const totalReach = data.reduce((acc, curr) => acc + curr.audience_size, 0);
      setStats(prev => ({ ...prev, campaignReach: totalReach }));
    }
  };

  const fetchProperties = async () => {
    const { data } = await supabaseClient.from('properties').select('*, units:property_units(*), progress:property_progress(*)').order('created_at', { ascending: false });
    setProperties(data || []);
    setStats(prev => ({ ...prev, activeProperties: data?.length || 0 }));
  };

  const fetchLeads = async () => {
    const { data } = await supabaseClient.from('leads').select('*').order('created_at', { ascending: false });
    if (data) {
      setDbLeads(data);
      
      // Calculate real-time growth (Last 7 days vs Previous 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

      const recentLeads = data.filter(l => new Date(l.created_at || '').getTime() > sevenDaysAgo.getTime()).length;
      const archiveLeads = data.filter(l => {
        const d = new Date(l.created_at || '').getTime();
        return d > fourteenDaysAgo.getTime() && d <= sevenDaysAgo.getTime();
      }).length;

      let growthStr = '0%';
      if (archiveLeads > 0) {
        const growth = ((recentLeads - archiveLeads) / archiveLeads) * 100;
        growthStr = (growth >= 0 ? '+' : '') + growth.toFixed(1) + '%';
      } else if (recentLeads > 0) {
        growthStr = '+100%';
      }

      setStats(prev => ({ ...prev, totalLeads: data.length, growth: growthStr }));
    }
  };

  const fetchPosts = async () => {
    const { data } = await supabaseClient.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
  };


  useEffect(() => {
    setMounted(true);

    const checkSession = async () => {
      setIsVerifying(true);
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        setIsAuthorized(true);
        fetchLeads();
        fetchProperties();
        fetchHistory();
        fetchPosts();
      }
      setIsVerifying(false);
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        setIsAuthorized(true);
        fetchLeads();
        fetchProperties();
        fetchHistory();
        fetchPosts();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthorized(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setIsVerifying(true);
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: emailAuth,
      password: passwordAuth,
    });
    if (error) {
      notify('error', error.message);
    } else {
      notify('success', "Administrative access granted.");
    }
    setIsVerifying(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (!bstr) return;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as Record<string, string>[];
      
      const parsedLeads = data.map((row: Record<string, string>) => ({
        name: row.name || row.Name || row.NAME || 'Unknown',
        email: row.email || row.Email || row.EMAIL || null,
      })).filter((l): l is { name: string; email: string } => !!l.email);

      setBroadcastLeads(parsedLeads);
      // Automatically select all initially
      setSelectedLeadsIndices(new Set(parsedLeads.map((_, i) => i)));
      notify('success', `Manifest loaded: ${parsedLeads.length} prospects identified.`);
    };
    reader.readAsBinaryString(file);
  };

  const handleBroadcast = async () => {
    let targets: Lead[] = [];

    if (broadcastLeads.length > 0) {
      targets = broadcastLeads.filter((_, i) => selectedLeadsIndices.has(i));
    } else if (manualEmails.trim()) {
      targets = manualEmails.split(/[,|\s]+/).filter(e => e.includes('@')).map(e => ({
        name: e.split('@')[0],
        email: e.trim()
      }));
    }

    if (targets.length === 0) return notify('info', "Sequence aborted: No selected leads or manual recipients.");
    if (!subject || !htmlBody) return notify('info', "Sequence aborted: Missing payload metadata.");

    setSending(true);
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ leads: targets, subject, htmlBody })
      });
      if (res.ok) {
        notify('success', "Global broadcast sequence initiated successfully.");
        setBroadcastLeads([]);
        setManualEmails('');
        setSubject('');
        setHtmlBody('');
        fetchHistory();
      } else {
        const data = await res.json();
        notify('error', `Broadcast failed: ${data.error}`);
      }
      } catch {
       notify('error', "Critical failure during broadcast transmission.");
      } finally {
      setSending(false);
    }
  };

  const handleSoloSend = async () => {
    if (!selectedLead || !soloSubject || !soloBody) return;
    setSoloSending(true);
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ leads: [selectedLead], subject: soloSubject, htmlBody: soloBody })
      });
      if (res.ok) {
        notify('success', `Outreach sent to ${selectedLead.name}`);
        setSelectedLead(null);
        setSoloSubject("");
        setSoloBody("");
        fetchHistory();
      } else {
        notify('error', "Outreach failed to launch.");
      }
      } catch {
      notify('error', "Communication fault.");
    } finally {
      setSoloSending(false);
    }
  };

  const exportLeads = () => {
    const ws = XLSX.utils.json_to_sheet(dbLeads);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "Aloha_Leads_Export.xlsx");
    notify('success', "Leads manifest exported to XLSX.");
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    notify('info', "Administrative session terminated.");
  };



  const handleCreateProperty = async () => {
    if (!newProp.name || !newProp.location) return notify('info', "Missing property details.");
    try {
      const { data: propData, error: propError } = await supabaseClient
        .from('properties')
        .insert(newProp)
        .select()
        .single();
      
      if (propError) throw propError;

      const { error: progError } = await supabaseClient.from('property_progress').insert({
        property_id: propData.id, percent: 0, status: 'under-construction', status_text: 'Planning'
      });
      
      if (progError) throw progError;
      
      notify('success', "Property registered successfully.");
      setIsAddingProperty(false);
      setNewProp({ name: '', location: '', developer: '', lat: 9.0, lng: 38.7, amenities: [] });
      fetchProperties();
    } catch {
      notify('error', "Registration fault.");
    }
  };

  if (!mounted) return null;

  if (!isAuthorized && !isVerifying) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 noise-bg">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-full max-w-md glass-card p-12 rounded-[3rem] text-center border-white/5 shadow-2xl"
         >
            <div className="w-20 h-20 bg-brand-blue rounded-3xl mx-auto flex items-center justify-center text-white mb-8 shadow-2xl shadow-brand-blue/30">
               <Lock size={32} />
            </div>
            <h1 className="font-heading text-3xl font-black tracking-tight mb-2 uppercase text-[var(--foreground)]">Command Access</h1>
            <p className="text-sm opacity-40 font-medium mb-8 text-[var(--foreground)]">Verification required for internal Aloha systems.</p>
            
            <div className="space-y-4 mb-6">
               <div className="relative">
                   <Mail className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20 text-[var(--foreground)]" size={20} />
                   <input 
                     type="email" 
                     placeholder="Admin Email" 
                     value={emailAuth}
                     onChange={(e) => setEmailAuth(e.target.value)}
                     className="w-full pl-14 pr-6 py-4 bg-slate-500/5 border border-transparent focus:border-brand-blue rounded-2xl outline-none font-bold placeholder:opacity-20 transition-all text-[var(--foreground)]"
                   />
               </div>
               <div className="relative">
                   <Key className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20 text-[var(--foreground)]" size={20} />
                   <input 
                     type="password" 
                     placeholder="Password" 
                     value={passwordAuth}
                     onChange={(e) => setPasswordAuth(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                     className="w-full pl-14 pr-6 py-4 bg-slate-500/5 border border-transparent focus:border-brand-blue rounded-2xl outline-none font-bold placeholder:opacity-20 transition-all text-[var(--foreground)]"
                   />
               </div>
            </div>
            
            <button 
               onClick={handleLogin}
               className="btn-premium-primary w-full py-5 text-xs tracking-[0.2em] font-black uppercase"
            >
               Authenticate
            </button>
         </motion.div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6 noise-bg">
         <Activity size={48} className="text-brand-blue animate-spin" />
         <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-[var(--foreground)]">Decrypting Command Suite...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden transition-colors duration-500">
      {/* Premium Sidebar */}
      <aside className="w-72 bg-luxury-charcoal dark:bg-black border-r border-white/5 flex flex-col hidden lg:flex relative z-20 transition-colors">
        <div className="p-8 pb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
              <Image 
                src="/images/brand/aloha-logo.png" 
                alt="Aloha Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <span className="font-heading font-black text-xl text-white tracking-tighter">ALOHA<span className="text-brand-blue">.</span></span>
          </div>
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: "overview", icon: PieChart, label: "Analytics" },
            { id: "broadcast", icon: Mail, label: "Marketing" },
            { id: "portfolio", icon: Home, label: "Portfolio" },
            { id: "leads", icon: Users, label: "Leads" },
            { id: "blog", icon: Edit3, label: "Market Trends" },
            { id: "history", icon: History, label: "History" }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
           <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 text-red-400 hover:bg-red-400/10 rounded-2xl font-bold transition-all"
           >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Command Center */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12 relative bg-slate-500/5 noise-bg transition-colors">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="flex justify-between items-end">
             <div>
                <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="flex items-center gap-2 mb-4"
                >
                  <div className="w-8 h-px bg-brand-blue" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue">
                    {activeTab === "overview" && "Command Overview"}
                    {activeTab === "broadcast" && "Marketing Suite"}
                    {activeTab === "portfolio" && "Inventory Management"}
                    {activeTab === "leads" && "Customer Insights"}
                    {activeTab === "blog" && "Content Management"}
                    {activeTab === "history" && "Operational Log"}
                  </span>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase text-[var(--foreground)]">
                  {activeTab === "overview" && <>Marketing <span className="opacity-30 italic">Hub.</span></>}
                  {activeTab === "broadcast" && <>Mass <span className="opacity-30 italic">Broadcast.</span></>}
                  {activeTab === "portfolio" && <>Portfolio <span className="opacity-30 italic">Manager.</span></>}
                  {activeTab === "leads" && <>Leads <span className="opacity-30 italic">Repository.</span></>}
                  {activeTab === "blog" && <>Editorial <span className="opacity-30 italic">Studio.</span></>}
                  {activeTab === "history" && <>Campaign <span className="opacity-30 italic">History.</span></>}
                </h1>
             </div>
             
             <div className="hidden md:flex gap-4">
                {activeTab === "leads" && (
                   <button 
                     onClick={exportLeads}
                     className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all text-xs"
                   >
                     <Download size={16} /> Export CSV
                   </button>
                )}
                <div className="flex items-center gap-2 bg-[var(--card)] px-4 py-2 rounded-xl border border-[var(--border)] shadow-sm">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-[var(--foreground)]">System Ready</span>
                </div>
             </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[var(--card)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                       <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-6">
                         <TrendingUp size={24} />
                       </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2">Lead Momentum</p>
                        <h3 className="text-4xl font-heading font-black tracking-tight text-[var(--foreground)]">{stats.totalLeads}</h3>
                        <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
                          <ShieldCheck size={14} /> Total Capture Records
                        </p>
                    </div>

                    <div className="bg-[var(--card)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-xl relative overflow-hidden group">
                       <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-6">
                         <Zap size={24} />
                       </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2">Campaign Reach</p>
                        <h3 className="text-4xl font-heading font-black tracking-tight text-[var(--foreground)]">{stats.campaignReach.toLocaleString()}</h3>
                        <p className="text-xs font-bold text-brand-blue mt-2 flex items-center gap-1">
                          <Mail size={14} /> Global Audiences
                        </p>
                    </div>

                    <div className="bg-brand-blue p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group font-black text-white">
                        <div className="flex flex-col justify-between h-full">
                           <div>
                             <p className="text-[10px] uppercase tracking-widest opacity-60 mb-2">Portfolio Density</p>
                             <h3 className="text-4xl font-heading tracking-tight italic">{stats.activeProperties} Units</h3>
                           </div>
                           <p className="text-sm opacity-60 mt-4">Active Managed Listings</p>
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center bg-[var(--card)] rounded-[3rem] border border-[var(--border)] overflow-hidden p-8 md:p-12 shadow-2xl relative">
                    <div className="space-y-10">
                       <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-px bg-brand-blue" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue">Market Reach Analysis</span>
                          </div>
                          <h2 className="text-4xl font-heading font-black tracking-tighter uppercase text-[var(--foreground)] leading-none">Global <br/>Reach <span className="text-brand-blue italic">Pulse.</span></h2>
                          <p className="text-[var(--foreground)]/60 font-medium leading-relaxed max-w-sm mt-6">
                            Live visualization of regional investor density across the Aloha registry.
                          </p>
                       </div>
                       <div className="space-y-6">
                          {dbLeads.length > 0 ? (
                            // DYNAMIC REACH: Aggregated from real leads
                            Object.entries(dbLeads.reduce<Record<string, number>>((acc, curr) => {
                              const loc = curr.interest || 'General';
                              acc[loc] = (acc[loc] || 0) + 1;
                              return acc;
                            }, {})).slice(0, 3).map(([hub, count]) => {
                              const share = Math.round(((count as number) / dbLeads.length) * 100);
                              return (
                                <div key={hub} className="space-y-2">
                                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">
                                      <span>{hub} Hub</span><span>{share}%</span>
                                   </div>
                                   <div className="h-2 w-full bg-slate-500/10 rounded-full overflow-hidden">
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${share}%` }} className="h-full bg-brand-blue rounded-full shadow-[0_0_10px_#3b82f6]" />
                                   </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">Awaiting primary signals...</p>
                          )}
                       </div>
                    </div>
                     <VisitorGlobe />
                 </div>
              </motion.div>
            )}

            {activeTab === "broadcast" && (
              <motion.div 
                key="broadcast"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-8"
              >
                <div className="space-y-6">
                  <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-sm">
                    <h2 className="font-heading text-xl font-black tracking-tight mb-6 flex items-center gap-3 text-[var(--foreground)]">
                      <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center"><FileSpreadsheet size={16} /></div>
                      01. Reach Choice
                    </h2>
                    
                    {broadcastLeads.length === 0 ? (
                      <div className="relative group">
                        <div className="border-2 border-dashed border-[var(--border)] rounded-3xl p-10 text-center flex flex-col items-center justify-center bg-slate-500/5 hover:bg-brand-blue/5 hover:border-brand-blue/40 transition-all cursor-pointer">
                          <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleFileUpload} 
                            title="Upload Campaign CSV"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                          />
                          <div className="w-16 h-16 rounded-2xl bg-[var(--background)] shadow-xl flex items-center justify-center mb-4"><Upload size={24} className="text-brand-blue" /></div>
                          <p className="font-bold text-sm mb-1 uppercase tracking-wider text-[var(--foreground)]">CSV Manifest Upload</p>
                          <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">Multi-Person Individual Outreach</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                           <p className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Select Individual Recipients</p>
                           <button onClick={() => setBroadcastLeads([])} className="text-[10px] font-black text-red-400 uppercase tracking-widest">Clear List</button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                           {broadcastLeads.map((lead, idx) => (
                             <button 
                               key={idx} 
                               onClick={() => toggleLeadSelection(idx)}
                               className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedLeadsIndices.has(idx) ? "bg-brand-blue/10 border-brand-blue" : "bg-slate-500/5 border-transparent opacity-60"}`}
                             >
                                <div className="text-left">
                                   <p className="font-bold text-xs text-[var(--foreground)]">{lead.name}</p>
                                   <p className="text-[10px] opacity-40 text-[var(--foreground)]">{lead.email}</p>
                                </div>
                                {selectedLeadsIndices.has(idx) ? <CheckCircle2 size={16} className="text-brand-blue" /> : <UserPlus size={16} className="text-[var(--foreground)]/20" />}
                             </button>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-sm">
                    <h2 className="font-heading text-xl font-black tracking-tight mb-6 flex items-center gap-3 text-[var(--foreground)]">
                      <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center"><Mail size={16} /></div>
                      02. Campaign Editor
                    </h2>
                    <div className="space-y-6">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 text-[var(--foreground)]">To</label>
                         {broadcastLeads.length > 0 ? (
                           <div className="w-full px-6 py-4 rounded-2xl bg-slate-500/5 border border-brand-blue/30 font-bold text-sm text-brand-blue flex justify-between items-center group">
                             <span>{selectedLeadsIndices.size} Selected Recipients</span>
                             <button onClick={() => setBroadcastLeads([])} className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-red-400">Clear List</button>
                           </div>
                         ) : (
                           <input 
                             type="text" 
                             value={manualEmails} 
                             onChange={e => setManualEmails(e.target.value)} 
                             placeholder="Enter emails (comma separated)" 
                             className="w-full px-6 py-4 rounded-2xl bg-slate-500/5 border border-transparent focus:border-brand-blue outline-none transition-all font-bold text-sm text-[var(--foreground)]" 
                           />
                         )}
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 text-[var(--foreground)]">Subject</label>
                         <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Marketing Subject Line" className="w-full px-6 py-4 rounded-2xl bg-slate-500/5 border border-transparent focus:border-brand-blue outline-none transition-all font-bold text-sm text-[var(--foreground)]" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 text-[var(--foreground)]">Message Body</label>
                         <textarea rows={10} value={htmlBody} onChange={e => setHtmlBody(e.target.value)} placeholder="Type your message here... Use {{name}} for personalization." className="w-full px-6 py-4 rounded-2xl bg-slate-500/5 border border-transparent focus:border-brand-blue outline-none transition-all font-medium text-sm resize-none text-[var(--foreground)]" />
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleBroadcast} 
                    disabled={sending || (broadcastLeads.length === 0 && !manualEmails.trim()) || (broadcastLeads.length > 0 && selectedLeadsIndices.size === 0)} 
                    className="btn-premium-primary w-full py-5 flex items-center justify-center gap-3 text-xs tracking-widest"
                  >
                    {sending ? <Activity size={20} className="animate-spin" /> : <>Launch Sequence <Send size={18} /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "leads" && (
              <motion.div key="leads" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-[var(--border)] flex justify-between items-center text-[var(--foreground)]">
                    <h2 className="font-heading text-xl font-black tracking-tight flex items-center gap-3"><Users size={20} className="text-brand-blue" />Captured Inquiries</h2>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{dbLeads.length} Total Records</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-500/5 text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">
                          <th className="px-8 py-4">Status</th><th className="px-8 py-4">Prospect</th><th className="px-8 py-4">Interest</th><th className="px-8 py-4">Inquiry Date</th><th className="px-8 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
                        {loading ? (
                           <tr><td colSpan={5} className="px-8 py-12 text-center opacity-40 italic">Decrypting Database...</td></tr>
                        ) : dbLeads.map((lead) => (
                           <tr key={lead.id} className="hover:bg-brand-blue/5 transition-colors group">
                            <td className="px-8 py-5">
                               <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${lead.status === 'qualified' ? 'bg-emerald-500/10 text-emerald-500' : lead.status === 'contacted' ? 'bg-amber-500/10 text-amber-500' : lead.status === 'closed' ? 'bg-brand-blue/10 text-brand-blue' : lead.status === 'lost' ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-[var(--foreground)]/60'}`}>
                                 {lead.status || 'new'}
                               </span>
                            </td>
                            <td className="px-8 py-5"><div className="flex flex-col"><span className="font-bold text-sm tracking-tight">{lead.name}</span><span className="text-xs opacity-40">{lead.email}</span></div></td>
                            <td className="px-8 py-5"><span className="text-[10px] font-black uppercase tracking-widest bg-brand-blue/10 text-brand-blue px-2 py-1 rounded-md">{lead.interest || "General"}</span></td>
                            <td className="px-8 py-5 text-xs font-medium opacity-60">{new Date(lead.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td className="px-8 py-5 text-right">
                               <div className="flex justify-end gap-2">
                                  <button 
                                   onClick={() => setViewingLead(lead)} 
                                   title="View CRM Details"
                                   className="text-[var(--foreground)] hover:scale-110 transition-transform bg-slate-500/10 p-2 rounded-lg"
                                  >
                                   <Edit3 size={16} />
                                  </button>
                                  <button 
                                   onClick={() => {setSelectedLead(lead); setSoloSubject(`Re: ${lead.interest || 'Inquiry'}`); setSoloBody(`Hello ${lead.name},\n\n`);}} 
                                   title="Individual Outreach"
                                   className="text-brand-blue hover:scale-110 transition-transform bg-brand-blue/10 p-2 rounded-lg"
                                  >
                                   <Mail size={16} />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "portfolio" && (
              <motion.div key="portfolio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                 <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm p-8">
                     <div className="flex justify-between items-center mb-8">
                        <h2 className="font-heading text-xl font-black tracking-tight flex items-center gap-3"><Home size={20} className="text-brand-blue" />Property Management</h2>
                        <button onClick={() => setIsAddingProperty(!isAddingProperty)} className="bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-blue/20 transition-all flex items-center gap-2">
                           <Plus size={16} /> {isAddingProperty ? 'Cancel' : 'New Property'}
                        </button>
                     </div>
                     
                     <AnimatePresence>
                       {isAddingProperty && (
                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
                            <div className="bg-slate-500/5 rounded-3xl p-6 border border-brand-blue/30 space-y-4">
                               <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)] opacity-60">Register New Listing</h3>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input type="text" placeholder="Property Name" value={newProp.name} onChange={e => setNewProp({...newProp, name: e.target.value})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                  <input type="text" placeholder="Location" value={newProp.location} onChange={e => setNewProp({...newProp, location: e.target.value})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                  <input type="text" placeholder="Developer" value={newProp.developer} onChange={e => setNewProp({...newProp, developer: e.target.value})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                  <input type="text" placeholder="Amenities (comma separated)" onChange={e => setNewProp({...newProp, amenities: e.target.value.split(',').map(s => s.trim())})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                               </div>
                               <button onClick={handleCreateProperty} className="w-full bg-brand-blue text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg mt-4 hover:shadow-brand-blue/20 transition-all">
                                  Publish Listing
                               </button>
                            </div>
                         </motion.div>
                       )}
                     </AnimatePresence>

                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                           <div className="col-span-full py-12 text-center opacity-40 italic">Decrypting Registry...</div>
                        ) : properties.map((prop) => (
                           <div key={prop.id} className="bg-slate-500/5 border border-white/5 rounded-3xl overflow-hidden hover:border-brand-blue/30 transition-all group flex flex-col shadow-lg">
                              <div className="p-6 flex-1 relative">
                                 <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-heading font-black text-lg text-[var(--foreground)] pr-8">{prop.name}</h3>
                                    <button onClick={() => setConfirmDelete({ type: 'property', id: prop.id, name: prop.name })} title="Delete Property" className="absolute top-6 right-6 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-red-400/10 p-2 rounded-lg"><Trash2 size={16}/></button>
                                 </div>
                                 <p className="text-xs font-bold opacity-60 text-[var(--foreground)] mb-1">{prop.location}</p>
                                 <p className="text-[10px] uppercase tracking-widest font-black text-brand-blue">{prop.developer}</p>
                                 
                                 <div className="mt-6 flex flex-wrap gap-2">
                                     {prop.amenities && prop.amenities.slice(0,3).map((am: string, i: number) => (
                                         <span key={i} className="px-2 py-1 bg-[var(--background)] text-[10px] font-bold rounded-md uppercase text-[var(--foreground)]/60">{am}</span>
                                     ))}
                                     {prop.amenities && prop.amenities.length > 3 && <span className="px-2 py-1 bg-[var(--background)] text-[10px] font-bold rounded-md uppercase text-[var(--foreground)]/60">+{prop.amenities.length - 3}</span>}
                                 </div>
                              </div>
                              <div className="bg-[var(--background)]/50 p-4 border-t border-[var(--border)] flex justify-between items-center">
                                 <span className="text-xs font-bold text-[var(--foreground)]/40">{prop.units?.length || 0} Units Registered</span>
                                 <button onClick={() => setSelectedPropertyId(prop.id)} className="text-brand-blue text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">Manage Units <MoreVertical size={14}/></button>
                              </div>
                           </div>
                        ))}
                     </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "blog" && (
              <motion.div key="blog" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                 <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-[var(--border)] flex justify-between items-center text-[var(--foreground)]">
                       <h2 className="font-heading text-xl font-black tracking-tight flex items-center gap-3"><Edit3 size={20} className="text-brand-blue" />Market Trends (Blog)</h2>
                         <div className="flex gap-2">
                           <button 
                             onClick={syncIntelligence}
                             disabled={syncing}
                             className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-[var(--border)] text-[var(--foreground)] ${syncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-500/5'}`}
                           >
                              <Activity size={16} className={syncing ? 'animate-spin' : ''} /> 
                              {syncing ? 'Syncing...' : 'Sync Live Pulse'}
                           </button>
                           <button onClick={() => { setNewPost({ title: '', slug: '', excerpt: '', content: '', cover_image: '', video_url: '', source_label: '', source_url: '', type: 'article', file_url: '' }); setEditingPost(null); setIsAddingPost(true); }} className="bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-brand-blue/20">
                              <Plus size={16} /> New Article
                           </button>
                        </div>
                    </div>
                    <div className="p-8 space-y-4">
                       {posts.length === 0 ? (
                          <div className="py-12 text-center opacity-40 italic">No articles published yet.</div>
                       ) : posts.map((post) => (
                          <div key={post.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-500/5 hover:bg-slate-500/10 border border-transparent hover:border-brand-blue/30 transition-all">
                             <div>
                                <h3 className="font-bold text-sm text-[var(--foreground)]">{post.title}</h3>
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-40 mt-1">/{post.slug} • {new Date(post.created_at).toLocaleDateString()}</p>
                             </div>
                             <div className="flex gap-4">
                                <button onClick={() => { setEditingPost(post); setIsAddingPost(true); }} className="text-brand-blue text-[10px] font-black uppercase tracking-widest hover:underline">Edit</button>
                                <button onClick={() => setConfirmDelete({ type: 'post', id: post.id, name: post.title })} className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:underline">Delete</button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                 <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-[var(--border)] flex justify-between items-center text-[var(--foreground)]">
                       <h2 className="font-heading text-xl font-black tracking-tight flex items-center gap-3"><History size={20} className="text-brand-blue" />Dispatched Campaigns</h2>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-slate-500/5 text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">
                                <th className="px-8 py-4">Launch Date</th><th className="px-8 py-4">Campaign Subject</th><th className="px-8 py-4 text-right">Audience Size</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
                             {campaignHistory.length === 0 ? (
                                <tr><td colSpan={3} className="px-8 py-12 text-center opacity-40 italic">No historical logs found.</td></tr>
                             ) : campaignHistory.map((camp) => (
                                <tr key={camp.id} className="hover:bg-slate-500/5 transition-colors">
                                   <td className="px-8 py-5 text-xs font-medium opacity-60">{new Date(camp.created_at).toLocaleString()}</td>
                                   <td className="px-8 py-5 font-bold text-sm tracking-tight">{camp.subject}</td>
                                   <td className="px-8 py-5 text-right font-black text-brand-blue">{camp.audience_size} Leads</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Blog Post Editor Modal */}
          <AnimatePresence>
            {isAddingPost && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingPost(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                 <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[var(--background)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-heading font-black tracking-tight mb-6 uppercase text-[var(--foreground)]">{editingPost ? 'Edit Article' : 'Compose Article'}</h3>
                    <div className="space-y-4">
                       <input type="text" placeholder="Article Title" value={editingPost ? editingPost.title : newPost.title} onChange={e => editingPost ? setEditingPost({...editingPost, title: e.target.value}) : setNewPost({...newPost, title: e.target.value})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)]" />
                       <input type="text" placeholder="URL Slug (e.g. market-trends-q1)" value={editingPost ? editingPost.slug : newPost.slug} onChange={e => editingPost ? setEditingPost({...editingPost, slug: e.target.value.toLowerCase().replace(/\s+/g,'-')}) : setNewPost({...newPost, slug: e.target.value.toLowerCase().replace(/\s+/g,'-')})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-xs font-bold font-mono text-[var(--foreground)]" />
                       <textarea rows={2} placeholder="Short Excerpt..." value={editingPost ? editingPost.excerpt : newPost.excerpt} onChange={e => editingPost ? setEditingPost({...editingPost, excerpt: e.target.value}) : setNewPost({...newPost, excerpt: e.target.value})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-medium resize-none text-[var(--foreground)]" />
                       <textarea rows={10} placeholder="Full HTML or Markdown Content..." value={editingPost ? editingPost.content : newPost.content} onChange={e => editingPost ? setEditingPost({...editingPost, content: e.target.value}) : setNewPost({...newPost, content: e.target.value})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-medium resize-none text-[var(--foreground)]" />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Cover Image / Media</label>
                              <div className="flex gap-2">
                                 <input type="text" placeholder="Image URL" value={editingPost ? editingPost.cover_image : newPost.cover_image} onChange={e => editingPost ? setEditingPost({...editingPost, cover_image: e.target.value}) : setNewPost({...newPost, cover_image: e.target.value})} className="flex-1 px-4 py-3 bg-slate-500/5 rounded-xl border border-transparent focus:border-brand-blue outline-none text-xs font-bold text-[var(--foreground)]" />
                                 <div className="relative">
                                    <input 
                                       type="file" 
                                       title="Upload Media Asset"
                                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                       onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          try {
                                             const fileExt = file.name.split('.').pop();
                                             const fileName = `${Math.random()}.${fileExt}`;
                                             const { data, error } = await supabaseClient.storage.from('blog-media').upload(fileName, file);
                                             if (error) throw error;
                                             const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-media/${data.path}`;
                                             if (editingPost) setEditingPost({...editingPost, cover_image: url});
                                             else setNewPost({...newPost, cover_image: url});
                                             notify('success', 'Media uploaded.');
                                          } catch (err: unknown) { 
                                             const errorMessage = err instanceof Error ? err.message : 'Unknown upload error';
                                             notify('error', 'Upload failed: ' + errorMessage); 
                                          }
                                       }}
                                    />
                                    <button title="Upload File" className="h-full px-4 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center"><Upload size={16}/></button>
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Video Link (YouTube)</label>
                              <input type="text" placeholder="https://youtube.com/watch?v=..." value={editingPost ? editingPost.video_url : newPost.video_url} onChange={e => editingPost ? setEditingPost({...editingPost, video_url: e.target.value}) : setNewPost({...newPost, video_url: e.target.value})} className="w-full px-4 py-3 bg-slate-500/5 rounded-xl border border-transparent focus:border-brand-blue outline-none text-xs font-bold text-[var(--foreground)]" />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Publication Type</label>
                              <div className="flex gap-2">
                                 {['article', 'report', 'guide'].map((t) => (
                                    <button 
                                      key={t}
                                      onClick={() => editingPost ? setEditingPost({...editingPost, type: t as 'article' | 'report' | 'guide'}) : setNewPost({...newPost, type: t as 'article' | 'report' | 'guide'})}
                                      className={`flex-1 py-3 rounded-xl border text-[10px] uppercase font-black tracking-widest transition-all ${
                                        (editingPost ? editingPost.type : newPost.type) === t 
                                          ? 'bg-brand-blue text-white border-brand-blue' 
                                          : 'bg-slate-500/5 text-[var(--foreground)] border-transparent'
                                      }`}
                                    >
                                       {t}
                                    </button>
                                 ))}
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">PDF Report Attachment</label>
                              <div className="flex gap-2">
                                 <input type="text" placeholder="PDF URL" value={editingPost ? editingPost.file_url : newPost.file_url} onChange={e => editingPost ? setEditingPost({...editingPost, file_url: e.target.value}) : setNewPost({...newPost, file_url: e.target.value})} className="flex-1 px-4 py-3 bg-slate-500/5 rounded-xl border border-transparent focus:border-brand-blue outline-none text-xs font-bold text-[var(--foreground)]" />
                                 <div className="relative">
                                    <input 
                                       type="file" 
                                       accept=".pdf"
                                       title="Upload PDF Asset"
                                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                       onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          try {
                                             const fileName = `${Math.random()}-${file.name.replace(/\s+/g, '_')}`;
                                             const { data, error } = await supabaseClient.storage.from('blog-media').upload(fileName, file);
                                             if (error) throw error;
                                             const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-media/${data.path}`;
                                             if (editingPost) setEditingPost({...editingPost, file_url: url});
                                             else setNewPost({...newPost, file_url: url});
                                             notify('success', 'PDF Document uploaded.');
                                          } catch (err: unknown) { 
                                             const errorMessage = err instanceof Error ? err.message : 'Upload failed';
                                             notify('error', errorMessage); 
                                          }
                                       }}
                                    />
                                    <button title="Upload PDF" className="h-full px-4 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center"><Plus size={16}/></button>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Source Label</label>
                              <input type="text" placeholder="e.g. Knight Frank Report" value={editingPost ? editingPost.source_label : newPost.source_label} onChange={e => editingPost ? setEditingPost({...editingPost, source_label: e.target.value}) : setNewPost({...newPost, source_label: e.target.value})} className="w-full px-4 py-3 bg-slate-500/5 rounded-xl border border-transparent focus:border-brand-blue outline-none text-xs font-bold text-[var(--foreground)]" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Source URL</label>
                              <input type="text" placeholder="https://..." value={editingPost ? editingPost.source_url : newPost.source_url} onChange={e => editingPost ? setEditingPost({...editingPost, source_url: e.target.value}) : setNewPost({...newPost, source_url: e.target.value})} className="w-full px-4 py-3 bg-slate-500/5 rounded-xl border border-transparent focus:border-brand-blue outline-none text-xs font-bold text-[var(--foreground)]" />
                           </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                           <button onClick={() => setIsAddingPost(false)} className="flex-1 py-4 border border-[var(--border)] rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--foreground)]">Cancel</button>
                           <button onClick={async () => {
                              try {
                                 const payload = editingPost 
                                    ? { title: editingPost.title, slug: editingPost.slug, excerpt: editingPost.excerpt, content: editingPost.content, cover_image: editingPost.cover_image, video_url: editingPost.video_url, source_label: editingPost.source_label, source_url: editingPost.source_url, type: editingPost.type, file_url: editingPost.file_url } 
                                    : newPost;
                                 
                                 if (!payload.title || !payload.slug) return notify('error', 'Title and slug required.');
                                 
                                 const { error } = editingPost 
                                   ? await supabaseClient.from('posts').update(payload).eq('id', editingPost.id)
                                   : await supabaseClient.from('posts').insert(payload);
                                 
                                 if (!error) {
                                    notify('success', 'Article saved.');
                                    setIsAddingPost(false);
                                    fetchPosts();
                                 } else throw error;
                              } catch { notify('error', 'Failed to save.'); }
                           }} className="flex-1 py-4 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20">
                             Save Article
                           </button>
                        </div>
                    </div>
                 </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Individual Outreach Modal */}
          <AnimatePresence>
            {selectedLead && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLead(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                 <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-[var(--background)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-2xl">
                    <h3 className="text-2xl font-heading font-black tracking-tight mb-2 uppercase text-[var(--foreground)]">Direct Outreach</h3>
                    <p className="text-xs opacity-40 mb-6 font-bold text-[var(--foreground)] uppercase">To: {selectedLead.name} ({selectedLead.email})</p>
                    <div className="space-y-4">
                       <input type="text" value={soloSubject} onChange={e => setSoloSubject(e.target.value)} placeholder="Subject" className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)]" />
                       <textarea rows={8} value={soloBody} onChange={e => setSoloBody(e.target.value)} placeholder="Type your message here..." className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-medium leading-relaxed resize-none text-[var(--foreground)]" />
                       <div className="flex gap-4 pt-4">
                          <button onClick={() => setSelectedLead(null)} className="flex-1 py-4 border border-[var(--border)] rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--foreground)]">Cancel</button>
                          <button onClick={handleSoloSend} disabled={soloSending} className="flex-1 py-4 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20">
                            {soloSending ? "Sending..." : "Send Outreach"}
                          </button>
                       </div>
                    </div>
                 </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* CRM Details Modal */}
          <AnimatePresence>
            {viewingLead && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingLead(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                 <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-[var(--background)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <h3 className="text-2xl font-heading font-black tracking-tight uppercase text-[var(--foreground)]">{viewingLead.name}</h3>
                          <p className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">{viewingLead.email} {viewingLead.phone ? `• ${viewingLead.phone}` : ''}</p>
                       </div>
                       <button onClick={() => setViewingLead(null)} className="text-[var(--foreground)]/40 hover:text-red-400" title="Close Lead Details"><X size={20}/></button>
                    </div>
                    
                    <div className="space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Interest</label>
                             <p className="font-bold text-sm text-[var(--foreground)]">{viewingLead.interest || "General Inquiry"}</p>
                          </div>
                          <div>
                             <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Date</label>
                             <p className="font-bold text-sm text-[var(--foreground)]">{new Date(viewingLead.created_at || '').toLocaleDateString()}</p>
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Lead Status</label>
                          <select 
                            title="Lead Status"
                            value={viewingLead.status || 'new'} 
                            onChange={e => setViewingLead({...viewingLead, status: e.target.value})}
                            className="w-full bg-slate-500/5 px-4 py-3 rounded-xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)] cursor-pointer"
                          >
                             <option value="new">New</option>
                             <option value="contacted">Contacted</option>
                             <option value="viewing">Viewing</option>
                             <option value="qualified">Qualified</option>
                             <option value="closed">Closed / Won</option>
                             <option value="lost">Lost</option>
                          </select>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Internal Notes</label>
                          <textarea 
                             rows={4} 
                             value={viewingLead.notes || ''} 
                             onChange={e => setViewingLead({...viewingLead, notes: e.target.value})}
                             placeholder="Add internal notes about this prospect..."
                             className="w-full bg-slate-500/5 px-4 py-3 rounded-xl border border-transparent focus:border-brand-blue outline-none text-sm font-medium resize-none text-[var(--foreground)]"
                          />
                       </div>

                       <button 
                          onClick={async () => {
                             try {
                                const { error } = await supabaseClient.from('leads').update({
                                   status: viewingLead.status, notes: viewingLead.notes
                                }).eq('id', viewingLead.id);
                                if (!error) {
                                   notify('success', 'Lead record updated.');
                                   fetchLeads();
                                   setViewingLead(null);
                                } else throw error;
                             } catch { notify('error', 'Update fault.'); }
                          }}
                          className="w-full bg-brand-blue text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg hover:shadow-brand-blue/20 transition-all"
                       >
                          Save Record
                       </button>
                    </div>
                 </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Unit Management Modal */}
          <AnimatePresence>
            {selectedPropertyId && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPropertyId(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                 <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[var(--background)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-2xl font-heading font-black tracking-tight uppercase text-[var(--foreground)]">Unit Manager</h3>
                       <button onClick={() => setSelectedPropertyId(null)} className="text-[var(--foreground)]/40 hover:text-red-400 font-bold text-sm tracking-widest uppercase">Close</button>
                    </div>
                    
                    <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] mb-8">
                       <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 text-[var(--foreground)]">Add New Unit Types</h4>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <input type="text" placeholder="Type (e.g. 1 Bedroom)" value={newUnit.type} onChange={e => setNewUnit({...newUnit, type: e.target.value})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                          <input type="number" placeholder="Beds" value={newUnit.beds} onChange={e => setNewUnit({...newUnit, beds: parseInt(e.target.value) || 0})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                          <input type="number" placeholder="Baths" value={newUnit.baths} onChange={e => setNewUnit({...newUnit, baths: parseFloat(e.target.value) || 0})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                          <input type="number" placeholder="SQM" value={newUnit.sqm} onChange={e => setNewUnit({...newUnit, sqm: parseInt(e.target.value) || 0})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <input type="number" placeholder="Starting Price (ETB)" value={newUnit.price} onChange={e => setNewUnit({...newUnit, price: parseInt(e.target.value) || 0})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                          <button onClick={async () => {
                              try {
                                 const { error } = await supabaseClient.from('property_units').insert({ 
                                     ...newUnit, variety_img: null, property_id: selectedPropertyId 
                                 });
                                 if (!error) {
                                    notify('success', 'Unit added.');
                                    setNewUnit({ type: '', beds: 1, baths: 1, sqm: 50, price: 2000000 });
                                    fetchProperties();
                                 } else throw error;
                              } catch { notify('error', 'Failed to add unit.'); }
                          }} className="w-full bg-brand-blue text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl hover:shadow-brand-blue/20 shadow-lg">
                             Register Unit
                          </button>
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 text-[var(--foreground)]">Registered Inventory</h4>
                       {properties.find(p => p.id === selectedPropertyId)?.units?.map((u: Unit) => (
                          <div key={u.id} className="flex items-center justify-between p-4 bg-slate-500/5 rounded-xl border border-transparent hover:border-brand-blue/20 transition-all">
                             <div className="flex-1">
                                <p className="font-bold text-sm text-[var(--foreground)]">{u.type}</p>
                                <p className="text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-widest mt-1">{u.beds} Beds • {u.baths} Baths • {u.sqm} SQM</p>
                             </div>
                             <div className="text-right">
                                <p className="font-black text-brand-blue">{new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(u.price)}</p>
                                <button onClick={async () => {
                                    if(!confirm('Delete this unit?')) return;
                                    try {
                                       const { error } = await supabaseClient.from('property_units').delete().eq('id', u.id);
                                       if(!error){ notify('success','Unit deleted'); fetchProperties(); }
                                       else throw error;
                                    }catch{ notify('error','Failed delete');}
                                }} className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1 hover:underline">Remove</button>
                             </div>
                          </div>
                       ))}
                       {(!properties.find(p => p.id === selectedPropertyId)?.units?.length) && (
                           <div className="p-8 text-center bg-slate-500/5 rounded-xl border border-dashed border-[var(--border)]">
                              <p className="text-xs font-bold text-[var(--foreground)] opacity-40">No units registered for this property yet.</p>
                           </div>
                        )}
                    </div>
                 </motion.div>
              </div>
            )}
          </AnimatePresence>

           {/* Global Delete Confirmation Modal */}
           <AnimatePresence>
             {confirmDelete && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDelete(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                    className="relative w-full max-w-sm bg-[var(--background)] rounded-[2.5rem] border border-red-500/20 p-8 shadow-2xl text-center"
                  >
                     <div className="w-16 h-16 bg-red-400/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Trash2 size={32} />
                     </div>
                     <h3 className="text-xl font-heading font-black tracking-tight mb-2 uppercase text-[var(--foreground)]">Verify Intent</h3>
                     <p className="text-sm opacity-40 font-medium mb-8 text-[var(--foreground)] leading-relaxed">
                        Are you sure you want to permanently delete <span className="font-bold text-red-400 italic">&quot;{confirmDelete.name}&quot;</span>? This action is irreversible.
                     </p>
                     <div className="flex gap-4">
                        <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 border border-[var(--border)] rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--foreground)]">Keep</button>
                        <button 
                          disabled={isDeleting}
                          onClick={async () => {
                             setIsDeleting(true);
                             try {
                                const { error } = await supabaseClient.from(confirmDelete.type === 'property' ? 'properties' : 'posts').delete().eq('id', confirmDelete.id);
                                if (!error) {
                                   notify('success', 'Resource purged.');
                                   if (confirmDelete.type === 'property') fetchProperties(); else fetchPosts();
                                   setConfirmDelete(null);
                                } else throw error;
                             } catch { notify('error', 'Purge fault.'); }
                             setIsDeleting(false);
                          }} 
                          className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20"
                        >
                          {isDeleting ? "Deleting..." : "Purge Now"}
                        </button>
                     </div>
                  </motion.div>
               </div>
             )}
           </AnimatePresence>

           <div className="text-center opacity-20 py-8 border-t border-[var(--border)]">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--foreground)]">Powered by Resend Engine & Supabase Global Grid</p>
           </div>
        </div>
      </main>
    </div>
  );
}
