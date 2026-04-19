"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Home, Plus, Edit3, Trash2, MapPin, Building, Info, Activity, Upload, X, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Property, Unit, UnitType, PropertyProgress } from "@/types/admin";
import { useCurrency } from "@/context/currency-context";
import { createProperty, updateProperty } from "@/lib/admin-actions";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/location-picker"), { ssr: false });

interface PortfolioTabProps {
  properties: Property[];
  loading: boolean;
  onRefresh: () => void;
  onNotify: (type: 'success' | 'error' | 'info', msg: string) => void;
  onEdit: (prop: Property) => void;
  onDelete: (prop: Property) => void;
  onManageUnits: (propId: string) => void;
}

export function PortfolioTab({ properties, loading, onRefresh, onNotify, onEdit, onDelete, onManageUnits }: PortfolioTabProps) {
  const { formatPrice } = useCurrency();
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newProp, setNewProp] = useState<Partial<Property>>({
    name: '', location: '', developer: '', description: '', lat: 9.0, lng: 38.7, amenities: [], cover_image: '', video_url: '',
    discount_percentage: 0, downpayment_percentage: 0, payment_schedule: 'Flexible Terms',
    air_quality_index: 50, urban_heat_index: 0, env_risk_level: 'Low'
  });

  const handleCreate = async () => {
    if (!newProp.name || !newProp.location) return onNotify('info', "Name and location required.");
    setIsSaving(true);
    try {
      await createProperty(newProp);
      onNotify('success', "Property registered.");
      setIsAdding(false);
      setNewProp({ name: '', location: '', developer: '', description: '', lat: 9.0, lng: 38.7, amenities: [], cover_image: '', video_url: '', discount_percentage: 0, downpayment_percentage: 0, payment_schedule: 'Flexible Terms', air_quality_index: 50, urban_heat_index: 0, env_risk_level: 'Low' });
      onRefresh();
    } catch (err: any) {
      onNotify('error', `Registration fault: ${err.message}`);
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
      <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-heading text-xl font-black tracking-tight flex items-center gap-3">
            <Home size={20} className="text-brand-blue" />
            Property Management
          </h2>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-blue/20 transition-all flex items-center gap-2">
             <Plus size={16} /> {isAdding ? 'Cancel' : 'New Property'}
          </button>
        </div>

        {/* Add Property Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-12 overflow-hidden">
               <div className="bg-slate-500/5 rounded-3xl p-8 border border-brand-blue/30 space-y-6">
                   <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)] opacity-60">Register New Listing</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase opacity-40 ml-2">Property Name</label>
                          <input type="text" placeholder="e.g. Aloha Sky Garden" value={newProp.name} onChange={e => setNewProp({...newProp, name: e.target.value})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase opacity-40 ml-2">Developer</label>
                          <input type="text" placeholder="e.g. Royal Labs Dev" value={newProp.developer} onChange={e => setNewProp({...newProp, developer: e.target.value})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase opacity-40 ml-2">Location Strategy</label>
                        <input type="text" placeholder="e.g. Bole, Addis Ababa" value={newProp.location} onChange={e => setNewProp({...newProp, location: e.target.value})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase opacity-40 ml-2">Air Quality</label>
                        <input type="number" title="Air Quality Index" placeholder="AQI" value={newProp.air_quality_index} onChange={e => setNewProp({...newProp, air_quality_index: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold text-[var(--foreground)]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase opacity-40 ml-2">Risk Level</label>
                        <select title="Select Environment Risk Level" value={newProp.env_risk_level} onChange={e => setNewProp({...newProp, env_risk_level: e.target.value})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold text-[var(--foreground)]">
                          <option value="Low">Low</option>
                          <option value="Moderate">Moderate</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase opacity-40 ml-2">Discount %</label>
                        <input type="number" title="Discount Percentage" placeholder="0" value={newProp.discount_percentage} onChange={e => setNewProp({...newProp, discount_percentage: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold text-[var(--foreground)]" />
                      </div>
                   </div>

                   <button 
                    onClick={handleCreate} 
                    disabled={isSaving}
                    className="w-full bg-brand-blue text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-brand-blue/20 hover:scale-[1.01] transition-all"
                   >
                     {isSaving ? "Initializing Database Record..." : "Confirm & Register Property"}
                   </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing properties list */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
             <div className="text-center py-12 opacity-40">Decrypting Portfolio...</div>
          ) : properties.map((prop) => (
             <div key={prop.id} className="group bg-slate-500/5 rounded-3xl p-6 border border-transparent hover:border-brand-blue/20 transition-all flex flex-col md:flex-row gap-6">
                <div className="relative w-full md:w-48 h-32 rounded-2xl overflow-hidden shadow-lg">
                   {prop.cover_image ? (
                     <Image src={prop.cover_image} alt={prop.name} fill className="object-cover" unoptimized />
                   ) : (
                     <div className="w-full h-full bg-slate-200 flex items-center justify-center"><Building size={32} className="opacity-20" /></div>
                   )}
                </div>
                <div className="flex-1 space-y-2">
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-heading font-black text-xl text-[var(--foreground)]">{prop.name}</h3>
                        <p className="flex items-center gap-1.5 text-xs font-bold opacity-40 text-[var(--foreground)]">
                          <MapPin size={12} className="text-brand-blue" />
                          {prop.location}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onManageUnits(prop.id)} className="bg-brand-blue/10 text-brand-blue px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/20">Manage Units</button>
                        <button onClick={() => onEdit(prop)} className="bg-slate-500/10 text-[var(--foreground)] p-2 rounded-lg hover:bg-slate-500/20" title="Edit Property"><Edit3 size={16}/></button>
                        <button onClick={() => onDelete(prop)} className="bg-red-500/10 text-red-500 p-2 rounded-lg hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Property"><Trash2 size={16}/></button>
                      </div>
                   </div>
                   <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Units</p>
                        <p className="text-xs font-bold text-[var(--foreground)]">{prop.units?.length || 0} Listed</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Pricing</p>
                        <p className="text-xs font-bold text-brand-blue">
                          {prop.unit_types?.[0]?.price_from ? `From ${formatPrice(prop.unit_types[0].price_from)}` : 'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Progress</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${prop.progress?.[0]?.percent || 0}%` }} />
                          </div>
                          <span className="text-[9px] font-black text-emerald-500">{prop.progress?.[0]?.percent || 0}%</span>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
