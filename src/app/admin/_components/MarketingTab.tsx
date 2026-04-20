"use client";

import { motion } from "framer-motion";
import { 
  Mail, Send, Upload, FileSpreadsheet, CheckCircle2, 
  UserPlus, Activity, Info, Users
} from "lucide-react";
import { Lead } from "@/types/admin";

interface MarketingTabProps {
  broadcastLeads: Lead[];
  selectedLeadsIndices: Set<number>;
  subject: string;
  htmlBody: string;
  manualEmails: string;
  sending: boolean;
  setSubject: (v: string) => void;
  setHtmlBody: (v: string) => void;
  setManualEmails: (v: string) => void;
  toggleLeadSelection: (idx: number) => void;
  setBroadcastLeads: (ls: Lead[]) => void;
  setSelectedLeadsIndices: (indices: Set<number>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBroadcast: () => void;
}

export function MarketingTab({
  broadcastLeads,
  selectedLeadsIndices,
  subject,
  htmlBody,
  manualEmails,
  sending,
  setSubject,
  setHtmlBody,
  setManualEmails,
  toggleLeadSelection,
  setBroadcastLeads,
  setSelectedLeadsIndices,
  handleFileUpload,
  handleBroadcast
}: MarketingTabProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 xl:grid-cols-5 gap-8"
    >
      {/* 01. Audience Selection Section */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <UserPlus size={100} className="text-brand-blue" />
          </div>
          <h2 className="font-heading text-2xl font-black tracking-tight mb-10 flex items-center gap-4 text-[var(--foreground)] relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <FileSpreadsheet size={24} />
            </div>
            Registry <span className="opacity-30 italic">Sync.</span>
          </h2>
          
          <div className="relative z-10">
            {broadcastLeads.length === 0 ? (
              <div className="relative group">
                <div className="border-2 border-dashed border-brand-blue/30 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center bg-brand-blue/5 hover:bg-brand-blue/10 hover:border-brand-blue transition-all cursor-pointer">
                  <input 
                    title="Manifest Upload"
                    type="file" 
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="w-20 h-20 rounded-3xl bg-[var(--background)] shadow-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload size={32} className="text-brand-blue" />
                  </div>
                  <p className="font-black text-xs mb-2 uppercase tracking-[0.3em] text-[var(--foreground)]">Manifest Upload</p>
                  <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest max-w-[200px]">XLSX / CSV Outreach Protocol</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-500/5 px-6 py-4 rounded-2xl border border-[var(--border)]">
                   <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue">{selectedLeadsIndices.size} Targets Identified</p>
                   <button onClick={() => {setBroadcastLeads([]); setSelectedLeadsIndices(new Set());}} className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:underline px-2">Purge Registry</button>
                </div>
                <div className="max-h-[450px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                   {broadcastLeads.map((lead, idx) => (
                     <button 
                       key={idx} 
                       onClick={() => toggleLeadSelection(idx)}
                       className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${selectedLeadsIndices.has(idx) ? "bg-brand-blue/10 border-brand-blue shadow-lg shadow-brand-blue/10" : "bg-[var(--background)] border-[var(--border)] opacity-60 hover:opacity-100"}`}
                     >
                        <div className="text-left">
                           <p className="font-black text-sm text-[var(--foreground)] tracking-tight">{lead.name}</p>
                           <p className="text-[10px] font-bold opacity-30 text-[var(--foreground)] uppercase tracking-wider">{lead.email}</p>
                        </div>
                        {selectedLeadsIndices.has(idx) ? (
                          <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white shadow-lg">
                            <CheckCircle2 size={16} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] opacity-20">
                            <UserPlus size={16} />
                          </div>
                        )}
                     </button>
                   ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] flex items-start gap-4">
           <Info size={18} className="text-emerald-500 mt-1 shrink-0" />
           <p className="text-[11px] font-medium text-emerald-500/80 leading-relaxed">
             Personalization tags like <code className="bg-emerald-500/10 px-1.5 py-0.5 rounded font-black italic">{"{{name}}"}</code> will be dynamically injected for each recipient in the sequence.
           </p>
        </div>
      </div>

      {/* 02. Campaign Design Section */}
      <div className="xl:col-span-3 space-y-6">
        <div className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] p-10 shadow-2xl relative overflow-hidden">
          <h2 className="font-heading text-2xl font-black tracking-tight mb-10 flex items-center gap-4 text-[var(--foreground)]">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Mail size={24} />
            </div>
            Campaign <span className="opacity-30 italic">Studio.</span>
          </h2>
          
          <div className="space-y-8">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-4 text-[var(--foreground)]">Recipients Protocol</label>
               {broadcastLeads.length > 0 ? (
                 <div className="w-full px-8 py-5 rounded-3xl bg-brand-blue/5 border border-brand-blue/40 font-black text-sm text-brand-blue flex justify-between items-center group">
                   <div className="flex items-center gap-3">
                     <Users className="w-5 h-5" />
                     <span>{selectedLeadsIndices.size} ACTIVE BROADCAST NODES</span>
                   </div>
                   <button onClick={() => {setBroadcastLeads([]); setSelectedLeadsIndices(new Set());}} className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-red-500 font-black uppercase tracking-widest">Aboard Mission</button>
                 </div>
               ) : (
                 <input 
                   type="text" 
                   value={manualEmails} 
                   onChange={e => setManualEmails(e.target.value)} 
                   placeholder="ENTER INDIVIDUAL NODES (COMMA SEPARATED)" 
                   className="w-full px-8 py-5 rounded-3xl bg-[var(--background)] border border-[var(--border)] focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-black text-xs tracking-widest text-[var(--foreground)]" 
                 />
               )}
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-4 text-[var(--foreground)]">Subject Line Encryption</label>
               <input 
                 type="text" 
                 value={subject} 
                 onChange={e => setSubject(e.target.value)} 
                 placeholder="ALPHA TRANSMISSION SUBJECT" 
                 className="w-full px-8 py-5 rounded-3xl bg-[var(--background)] border border-[var(--border)] focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-black text-xs tracking-widest text-[var(--foreground)]" 
               />
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 ml-4 text-[var(--foreground)]">Content Payload (HTML)</label>
               <textarea 
                 rows={12} 
                 value={htmlBody} 
                 onChange={e => setHtmlBody(e.target.value)} 
                 placeholder="INITIALIZE MESSAGE STREAM..." 
                 className="w-full px-8 py-6 rounded-[2rem] bg-[var(--background)] border border-[var(--border)] focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-medium text-sm resize-none text-[var(--foreground)] leading-relaxed" 
               />
            </div>
          </div>
        </div>

        <button 
          onClick={handleBroadcast} 
          disabled={sending || (broadcastLeads.length === 0 && !manualEmails.trim()) || (broadcastLeads.length > 0 && selectedLeadsIndices.size === 0)} 
          className="w-full py-8 bg-brand-blue hover:bg-brand-blue-deep disabled:bg-slate-800 disabled:opacity-50 text-white rounded-[2rem] shadow-2xl shadow-brand-blue/30 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.5em] transition-all hover:scale-[1.02] active:scale-95 group"
        >
          {sending ? (
            <>SYNCING PROTOCOL <Activity size={24} className="animate-spin" /></>
          ) : (
            <>LAUNCH GLOBAL SEQUENCE <Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" /></>
          )}
        </button>
      </div>
    </motion.div>
  );
}

