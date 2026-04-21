"use client";

import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { motion } from 'framer-motion';
import { X, Check, Scissors, Maximize, RotateCcw } from 'lucide-react';

interface ImageOptimizerProps {
  image: string;
  onComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspect?: number;
}

export function ImageOptimizer({ image, onComplete, onCancel, aspect = 16 / 9 }: ImageOptimizerProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.src = image;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y, width, height } = croppedAreaPixels;
      canvas.width = width;
      canvas.height = height;

      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);

      ctx.drawImage(
        img,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
      );

      canvas.toBlob((blob) => {
        if (blob) onComplete(blob);
      }, 'image/jpeg', 0.9);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col"
    >
      <div className="flex justify-between items-center p-8 bg-black/20 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white">
            <Scissors size={20} />
          </div>
          <div>
            <h3 className="text-xl font-heading font-black text-white tracking-tight uppercase">Asset <span className="opacity-30 italic">Optimizer.</span></h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Adjust framing, scale, and rotation for production.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-4 rounded-2xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all" title="Discard Changes"><X size={20}/></button>
          <button onClick={createCroppedImage} className="flex items-center gap-3 px-8 py-4 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all">
            <Check size={16} /> Finalize Asset
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-[#0a0a0a]">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: '#0a0a0a' },
            cropAreaStyle: { border: '2px solid var(--brand-blue)', boxShadow: '0 0 0 9999em rgba(0,0,0,0.85)' }
          }}
        />
      </div>

      <div className="p-8 bg-black/40 border-t border-white/10">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center gap-6">
             <div className="flex-1 space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase text-white/40 px-2">
                   <span className="flex items-center gap-2"><Maximize size={10}/> Scale Factor</span>
                   <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={3} 
                  step={0.01} 
                  value={zoom} 
                  title="Scale Factor"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-blue"
                />
             </div>
             <div className="flex-1 space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase text-white/40 px-2">
                   <span className="flex items-center gap-2"><RotateCcw size={10}/> Rotation</span>
                   <span>{rotation}°</span>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={360} 
                  step={1} 
                  value={rotation} 
                  title="Rotation Angle"
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-blue"
                />
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
