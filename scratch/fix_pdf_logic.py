import re

def main():
    path = 'src/app/market-trends/page.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the replacement block
    replacement = """                                <button 
                                 onClick={() => setSelectedPost(pub)}
                                 className="flex-1 py-3 bg-brand-blue/5 border border-brand-blue/10 text-brand-blue rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2"
                               >
                                 View Details <ArrowRight size={14} />
                               </button>"""

    # Loose regex to find the button block starting from onClick={() => { const isPDF...
    # and ending with the closing </button>
    pattern = r'<button\s+onClick=\{\(\)\s+=>\s+\{\s+const\s+isPDF.*?</button>'
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully updated MarketTrendsHub PDF logic.")
    else:
        print("Pattern not found in MarketTrendsHub.")

if __name__ == "__main__":
    main()
