"use client";

import { useState } from "react";
import { 
  Users, Mail, Phone, Calendar, Search, 
  Download, Filter, Trash2, Eye, Activity,
  Database, UserCheck, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Lead } from "@/types/admin";

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
  leads, loading, onRefresh, onNotify, 
  setViewingLead, setSelectedLead, setConfirmDelete, 
  viewingLead, selectedLead
}: LeadsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    onNotify('info', 'Compiling lead manifest for export...');
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Name,Email,Phone,Interest,Status\n" + 
        leads.map(l => `${l.name},${l.email},${l.phone || ''},${l.interest || ''},${l.status || 'new'}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Aloha_Prospects_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      onNotify('success', 'Lead Registry exported to CSV.');
    }, 1000);
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Activity className="animate-spin text-brand-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter uppercase">Prospect <span className="opacity-30 italic">Registry.</span></h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Monitoring {leads.length} high-intent investor nodes.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
              <input 
                type="text" 
                placeholder="Search Nodes..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-[var(--card)] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[var(--border)] focus:border-brand-blue outline-none transition-all" 
              />
           </div>
           <button onClick={handleExportCSV} className="flex items-center gap-3 px-6 py-4 bg-emerald-500/10 text-emerald-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/10">
             <Download size={16} /> Export CSV
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Total Nodes', value: leads.length, icon: Database, color: 'brand-blue' },
           { label: 'Qualified', value: leads.filter(l => l.status === 'qualified').length, icon: UserCheck, color: 'emerald-500' },
           { label: 'Urgent', value: leads.filter(l => l.status === 'new').length, icon: ShieldAlert, color: 'red-400' }
         ].map((stat, i) => (
           <div key={i} className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl bg-${stat.color}/10 flex items-center justify-center text-${stat.color}`}><stat.icon size={28} /></div>
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                 <p className="text-2xl font-heading font-black">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm">
        <table className="w-full text-left">
           <thead>
              <tr className="border-b border-[var(--border)] bg-slate-500/5">
                 <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Investor Node</th>
                 <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Status</th>
                 <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40">Interest Layer</th>
                 <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-[var(--border)]">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-brand-blue/5 transition-all group">
                   <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center font-black text-xs text-[var(--foreground)]">{lead.name.charAt(0)}</div>
                         <div>
                            <p className="text-sm font-bold leading-tight">{lead.name}</p>
                            <p className="text-[10px] font-bold opacity-40">{lead.email}</p>
                         </div>
                      </div>
                   </td>
                   <td className="px-8 py-6">
                      <div className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        lead.status === 'qualified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        lead.status === 'contacted' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' :
                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                         {lead.status || 'New Node'}
                      </div>
                   </td>
                   <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-60">
                      {lead.interest || 'Undetermined'}
                   </td>
                   <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                         <button onClick={() => setViewingLead(lead)} className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-foreground opacity-40 hover:opacity-100 hover:border-brand-blue hover:text-brand-blue transition-all"><Eye size={14} /></button>
                         <button onClick={() => setConfirmDelete({ type: 'lead', id: lead.id!, name: lead.name })} className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                      </div>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
      </div>
    </motion.div>
  );
}
