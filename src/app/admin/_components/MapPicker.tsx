"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Search, Crosshair, Loader2, Target, RotateCcw, MapPin } from "lucide-react";

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
}

const fetchAddress = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "User-Agent": "AlohaHQ/1.0" } }
    );
    const data = await res.json();
    return data.display_name || null;
  } catch {
    return null;
  }
};

const searchLocations = async (query: string): Promise<SearchResult[]> => {
  try {
    // First try with Ethiopia filter for fast local results
    const etRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=4&countrycodes=et&addressdetails=1`,
      { headers: { "User-Agent": "AlohaHQ/1.0" } }
    );
    const etData: SearchResult[] = await etRes.json();

    // Always do a global search too, deduplicated
    const globalRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      { headers: { "User-Agent": "AlohaHQ/1.0" } }
    );
    const globalData: SearchResult[] = await globalRes.json();

    // Merge: ET results first, then global, dedup by display_name
    const merged = [...etData];
    for (const r of globalData) {
      if (!merged.find((x) => x.display_name === r.display_name)) {
        merged.push(r);
      }
    }
    return merged.slice(0, 6);
  } catch (error) {
    console.error("Geocoding failure:", error);
    return [];
  }
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

function LocationMarker({ lat, lng, onChange, onAddressChange }: MapPickerProps) {
  useMapEvents({
    async click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      if (onAddressChange) {
        const addr = await fetchAddress(e.latlng.lat, e.latlng.lng);
        if (addr) onAddressChange(addr);
      }
    },
  });

  const DefaultIcon = L.divIcon({
    className: "custom-div-icon",
    html: `<div class="w-8 h-8 bg-brand-blue rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
             <div class="w-2 h-2 bg-white rounded-full"></div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return <Marker position={[lat || 9.0192, lng || 38.7525]} icon={DefaultIcon} />;
}

export function MapPicker({ lat, lng, onChange, onAddressChange }: MapPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchError, setSearchError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search as user types (debounced 400ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 3) {
      setTimeout(() => {
        setSuggestions([]);
        setShowSuggestions(false);
      }, 0);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");
      const results = await searchLocations(searchQuery);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      if (results.length === 0) setSearchError("No locations found. Try a different search term.");
      setIsSearching(false);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleSelectSuggestion = (result: SearchResult) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    onChange(newLat, newLng);
    if (onAddressChange) {
      // Use a short human-readable version: first 2 segments of display_name
      const shortName = result.display_name.split(",").slice(0, 3).join(",").trim();
      onAddressChange(shortName);
    }
    setSearchQuery(result.display_name.split(",").slice(0, 2).join(", "));
    setShowSuggestions(false);
    setSuggestions([]);
    setSearchError("");
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
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchError("");
  };

  if (!mounted)
    return (
      <div className="h-64 bg-slate-500/5 rounded-2xl animate-pulse flex items-center justify-center text-[10px] uppercase font-black tracking-widest opacity-20">
        Initializing Map Core...
      </div>
    );

  return (
    <div className="space-y-4">
      {/* ── Search Bar ────────────────────────────────────────────────── */}
      <div className="flex gap-2" ref={wrapperRef}>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search any location worldwide..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchError("");
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="w-full px-6 py-4 bg-slate-500/5 border border-[var(--border)] rounded-2xl text-xs font-bold outline-none focus:border-brand-blue pr-12 transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue">
            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} className="opacity-40" />}
          </div>

          {/* ── Suggestions Dropdown ─────────────────────────────────── */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-[500] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
              {suggestions.map((result, i) => {
                const parts = result.display_name.split(",");
                const primary = parts[0]?.trim();
                const secondary = parts.slice(1, 3).join(",").trim();
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSuggestion(result)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-brand-blue/5 transition-colors text-left border-b border-[var(--border)] last:border-0 group"
                  >
                    <MapPin size={14} className="text-brand-blue shrink-0 opacity-60 group-hover:opacity-100" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{primary}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-30 truncate">{secondary}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Inline error */}
          {searchError && !showSuggestions && (
            <p className="absolute top-full left-0 mt-1 text-[9px] font-black uppercase tracking-widest text-red-400">{searchError}</p>
          )}
        </div>

        <button
          onClick={handleLocateMe}
          title="Locate Me"
          className="w-14 h-14 flex items-center justify-center bg-slate-500/5 border border-[var(--border)] rounded-2xl text-brand-blue hover:bg-brand-blue hover:text-white transition-all shadow-lg"
        >
          <Target size={20} />
        </button>

        <button
          onClick={handleReset}
          title="Reset to Addis Ababa"
          className="w-14 h-14 flex items-center justify-center bg-slate-500/5 border border-[var(--border)] rounded-2xl text-slate-400 hover:text-brand-blue transition-all"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* ── Coordinate Display ────────────────────────────────────────── */}
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

      {/* ── Map ───────────────────────────────────────────────────────── */}
      <div className="h-[400px] w-full rounded-[2rem] overflow-hidden border border-[var(--border)] shadow-xl relative group">
        <MapContainer
          center={[lat || 9.0192, lng || 38.7525]}
          zoom={16}
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
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          <RecenterMap key={`${lat}-${lng}`} lat={lat} lng={lng} />
          <LocationMarker lat={lat} lng={lng} onChange={onChange} onAddressChange={onAddressChange} />
        </MapContainer>

        {/* Crosshair overlay */}
        <div className="absolute inset-0 pointer-events-none z-[400] flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <Crosshair size={32} className="text-brand-blue" />
            <div className="absolute w-2 h-2 bg-brand-blue rounded-full shadow-[0_0_10px_rgba(43,171,226,0.5)]" />
          </div>
        </div>

        <div className="absolute top-4 right-4 z-[400] bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Click map to pin exact location</p>
        </div>
      </div>
    </div>
  );
}
