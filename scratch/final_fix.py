import os

def fix():
    path = 'src/app/admin/page.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The corrupted sequence is literal \\n
    # It looks like: }, []);\\n\\n  const syncNews
    # Note: in python string, \\\\n represents literal \\n
    
    corrupted = '}, []);\\n\\n  const syncNews'
    fixed = '}, []);\n\n  const syncNews'
    
    if corrupted in content:
        content = content.replace(corrupted, fixed)
        print("Fixed corrupted literal newlines.")
    else:
        # Try finding one backslash version
        corrupted_2 = '}, []);\n\n  const syncNews' # This wouldn't be corrupted
        print("Corrupted sequence not found exactly. Searching for variations...")
        # Just search for the problematic line and split it
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            if 'const syncNews =' in line and '\\n' in line:
                 parts = line.split('\\n')
                 for part in parts:
                     new_lines.append(part.strip())
            else:
                 new_lines.append(line)
        content = '\n'.join(new_lines)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    fix()
