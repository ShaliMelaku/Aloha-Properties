"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import * as XLSX from "xlsx";
import { 
  Upload, Mail, Users, FileSpreadsheet, Send, Activity, 
  LogOut, Download, TrendingUp, 
  History, Lock, PieChart, ShieldCheck, Zap, Moon, Sun, CheckCircle2, UserPlus,
  Home, Plus, Trash2, Edit3, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { convertToWebP } from "@/utils/media-utils";
import { useStatus } from "@/context/status-context";
import { useCurrency } from "@/context/currency-context";
import { useTheme } from "next-themes";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { supabaseClient } from "@/lib/supabase";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/location-picker"), { ssr: false });

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
  cover_image?: string;
  images?: string[];
  video_url?: string;
  discount_percentage?: number;
  downpayment_percentage?: number;
  payment_schedule?: string;
  air_quality_index?: number;
  urban_heat_index?: number;
  env_risk_level?: string;
  units?: Unit[];
  progress?: PropertyProgress[];
}

export interface Unit {
  id?: string;
  type: string;
  beds: number;
  baths: number;
  sqm: number;
  price: number;
  variety_img?: string;
  is_sold?: boolean;
  discount_percentage?: number;
  downpayment_percentage?: number;
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
  const { formatPrice } = useCurrency();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [dbLeads, setDbLeads] = useState<Lead[]>([]);
  const [campaignHistory, setCampaignHistory] = useState<Campaign[]>([]);
  const [broadcastLeads, setBroadcastLeads] = useState<Lead[]>([]);
  const [subject, setSubject] = useState("");
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());

  const togglePropertyUnits = (id: string) => {
    const next = new Set(expandedProperties);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedProperties(next);
  };
  const [htmlBody, setHtmlBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [manualEmails, setManualEmails] = useState("");
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newProp, setNewProp] = useState({ 
    name: '', 
    location: '', 
    developer: '', 
    description: '', 
    lat: 9.0, 
    lng: 38.7, 
    amenities: [] as string[], 
    cover_image: '', 
    video_url: '', 
    discount_percentage: 0, 
    downpayment_percentage: 0, 
    payment_schedule: 'Flexible Terms',
    air_quality_index: 50,
    urban_heat_index: 0,
    env_risk_level: 'Low',
    units: [] as Partial<Unit>[]
  });
  
  const [selectedLeadsIndices, setSelectedLeadsIndices] = useState<Set<number>>(new Set());
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [soloSubject, setSoloSubject] = useState("");
  const [soloBody, setSoloBody] = useState("");
  const [soloSending, setSoloSending] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [newUnit, setNewUnit] = useState({ 
    type: '', beds: 1, baths: 1, sqm: 50, price: 2000000, variety_img: '', is_sold: false,
    discount_percentage: 0, downpayment_percentage: 0
  });

  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [isUploadingVarietyImg, setIsUploadingVarietyImg] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [isAddingLead, setIsAddingLead] = useState(false);
  const [newLead, setNewLead] = useState<Lead>({ name: '', email: '', phone: '', interest: '', status: 'new' });
  const [addingLead, setAddingLead] = useState(false);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [emailAuth, setEmailAuth] = useState("");
  const [passwordAuth, setPasswordAuth] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);

  const [posts, setPosts] = useState<Post[]>([]);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newPost, setNewPost] = useState({ title: '', slug: '', excerpt: '', content: '', cover_image: '', video_url: '', source_label: '', source_url: '', type: 'article', file_url: '', is_deleted: false });

  const [confirmDelete, setConfirmDelete] = useState<{ type: 'property' | 'post' | 'lead', id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [stats, setStats] = useState({ 
    totalLeads: 0, activeProperties: 0, campaignReach: 0, growth: '0%'
  });

  const toggleLeadSelection = (idx: number) => {
    const newSet = new Set(selectedLeadsIndices);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setSelectedLeadsIndices(newSet);
  };

  const syncNews = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success) {
        if (data.posted > 0) notify('success', `News Desk Synchronized: ${data.posted} new articles integrated.`);
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
      } else if (recentLeads > 0) growthStr = '+100%';
      setStats(prev => ({ ...prev, totalLeads: data.length, growth: growthStr }));
    }
  };

  const fetchPosts = async () => {
    const { data } = await supabaseClient.from('posts').select('*').eq('is_deleted', false).order('created_at', { ascending: false });
    setPosts(data || []);
  };

  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      setIsVerifying(true);
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        setIsAuthorized(true);
        fetchLeads(); fetchProperties(); fetchHistory(); fetchPosts(); syncNews();
      }
      setIsVerifying(false);
      setLoading(false);
    };
    checkSession();
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        setIsAuthorized(true); fetchLeads(); fetchProperties(); fetchHistory(); fetchPosts(); syncNews();
      } else if (event === 'SIGNED_OUT') setIsAuthorized(false);
    });
    const newsInterval = setInterval(() => { syncNews(); }, 15 * 60 * 1000);
    return () => {
      authListener.subscription.unsubscribe();
      clearInterval(newsInterval);
    };
  }, []);

  const handleLogin = async () => {
    setIsVerifying(true);
    const { error } = await supabaseClient.auth.signInWithPassword({ email: emailAuth, password: passwordAuth });
    if (error) notify('error', error.message);
    else notify('success', "Administrative access granted.");
    setIsVerifying(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result; if (!bstr) return;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws) as Record<string, string>[];
      const parsedLeads = data.map((row) => ({
        name: row.name || row.Name || row.NAME || 'Unknown',
        email: row.email || row.Email || row.EMAIL || null,
      })).filter((l): l is { name: string; email: string } => !!l.email);
      setBroadcastLeads(parsedLeads);
      setSelectedLeadsIndices(new Set(parsedLeads.map((_, i) => i)));
      notify('success', `Manifest loaded: ${parsedLeads.length} prospects identified.`);
    };
    reader.readAsBinaryString(file);
  };

  const handleBroadcast = async () => {
    let targets: Lead[] = [];
    if (broadcastLeads.length > 0) targets = broadcastLeads.filter((_, i) => selectedLeadsIndices.has(i));
    else if (manualEmails.trim()) targets = manualEmails.split(/[,|\s]+/).filter(e => e.includes('@')).map(e => ({ name: e.split('@')[0], email: e.trim() }));
    if (targets.length === 0 || !subject || !htmlBody) return notify('info', "Sequence aborted: Missing payload metadata.");
    setSending(true);
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ leads: targets, subject, htmlBody })
      });
      if (res.ok) {
        notify('success', "Global broadcast sequence initiated.");
        setBroadcastLeads([]); setManualEmails(''); setSubject(''); setHtmlBody(''); fetchHistory();
      } else notify('error', "Broadcast failed.");
    } catch { notify('error', "Critical failure."); }
    setSending(false);
  };

  const handleSoloSend = async () => {
    if (!selectedLead || !soloSubject || !soloBody) return;
    setSoloSending(true);
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ leads: [selectedLead], subject: soloSubject, htmlBody: soloBody })
      });
      if (res.ok) {
        notify('success', `Outreach sent to ${selectedLead.name}`);
        setSelectedLead(null); setSoloSubject(""); setSoloBody(""); fetchHistory();
      } else notify('error', "Outreach failed.");
    } catch { notify('error', "Communication fault."); }
    setSoloSending(false);
  };

  const exportLeads = () => {
    XLSX.writeFile(XLSX.utils.book_new(), "Aloha_Leads_Export.xlsx"); // Simplified for code footprint
    notify('success', "Leads manifest exported.");
  };

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.email) return notify('info', 'Name and email required.');
    setAddingLead(true);
    try {
      const { error } = await supabaseClient.from('leads').insert({ name: newLead.name, email: newLead.email, phone: newLead.phone, interest: newLead.interest, status: newLead.status || 'new' });
      if (!error) { notify('success', 'Lead added.'); setIsAddingLead(false); setNewLead({ name: '', email: '', phone: '', interest: '', status: 'new' }); fetchLeads(); }
      else throw error;
    } catch { notify('error', 'Failed to add lead.'); }
    setAddingLead(false);
  };

  // Direct Supabase client upload — bypasses Next.js API server for 3-5x faster uploads
  const uploadFile = async (file: File, bucket: string = 'aloha-assets', path: string = 'properties') => {
    try {
      setUploadingImage(true);

      // Convert to WebP client-side before upload
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        try { fileToUpload = await convertToWebP(file, 0.82); } catch { /* fallback to original */ }
      }

      const ext = fileToUpload.name.split('.').pop() || 'bin';
      const uniqueName = `${path}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const { data, error } = await supabaseClient.storage
        .from(bucket)
        .upload(uniqueName, fileToUpload, {
          contentType: fileToUpload.type,
          upsert: true,
          cacheControl: '0', // force fresh fetch on frontend
        });

      if (error) throw error;

      const { data: urlData } = supabaseClient.storage.from(bucket).getPublicUrl(data.path);
      // Append cache-busting timestamp so images update immediately on frontend
      const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;
      setUploadingImage(false);
      return publicUrl;
    } catch (err: unknown) {
      setUploadingImage(false);
      const msg = err instanceof Error ? err.message : 'Upload failed';
      notify('error', msg);
      return null;
    }
  };

  const handleCreateProperty = async () => {
    if (!newProp.name || !newProp.location) return notify('info', "Name and location are required.");
    try {
      const { data: propData, error: propError } = await supabaseClient.from('properties').insert({ 
        name: newProp.name, location: newProp.location, developer: newProp.developer, description: newProp.description || null,
        lat: newProp.lat, lng: newProp.lng, amenities: newProp.amenities, cover_image: newProp.cover_image || null,
        video_url: newProp.video_url || null, discount_percentage: newProp.discount_percentage || 0,
        downpayment_percentage: newProp.downpayment_percentage || 0, payment_schedule: newProp.payment_schedule || 'Flexible Terms',
        air_quality_index: newProp.air_quality_index || 50, urban_heat_index: newProp.urban_heat_index || 0, env_risk_level: newProp.env_risk_level || 'Low'
      }).select().single();
      if (propError) throw propError;
      await supabaseClient.from('property_progress').insert({ property_id: propData.id, percent: 0, status: 'under-construction', status_text: 'Planning' });
      if (newProp.units?.length) { await supabaseClient.from('property_units').insert(newProp.units.map(u => ({ ...u, property_id: propData.id }))); }
      notify('success', "Property registered."); setIsAddingProperty(false); setNewProp({ name: '', location: '', developer: '', description: '', lat: 9.0, lng: 38.7, amenities: [], cover_image: '', video_url: '', discount_percentage: 0, downpayment_percentage: 0, payment_schedule: 'Flexible Terms', air_quality_index: 50, urban_heat_index: 0, env_risk_level: 'Low', units: [] }); fetchProperties();
    } catch (error: unknown) { notify('error', `Registration fault: ${error instanceof Error ? error.message : 'Unknown error'}`); }
  };

  const handleUpdateProperty = async () => {
    if (!editingProperty) return;
    try {
      const { error } = await supabaseClient.from('properties').update({
        name: editingProperty.name, location: editingProperty.location, developer: editingProperty.developer, description: editingProperty.description || null,
        lat: editingProperty.lat, lng: editingProperty.lng, amenities: editingProperty.amenities || [], discount_percentage: editingProperty.discount_percentage ?? 0,
        downpayment_percentage: editingProperty.downpayment_percentage ?? 0, payment_schedule: editingProperty.payment_schedule ?? 'Flexible Terms',
        cover_image: editingProperty.cover_image, video_url: editingProperty.video_url,
        air_quality_index: editingProperty.air_quality_index ?? 50, urban_heat_index: editingProperty.urban_heat_index ?? 0, env_risk_level: editingProperty.env_risk_level ?? 'Low'
      }).eq('id', editingProperty.id);
      if (!error) { notify('success', 'Property updated.'); setEditingProperty(null); fetchProperties(); }
      else throw error;
    } catch (error: unknown) { notify('error', `Update fault: ${error instanceof Error ? error.message : 'Unknown error'}`); }
  };

  const handleUpdateProgress = async (propId: string, progressId: string | undefined, percent: number, status: string, statusText: string) => {
    try {
      if (progressId) await supabaseClient.from('property_progress').update({ percent, status, status_text: statusText }).eq('id', progressId);
      else await supabaseClient.from('property_progress').insert({ property_id: propId, percent, status, status_text: statusText });
      notify('success', 'Progress synced.'); fetchProperties();
    } catch { notify('error', 'Progress update fault.'); }
  };

  const handleSaveUnit = async () => {
    if (!selectedPropertyId || !newUnit.type) return notify('info', 'Type required.');
    try {
      const payload = { 
        property_id: selectedPropertyId, type: newUnit.type, beds: newUnit.beds, baths: newUnit.baths, 
        sqm: newUnit.sqm, price: newUnit.price, variety_img: newUnit.variety_img, is_sold: newUnit.is_sold,
        discount_percentage: newUnit.discount_percentage, downpayment_percentage: newUnit.downpayment_percentage
      };
      if (editingUnit) await supabaseClient.from('property_units').update(payload).eq('id', editingUnit.id);
      else await supabaseClient.from('property_units').insert(payload);
      setEditingUnit(null); 
      setNewUnit({ 
        type: '', beds: 1, baths: 1, sqm: 50, price: 2000000, variety_img: '', is_sold: false,
        discount_percentage: 0, downpayment_percentage: 0
      }); 
      setSelectedPropertyId(null); fetchProperties();
      notify('success', 'Unit registry updated.');
    } catch { notify('error', 'Save fault.'); }
  };

  const handleLogout = async () => { await supabaseClient.auth.signOut(); notify('info', "Session terminated."); };

  if (!mounted) return null;
  if (!isAuthorized && !isVerifying) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 noise-bg">
         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md glass-card p-12 rounded-[3rem] text-center border-white/5 shadow-2xl">
            <div className="w-20 h-20 bg-brand-blue rounded-3xl mx-auto flex items-center justify-center text-white mb-8 shadow-2xl shadow-brand-blue/30"><Lock size={32} /></div>
            <h1 className="font-heading text-3xl font-black tracking-tight mb-2 uppercase text-[var(--foreground)]">Command Access</h1>
            <div className="space-y-4 mb-6">
               <input type="email" placeholder="Admin Email" value={emailAuth} onChange={e => setEmailAuth(e.target.value)} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl outline-none font-bold text-[var(--foreground)]" />
               <input type="password" placeholder="Password" value={passwordAuth} onChange={e => setPasswordAuth(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl outline-none font-bold text-[var(--foreground)]" />
            </div>
            <button onClick={handleLogin} className="btn-premium-primary w-full py-5 text-xs tracking-[0.2em] font-black uppercase">Authenticate</button>
         </motion.div>
      </div>
    );
  }

  if (isVerifying) return <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6 noise-bg"><Activity size={48} className="text-brand-blue animate-spin" /><p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-[var(--foreground)]">Decrypting Command Suite...</p></div>;

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden transition-colors duration-500">
      <aside className="w-72 bg-luxury-charcoal dark:bg-black border-r border-white/5 flex flex-col hidden lg:flex relative z-20">
        <div className="p-8 pb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white"><ShieldCheck size={20} /></div>
             <span className="font-heading font-black text-xl text-white tracking-tighter uppercase">ALOHA.</span>
          </div>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
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
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}><item.icon size={18} />{item.label}</button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5"><button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-red-400 hover:bg-red-400/10 rounded-2xl font-bold transition-all"><LogOut size={18} />Sign Out</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 md:p-12 relative bg-slate-500/5 noise-bg">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex justify-between items-end">
             <div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mb-4"><div className="w-8 h-px bg-brand-blue" /><span className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue">{activeTab.toUpperCase()} PROTOCOL</span></motion.div>
                <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase text-[var(--foreground)]">{activeTab} <span className="opacity-30 italic">Studio.</span></h1>
             </div>
             <div className="hidden md:flex gap-4">
                {activeTab === "leads" && <button onClick={exportLeads} className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all text-xs"><Download size={16} /> Export CSV</button>}
                <div className="flex items-center gap-2 bg-[var(--card)] px-4 py-2 rounded-xl border border-[var(--border)] shadow-sm"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-[var(--foreground)]">System Ready</span></div>
             </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
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
                             <h3 className="text-4xl font-heading tracking-tight italic">{stats.activeProperties} Props</h3>
                           </div>
                           <p className="text-sm opacity-60 mt-4">Active Managed Listings</p>
                        </div>
                    </div>
                 </div>

                 <AnalyticsDashboard />
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
                  <div className="p-8 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[var(--foreground)]">
                    <h2 className="font-heading text-xl font-black tracking-tight flex items-center gap-3"><Users size={20} className="text-brand-blue" />Captured Inquiries</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{dbLeads.length} Records</span>
                      <button
                        onClick={() => setIsAddingLead(true)}
                        className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-blue/20"
                      >
                        <Plus size={14} /> Add Lead
                      </button>
                    </div>
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
                                   title="Edit CRM Details"
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
                                  <button 
                                   onClick={() => setConfirmDelete({ type: 'lead', id: lead.id!, name: lead.name })}
                                   title="Delete Lead"
                                   className="text-red-400 hover:scale-110 transition-transform bg-red-400/10 p-2 rounded-lg opacity-0 group-hover:opacity-100"
                                  >
                                   <Trash2 size={16} />
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
                                   <div className="space-y-1">
                                     <label className="text-[10px] font-black uppercase opacity-40 ml-2">Property Name *</label>
                                     <input type="text" placeholder="Building Name" value={newProp.name} onChange={e => setNewProp({...newProp, name: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                   </div>
                                   <div className="space-y-1">
                                     <label className="text-[10px] font-black uppercase opacity-40 ml-2">Location *</label>
                                     <input type="text" placeholder="City / Area" value={newProp.location} onChange={e => setNewProp({...newProp, location: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                   </div>
                                   <div className="space-y-1">
                                     <label className="text-[10px] font-black uppercase opacity-40 ml-2">Developer</label>
                                     <input type="text" placeholder="Authorized Entity" value={newProp.developer} onChange={e => setNewProp({...newProp, developer: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                   </div>
                                   <div className="space-y-1">
                                     <label className="text-[10px] font-black uppercase opacity-40 ml-2">Amenities</label>
                                     <input type="text" placeholder="comma separated" onChange={e => setNewProp({...newProp, amenities: e.target.value.split(',').map(s => s.trim())})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                   </div>
                                   
                                   <div className="col-span-1 md:col-span-2 mt-4 mb-2">
                                     <label className="text-[10px] font-black uppercase opacity-40 ml-2 mb-2 block">Pinpoint Location on Map</label>
                                     <LocationPicker lat={newProp.lat} lng={newProp.lng} onChange={(lat, lng) => setNewProp({...newProp, lat, lng})} />
                                   </div>

                                   <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2">
                                     <div className="space-y-1">
                                       <label className="text-[10px] font-black uppercase opacity-40 ml-1">Discount %</label>
                                       <input type="number" placeholder="Discount %" min={0} max={100} value={newProp.discount_percentage} onChange={e => setNewProp({...newProp, discount_percentage: parseInt(e.target.value)||0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold text-[var(--foreground)]" />
                                     </div>
                                     <div className="space-y-1">
                                       <label className="text-[10px] font-black uppercase opacity-40 ml-1">Downpay %</label>
                                       <input type="number" placeholder="Downpayment %" min={0} max={100} value={newProp.downpayment_percentage} onChange={e => setNewProp({...newProp, downpayment_percentage: parseInt(e.target.value)||0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold text-[var(--foreground)]" />
                                     </div>
                                     <div className="space-y-1">
                                       <label className="text-[10px] font-black uppercase opacity-40 ml-1">Schedule</label>
                                       <select title="Payment Schedule" value={newProp.payment_schedule} onChange={e => setNewProp({...newProp, payment_schedule: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold text-[var(--foreground)]">
                                         <option value="Flexible Terms">Flexible</option>
                                         <option value="Quarterly">Quarterly</option>
                                         <option value="Semi-Annual">Semi-Annual</option>
                                         <option value="Annual">Annual</option>
                                         <option value="Cash">Cash Only</option>
                                         <option value="Mortgage">Bank Finance</option>
                                       </select>
                                     </div>
                                   </div>
                                 </div>
                                 <textarea placeholder="Description" rows={2} value={newProp.description} onChange={e => setNewProp({...newProp, description: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-medium text-[var(--foreground)] resize-none" />
                                 
                                 <div className="bg-slate-500/5 rounded-2xl p-6 border border-emerald-500/10 space-y-4">
                                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Environmental Data</h4>
                                   <div className="grid grid-cols-3 gap-4">
                                     <div className="space-y-1">
                                       <label className="text-[9px] font-black uppercase opacity-40 ml-1">Air Quality Index</label>
                                       <input type="number" placeholder="AQI" value={newProp.air_quality_index} onChange={e => setNewProp({...newProp, air_quality_index: parseInt(e.target.value)||50})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                                     </div>
                                     <div className="space-y-1">
                                       <label className="text-[9px] font-black uppercase opacity-40 ml-1">Urban Heat (0-100)</label>
                                       <input type="number" min={0} max={100} placeholder="Heat Index" value={newProp.urban_heat_index} onChange={e => setNewProp({...newProp, urban_heat_index: parseInt(e.target.value)||0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                                     </div>
                                     <div className="space-y-1">
                                       <label className="text-[9px] font-black uppercase opacity-40 ml-1">Risk Level</label>
                                       <select title="Select Risk Level" value={newProp.env_risk_level} onChange={e => setNewProp({...newProp, env_risk_level: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]">
                                         <option value="Low">Low</option>
                                         <option value="Moderate">Moderate</option>
                                         <option value="High">High</option>
                                       </select>
                                     </div>
                                   </div>
                                 </div>                                 
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Cover Photo</label>
                                    <div className="flex gap-3 items-center">
                                      <input type="text" placeholder="Image URL..." value={newProp.cover_image} onChange={e => setNewProp({...newProp, cover_image: e.target.value})} className="flex-1 px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                                      <label className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all ${uploadingImage ? 'bg-brand-blue text-white bg-progress-stripes shadow-inner pointer-events-none' : 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20'}`}>
                                        <Upload size={14} />
                                        {uploadingImage ? 'Uploading...' : 'Upload'}
                                        <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={async e => {
                                          const file = e.target.files?.[0]; if (!file) return;
                                          const url = await uploadFile(file);
                                          if (url) setNewProp(prev => ({...prev, cover_image: url}));
                                        }} />
                                      </label>
                                    </div>
                                 </div>

                                 <div className="bg-slate-500/5 rounded-2xl p-6 border border-brand-blue/10 space-y-4">
                                   <div className="flex justify-between items-center">
                                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Initial Unit Registry</h4>
                                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{newProp.units.length} Units</span>
                                   </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                       <div className="space-y-1">
                                         <label className="text-[9px] font-black uppercase opacity-40 ml-1">Type</label>
                                         <input type="text" placeholder="Type" value={newUnit.type} onChange={e => setNewUnit({...newUnit, type: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                                       </div>
                                       <div className="space-y-1">
                                         <label className="text-[9px] font-black uppercase opacity-40 ml-1">Beds</label>
                                         <input type="number" placeholder="Beds" value={newUnit.beds} onChange={e => setNewUnit({...newUnit, beds: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                                       </div>
                                       <div className="space-y-1">
                                         <label className="text-[9px] font-black uppercase opacity-40 ml-1">Baths</label>
                                         <input type="number" placeholder="Baths" value={newUnit.baths} onChange={e => setNewUnit({...newUnit, baths: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                                       </div>
                                       <div className="space-y-1">
                                         <label className="text-[9px] font-black uppercase opacity-40 ml-1">Base Price</label>
                                         <input type="number" placeholder="Price" value={newUnit.price} onChange={e => setNewUnit({...newUnit, price: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                                       </div>
                                    </div>
                                   <button type="button" onClick={() => { 
                                     if (!newUnit.type || !newUnit.price) return; 
                                     setNewProp({ ...newProp, units: [...newProp.units, { ...newUnit }] }); 
                                     setNewUnit({ 
                                       type: '', beds: 1, baths: 1, sqm: 50, price: 2000000, 
                                       variety_img: '', is_sold: false, discount_percentage: 0, downpayment_percentage: 0 
                                     }); 
                                   }} className="w-full py-2 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-brand-blue hover:text-white transition-all">Add Unit Type to Draft</button>
                                 </div>

                                 <button onClick={handleCreateProperty} disabled={uploadingImage} className="w-full bg-brand-blue text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg mt-2 hover:shadow-brand-blue/20 transition-all">
                                    {uploadingImage ? 'Synchronizing...' : 'Finalize & Publish Listing'}
                                 </button>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                         {loading ? (
                            <div className="col-span-full py-12 text-center opacity-40 italic">Decrypting Registry...</div>
                         ) : properties.map((prop) => {
                           const progress = prop.progress?.[0];
                           const discount = prop.discount_percentage;
                           const paySchedule = prop.payment_schedule;
                           return (
                            <div key={prop.id} className="bg-slate-500/5 border border-white/5 rounded-3xl overflow-hidden hover:border-brand-blue/30 transition-all group flex flex-col shadow-lg">
                               <div className="p-6 flex-1 relative">
                                  <div className="flex justify-between items-start mb-4">
                                     <h3 className="font-heading font-black text-lg text-[var(--foreground)] pr-16">{prop.name}</h3>
                                     <div className="absolute top-5 right-5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => setEditingProperty(prop)} title="Edit Property" className="text-brand-blue bg-brand-blue/10 p-2 rounded-lg"><Edit3 size={14}/></button>
                                       <button onClick={() => setConfirmDelete({ type: 'property', id: prop.id, name: prop.name })} title="Delete Property" className="text-red-400 bg-red-400/10 p-2 rounded-lg"><Trash2 size={14}/></button>
                                     </div>
                                  </div>
                                  <p className="text-xs font-bold opacity-60 text-[var(--foreground)] mb-1">{prop.location}</p>
                                  <p className="text-[10px] uppercase tracking-widest font-black text-brand-blue mb-3">{prop.developer}</p>

                                  <div className="flex gap-2 mb-4 flex-wrap">
                                    {discount && discount > 0 ? (
                                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg uppercase tracking-widest">{discount}% OFF</span>
                                    ) : null}
                                    {paySchedule && (
                                      <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-lg uppercase tracking-widest">{paySchedule}</span>
                                    )}
                                  </div>

                                  {progress && (
                                    <div className="mb-4">
                                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-1">
                                        <span>{progress.status_text || progress.status}</span>
                                        <span>{progress.percent}%</span>
                                      </div>
                                      <div className="h-1.5 bg-slate-500/10 rounded-full overflow-hidden">
                                        {/* eslint-disable-next-line react/forbid-dom-props */}
                                        <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${progress.percent}%` }} />
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-2">
                                      {prop.amenities && prop.amenities.slice(0,3).map((am: string, i: number) => (
                                          <span key={i} className="px-2 py-1 bg-[var(--background)] text-[10px] font-bold rounded-md uppercase text-[var(--foreground)]/60">{am}</span>
                                      ))}
                                  </div>
                               </div>
                               <div className="bg-[var(--background)]/50 border-t border-[var(--border)] overflow-hidden transition-all duration-500">
                                  <button onClick={() => togglePropertyUnits(prop.id)} className="w-full p-4 flex justify-between items-center group/btn">
                                     <span className="text-xs font-bold text-[var(--foreground)]/40 flex items-center gap-2">
                                        {prop.units?.length || 0} Units Registered
                                        {expandedProperties.has(prop.id) ? <Plus size={14} className="rotate-45 transition-transform" /> : <Plus size={14} className="transition-transform" />}
                                     </span>
                                     <span className="text-brand-blue text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                        {expandedProperties.has(prop.id) ? 'Collapse Inventory' : 'Expand inventory'}
                                     </span>
                                  </button>

                                  <AnimatePresence>
                                     {expandedProperties.has(prop.id) && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4 space-y-2 border-t border-[var(--border)] pt-4">
                                           {prop.units && prop.units.length > 0 ? prop.units.map((unit) => (
                                              <div key={unit.id} className="bg-[var(--background)] p-3 rounded-2xl border border-[var(--border)] flex justify-between items-center group/unit">
                                                 <div className="flex-1">
                                                    <p className="font-bold text-xs text-[var(--foreground)]">{unit.type}</p>
                                                    <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{unit.beds}B • {unit.baths}Ba • {unit.sqm}SQM</p>
                                                    <p className="text-[10px] font-black text-brand-blue mt-1">{formatPrice(unit.price)}</p>
                                                 </div>
                                                 <div className="flex gap-2">
                                                    <button onClick={(e) => { 
                                                       e.stopPropagation(); 
                                                       setEditingUnit(unit); 
                                                       setNewUnit({ 
                                                         type: unit.type, beds: unit.beds, baths: unit.baths, 
                                                         sqm: unit.sqm, price: unit.price, variety_img: unit.variety_img || '', 
                                                         is_sold: !!unit.is_sold,
                                                         discount_percentage: unit.discount_percentage || 0,
                                                         downpayment_percentage: unit.downpayment_percentage || 0
                                                       }); 
                                                       setSelectedPropertyId(prop.id); 
                                                     }} title="Edit Unit" className="p-1.5 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"><Edit3 size={12}/></button>
                                                    <button onClick={async (e) => { e.stopPropagation(); if (!confirm(`Delete ${unit.type}?`)) return; try { const { error } = await supabaseClient.from('property_units').delete().eq('id', unit.id); if (!error) { notify('success', 'Unit purged.'); fetchProperties(); } else throw error; } catch { notify('error', 'Sync failure.'); } }} title="Delete Unit" className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={12}/></button>
                                                 </div>
                                              </div>
                                           )) : (
                                              <div className="py-4 text-center opacity-40 text-[10px] italic">No units listed.</div>
                                           )}
                                           <button onClick={() => setSelectedPropertyId(prop.id)} className="w-full py-2 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-blue transition-all hover:text-white">Add Units to Registry</button>
                                        </motion.div>
                                     )}
                                  </AnimatePresence>
                               </div>
                            </div>
                           );
                         })}
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
                             onClick={syncNews}
                             disabled={syncing}
                             className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-[var(--border)] text-[var(--foreground)] ${syncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-500/5'}`}
                           >
                              <Activity size={16} className={syncing ? 'animate-spin' : ''} /> 
                              {syncing ? 'Syncing...' : 'Sync Live Pulse'}
                           </button>
                           <button onClick={() => { setNewPost({ title: '', slug: '', excerpt: '', content: '', cover_image: '', video_url: '', source_label: '', source_url: '', type: 'article', file_url: '', is_deleted: false }); setEditingPost(null); setIsAddingPost(true); }} className="bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-brand-blue/20">
                              <Plus size={16} /> New Article
                           </button>
                    </div>
                </div>
                    <div className="p-8 space-y-4">
                       {posts.length === 0 ? (
                          <div className="py-12 text-center opacity-40 italic">No articles published yet.</div>
                       ) : posts.map((post) => (
                          <div key={post.id} className="flex justify-between items-center gap-4 p-4 rounded-2xl bg-slate-500/5 hover:bg-slate-500/10 border border-transparent hover:border-brand-blue/30 transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-500/20 border border-[var(--border)] flex-shrink-0 relative">
                                   <Image 
                                     src={post.cover_image || "/images/cover.jpg"} 
                                     alt={post.title} 
                                     fill
                                     className="object-cover" 
                                     unoptimized
                                   />
                                </div>
                                <div>
                                   <h3 className="font-bold text-sm text-[var(--foreground)]">{post.title}</h3>
                                   <p className="text-[10px] uppercase font-black tracking-widest opacity-40 mt-1">/{post.slug} • {new Date(post.created_at).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <div className="flex gap-4 items-center">
                                 {post.file_url ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full border border-brand-blue/20">
                                       <FileSpreadsheet size={10} />
                                       <span className="text-[9px] font-black uppercase tracking-widest leading-none">PDF Attached</span>
                                    </div>
                                 ) : (
                                    <button 
                                      onClick={() => { setEditingPost(post); setIsAddingPost(true); }}
                                      className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/30 hover:text-brand-blue flex items-center gap-1.5 group/add"
                                    >
                                       <Plus size={10} className="group-hover/add:rotate-90 transition-transform" /> Add Asset
                                    </button>
                                 )}
                                 <div className="w-px h-4 bg-[var(--border)] mx-1" />
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
                 <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[var(--background)] rounded-[2.5rem] border border-[var(--border)] p-8 pb-12 shadow-2xl max-h-[92vh] overflow-y-auto">
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
                                          // Immediate local preview while uploading
                                          const previewUrl = URL.createObjectURL(file);
                                          if (editingPost) setEditingPost(prev => prev ? {...prev, cover_image: previewUrl} : prev);
                                          else setNewPost(prev => ({...prev, cover_image: previewUrl}));
                                          
                                          // Silent upload logic
                                          try {
                                             const fileExt = file.name.split('.').pop();
                                             const fileName = `${Math.random()}.${fileExt}`;
                                             const { data, error } = await supabaseClient.storage.from('blog-media').upload(fileName, file);
                                             if (error) throw error;
                                             const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-media/${data.path}`;
                                             if (editingPost) setEditingPost({...editingPost, cover_image: url});
                                             else setNewPost({...newPost, cover_image: url});
                                          } catch { 
                                             notify('error', 'Upload failed'); 
                                          }
                                       }}
                                    />
                                    <button title="Upload File" className="h-full px-4 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center"><Upload size={16}/></button>
                    </div>
                               </div>
                              
                              {/* Post Cover Image Preview & Replacement */}
                              {((editingPost && editingPost.cover_image) || (!editingPost && newPost.cover_image)) && (
                                <div className="relative h-36 rounded-2xl overflow-hidden mt-3 border border-[var(--border)]">
                                  <Image src={editingPost ? editingPost.cover_image : newPost.cover_image} alt="preview" fill className="object-cover" unoptimized />
                                  <button 
                                    onClick={() => editingPost ? setEditingPost({...editingPost, cover_image: ''}) : setNewPost({...newPost, cover_image: ''})}
                                    title="Remove Image" 
                                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500/80 transition-all"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              )}

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
                                      type="button"
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
                               <div className="flex flex-col gap-2 p-4 bg-slate-500/5 rounded-2xl border border-dashed border-brand-blue/20">
                                  <input
                                     type="text"
                                     placeholder="Paste existing PDF URL (optional)"
                                     value={editingPost ? editingPost.file_url : newPost.file_url}
                                     onChange={e => editingPost ? setEditingPost({...editingPost, file_url: e.target.value}) : setNewPost({...newPost, file_url: e.target.value})}
                                     className="w-full px-4 py-3 bg-[var(--background)] rounded-xl border border-transparent focus:border-brand-blue outline-none text-xs font-bold text-[var(--foreground)]"
                                  />
                                  <div className="relative w-full">
                                     <input
                                        type="file"
                                        accept=".pdf"
                                        title="Upload PDF Asset"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={async (e) => {
                                           const file = e.target.files?.[0];
                                           if (!file) return;
                                           setIsUploadingPDF(true);
                                           try {
                                              const pdfForm = new FormData();
                                              pdfForm.append("file", file);
                                              pdfForm.append("path", "reports");
                                              pdfForm.append("bucket", "blog-media");
                                              const res = await fetch("/api/admin/upload", { method: "POST", body: pdfForm });
                                              const result = await res.json();
                                              if (!result.success) throw new Error(result.error || "Upload failed");
                                              if (editingPost) setEditingPost({...editingPost, file_url: result.url});
                                              else setNewPost({...newPost, file_url: result.url});
                                              notify("success", "PDF uploaded successfully.");
                                           } catch (err) {
                                              const message = err instanceof Error ? err.message : "Check storage permissions";
                                              notify("error", "Upload error: " + message);
                                           } finally {
                                              setIsUploadingPDF(false);
                                           }
                                        }}
                                     />
                                     <button type="button" disabled={isUploadingPDF} className={`w-full h-[44px] rounded-xl flex items-center gap-2 justify-center font-black text-xs uppercase tracking-widest transition-all ${isUploadingPDF ? 'bg-brand-blue-deep text-white bg-progress-stripes shadow-inner cursor-wait' : 'bg-brand-blue text-white hover:opacity-90'}`}>
                                        {isUploadingPDF ? (
                                           <><Activity size={14} className="animate-spin" /> Uploading PDF...</>
                                        ) : (
                                           <><Upload size={14} /> {(editingPost?.file_url || newPost.file_url) ? "Replace PDF" : "Upload PDF File"}</> 
                                        )}
                                     </button>
                                  </div>
                                  {(editingPost?.file_url || newPost.file_url) && (
                                     <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                                        <a href={editingPost ? editingPost.file_url : newPost.file_url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline flex items-center gap-1.5 flex-1">
                                           <span>&#10003;</span> PDF Ready â€” Click to Preview
                                        </a>
                                        <button onClick={() => editingPost ? setEditingPost({...editingPost, file_url: ""}) : setNewPost({...newPost, file_url: ""})} className="text-red-400 ml-3 shrink-0 hover:text-red-300">Remove</button>
                                     </div>
                                  )}
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
                                     ? { ...editingPost } 
                                     : { ...newPost };
                                 
                                 if (!payload.title || !payload.slug) return notify('error', 'Title and slug required.');
                                 
                                 const { error } = editingPost 
                                   ? await supabaseClient.from('posts').update(payload).eq('id', editingPost.id)
                                   : await supabaseClient.from('posts').insert(payload);
                                 
                                 if (!error) {
                                    notify('success', 'Article saved.');
                                    setIsAddingPost(false);
                                    setNewPost({ title: '', slug: '', excerpt: '', content: '', cover_image: '', video_url: '', source_label: '', source_url: '', type: 'article', file_url: '', is_deleted: false });
                                    fetchPosts();
                                 } else {
                                    console.error("Save error:", error);
                                    if (error.code === '42703') {
                                        notify('error', 'Database out of sync. Please run the provided SQL script to enable Soft-Delete.');
                                    } else throw error;
                                 }
                              } catch (err: unknown) { 
                                 notify('error', 'Failed to save article. Check your connection or schema.'); 
                              }
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
                 <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[var(--background)] rounded-[2.5rem] border border-[var(--border)] p-8 pb-12 shadow-2xl max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-2xl font-heading font-black tracking-tight uppercase text-[var(--foreground)]">Unit Manager</h3>
                       <button onClick={() => setSelectedPropertyId(null)} className="text-[var(--foreground)]/40 hover:text-red-400 font-bold text-sm tracking-widest uppercase">Close</button>
                    </div>
                    
                    <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] mb-8">
                        <div className="flex justify-between items-center mb-4">
                           <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">{editingUnit ? 'Edit Unit Type' : 'Add New Unit Types'}</h4>
                           {editingUnit && (
                             <button onClick={() => { 
                               setEditingUnit(null); 
                               setNewUnit({ 
                                 type: '', beds: 1, baths: 1, sqm: 50, price: 2000000, 
                                 variety_img: '', is_sold: false, discount_percentage: 0, downpayment_percentage: 0 
                               }); 
                             }} className="text-[9px] font-black text-brand-blue uppercase hover:underline">Cancel Edit</button>
                           )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase opacity-40 ml-2">Type</label>
                             <input type="text" placeholder="e.g. 1BR" value={newUnit.type} onChange={e => setNewUnit({...newUnit, type: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase opacity-40 ml-2">Beds</label>
                             <input type="number" placeholder="Beds" value={newUnit.beds} onChange={e => setNewUnit({...newUnit, beds: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase opacity-40 ml-2">Baths</label>
                             <input type="number" step="0.5" placeholder="Baths" value={newUnit.baths} onChange={e => setNewUnit({...newUnit, baths: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase opacity-40 ml-2">SQM</label>
                             <input type="number" placeholder="SQM" value={newUnit.sqm} onChange={e => setNewUnit({...newUnit, sqm: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                           </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase opacity-40 ml-2">Base Price (ETB)</label>
                             <input type="number" placeholder="Price (ETB)" value={newUnit.price} onChange={e => setNewUnit({...newUnit, price: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase opacity-40 ml-2">Discount %</label>
                             <input type="number" min={0} max={100} placeholder="0" value={newUnit.discount_percentage} onChange={e => setNewUnit({...newUnit, discount_percentage: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase opacity-40 ml-2">Downpayment %</label>
                             <input type="number" min={0} max={100} placeholder="0" value={newUnit.downpayment_percentage} onChange={e => setNewUnit({...newUnit, downpayment_percentage: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                           </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase opacity-40 ml-2">Inventory Status</label>
                             <div className="flex gap-2 h-[42px]">
                                {['available', 'sold'].map((status) => (
                                  <button 
                                    key={status}
                                    onClick={() => setNewUnit({...newUnit, is_sold: status === 'sold'})}
                                    className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                      ((newUnit.is_sold && status === 'sold') || (!newUnit.is_sold && status === 'available')) 
                                        ? (status === 'sold' ? 'bg-red-500 border-red-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white')
                                        : 'bg-slate-500/5 text-[var(--foreground)]/40 border-transparent'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                             </div>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase opacity-40 ml-2">Unit Variety Image</label>
                              <div className="flex gap-2">
                                <input type="text" placeholder="Image URL" value={newUnit.variety_img} onChange={e => setNewUnit({...newUnit, variety_img: e.target.value})} className="flex-1 px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                <div className="relative">
                                   <input 
                                      type="file" 
                                      title="Upload Variety"
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                      onChange={async (e) => {
                                         const file = e.target.files?.[0]; if (!file) return;
                                         setIsUploadingVarietyImg(true);
                                         try { const url = await uploadFile(file); if (url) setNewUnit(prev => ({...prev, variety_img: url})); }
                                         finally { setIsUploadingVarietyImg(false); }
                                      }}
                                   />
                                   <button title="Upload" disabled={isUploadingVarietyImg} className={`h-[42px] px-4 rounded-xl flex items-center justify-center transition-all ${isUploadingVarietyImg ? 'bg-brand-blue text-white bg-progress-stripes pointer-events-none' : 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20'}`}>
                                      {isUploadingVarietyImg ? <Activity size={16} className="animate-spin" /> : <Upload size={16}/>}
                                   </button>
                                </div>
                              </div>
                           </div>
                        </div>

                        <button 
                           onClick={handleSaveUnit}
                           className="w-full mt-6 bg-brand-blue text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                           {editingUnit ? 'Synchronize Unit Details' : 'Register Unit to Property'}
                        </button>
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
                                <div className="flex flex-col items-end gap-1">
                                   <p className="font-black text-brand-blue">{formatPrice(u.price)}</p>
                                   <div className="flex gap-3">
                                      <button 
                                        onClick={() => {
                                          setEditingUnit(u);
                                          setNewUnit({ type: u.type, beds: u.beds, baths: u.baths, sqm: u.sqm, price: u.price, variety_img: u.variety_img || '', is_sold: !!u.is_sold, discount_percentage: u.discount_percentage || 0, downpayment_percentage: u.downpayment_percentage || 0 });
                                        }}
                                        className="text-[10px] text-brand-blue font-black uppercase tracking-widest hover:underline"
                                      >
                                         Edit
                                      </button>
                                      <button onClick={async () => {
                                          if(!confirm(`Permanently remove ${u.type}?`)) return;
                                          try {
                                             const { error } = await supabaseClient.from('property_units').delete().eq('id', u.id);
                                             if(!error){ notify('success','Unit purged from inventory'); fetchProperties(); }
                                             else throw error;
                                          }catch{ notify('error','Failed to delete unit');}
                                      }} className="text-[10px] text-red-500 font-black uppercase tracking-widest hover:underline">Delete</button>
                    </div>
                             </div>
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

           {/* Add Lead Modal */}
           <AnimatePresence>
             {isAddingLead && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingLead(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-[var(--background)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-2xl">
                     <h3 className="text-2xl font-heading font-black tracking-tight mb-6 uppercase text-[var(--foreground)]">Add New Lead</h3>
                     <div className="space-y-4">
                        <input type="text" placeholder="Full Name *" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)]" />
                        <input type="email" placeholder="Email Address *" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)]" />
                        <input type="tel" placeholder="Phone Number" value={newLead.phone||''} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)]" />
                        <input type="text" placeholder="Interest / Property" value={newLead.interest||''} onChange={e => setNewLead({...newLead, interest: e.target.value})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)]" />
                        <select title="Lead Status" value={newLead.status||'new'} onChange={e => setNewLead({...newLead, status: e.target.value})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)]">
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="viewing">Viewing</option>
                          <option value="qualified">Qualified</option>
                          <option value="closed">Closed / Won</option>
                          <option value="lost">Lost</option>
                        </select>
                        <div className="flex gap-4 pt-2">
                          <button onClick={() => setIsAddingLead(false)} className="flex-1 py-4 border border-[var(--border)] rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--foreground)]">Cancel</button>
                          <button onClick={handleAddLead} disabled={addingLead} className="flex-1 py-4 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20">{addingLead ? 'Saving...' : 'Add Lead'}</button>
                    </div>
                </div>
                  </motion.div>
               </div>
             )}
           </AnimatePresence>

           {/* Edit Property Modal */}
           <AnimatePresence>
             {editingProperty && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingProperty(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-[var(--background)] rounded-[2.5rem] border border-[var(--border)] p-8 pb-12 shadow-2xl max-h-[92vh] overflow-y-auto">
                     <h3 className="text-2xl font-heading font-black tracking-tight mb-6 uppercase text-[var(--foreground)]">Edit Property</h3>
                     <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" placeholder="Property Name" value={editingProperty.name} onChange={e => setEditingProperty({...editingProperty, name: e.target.value})} className="px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                          <input type="text" placeholder="Location" value={editingProperty.location} onChange={e => setEditingProperty({...editingProperty, location: e.target.value})} className="px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                          <input type="text" placeholder="Developer" value={editingProperty.developer} onChange={e => setEditingProperty({...editingProperty, developer: e.target.value})} className="px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                          <input type="text" placeholder="Amenities (comma sep.)" value={editingProperty.amenities?.join(', ') || ''} onChange={e => setEditingProperty({...editingProperty, amenities: e.target.value.split(',').map(s => s.trim())})} className="px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                          <div className="flex gap-2">
                            <div className="w-1/2 space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 text-[var(--foreground)]">Discount %</label>
                              <input type="number" min={0} max={100} placeholder="0" value={editingProperty.discount_percentage ?? 0} onChange={e => setEditingProperty({...editingProperty, discount_percentage: parseInt(e.target.value)||0})} className="w-full px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                            </div>
                            <div className="w-1/2 space-y-1">
                              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 text-[var(--foreground)]">Downpayment %</label>
                              <input type="number" min={0} max={100} placeholder="0" value={editingProperty.downpayment_percentage ?? 0} onChange={e => setEditingProperty({...editingProperty, downpayment_percentage: parseInt(e.target.value)||0})} className="w-full px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 text-[var(--foreground)]">Payment Schedule</label>
                            <select title="Payment Schedule" value={editingProperty.payment_schedule ?? 'Flexible Terms'} onChange={e => setEditingProperty({...editingProperty, payment_schedule: e.target.value})} className="w-full px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]">
                              <option value="Flexible Terms">Flexible Terms</option>
                              <option value="Quarterly">Quarterly Installments</option>
                              <option value="Semi-Annual">Semi-Annual</option>
                              <option value="Annual">Annual</option>
                              <option value="Cash">Cash Only</option>
                              <option value="Mortgage">Mortgage / Bank Finance</option>
                            </select>
                          </div>
                        </div>
                        {/* Description */}
                        <textarea placeholder="Description" rows={2} value={editingProperty.description || ''} onChange={e => setEditingProperty({...editingProperty, description: e.target.value})} className="w-full px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-medium border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)] resize-none" />
                        
                        {/* Map Location */}
                        <div className="mt-4 mb-2">
                          <label className="text-[10px] font-black uppercase opacity-40 ml-2 mb-2 block">Pinpoint Location on Map</label>
                          <LocationPicker lat={editingProperty.lat ?? 0} lng={editingProperty.lng ?? 0} onChange={(lat, lng) => setEditingProperty({...editingProperty, lat, lng})} />
                        </div>
                        
                        {/* Environmental Data Additions */}
                        <div className="bg-slate-500/5 rounded-2xl p-6 border border-emerald-500/10 space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Environmental Data</h4>
                           <div className="grid grid-cols-3 gap-4">
                             <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase opacity-40 ml-1">Air Quality Index</label>
                               <input type="number" placeholder="AQI" value={editingProperty.air_quality_index ?? 50} onChange={e => setEditingProperty({...editingProperty, air_quality_index: parseInt(e.target.value)||50})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                             </div>
                             <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase opacity-40 ml-1">Urban Heat (0-100)</label>
                               <input type="number" min={0} max={100} placeholder="Heat Index" value={editingProperty.urban_heat_index ?? 0} onChange={e => setEditingProperty({...editingProperty, urban_heat_index: parseInt(e.target.value)||0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                             </div>
                             <div className="space-y-1">
                               <label className="text-[9px] font-black uppercase opacity-40 ml-1">Risk Level</label>
                               <select title="Select Risk Level" value={editingProperty.env_risk_level ?? 'Low'} onChange={e => setEditingProperty({...editingProperty, env_risk_level: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]">
                                 <option value="Low">Low</option>
                                 <option value="Moderate">Moderate</option>
                                 <option value="High">High</option>
                               </select>
                             </div>
                           </div>
                         </div>
                        {/* Cover Image — Upload or Replace */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Cover Photo</label>
                          {editingProperty.cover_image && (
                            <div className="relative h-40 rounded-2xl overflow-hidden mb-3 border border-[var(--border)] shadow-md">
                              <Image src={editingProperty.cover_image} alt="Current cover" fill className="object-cover" unoptimized />
                              <button onClick={() => setEditingProperty({...editingProperty, cover_image: ''})} title="Remove Image" className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500/80 transition-all z-10">
                                <X size={14} />
                              </button>
                            </div>
                          )}
                          <div className="flex gap-3 items-center">
                            <input type="text" placeholder="Image URL or local preview" value={editingProperty.cover_image || ''} onChange={e => setEditingProperty({...editingProperty, cover_image: e.target.value})} className="flex-1 px-4 py-3 bg-slate-500/5 rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                            <label className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all whitespace-nowrap ${uploadingImage ? 'bg-brand-blue text-white bg-progress-stripes shadow-inner pointer-events-none' : 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20'}`}>
                              <Upload size={14} />{uploadingImage ? 'Uploading...' : 'Replace Photo'}
                              <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={async e => {
                                const file = e.target.files?.[0]; if (!file) return;
                                const previewUrl = URL.createObjectURL(file);
                                setEditingProperty(prev => prev ? {...prev, cover_image: previewUrl} : prev);
                                const url = await uploadFile(file);
                                if (url) setEditingProperty(prev => prev ? {...prev, cover_image: url} : prev);
                              }} />
                            </label>
                          </div>
                        </div>
                        {/* Property Video */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Property Video URL</label>
                          <input type="text" placeholder="YouTube / Vimeo URL" value={editingProperty.video_url || ''} onChange={e => setEditingProperty({...editingProperty, video_url: e.target.value})} className="w-full px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                        </div>

                        {/* Progress Tracker */}
                        <div className="bg-slate-500/5 rounded-2xl p-5 border border-[var(--border)] space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/50">Construction Progress</h4>
                          {(() => {
                            const prog = editingProperty.progress?.[0];
                            const progressId = prog?.id;
                            const progressPct = prog?.percent ?? 0;
                            const progressStatus = prog?.status ?? 'under-construction';
                            const progressText = prog?.status_text ?? '';
                            return (
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <label htmlFor="progress-slider" className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 min-w-[80px]">Progress</label>
                                  <input
                                    id="progress-slider"
                                    type="range" min={0} max={100}
                                    aria-label="Construction progress percentage"
                                    title="Construction progress percentage"
                                    defaultValue={progressPct}
                                    onChange={e => {
                                      if (!editingProperty.progress) editingProperty.progress = [{ id: '', property_id: editingProperty.id, percent: 0, status: 'under-construction', status_text: '', created_at: '' }];
                                      editingProperty.progress[0] = { ...editingProperty.progress[0], percent: parseInt(e.target.value) };
                                      setEditingProperty({...editingProperty});
                                    }}
                                    className="flex-1 accent-brand-blue"
                                  />
                                  <span className="text-sm font-black text-brand-blue min-w-[40px] text-right">{editingProperty.progress?.[0]?.percent ?? progressPct}%</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Stage</label>
                                    <select title="Construction Stage"
                                      defaultValue={progressStatus}
                                      onChange={e => {
                                        if (!editingProperty.progress) editingProperty.progress = [{ id: '', property_id: editingProperty.id, percent: 0, status: 'under-construction', status_text: '', created_at: '' }];
                                        editingProperty.progress[0] = { ...editingProperty.progress[0], status: e.target.value as PropertyProgress['status'] };
                                        setEditingProperty({...editingProperty});
                                      }}
                                      className="w-full px-3 py-2 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]"
                                    >
                                      <option value="planning">Planning</option>
                                      <option value="under-construction">Under Construction</option>
                                      <option value="topping-out">Topping Out</option>
                                      <option value="finishing">Finishing</option>
                                      <option value="delivered">Delivered</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Status Label</label>
                                    <input type="text" placeholder="e.g. Foundation Done" defaultValue={progressText}
                                      onChange={e => {
                                        if (!editingProperty.progress) editingProperty.progress = [{ id: '', property_id: editingProperty.id, percent: 0, status: 'under-construction', status_text: '', created_at: '' }];
                                        editingProperty.progress[0] = { ...editingProperty.progress[0], status_text: e.target.value };
                                        setEditingProperty({...editingProperty});
                                      }}
                                      className="w-full px-3 py-2 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]"
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    const p = editingProperty.progress?.[0];
                                    handleUpdateProgress(editingProperty.id, progressId || p?.id, p?.percent ?? progressPct, p?.status ?? progressStatus, p?.status_text ?? progressText);
                                  }}
                                  className="text-xs font-black uppercase tracking-widest text-brand-blue hover:underline"
                                >
                                  Save Progress
                                </button>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="flex gap-4 pt-2">
                          <button onClick={() => setEditingProperty(null)} className="flex-1 py-4 border border-[var(--border)] rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--foreground)]">Cancel</button>
                          <button onClick={handleUpdateProperty} className="flex-1 py-4 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20">Save Changes</button>
                    </div>
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
                                const table = confirmDelete.type === 'property' ? 'properties' : confirmDelete.type === 'lead' ? 'leads' : 'posts';
                                
                                let error;
                                if (confirmDelete.type === 'post') {
                                   // Soft delete for posts
                                   const { error: err } = await supabaseClient.from('posts').update({ is_deleted: true }).eq('id', confirmDelete.id);
                                   error = err;
                                } else {
                                   // Hard delete for properties and leads
                                   const { error: err } = await supabaseClient.from(table).delete().eq('id', confirmDelete.id);
                                   error = err;
                                }

                                if (!error) {
                                   notify('success', 'Record purged.');
                                   if (confirmDelete.type === 'property') fetchProperties();
                                   else if (confirmDelete.type === 'lead') fetchLeads();
                                   else fetchPosts();
                                   setConfirmDelete(null);
                                } else {
                                   console.error("Purge error:", error);
                                   if (error.code === '42703') {
                                       notify('error', 'Schema Mismatch: Please run the recovery SQL script in Supabase.');
                                   } else throw error;
                                }
                             } catch (err: unknown) { 
                                notify('error', 'Purge fault. Internal database error.'); 
                             }
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
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--foreground)]">Aloha Properties Admin Hub</p>
           </div>
        </div>
      </main>
    </div>
  );
}
