"use client";

import { useState, useEffect } from "react";
import { 
  LogOut, PieChart, Mail, Home, Users, History, ShieldCheck, Activity, Lock,
  Globe, Trash2, Sun, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStatus } from "@/context/status-context";
import { useCurrency } from "@/context/currency-context";
import { supabaseClient } from "@/lib/supabase";
import { useAdminData } from "@/hooks/use-admin-data";
import { useScopedTheme } from "@/components/scoped-theme-provider";

// Modular Components
import { AnalyticsTab } from "./_components/AnalyticsTab";
import { LeadsTab } from "./_components/LeadsTab";
import { PortfolioTab } from "./_components/PortfolioTab";
import { ContentTab, MarketingTab, HistoryTab } from "./_components/ContentTabs";

// Shared Types
import { Lead, Property, Unit, AdminTab } from "@/types/admin";
import { createProperty, updateProperty } from "@/lib/admin-actions";

export default function AdminDashboard() {
  const { notify } = useStatus();
  const { formatPrice } = useCurrency();
  const { theme, toggleTheme } = useScopedTheme();
  const { 
    properties, leads, posts, history, loading, refreshAll,
    fetchLeads, fetchProperties, fetchPosts
  } = useAdminData();

  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [emailAuth, setEmailAuth] = useState("");
  const [passwordAuth, setPasswordAuth] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Tab Interaction States
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newProp, setNewProp] = useState<Partial<Property>>({ 
    name: '', location: '', developer: 'Getas Real Estate', description: '', 
    lat: 9.0192, lng: 38.7525, amenities: [], 
    cover_image: '', video_url: '', 
    discount_percentage: 0, downpayment_percentage: 0, 
    payment_schedule: 'Flexible Terms', air_quality_index: 50,
    urban_heat_index: 0, env_risk_level: 'Low'
  });
  const [newUnit, setNewUnit] = useState<Partial<Unit>>({ 
    unit_number: '', floor_number: 1, status: 'available', price: 0, notes: ''
  });
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'property' | 'post' | 'lead' | 'unit' | 'unitType', id: string, name: string } | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [draftCampaign, setDraftCampaign] = useState<{ subject: string; body: string; targetFilter: string } | null>(null);

  const openMarketingWithDraft = (draft: { subject: string; body: string; targetFilter: string }) => {
    setDraftCampaign(draft);
    setActiveTab('marketing');
  };

  // Stats Logic
  const stats = (() => {
    const totalLeads = leads.length;
    const activeProperties = properties.length;
    const campaignReach = history.reduce((a, b) => a + b.audience_size, 0);
    
    // Growth calculation
    const now = new Date();
    const lastWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const recent = leads.filter(l => l.created_at && new Date(l.created_at).getTime() > lastWeek.getTime()).length;
    const prevWeek = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    const archive = leads.filter(l => {
      if (!l.created_at) return false;
      const d = new Date(l.created_at).getTime();
      return d > prevWeek.getTime() && d <= lastWeek.getTime();
    }).length;
    const growthVal = archive > 0 ? ((recent - archive) / archive) * 100 : (recent > 0 ? 100 : 0);
    const growth = (growthVal >= 0 ? '+' : '') + growthVal.toFixed(1) + '%';
    
    return { totalLeads, activeProperties, campaignReach, growth };
  })();

  // Auth Effect
  useEffect(() => {
    const checkSession = async () => {
      setIsVerifying(true);
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        setIsAuthorized(true);
        refreshAll();
      }
      setIsVerifying(false);
    };

    checkSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        setIsAuthorized(true);
        refreshAll();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthorized(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [refreshAll]);

  const handleLogin = async () => {
    setIsVerifying(true);
    const { error } = await supabaseClient.auth.signInWithPassword({ email: emailAuth, password: passwordAuth });
    if (error) notify('error', error.message);
    else notify('success', "Administrative access granted.");
    setIsVerifying(false);
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    notify('info', "Session terminated.");
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      let table = '';
      if (confirmDelete.type === 'property') table = 'properties';
      else if (confirmDelete.type === 'lead') table = 'leads';
      else if (confirmDelete.type === 'post') table = 'posts';
      else if (confirmDelete.type === 'unit') table = 'property_units';
      else if (confirmDelete.type === 'unitType') table = 'property_unit_types';

      if (!table) throw new Error("Invalid resource type for deletion.");

      const { error } = await supabaseClient.from(table).delete().eq('id', confirmDelete.id);
      if (error) throw error;
      
      notify('success', `Resource deleted: ${confirmDelete.name}`);
      refreshAll();
    } catch (err: unknown) {
      notify('error', `Deletion error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setConfirmDelete(null);
    }
  };

  const syncNews = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success) {
        notify('success', `Intelligence Desk Synchronized: ${data.posted} new articles.`);
        fetchPosts();
      }
    } catch { notify('error', 'Sync operational failure.'); }
    finally { setSyncing(false); }
  };

  if (isVerifying) return <div className="h-screen bg-[var(--background)] flex items-center justify-center"><Activity className="animate-spin text-brand-blue" /></div>;

  if (!isAuthorized) {
    return (
      <div className="h-screen bg-[var(--background)] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--brand-blue-alpha)_0%,_transparent_70%)]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-[var(--card)] rounded-[3rem] border border-[var(--border)] p-12 shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="text-center space-y-2 relative z-10">
              <div className="w-20 h-20 bg-brand-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-brand-blue shadow-xl shadow-brand-blue/10"><Lock size={40} /></div>
              <h1 className="text-3xl font-heading font-black tracking-tighter uppercase">Admin <span className="opacity-30 italic">Login.</span></h1>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Identity Authentication Pending...</p>
           </div>
           <div className="space-y-4 relative z-10">
              <input type="email" placeholder="ADMIN EMAIL" value={emailAuth} onChange={e => setEmailAuth(e.target.value)} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-xs font-black uppercase tracking-widest outline-none border border-[var(--border)] focus:border-brand-blue transition-all" />
              <input type="password" placeholder="SECURITY KEY" value={passwordAuth} onChange={e => setPasswordAuth(e.target.value)} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-xs font-black uppercase tracking-widest outline-none border border-[var(--border)] focus:border-brand-blue transition-all" />
              <button onClick={handleLogin} className="w-full py-6 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all">Sign In</button>
           </div>
           <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl" />
        </motion.div>
      </div>
    );
  }

  const tabs: AdminTab[] = [
    { id: 'overview', icon: PieChart, label: 'Analytics' },
    { id: 'portfolio', icon: Home, label: 'Portfolio' },
    { id: 'marketing', icon: Mail, label: 'Marketing' },
    { id: 'content', icon: Globe, label: 'Content' },
    { id: 'leads', icon: Users, label: 'Leads' },
    { id: 'history', icon: History, label: 'History' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      {/* Sidebar */}
      <div className="w-80 h-screen sticky top-0 bg-[var(--card)] border-r border-[var(--border)] flex flex-col p-8 space-y-12 shadow-2xl z-50">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-blue/20"><ShieldCheck size={28} /></div>
            <div>
               <h1 className="font-heading font-black text-xl tracking-tighter">ALOHA <span className="opacity-30 italic">HQ.</span></h1>
               <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">Command Center v6</span>
            </div>
         </div>

         <nav className="flex-1 space-y-2">
            {tabs.map(tab => (
               <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-foreground/40 hover:bg-slate-500/5 hover:text-foreground'}`}
               >
                 <tab.icon size={18} /> {tab.label}
               </button>
            ))}
         </nav>

         <div className="pt-4 border-t border-[var(--border)] space-y-2">
            <button 
               onClick={toggleTheme}
               className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:bg-slate-500/5 hover:text-foreground transition-all"
            >
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
               {theme === 'dark' ? 'Day Mode' : 'Night Mode'}
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/5 rounded-2xl transition-all">
               <LogOut size={18} /> Sign Out
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-12 overflow-y-auto">
         <AnimatePresence mode="wait">
            {activeTab === 'overview' && <AnalyticsTab key="analytics" stats={stats} />}
            {activeTab === 'portfolio' && (
              <PortfolioTab 
                key="portfolio"
                properties={properties}
                loading={loading}
                isAddingProperty={isAddingProperty}
                setIsAddingProperty={setIsAddingProperty}
                newProp={newProp}
                setNewProp={setNewProp}
                newUnit={newUnit}
                setNewUnit={setNewUnit}
                uploadingImage={false}
                uploadFile={async () => null}
                handleCreateProperty={async () => {
                   try {
                     await createProperty(newProp);
                     notify('success', 'Asset Successfully Deployed to Registry.');
                     setIsAddingProperty(false);
                     refreshAll();
                   } catch (e: unknown) {
                     notify('error', e instanceof Error ? e.message : 'Deployment Fault');
                   }
                }}
                handleUpdateProperty={async () => {
                   if (!editingProperty) return;
                   try {
                     await updateProperty(editingProperty.id, editingProperty);
                     notify('success', 'Asset Parameters Synchronized.');
                     setEditingProperty(null);
                     refreshAll();
                   } catch (e: unknown) {
                     notify('error', e instanceof Error ? e.message : 'Sync Fault');
                   }
                }}
                setEditingProperty={setEditingProperty}
                setConfirmDelete={setConfirmDelete}
                togglePropertyUnits={(id: string) => {
                   const next = new Set(expandedProperties);
                   if (next.has(id)) next.delete(id);
                   else next.add(id);
                   setExpandedProperties(next);
                }}
                expandedProperties={expandedProperties}
                formatPrice={formatPrice}
                setEditingUnit={setEditingUnit}
                setSelectedPropertyId={setSelectedPropertyId}
                selectedPropertyId={selectedPropertyId}
                editingUnit={editingUnit}
                fetchProperties={fetchProperties}
                notify={notify}
                editingProperty={editingProperty}
              />
            )}
            {activeTab === 'marketing' && <MarketingTab key={draftCampaign ? `marketing-${Date.now()}` : 'marketing'} onNotify={notify} onRefreshLeads={fetchLeads} initialDraft={draftCampaign} onDraftConsumed={() => setDraftCampaign(null)} />}
            {activeTab === 'content' && (
              <ContentTab 
                key="content"
                posts={posts} 
                loading={loading} 
                syncing={syncing} 
                onSync={syncNews} 
                onRefresh={fetchPosts}
                onNotify={notify} 
                setConfirmDelete={setConfirmDelete} 
              />
            )}
            {activeTab === 'leads' && (
              <LeadsTab 
                key="leads"
                leads={leads} 
                loading={loading} 
                onRefresh={fetchLeads}
                onNotify={notify}
                setViewingLead={setViewingLead} 
                setSelectedLead={setSelectedLead} 
                setConfirmDelete={setConfirmDelete} 
                viewingLead={viewingLead}
                selectedLead={selectedLead}
              />
            )}
            {activeTab === 'history' && <HistoryTab key="history" history={history} loading={loading} onRepeatCampaign={openMarketingWithDraft} />}
         </AnimatePresence>
      </main>

      {/* Shared Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[var(--card)] rounded-[3rem] border-2 border-red-500/30 p-12 max-w-md w-full text-center space-y-8 shadow-[0_0_100px_rgba(239,68,68,0.15)]">
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-red-500/5"><Trash2 size={40} /></div>
                <div className="space-y-3">
                   <h3 className="text-3xl font-heading font-black tracking-tighter uppercase">Confirm Deletion</h3>
                   <p className="text-xs font-bold opacity-40 uppercase tracking-widest leading-relaxed">Are you certain you wish to delete <span className="text-[var(--foreground)]">{confirmDelete.name}</span> from the database?</p>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setConfirmDelete(null)} className="flex-1 py-5 border border-[var(--border)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-500/10 transition-all">Cancel</button>
                   <button onClick={handleDelete} className="flex-1 py-5 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-[1.05] active:scale-95 transition-all">Delete Forever</button>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
