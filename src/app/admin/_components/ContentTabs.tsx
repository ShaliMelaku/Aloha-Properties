"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Plus, Edit3, Trash2, FileText, Send, 
  Activity, Zap, Download, Database,
  X, ImageIcon, CheckCircle2,
  Users, MessageSquare, MapPin, BarChart3, User, Mail, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Post, Lead, Campaign, LeadResponse } from "@/types/admin";
import { MediaUpload } from "./MediaUpload";
import { savePost, saveLead, createLeadBatch, saveLeadResponse } from "@/lib/admin-actions";
import { supabaseClient } from "@/lib/supabase";
import * as XLSX from "xlsx";

interface ContentTabProps {
  posts: Post[];
  loading: boolean;
  syncing: boolean;
  onSync: () => void;
  onRefresh: () => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
  setConfirmDelete: (v: { type: 'property' | 'post' | 'lead' | 'unit', id: string, name: string } | null) => void;
}

export function ContentTab({ 
  posts, loading, onRefresh, onNotify, setConfirmDelete
}: ContentTabProps) {
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);

  const handleSaveArticle = async () => {
    if (!editingPost) return;
    try {
      await savePost(editingPost);
      onNotify('success', 'Article saved and synchronized.');
      setIsAddingPost(false);
      setEditingPost(null);
      onRefresh();
    } catch (e: unknown) {
      onNotify('error', e instanceof Error ? e.message : 'Article Sync Fault');
    }
  };

  if (loading) return <div className="h-40 flex items-center justify-center"><Activity className="animate-spin text-brand-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-black tracking-tighter uppercase">Articles & <span className="opacity-30 italic">Insights.</span></h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Managing public content and market reports.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-60 hover:opacity-100 transition-all">
             Refresh
           </button>
           <button onClick={() => { setEditingPost({ type: 'article' }); setIsAddingPost(true); }} className="flex items-center gap-3 px-6 py-3 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all">
             <Plus size={16} /> New Article
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden hover:border-brand-blue/30 transition-all group">
             <div className="h-40 relative">
               <Image src={post.cover_image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
               <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-white">{post.type}</div>
             </div>
             <div className="p-6 space-y-4">
                <h3 className="font-heading font-black text-lg leading-tight uppercase tracking-tight line-clamp-2">{post.title}</h3>
                 <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2">
                       <button onClick={() => { setEditingPost(post); setIsAddingPost(true); }} className="text-[10px] font-black uppercase tracking-widest text-brand-blue/60 hover:text-brand-blue transition-colors flex items-center gap-1"><Edit3 size={12}/> Edit</button>
                       {post.file_url ? (
                          <Link href={`/pdf-viewer?url=${encodeURIComponent(post.file_url)}&title=${encodeURIComponent(post.title)}`} className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1 transition-all hover:scale-105 active:scale-95"><FileText size={12}/> Secure View</Link>
                       ) : (
                          <button onClick={() => { setEditingPost(post); setIsAddingPost(true); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">Details</button>
                       )}
                    </div>
                    <button 
                       onClick={() => setConfirmDelete({ type: 'post', id: post.id!, name: post.title })} 
                       className="text-[10px] font-black uppercase tracking-widest text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                       aria-label={`Delete ${post.title}`}
                       title="Delete Article"
                    >
                       <Trash2 size={14}/>
                    </button>
                 </div>
             </div>
          </div>
        ))}
      </div>

      {/* ─── ARTICLE EDITOR MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddingPost && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] w-full max-w-4xl p-10 overflow-y-auto max-h-[90vh] grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="md:col-span-2 flex justify-between items-start">
                  <div className="space-y-1">
                     <h2 className="text-3xl font-heading font-black tracking-tighter uppercase">Article <span className="opacity-30 italic">Editor.</span></h2>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Publish articles, market reports, or guides.</p>
                  </div>
                   <button 
                      onClick={() => setIsAddingPost(false)} 
                      aria-label="Close Article Editor"
                      title="Close"
                      className="p-2 opacity-40 hover:opacity-100 transition-opacity"
                   >
                      <X/>
                   </button>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Category</label>
                     <div className="grid grid-cols-3 gap-2">
                        {(['article', 'report', 'guide'] as const).map(t => (
                           <button key={t} onClick={() => setEditingPost({...editingPost, type: t})} className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${editingPost?.type === t ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' : 'border-[var(--border)] opacity-40 hover:opacity-100'}`}>{t}</button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Title</label>
                     <input placeholder="e.g. Q4 Real Estate Forecast" value={editingPost?.title || ''} onChange={e => setEditingPost({...editingPost, title: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] focus:border-brand-blue outline-none font-bold text-sm" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Source Link</label>
                     <input placeholder="https://source-link.com" value={editingPost?.source_url || ''} onChange={e => setEditingPost({...editingPost, source_url: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] focus:border-brand-blue outline-none text-xs" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Content Summary</label>
                     <textarea rows={6} placeholder="Enter article content or executive summary..." value={editingPost?.content || ''} onChange={e => setEditingPost({...editingPost, content: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] focus:border-brand-blue outline-none text-sm resize-none custom-scrollbar" />
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 px-2 flex items-center gap-2"><ImageIcon size={12}/> Cover Image</label>
                     <MediaUpload bucket="media-assets" onUploadComplete={(url) => setEditingPost({...editingPost, cover_image: url})} label="Upload cover image" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 px-2 flex items-center gap-2"><FileText size={12}/> PDF Brochure</label>
                     <MediaUpload bucket="media-assets" accept="application/pdf" onUploadComplete={(url) => setEditingPost({...editingPost, file_url: url})} label="Upload PDF document" />
                     {editingPost?.file_url && (
                        <div className="space-y-4">
                           <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                              <CheckCircle2 className="text-emerald-500" size={16}/>
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">PDF Attached</span>
                           </div>
                           <div className="h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-[var(--border)] relative bg-white">
                              <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(editingPost.file_url)}&embedded=true`} className="absolute inset-0 w-full h-full border-0" title="PDF Preview" />
                           </div>
                        </div>
                     )}
                  </div>
                  <button onClick={handleSaveArticle} className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all">Publish Article</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface MarketingTabProps {
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
  onRefreshLeads: () => void;
  initialDraft?: { subject: string; body: string; targetFilter: string } | null;
  onDraftConsumed?: () => void;
  history: Campaign[];
  responses: LeadResponse[];
  loading: boolean;
  onRepeatCampaign: (draft: { subject: string; body: string; targetFilter: string }) => void;
  onRefreshResponses: () => void;
  activities: AdminActivity[];
  onRefreshActivities: () => void;
}


export function MarketingTab({ 
  onNotify, onRefreshLeads, initialDraft, history, responses, loading, onRepeatCampaign, onRefreshResponses,
  activities,
  onRefreshActivities
}: MarketingTabProps) {
  const [marketingSubTab, setMarketingSubTab] = useState<'outreach' | 'history' | 'responses'>('outreach');
  const [loggingResponse, setLoggingResponse] = useState<Partial<LeadResponse> | null>(null);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState(initialDraft?.subject ?? "");
  const [body, setBody] = useState(initialDraft?.body ?? "");
  const [targetFilter, setTargetFilter] = useState(initialDraft?.targetFilter ?? "");
  const [individualEmails, setIndividualEmails] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importUrl, setImportUrl] = useState("");
  const [importStatus, setImportStatus] = useState<'new' | 'contacted' | 'qualified' | 'closed' | 'lost'>('new');
  const [importPreview, setImportPreview] = useState<Partial<Lead>[]>([]);
  const [importUploading, setImportUploading] = useState(false);



  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const ab = ev.target?.result as ArrayBuffer;
        const wb = XLSX.read(new Uint8Array(ab), { type: 'array' });
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]]);
        
        const leads: Partial<Lead>[] = json.map(row => {
          const norm: Record<string, string> = {};
          for (const key in row) norm[key.toLowerCase().trim()] = String(row[key]).trim();
          
          return {
            name: norm['name'] || norm['full name'] || norm['first name'] || '',
            email: norm['email'] || norm['email address'] || '',
            phone: norm['phone'] || norm['phone number'] || undefined,
            interest: norm['interest'] || norm['property'] || undefined,
            status: importStatus
          };
        }).filter(l => l.name && l.email);

        if (leads.length === 0) throw new Error("No valid lead data found. Ensure columns: name, email.");
        setImportPreview(leads);
      } catch (err: unknown) {
        onNotify('error', err instanceof Error ? err.message : "Import failed");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBatchImport = async () => {
    if (importPreview.length === 0) return;
    setImportUploading(true);
    let success = 0, failed = 0;
    
    try {
      const batchName = `Marketing Import - ${new Date().toLocaleString()}`;
      const batch = await createLeadBatch(batchName, importPreview.length);
      
      for (const lead of importPreview) {
        try {
          await saveLead({ ...lead, batch_id: batch.id });
          success++;
        } catch {
          failed++;
        }
      }
      onNotify('success', `Imported ${success} leads into batch: ${batch.name}${failed > 0 ? `, ${failed} failed` : ''}`);
      setIsImporting(false);
      setImportPreview([]);
      onRefreshLeads();
    } catch (err: unknown) {
      onNotify('error', err instanceof Error ? err.message : "Import failed");
    } finally {
      setImportUploading(false);
    }
  };


  const handleUrlImport = async () => {
    if (!importUrl.trim()) return;
    try {
      const res = await fetch(importUrl);
      const text = await res.text();
      // Simple CSV parse if URL is provided
      const lines = text.split('\n').filter(l => l.trim());
      const json = lines.slice(1).map(line => {
        const [name, email, interest] = line.split(',').map(s => s.trim());
        return { name, email, interest };
      });
      const leads: Partial<Lead>[] = json.map(row => ({
        name: row.name || 'Imported Lead',
        email: row.email,
        interest: row.interest,
        status: importStatus
      })).filter(l => l.email);

      const batch = await createLeadBatch(`URL Import: ${new URL(importUrl).hostname}`, leads.length);
      for (const l of leads) await saveLead({ ...l, batch_id: batch.id });
      
      onNotify('success', `Imported ${leads.length} leads from URL.`);
      setIsImporting(false);
      setImportUrl("");
      onRefreshLeads();
    } catch {
      onNotify('error', "URL Import failed. Ensure link is a public CSV.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Sub-tab Navigation */}
      <div className="flex gap-4 p-1.5 bg-slate-500/5 rounded-2xl w-fit">
        <button 
          onClick={() => setMarketingSubTab('outreach')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${marketingSubTab === 'outreach' ? 'bg-brand-blue text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
        >
          Outreach
        </button>
        <button 
          onClick={() => setMarketingSubTab('history')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${marketingSubTab === 'history' ? 'bg-brand-blue text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
        >
          Campaign Log
        </button>
        <button 
          onClick={() => setMarketingSubTab('responses')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${marketingSubTab === 'responses' ? 'bg-brand-blue text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
        >
          Responded Leads
        </button>
      </div>

      <AnimatePresence mode="wait">
        {marketingSubTab === 'outreach' ? (
          <motion.div key="outreach" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-10 shadow-sm space-y-10 relative overflow-hidden group">
              <div className="flex justify-between items-center relative z-10">
                <h2 className="text-3xl font-heading font-black tracking-tighter uppercase">Email <span className="opacity-30 italic">Outreach.</span></h2>
                <Zap className="text-brand-blue/20" size={32} />
              </div>
              
              <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                     <label htmlFor="individual-emails" className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Individual Emails (Comma Separated)</label>
                     <input id="individual-emails" placeholder="email1@example.com, email2@example.com..." value={individualEmails} onChange={e => setIndividualEmails(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] font-bold text-xs border border-[var(--border)] focus:border-brand-blue outline-none" />
                  </div>
                  <div className="space-y-2">
                     <label htmlFor="target-recipient" className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Recipient Filter (Optional)</label>
                     <input id="target-recipient" placeholder="e.g. qualified, all, bole..." value={targetFilter} onChange={e => setTargetFilter(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] font-bold text-xs border border-[var(--border)] focus:border-brand-blue outline-none" />
                  </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Subject</label>
                    <input placeholder="Subject Line..." value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-[var(--background)] font-bold text-sm border border-[var(--border)] focus:border-brand-blue outline-none" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Message Body</label>
                    <textarea rows={10} placeholder="Type your message here..." value={body} onChange={e => setBody(e.target.value)} className="w-full px-6 py-5 rounded-2xl bg-[var(--background)] text-sm border border-[var(--border)] focus:border-brand-blue outline-none resize-none" />
                 </div>
                 <button onClick={async () => {
                    if (!subject.trim() || !body.trim()) { onNotify('error', 'Subject and message body are required.'); return; }
                    setSending(true);
                    try {
                      const res = await fetch('/api/admin/broadcast', { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ 
                          subject, 
                          body, 
                          targetFilter,
                          individualEmails: individualEmails.split(',').map(s => s.trim()).filter(s => s)
                        }) 
                      });
                      const data = await res.json();
                      if (data.success) onNotify('success', `Broadcast sent to ${data.sent} contacts.`);
                      else throw new Error(data.error || 'Broadcast failed');
                    } catch (e: unknown) {
                      onNotify('error', e instanceof Error ? e.message : 'Broadcast failed');
                    } finally {
                      setSending(false);
                    }
                 }} disabled={sending} className="w-full py-6 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-brand-blue/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                   {sending ? <Activity className="animate-spin" /> : <>Send Broadcast <Send size={18} /></>}
                 </button>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-blue/5 to-transparent pointer-events-none" />
            </div>

            <div className="space-y-8">
               <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-10 space-y-8 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-brand-blue/10 rounded-3xl flex items-center justify-center text-brand-blue mb-2">
                     <Download size={40} />
                  </div>
                  <div className="space-y-2">
                     <h2 className="text-2xl font-heading font-black tracking-tighter uppercase">CSV <span className="opacity-30 italic">Import.</span></h2>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40 max-w-xs">Bulk import leads from external sources or junk datasets.</p>
                  </div>
                  <button onClick={() => setIsImporting(true)} className="px-10 py-5 bg-[var(--background)] border border-brand-blue/30 text-brand-blue rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all">
                     Import Leads
                  </button>
               </div>

               <div className="p-10 bg-brand-blue rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                  <div className="relative z-10 space-y-6">
                     <div className="flex items-center gap-3">
                        <Users className="opacity-60" size={20} />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Lead Database Status</p>
                     </div>
                     <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-heading font-black tracking-tighter tabular-nums">Active</p>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System logging integrated with Lead CRM.</p>
                  </div>
                  <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform"><Database size={160} /></div>
               </div>
            </div>
          </motion.div>
        ) : marketingSubTab === 'history' ? (
          <HistoryTab 
            key="history"
            history={history} 
            loading={loading} 
            onRepeatCampaign={(draft) => {
              onRepeatCampaign(draft);
              setMarketingSubTab('outreach');
            }} 
            onLogResponse={(campaignId) => setLoggingResponse({ campaign_id: campaignId })}
          />
        ) : (
          <ResponsesTab 
            key="responses"
            responses={responses}
            loading={loading}
            onLogNew={() => setLoggingResponse({})}
          />
        )}
      </AnimatePresence>

      {/* ─── LOG RESPONSE MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {loggingResponse && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] p-12 max-w-xl w-full space-y-8 shadow-2xl relative">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-heading font-black tracking-tighter uppercase">Log <span className="opacity-30 italic">Response.</span></h3>
                  <MessageSquare className="text-brand-blue" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Lead Email</label>
                    <input 
                      placeholder="Search lead by email..." 
                      className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] font-bold text-xs border border-[var(--border)] focus:border-brand-blue outline-none" 
                      onChange={async (e) => {
                        const email = e.target.value;
                        if (email.includes('@')) {
                          const { data } = await supabaseClient.from('leads').select('id, name').eq('email', email).single();
                          if (data) setLoggingResponse(prev => ({ ...prev, lead_id: data.id, lead_name: data.name }));
                        }
                      }}
                    />
                    {loggingResponse.lead_name && <p className="text-[10px] font-bold text-brand-blue ml-4 uppercase">Found: {loggingResponse.lead_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Interest Level</label>
                    <select 
                      title="Interest Level"
                      value={loggingResponse.interest_level || 'Medium'}
                      onChange={e => setLoggingResponse(prev => ({ ...prev, interest_level: e.target.value }))}
                      className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] font-bold text-xs border border-[var(--border)] focus:border-brand-blue outline-none appearance-none"
                    >
                      <option value="High">🔥 High</option>
                      <option value="Medium">⚡ Medium</option>
                      <option value="Low">❄️ Low</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Location</label>
                    <input 
                      placeholder="e.g. Dubai, Addis..." 
                      value={loggingResponse.location || ''} 
                      onChange={e => setLoggingResponse(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] font-bold text-xs border border-[var(--border)] focus:border-brand-blue outline-none" 
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Response Summary</label>
                    <textarea 
                      rows={3} 
                      placeholder="What was their main interest?" 
                      value={loggingResponse.response_text || ''} 
                      onChange={e => setLoggingResponse(prev => ({ ...prev, response_text: e.target.value }))}
                      className="w-full px-6 py-4 rounded-2xl bg-[var(--background)] text-sm border border-[var(--border)] focus:border-brand-blue outline-none resize-none" 
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setLoggingResponse(null)} className="flex-1 py-5 border border-[var(--border)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-500/10 transition-all">Cancel</button>
                  <button 
                    onClick={async () => {
                      if (!loggingResponse.lead_id || !loggingResponse.response_text) {
                        onNotify('error', 'Lead identification and response text are required.');
                        return;
                      }
                      try {
                        await saveLeadResponse(loggingResponse);
                        onNotify('success', 'Engagement response logged successfully.');
                        setLoggingResponse(null);
                        onRefreshResponses();
                      } catch {
                        onNotify('error', 'Failed to log response.');
                      }
                    }}
                    className="flex-1 py-5 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-[1.05] transition-all"
                  >
                    Log Engagement
                  </button>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* ─── IMPORT LEAD MODAL ────────────────────────────────────────────────────── */}
      <AnimatePresence>
         {isImporting && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] w-full max-w-2xl p-10 space-y-8 relative overflow-y-auto max-h-[90vh]">
                  <button onClick={() => { setIsImporting(false); setImportPreview([]); }} aria-label="Close Import" title="Close" className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity"><X/></button>
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

                  <div className="space-y-6">
                     <div 
                        className="border-2 border-dashed border-[var(--border)] rounded-2xl p-10 text-center cursor-pointer hover:border-brand-blue/40 transition-all bg-brand-blue/5"
                        onClick={() => fileInputRef.current?.click()}
                     >
                        <Download className="mx-auto mb-3 opacity-20" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Click to select an .xlsx or .csv file</p>
                        <input ref={fileInputRef} type="file" accept=".csv, .xlsx" className="hidden" aria-label="Upload lead data" title="Upload lead data" onChange={handleFileImport} />
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
                        className="w-full py-6 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 transition-all hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2"
                     >
                        {importUploading ? <Activity className="animate-spin" size={16} /> : <Download size={16} />}
                        {importUploading ? 'Importing...' : `Import ${importPreview.length} Leads`}
                     </button>

                     <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none opacity-20"><Zap size={14}/></div>
                        <input 
                           placeholder="OR Paste Storage URL (Direct CSV Link)..." 
                           value={importUrl}
                           onChange={e => setImportUrl(e.target.value)}
                           className="w-full pl-12 pr-6 py-4 rounded-2xl bg-[var(--background)] text-[10px] font-black uppercase tracking-widest border border-[var(--border)] focus:border-brand-blue outline-none" 
                        />
                     </div>

                     {importUrl && (
                        <button onClick={handleUrlImport} className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 transition-all hover:scale-[1.02]">Sync from URL</button>
                     )}
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}

interface HistoryTabProps {
  history: Campaign[];
  loading: boolean;
  onRepeatCampaign: (draft: { subject: string; body: string; targetFilter: string }) => void;
  onLogResponse?: (campaignId: string) => void;
}

export function HistoryTab({ history, loading, onRepeatCampaign, onLogResponse }: HistoryTabProps) {
  if (loading) return <div className="h-40 flex items-center justify-center"><Activity className="animate-spin text-brand-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-black tracking-tighter uppercase">Campaign <span className="opacity-30 italic">Log.</span></h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Reviewing outreach performance.</p>
        </div>
        <button className="flex items-center gap-3 px-6 py-3 border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-60 hover:opacity-100 transition-all">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {history.map(item => (
          <div key={item.id} className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] hover:border-brand-blue/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3 text-brand-blue mb-2">
                  <Calendar size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold leading-tight">{item.subject}</h3>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Filter: {item.target_filter || 'Manual'}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onRepeatCampaign({ subject: item.subject, body: item.body || "", targetFilter: item.target_filter || "" })}
                  className="px-6 py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:scale-[1.05] transition-all"
                >
                  Edit & Repeat
                </button>
                <button 
                  onClick={() => onLogResponse?.(item.id)}
                  className="px-6 py-3 border border-brand-blue/30 text-brand-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all"
                >
                  Log Response
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[var(--border)]">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1">Audience Size</p>
                <p className="text-xl font-heading font-black tabular-nums">{item.audience_size}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1">Delivered</p>
                <p className="text-xl font-heading font-black tabular-nums text-emerald-500">100%</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1">Type</p>
                <p className="text-xl font-heading font-black uppercase tracking-widest text-brand-blue">Broadcast</p>
              </div>
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-slate-500/5 rounded-[3rem] border border-dashed border-[var(--border)]">
            <Mail size={48} className="mx-auto opacity-10" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-30">No recorded campaigns found.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface ResponsesTabProps {
  responses: LeadResponse[];
  loading: boolean;
  onLogNew: () => void;
}

export function ResponsesTab({ responses, loading, onLogNew }: ResponsesTabProps) {
  if (loading) return <div className="h-40 flex items-center justify-center"><Activity className="animate-spin text-brand-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-black tracking-tighter uppercase">Engagement <span className="opacity-30 italic">Responses.</span></h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Tracking lead interest and feedback.</p>
        </div>
        <button 
          onClick={onLogNew}
          className="flex items-center gap-3 px-8 py-4 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-[1.05] transition-all"
        >
          <Plus size={16} /> Log New Response
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {responses.map(item => (
          <div key={item.id} className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] hover:border-brand-blue/30 transition-all flex gap-8 items-start">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              item.interest_level === 'High' ? 'bg-orange-500/10 text-orange-500' :
              item.interest_level === 'Medium' ? 'bg-brand-blue/10 text-brand-blue' :
              'bg-slate-500/10 text-slate-500'
            }`}>
              <BarChart3 size={24} />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg">{item.lead_name || 'Unknown Lead'}</h3>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      item.interest_level === 'High' ? 'bg-orange-500 text-white' :
                      item.interest_level === 'Medium' ? 'bg-brand-blue text-white' :
                      'bg-slate-500/20 text-slate-500'
                    }`}>
                      {item.interest_level} Interest
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold opacity-40 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><User size={12} /> {item.lead_email}</span>
                    {item.location && <span className="flex items-center gap-1"><MapPin size={12} /> {item.location}</span>}
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1">Campaign</p>
                  <p className="text-[10px] font-bold text-brand-blue max-w-[200px] truncate">{item.campaign_subject || 'Manual Entry'}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-500/5 rounded-2xl">
                <p className="text-sm italic opacity-70">&quot;{item.response_text}&quot;</p>
              </div>
            </div>
          </div>
        ))}

        {responses.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-slate-500/5 rounded-[3rem] border border-dashed border-[var(--border)]">
            <MessageSquare size={48} className="mx-auto opacity-10" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-30">No engagement responses logged yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── SYSTEM PULSE TAB ──────────────────────────────────────────────────────────
export const SystemPulseTab: React.FC<{ 
  activities: AdminActivity[]; 
  loading: boolean;
  onRefresh: () => void;
}> = ({ activities, loading, onRefresh }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-5xl font-heading font-black tracking-tighter uppercase leading-[0.8]">System <span className="opacity-30 italic">Pulse.</span></h2>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-4 ml-1">Live Operational Audit</p>
        </div>
        <button onClick={onRefresh} className="p-4 bg-brand-blue/10 text-brand-blue rounded-2xl hover:scale-110 transition-all">
          <Activity size={20} className={loading ? 'animate-pulse' : ''} />
        </button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 && !loading ? (
          <div className="py-20 text-center space-y-4 bg-slate-500/5 rounded-[3rem] border border-dashed border-[var(--border)]">
             <ShieldCheck size={48} className="mx-auto opacity-10" />
             <p className="text-xs font-bold uppercase tracking-widest opacity-30">No activity logged yet.</p>
          </div>
        ) : (
          activities.map((log) => (
            <motion.div 
              key={log.id} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] p-8 flex items-center justify-between group hover:border-brand-blue/30 transition-all"
            >
              <div className="flex items-center gap-8">
                 <div className="w-16 h-16 bg-[var(--background)] rounded-3xl flex items-center justify-center text-brand-blue shadow-inner group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-xl font-heading font-black tracking-tight uppercase">{log.action}</h4>
                    <div className="flex items-center gap-3 opacity-40">
                       <User size={12} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">{log.admin_name}</span>
                       <span className="w-1 h-1 rounded-full bg-current" />
                       <Calendar size={12} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20 group-hover:opacity-100 transition-opacity mb-1">{log.entity_type}</p>
                 <p className="text-sm font-bold text-brand-blue italic">{log.details || log.entity_id}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
