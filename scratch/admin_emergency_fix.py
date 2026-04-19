import re

def main():
    path = 'src/app/admin/page.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Post interface to be more robust for linting
    # (Ensure it has id and created_at)
    if 'interface Post {' in content:
         # Check if already updated. 
         pass

    # 2. Fix the useCallback hooks - ensure they have ALL dependencies
    # syncNews calls fetchPosts, so fetchPosts must be a dependency
    content = content.replace('}, [notify]);', '}, [notify, fetchPosts]);')
    
    # 2.1 Ensure fetchHistory, etc. are stable (already did but checking)
    
    # 3. Update useEffect dependencies
    # It must have ALL stable functions called within it
    old_deps = '}, [syncNews, fetchLeads, fetchProperties, fetchHistory, fetchPosts]);'
    new_deps = '}, [syncNews, fetchLeads, fetchProperties, fetchHistory, fetchPosts, syncNews]);' # Wait, syncNews twice? No.
    # Actually, let's just make sure it has 'syncNews, fetchLeads, fetchProperties, fetchHistory, fetchPosts'
    # My previous script did: }, [syncNews, fetchLeads, fetchProperties, fetchHistory, fetchPosts]);
    # This is correct.

    # 4. Resolve 'any' and 'created_at' in handleSavePost
    # Need to remove the 'any' and fix the unused variables
    payload_block_pattern = r'const \{ id: _ignoredId, created_at: _ignoredCreated, \.\.\.payload \} = rawPayload as any;[ \n]*const postId = \(rawPayload as any\)\.id;'
    
    # Improved version with correct typing and no unused vars
    # We cast to any for the destructuring but immediately extract what we need
    new_payload_block = """const postId = (rawPayload as Post).id;
                                  const { id: _ignoreId, created_at: _ignoreCreated, ...payload } = rawPayload as any;"""
    
    content = re.sub(payload_block_pattern, new_payload_block, content)

    # 5. Fix unused 'err' variables
    content = content.replace('} catch (err: unknown) {', '} catch {')
    content = content.replace('} catch (err) {', '} catch {')
    content = content.replace('} catch (e: unknown) {', '} catch {')

    # 6. Ensure fetchProperties has unit_types (User reported missing units)
    if 'unit_types:property_unit_types(*)' not in content:
        content = content.replace(
            "from('properties').select('*, units:property_units(*), progress:property_progress(*)')",
            "from('properties').select('*, units:property_units(*), unit_types:property_unit_types(*), progress:property_progress(*)')"
        )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Admin Emergency fixes applied.")

if __name__ == "__main__":
    main()
