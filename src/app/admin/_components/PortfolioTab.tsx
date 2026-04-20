"use client";

import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Edit3, Upload, 
  MapPin, Building2, ShieldCheck, ChevronRight, Activity, 
  Home as HomeIcon
} from "lucide-react";
import Image from "next/image";
import { Property, Unit, PropertyProgress } from "@/types/admin";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/location-picker"), { ssr: false });

interface PortfolioTabProps {
  properties: Property[];
  loading: boolean;
  isAddingProperty: boolean;
  setIsAddingProperty: (v: boolean) => void;
  newProp: Partial<Property>;
  setNewProp: React.Dispatch<React.SetStateAction<Partial<Property>>>;
  newUnit: Partial<Unit>;
  setNewUnit: React.Dispatch<React.SetStateAction<Partial<Unit>>>;
  uploadingImage: boolean;
  uploadFile: (file: File, bucket?: string, path?: string) => Promise<string | null>;
  handleCreateProperty: () => void;
  handleUpdateProperty: () => void;
  setEditingProperty: (v: Property | null) => void;
  setConfirmDelete: (v: { type: 'property' | 'post' | 'lead' | 'unit', id: string, name: string } | null) => void;
  togglePropertyUnits: (id: string) => void;
  expandedProperties: Set<string>;
  formatPrice: (p: number) => string;
  setEditingUnit: (u: Unit | null) => void;
  setSelectedPropertyId: (id: string | null) => void;
  fetchProperties: () => void;
  notify: (type: 'success' | 'error' | 'info', msg: string) => void;
  editingProperty: Property | null;
}

