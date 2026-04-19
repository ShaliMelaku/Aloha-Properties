import sys

def main():
    try:
        with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
            content = f.read()

        start_marker = '{selectedPropertyId && ('
        
        start_idx = content.rfind('<AnimatePresence>', 0, content.find(start_marker))
        
        idx = content.find('Unit Manager</h3>')
        if idx == -1:
            print('Unit Manager not found')
            sys.exit(1)
            
        end_idx = content.find('</AnimatePresence>', idx)
        if end_idx != -1:
            end_idx += len('</AnimatePresence>')
            
        if start_idx == -1 or end_idx == -1:
            print('Failed to find markers')
            sys.exit(1)

        new_modal = """<AnimatePresence>
            {selectedPropertyId && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPropertyId(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                 <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl bg-[var(--background)] rounded-[2.5rem] border border-[var(--border)] p-8 pb-12 shadow-2xl max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                       <div className="flex items-center gap-4">
                         <h3 className="text-2xl font-heading font-black tracking-tight uppercase text-[var(--foreground)]">Unit Manager</h3>
                         <div className="flex bg-[var(--card)] rounded-xl border border-[var(--border)] p-1">
                           <button onClick={() => setUnitManagerTab('types')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${unitManagerTab === 'types' ? 'bg-brand-blue text-white' : 'text-[var(--foreground)]/40 hover:text-[var(--foreground)]'}`}>Unit Types</button>
                           <button onClick={() => setUnitManagerTab('units')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${unitManagerTab === 'units' ? 'bg-brand-blue text-white' : 'text-[var(--foreground)]/40 hover:text-[var(--foreground)]'}`}>Individual Units</button>
                         </div>
                       </div>
                       <button onClick={() => setSelectedPropertyId(null)} className="text-[var(--foreground)]/40 hover:text-red-400 font-bold text-sm tracking-widest uppercase">Close</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                      {unitManagerTab === 'types' && (
                        <>
                          <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
                              <div className="flex justify-between items-center mb-4">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">{editingUnitType ? 'Edit Unit Type' : 'Add New Unit Type'}</h4>
                                 {editingUnitType && (
                                   <button onClick={() => { 
                                     setEditingUnitType(null); 
                                     setNewUnitType({ name: '', beds: 1, baths: 1, sqm: 50, price_from: 2000000, type_image: '', total_units: 1, discount_percentage: 0, downpayment_percentage: 0, description: '' }); 
                                   }} className="text-[9px] font-black text-brand-blue uppercase hover:underline">Cancel Edit</button>
                                 )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase opacity-40 ml-2">Type Name</label>
                                   <input type="text" placeholder="e.g. 2 Bedroom Deluxe" value={newUnitType.name || ''} onChange={e => setNewUnitType({...newUnitType, name: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-1">
                                     <label className="text-[9px] font-black uppercase opacity-40 ml-2">Base Price (ETB)</label>
                                     <input type="number" placeholder="Price Minimum" value={newUnitType.price_from || ''} onChange={e => setNewUnitType({...newUnitType, price_from: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                   </div>
                                   <div className="space-y-1">
                                     <label className="text-[9px] font-black uppercase opacity-40 ml-2">Total Units</label>
                                     <input type="number" placeholder="Count" value={newUnitType.total_units || ''} onChange={e => setNewUnitType({...newUnitType, total_units: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                   </div>
                                 </div>
                              </div>
                              
                              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                 <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase opacity-40 ml-2">Beds</label>
                                   <input type="number" value={newUnitType.beds || ''} onChange={e => setNewUnitType({...newUnitType, beds: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                 </div>
                                 <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase opacity-40 ml-2">Baths</label>
                                   <input type="number" step="0.5" value={newUnitType.baths || ''} onChange={e => setNewUnitType({...newUnitType, baths: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                 </div>
                                 <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase opacity-40 ml-2">SQM</label>
                                   <input type="number" value={newUnitType.sqm || ''} onChange={e => setNewUnitType({...newUnitType, sqm: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                 </div>
                                 <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase opacity-40 ml-2">Discount %</label>
                                   <input type="number" value={newUnitType.discount_percentage || ''} onChange={e => setNewUnitType({...newUnitType, discount_percentage: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                 </div>
                              </div>
      
                              <div className="mt-4 space-y-1">
                                  <label className="text-[9px] font-black uppercase opacity-40 ml-2">Type Thumbnail / Floorplan</label>
                                  <div className="flex gap-2">
                                    <input type="text" placeholder="Image URL" value={newUnitType.type_image || ''} onChange={e => setNewUnitType({...newUnitType, type_image: e.target.value})} className="flex-1 px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                    <div className="relative">
                                       <input 
                                          type="file" 
                                          title="Upload Type Graphic"
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                          onChange={async (e) => {
                                             const file = e.target.files?.[0]; if (!file) return;
                                             setIsUploadingVarietyImg(true);
                                             try { const url = await uploadFile(file, 'aloha-assets', 'unit_types'); if (url) setNewUnitType(prev => ({...prev, type_image: url})); }
                                             finally { setIsUploadingVarietyImg(false); }
                                          }}
                                       />
                                       <button title="Upload" disabled={isUploadingVarietyImg} className={`h-[42px] px-4 rounded-xl flex items-center justify-center transition-all ${isUploadingVarietyImg ? 'bg-brand-blue text-white bg-progress-stripes pointer-events-none' : 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20'}`}>
                                          {isUploadingVarietyImg ? <Activity size={16} className="animate-spin" /> : <Upload size={16}/>}
                                       </button>
                                    </div>
                                  </div>
                              </div>
      
                              <button onClick={handleSaveUnitType} className="w-full mt-6 bg-brand-blue text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all">
                                 {editingUnitType ? 'Save Type Changes' : 'Register Unit Type'}
                              </button>
                          </div>
                          
                          <div className="space-y-2">
                             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 text-[var(--foreground)]">Registered Types</h4>
                             {properties.find(p => p.id === selectedPropertyId)?.unit_types?.map((ut) => (
                                <div key={ut.id} className="flex items-center justify-between p-4 bg-slate-500/5 rounded-xl border border-transparent hover:border-brand-blue/20 transition-all">
                                   <div className="flex items-center gap-4">
                                      {ut.type_image && <Image src={ut.type_image} alt={ut.name} width={40} height={40} className="rounded-lg object-cover" unoptimized />}
                                      <div>
                                        <p className="font-bold text-sm text-[var(--foreground)]">{ut.name}</p>
                                        <p className="text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-widest mt-1">{ut.beds} Beds • {ut.baths} Baths • {ut.sqm} SQM • Total: {ut.total_units}</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <p className="font-black text-brand-blue">{formatPrice(ut.price_from)}</p>
                                      <div className="flex justify-end gap-3">
                                         <button onClick={() => { setEditingUnitType(ut); setNewUnitType(ut); }} className="text-[10px] text-brand-blue font-black uppercase tracking-widest hover:underline">Edit</button>
                                         <button onClick={async () => {
                                             if(!confirm(`Delete ${ut.name}?`)) return;
                                             try { await supabaseClient.from('property_unit_types').delete().eq('id', ut.id); fetchProperties(); } catch { notify('error','Failed to delete type');}
                                         }} className="text-[10px] text-red-500 font-black uppercase tracking-widest hover:underline">Delete</button>
                                      </div>
                                   </div>
                                </div>
                             ))}
                             {(!properties.find(p => p.id === selectedPropertyId)?.unit_types?.length) && (
                                  <div className="p-8 text-center bg-slate-500/5 rounded-xl border border-dashed border-[var(--border)]">
                                     <p className="text-xs font-bold text-[var(--foreground)] opacity-40">No unit types defined yet.</p>
                                  </div>
                             )}
                          </div>
                        </>
                      )}

                      {unitManagerTab === 'units' && (
                        <>
                          <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
                              <div className="flex justify-between items-center mb-4">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">{editingUnit ? 'Edit Unit' : 'Add Individual Unit'}</h4>
                                 {editingUnit && (
                                   <button onClick={() => { setEditingUnit(null); setNewUnit({ unit_number: '', floor_number: 1, status: 'available', price: 0, notes: '' }); }} className="text-[9px] font-black text-brand-blue uppercase hover:underline">Cancel Edit</button>
                                 )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                 <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase opacity-40 ml-2">Unit Type Mapping</label>
                                   <select value={newUnit.unit_type_id || ''} onChange={e => setNewUnit({...newUnit, unit_type_id: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]">
                                     <option value="" disabled>Select Type...</option>
                                     {properties.find(p => p.id === selectedPropertyId)?.unit_types?.map(ut => (
                                       <option key={ut.id} value={ut.id}>{ut.name}</option>
                                     ))}
                                   </select>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-1">
                                     <label className="text-[9px] font-black uppercase opacity-40 ml-2">Unit Number</label>
                                     <input type="text" placeholder="A-101" value={newUnit.unit_number || ''} onChange={e => setNewUnit({...newUnit, unit_number: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                   </div>
                                   <div className="space-y-1">
                                     <label className="text-[9px] font-black uppercase opacity-40 ml-2">Floor</label>
                                     <input type="number" value={newUnit.floor_number || ''} onChange={e => setNewUnit({...newUnit, floor_number: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                   </div>
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase opacity-40 ml-2">Status</label>
                                   <select value={newUnit.status || 'available'} onChange={e => setNewUnit({...newUnit, status: e.target.value as any})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]">
                                     <option value="available">Available</option>
                                     <option value="reserved">Reserved</option>
                                     <option value="sold">Sold</option>
                                   </select>
                                 </div>
                                 <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase opacity-40 ml-2">Custom Price Override (Optional)</label>
                                   <input type="number" placeholder="Leaves blank to use Unit Type price" value={newUnit.price || ''} onChange={e => setNewUnit({...newUnit, price: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                 </div>
                              </div>
                              <button onClick={handleSaveUnit} className="w-full mt-6 bg-brand-blue text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all">
                                 {editingUnit ? 'Save Unit State' : 'Track New Unit'}
                              </button>
                          </div>
                          
                          <div className="space-y-2">
                             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 text-[var(--foreground)]">Individual Units</h4>
                             {properties.find(p => p.id === selectedPropertyId)?.units?.map((u) => {
                               const typeDef = properties.find(p => p.id === selectedPropertyId)?.unit_types?.find((ut) => ut.id === u.unit_type_id);
                               return (
                                <div key={u.id} className="flex items-center justify-between p-4 bg-slate-500/5 rounded-xl border border-transparent hover:border-brand-blue/20 transition-all">
                                   <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm text-[var(--foreground)]">{u.unit_number || 'Unnamed Unit'}</p>
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${u.status === 'sold' ? 'bg-red-500/20 text-red-400' : u.status === 'reserved' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{u.status}</span>
                                      </div>
                                      <p className="text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-widest mt-1">
                                        {typeDef ? typeDef.name : (u.type || 'Legacy')} • Floor {u.floor_number || '-'}
                                      </p>
                                   </div>
                                   <div className="text-right">
                                      <p className="font-black text-brand-blue">{formatPrice(u.price || typeDef?.price_from || 0)}</p>
                                      <div className="flex justify-end gap-3">
                                         <button onClick={() => { setEditingUnit(u); setNewUnit(u); }} className="text-[10px] text-brand-blue font-black uppercase tracking-widest hover:underline">Edit</button>
                                         <button onClick={async () => {
                                             if(!confirm(`Delete unit ${u.unit_number}?`)) return;
                                             try { await supabaseClient.from('property_units').delete().eq('id', u.id); fetchProperties(); } catch { notify('error','Failed to delete'); }
                                         }} className="text-[10px] text-red-500 font-black uppercase tracking-widest hover:underline">Delete</button>
                                      </div>
                                   </div>
                                </div>
                               );
                             })}
                             {(!properties.find(p => p.id === selectedPropertyId)?.units?.length) && (
                                  <div className="p-8 text-center bg-slate-500/5 rounded-xl border border-dashed border-[var(--border)]">
                                     <p className="text-xs font-bold text-[var(--foreground)] opacity-40">No individual units tracked yet.</p>
                                  </div>
                             )}
                          </div>
                        </>
                      )}
                    </div>
                 </motion.div>
              </div>
            )}
          </AnimatePresence>"""

        content = content[:start_idx] + new_modal + content[end_idx:]

        with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
            f.write(content)

        print('Success: Replaced Unit Manager Modal with Tabs and Unit Type handling')
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
