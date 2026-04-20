const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix handleUpdateProperty payload (Add lat/lng)
const updatePayloadPattern = /const updatePayload: Record<string, unknown> = \{[^}]+payment_schedule: editingProperty\.payment_schedule \?\? 'Flexible Terms',/g;
const updatePayloadReplacement = `const updatePayload: Record<string, unknown> = {
        name: editingProperty.name,
        location: editingProperty.location,
        developer: editingProperty.developer,
        description: editingProperty.description || null,
        lat: editingProperty.lat,
        lng: editingProperty.lng,
        amenities: editingProperty.amenities || [],
        discount_percentage: editingProperty.discount_percentage ?? 0,
        downpayment_percentage: editingProperty.downpayment_percentage ?? 0,
        payment_schedule: editingProperty.payment_schedule ?? 'Flexible Terms',`;

if (content.match(updatePayloadPattern)) {
    console.log('Updating handleUpdateProperty payload...');
    content = content.replace(updatePayloadPattern, updatePayloadReplacement);
}

// 2. Expand 'Edit Property' Form UI
// I'll search for the editingProperty block and add the missing fields
const editFormPattern = /<input type="text" placeholder="Location" value=\{editingProperty\.location\} onChange=\{e => setEditingProperty\(\{ \.\.\.editingProperty, location: e\.target\.value \}\)\} className="px-4 py-3 bg-slate-500\/5 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-\[var\(--foreground\)\]" \/>/g;
const editFormReplacement = `<input type="text" placeholder="Location" value={editingProperty.location} onChange={e => setEditingProperty({ ...editingProperty, location: e.target.value })} className="px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                     <input type="text" placeholder="Developer" value={editingProperty.developer} onChange={e => setEditingProperty({ ...editingProperty, developer: e.target.value })} className="px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-brand-blue text-[var(--foreground)]" />
                                     <div className="flex gap-2">
                                       <input type="number" step="any" placeholder="Latitude" value={editingProperty.lat} onChange={e => setEditingProperty({ ...editingProperty, lat: parseFloat(e.target.value) || 0 })} className="w-1/2 px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-bold" />
                                       <input type="number" step="any" placeholder="Longitude" value={editingProperty.lng} onChange={e => setEditingProperty({ ...editingProperty, lng: parseFloat(e.target.value) || 0 })} className="w-1/2 px-4 py-3 bg-slate-500/5 rounded-xl text-sm font-bold" />
                                     </div>`;

if (content.indexOf('placeholder="Location" value={editingProperty.location}') !== -1) {
    console.log('Updating Edit Property Form UI...');
    content = content.replace(editFormPattern, editFormReplacement);
}

// 3. Global PDF persistence fix (Payload simplicity)
const postPayloadPattern = /const payload = editingPost\s*\?\s*\{ title: editingPost\.title,[^;]+: newPost;/g;
const postPayloadReplacement = `const payload = editingPost 
                                     ? { ...editingPost } 
                                     : { ...newPost };`;

if (content.match(postPayloadPattern)) {
    console.log('Simplifying Article Save payload...');
    content = content.replace(postPayloadPattern, postPayloadReplacement);
}

fs.writeFileSync(filePath, content);
console.log('Sync Finalized.');
