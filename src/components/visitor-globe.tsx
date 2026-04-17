"use client";

import createGlobe from "cobe";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, Flame, BarChart3, TrendingUp, Wifi, MapPin } from "lucide-react";

// --- Data ---
const LIVE_FEED = [
  { city: "Dubai", country: "UAE", flag: "🇦🇪", location: [25.204, 55.27] as [number, number] },
  { city: "London", country: "UK", flag: "🇬🇧", location: [51.507, -0.127] as [number, number] },
  { city: "Washington DC", country: "US", flag: "🇺🇸", location: [38.907, -77.036] as [number, number] },
  { city: "Nairobi", country: "KE", flag: "🇰🇪", location: [-1.286, 36.817] as [number, number] },
  { city: "Lagos", country: "NG", flag: "🇳🇬", location: [6.524, 3.379] as [number, number] },
  { city: "Riyadh", country: "SA", flag: "🇸🇦", location: [24.68, 46.72] as [number, number] },
  { city: "New York", country: "US", flag: "🇺🇸", location: [40.714, -74.005] as [number, number] },
  { city: "Paris", country: "FR", flag: "🇫🇷", location: [48.856, 2.352] as [number, number] },
  { city: "Singapore", country: "SG", flag: "🇸🇬", location: [1.352, 103.819] as [number, number] },
];

const TRAFFIC_SOURCES = [
  { source: "Direct", percent: 38, color: "#0066FF" },
  { source: "Instagram", percent: 24, color: "#E1306C" },
  { source: "LinkedIn", percent: 18, color: "#0A66C2" },
  { source: "Referral", percent: 12, color: "#10B981" },
  { source: "Telegram", percent: 8, color: "#26A5E4" },
];

const TOP_REGIONS = [
  { name: "Addis Ababa", sessions: 1842, trend: "+12%" },
  { name: "Dubai", sessions: 634, trend: "+8%" },
  { name: "London", sessions: 412, trend: "+5%" },
  { name: "Washington DC", sessions: 389, trend: "+19%" },
  { name: "Nairobi", sessions: 201, trend: "+3%" },
];

const VIEW_MODES = [
  { id: "globe", label: "Globe", icon: Globe2 },
  { id: "heatmap", label: "Heatmap", icon: Flame },
  { id: "traffic", label: "Traffic", icon: BarChart3 },
];

// Globe color themes by view mode
const GLOBE_THEMES = {
  globe: {
    dark: 0,
    diffuse: 0.3,
    mapBrightness: 5.5,
    baseColor: [0.88, 0.95, 1.0] as [number, number, number],
    markerColor: [0.18, 0.42, 0.95] as [number, number, number],
    glowColor: [0.65, 0.88, 1.0] as [number, number, number],
  },
  heatmap: {
    dark: 1,
    diffuse: 1.4,
    mapBrightness: 8,
    baseColor: [0.05, 0.02, 0.0] as [number, number, number],
    markerColor: [1.0, 0.35, 0.0] as [number, number, number],
    glowColor: [1.0, 0.4, 0.1] as [number, number, number],
  },
  traffic: {
    dark: 1,
    diffuse: 0.8,
    mapBrightness: 4,
    baseColor: [0.02, 0.04, 0.12] as [number, number, number],
    markerColor: [0.4, 1.0, 0.6] as [number, number, number],
    glowColor: [0.2, 0.6, 1.0] as [number, number, number],
  },
};

const MARKERS = [
  { location: [9.033, 38.75] as [number, number], size: 0.15 },
  { location: [25.204, 55.27] as [number, number], size: 0.09 },
  { location: [51.507, -0.127] as [number, number], size: 0.08 },
  { location: [38.907, -77.036] as [number, number], size: 0.08 },
  { location: [6.524, 3.379] as [number, number], size: 0.07 },
  { location: [-1.286, 36.817] as [number, number], size: 0.07 },
  { location: [24.68, 46.72] as [number, number], size: 0.07 },
  { location: [48.856, 2.352] as [number, number], size: 0.07 },
  { location: [40.714, -74.005] as [number, number], size: 0.08 },
  { location: [35.652, 139.839] as [number, number], size: 0.06 },
  { location: [1.352, 103.819] as [number, number], size: 0.06 },
  { location: [28.614, 77.209] as [number, number], size: 0.07 },
  { location: [-33.868, 151.207] as [number, number], size: 0.05 },
];

