"use client";

import { useCallback } from "react";
import { Share2 } from "lucide-react";
import { useStatus } from "@/context/status-context";

interface BlogShareButtonProps {
  title: string;
  excerpt: string;
  slug: string;
}

export function BlogShareButton({ title, excerpt, slug }: BlogShareButtonProps) {
  const { notify } = useStatus();

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/blog/${slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: excerpt,
          url: url,
        });
        notify('success', 'Article shared successfully');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          notify('error', 'Error sharing article');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        notify('success', 'Link copied to clipboard');
      } catch (err) {
        notify('error', 'Failed to copy link');
      }
    }
  }, [notify, title, excerpt, slug]);

  return (
    <button 
      onClick={handleShare}
      title="Share this article" 
      className="ml-auto w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center opacity-40 hover:opacity-100 transition-all hover:text-brand-blue hover:border-brand-blue/30"
    >
      <Share2 size={18} />
    </button>
  );
}
