            {activeTab === "portfolio" && (
              <motion.div key="portfolio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                 <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm p-8">
                      <div className="flex justify-between items-center mb-8">
                        <h2 className="font-heading text-xl font-black tracking-tight flex items-center gap-3"><Home size={20} className="text-brand-blue" />Property Management</h2>
                        <button onClick={() => setIsAddingProperty(!isAddingProperty)} className="bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-blue/20 transition-all flex items-center gap-2">
                           <Plus size={16} /> {isAddingProperty ? 'Cancel' : 'New Property'}
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {isAddingProperty && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
                             <div className="bg-slate-500/5 rounded-3xl p-6 border border-brand-blue/30 space-y-4">
                                 <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)] opacity-60">Register New Listing</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <input type="text" placeholder="Property Name *" value={newProp.name} onChange={e => setNewProp({...newProp, name: e.target.value})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                   <input type="text" placeholder="Location *" value={newProp.location} onChange={e => setNewProp({...newProp, location: e.target.value})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                   <input type="text" placeholder="Developer" value={newProp.developer} onChange={e => setNewProp({...newProp, developer: e.target.value})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                   <input type="text" placeholder="Amenities (comma separated)" onChange={e => setNewProp({...newProp, amenities: e.target.value.split(',').map(s => s.trim())})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                   
                                   <div className="flex gap-2">
                                     <input type="number" step="any" placeholder="Latitude" value={newProp.lat} onChange={e => setNewProp({...newProp, lat: parseFloat(e.target.value)||0})} className="w-1/2 px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold text-[var(--foreground)]" />
                                     <input type="number" step="any" placeholder="Longitude" value={newProp.lng} onChange={e => setNewProp({...newProp, lng: parseFloat(e.target.value)||0})} className="w-1/2 px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold text-[var(--foreground)]" />
                                   </div>

                                   <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2">
                                     <div className="space-y-1">
                                       <label className="text-[10px] font-black uppercase opacity-40 ml-1">Discount %</label>
                                       <input type="number" placeholder="Discount %" min={0} max={100} value={newProp.discount_percentage} onChange={e => setNewProp({...newProp, discount_percentage: parseInt(e.target.value)||0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold text-[var(--foreground)]" />
                                     </div>
                                     <div className="space-y-1">
                                       <label className="text-[10px] font-black uppercase opacity-40 ml-1">Downpay %</label>
                                       <input type="number" placeholder="Downpayment %" min={0} max={100} value={newProp.downpayment_percentage} onChange={e => setNewProp({...newProp, downpayment_percentage: parseInt(e.target.value)||0})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold text-[var(--foreground)]" />
                                     </div>
                                     <div className="space-y-1">
                                       <label className="text-[10px] font-black uppercase opacity-40 ml-1">Schedule</label>
                                       <select title="Payment Schedule" value={newProp.payment_schedule} onChange={e => setNewProp({...newProp, payment_schedule: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-bold text-[var(--foreground)]">
                                         <option value="Flexible Terms">Flexible</option>
                                         <option value="Quarterly">Quarterly</option>
                                         <option value="Semi-Annual">Semi-Annual</option>
                                         <option value="Annual">Annual</option>
                                         <option value="Cash">Cash Only</option>
                                         <option value="Mortgage">Bank Finance</option>
                                       </select>
                                     </div>
                                   </div>
                                 </div>
                                 <textarea placeholder="Description" rows={2} value={newProp.description} onChange={e => setNewProp({...newProp, description: e.target.value})} className="w-full px-4 py-3 bg-[var(--background)] rounded-xl text-sm font-medium text-[var(--foreground)] resize-none" />
                                 
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Cover Photo</label>
                                    <div className="flex gap-3 items-center">
                                      <input type="text" placeholder="Image URL..." value={newProp.cover_image} onChange={e => setNewProp({...newProp, cover_image: e.target.value})} className="flex-1 px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                                      <label className="flex items-center gap-2 px-4 py-3 bg-brand-blue/10 text-brand-blue rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-brand-blue/20 transition-all">
                                        <Upload size={14} />
                                        {uploadingImage ? 'Uploading...' : 'Upload'}
                                        <input type="file" accept="image/*" className="hidden" onChange={async e => {
                                          const file = e.target.files?.[0]; if (!file) return;
                                          const url = await uploadFile(file);
                                          if (url) setNewProp({...newProp, cover_image: url});
                                        }} />
                                      </label>
                                    </div>
                                 </div>

                                 <div className="bg-slate-500/5 rounded-2xl p-6 border border-brand-blue/10 space-y-4">
                                   <div className="flex justify-between items-center">
                                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue">Initial Unit Registry</h4>
                                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{newProp.units.length} Units</span>
                                   </div>
                                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <input type="text" placeholder="Type" value={newUnit.type} onChange={e => setNewUnit({...newUnit, type: e.target.value})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                                      <input type="number" placeholder="Beds" value={newUnit.beds} onChange={e => setNewUnit({...newUnit, beds: parseInt(e.target.value) || 0})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                                      <input type="number" placeholder="Baths" value={newUnit.baths} onChange={e => setNewUnit({...newUnit, baths: parseFloat(e.target.value) || 0})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                                      <input type="number" placeholder="Price" value={newUnit.price} onChange={e => setNewUnit({...newUnit, price: parseInt(e.target.value) || 0})} className="px-4 py-3 bg-[var(--background)] rounded-xl text-xs font-bold text-[var(--foreground)]" />
                                   </div>
                                   <button type="button" onClick={() => { if (!newUnit.type || !newUnit.price) return; setNewProp({ ...newProp, units: [...newProp.units, { ...newUnit }] }); setNewUnit({ type: '', beds: 1, baths: 1, sqm: 50, price: 2000000, variety_img: '', is_sold: false }); }} className="w-full py-2 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-brand-blue hover:text-white transition-all">Add Unit Type to Draft</button>
                                 </div>

                                 <button onClick={handleCreateProperty} disabled={uploadingImage} className="w-full bg-brand-blue text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg mt-2 hover:shadow-brand-blue/20 transition-all">
                                    {uploadingImage ? 'Synchronizing...' : 'Finalize & Publish Listing'}
                                 </button>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                         {loading ? (
                            <div className="col-span-full py-12 text-center opacity-40 italic">Decrypting Registry...</div>
                         ) : properties.map((prop) => {
                           const progress = prop.progress?.[0];
                           const discount = (prop as unknown as Record<string, unknown>).discount_percentage as number | undefined;
                           const paySchedule = (prop as unknown as Record<string, unknown>).payment_schedule as string | undefined;
                           return (
                            <div key={prop.id} className="bg-slate-500/5 border border-white/5 rounded-3xl overflow-hidden hover:border-brand-blue/30 transition-all group flex flex-col shadow-lg">
                               <div className="p-6 flex-1 relative">
                                  <div className="flex justify-between items-start mb-4">
                                     <h3 className="font-heading font-black text-lg text-[var(--foreground)] pr-16">{prop.name}</h3>
                                     <div className="absolute top-5 right-5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => setEditingProperty(prop)} title="Edit Property" className="text-brand-blue bg-brand-blue/10 p-2 rounded-lg"><Edit3 size={14}/></button>
                                       <button onClick={() => setConfirmDelete({ type: 'property', id: prop.id, name: prop.name })} title="Delete Property" className="text-red-400 bg-red-400/10 p-2 rounded-lg"><Trash2 size={14}/></button>
                                     </div>
                                  </div>
                                  <p className="text-xs font-bold opacity-60 text-[var(--foreground)] mb-1">{prop.location}</p>
                                  <p className="text-[10px] uppercase tracking-widest font-black text-brand-blue mb-3">{prop.developer}</p>

                                  <div className="flex gap-2 mb-4 flex-wrap">
                                    {discount && discount > 0 ? (
                                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg uppercase tracking-widest">{discount}% OFF</span>
                                    ) : null}
                                    {paySchedule && (
                                      <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-lg uppercase tracking-widest">{paySchedule}</span>
                                    )}
                                  </div>

                                  {progress && (
                                    <div className="mb-4">
                                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/40 mb-1">
                                        <span>{progress.status_text || progress.status}</span>
                                        <span>{progress.percent}%</span>
                                      </div>
                                      <div className="h-1.5 bg-slate-500/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-blue rounded-full transition-all" style={{ width: `${progress.percent}%` }} />
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-2">
                                      {prop.amenities && prop.amenities.slice(0,3).map((am: string, i: number) => (
                                          <span key={i} className="px-2 py-1 bg-[var(--background)] text-[10px] font-bold rounded-md uppercase text-[var(--foreground)]/60">{am}</span>
                                      ))}
                                  </div>
                               </div>
                               <div className="bg-[var(--background)]/50 border-t border-[var(--border)] overflow-hidden transition-all duration-500">
                                  <button onClick={() => togglePropertyUnits(prop.id)} className="w-full p-4 flex justify-between items-center group/btn">
                                     <span className="text-xs font-bold text-[var(--foreground)]/40 flex items-center gap-2">
                                        {prop.units?.length || 0} Units Registered
                                        {expandedProperties.has(prop.id) ? <Plus size={14} className="rotate-45 transition-transform" /> : <Plus size={14} className="transition-transform" />}
                                     </span>
                                     <span className="text-brand-blue text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                        {expandedProperties.has(prop.id) ? 'Collapse Inventory' : 'Expand inventory'}
                                     </span>
                                  </button>

                                  <AnimatePresence>
                                     {expandedProperties.has(prop.id) && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4 space-y-2 border-t border-[var(--border)] pt-4">
                                           {prop.units && prop.units.length > 0 ? prop.units.map((unit) => (
                                              <div key={unit.id} className="bg-[var(--background)] p-3 rounded-2xl border border-[var(--border)] flex justify-between items-center group/unit">
                                                 <div className="flex-1">
                                                    <p className="font-bold text-xs text-[var(--foreground)]">{unit.type}</p>
                                                    <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{unit.beds}B • {unit.baths}Ba • {unit.sqm}SQM</p>
                                                    <p className="text-[10px] font-black text-brand-blue mt-1">{formatPrice(unit.price)}</p>
                                                 </div>
                                                 <div className="flex gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingUnit(unit); setNewUnit({ type: unit.type, beds: unit.beds, baths: unit.baths, sqm: unit.sqm, price: unit.price, variety_img: unit.variety_img || '', is_sold: unit.is_sold || false }); setSelectedPropertyId(prop.id); }} title="Edit Unit" className="p-1.5 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"><Edit3 size={12}/></button>
                                                    <button onClick={async (e) => { e.stopPropagation(); if (!confirm(`Delete ${unit.type}?`)) return; try { const { error } = await supabaseClient.from('property_units').delete().eq('id', unit.id); if (!error) { notify('success', 'Unit purged.'); fetchProperties(); } else throw error; } catch { notify('error', 'Sync failure.'); } }} title="Delete Unit" className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={12}/></button>
                                                 </div>
                                              </div>
                                           )) : (
                                              <div className="py-4 text-center opacity-40 text-[10px] italic">No units listed.</div>
                                           )}
                                           <button onClick={() => setSelectedPropertyId(prop.id)} className="w-full py-2 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-blue transition-all hover:text-white">Add Units to Registry</button>
                                        </motion.div>
                                     )}
                                  </AnimatePresence>
                               </div>
                            </div>
                           );
                         })}
                      </div>
                 </div>
              </motion.div>
            )}
