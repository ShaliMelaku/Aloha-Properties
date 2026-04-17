"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const HUB_DATA = [
  { id: "addis", name: "Addis Ababa", coords: { x: 55, y: 55 }, size: 20, active: true, info: "Primary Desk: 1.2k+ Leads" },
  { id: "dubai", name: "Dubai Hub", coords: { x: 62, y: 45 }, size: 12, active: true, info: "18% Global Volume" },
  { id: "london", name: "London Desk", coords: { x: 45, y: 35 }, size: 10, active: true, info: "Bespoke Placements" },
  { id: "ny", name: "NY Office", coords: { x: 25, y: 40 }, size: 10, active: true, info: "Institutional Reach" },
  { id: "dc", name: "DC Base", coords: { x: 24, y: 43 }, size: 8, active: true, info: "Diaspora Focus" },
];

export function NexusMap() {
  const [hoveredHub, setHoveredHub] = useState<string | null>(null);

  return (
    <div className="relative w-full aspect-[2/1] bg-slate-500/5 rounded-[2.5rem] border border-[var(--border)] overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none [background-image:radial-gradient(var(--foreground)_1px,transparent_1px)] [background-size:30px_30px]" />

      {/* SVG Map Background layer */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 50">
        <path 
          d="M10,25 Q30,5 50,25 T90,25" 
          fill="none" 
          stroke="var(--foreground)" 
          strokeWidth="0.5" 
          strokeDasharray="1 2" 
        />
        {/* Simplified Hub Connections */}
        {HUB_DATA.filter(h => h.id !== "addis").map((hub) => (
          <g key={`line-${hub.id}`}>
            <motion.path
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ pathLength: 1, opacity: 0.4 }}
               transition={{ duration: 1.5, delay: 0.5 }}
               d={`M ${hub.coords.x} ${hub.coords.y} Q ${(hub.coords.x + 55)/2} ${(hub.coords.y + 55)/2 - 10} 55 55`}
               fill="none"
               stroke="var(--brand-blue)"
               strokeWidth="0.5"
               strokeDasharray="2 2"
            />
            <motion.circle
              cx="55" cy="55"
              r="0.5"
              fill="var(--brand-blue)"
              className="opacity-40"
            >
              <animateMotion 
                dur="3s" 
                repeatCount="indefinite"
                path={`M ${hub.coords.x} ${hub.coords.y} Q ${(hub.coords.x + 55)/2} ${(hub.coords.y + 55)/2 - 10} 55 55`}
              />
            </motion.circle>
          </g>
        ))}
      </svg>

      {/* Interactive Hub Nodes */}
      {HUB_DATA.map((hub) => (
        <motion.div
          key={hub.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          initial={false}
          animate={{ 
            left: `${hub.coords.x}%`, 
            top: `${hub.coords.y}%` 
          }}
        >
          <div 
            className="relative cursor-pointer group/node"
            onMouseEnter={() => setHoveredHub(hub.id)}
            onMouseLeave={() => setHoveredHub(null)}
          >
            {/* Pulsing Circles */}
            <motion.div 
               animate={{ 
                 scale: [1, 1.5, 1], 
                 opacity: [0.6, 0, 0.6],
                 width: (hub.size || 20) * 2,
                 height: (hub.size || 20) * 2,
                 marginLeft: -(hub.size || 20),
                 marginTop: -(hub.size || 20)
               }}
               transition={{ duration: 2, repeat: Infinity }}
               className={`absolute inset-0 rounded-full border-2 ${hub.active ? 'border-brand-blue' : 'border-white/20'}`}
               initial={false}
            />

            <motion.div 
               initial={false}
               animate={{ 
                 scale: hoveredHub === hub.id ? 1.2 : 1,
                 backgroundColor: hub.active ? "#0066FF" : (hoveredHub === hub.id ? "#fff" : "rgba(255,255,255,0.2)")
               }}
               className="w-3 h-3 rounded-full shadow-2xl relative z-10"
            />

            {/* Hub Label */}
            <div className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap transition-all duration-300 ${hoveredHub === hub.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>
               <div className="bg-black/95 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-blue mb-1">{hub.name}</p>
                  <p className="text-[10px] font-bold text-white mb-2">{hub.info}</p>
                  <div className="w-8 h-0.5 bg-brand-blue" />
               </div>
            </div>
            
            {!hoveredHub && (
              <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 opacity-0 group-hover/node:opacity-100 transition-opacity">
                {hub.name}
              </span>
            )}
          </div>
        </motion.div>
      ))}

      {/* Live Status Indicator */}
      <div className="absolute top-6 right-6">
         <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-2 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">Network Online</span>
         </div>
      </div>

      {/* Legend / Overlay */}
      <div className="absolute bottom-10 left-10 space-y-2">
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-brand-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live Command Center</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-white/20" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Satellite Engagement Desk</span>
         </div>
      </div>
    </div>
  );
}