export function PortfolioTab({
  properties,
  loading,
  isAddingProperty,
  setIsAddingProperty,
  newProp,
  setNewProp,
  newUnit,
  setNewUnit,
  uploadingImage,
  uploadFile,
  handleCreateProperty,
  handleUpdateProperty,
  setEditingProperty,
  setConfirmDelete,
  togglePropertyUnits,
  expandedProperties,
  formatPrice,
  setEditingUnit,
  setSelectedPropertyId,
  notify,
}: PortfolioTabProps) {
  
  const handlePropertySubmit = () => {
    if (!newProp.name || !newProp.location) return notify('error', 'Integrity Error: Name and Location required.');
    handleCreateProperty();
  };

  const handleUnitEdit = (propertyId: string, unit: Unit) => {
    setSelectedPropertyId(propertyId);
    setEditingUnit(unit);
    setNewUnit({ ...unit }); // Populate edit state
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      {/* Header & Control Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h2 className="text-4xl font-heading font-black tracking-tighter uppercase text-[var(--foreground)]">
            Registry <span className="opacity-30 italic">Curator.</span>
          </h2>
          <p className="text-xs font-bold opacity-40 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <Building2 size={14} className="text-brand-blue" /> {properties.length} Assets Globally Managed
          </p>
        </div>
        <button 
          onClick={() => setIsAddingProperty(!isAddingProperty)} 
          title={isAddingProperty ? 'Close Protocol' : 'Initialize New Listing'}
          className="group relative px-8 py-4 bg-brand-blue text-white rounded-2xl shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden font-heading font-black uppercase text-[10px] tracking-widest"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <Plus size={20} className="relative z-10" /> 
          <span className="relative z-10">{isAddingProperty ? 'Cancel Intent' : 'New Listing Protocol'}</span>
        </button>
      </div>

      <AnimatePresence>
        {isAddingProperty && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }} 
            animate={{ opacity: 1, height: 'auto', scale: 1 }} 
            exit={{ opacity: 0, height: 0, scale: 0.95 }} 
            className="overflow-hidden"
          >
             <div className="bg-[var(--card)] rounded-[3rem] p-12 border border-brand-blue/30 shadow-2xl space-y-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-black italic">!</div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">Register New Listing</h3>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                   <div className="space-y-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Property Designation *</label>
                       <input title="Property Name" type="text" placeholder="Building Name" value={newProp.name} onChange={e => setNewProp({...newProp, name: e.target.value})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all text-[var(--foreground)]" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Geography / Area *</label>
                       <input title="Location" type="text" placeholder="City / Neighborhood" value={newProp.location} onChange={e => setNewProp({...newProp, location: e.target.value})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all text-[var(--foreground)]" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Authorized Entity (Developer)</label>
                       <input title="Developer Entity" type="text" placeholder="Entity Name" value={newProp.developer} onChange={e => setNewProp({...newProp, developer: e.target.value})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all text-[var(--foreground)]" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Amenities Portfolio</label>
                       <input title="Amenities" type="text" placeholder="Gym, Pool, Security... (comma separated)" onChange={e => setNewProp({...newProp, amenities: e.target.value.split(',').map(s => s.trim())})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all text-[var(--foreground)]" />
                     </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2 h-[280px]">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Satellite Pinpoint</label>
                        <div className="h-full rounded-2xl overflow-hidden border border-[var(--border)] relative z-0">
                           <LocationPicker lat={newProp.lat ?? 9.0} lng={newProp.lng ?? 38.7} onChange={(lat, lng) => setNewProp({...newProp, lat, lng})} />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Incentive %</label>
                           <input title="Discount Percentage" type="number" min={0} max={100} value={newProp.discount_percentage} onChange={e => setNewProp({...newProp, discount_percentage: parseInt(e.target.value)||0})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-xs font-black text-emerald-500 border border-[var(--border)]" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Entry %</label>
                           <input title="Downpayment Percentage" type="number" min={0} max={100} value={newProp.downpayment_percentage} onChange={e => setNewProp({...newProp, downpayment_percentage: parseInt(e.target.value)||0})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-xs font-black text-brand-blue border border-[var(--border)]" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Mechanism</label>
                           <select title="Payment Type" value={newProp.payment_schedule} onChange={e => setNewProp({...newProp, payment_schedule: e.target.value})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-[10px] font-black text-[var(--foreground)] border border-[var(--border)] outline-none appearance-none cursor-pointer">
                             <option value="Flexible Terms">Flexible</option>
                             <option value="Quarterly">Quarterly</option>
                             <option value="Cash">Cash Only</option>
                             <option value="Mortgage">Bank Finance</option>
                           </select>
                        </div>
                      </div>
                   </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Narrative Description</label>
                    <textarea title="Narrative" placeholder="Tell the property's story..." rows={4} value={newProp.description} onChange={e => setNewProp({...newProp, description: e.target.value})} className="w-full px-8 py-6 bg-[var(--background)] rounded-[2rem] text-sm font-medium text-[var(--foreground)] border border-[var(--border)] outline-none resize-none leading-relaxed" />
                 </div>

                 <button 
                  onClick={handlePropertySubmit} 
                  disabled={uploadingImage} 
                  title="Finalize Deployment"
                  className="w-full py-8 bg-brand-blue hover:bg-brand-blue-deep text-white font-black font-heading text-xs uppercase tracking-[0.5em] rounded-[2rem] shadow-2xl shadow-brand-blue/30 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-4"
                 >
                    {uploadingImage ? <Activity className="animate-spin" /> : <><ShieldCheck size={20} /> Authorize Listing Deployment</>}
                 </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Property Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
             <div className="col-span-full py-32 text-center">
                <Activity className="animate-spin text-brand-blue mx-auto mb-4" size={32} />
                <p className="text-xs font-black uppercase tracking-widest opacity-40">Decrypting Portfolio...</p>
             </div>
        ) : properties.map((prop) => (
          <PropertyAdminCard 
            key={prop.id} 
            prop={prop} 
            onEdit={() => { setEditingProperty(prop); handleUpdateProperty(); }}
            onDelete={() => setConfirmDelete({ type: 'property', id: prop.id, name: prop.name })}
            onToggleUnits={() => togglePropertyUnits(prop.id)}
            isExpanded={expandedProperties.has(prop.id)}
            formatPrice={formatPrice}
            onAddUnits={() => setSelectedPropertyId(prop.id)}
            onEditUnit={(unit: Unit) => handleUnitEdit(prop.id, unit)}
          />
        ))}
        {!loading && properties.length === 0 && (
          <div className="col-span-full py-32 text-center bg-slate-500/5 rounded-[4rem] border border-dashed border-[var(--border)]">
             <div className="w-20 h-20 bg-[var(--card)] rounded-3xl mx-auto flex items-center justify-center text-[var(--foreground)] opacity-20 mb-6"><HomeIcon size={40} /></div>
             <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Registry Empty. Initialize Listing Deployment.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPropertyId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                 <div className="bg-[var(--card)] rounded-[3rem] p-12 border border-[var(--border)] shadow-2xl max-w-lg w-full space-y-8">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-[var(--foreground)]">Unit Pulse Sync</h3>
                    <div className="space-y-4">
                        <input title="Unit Identifier" placeholder="Unit # (e.g. 102A)" value={newUnit.unit_number} onChange={e => setNewUnit({...newUnit, unit_number: e.target.value})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] text-[var(--foreground)]" />
                        <div className="grid grid-cols-2 gap-4">
                            <input title="Price Signal" type="number" placeholder="Price" value={newUnit.price} onChange={e => setNewUnit({...newUnit, price: parseInt(e.target.value)||0})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] text-brand-blue" />
                            <select title="Asset Status" value={newUnit.status} onChange={e => setNewUnit({...newUnit, status: e.target.value as Unit['status']})} className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[var(--border)] text-[var(--foreground)]">
                                <option value="available">Available</option>
                                <option value="reserved">Reserved</option>
                                <option value="sold">Decommissioned (Sold)</option>
                            </select>
                        </div>
                        <button onClick={() => setSelectedPropertyId(null)} className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20">Sync Unit Signal</button>
                        <button onClick={() => setSelectedPropertyId(null)} className="w-full py-2 text-[10px] font-black uppercase tracking-widest opacity-20">Cancel Transmission</button>
                    </div>
                 </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface PropertyAdminCardProps {
  prop: Property;
  onEdit: () => void;
  onDelete: () => void;
  onToggleUnits: () => void;
  isExpanded: boolean;
  formatPrice: (p: number) => string;
  onAddUnits: () => void;
  onEditUnit: (u: Unit) => void;
}

function PropertyAdminCard({ prop, onEdit, onDelete, onToggleUnits, isExpanded, formatPrice, onAddUnits, onEditUnit }: PropertyAdminCardProps) {
  const progress = prop.progress?.[0] as PropertyProgress;
  
  return (
    <div className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] overflow-hidden hover:border-brand-blue/40 transition-all group flex flex-col shadow-2xl">
       <div className="relative h-56 overflow-hidden">
          <Image 
            src={prop.cover_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'} 
            alt={prop.name} 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] to-transparent" />
          <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
             <button title="Edit Property" onClick={onEdit} className="w-10 h-10 bg-white/10 backdrop-blur-3xl text-white rounded-xl flex items-center justify-center border border-white/20 hover:bg-brand-blue transition-colors shadow-2xl"><Edit3 size={16}/></button>
             <button title="Delete Property" onClick={onDelete} className="w-10 h-10 bg-white/10 backdrop-blur-3xl text-red-100 rounded-xl flex items-center justify-center border border-white/20 hover:bg-red-500 transition-colors shadow-2xl"><Trash2 size={16}/></button>
          </div>
          <div className="absolute bottom-6 left-6">
             <span className="px-4 py-2 bg-brand-blue text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-brand-blue/20">Active Asset</span>
          </div>
       </div>

       <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
             <div>
                <h3 className="text-2xl font-heading font-black tracking-tighter text-[var(--foreground)] mb-1">{prop.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue/70 flex items-center gap-2">
                   <MapPin size={12} /> {prop.location} — {prop.developer}
                </p>
             </div>

             <div className="flex gap-2">
                {prop.discount_percentage !== undefined && prop.discount_percentage > 0 && (
                   <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">{prop.discount_percentage}% Alpha Incentive</span>
                )}
                {prop.payment_schedule && (
                   <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-widest rounded-lg border border-brand-blue/20">{prop.payment_schedule}</span>
                )}
             </div>
          </div>

          {progress && (
            <div className="bg-slate-500/5 p-5 rounded-2xl border border-[var(--border)]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">{progress.status_text || 'Execution Progress'}</span>
                <span className="text-xs font-black text-brand-blue">{progress.percent}%</span>
              </div>
              <div className="h-1.5 w-full bg-brand-blue/10 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: `${progress.percent}%` }} 
                   className="h-full bg-brand-blue rounded-full" 
                />
              </div>
            </div>
          )}

          <button 
            onClick={onToggleUnits} 
            title="Expand Inventory"
            className="w-full py-5 rounded-2xl border border-[var(--border)] hover:border-brand-blue transition-all flex items-center justify-between px-6 group/inv"
          >
             <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isExpanded ? 'bg-brand-blue shadow-[0_0_8px_#0066FF]' : 'bg-[var(--foreground)] opacity-20'}`} />
                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-60">Inventory ({prop.units?.length || 0} Units)</span>
             </div>
             <ChevronRight size={18} className={`transition-transform duration-500 text-brand-blue ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
       </div>

       <AnimatePresence>
          {isExpanded && (
             <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                className="border-t border-[var(--border)] bg-slate-500/5 overflow-hidden"
             >
                <div className="p-8 space-y-4">
                   {prop.units && prop.units.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                         {prop.units.map((unit: Unit) => (
                            <div key={unit.id} className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] flex justify-between items-center group/item hover:border-brand-blue/30 transition-all shadow-sm">
                               <div>
                                  <p className="text-sm font-black text-[var(--foreground)] tracking-tight">{unit.unit_number || unit.type}</p>
                                  <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest mt-1">{unit.beds} Bed • {unit.baths} Bath • {unit.sqm}m²</p>
                                </div>
                                <div className="flex items-center gap-6">
                                  <p className="font-black text-xs text-brand-blue">{formatPrice(unit.price || 0)}</p>
                                  <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                     <button title="Edit Unit" onClick={() => onEditUnit(unit)} className="p-2 bg-brand-blue/10 text-brand-blue rounded-xl hover:bg-brand-blue hover:text-white transition-all"><Edit3 size={14}/></button>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <p className="text-[10px] text-center font-bold opacity-30 uppercase py-8 italic tracking-widest">Inventory empty. Awaiting signals.</p>
                   )}
                   
                   <button onClick={onAddUnits} title="Add Units Protocol" className="w-full py-4 bg-brand-blue/5 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2">
                       <Plus size={16} /> Deploy Inventory Signals
                   </button>
                </div>
             </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
}
