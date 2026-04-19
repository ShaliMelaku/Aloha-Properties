def main():
    try:
        with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
            content = f.read()

        content = content.replace('import { useState, useEffect, useCallback } from "react";', 'import { useState, useEffect } from "react";')
        content = content.replace('History, Lock, PieChart, ShieldCheck, Zap, Moon, Sun, CheckCircle2, UserPlus,', 'History, Lock, PieChart, ShieldCheck, Zap, CheckCircle2, UserPlus,')

        content = content.replace('}, []);\n\n  const handleLogin = async () => {', '}, [syncNews]);\n\n  const handleLogin = async () => {')

        content = content.replace('/* eslint-disable-next-line react/forbid-dom-props */\n', '')

        content = content.replace("} catch (err: unknown) {\n                                 notify('error', 'Failed to save article.", "} catch (_err: unknown) {\n                                 notify('error', 'Failed to save article.")
        content = content.replace("} catch (err: unknown) {\n                                notify('error', 'Purge fault.", "} catch (_err: unknown) {\n                                notify('error', 'Purge fault.")

        content = content.replace('<input type="number" value={newUnitType.beds || \'\'}', '<input title="Beds" placeholder="Beds" type="number" value={newUnitType.beds || \'\'}')
        content = content.replace('<input type="number" step="0.5" value={newUnitType.baths || \'\'}', '<input title="Baths" placeholder="Baths" type="number" step="0.5" value={newUnitType.baths || \'\'}')
        content = content.replace('<input type="number" value={newUnitType.sqm || \'\'}', '<input title="SQM" placeholder="SQM" type="number" value={newUnitType.sqm || \'\'}')
        content = content.replace('<input type="number" value={newUnitType.discount_percentage || \'\'}', '<input title="Discount" placeholder="Discount" type="number" value={newUnitType.discount_percentage || \'\'}')
        content = content.replace('<select value={newUnit.unit_type_id || \'\'}', '<select title="Unit Type" value={newUnit.unit_type_id || \'\'}')
        content = content.replace('<input type="number" value={newUnit.floor_number || \'\'}', '<input title="Floor" placeholder="Floor" type="number" value={newUnit.floor_number || \'\'}')

        content = content.replace("<select value={newUnit.status || 'available'} onChange={e => setNewUnit({...newUnit, status: e.target.value as any})}", "<select title=\"Status\" value={newUnit.status || 'available'} onChange={e => setNewUnit({...newUnit, status: e.target.value as 'available' | 'reserved' | 'sold'})}")

        with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
            
        print("Fixed admin page linting and TS errors")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
