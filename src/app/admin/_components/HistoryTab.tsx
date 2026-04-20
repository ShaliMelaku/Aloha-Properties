"use client";

import { motion } from "framer-motion";
import { History, Activity, Calendar, Users, ExternalLink, ShieldCheck } from "lucide-react";
import { Campaign } from "@/types/admin";

interface HistoryTabProps {
  campaignHistory: Campaign[];
}

export function HistoryTab({ campaignHistory }: HistoryTabProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-10"
    >
      {/* History Control Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h2 className="text-4xl font-heading font-black tracking-tighter uppercase text-[var(--foreground)]">
            Ops <span className="opacity-30 italic">Logbox.</span>
          </h2>
          <p className="text-xs font-bold opacity-40 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <History size={14} className="text-brand-blue" /> Campaign Execution Archive
          </p>
        </div>
        <div className="px-8 py-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-emerald-500/5">
           <ShieldCheck size={18} /> All Signatures Verified
        </div>
      </div>

      <div className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-500/5 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-[var(--foreground)] border-b border-[var(--border)]">
                <th className="px-12 py-8 italic font-heading">Temporal Node</th>
                <th className="px-12 py-8 italic font-heading">Mission Subject</th>
                <th className="px-12 py-8 italic font-heading text-right">Target Density</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {campaignHistory.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-12 py-24 text-center">
                    <div className="w-20 h-20 bg-[var(--background)] rounded-3xl mx-auto flex items-center justify-center text-[var(--foreground)] opacity-20 mb-6"><History size={40} /></div>
                    <p className="text-xs font-black uppercase tracking-[0.4em] opacity-30 italic">Historical Logs Purged. Awaiting Signal Broadcast.</p>
                  </td>
                </tr>
              ) : campaignHistory.map((camp) => (
                <tr key={camp.id} className="group hover:bg-brand-blue/[0.02] transition-colors">
                  <td className="px-12 py-10 font-mono">
                     <div className="flex items-center gap-3 text-[var(--foreground)] opacity-60">
                        <Calendar size={14} className="text-brand-blue opacity-100" />
                        <span className="text-xs font-bold tracking-tight">
                          {new Date(camp.created_at).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                     </div>
                  </td>
                  <td className="px-12 py-10">
                     <div className="flex flex-col gap-1">
                        <h4 className="font-heading font-black text-lg text-[var(--foreground)] tracking-tight group-hover:text-brand-blue transition-colors">
                          {camp.subject}
                        </h4>
                        <div className="flex items-center gap-2 opacity-30">
                          <Activity size={10} />
                          <span className="text-[9px] font-black uppercase tracking-widest italic">Global Transmission Protocol Verified</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-12 py-10 text-right">
                     <div className="inline-flex flex-col items-end gap-1">
                        <div className="flex items-center gap-3 text-brand-blue font-black text-xl tracking-tighter">
                          {camp.audience_size.toLocaleString()}
                          <Users size={18} />
                        </div>
                        <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Leads Notified</span>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="p-8 rounded-[2.5rem] bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-between group cursor-pointer hover:bg-brand-blue/10 transition-all">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
               <Activity size={24} />
            </div>
            <div>
               <h4 className="font-heading font-black text-xl tracking-tight text-[var(--foreground)]">Extended Analytics Archive</h4>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Deploy deeper query exploration into legacy mission data</p>
            </div>
         </div>
         <ExternalLink size={24} className="text-brand-blue opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all" />
      </div>
    </motion.div>
  );
}