// --- Main Globe Interactive Component ---
function InteractiveGlobe({ viewMode }: { viewMode: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0.3);
  const phiOffsetRef = useRef(0);
  const pointerRef = useRef<{ x: number; active: boolean }>({ x: 0, active: false });
  const globeRef = useRef<{ destroy: () => void } | null>(null);

  const theme = GLOBE_THEMES[viewMode as keyof typeof GLOBE_THEMES] ?? GLOBE_THEMES.globe;

  useEffect(() => {
    if (!canvasRef.current) return;
    if (globeRef.current) globeRef.current.destroy();

    // Scale up the globe significantly
    const size = 1200; // Increased base size

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: 0.3,
      theta: 0.15,
      dark: theme.dark,
      diffuse: theme.diffuse,
      mapSamples: 16000,
      mapBrightness: theme.mapBrightness,
      baseColor: theme.baseColor,
      markerColor: theme.markerColor,
      glowColor: theme.glowColor,
      markers: MARKERS,
      onRender: (state: Record<string, unknown>) => {
        if (!pointerRef.current.active) phiRef.current += 0.003;
        state.phi = phiRef.current + phiOffsetRef.current;
        state.theta = 0.15;
      },
    } as Parameters<typeof createGlobe>[1]);

    globeRef.current = globe;
    return () => globe.destroy();
  }, [viewMode, theme]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerRef.current = { x: e.clientX, active: true };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  }, []);

  const handlePointerUp = useCallback(() => {
    phiRef.current += phiOffsetRef.current;
    phiOffsetRef.current = 0;
    pointerRef.current.active = false;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerRef.current.active) return;
    // Increased drag sensitivity for better interactivity
    phiOffsetRef.current = (e.clientX - pointerRef.current.x) * 0.012;
  }, []);

  return (
    <div className="relative w-full h-[600px] lg:h-[800px] flex items-center justify-center overflow-visible">
      {/* Ambient glow - Extracted from inline styles */}
      <div
        className={`absolute inset-0 rounded-full pointer-events-none opacity-30 blur-[120px] 
          ${viewMode === "heatmap" ? "bg-orange-600/20" : viewMode === "traffic" ? "bg-emerald-600/15" : "bg-brand-blue/30"}`}
      />
      
      {/* Arc overlay lines */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-40 scale-150">
        {[
          { rx: "47%", ry: "10%", rotate: -25, dur: 9 },
          { rx: "47%", ry: "16%", rotate: 18, dur: 12 },
          { rx: "47%", ry: "6%", rotate: 58, dur: 8 },
        ].map((arc, i) => (
          <motion.ellipse
            key={i}
            cx="50" cy="50"
            rx={arc.rx} ry={arc.ry}
            fill="none"
            stroke={viewMode === "heatmap" ? "#ff5500" : viewMode === "traffic" ? "#00ff88" : "#3b82f6"}
            strokeWidth="0.1"
            transform={`rotate(${arc.rotate}, 50, 50)`}
            strokeDasharray="2 5"
            animate={{ rotate: [arc.rotate, arc.rotate + 360] }}
            transition={{ duration: arc.dur * 5, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </svg>
      
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
        onPointerMove={handlePointerMove}
        className="w-full h-full cursor-grab touch-none max-w-none transform scale-110"
      />
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full border border-white/5">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Rotate System v2.0</p>
      </div>
    </div>
  );
}

export function VisitorGlobe() {
  const [viewMode, setViewMode] = useState("globe");
  const [feedIndex, setFeedIndex] = useState(0);
  const [activeCount] = useState(() => 847 + Math.floor(Math.random() * 60));

  useEffect(() => {
    const id = setInterval(() => setFeedIndex(i => (i + 1) % LIVE_FEED.length), 2500);
    return () => clearInterval(id);
  }, []);



  return (
    <div className="w-full bg-[var(--card)] rounded-[3.5rem] border border-[var(--border)] overflow-hidden shadow-2xl relative">
      {/* Absolute Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-8 md:p-12 pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="w-16 h-16 rounded-[2rem] bg-brand-blue/10 text-brand-blue flex items-center justify-center shadow-xl shadow-brand-blue/10 border border-brand-blue/20">
            <Globe2 size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-[var(--foreground)] leading-none mb-2">Global Visitor <span className="text-brand-blue">Nexus.</span></h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em]">{activeCount} Real-time Agents</span>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-black/20 backdrop-blur-3xl rounded-[1.5rem] border border-white/5 pointer-events-auto shadow-2xl">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === mode.id
                  ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/30"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <mode.icon size={14} />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body with Horizontal Panels */}
      <div className="flex flex-col xl:flex-row gap-0">
        {/* Expanded Globe Section */}
        <div className="flex-[3] relative flex items-center justify-center p-12 overflow-hidden bg-gradient-to-br from-transparent to-slate-500/5 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full flex items-center justify-center"
            >
              <InteractiveGlobe viewMode={viewMode} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Side Metrics with Grid Alignment */}
        <div className="flex-[1] bg-slate-500/5 backdrop-blur-3xl border-l border-[var(--border)] p-12 flex flex-col gap-10">
          {/* Live Stream Panel */}
          <div className="bg-black/30 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6 flex items-center gap-2">
              <Wifi size={12} className="text-brand-blue" /> Satellite Feed
            </p>
            <div className="h-16 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={feedIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-brand-blue/20 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-lg">
                    {LIVE_FEED[feedIndex].flag}
                  </div>
                  <div>
                    <p className="text-lg font-black text-white leading-none mb-1">
                      {LIVE_FEED[feedIndex].city}
                    </p>
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">
                      {LIVE_FEED[feedIndex].country} • Connected
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Region Density */}
          <div className="space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 flex items-center gap-2">
              <MapPin size={12} className="text-brand-blue" /> Density Analytics
            </p>
            <div className="space-y-5">
              {TOP_REGIONS.map((region, i) => (
                <div key={region.name} className="group">
                  <div className="flex justify-between text-[11px] font-black mb-2 uppercase tracking-widest">
                    <span className="text-white/60">{region.name}</span>
                    <span className="text-emerald-500">{region.trend}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-brand-blue to-cyan-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(region.sessions / TOP_REGIONS[0].sessions) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Channels */}
          <div className="space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 flex items-center gap-2">
              <TrendingUp size={12} className="text-brand-blue" /> Channel Source
            </p>
            <div className="grid grid-cols-1 gap-4">
              {TRAFFIC_SOURCES.slice(0, 3).map((src) => (
                <div key={src.source} className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5 hover:border-brand-blue/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: src.color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{src.source}</span>
                  </div>


                  <span className="text-[10px] font-black text-brand-blue">{src.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-2 gap-4 mt-auto">
             <div className="bg-brand-blue p-6 rounded-[2rem] text-white shadow-xl shadow-brand-blue/20">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Retention</p>
                <p className="text-2xl font-black">84%</p>
             </div>
             <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">Latency</p>
                <p className="text-2xl font-black text-[var(--foreground)]">14ms</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

