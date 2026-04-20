"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit3, Mail, Trash2, X, Search, Filter, Activity, Download } from "lucide-react";
import { Lead } from "@/types/admin";
import { saveLead } from "@/lib/admin-actions";

interface LeadsTabProps {
  leads: Lead[];
  loading: boolean;
  onRefresh: () => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
  setViewingLead: (l: Lead | null) => void;
  setSelectedLead: (l: Lead | null) => void;
  setConfirmDelete: (v: { type: 'property' | 'post' | 'lead' | 'unit', id: string, name: string } | null) => void;
  viewingLead: Lead | null;
  selectedLead: Lead | null;
}

export function LeadsTab({ 
  leads, 
  loading, 
  onRefresh, 
  onNotify, 
  setViewingLead, 
  setSelectedLead, 
  setConfirmDelete,
  viewingLead
}: LeadsTabProps) {
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [newLead, setNewLead] = useState<Partial<Lead>>({ name: '', email: '', phone: '', interest: '', status: 'new' });
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.email) return onNotify('info', 'Name and email required.');
    setIsSaving(true);
    try {
      await saveLead(newLead);
      onNotify('success', 'Lead added.');
      setIsAddingLead(false);
      setNewLead({ name: '', email: '', phone: '', interest: '', status: 'new' });
      onRefresh();
    } catch (e: unknown) {
      onNotify('error', `Failed to add lead: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateLead = async () => {
    if (!viewingLead) return;
    setIsSaving(true);
    try {
      await saveLead(viewingLead);
      onNotify('success', 'Lead record updated.');
      setViewingLead(null);
      onRefresh();
    } catch (e: unknown) {
      onNotify('error', `Update fault: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Interest", "Status", "Created At"];
    const rows = filteredLeads.map(l => [
      l.name, l.email, l.phone || "", l.interest || "", l.status || "new", l.created_at || ""
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `aloha_leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('success', 'Lead registry exported to CSV.');
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.interest?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="space-y-8"
    >
      {/* Search & Intelligence Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="relative w-full md:w-96 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--foreground)] opacity-20 group-focus-within:text-brand-blue group-focus-within:opacity-100 transition-all" size={18} />
            <input 
              type="text" 
              placeholder="SEARCH LEAD REGISTRY..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-8 py-5 bg-[var(--card)] rounded-2xl border border-[var(--border)] focus:border-brand-blue/50 outline-none font-black text-[10px] uppercase tracking-widest text-[var(--foreground)] shadow-xl transition-all"
            />
         </div>
         <div className="flex gap-4">
            <button 
                onClick={handleExportCSV}
                title="Export Lead Registry to CSV" 
                className="px-6 py-4 bg-[var(--card)] rounded-xl border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 hover:text-brand-blue hover:border-brand-blue/30 transition-all flex items-center gap-2"
            >
               <Download size={16} /> Export CSV
            </button>
            <button title="Filter Records" className="px-6 py-4 bg-[var(--card)] rounded-xl border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 hover:text-[var(--foreground)] hover:border-brand-blue/30 transition-all flex items-center gap-2">
               <Filter size={16} /> Advanced Filters
            </button>
            <button
               onClick={() => setIsAddingLead(true)}
               title="Add New Prospect Instance"
               className="bg-brand-blue text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-blue/20 flex items-center gap-2"
            >
               <Plus size={16} /> Add New Prospect
            </button>
         </div>
      </div>

      <div className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-500/5 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-[var(--foreground)] border-b border-[var(--border)]">
                <th className="px-10 py-8 italic">Origin/Node</th>
                <th className="px-10 py-8 italic">Intent/Interest</th>
                <th className="px-10 py-8 italic">Captured at</th>
                <th className="px-10 py-8 italic text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={4} className="px-10 py-20 text-center text-xs font-bold opacity-30 italic uppercase tracking-widest">Decrypting Lead Manifest...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={4} className="px-10 py-20 text-center text-xs font-bold opacity-30 italic uppercase tracking-widest">Registry Empty — Awaiting Initial Traffic</td></tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-brand-blue/[0.02] transition-colors">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-black italic shadow-inner group-hover:scale-110 transition-transform">
                           {lead.name.charAt(0)}
                        </div>
                        <div>
                           <p className="font-heading font-black text-lg text-[var(--foreground)] tracking-tight">{lead.name}</p>
                           <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{lead.email}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <p className="font-bold text-xs text-[var(--foreground)]/80">{lead.interest || 'General Inquiry'}</p>
                     <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue opacity-50 mt-1">Platform Direct</p>
                  </td>
                  <td className="px-10 py-8">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                     </p>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => setViewingLead(lead)} title="Open CRM Records" className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] hover:border-brand-blue text-[9px] font-black uppercase tracking-widest text-[var(--foreground)] rounded-lg transition-all">CRM Records</button>
                        <button title="Direct Outreach" onClick={() => setSelectedLead(lead)} className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-all"><Mail size={16}/></button>
                        <button title="Delete Lead" onClick={() => setConfirmDelete({ type: 'lead', id: lead.id!, name: lead.name })} className="p-2 bg-red-400/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                     </div>
                     <div className="group-hover:hidden transition-all text-right">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                          (lead.status || 'new') === 'new' ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' : 
                          (lead.status === 'closed') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                          'bg-slate-500/5 text-[var(--foreground)]/40 border border-[var(--border)]'
                        }`}>
                           {lead.status || 'NEW ARRIVAL'}
                        </span>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {viewingLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-[var(--card)] rounded-[3rem] border border-[var(--border)] p-12 shadow-2xl">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h3 className="text-3xl font-heading font-black tracking-tighter uppercase text-[var(--foreground)]">{viewingLead.name}</h3>
                      <p className="text-xs font-bold opacity-40 uppercase tracking-widest text-brand-blue">{viewingLead.email} {viewingLead.phone ? `\u2022 ${viewingLead.phone}` : ''}</p>
                   </div>
                    <button onClick={() => setViewingLead(null)} title="Close Selection" className="p-2 rounded-xl bg-slate-500/10 text-[var(--foreground)]/40 hover:text-red-400 transition-colors"><X size={20}/></button>
                </div>
                
                <div className="space-y-8">
                   <div className="grid grid-cols-2 gap-8">
                      <div className="bg-slate-500/5 p-4 rounded-2xl border border-[var(--border)]">
                         <label className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1">Intent/Interest</label>
                         <p className="font-bold text-sm text-[var(--foreground)]">{viewingLead.interest || "General Inquiry"}</p>
                      </div>
                      <div className="bg-slate-500/5 p-4 rounded-2xl border border-[var(--border)]">
                         <label className="text-[9px] font-black uppercase tracking-widest opacity-40 block mb-1">Captured date</label>
                         <p className="font-bold text-sm text-[var(--foreground)]">{viewingLead.created_at ? new Date(viewingLead.created_at).toLocaleDateString() : 'N/A'}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Lead Lifecycle Status</label>
                      <select 
                        title="Lifecycle Status"
                        value={viewingLead.status || 'new'} 
                        onChange={e => setViewingLead({...viewingLead, status: e.target.value as Lead['status']})}
                        className="w-full bg-[var(--background)] px-6 py-4 rounded-2xl border border-[var(--border)] focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)] appearance-none cursor-pointer hover:bg-slate-500/5 transition-all outline-none"
                      >
                         <option value="new" title="New Inquiry">New Inquiry</option>
                         <option value="contacted" title="Phase: Contacted">Phase: Contacted</option>
                         <option value="qualified" title="Qualified Asset Lead">Qualified Asset Lead</option>
                         <option value="closed" title="Conversion: Closed/Won">Conversion: Closed/Won</option>
                         <option value="lost" title="Lost/Terminated">Lost/Terminated</option>
                      </select>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Internal Intelligence (Notes)</label>
                      <textarea 
                        rows={5} 
                        title="Intelligence Notes"
                        placeholder="Add internal intelligence about this prospect..."
                        value={viewingLead.notes || ''} 
                        onChange={e => setViewingLead({...viewingLead, notes: e.target.value})}
                        className="w-full bg-[var(--background)] px-8 py-6 rounded-[2rem] border border-[var(--border)] focus:border-brand-blue outline-none text-sm font-medium resize-none text-[var(--foreground)] leading-relaxed"
                      />
                   </div>

                   <button 
                      onClick={handleUpdateLead}
                      disabled={isSaving}
                      title="Sync Record to Database"
                      className="w-full bg-brand-blue text-white font-black text-xs uppercase tracking-[0.4em] py-6 rounded-[2rem] shadow-2xl shadow-brand-blue/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                      {isSaving ? <Activity className="animate-spin" /> : "Authorize Record Sync"}
                   </button>
                </div>
             </motion.div>
          </div>
        )}

        {isAddingLead && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-[var(--card)] rounded-[3rem] border border-[var(--border)] p-12 shadow-2xl">
                 <h3 className="text-3xl font-heading font-black tracking-tighter mb-8 uppercase text-[var(--foreground)]">Manual Prospect Injection</h3>
                 <div className="space-y-5">
                    <input title="Full Name" type="text" placeholder="FULL NAME *" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full px-8 py-5 bg-[var(--background)] rounded-2xl border border-[var(--border)] focus:border-brand-blue outline-none text-xs font-black uppercase tracking-widest text-[var(--foreground)]" />
                    <input title="Email Address" type="email" placeholder="EMAIL ADDRESS *" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} className="w-full px-8 py-5 bg-[var(--background)] rounded-2xl border border-[var(--border)] focus:border-brand-blue outline-none text-xs font-black uppercase tracking-widest text-[var(--foreground)]" />
                    <input title="Phone Number" type="tel" placeholder="PHONE (OPTIONAL)" value={newLead.phone||''} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full px-8 py-5 bg-[var(--background)] rounded-2xl border border-[var(--border)] focus:border-brand-blue outline-none text-xs font-black uppercase tracking-widest text-[var(--foreground)]" />
                    <input title="Primary Interest" type="text" placeholder="PRIMARY INTEREST" value={newLead.interest||''} onChange={e => setNewLead({...newLead, interest: e.target.value})} className="w-full px-8 py-5 bg-[var(--background)] rounded-2xl border border-[var(--border)] focus:border-brand-blue outline-none text-xs font-black uppercase tracking-widest text-[var(--foreground)]" />
                    
                    <div className="flex gap-4 pt-4">
                      <button onClick={() => setIsAddingLead(false)} title="Cancel Injection" className="flex-1 py-5 border border-[var(--border)] rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-all">Cancel</button>
                      <button onClick={handleAddLead} title="Confirm Prospect Injection" disabled={isSaving} className="flex-1 py-5 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all">
                        {isSaving ? <Activity className="animate-spin mx-auto" /> : 'Confirm Injection'}
                      </button>
                    </div>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
