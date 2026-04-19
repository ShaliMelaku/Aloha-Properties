import re

def main():
    with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Post interface to include is_deleted and is_featured
    # It currently ends with file_url: string; \n }
    content = content.replace(
        '  file_url: string;\n}',
        '  file_url: string;\n  is_deleted: boolean;\n  is_featured?: boolean;\n}'
    )

    # 2. Fix handleSavePost logic
    # We want to replace the payload creation block
    old_block_pattern = r'const payload = editingPost\s*\? \{ \.\.\.editingPost \}\s*: \{ \.\.\.newPost \};'
    
    new_block = """const rawPayload = editingPost ? { ...editingPost } : { ...newPost };
                                  // Clean payload for DB to avoid primary key or internal field conflicts
                                  const { id: postId, created_at, ...payload } = rawPayload as any;
                                  if (payload.is_deleted === undefined) payload.is_deleted = false;"""
    
    content = re.sub(old_block_pattern, new_block, content)

    # 2.1 Update the DB calls to use the cleaned payload and original ID
    content = content.replace(
        "await supabaseClient.from('posts').update(payload).eq('id', editingPost.id)",
        "await supabaseClient.from('posts').update(payload).eq('id', postId)"
    )
    # The insert doesn't need changes as 'payload' already excludes 'id' now

    # 3. Add is_featured to initial newPost state
    content = content.replace(
        'is_deleted: false',
        'is_deleted: false, is_featured: false'
    )

    # 4. Fix fetchProperties to always include unit_types (already did this in previous turn but double checking)
    # (Checking if unit_types is missing)
    if 'unit_types:property_unit_types(*)' not in content:
         content = content.replace(
             "select('*, units:property_units(*), progress:property_progress(*)')",
             "select('*, units:property_units(*), unit_types:property_unit_types(*), progress:property_progress(*)')"
         )

    with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Admin Post sync and fetch logic updated successfully.")

if __name__ == "__main__":
    main()
