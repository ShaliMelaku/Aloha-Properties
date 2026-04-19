import re

def main():
    try:
        with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = content.replace(
            "env_risk_level: 'Low', units: [] });",
            "env_risk_level: 'Low', unit_types: [], units: [] });"
        )

        content = content.replace(
            '<p className="font-black text-brand-blue">{formatPrice(u.price)}</p>',
            '<p className="font-black text-brand-blue">{formatPrice(u.price || 0)}</p>'
        )

        old_prop = """export interface Property {
  id: string;
  name: string;
  developer: string;
  location: string;
  cover_image: string;
  lat: number;
  lng: number;
  units: Unit[];
  progress: Progress[];"""

        new_prop = """export interface Property {
  id: string;
  name: string;
  developer: string;
  location: string;
  cover_image: string;
  lat: number;
  lng: number;
  unit_types: UnitType[];
  units: Unit[];
  progress: Progress[];"""

        if old_prop in content:
            content = content.replace(old_prop, new_prop)
            print('Found and updated Property interface')
        else:
            print('Property interface not found exactly, doing fuzzy match')
            idx = content.find('export interface Property {')
            if idx != -1:
                end_idx = content.find('}', idx)
                prop_block = content[idx:end_idx+1]
                if 'unit_types' not in prop_block:
                    content = content.replace(prop_block, prop_block.replace('units: Unit[];', 'unit_types: UnitType[];\n  units: Unit[];'))
                    print('Fuzzy updated Property interface')

        content = re.sub(r'\.unit_types\?\.map\(\s*\(ut\)\s*=>', '.unit_types?.map((ut: UnitType) =>', content)
        content = re.sub(r'\.unit_types\?\.map\(\s*ut\s*=>', '.unit_types?.map((ut: UnitType) =>', content)
        content = re.sub(r'\.unit_types\?\.find\(\s*\(ut\)\s*=>', '.unit_types?.find((ut: UnitType) =>', content)
        content = re.sub(r'\.unit_types\?\.find\(\s*ut\s*=>', '.unit_types?.find((ut: UnitType) =>', content)

        with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
            
        print("All patches applied.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
