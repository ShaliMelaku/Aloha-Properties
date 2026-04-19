import re

def main():
    with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the button and remove it
    start_str = '<button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}'
    idx = content.find(start_str)
    if idx != -1:
        end_idx = content.find('</button>', idx)
        if end_idx != -1:
             end_idx += len('</button>')
             content = content[:idx] + content[end_idx:]

    content = content.replace('const { theme, setTheme } = useTheme();', '')
    content = content.replace('import { useTheme } from "next-themes";', '')

    with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Theme removed from admin")

if __name__ == '__main__':
    main()
