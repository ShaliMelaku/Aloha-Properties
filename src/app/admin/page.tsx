"use client";

import { useState, useEffect } from "react";
import { 
  LogOut, PieChart, Mail, Home, Users, ShieldCheck, Activity, Lock,
  Globe, Trash2, Sun, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStatus } from "@/context/status-context";
import { useCurrency } from "@/context/currency-context";
import { supabaseClient } from "@/lib/supabase";
import { useAdminData } from "@/hooks/use-admin-data";
import { useScopedTheme } from "@/components/scoped-theme-provider";
import { Handshake } from "lucide-react";
import { PartnersTab } from "./_components/PartnersTab";

// Modular Components
import { AnalyticsTab } from "./_components/AnalyticsTab";
import { LeadsTab } from "./_components/LeadsTab";
import { PortfolioTab } from "./_components/PortfolioTab";
import { ContentTab, MarketingTab } from "./_components/ContentTabs";

// Shared Types
import { Lead, Property, Unit, AdminTab } from "@/types/admin";
import { createProperty, updateProperty } from "@/lib/admin-actions";

export default function AdminDashboard() {
  const { notify } = useStatus();
  const { formatPrice } = useCurrency();
  const { theme, toggleTheme } = useScopedTheme();
  const { 
    properties, leads, posts, history, responses, loading, refreshAll,
    fetchLeads, fetchProperties, fetchPosts, fetchResponses
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
    discount_rules: [], 
    pdf_brochure_url: '',
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

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `admin-uploads/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('property-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseClient.storage
        .from('property-assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: unknown) {
      notify('error', `Upload failed: ${err instanceof Error ? err.message : 'Unknown'}`);
      return null;
    }
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
    { id: 'partners', icon: Handshake, label: 'Partners' },
    { id: 'content', icon: Globe, label: 'Content' },
    { id: 'leads', icon: Users, label: 'Leads' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      {/* Sidebar */}
      <div className="w-80 h-screen sticky top-0 bg-[var(--card)] border-r border-[var(--border)] flex flex-col p-8 shadow-2xl z-50 transition-all duration-300">
         <div className="flex items-center gap-4 group cursor-pointer transition-all hover:scale-105 active:scale-95 mb-10" onClick={() => setActiveTab('overview')}>
            <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-brand-blue/30 group-hover:rotate-12 transition-transform ring-4 ring-brand-blue/10"><ShieldCheck size={28} /></div>
            <div>
               <h1 className="font-heading font-black text-xl tracking-tighter">ALOHA <span className="opacity-30 italic">HQ.</span></h1>
               <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[7px] font-black uppercase tracking-[0.4em] text-emerald-500/60">SYSTEM ACTIVE</span>
               </div>
            </div>
         </div>

         <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar mb-8">
            {tabs.map(tab => (
               <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative group overflow-hidden ${activeTab === tab.id ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-[var(--foreground)] opacity-40 hover:opacity-100 hover:bg-slate-500/5'}`}
               >
                 <tab.icon size={18} className={activeTab === tab.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100 transition-opacity'} />
                 <span className="relative z-10">{tab.label}</span>
                 {activeTab === tab.id && (
                    <motion.div layoutId="activePill" className="absolute left-0 w-1 h-6 bg-white rounded-full" />
                 )}
               </button>
            ))}
         </nav>

         <div className="pt-6 border-t border-[var(--border)] space-y-2 shrink-0">
            <button 
               onClick={toggleTheme}
               className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-slate-500/5 transition-all"
            >
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
               {theme === 'dark' ? 'Day Mode' : 'Night Mode'}
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-red-500 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-red-500/5 rounded-2xl transition-all">
               <LogOut size={18} /> Sign Out
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
         <AnimatePresence mode="wait">
            {activeTab === 'overview' && <AnalyticsTab key="analytics" />}
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
                uploadFile={uploadFile}
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
            {activeTab === 'marketing' && (
              <MarketingTab 
                key={draftCampaign ? `marketing-${Date.now()}` : 'marketing'} 
                onNotify={notify} 
                onRefreshLeads={fetchLeads} 
                initialDraft={draftCampaign} 
                onDraftConsumed={() => setDraftCampaign(null)} 
                history={history}
                responses={responses}
                loading={loading}
                onRepeatCampaign={openMarketingWithDraft}
                onRefreshResponses={fetchResponses}
              />
            )}
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
            {activeTab === 'partners' && <PartnersTab key="partners" notify={notify} uploadFile={uploadFile} />}
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
