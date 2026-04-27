"use client";

import { useState } from "react";
import { 
  Building2, MapPin, Plus, 
  Trash2, TrendingUp, Shield, Wind, Sun,
  DollarSign, Calendar, Activity, Camera,
  Home, Map as MapIcon, X, PlusCircle, Settings2,
  Box, Users, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Property, Unit, UnitType, PropertyProgress } from "@/types/admin";
import dynamic from "next/dynamic";
const MapPicker = dynamic(() => import("./MapPicker").then(mod => mod.MapPicker), { ssr: false });
import { MediaUpload } from "./MediaUpload";
import Image from "next/image";
import { saveUnitType, saveUnit, saveProgress, deleteProgress, deleteUnit, deleteUnitType } from "@/lib/admin-actions";
import { PDFViewerModal } from "./PDFViewerModal";
import { getSecurePdfUrl } from "@/lib/pdf-utils";

interface ProductsTabProps {
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
  notify: (type: 'success' | 'error' | 'info', msg: string) => void;
  editingProperty: Property | null;
  fetchProperties: () => void;
}

export function ProductsTab({
  properties, loading, isAddingProperty, setIsAddingProperty,
  newProp, setNewProp, handleCreateProperty, setEditingProperty,
  setConfirmDelete,
  formatPrice, notify, editingProperty, handleUpdateProperty,
  fetchProperties, uploadFile
}: ProductsTabProps) {

  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingUnitType, setEditingUnitType] = useState<Partial<UnitType> | null>(null);
  const [editingUnitInstance, setEditingUnitInstance] = useState<Partial<Unit> | null>(null);
  const [editingProgress, setEditingProgress] = useState<Partial<PropertyProgress> | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [expandedUnitType, setExpandedUnitType] = useState<string | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);

  const handleSaveUnitType = async () => {
    if (!editingUnitType || !activePropertyId) return;
    try {
      await saveUnitType({ ...editingUnitType, property_id: activePropertyId });
      notify('success', 'Unit Type parameters synchronized.');
      setEditingUnitType(null);
      fetchProperties();
    } catch (e: unknown) {
      console.error("Unit Type Sync Error:", e);
      notify('error', e instanceof Error ? `Sync Fault: ${e.message}` : 'Sync Fault: Database Linkage Error');
    }
  };

  const handleSaveUnitInstance = async () => {
    if (!editingUnitInstance || !activePropertyId) return;
    try {
      await saveUnit({ ...editingUnitInstance, property_id: activePropertyId });
      notify('success', 'Unit Node deployed.');
      setEditingUnitInstance(null);
      fetchProperties();
    } catch (e: unknown) {
      console.error("Unit Instance Sync Error:", e);
      notify('error', e instanceof Error ? `Sync Fault: ${e.message}` : 'Sync Fault: Database Linkage Error');
    }
  };

  const handleSaveProgress = async () => {
    if (!editingProgress || !activePropertyId) return;
    try {
      await saveProgress({ ...editingProgress, property_id: activePropertyId });
      notify('success', 'Progress milestone updated.');
      setShowProgressModal(false);
      setEditingProgress(null);
      fetchProperties();
    } catch (e: unknown) {
      notify('error', e instanceof Error ? e.message : 'Progress Sync Fault');
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Activity className="animate-spin text-brand-blue" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter uppercase">Property <span className="opacity-30 italic">Products.</span></h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Managing {properties.length} active real estate assets.</p>
        </div>
        <button onClick={() => setIsAddingProperty(true)} className="flex items-center gap-3 px-8 py-4 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all">
          <Plus size={16} /> Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {properties.map((prop) => (
          <motion.div key={prop.id} layout className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden hover:border-brand-blue/30 transition-all group flex flex-col xl:flex-row">
             <div className="h-64 xl:h-auto xl:w-96 relative shrink-0">
                <Image 
                  src={prop.cover_image || "/placeholder.jpg"} 
                  alt={prop.name} 
                  fill 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  sizes="(max-width: 1280px) 100vw, 384px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                   <p className="text-[9px] font-black uppercase tracking-widest text-brand-blue mb-1">{prop.developer}</p>
                   <h3 className="text-2xl font-heading font-black text-white tracking-tighter uppercase">{prop.name}</h3>
                </div>
             </div>

             <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-40">
                      <div className="flex items-center gap-1"><MapPin size={12} /> {prop.location}</div>
                      <div className="flex items-center gap-1 cursor-pointer hover:text-brand-blue" onClick={() => { setActivePropertyId(prop.id); setEditingProgress(prop.progress?.[0] || {}); setShowProgressModal(true); }}>
                        <TrendingUp size={12} /> {(prop.progress?.[0]?.percentage || 0)}% Complete
                      </div>
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
                       <button onClick={() => setEditingProperty(prop)} className="flex-1 py-4 bg-slate-500/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2"><Settings2 size={14} /> Edit Property</button>
                       {prop.pdf_brochure_url && (
                          <button 
                             onClick={() => setViewingPdf({ 
                                url: getSecurePdfUrl(prop.pdf_brochure_url), 
                                title: `${prop.name} - Brief` 
                             })} 
                             className="flex-1 py-4 bg-emerald-500/5 text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                             <FileText size={14} /> View Brief
                          </button>
                       )}
                       <button 
                           onClick={() => setConfirmDelete({ type: 'property', id: prop.id, name: prop.name })} 
                           className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
                           aria-label={`Delete ${prop.name}`}
                           title="Delete Property"
                        >
                           <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Unit Types & Inventory</p>
                      <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-widest rounded-md">{prop.unit_types?.length || 0} Models</span>
                   </div>

                   <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {prop.unit_types?.map(ut => (
                         <div key={ut.id} className="flex items-center justify-between p-4 bg-slate-500/5 rounded-2xl border border-transparent hover:border-brand-blue/20 transition-all">
                            <div>
                               <p className="text-xs font-bold">{ut.name}</p>
                               <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">{ut.beds} Bed • {ut.sqm} SQM</p>
                            </div>
                            <div className="flex items-center gap-4">
                               <p className="text-xs font-black text-brand-blue">{formatPrice(ut.price_from)}</p>
                               <button 
                                  onClick={() => { setActivePropertyId(prop.id); setEditingUnitType(ut); setShowInventoryModal(true); }} 
                                  className="p-2 opacity-40 hover:opacity-100 transition-opacity"
                                  aria-label={`Edit ${ut.name}`}
                                  title="Edit Type"
                               >
                                  <Settings2 size={14}/>
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>

                   {prop.units && prop.units.length > 0 && (
                     <div className="pt-4 border-t border-[var(--border)] mt-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mb-4 px-2">Deployed Units (Inventory)</p>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                           {prop.units.map(u => (
                              <div key={u.id} className="p-3 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between group">
                                 <div>
                                    <p className="text-[10px] font-black text-white/80">{u.unit_number}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                       <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'available' ? 'bg-emerald-500' : u.status === 'reserved' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                       <span className="text-[8px] font-bold opacity-40 uppercase">{u.status}</span>
                                    </div>
                                 </div>
                                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setActivePropertyId(prop.id); setEditingUnitInstance(u); setShowInventoryModal(true); }} className="p-1.5 hover:text-brand-blue transition-colors" title="Edit Unit Instance"><Settings2 size={12}/></button>
                                    <button onClick={() => setConfirmDelete({ type: 'unit', id: u.id, name: u.unit_number })} className="p-1.5 hover:text-red-500 transition-colors" title="Delete Unit Instance"><Trash2 size={12}/></button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                   )}

                   <div className="flex gap-2 pt-2">
                      <button onClick={() => { setActivePropertyId(prop.id); setShowInventoryModal(true); }} className="flex-1 py-4 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl text-[9px] font-black uppercase tracking-widest text-brand-blue flex items-center justify-center gap-2 hover:bg-brand-blue hover:text-white transition-all shadow-md"><PlusCircle size={14}/> Manage Unit Inventory & Types</button>
                   </div>
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {(isAddingProperty || editingProperty) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--card)] rounded-3xl md:rounded-[3rem] border border-[var(--border)] w-full max-w-5xl p-6 md:p-12 overflow-y-auto max-h-[90vh] grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 relative shadow-2xl">
               <button 
                   onClick={() => { setIsAddingProperty(false); setEditingProperty(null); }} 
                   className="absolute top-8 right-8 w-12 h-12 bg-slate-500/10 rounded-2xl flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
                   aria-label="Close"
                   title="Close"
                >
                   <X size={20}/>
                </button>
               
               <div className="lg:col-span-12 space-y-2 mb-4">
                  <h3 className="text-4xl font-heading font-black tracking-tighter uppercase">{editingProperty ? 'Edit' : 'Add'} <span className="opacity-30 italic">Property.</span></h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Manage core property details and location.</p>
               </div>

               <div className="lg:col-span-7 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       <div className="space-y-4">
                          <label htmlFor="prop-name" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><Building2 size={12}/> Property Name</label>
                          <input id="prop-name" type="text" placeholder="e.g. Skyline Residence" value={editingProperty?.name || newProp.name || ''} onChange={e => editingProperty ? setEditingProperty({...editingProperty, name: e.target.value}) : setNewProp({...newProp, name: e.target.value})} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none transition-all shadow-inner" />
                       </div>
                       <div className="space-y-4">
                          <label htmlFor="prop-type" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><Box size={12}/> Property Type</label>
                          <select id="prop-type" value={editingProperty?.property_type || newProp.property_type || 'Apartment'} onChange={e => {
                             const val = e.target.value as Property['property_type'];
                             if (editingProperty) setEditingProperty({...editingProperty, property_type: val});
                             else setNewProp({...newProp, property_type: val});
                          }} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none transition-all shadow-inner appearance-none">
                             <option value="Apartment">Apartment</option>
                             <option value="Villa">Villa</option>
                             <option value="Compound">Compound</option>
                             <option value="Village">Village</option>
                             <option value="Commercial">Commercial</option>
                          </select>
                       </div>
                       <div className="space-y-4">
                          <label htmlFor="prop-developer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><Users size={12}/> Developer</label>
                          <input id="prop-developer" type="text" placeholder="e.g. Aloha Global" value={editingProperty?.developer || newProp.developer || ''} onChange={e => editingProperty ? setEditingProperty({...editingProperty, developer: e.target.value}) : setNewProp({...newProp, developer: e.target.value})} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none transition-all shadow-inner" />
                       </div>
                       <div className="space-y-4">
                          <label htmlFor="prop-location" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><MapPin size={12}/> Location</label>
                          <input id="prop-location" type="text" placeholder="e.g. Bole, Addis" value={editingProperty?.location || newProp.location || ''} onChange={e => editingProperty ? setEditingProperty({...editingProperty, location: e.target.value}) : setNewProp({...newProp, location: e.target.value})} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none transition-all shadow-inner" />
                       </div>
                    </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <label htmlFor="prop-price" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><DollarSign size={12}/> Starting Price</label>
                         <input id="prop-price" type="number" placeholder="Starting Price" value={editingProperty?.price_start || newProp.price_start || 0} onChange={e => editingProperty ? setEditingProperty({...editingProperty, price_start: parseInt(e.target.value)}) : setNewProp({...newProp, price_start: parseInt(e.target.value)})} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none transition-all shadow-inner" />
                      </div>
                      <div className="space-y-4">
                         <label htmlFor="prop-completion" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><Calendar size={12}/> Completion Date</label>
                         <input id="prop-completion" type="text" placeholder="e.g. Q4 2026" value={editingProperty?.completion_date || newProp.completion_date || ''} onChange={e => editingProperty ? setEditingProperty({...editingProperty, completion_date: e.target.value}) : setNewProp({...newProp, completion_date: e.target.value})} className="w-full px-6 py-5 bg-[var(--background)] rounded-2xl text-sm font-bold border border-[var(--border)] focus:border-brand-blue outline-none transition-all shadow-inner" />
                      </div>
                   </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-4">PDF Brochure URL</label>
                       <div className="flex gap-2">
                          <input type="text" placeholder="https://example.com/brochure.pdf" value={editingProperty?.pdf_brochure_url || newProp.pdf_brochure_url || ''} onChange={e => editingProperty ? setEditingProperty({...editingProperty, pdf_brochure_url: e.target.value}) : setNewProp({...newProp, pdf_brochure_url: e.target.value})} className="flex-1 px-6 py-5 bg-[var(--background)] rounded-2xl text-xs font-bold outline-none border border-[var(--border)] focus:border-brand-blue" />
                          <button 
                            type="button"
                            onClick={async () => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'application/pdf';
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  const url = await uploadFile(file);
                                  if (url) {
                                    if (editingProperty) setEditingProperty({...editingProperty, pdf_brochure_url: url});
                                    else setNewProp({...newProp, pdf_brochure_url: url});
                                  }
                                }
                              };
                              input.click();
                            }}
                            className="px-6 bg-brand-blue/10 text-brand-blue rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all"
                          >
                            Upload PDF
                          </button>
                       </div>
                    </div>

                    <div className="space-y-6 bg-[var(--background)] p-8 rounded-3xl border border-[var(--border)]">
                        <div className="flex justify-between items-center">
                           <h4 className="text-xs font-black uppercase tracking-widest opacity-40 px-4">Discount Tiers</h4>
                           <button onClick={() => {
                              const currentRules = editingProperty?.discount_rules || newProp.discount_rules || [];
                              const updated = [...currentRules, { downpayment: 0, discount: 0 }];
                              if (editingProperty) setEditingProperty({...editingProperty, discount_rules: updated});
                              else setNewProp({...newProp, discount_rules: updated});
                           }} className="text-[9px] font-black uppercase text-brand-blue flex items-center gap-2 hover:opacity-70 transition-all"><Plus size={10}/> Add Rule</button>
                        </div>
                        
                        <div className="space-y-4">
                           {(editingProperty?.discount_rules || newProp.discount_rules || []).map((rule, idx) => (
                              <div key={idx} className="flex items-center gap-4 bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] group">
                                 <div className="flex-1 space-y-2">
                                    <label className="text-[8px] font-black uppercase opacity-30 ml-2">Downpayment %</label>
                                    <input type="number" title="Downpayment Percentage" placeholder="0" value={rule.downpayment} onChange={e => {
                                       const rules = [...(editingProperty?.discount_rules || newProp.discount_rules || [])];
                                       rules[idx].downpayment = parseFloat(e.target.value);
                                       if (editingProperty) setEditingProperty({...editingProperty, discount_rules: rules});
                                       else setNewProp({...newProp, discount_rules: rules});
                                    }} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border border-[var(--border)] focus:border-brand-blue outline-none" />
                                 </div>
                                 <div className="flex-1 space-y-2">
                                    <label className="text-[8px] font-black uppercase opacity-30 ml-2">Discount %</label>
                                    <input type="number" title="Discount Percentage" placeholder="0" value={rule.discount} onChange={e => {
                                       const rules = [...(editingProperty?.discount_rules || newProp.discount_rules || [])];
                                       rules[idx].discount = parseFloat(e.target.value);
                                       if (editingProperty) setEditingProperty({...editingProperty, discount_rules: rules});
                                       else setNewProp({...newProp, discount_rules: rules});
                                    }} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border border-[var(--border)] focus:border-brand-blue outline-none" />
                                 </div>
                                 <button onClick={() => {
                                    const rules = [...(editingProperty?.discount_rules || newProp.discount_rules || [])];
                                    rules.splice(idx, 1);
                                    if (editingProperty) setEditingProperty({...editingProperty, discount_rules: rules});
                                    else setNewProp({...newProp, discount_rules: rules});
                                 }} title="Remove Rule" className="mt-6 p-3 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={14}/></button>
                              </div>
                           ))}
                           {(editingProperty?.discount_rules || newProp.discount_rules || []).length === 0 && (
                              <p className="text-[9px] font-black uppercase opacity-20 text-center py-4 italic">No discount tiers defined.</p>
                           )}
                        </div>
                    </div>

                   <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><MapIcon size={12}/> Map Location</label>
                      <MapPicker 
                         lat={editingProperty?.lat || newProp.lat || 9.0192} 
                         lng={editingProperty?.lng || newProp.lng || 38.7525} 
                         onChange={(lat, lng) => {
                           if (editingProperty) setEditingProperty({...editingProperty, lat, lng});
                           else setNewProp({...newProp, lat, lng});
                         }} 
                         onAddressChange={(location) => {
                           if (editingProperty) setEditingProperty({...editingProperty, location});
                           else setNewProp({...newProp, location});
                         }}
                      />
                   </div>
               </div>

               <div className="lg:col-span-5 space-y-8">
                  <div className="space-y-4">
                     <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-4"><Camera size={12}/> Cover Image</label>
                     <MediaUpload 
                        bucket="property-assets" 
                        onUploadComplete={(url) => {
                          if (editingProperty) setEditingProperty({...editingProperty, cover_image: url});
                          else setNewProp({...newProp, cover_image: url});
                        }} 
                        label="Upload cover image"
                     />
                     {(editingProperty?.cover_image || newProp.cover_image) && (
                        <div className="relative h-40 rounded-2xl overflow-hidden border border-[var(--border)] mt-2">
                           <Image 
                                src={editingProperty?.cover_image || newProp.cover_image || ''} 
                                alt="Property Cover"
                                fill
                                className="w-full h-full object-cover" 
                                sizes="(max-width: 1280px) 100vw, 400px"
                             />
                        </div>
                     )}

                     {editingProperty ? (
                        <div className="pt-8 border-t border-[var(--border)] mt-8">
                           <div className="flex justify-between items-center mb-6">
                              <h4 className="text-sm font-black uppercase tracking-widest opacity-60">Construction Milestones</h4>
                              <button onClick={() => { setActivePropertyId(editingProperty.id); setEditingProgress({ label: '', percentage: 0 }); setShowProgressModal(true); }} className="flex items-center gap-2 text-[10px] font-black uppercase text-brand-blue hover:opacity-70 transition-all"><Plus size={12}/> Add Milestone</button>
                           </div>
                           <div className="space-y-3">
                              {(editingProperty as Property).progress?.map((p: PropertyProgress) => (
                                 <div key={p.id} className="flex items-center justify-between p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] group">
                                    <div>
                                       <p className="text-[10px] font-black uppercase tracking-tighter">{p.label || p.status_text}</p>
                                       <p className="text-[10px] font-bold text-brand-blue">{p.percentage ?? p.percent}%</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => { setActivePropertyId(editingProperty.id); setEditingProgress(p); setShowProgressModal(true); }} className="p-1.5 hover:text-brand-blue transition-colors" title="Edit Milestone"><Settings2 size={12}/></button>
                                       <button onClick={async () => { if(confirm('Delete milestone?')) { await deleteProgress(p.id); fetchProperties(); } }} className="p-1.5 hover:text-red-500 transition-colors" title="Delete Milestone"><Trash2 size={12}/></button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ) : (
                        <div className="pt-8 border-t border-[var(--border)] mt-8 opacity-40 grayscale pointer-events-none">
                           <div className="flex justify-between items-center mb-6">
                              <h4 className="text-sm font-black uppercase tracking-widest">Construction Milestones</h4>
                              <span className="text-[9px] font-black uppercase tracking-widest border border-white/20 px-2 py-1 rounded">Locked</span>
                           </div>
                           <div className="p-6 text-center border border-dashed border-[var(--border)] rounded-2xl">
                              <p className="text-[10px] font-black uppercase tracking-widest">Save property to unlock milestone management.</p>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="p-8 bg-brand-blue/5 rounded-[2.5rem] border border-brand-blue/10 space-y-6">
                     <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-4">ESG Metrics</p>
                     <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                           <label htmlFor="air-quality" className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Air Quality</label>
                           <input id="air-quality" type="number" value={editingProperty?.air_quality_index || newProp.air_quality_index || 0} onChange={e => editingProperty ? setEditingProperty({...editingProperty, air_quality_index: parseInt(e.target.value)}) : setNewProp({...newProp, air_quality_index: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border border-[var(--border)] focus:border-brand-blue outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label htmlFor="heat-delta" className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Heat Delta</label>
                           <input id="heat-delta" type="number" value={editingProperty?.urban_heat_index || newProp.urban_heat_index || 0} onChange={e => editingProperty ? setEditingProperty({...editingProperty, urban_heat_index: parseInt(e.target.value)}) : setNewProp({...newProp, urban_heat_index: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border border-[var(--border)] focus:border-brand-blue outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label htmlFor="env-risk" className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Risk Level</label>
                           <select id="env-risk" value={editingProperty?.env_risk_level || newProp.env_risk_level || 'Low'} onChange={e => editingProperty ? setEditingProperty({...editingProperty, env_risk_level: e.target.value}) : setNewProp({...newProp, env_risk_level: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border border-[var(--border)] focus:border-brand-blue outline-none">
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <button onClick={editingProperty ? handleUpdateProperty : handleCreateProperty} className="w-full py-6 bg-brand-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-95 transition-all">
                     {editingProperty ? 'Update Property' : 'Save Property'}
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Progress Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] w-full max-w-md p-10 shadow-2xl relative">
                <button onClick={() => setShowProgressModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-500/10 rounded-xl transition-all" title="Close"><X size={18}/></button>
                <h4 className="text-xl font-heading font-black tracking-tighter uppercase mb-8">Progress <span className="opacity-30 italic">Editor.</span></h4>
                <div className="space-y-8">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center px-4">
                         <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Milestone Label</label>
                         <span className="text-[10px] font-black text-brand-blue uppercase bg-brand-blue/10 px-2 py-0.5 rounded">Active Phase</span>
                      </div>
                      <input type="text" placeholder="e.g. Foundation Works" title="Milestone Label" value={editingProgress?.label || ''} onChange={e => setEditingProgress({...editingProgress, label: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-sm font-bold focus:border-brand-blue outline-none" />
                   </div>
                   
                   <div className="space-y-6">
                      <div className="flex justify-between items-center px-4">
                         <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Completion Status</label>
                         <span className="text-2xl font-black font-heading text-brand-blue tabular-nums">{editingProgress?.percentage || 0}%</span>
                      </div>
                      <div className="relative h-12 flex items-center">
                         <input 
                           type="range" 
                           min="0" 
                           max="100" 
                           step="1"
                           title="Progress Slider"
                           value={editingProgress?.percentage || 0} 
                           onChange={e => setEditingProgress({...editingProgress, percentage: parseInt(e.target.value)})} 
                           className="w-full h-2 bg-[var(--background)] rounded-full appearance-none cursor-pointer accent-brand-blue border border-[var(--border)]" 
                         />
                      </div>
                      <div className="flex justify-between text-[8px] font-black uppercase opacity-20 tracking-[0.2em] px-2">
                         <span>Initiated</span>
                         <span>Delivered</span>
                      </div>
                   </div>

                   <button onClick={handleSaveProgress} className="w-full py-5 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 transition-all hover:scale-[1.02] active:scale-95">Update Milestone</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unified Inventory Modal */}
      <AnimatePresence>
         {showInventoryModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--card)] rounded-3xl md:rounded-[3.5rem] border border-[var(--border)] w-full max-w-6xl p-6 md:p-12 space-y-6 md:space-y-10 relative overflow-y-auto max-h-[90vh]">
                  <button onClick={() => setShowInventoryModal(false)} aria-label="Close Inventory Modal" title="Close Modal" className="absolute top-10 right-10 w-12 h-12 bg-slate-500/10 rounded-2xl flex items-center justify-center opacity-40 hover:opacity-100 transition-all"><X/></button>
                  
                  <div className="flex justify-between items-end border-b border-[var(--border)] pb-8">
                     <div className="space-y-2">
                        <h4 className="text-4xl font-heading font-black tracking-tighter uppercase">Inventory <span className="opacity-30 italic">Manager.</span></h4>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Property: {properties.find(p => p.id === activePropertyId)?.name}</p>
                     </div>
                     <button 
                        onClick={() => setEditingUnitType({ name: '', beds: 0, baths: 0, sqm: 0, price_from: 0 })} 
                        className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                     >
                        <PlusCircle size={14}/> Add New Unit Type
                     </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                     {/* Unit Type Editor (Inline) */}
                     {editingUnitType && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-brand-blue/5 border border-brand-blue/20 rounded-[2.5rem] p-10 space-y-8">
                           <div className="flex justify-between items-center">
                              <h5 className="text-lg font-black uppercase tracking-tight">{editingUnitType.id ? 'Edit' : 'Configure'} Model Type</h5>
                              <button onClick={() => setEditingUnitType(null)} className="text-[10px] font-black uppercase opacity-40 hover:text-red-500">Cancel</button>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase opacity-40 ml-4">Model Name</label>
                                 <input type="text" title="Model Name" placeholder="e.g. Type A" value={editingUnitType.name} onChange={e => setEditingUnitType({...editingUnitType, name: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase opacity-40 ml-4">Beds / Baths</label>
                                 <div className="flex gap-2">
                                    <input type="number" title="Bedrooms" placeholder="1" value={editingUnitType.beds} onChange={e => setEditingUnitType({...editingUnitType, beds: parseInt(e.target.value)})} className="w-full px-4 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                                    <input type="number" title="Bathrooms" placeholder="1" value={editingUnitType.baths} onChange={e => setEditingUnitType({...editingUnitType, baths: parseFloat(e.target.value)})} className="w-full px-4 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase opacity-40 ml-4">Area (SQM)</label>
                                 <input type="number" title="Area SQM" placeholder="0" value={editingUnitType.sqm} onChange={e => setEditingUnitType({...editingUnitType, sqm: parseInt(e.target.value)})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase opacity-40 ml-4">Base Price</label>
                                 <input type="number" title="Base Price" placeholder="0" value={editingUnitType.price_from} onChange={e => setEditingUnitType({...editingUnitType, price_from: parseInt(e.target.value)})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase opacity-40 ml-4">Availability Status</label>
                                 <select title="Model Status" value={editingUnitType.status || 'available'} onChange={e => setEditingUnitType({...editingUnitType, status: e.target.value as 'available'|'sold_out'})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold uppercase tracking-widest">
                                    <option value="available">Available</option>
                                    <option value="sold_out">Sold Out</option>
                                 </select>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center px-4">
                                 <label className="text-[9px] font-black uppercase opacity-40">Discount / Downpayment Rules</label>
                                 <button onClick={() => setEditingUnitType({...editingUnitType, discount_rules: [...(editingUnitType.discount_rules || []), { downpayment: 0, discount: 0 }]})} className="text-[9px] font-black text-brand-blue uppercase">Add Tier</button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 {editingUnitType.discount_rules?.map((rule, idx) => (
                                    <div key={idx} className="flex gap-2 p-3 bg-white/5 rounded-xl border border-white/5 relative group/rule">
                                       <input type="number" title="Downpayment %" placeholder="DP %" value={rule.downpayment} onChange={e => {
                                          const newRules = [...(editingUnitType.discount_rules || [])];
                                          newRules[idx].downpayment = parseInt(e.target.value);
                                          setEditingUnitType({...editingUnitType, discount_rules: newRules});
                                       }} className="w-full bg-transparent text-[10px] font-bold outline-none" />
                                       <input type="number" title="Discount %" placeholder="Disc %" value={rule.discount} onChange={e => {
                                          const newRules = [...(editingUnitType.discount_rules || [])];
                                          newRules[idx].discount = parseInt(e.target.value);
                                          setEditingUnitType({...editingUnitType, discount_rules: newRules});
                                       }} className="w-full bg-transparent text-[10px] font-bold outline-none text-emerald-500" />
                                       <button onClick={() => {
                                          const newRules = (editingUnitType.discount_rules || []).filter((_, i) => i !== idx);
                                          setEditingUnitType({...editingUnitType, discount_rules: newRules});
                                       }} className="p-1 hover:text-red-500 opacity-0 group-hover/rule:opacity-100 transition-opacity" title="Remove Tier"><X size={10}/></button>
                                    </div>
                                 ))}
                              </div>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[9px] font-black uppercase opacity-40 ml-4">Model Layout / Render</label>
                              <MediaUpload bucket="property-assets" onUploadComplete={url => setEditingUnitType({...editingUnitType, type_image: url})} label="Upload model render" aspect={4/3} />
                              {editingUnitType.type_image && (
                                 <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-brand-blue/20">
                                    <Image src={editingUnitType.type_image} alt="Type Preview" fill className="object-cover" />
                                 </div>
                              )}
                           </div>
                           <button onClick={handleSaveUnitType} className="w-full py-5 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-blue/20">Sync Model Parameters</button>
                        </motion.div>
                     )}

                     {/* Unit Instance Editor (Inline) */}
                     {editingUnitInstance && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] p-10 space-y-8">
                           <div className="flex justify-between items-center">
                              <h5 className="text-lg font-black uppercase tracking-tight">{editingUnitInstance.id ? 'Modify' : 'Deploy'} Unit Node</h5>
                              <button onClick={() => setEditingUnitInstance(null)} className="text-[10px] font-black uppercase opacity-40 hover:text-red-500">Cancel</button>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase opacity-40 ml-4">Unit #</label>
                                 <input type="text" title="Unit Number" placeholder="e.g. 101" value={editingUnitInstance.unit_number} onChange={e => setEditingUnitInstance({...editingUnitInstance, unit_number: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase opacity-40 ml-4">Model Type</label>
                                 <select title="Model Type" value={editingUnitInstance.unit_type_id || ''} onChange={e => setEditingUnitInstance({...editingUnitInstance, unit_type_id: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold uppercase tracking-widest">
                                    <option value="">None / Base</option>
                                    {properties.find(p => p.id === activePropertyId)?.unit_types?.map((ut: UnitType) => (
                                       <option key={ut.id} value={ut.id}>{ut.name}</option>
                                    ))}
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase opacity-40 ml-4">Status</label>
                                 <select title="Unit Status" value={editingUnitInstance.status} onChange={e => setEditingUnitInstance({...editingUnitInstance, status: e.target.value as Unit['status']})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold uppercase tracking-widest">
                                    <option value="available">Available</option>
                                    <option value="reserved">Reserved</option>
                                    <option value="sold">Sold</option>
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase opacity-40 ml-4">Floor</label>
                                 <input type="number" title="Floor Number" placeholder="1" value={editingUnitInstance.floor_number} onChange={e => setEditingUnitInstance({...editingUnitInstance, floor_number: parseInt(e.target.value)})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase opacity-40 ml-4">Premium Price</label>
                                 <input type="number" title="Premium Price" placeholder="0" value={editingUnitInstance.price} onChange={e => setEditingUnitInstance({...editingUnitInstance, price: parseInt(e.target.value)})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center px-4">
                                 <label className="text-[9px] font-black uppercase opacity-40">Unit Specific Discount Tiers</label>
                                 <button onClick={() => setEditingUnitInstance({...editingUnitInstance, discount_rules: [...(editingUnitInstance.discount_rules || []), { downpayment: 0, discount: 0 }]})} className="text-[9px] font-black text-emerald-500 uppercase">Add Rule</button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 {editingUnitInstance.discount_rules?.map((rule, idx) => (
                                    <div key={idx} className="flex gap-2 p-3 bg-white/5 rounded-xl border border-white/5 relative group/rule">
                                       <input type="number" title="Downpayment %" placeholder="DP %" value={rule.downpayment} onChange={e => {
                                          const newRules = [...(editingUnitInstance.discount_rules || [])];
                                          newRules[idx].downpayment = parseInt(e.target.value);
                                          setEditingUnitInstance({...editingUnitInstance, discount_rules: newRules});
                                       }} className="w-full bg-transparent text-[10px] font-bold outline-none" />
                                       <input type="number" title="Discount %" placeholder="Disc %" value={rule.discount} onChange={e => {
                                          const newRules = [...(editingUnitInstance.discount_rules || [])];
                                          newRules[idx].discount = parseInt(e.target.value);
                                          setEditingUnitInstance({...editingUnitInstance, discount_rules: newRules});
                                       }} className="w-full bg-transparent text-[10px] font-bold outline-none text-emerald-500" />
                                       <button onClick={() => {
                                          const newRules = (editingUnitInstance.discount_rules || []).filter((_, i) => i !== idx);
                                          setEditingUnitInstance({...editingUnitInstance, discount_rules: newRules});
                                       }} className="p-1 hover:text-red-500 opacity-0 group-hover/rule:opacity-100 transition-opacity" title="Remove Rule"><X size={10}/></button>
                                    </div>
                                 ))}
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase opacity-40 ml-4">Availability Date / Notes</label>
                                 <input type="text" placeholder="e.g. Ready for Occupancy" value={editingUnitInstance.availability_date || ''} onChange={e => setEditingUnitInstance({...editingUnitInstance, availability_date: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase opacity-40 ml-4">Specific Payment Schedule</label>
                                 <input type="text" placeholder="Overrides model schedule" value={editingUnitInstance.payment_schedule || ''} onChange={e => setEditingUnitInstance({...editingUnitInstance, payment_schedule: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold" />
                              </div>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[9px] font-black uppercase opacity-40 ml-4">Unit Specific Image</label>
                              <MediaUpload bucket="property-assets" onUploadComplete={url => setEditingUnitInstance({...editingUnitInstance, image_url: url})} label="Change unit visual" aspect={16/9} />
                              {editingUnitInstance.image_url && (
                                 <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-emerald-500/20">
                                    <Image src={editingUnitInstance.image_url} alt="Unit Preview" fill className="object-cover" />
                                 </div>
                              )}
                           </div>
                           <button onClick={handleSaveUnitInstance} className="w-full py-5 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20">Sync Unit Node</button>
                        </motion.div>
                     )}

                     {/* Main Inventory List */}
                     <div className="space-y-6">
                        {properties.find(p => p.id === activePropertyId)?.unit_types?.map(ut => (
                           <div key={ut.id} className="bg-[var(--background)] rounded-3xl border border-[var(--border)] overflow-hidden">
                              <div className="p-8 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setExpandedUnitType(expandedUnitType === ut.id ? null : (ut.id || null))}>
                                 <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                                       <Home size={24}/>
                                    </div>
                                    <div>
                                       <h6 className="text-xl font-heading font-black tracking-tight">{ut.name}</h6>
                                       <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{ut.beds} Bed • {ut.baths} Bath • {ut.sqm} SQM</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-12">
                                    <div className="text-right">
                                       <p className="text-[9px] font-black uppercase opacity-30 tracking-widest">Base Value</p>
                                       <p className="text-lg font-heading font-black text-brand-blue">{formatPrice(ut.price_from)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                       <button onClick={(e) => { e.stopPropagation(); setEditingUnitType(ut); }} className="p-4 bg-white/5 rounded-2xl hover:bg-brand-blue hover:text-white transition-all" title="Edit Model"><Settings2 size={18}/></button>
                                       <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete entire unit type?')) deleteUnitType(ut.id!); fetchProperties(); }} className="p-4 bg-white/5 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-red-400" title="Delete Model"><Trash2 size={18}/></button>
                                       <button onClick={(e) => { e.stopPropagation(); setEditingUnitInstance({ unit_type_id: ut.id, status: 'available', price: ut.price_from }); }} className="px-6 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest flex items-center gap-2 border border-emerald-500/20"><Plus size={14}/> Add Unit</button>
                                    </div>
                                 </div>
                              </div>
                              
                              <AnimatePresence>
                                 {expandedUnitType === ut.id && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-[var(--border)] bg-black/20 p-6">
                                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                          {properties.find(p => p.id === activePropertyId)?.units?.filter(u => u.unit_type_id === ut.id).map(unit => (
                                             <div key={unit.id} className="p-5 bg-[var(--card)] rounded-2xl border border-white/5 flex items-center justify-between group">
                                                <div>
                                                   <div className="flex items-center gap-2 mb-1">
                                                      <span className="text-[10px] font-black uppercase tracking-tight">{unit.unit_number}</span>
                                                      <div className={`w-1.5 h-1.5 rounded-full ${unit.status === 'available' ? 'bg-emerald-500' : unit.status === 'reserved' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                                   </div>
                                                   <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Floor {unit.floor_number}</p>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                   <button onClick={() => setEditingUnitInstance(unit)} className="p-2 hover:text-brand-blue" title="Edit"><Settings2 size={14}/></button>
                                                   <button onClick={async () => { if(confirm('Delete unit instance?')) { await deleteUnit(unit.id); fetchProperties(); } }} className="p-2 hover:text-red-500" title="Delete"><Trash2 size={14}/></button>
                                                </div>
                                             </div>
                                          ))}
                                          {properties.find(p => p.id === activePropertyId)?.units?.filter(u => u.unit_type_id === ut.id).length === 0 && (
                                             <div className="col-span-full py-8 text-center text-[9px] font-black uppercase opacity-20 italic">No specific units deployed for this model.</div>
                                          )}
                                       </div>
                                    </motion.div>
                                 )}
                              </AnimatePresence>
                           </div>
                        ))}
                        {(!properties.find(p => p.id === activePropertyId)?.unit_types || properties.find(p => p.id === activePropertyId)?.unit_types?.length === 0) && (
                           <div className="py-20 text-center space-y-4 bg-white/2 rounded-[3rem] border-2 border-dashed border-white/10">
                              <Box size={48} className="mx-auto opacity-10" />
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Registry Empty. Define a unit type to begin.</p>
                           </div>
                        )}
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <PDFViewerModal 
        isOpen={!!viewingPdf}
        onClose={() => setViewingPdf(null)}
        url={viewingPdf?.url || ''}
        title={viewingPdf?.title || ''}
      />
    </motion.div>
  );
}
