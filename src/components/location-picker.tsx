"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon paths for Leaflet in Next.js
const customIcon = L.icon({
  iconUrl: "/images/aloha-marker.png", // We will use a fallback logic if this doesn't exist, but standard leaflet marker is okay for now
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

function LocationMarker({ lat, lng, onChange }: { lat: number, lng: number, onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return lat !== 0 ? <Marker position={[lat, lng]} icon={customIcon} /> : null;
}

export default function LocationPicker({ 
  lat, 
  lng, 
  onChange 
}: { 
  lat: number, 
  lng: number, 
  onChange: (lat: number, lng: number) => void 
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[300px] w-full bg-slate-500/10 rounded-2xl animate-pulse" />;

  const centerLat = lat && lat !== 0 ? lat : 9.0;
  const centerLng = lng && lng !== 0 ? lng : 38.7; // Default to Addis Ababa

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-[var(--border)] relative z-0">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker lat={lat} lng={lng} onChange={onChange} />
      </MapContainer>
      <div className="absolute bottom-4 left-4 z-[400] bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl">
        {lat !== 0 ? `Selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}` : "Click on map to set location"}
      </div>
    </div>
  );
}
