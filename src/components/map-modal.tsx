"use client";

import { X, MapPin, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("@/components/property-map"), { ssr: false });

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  name: string;
  location: string;
}

export function MapModal({ isOpen, onClose, lat, lng, name, location }: MapModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-2xl shadow-brand-blue/10"
        >
          {/* Modal Header */}
          <header className="h-20 border-b border-white/5 bg-black/40 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center text-brand-blue">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-tight truncate max-w-[200px] md:max-w-md">{name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">{location}</p>
                </div>
              </div>
            </div>

            <button 
                onClick={onClose}
                className="w-12 h-12 bg-white/5 border border-white/10 text-white rounded-xl flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 transition-all"
                title="Close Map"
            >
              <X size={20} />
            </button>
          </header>

          {/* Map Viewport */}
          <div className="flex-1 relative">
             <PropertyMap lat={lat} lng={lng} name={name} location={location} />
          </div>

          {/* Footer Status */}
          <footer className="h-10 bg-black/60 border-t border-white/5 flex items-center justify-between px-8 text-[8px] font-black uppercase tracking-widest text-white/20 shrink-0">
             <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                   <Navigation size={10} className="text-brand-blue" />
                   Geographic Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
             </div>
             <div>Aloha Intelligence Core v4.0</div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
