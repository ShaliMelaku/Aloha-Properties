"use client";

import { useState, useEffect } from "react";
import { 
  LogOut, PieChart, Mail, Home, Users, Edit3, History, ShieldCheck, Activity, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStatus } from "@/context/status-context";
import { supabaseClient } from "@/lib/supabase";
import { useAdminData } from "@/hooks/use-admin-data";
import { AnalyticsTab } from "./_components/AnalyticsTab";
import { LeadsTab } from "./_components/LeadsTab";
import { PortfolioTab } from "./_components/PortfolioTab";
import { ContentTab, MarketingTab, HistoryTab } from "./_components/ContentTabs";
import { AdminTab, Lead, Property, Post } from "@/types/admin";

export default function AdminDashboard() {
  const { notify } = useStatus();
  const { 
    properties, leads, posts, history, loading, error, refreshAll, 
    fetchLeads, fetchProperties, fetchPosts 
  } = useAdminData();

  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [emailAuth, setEmailAuth] = useState("");
  const [passwordAuth, setPasswordAuth] = useState("");
  const [syncing, setSyncing] = useState(false);

  // 1. Session Management (STABLE)
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

  // 2. Auth Handlers
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

  // 3. Global Sync Handler (STABLE)
  const syncNews = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success) {
        if (data.posted > 0) notify('success', `News Desk Synchronized: ${data.posted} new articles.`);
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

  const tabs: AdminTab[] = [
    { id: "overview", icon: PieChart, label: "Analytics" },
    { id: "broadcast", icon: Mail, label: "Marketing" },
    { id: "portfolio", icon: Home, label: "Portfolio" },
    { id: "leads", icon: Users, label: "Leads" },
    { id: "blog", icon: Edit3, label: "Market Trends" },
    { id: "history", icon: History, label: "History" }
  ];

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden transition-colors duration-500">
      <aside className="w-72 bg-luxury-charcoal dark:bg-black border-r border-white/5 flex flex-col hidden lg:flex relative z-20">
        <div className="p-8 pb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white"><ShieldCheck size={20} /></div>
             <span className="font-heading font-black text-xl text-white tracking-tighter uppercase">ALOHA.</span>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {tabs.map((item) => (
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
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-red-400 hover:bg-red-400/10 rounded-2xl font-bold transition-all">
            <LogOut size={18} />Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 md:p-12 relative bg-slate-500/5 noise-bg">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex justify-between items-end">
             <div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mb-4"><div className="w-8 h-px bg-brand-blue" /><span className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue">{activeTab.toUpperCase()} PROTOCOL</span></motion.div>
                <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter uppercase text-[var(--foreground)]">{activeTab} <span className="opacity-30 italic">Studio.</span></h1>
             </div>
             <div className="hidden md:flex gap-4">
                <div className="flex items-center gap-2 bg-[var(--card)] px-4 py-2 rounded-xl border border-[var(--border)] shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-[var(--foreground)]">{loading ? 'Syncing...' : 'System Ready'}</span>
                </div>
             </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <AnalyticsTab 
                stats={{ 
                  totalLeads: leads.length, 
                  activeProperties: properties.length, 
                  campaignReach: history.reduce((acc, curr) => acc + curr.audience_size, 0),
                  growth: '+10%' 
                }} 
              />
            )}
            {activeTab === "leads" && (
              <LeadsTab 
                leads={leads} 
                loading={loading} 
                onRefresh={fetchLeads} 
                onNotify={notify}
                onIndividualOutreach={(lead) => console.log('Outreach to', lead)}
                onDelete={(lead) => console.log('Delete', lead)}
              />
            )}
            {activeTab === "portfolio" && (
              <PortfolioTab 
                properties={properties} 
                loading={loading} 
                onRefresh={fetchProperties} 
                onNotify={notify}
                onEdit={(p) => console.log('Edit', p)}
                onDelete={(p) => console.log('Delete', p)}
                onManageUnits={(id) => console.log('Manage', id)}
              />
            )}
            {activeTab === "blog" && (
              <ContentTab 
                posts={posts} 
                loading={loading} 
                syncing={syncing} 
                onSync={syncNews} 
                onAdd={() => {}} 
                onEdit={() => {}} 
                onDelete={() => {}} 
              />
            )}
            {activeTab === "broadcast" && <MarketingTab onNotify={notify} />}
            {activeTab === "history" && <HistoryTab history={history} loading={loading} />}
          </AnimatePresence>

          <div className="text-center opacity-20 py-8 border-t border-[var(--border)]">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--foreground)]">Aloha Properties Admin Hub</p>
          </div>
        </div>
      </main>
    </div>
  );
}
