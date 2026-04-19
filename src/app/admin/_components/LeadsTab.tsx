"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Users, Plus, Edit3, Mail, Trash2, X } from "lucide-react";
import { Lead } from "@/types/admin";
import { saveLead } from "@/lib/admin-actions";

interface LeadsTabProps {
  leads: Lead[];
  loading: boolean;
  onRefresh: () => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
  onIndividualOutreach: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export function LeadsTab({ leads, loading, onRefresh, onNotify, onIndividualOutreach, onDelete }: LeadsTabProps) {
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [newLead, setNewLead] = useState<Partial<Lead>>({ name: '', email: '', phone: '', interest: '', status: 'new' });
  const [isSaving, setIsSaving] = useState(false);

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.email) return onNotify('info', 'Name and email required.');
    setIsSaving(true);
    try {
      await saveLead(newLead);
      onNotify('success', 'Lead added.');
      setIsAddingLead(false);
      setNewLead({ name: '', email: '', phone: '', interest: '', status: 'new' });
      onRefresh();
    } catch (e: any) {
      onNotify('error', `Failed to add lead: ${e.message}`);
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
    } catch (e: any) {
      onNotify('error', `Update fault: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="space-y-6"
    >
      <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[var(--foreground)]">
          <h2 className="font-heading text-xl font-black tracking-tight flex items-center gap-3">
            <Users size={20} className="text-brand-blue" />
            Captured Inquiries
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{leads.length} Records</span>
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
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Prospect</th>
                <th className="px-8 py-4">Interest</th>
                <th className="px-8 py-4">Inquiry Date</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--foreground)]">
              {loading ? (
                 <tr><td colSpan={5} className="px-8 py-12 text-center opacity-40 italic">Decrypting Database...</td></tr>
              ) : leads.map((lead) => (
                 <tr key={lead.id} className="hover:bg-brand-blue/5 transition-colors group">
                  <td className="px-8 py-5">
                     <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                       lead.status === 'qualified' ? 'bg-emerald-500/10 text-emerald-500' : 
                       lead.status === 'contacted' ? 'bg-amber-500/10 text-amber-500' : 
                       lead.status === 'closed' ? 'bg-brand-blue/10 text-brand-blue' : 
                       lead.status === 'lost' ? 'bg-red-500/10 text-red-500' : 
                       'bg-slate-500/10 text-[var(--foreground)]/60'
                     }`}>
                       {lead.status || 'new'}
                     </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm tracking-tight">{lead.name}</span>
                      <span className="text-xs opacity-40">{lead.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-brand-blue/10 text-brand-blue px-2 py-1 rounded-md">
                      {lead.interest || "General"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-medium opacity-60">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </td>
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
                         onClick={() => onIndividualOutreach(lead)} 
                         title="Individual Outreach"
                         className="text-brand-blue hover:scale-110 transition-transform bg-brand-blue/10 p-2 rounded-lg"
                        >
                         <Mail size={16} />
                        </button>
                        <button 
                         onClick={() => onDelete(lead)}
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

      {/* Edit Lead Modal */}
      {viewingLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-[var(--background)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-2xl font-heading font-black tracking-tight uppercase text-[var(--foreground)]">{viewingLead.name}</h3>
                    <p className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">{viewingLead.email} {viewingLead.phone ? `\u2022 ${viewingLead.phone}` : ''}</p>
                 </div>
                 <button onClick={() => setViewingLead(null)} className="text-[var(--foreground)]/40 hover:text-red-400"><X size={20}/></button>
              </div>
              
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Interest</label>
                       <p className="font-bold text-sm text-[var(--foreground)]">{viewingLead.interest || "General Inquiry"}</p>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Date</label>
                       <p className="font-bold text-sm text-[var(--foreground)]">{viewingLead.created_at ? new Date(viewingLead.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Lead Status</label>
                    <select 
                      value={viewingLead.status || 'new'} 
                      onChange={e => setViewingLead({...viewingLead, status: e.target.value as any})}
                      className="w-full bg-slate-500/5 px-4 py-3 rounded-xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)]"
                    >
                       <option value="new">New</option>
                       <option value="contacted">Contacted</option>
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
                       className="w-full bg-slate-500/5 px-4 py-3 rounded-xl border border-transparent focus:border-brand-blue outline-none text-sm font-medium resize-none text-[var(--foreground)]"
                    />
                 </div>

                 <button 
                    onClick={handleUpdateLead}
                    disabled={isSaving}
                    className="w-full bg-brand-blue text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg border-2 border-transparent hover:border-white/20 transition-all font-heading"
                 >
                    {isSaving ? "Saving..." : "Save Record"}
                 </button>
              </div>
           </motion.div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddingLead && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-[var(--background)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-2xl">
               <h3 className="text-2xl font-heading font-black tracking-tight mb-6 uppercase text-[var(--foreground)]">Add New Lead</h3>
               <div className="space-y-4">
                  <input type="text" placeholder="Full Name *" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)]" />
                  <input type="email" placeholder="Email Address *" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)]" />
                  <input type="tel" placeholder="Phone Number" value={newLead.phone||''} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)]" />
                  <input type="text" placeholder="Interest / Property" value={newLead.interest||''} onChange={e => setNewLead({...newLead, interest: e.target.value})} className="w-full px-6 py-4 bg-slate-500/5 rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold text-[var(--foreground)]" />
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsAddingLead(false)} className="flex-1 py-4 border border-[var(--border)] rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--foreground)]">Cancel</button>
                    <button onClick={handleAddLead} disabled={isSaving} className="flex-1 py-4 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 font-heading">
                      {isSaving ? 'Saving...' : 'Add Lead'}
                    </button>
                  </div>
               </div>
            </motion.div>
         </div>
      )}
    </motion.div>
  );
}
