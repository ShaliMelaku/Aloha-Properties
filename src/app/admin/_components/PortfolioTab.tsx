"use client";

import { useState } from "react";
import { 
  Building2, MapPin, Ruler, Bed, Bath, Plus, Eye, 
  Trash2, TrendingUp, Shield, Wind, Sun, Info,
  DollarSign, Calendar, ChevronRight, Activity, Camera, Download,
  Home, Map as MapIcon, X, PlusCircle, ArrowRight, Settings2,
  Box, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Property, Unit, UnitType } from "@/types/admin";
import dynamic from "next/dynamic";
const MapPicker = dynamic(() => import("./MapPicker").then(mod => mod.MapPicker), { ssr: false });
import { MediaUpload } from "./MediaUpload";
import { saveUnitType, deleteUnitType, saveUnit, deleteUnit } from "@/lib/admin-actions";

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
  setConfirmDelete: (v: { type: 'property' | 'post' | 'lead' | 'unit' | 'unitType', id: string, name: string } | null) => void;
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
  formatPrice, notify, editingProperty, handleUpdateProperty,
  fetchProperties
}: PortfolioTabProps) {

  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [showUnitTypeModal, setShowUnitTypeModal] = useState(false);
  const [editingUnitType, setEditingUnitType] = useState<Partial<UnitType> | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnitInstance, setEditingUnitInstance] = useState<Partial<Unit> | null>(null);

  const handleSaveUnitType = async () => {
    if (!editingUnitType || !activePropertyId) return;
    try {
      await saveUnitType({ ...editingUnitType, property_id: activePropertyId });
      notify('success', 'Unit Type parameters synchronized.');
      setShowUnitTypeModal(false);
      setEditingUnitType(null);
      fetchProperties();
    } catch (e: unknown) {
      notify('error', e instanceof Error ? e.message : 'Sync Fault');
    }
  };

  const handleSaveUnitInstance = async () => {
    if (!editingUnitInstance || !activePropertyId) return;
    try {
      await saveUnit({ ...editingUnitInstance, property_id: activePropertyId });
      notify('success', 'Unit Node deployed.');
      setShowUnitModal(false);
      setEditingUnitInstance(null);
      fetchProperties();
    } catch (e: unknown) {
      notify('error', e instanceof Error ? e.message : 'Sync Fault');
    }
  };

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

      <div className="grid grid-cols-1 gap-8">
        {properties.map((prop) => (
          <motion.div key={prop.id} layout className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden hover:border-brand-blue/30 transition-all group flex flex-col xl:flex-row">
             <div className="h-64 xl:h-auto xl:w-96 relative shrink-0">
                <img src={prop.cover_image} alt={prop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                   <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue mb-1">{prop.developer}</p>
                   <h3 className="text-2xl font-heading font-black text-white tracking-tighter uppercase">{prop.name}</h3>
                </div>
             </div>

             <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-40">
                      <div className="flex items-center gap-1"><MapPin size={12} /> {prop.location}</div>
                      <div className="flex items-center gap-1"><TrendingUp size={12} /> {(prop.progress?.[0]?.percent || 0)}% Constructed</div>
                   </div>

                   <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                         <div className="flex items-center gap-2 text-emerald-500 mb-1"><Wind size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">AQI</span></div>
                         <p className="text-lg font-heading font-black">{prop.air_quality_index || 50}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                         <div className="flex items-center gap-2 text-orange-500 mb-1"><Sun size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">Heat</span></div>
                         <p className="text-lg font-heading font-black">+{prop.urban_heat_index || 0}°C</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-brand-blue/5 border border-brand-blue/10">
                         <div className="flex items-center gap-2 text-brand-blue mb-1"><Shield size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">Risk</span></div>
                         <p className="text-lg font-heading font-black">{prop.env_risk_level || 'Low'}</p>
                      </div>
                   </div>

                   <div className="flex gap-3">
                      <button onClick={() => setEditingProperty(prop)} className="flex-1 py-4 bg-slate-500/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2"><Settings2 size={14} /> Manage Property</button>
                      <button 
                          onClick={() => setConfirmDelete({ type: 'property', id: prop.id, name: prop.name })} 
                          className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
                          aria-label={`Purge ${prop.name}`}
                          title="Purge Asset"
                       >
                          <Trash2 size={16} />
                       </button>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Unit Inventory Pulse</p>
                      <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-widest rounded-md">{prop.unit_types?.length || 0} Models</span>
                   </div>

                   <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {prop.unit_types?.map(ut => (
                         <div key={ut.id} className="flex items-center justify-between p-4 bg-slate-500/5 rounded-2xl border border-transparent hover:border-brand-blue/20 transition-all">
                            <div>
                               <p className="text-xs font-bold">{ut.name}</p>
                               <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">{ut.beds} BDR • {ut.sqm} SQM</p>
                            </div>
                            <div className="flex items-center gap-4">
                               <p className="text-xs font-black text-brand-blue">{formatPrice(ut.price_from)}</p>
                               <button 
                                  onClick={() => { setActivePropertyId(prop.id); setEditingUnitType(ut); setShowUnitTypeModal(true); }} 
                                  className="p-2 opacity-40 hover:opacity-100 transition-opacity"
                                  aria-label={`Edit ${ut.name} Configuration`}
                                  title="Configure Model"
                               >
                                  <Settings2 size={14}/>
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>

                   <div className="flex gap-2 pt-2">
                      <button onClick={() => { setActivePropertyId(prop.id); setEditingUnitType({ name: 'Luxury Villa' }); setShowUnitTypeModal(true); }} className="flex-1 py-4 border border-brand-blue/20 rounded-2xl text-[9px] font-black uppercase tracking-widest text-brand-blue flex items-center justify-center gap-2 hover:bg-brand-blue hover:text-white transition-all"><PlusCircle size={14}/> Define Model</button>
                      <button onClick={() => { setActivePropertyId(prop.id); setEditingUnitInstance({}); setShowUnitModal(true); }} className="flex-1 py-4 bg-brand-blue/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-brand-blue flex items-center justify-center gap-2 hover:bg-brand-blue hover:text-white transition-all"><Box size={14}/> Deploy Unit Node</button>
                   </div>
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────────────────── */}

      {/* Property Deploy/Edit Modal */}
      <AnimatePresence>
        {(isAddingProperty || editingProperty) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] w-full max-w-5xl p-12 overflow-y-auto max-h-[90vh] grid grid-cols-1 lg:grid-cols-12 gap-12 relative shadow-[0_0_100px_rgba(0,112,243,0.1)]">
               <button 
                   onClick={() => { setIsAddingProperty(false); setEditingProperty(null); }} 
                   className="absolute top-8 right-8 w-12 h-12 bg-slate-500/10 rounded-2xl flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
                   aria-label="Close Asset Editor"
                   title="Close"
                >
                   <X size={20}/>
                </button>
               
               <div className="lg:col-span-12 space-y-2 mb-4">
                  <h3 className="text-4xl font-heading font-black tracking-tighter uppercase">{editingProperty ? 'Recalibrate' : 'Deploy'} <span className="opacity-30 italic">Asset Core.</span></h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Operational parameters for new real estate nodes.</p>
               </div>

               <div className="lg:col-span-7 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-4">
                         <label htmlFor="prop-name" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><Building2 size={12}/> Architecture Identity</label>
                         <input id="prop-name" type="text" placeholder="e.g. Skyline Residence" value={editingProperty?.name || newProp.name || ''} onChange={e => editingProperty ? setEditingProperty({...editingProperty, name: e.target.value}) : setNewProp({...newProp, name: e.target.value})} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none transition-all shadow-inner" />
                      </div>
                      <div className="space-y-4">
                         <label htmlFor="prop-developer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><Users size={12}/> Developer Node</label>
                         <input id="prop-developer" type="text" placeholder="e.g. Aloha Global" value={editingProperty?.developer || newProp.developer || ''} onChange={e => editingProperty ? setEditingProperty({...editingProperty, developer: e.target.value}) : setNewProp({...newProp, developer: e.target.value})} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none transition-all shadow-inner" />
                      </div>
                      <div className="space-y-4">
                         <label htmlFor="prop-location" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><MapPin size={12}/> Deployment Zone</label>
                         <input id="prop-location" type="text" placeholder="e.g. Bole, Addis" value={editingProperty?.location || newProp.location || ''} onChange={e => editingProperty ? setEditingProperty({...editingProperty, location: e.target.value}) : setNewProp({...newProp, location: e.target.value})} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none transition-all shadow-inner" />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <label htmlFor="prop-price" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><DollarSign size={12}/> Budget Baseline</label>
                         <input id="prop-price" type="number" placeholder="Starting Price" value={editingProperty?.price_start || newProp.price_start || 0} onChange={e => editingProperty ? setEditingProperty({...editingProperty, price_start: parseInt(e.target.value)}) : setNewProp({...newProp, price_start: parseInt(e.target.value)})} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none transition-all shadow-inner" />
                      </div>
                      <div className="space-y-4">
                         <label htmlFor="prop-completion" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><Calendar size={12}/> Projected Completion</label>
                         <input id="prop-completion" type="text" placeholder="e.g. Q4 2026" value={editingProperty?.completion_date || newProp.completion_date || ''} onChange={e => editingProperty ? setEditingProperty({...editingProperty, completion_date: e.target.value}) : setNewProp({...newProp, completion_date: e.target.value})} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none transition-all shadow-inner" />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label htmlFor="prop-description" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><Info size={12}/> Neural Description</label>
                      <textarea id="prop-description" placeholder="Describe the asset's unique value proposition..." value={editingProperty?.description || newProp.description || ''} onChange={e => editingProperty ? setEditingProperty({...editingProperty, description: e.target.value}) : setNewProp({...newProp, description: e.target.value})} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none transition-all shadow-inner h-32" />
                   </div>

                  <div className="space-y-6">
                     <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><MapIcon size={12}/> Georeference Mapping</label>
                     <MapPicker 
                        lat={editingProperty?.lat || newProp.lat || 9.0192} 
                        lng={editingProperty?.lng || newProp.lng || 38.7525} 
                        onChange={(lat, lng) => editingProperty ? setEditingProperty({...editingProperty, lat, lng}) : setNewProp({...newProp, lat, lng})} 
                        onAddressChange={(location) => editingProperty ? setEditingProperty({...editingProperty, location}) : setNewProp({...newProp, location})}
                     />
                  </div>
               </div>

               <div className="lg:col-span-5 space-y-8">
                  <div className="space-y-4">
                     <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><Camera size={12}/> Asset Cover Visual</label>
                     <MediaUpload 
                        bucket="property-assets" 
                        onUploadComplete={(url) => editingProperty ? setEditingProperty({...editingProperty, cover_image: url}) : setNewProp({...newProp, cover_image: url})} 
                        label="Drop cover image here"
                     />
                     {(editingProperty?.cover_image || newProp.cover_image) && (
                        <div className="h-40 rounded-2xl overflow-hidden border border-[var(--border)] mt-2">
                           <img 
                               src={editingProperty?.cover_image || newProp.cover_image} 
                               alt={`${editingProperty?.name || "New Asset"} Cover Visual`}
                               className="w-full h-full object-cover" 
                            />
                        </div>
                     )}
                  </div>

                  <div className="p-8 bg-brand-blue/5 rounded-[2.5rem] border border-brand-blue/10 space-y-6">
                     <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-4">ESG Intelligence</p>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label htmlFor="air-quality" className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Air Quality</label>
                           <input id="air-quality" type="number" value={editingProperty?.air_quality_index || newProp.air_quality_index} onChange={e => editingProperty ? setEditingProperty({...editingProperty, air_quality_index: parseInt(e.target.value)}) : setNewProp({...newProp, air_quality_index: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border border-[var(--border)] focus:border-brand-blue outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label htmlFor="heat-delta" className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Heat Delta</label>
                           <input id="heat-delta" type="number" value={editingProperty?.urban_heat_index || newProp.urban_heat_index} onChange={e => editingProperty ? setEditingProperty({...editingProperty, urban_heat_index: parseInt(e.target.value)}) : setNewProp({...newProp, urban_heat_index: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border border-[var(--border)] focus:border-brand-blue outline-none" />
                        </div>
                     </div>
                  </div>

                  <button onClick={editingProperty ? handleUpdateProperty : handleCreateProperty} className="w-full py-6 bg-brand-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-95 transition-all">
                     Synchronize to Registry
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unit Type Editor Modal */}
      <AnimatePresence>
         {showUnitTypeModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] w-full max-w-xl p-10 space-y-8 relative">
                  <button 
                      onClick={() => setShowUnitTypeModal(false)} 
                      className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity"
                      aria-label="Close Model Editor"
                      title="Close"
                   >
                      <X/>
                   </button>
                  <div className="space-y-1">
                     <h4 className="text-2xl font-heading font-black tracking-tighter uppercase">Define <span className="opacity-30 italic">Model.</span></h4>
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Categorization and specs for the property line.</p>
                  </div>

                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setEditingUnitType({...editingUnitType, name: 'Luxury Villa'})} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${editingUnitType?.name?.toLowerCase().includes('villa') ? 'border-brand-blue bg-brand-blue/5' : 'border-[var(--border)] opacity-40 hover:opacity-100'}`}>
                           <Home size={24}/> <span className="text-[10px] font-black uppercase tracking-widest">Villa</span>
                        </button>
                        <button onClick={() => setEditingUnitType({...editingUnitType, name: 'Studio Suite'})} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${!editingUnitType?.name?.toLowerCase().includes('villa') ? 'border-brand-blue bg-brand-blue/5' : 'border-[var(--border)] opacity-40 hover:opacity-100'}`}>
                           <Building2 size={24}/> <span className="text-[10px] font-black uppercase tracking-widest">Apartment</span>
                        </button>
                     </div>
                     
                     <div className="space-y-2">
                        <label htmlFor="unit-model-name" className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Model Name</label>
                        <input id="unit-model-name" type="text" value={editingUnitType?.name || ''} onChange={e => setEditingUnitType({...editingUnitType, name: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-sm font-bold" />
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                           <label htmlFor="unit-beds" className="text-[9px] font-black uppercase opacity-40 ml-2">Beds</label>
                           <input id="unit-beds" type="number" value={editingUnitType?.beds || 0} onChange={e => setEditingUnitType({...editingUnitType, beds: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                        </div>
                        <div className="space-y-1">
                           <label htmlFor="unit-baths" className="text-[9px] font-black uppercase opacity-40 ml-2">Baths</label>
                           <input id="unit-baths" type="number" value={editingUnitType?.baths || 0} onChange={e => setEditingUnitType({...editingUnitType, baths: parseFloat(e.target.value)})} className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                        </div>
                        <div className="space-y-1">
                           <label htmlFor="unit-sqm" className="text-[9px] font-black uppercase opacity-40 ml-2">SQM</label>
                           <input id="unit-sqm" type="number" value={editingUnitType?.sqm || 0} onChange={e => setEditingUnitType({...editingUnitType, sqm: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                        </div>
                     </div>
                  </div>

                  <button onClick={handleSaveUnitType} className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 transition-all hover:scale-[1.02]">Synchronize Model</button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
      {/* Unit Instance Modal (Individual Unit Image Management) */}
      <AnimatePresence>
         {showUnitModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] w-full max-w-xl p-10 space-y-8 relative overflow-y-auto max-h-[90vh]">
                  <button 
                      onClick={() => setShowUnitModal(false)} 
                      className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity"
                      aria-label="Close Node Deployment"
                      title="Close"
                   >
                      <X/>
                   </button>
                  <div className="space-y-1">
                     <h4 className="text-2xl font-heading font-black tracking-tighter uppercase">Deploy <span className="opacity-30 italic">Node Instance.</span></h4>
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Tactical parameters for the specific asset node.</p>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label htmlFor="unit-identity" className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Unit Identity (e.g. Villa 104)</label>
                        <input id="unit-identity" type="text" value={editingUnitInstance?.unit_number || ''} onChange={e => setEditingUnitInstance({...editingUnitInstance, unit_number: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-sm font-bold" />
                     </div>

                     <div className="space-y-2">
                         <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><Camera size={12}/> Unit Selective Visual</label>
                         <MediaUpload 
                            bucket="property-assets" 
                            onUploadComplete={(url) => setEditingUnitInstance({...editingUnitInstance, image_url: url})} 
                            label="Set specific unit visual"
                         />
                         {editingUnitInstance?.image_url && (
                            <div className="h-40 rounded-2xl overflow-hidden border border-[var(--border)] mt-2">
                               <img 
                                   src={editingUnitInstance?.image_url} 
                                   alt="Unit Instance Selective Visual"
                                   className="w-full h-full object-cover" 
                                />
                            </div>
                         )}
                      </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label htmlFor="unit-status" className="text-[9px] font-black uppercase opacity-40 ml-2">Status Node</label>
                           <select id="unit-status" value={editingUnitInstance?.status || 'available'} onChange={e => setEditingUnitInstance({...editingUnitInstance, status: e.target.value as any})} className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs font-bold uppercase tracking-widest">
                              <option value="available">Available</option>
                              <option value="reserved">Reserved</option>
                              <option value="sold">Sold</option>
                           </select>
                        </div>
                         <div className="space-y-1">
                            <label htmlFor="unit-floor" className="text-[9px] font-black uppercase opacity-40 ml-2">Floor/Level</label>
                            <input id="unit-floor" type="number" value={editingUnitInstance?.floor_number || 0} onChange={e => setEditingUnitInstance({...editingUnitInstance, floor_number: parseInt(e.target.value)})} className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                         </div>
                     </div>
                  </div>

                  <button onClick={handleSaveUnitInstance} className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 transition-all hover:scale-[1.02]">Synchronize Asset Node</button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </motion.div>
  );
}
