import re

def main():
    try:
        with open('src/components/compare-bar.tsx', 'r', encoding='utf-8') as f:
            content = f.read()

        old_logic = """  const topValueProperty = compared.length >= 2 ? compared.reduce((prev: SupabaseProperty, curr: SupabaseProperty) => {
    const prevAvg = (prev.units?.reduce((acc: number, u: { price: number; sqm: number }) => acc + (u.price / u.sqm), 0) || 0) / (prev.units?.length || 1);
    const currAvg = (curr.units?.reduce((acc: number, u: { price: number; sqm: number }) => acc + (u.price / u.sqm), 0) || 0) / (curr.units?.length || 1);
    return prevAvg < currAvg ? prev : curr;
  }) : null;"""

        new_logic = """  const getAvgSqmPrice = (prop: SupabaseProperty) => {
    if (prop.unit_types && prop.unit_types.length > 0) {
      const validTypes = prop.unit_types.filter(ut => (ut.price_from || 0) > 0 && (ut.sqm || 0) > 0);
      if (validTypes.length === 0) return 0;
      return validTypes.reduce((acc, ut) => acc + ((ut.price_from || 0) / (ut.sqm || 1)), 0) / validTypes.length;
    }
    const units = prop.units || [];
    const validUnits = units.filter(u => u.price && u.sqm && u.price > 0 && u.sqm > 0);
    if (validUnits.length === 0) return 0;
    return validUnits.reduce((acc, u) => acc + ((u.price || 0) / (u.sqm || 1)), 0) / validUnits.length;
  };

  const getMinPrice = (prop: SupabaseProperty) => {
    if (prop.unit_types && prop.unit_types.length > 0) {
      return Math.min(...prop.unit_types.map(ut => ut.price_from || 0));
    }
    const prices = prop.units?.map(u => u.price || 0).filter(p => p > 0) || [];
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const getImage = (prop: SupabaseProperty) => {
    return prop.unit_types?.[0]?.type_image || prop.units?.[0]?.variety_img || prop.cover_image || "/images/cover.jpg";
  };

  const topValueProperty = compared.length >= 2 ? compared.reduce((prev: SupabaseProperty, curr: SupabaseProperty) => {
    return getAvgSqmPrice(prev) < getAvgSqmPrice(curr) ? prev : curr;
  }) : null;"""

        content = content.replace(old_logic, new_logic)

        content = content.replace(
            'src={prop.units?.[0]?.variety_img || "/images/cover.jpg"}',
            'src={getImage(prop)}'
        )

        content = content.replace(
            'const minPrice = Math.min(...(prop.units?.map((u: { price: number }) => u.price) || [0]));',
            'const minPrice = getMinPrice(prop);'
        )

        content = content.replace(
            'const units = prop.units || [];\n                    const avgSqm = units.length > 0 ? units.reduce((acc: number, u: { price: number; sqm: number }) => acc + (u.price / u.sqm), 0) / units.length : 0;',
            'const avgSqm = getAvgSqmPrice(prop);'
        )

        content = content.replace(
            "{ icon: Building2, label: 'Start Price', getValue: (p: SupabaseProperty) => formatPrice(Math.min(...(p.units?.map((u: { price: number }) => u.price) || [0]))), highlight: true }",
            "{ icon: Building2, label: 'Start Price', getValue: (p: SupabaseProperty) => formatPrice(getMinPrice(p)), highlight: true }"
        )

        content = content.replace(
            "{ icon: LandPlot, label: 'Avg SQM Price', getValue: (p: SupabaseProperty) => { const u = p.units||[]; const avg = u.length>0?u.reduce((a:number,v:{price:number;sqm:number})=>a+(v.price/v.sqm),0)/u.length:0; return `${formatPrice(avg)} / m²`; } }",
            "{ icon: LandPlot, label: 'Avg SQM Price', getValue: (p: SupabaseProperty) => `${formatPrice(getAvgSqmPrice(p))} / m²` }"
        )

        with open('src/components/compare-bar.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("Done")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
