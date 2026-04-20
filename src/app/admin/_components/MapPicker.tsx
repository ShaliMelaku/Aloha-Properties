"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search, Navigation } from "lucide-react";
import { motion } from "framer-motion";



interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
}

const fetchAddress = async (lat: number, lng: number) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: { 'User-Agent': 'AlohaHQ/1.0' }
    });
    const data = await res.json();
    return data.display_name || "Unknown Intelligence Node";
  } catch {
    return "Synchronization Pending...";
  }
};

function LocationMarker({ lat, lng, onChange, onAddressChange }: MapPickerProps) {
  const map = useMapEvents({
    async click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
      if (onAddressChange) {
         const addr = await fetchAddress(e.latlng.lat, e.latlng.lng);
         onAddressChange(addr);
      }
    },
  });

  const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return <Marker position={[lat, lng]} icon={DefaultIcon} />;
}

export function MapPicker({ lat, lng, onChange, onAddressChange }: MapPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    if (active) setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
    return () => { active = false; };
  }, []);

  if (!mounted) return <div className="h-64 bg-slate-500/5 rounded-2xl animate-pulse flex items-center justify-center text-[10px] uppercase font-black tracking-widest opacity-20">Initializing Map Core...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2 px-4">
         <div className="flex items-center gap-2 text-brand-blue">
            <Navigation size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Geo-Coordinates</span>
         </div>
         <div className="flex gap-4 text-[10px] font-bold opacity-40 uppercase tabular-nums">
            <span>Lat: {lat.toFixed(6)}</span>
            <span>Lng: {lng.toFixed(6)}</span>
         </div>
      </div>

      <div className="h-[300px] w-full rounded-[2rem] overflow-hidden border border-[var(--border)] shadow-xl relative group">
        <MapContainer 
          center={[lat || 9.0192, lng || 38.7525]} // Default to Addis Ababa
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
          className="z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker lat={lat} lng={lng} onChange={onChange} onAddressChange={onAddressChange} />
        </MapContainer>
        
        {/* Overlay HUD */}
        <div className="absolute top-4 right-4 z-[400] bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
           <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Click map to relocate node</p>
        </div>
      </div>
    </div>
  );
}
