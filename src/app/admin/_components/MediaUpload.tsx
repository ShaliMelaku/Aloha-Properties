"use client";

import { useState, useRef } from "react";
import { ImageOptimizer } from "./ImageOptimizer";
import { Upload, File, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/lib/supabase";

interface MediaUploadProps {
  onUploadComplete: (url: string) => void;
  bucket: "property-assets" | "media-assets";
  accept?: string;
  label?: string;
  maxSizeMB?: number;
  aspect?: number;
}

export function MediaUpload({ 
  onUploadComplete, 
  bucket, 
  accept = "image/*", 
  label = "Drop assets here or click to browse",
  maxSizeMB = 10,
  aspect = 16/9
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large (Max ${maxSizeMB}MB)`);
      return;
    }

    if (file.type.startsWith('image/') && !file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPendingImage(reader.result as string);
        setOriginalFile(file);
      };
      reader.readAsDataURL(file);
    } else {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File | Blob) => {
    setUploading(true);
    setError(null);
    setSuccess(false);
    setPendingImage(null);

    try {
      const fileExt = originalFile?.name.split('.').pop() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseClient.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload asset.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${
          isDragging ? "border-brand-blue bg-brand-blue/5 scale-[0.98]" : "border-[var(--border)] hover:border-brand-blue/50 bg-slate-500/5"
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={accept}
          id={`media-upload-${Math.random().toString(36).substring(7)}`}
          aria-label={label}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-brand-blue" size={24} />
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Uploading to Neural Core...</p>
            </motion.div>
          ) : success ? (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-1 text-emerald-500">
              <CheckCircle2 size={24} />
              <p className="text-[10px] font-black uppercase tracking-widest">Asset Synced</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2 px-4 text-center">
              <div className="p-3 bg-white/5 rounded-xl text-[var(--foreground)] opacity-40">
                 {accept.includes("pdf") ? <File size={20} /> : <Upload size={20} />}
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{label}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glossy overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>

      <AnimatePresence>
        {pendingImage && (
          <ImageOptimizer 
            image={pendingImage} 
            aspect={aspect}
            onComplete={(blob) => handleUpload(blob)}
            onCancel={() => setPendingImage(null)}
          />
        )}
      </AnimatePresence>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-[9px] font-bold uppercase tracking-widest px-4">
           <AlertCircle size={12} /> {error}
        </motion.div>
      )}
    </div>
  );
}
