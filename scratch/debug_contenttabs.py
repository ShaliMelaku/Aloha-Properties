with open('src/app/admin/_components/ContentTabs.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Find exact markers
idx = c.find('hover:bg-brand-blue/5 transition-all')
print("ROW SNIPPET:")
print(repr(c[idx:idx+500]))

idx2 = c.find('>Audience</th>')
print("\nTHEAD SNIPPET:")
print(repr(c[idx2-200:idx2+200]))
