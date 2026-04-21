with open('src/app/admin/_components/ContentTabs.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# --- Patch 1: Add Actions th ---
old_th = 'opacity-40 text-right\">Audience</th>\n              </tr>\n           </thead>'
new_th = 'opacity-40 text-right\">Audience</th>\n                 <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest opacity-40 text-right">Actions</th>\n              </tr>\n           </thead>'
if old_th in c:
    c = c.replace(old_th, new_th, 1)
    print('thead patched OK')
else:
    print('thead NOT found')

# --- Patch 2: Update campaign row ---
old_row = ('hover:bg-brand-blue/5 transition-all">\n'
           '                  <td className="px-8 py-6 text-xs font-bold opacity-60 tabular-nums">{new Date(c.created_at).toLocaleDateString()}</td>\n'
           '                  <td className="px-8 py-6 text-sm font-bold">{c.subject}</td>\n'
           '                  <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-blue text-right">{c.audience_size.toLocaleString()} Contacts</td>\n'
           '                </tr>')

new_row = ('hover:bg-brand-blue/5 transition-all group">\n'
           '                  <td className="px-8 py-6 text-xs font-bold opacity-60 tabular-nums">{new Date(c.created_at).toLocaleDateString()}</td>\n'
           '                  <td className="px-8 py-6 text-sm font-bold">{c.subject}</td>\n'
           '                  <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-brand-blue text-right whitespace-nowrap">{c.audience_size.toLocaleString()} Contacts</td>\n'
           '                  <td className="px-8 py-6">\n'
           '                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">\n'
           '                      <button onClick={() => onRepeatCampaign({ subject: c.subject, body: c.body ?? \'\', targetFilter: c.target_filter ?? \'\' })} title="Edit & Repeat" aria-label="Edit and Repeat Campaign" className="px-3 py-2 rounded-lg bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all flex items-center gap-1"><Edit3 size={11} /> Edit &amp; Repeat</button>\n'
           '                      <button onClick={() => onRepeatCampaign({ subject: \'\', body: \'\', targetFilter: c.target_filter ?? \'\' })} title="Same Leads" aria-label="Reuse Campaign Audience" className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1"><Users size={11} /> Same Leads</button>\n'
           '                    </div>\n'
           '                  </td>\n'
           '                </tr>')

if old_row in c:
    c = c.replace(old_row, new_row, 1)
    print('Row patched OK')
else:
    print('Row NOT found')

with open('src/app/admin/_components/ContentTabs.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('Done.')
