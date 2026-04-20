"use client";

import { useState } from "react";
import { 
  Building2, MapPin, Ruler, Bed, Bath, Plus, Eye, 
  Trash2, TrendingUp, Shield, Wind, Sun, Info,
  DollarSign, Calendar, ChevronRight, Activity, Camera, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Property, Unit, UnitType } from "@/types/admin";

interface PortfolioTabProps {
  properties: Property[];
  loading: boolean;
  isAddingProperty: boolean;
  setIsAddingProperty: (v: boolean) => void;
  newProp: Partial<Property>;
  setNewProp: (v: Partial<Property>) => void;
  newUnit: Partial<Unit>;
  setNewUnit: (v: Partial<Unit>) => void;
  uploadingImage: boolean;
  uploadFile: (file: File) => Promise<string | null>;
  handleCreateProperty: () => Promise<void>;
  handleUpdateProperty: () => Promise<void>;
  setEditingProperty: (p: Property | null) => void;
  setConfirmDelete: (v: { type: 'property' | 'post' | 'lead' | 'unit', id: string, name: string } | null) => void;
  togglePropertyUnits: (id: string) => void;
  expandedProperties: Set<string>;
  formatPrice: (p: number) => string;
  setEditingUnit: (u: Unit | null) => void;
  setSelectedPropertyId: (id: string | null) => void;
  selectedPropertyId: string | null;
  editingUnit: Unit | null;
  fetchProperties: () => void;
  notify: (type: 'success' | 'error' | 'info', msg: string) => void;
  editingProperty: Property | null;
}

export function PortfolioTab({
  properties, loading, isAddingProperty, setIsAddingProperty,
  newProp, setNewProp, handleCreateProperty, setEditingProperty,
  setConfirmDelete, togglePropertyUnits, expandedProperties,
  formatPrice, notify, editingProperty, handleUpdateProperty
}: PortfolioTabProps) {

  if (loading) return <div className="h-64 flex items-center justify-center"><Activity className="animate-spin text-brand-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter uppercase">Global <span className="opacity-30 italic">Registry.</span></h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Managing {properties.length} flagship assets across the neural grid.</p>
        </div>
        <button onClick={() => setIsAddingProperty(true)} className="flex items-center gap-3 px-8 py-4 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all">
          <Plus size={16} /> Deploy New Asset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {properties.map((prop) => (
          <motion.div key={prop.id} layout className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden hover:border-brand-blue/30 transition-all group flex flex-col">
             <div className="h-52 relative">
                <img src={prop.cover_image} alt={prop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                   <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue mb-1">{prop.developer}</p>
                        <h3 className="text-2xl font-heading font-black text-white tracking-tighter uppercase">{prop.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingProperty(prop)} className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-brand-blue transition-all"><Eye size={16} /></button>
                        <button onClick={() => setConfirmDelete({ type: 'property', id: prop.id, name: prop.name })} className="w-10 h-10 rounded-xl bg-red-500/10 backdrop-blur-md flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 space-y-6 flex-1">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-40">
                   <div className="flex items-center gap-1"><MapPin size={12} /> {prop.location}</div>
                   <div className="flex items-center gap-1"><TrendingUp size={12} /> {(prop.progress?.[0]?.percent || 0)}% Constructed</div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                   <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-500"><Wind size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">AQI</span></div>
                      <p className="text-lg font-heading font-black text-[var(--foreground)]">{prop.air_quality_index || 50}</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 space-y-1">
                      <div className="flex items-center gap-2 text-orange-500"><Sun size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">Heat</span></div>
                      <p className="text-lg font-heading font-black text-[var(--foreground)]">+{prop.urban_heat_index || 0}°C</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 space-y-1">
                      <div className="flex items-center gap-2 text-brand-blue"><Shield size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">Risk</span></div>
                      <p className="text-lg font-heading font-black text-[var(--foreground)]">{prop.env_risk_level || 'Low'}</p>
                   </div>
                </div>

                <div className="space-y-3">
                   <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Financial Intelligence</p>
                   <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-500/5 border border-[var(--border)]">
                      <div>
                         <p className="text-xs font-bold text-[var(--foreground)]">{prop.discount_percentage || 0}% Acquisition Discount</p>
                         <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">Available for early investors</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-bold text-[var(--foreground)]">{prop.downpayment_percentage || 0}% Downpayment</p>
                         <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">{prop.payment_schedule || 'Flexible'}</p>
                      </div>
                   </div>
                </div>

                <button onClick={() => togglePropertyUnits(prop.id)} className="w-full py-4 border border-brand-blue/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-blue flex items-center justify-center gap-3 hover:bg-brand-blue hover:text-white transition-all">
                   Manage Inventory Nodes <ChevronRight size={14} className={expandedProperties.has(prop.id) ? 'rotate-90 transition-transform' : 'transition-transform'} />
                </button>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Deploy/Edit Modal */}
      <AnimatePresence>
        {(isAddingProperty || editingProperty) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] w-full max-w-4xl p-12 overflow-y-auto max-h-[90vh] space-y-12">
               <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-heading font-black tracking-tighter uppercase">{editingProperty ? 'Modify' : 'Deploy'} <span className="opacity-30 italic">Asset.</span></h3>
                  <button onClick={() => { setIsAddingProperty(false); setEditingProperty(null); }} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Abort</button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Fundamental Attributes</p>
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Architecture Identity</label>
                           <input type="text" placeholder="Property Name" value={editingProperty?.name || newProp.name} onChange={e => editingProperty ? setEditingProperty({...editingProperty, name: e.target.value}) : setNewProp({...newProp, name: e.target.value})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] outline-none focus:border-brand-blue transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Deployment Zone</label>
                           <input type="text" placeholder="Location String" value={editingProperty?.location || newProp.location} onChange={e => editingProperty ? setEditingProperty({...editingProperty, location: e.target.value}) : setNewProp({...newProp, location: e.target.value})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] outline-none focus:border-brand-blue transition-all" />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Intelligence Specs</p>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">AQI Level</label>
                           <input type="number" placeholder="42" value={editingProperty?.air_quality_index || newProp.air_quality_index} onChange={e => editingProperty ? setEditingProperty({...editingProperty, air_quality_index: parseInt(e.target.value)}) : setNewProp({...newProp, air_quality_index: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] outline-none focus:border-brand-blue transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Heat Index</label>
                           <input type="number" placeholder="2" value={editingProperty?.urban_heat_index || newProp.urban_heat_index} onChange={e => editingProperty ? setEditingProperty({...editingProperty, urban_heat_index: parseInt(e.target.value)}) : setNewProp({...newProp, urban_heat_index: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] outline-none focus:border-brand-blue transition-all" />
                        </div>
                     </div>
                  </div>
               </div>

               <button onClick={editingProperty ? handleUpdateProperty : handleCreateProperty} className="w-full py-6 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Synchronize to Registry
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
