"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ExternalLink, Building2, Edit3, Save, X, Verified } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/lib/supabase";
import { TrustedCompany } from "@/types/admin";
import Image from "next/image";
import { MediaUpload } from "./MediaUpload";

interface PartnersTabProps {
  notify: (type: 'success' | 'error' | 'info', msg: string) => void;
  uploadFile: (file: File) => Promise<string | null>;
}

const EMPTY: Partial<TrustedCompany> = {
  name: '',
  logo_url: '',
  website_url: '',
  description: '',
  category: 'Developer',
  is_active: true,
  sort_order: 0,
};

export function PartnersTab({ notify, uploadFile }: PartnersTabProps) {
  const [companies, setCompanies] = useState<TrustedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<TrustedCompany> | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('trusted_companies')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) notify('error', `Fetch error: ${error.message}`);
    else setCompanies(data || []);
    setLoading(false);
  }, [notify]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleSave = async () => {
    if (!editing?.name?.trim()) { notify('error', 'Company name is required.'); return; }
    try {
      if (editing.id) {
        const { id, created_at: _, ...payload } = editing as TrustedCompany;
        const { error } = await supabaseClient.from('trusted_companies').update(payload).eq('id', id!);
        if (error) throw error;
      } else {
        const { error } = await supabaseClient.from('trusted_companies').insert(editing);
        if (error) throw error;
      }
      notify('success', `Partner "${editing.name}" saved.`);
      setEditing(null);
      setIsAdding(false);
      fetchCompanies();
    } catch (e: unknown) {
      notify('error', e instanceof Error ? e.message : 'Save failed');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const { error } = await supabaseClient.from('trusted_companies').delete().eq('id', id);
    if (error) notify('error', error.message);
    else { notify('success', `Deleted "${name}"`); fetchCompanies(); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    notify('info', 'Uploading logo...');
    const url = await uploadFile(file);
    if (url) setEditing(prev => ({ ...prev, logo_url: url }));
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-black tracking-tighter uppercase">
            Trusted <span className="opacity-30 italic">Partners.</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
            Manage companies shown on the homepage partner slider
          </p>
        </div>
        <button
          onClick={() => { setEditing({ ...EMPTY }); setIsAdding(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-blue/20"
        >
          <Plus size={16} /> Add Partner
        </button>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAdding || editing?.id) && editing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest">
                {editing.id ? 'Edit Partner' : 'New Partner'}
              </h3>
              <button onClick={() => { setEditing(null); setIsAdding(false); }} title="Close Modal" className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Preview + Upload */}
              <div className="md:col-span-2 flex items-center gap-6">
                <div className="relative w-20 h-20 rounded-2xl bg-slate-500/10 border border-[var(--border)] flex items-center justify-center overflow-hidden shrink-0">
                  {editing.logo_url ? (
                    <Image src={editing.logo_url} alt="Logo" fill className="object-contain" sizes="80px" />
                  ) : (
                    <Building2 size={28} className="opacity-20" />
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-[9px] font-black uppercase opacity-40 ml-1">Company Logo</label>
                  <MediaUpload
                    bucket="media-assets"
                    accept="image/*"
                    label="Upload Logo (will be optimized)"
                    aspect={1}
                    onUploadComplete={(url) => setEditing(prev => ({ ...prev, logo_url: url }))}
                  />
                  <p className="text-[9px] opacity-30 ml-1 mt-2">Or paste a URL below</p>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={editing.logo_url || ''}
                    onChange={e => setEditing(prev => ({ ...prev, logo_url: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-40 ml-1">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Getas Real Estate"
                  value={editing.name || ''}
                  onChange={e => setEditing(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-40 ml-1">Category</label>
                <select
                  value={editing.category || 'Developer'}
                  title="Company Category"
                  onChange={e => setEditing(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold"
                >
                  {['Developer', 'Bank', 'Consultancy', 'Architecture', 'Legal', 'Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-40 ml-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://theirwebsite.com"
                  value={editing.website_url || ''}
                  onChange={e => setEditing(prev => ({ ...prev, website_url: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-40 ml-1">Sort Order</label>
                <input
                  type="number"
                  min={0}
                  title="Sort Order"
                  value={editing.sort_order ?? 0}
                  onChange={e => setEditing(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase opacity-40 ml-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the company..."
                  value={editing.description || ''}
                  onChange={e => setEditing(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditing(prev => ({ ...prev, is_active: !prev?.is_active }))}
                  title="Toggle Partner Visibility"
                  className={`w-10 h-6 rounded-full transition-all relative ${editing.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editing.is_active ? 'left-5' : 'left-1'}`} />
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Active (shown on site)</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-blue/20">
                <Save size={14} /> Save Partner
              </button>
              <button onClick={() => { setEditing(null); setIsAdding(false); }} className="px-6 py-3 rounded-2xl border border-[var(--border)] text-xs font-black uppercase tracking-widest hover:bg-slate-500/5 transition-all">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Company List */}
      {loading ? (
        <div className="text-center py-20 opacity-30 text-sm font-black uppercase tracking-widest">Loading partners...</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[var(--border)] rounded-[2rem]">
          <Building2 size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm font-black uppercase tracking-widest opacity-30">No partners added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {companies.map(company => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative p-6 rounded-[2rem] border bg-[var(--card)] transition-all group ${company.is_active ? 'border-[var(--border)]' : 'border-dashed border-slate-500/20 opacity-50'}`}
            >
              {/* Active badge */}
              <div className={`absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${company.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'}`}>
                {company.is_active ? 'Active' : 'Hidden'}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-slate-500/5 border border-[var(--border)] flex items-center justify-center overflow-hidden shrink-0">
                  {company.logo_url ? (
                    <div className="relative w-full h-full">
                      <Image src={company.logo_url} alt={company.name} fill className="object-contain p-2" sizes="56px" />
                    </div>
                  ) : (
                    <Building2 size={20} className="opacity-30" />
                  )}
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">{company.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Verified size={10} className="text-brand-blue" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-blue">{company.category}</span>
                  </div>
                </div>
              </div>

              {company.description && (
                <p className="text-[10px] font-bold opacity-50 leading-relaxed mb-4 line-clamp-2">{company.description}</p>
              )}

              {company.website_url && (
                <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-brand-blue hover:underline mb-4">
                  <ExternalLink size={10} /> Visit Website
                </a>
              )}

              <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => setEditing({ ...company })}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all"
                >
                  <Edit3 size={10} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(company.id!, company.name)}
                  title="Delete Partner"
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
