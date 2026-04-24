"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Search, Crosshair, Loader2, Target, RotateCcw } from "lucide-react";



interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
}

    return data.display_name || null;
  } catch {
    return null;
  }
};

const geocodeAddress = async (query: string) => {
  try {
    // Add Ethiopia filter (countrycodes=et) to make search more relevant
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=et`, {
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
  } catch (error) {
    console.error("Geocoding failure:", error);
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
        if (addr) onAddressChange(addr);
      }
      // Center the map on the picked spot
      map.setView(e.latlng, map.getZoom());
    }
  });

  useEffect(() => {
    if (lat && lng) {
      const currentCenter = map.getCenter();
      const dist = Math.sqrt(Math.pow(currentCenter.lat - lat, 2) + Math.pow(currentCenter.lng - lng, 2));
      if (dist > 0.00001) {
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
      setSearchQuery(""); // Clear on success
    } else {
      alert("Location not found in database. Try being more specific or search near Addis Ababa.");
    }
    setIsSearching(false);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      onChange(latitude, longitude);
      if (onAddressChange) {
        const addr = await fetchAddress(latitude, longitude);
        if (addr) onAddressChange(addr);
      }
    });
  };

  const handleReset = () => {
    onChange(9.0192, 38.7525);
    if (onAddressChange) onAddressChange("Addis Ababa, Ethiopia");
  };

  if (!mounted) return <div className="h-64 bg-slate-500/5 rounded-2xl animate-pulse flex items-center justify-center text-[10px] uppercase font-black tracking-widest opacity-20">Initializing Map Core...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="relative group flex-1">
          <input
            type="text"
            placeholder="Search destination..."
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

        <button
          onClick={handleLocateMe}
          title="Locate Me"
          className="w-14 h-14 flex items-center justify-center bg-slate-500/5 border border-[var(--border)] rounded-2xl text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-lg"
        >
          <Target size={20} />
        </button>

        <button
          onClick={handleReset}
          title="Reset to Addis"
          className="w-14 h-14 flex items-center justify-center bg-slate-500/5 border border-[var(--border)] rounded-2xl text-slate-400 hover:text-brand-blue transition-all"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-2 px-4">
        <div className="flex items-center gap-2 text-brand-blue">
          <Navigation size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Geo-Coordinates</span>
        </div>
        <div className="flex gap-2 text-[10px] font-bold uppercase tabular-nums items-center">
          <div className="flex items-center gap-1 bg-slate-500/5 px-3 py-1.5 rounded-lg border border-[var(--border)]">
            <span className="opacity-40">Lat:</span>
            <input
              type="number"
              step="0.000001"
              title="Latitude"
              placeholder="9.0192"
              value={lat}
              onChange={(e) => onChange(parseFloat(e.target.value), lng)}
              className="bg-transparent outline-none w-20"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-500/5 px-3 py-1.5 rounded-lg border border-[var(--border)]">
            <span className="opacity-40">Lng:</span>
            <input
              type="number"
              step="0.000001"
              title="Longitude"
              placeholder="38.7525"
              value={lng}
              onChange={(e) => onChange(lat, parseFloat(e.target.value))}
              className="bg-transparent outline-none w-20"
            />
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full rounded-[2rem] overflow-hidden border border-[var(--border)] shadow-xl relative group">
        <MapContainer
          center={[lat || 9.0192, lng || 38.7525]}
          zoom={18}
          style={{ height: "100%", width: "100%" }}
          className="z-10"
        >
          <LayersControl position="bottomright">
            <LayersControl.BaseLayer checked name="Street View">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite View">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

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
          <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Click map to pick specific location</p>
        </div>
      </div>
    </div>
  );
}
