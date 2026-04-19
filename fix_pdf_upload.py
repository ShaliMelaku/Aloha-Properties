import sys

with open(r'c:\Users\shali\.gemini\antigravity\scratch\new-project\src\app\admin\page.tsx', 'r', encoding='utf-8-sig') as f:
    lines = f.readlines()

fixed = [
    '                                        onChange={async (e) => {\r\n',
    '                                           const file = e.target.files?.[0];\r\n',
    '                                           if (!file) return;\r\n',
    '                                           setIsUploadingPDF(true);\r\n',
    '                                           try {\r\n',
    '                                              const pdfForm = new FormData();\r\n',
    '                                              pdfForm.append("file", file);\r\n',
    '                                              pdfForm.append("path", "reports");\r\n',
    '                                              pdfForm.append("bucket", "blog-media");\r\n',
    '                                              const res = await fetch("/api/admin/upload", { method: "POST", body: pdfForm });\r\n',
    '                                              const result = await res.json();\r\n',
    '                                              if (!result.success) throw new Error(result.error || "Upload failed");\r\n',
    '                                              if (editingPost) setEditingPost({...editingPost, file_url: result.url});\r\n',
    '                                              else setNewPost({...newPost, file_url: result.url});\r\n',
    '                                              notify("success", "PDF uploaded successfully.");\r\n',
    '                                           } catch (err) {\r\n',
    '                                              const message = err instanceof Error ? err.message : "Check storage permissions";\r\n',
    '                                              notify("error", "Upload error: " + message);\r\n',
    '                                           } finally {\r\n',
    '                                              setIsUploadingPDF(false);\r\n',
    '                                           }\r\n',
    '                                        }}\r\n',
]

# Lines 1163-1175 are indices 1162-1174 (0-based)
new_lines = lines[:1162] + fixed + lines[1175:]

with open(r'c:\Users\shali\.gemini\antigravity\scratch\new-project\src\app\admin\page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Done. Total lines:', len(new_lines))
