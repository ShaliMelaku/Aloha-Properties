"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon paths for Leaflet in Next.js
const customIcon = L.icon({
  iconUrl: "/images/aloha-marker.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

export default function PropertyMap({ 
  lat, 
  lng, 
  name, 
  location 
}: { 
  lat: number, 
  lng: number, 
  name: string,
  location: string
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-full w-full bg-slate-500/10 animate-pulse" />;

  // Default to Addis Ababa if lat/lng is 0 or missing
  const centerLat = lat && lat !== 0 ? lat : 9.0;
  const centerLng = lng && lng !== 0 ? lng : 38.7;

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={lat === 0 ? 12 : 15} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {lat !== 0 && (
          <Marker position={[lat, lng]} icon={customIcon}>
            <Popup className="font-heading font-black">
              <span className="text-brand-blue uppercase tracking-widest text-[10px]">{location}</span>
              <br />
              <span className="text-sm">{name}</span>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
