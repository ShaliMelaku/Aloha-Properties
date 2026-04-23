"use client";

import { useState, useRef } from "react";
import { 
  Download, Trash2, Eye, Activity,
  Database, UserCheck, ShieldAlert, FileUp, Search, X, Save, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Lead } from "@/types/admin";
import { saveLead, createLeadBatch } from "@/lib/admin-actions";
import * as XLSX from "xlsx";

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
  setViewingLead, setConfirmDelete, 
  viewingLead
}: Omit<LeadsTabProps, 'setSelectedLead' | 'selectedLead'> & { setSelectedLead?: (l: Lead | null) => void; selectedLead?: Lead | null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<'new' | 'contacted' | 'qualified' | 'closed' | 'lost'>('new');
  const [importPreview, setImportPreview] = useState<Partial<Lead>[]>([]);
  const [importUploading, setImportUploading] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const filteredLeads = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportCSV = () => {
    const rows = ["Name,Email,Phone,Interest,Status",
      ...leads.map(l => `"${l.name}","${l.email}","${l.phone || ''}","${l.interest || ''}","${l.status || 'new'}"`)
    ].join("\n");
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Aloha_Prospects_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('success', 'Lead registry exported to CSV.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
        
        const parsed: Partial<Lead>[] = json.map(row => {
          // Normalize keys for fuzzy matching
          const normalizedRow: Record<string, string> = {};
          for (const key in row) {
            normalizedRow[key.toLowerCase().trim()] = String(row[key]).trim();
          }
          
          return {
            name: normalizedRow['name'] || normalizedRow['full name'] || normalizedRow['first name'] || '',
            email: normalizedRow['email'] || normalizedRow['email address'] || '',
            phone: normalizedRow['phone'] || normalizedRow['phone number'] || undefined,
            interest: normalizedRow['interest'] || normalizedRow['property'] || undefined,
            status: importStatus,
          };
        }).filter(l => l.name && l.email);

        setImportPreview(parsed);
        if (parsed.length === 0) onNotify('error', 'No valid leads found in file. Ensure columns: name, email.');
      } catch (err) {
        console.error(err);
        onNotify('error', 'Failed to parse file. Ensure it is a valid Excel or CSV file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBatchImport = async () => {
    if (importPreview.length === 0) return;
    setImportUploading(true);
    let success = 0, failed = 0;
    
    try {
      const batchName = `Batch Import - ${new Date().toLocaleString()}`;
      const batch = await createLeadBatch(batchName, importPreview.length);
      
      for (const lead of importPreview) {
        try {
          await saveLead({ ...lead, status: importStatus, batch_id: batch.id });
          success++;
        } catch {
          failed++;
        }
      }
      onNotify('success', `Data Import: ${success} leads added${failed > 0 ? `, ${failed} skipped` : ''}.`);
    } catch (err) {
      console.error(err);
      onNotify('error', 'Failed to initialize batch import.');
    }

    setImportUploading(false);
    setShowImportModal(false);
    setImportPreview([]);
    onRefresh();
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Activity className="animate-spin text-brand-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter uppercase">Prospect <span className="opacity-30 italic">Registry.</span></h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Monitoring {leads.length} high-intent investor nodes.</p>
        </div>
        <div className="flex gap-3 flex-wrap w-full md:w-auto">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
            <input type="text" placeholder="Search Nodes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-[var(--card)] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[var(--border)] focus:border-brand-blue outline-none transition-all" />
          </div>
          <select
            title="Filter leads by status"
            aria-label="Filter leads by status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-4 bg-[var(--card)] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[var(--border)] focus:border-brand-blue outline-none transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
            <option value="lost">Lost</option>
          </select>
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-5 py-4 bg-brand-blue/10 text-brand-blue rounded-2xl font-black text-[10px] uppercase tracking-widest border border-brand-blue/20 hover:bg-brand-blue hover:text-white transition-all">
            <FileUp size={15} /> Import Data
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-4 bg-emerald-500/10 text-emerald-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Nodes',  value: leads.length,                                         Icon: Database,   bgCls: 'bg-brand-blue/10',    textCls: 'text-brand-blue'   },
          { label: 'Qualified',    value: leads.filter(l => l.status === 'qualified').length,    Icon: UserCheck,  bgCls: 'bg-emerald-500/10',   textCls: 'text-emerald-500'  },
          { label: 'New / Urgent', value: leads.filter(l => l.status === 'new').length,          Icon: ShieldAlert,bgCls: 'bg-red-400/10',       textCls: 'text-red-400'      },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bgCls} ${stat.textCls}`}><stat.Icon size={28} /></div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
              <p className="text-2xl font-heading font-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Responsive List ───────────────────────────────────────── */}
      <div className="bg-[var(--card)] rounded-3xl md:rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm">
        
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
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
                      lead.status === 'closed'    ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                      lead.status === 'lost'      ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                      'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                      {lead.status || 'New'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-60">{lead.interest || 'Undetermined'}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setViewingLead(lead)} title="View & Edit CRM" className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center opacity-40 hover:opacity-100 hover:border-brand-blue hover:text-brand-blue transition-all"><Eye size={14} /></button>
                      <button onClick={() => setConfirmDelete({ type: 'lead', id: lead.id!, name: lead.name })} title="Delete" className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-[10px] font-black uppercase tracking-widest opacity-20">No matching prospect nodes found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden divide-y divide-[var(--border)]">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="p-6 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center font-black text-xs">{lead.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-bold leading-tight">{lead.name}</p>
                      <p className="text-[10px] font-bold opacity-40">{lead.email}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                    lead.status === 'qualified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    lead.status === 'contacted' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' :
                    'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  }`}>
                    {lead.status || 'New'}
                  </div>
               </div>
               <div className="flex justify-between items-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{lead.interest || 'General'}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setViewingLead(lead)} className="px-4 py-2 bg-slate-500/5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-[var(--border)]">Manage</button>
                    <button onClick={() => setConfirmDelete({ type: 'lead', id: lead.id!, name: lead.name })} className="px-4 py-2 bg-red-500/5 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-500/10">Purge</button>
                  </div>
               </div>
            </div>
          ))}
          {filteredLeads.length === 0 && (
            <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest opacity-20">No matching prospect nodes found.</div>
          )}
        </div>
      </div>

      {/* ── CSV Import Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] w-full max-w-2xl p-10 space-y-8 relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => { setShowImportModal(false); setImportPreview([]); }} aria-label="Close Import" title="Close" className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity"><X /></button>
              <div className="space-y-1">
                <h4 className="text-3xl font-heading font-black tracking-tighter uppercase">Bulk <span className="opacity-30 italic">Import.</span></h4>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Upload an Excel (.xlsx) or CSV file with columns: name, email, phone (optional), interest (optional).</p>
              </div>

              {/* Status assignment */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Assign Status to Imported Batch</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {(['new', 'contacted', 'qualified', 'closed', 'lost'] as const).map(s => (
                    <button key={s} onClick={() => setImportStatus(s)} className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${importStatus === s ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-[var(--border)] opacity-40 hover:opacity-100'}`}>{s}</button>
                  ))}
                </div>
              </div>

              {/* File picker */}
              <div
                className="border-2 border-dashed border-[var(--border)] rounded-2xl p-8 text-center cursor-pointer hover:border-brand-blue/40 transition-all"
                onClick={() => csvInputRef.current?.click()}
              >
                <FileUp className="mx-auto mb-3 opacity-20" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Click to select an .xlsx or .csv file</p>
                <input ref={csvInputRef} type="file" accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" aria-label="Upload data file" title="Select a file to import leads" className="hidden" onChange={handleFileChange} />
              </div>

              {/* Preview */}
              {importPreview.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{importPreview.length} leads parsed — ready to import as &ldquo;{importStatus}&rdquo;</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                    {importPreview.slice(0, 8).map((l, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[var(--background)] text-xs">
                        <span className="font-bold w-1/3 truncate">{l.name}</span>
                        <span className="opacity-40 flex-1 truncate">{l.email}</span>
                        {l.interest && <span className="opacity-30 text-[9px] uppercase font-black truncate">{l.interest}</span>}
                      </div>
                    ))}
                    {importPreview.length > 8 && <p className="text-center text-[9px] opacity-30 font-black uppercase py-2">+{importPreview.length - 8} more...</p>}
                  </div>
                </div>
              )}

              <button
                onClick={handleBatchImport}
                disabled={importPreview.length === 0 || importUploading}
                className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 transition-all hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {importUploading ? <Activity className="animate-spin" size={16} /> : <FileUp size={16} />}
                {importUploading ? 'Importing...' : `Import ${importPreview.length} Leads`}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CRM Lead Profile Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {viewingLead && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--card)] rounded-3xl md:rounded-[3rem] border border-[var(--border)] w-full max-w-2xl p-6 md:p-10 space-y-8 relative overflow-y-auto max-h-[90vh]">
              <button onClick={() => setViewingLead(null)} aria-label="Close Profile" title="Close" className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity"><X /></button>
              <div className="space-y-1">
                <h4 className="text-2xl md:text-3xl font-heading font-black tracking-tighter uppercase">Prospect <span className="opacity-30 italic">Profile.</span></h4>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Manage CRM data for {viewingLead.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[var(--border)]">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Email Address</p>
                  <p className="text-sm font-bold">{viewingLead.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Phone Number</p>
                  <p className="text-sm font-bold">{viewingLead.phone || 'Not Provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Interest Layer</p>
                  <p className="text-sm font-bold">{viewingLead.interest || 'General Inquiry'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Current Status</label>
                  <select
                    title="Set lead status"
                    aria-label="Set lead status"
                    value={viewingLead.status || 'new'}
                    onChange={e => setViewingLead({...viewingLead, status: e.target.value as Lead['status']})}
                    className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-sm font-bold uppercase tracking-widest outline-none focus:border-brand-blue"
                  >
                    <option value="new">New (Uncontacted)</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="closed">Closed Deal</option>
                    <option value="lost">Lost/Cold</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">CRM Notes</label>
                  <textarea rows={4} placeholder="Enter meeting notes, preferences, or action items..." value={viewingLead.notes || ''} onChange={e => setViewingLead({...viewingLead, notes: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-sm font-bold outline-none focus:border-brand-blue resize-none custom-scrollbar" />
                </div>
              </div>

              <button onClick={async () => {
                try {
                  await saveLead(viewingLead);
                  onNotify('success', 'Prospect profile updated.');
                  onRefresh();
                  setViewingLead(null);
                } catch (e: unknown) {
                  onNotify('error', e instanceof Error ? e.message : 'Error saving profile');
                }
              }} className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                <Save size={16} /> Save Changes
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
