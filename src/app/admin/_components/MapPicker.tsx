"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Search, Crosshair, Loader2 } from "lucide-react";



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

const geocodeAddress = async (query: string) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: { 'User-Agent': 'AlohaHQ/1.0' }
    });
    const data = await res.json();
    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        address: data[0].display_name
      };
    }
    return null;
  } catch {
    return null;
  }
};

function LocationMarker({ lat, lng, onChange, onAddressChange }: MapPickerProps) {
  const map = useMapEvents({
    async click(e) {
      // Immediate pick on click
      onChange(e.latlng.lat, e.latlng.lng);
      if (onAddressChange) {
        const addr = await fetchAddress(e.latlng.lat, e.latlng.lng);
        onAddressChange(addr);
      }
      // Instant center without flyTo animation
      map.setView(e.latlng, map.getZoom());
    },
    async moveend() {
      // Pick on drag end only if it was a drag (not a flyTo from click)
      const center = map.getCenter();
      const dist = Math.sqrt(Math.pow(center.lat - lat, 2) + Math.pow(center.lng - lng, 2));
      
      // If the map moved more than a tiny threshold, update parent
      if (dist > 0.00001) {
        onChange(center.lat, center.lng);
        if (onAddressChange) {
          const addr = await fetchAddress(center.lat, center.lng);
          onAddressChange(addr);
        }
      }
    }
  });

  useEffect(() => {
    if (lat && lng) {
      const currentCenter = map.getCenter();
      const dist = Math.sqrt(Math.pow(currentCenter.lat - lat, 2) + Math.pow(currentCenter.lng - lng, 2));
      if (dist > 0.0001) {
        map.setView([lat, lng], map.getZoom());
      }
    }
  }, [lat, lng, map]);

  const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return <Marker position={[lat || 9.0192, lng || 38.7525]} icon={DefaultIcon} />;
}

export function MapPicker({ lat, lng, onChange, onAddressChange }: MapPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    const result = await geocodeAddress(searchQuery);
    if (result) {
      onChange(result.lat, result.lng);
      if (onAddressChange) onAddressChange(result.address);
    }
    setIsSearching(false);
  };

  if (!mounted) return <div className="h-64 bg-slate-500/5 rounded-2xl animate-pulse flex items-center justify-center text-[10px] uppercase font-black tracking-widest opacity-20">Initializing Map Core...</div>;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative group">
         <input 
            type="text" 
            placeholder="Search location for precise placement..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 bg-slate-500/5 border border-[var(--border)] rounded-2xl text-xs font-bold outline-none focus:border-brand-blue pr-12 transition-all"
         />
         <button 
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue hover:scale-110 transition-transform"
            disabled={isSearching}
         >
            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
         </button>
      </form>

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
          center={[lat || 9.0192, lng || 38.7525]} 
          zoom={18} 
          style={{ height: "100%", width: "100%" }}
          className="z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker lat={lat} lng={lng} onChange={onChange} onAddressChange={onAddressChange} />
        </MapContainer>
        
        {/* Overlay HUD & Crosshair */}
        <div className="absolute inset-0 pointer-events-none z-[400] flex items-center justify-center">
           <div className="relative flex items-center justify-center">
              <Crosshair size={32} className="text-brand-blue" />
              <div className="absolute w-2 h-2 bg-brand-blue rounded-full shadow-[0_0_10px_rgba(43,171,226,0.5)]" />
           </div>
        </div>

        <div className="absolute top-4 right-4 z-[400] bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
           <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Drag map or click to center node</p>
        </div>
      </div>
    </div>
  );
}
