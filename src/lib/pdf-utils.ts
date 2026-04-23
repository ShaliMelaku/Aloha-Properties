/**
 * Converts a Supabase storage URL to a secure internal proxy URL
 */
export function getSecurePdfUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If it's already a relative path or proxy path, return as is
  if (url.startsWith('/api/pdf')) return url;
  
  // Match Supabase storage URL pattern
  // Pattern: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
  const supabasePattern = /supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)/;
  const match = url.match(supabasePattern);
  
  if (match) {
    const bucket = match[1];
    const path = match[2];
    return `/api/pdf/${bucket}/${path}`;
  }
  
  // If not a Supabase URL, return as is (could be external)
  return url;
}
