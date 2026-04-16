"use client";

import createGlobe from "cobe";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, Flame, BarChart3, Users, TrendingUp, Wifi, MapPin } from "lucide-react";

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
  { location: [55.755, 37.617] as [number, number], size: 0.06 },
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

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 560 * 2,
      height: 560 * 2,
      phi: 0.3,
      theta: 0.15,
      dark: theme.dark,
      diffuse: theme.diffuse,
      mapSamples: 22000,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

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
    phiOffsetRef.current = (e.clientX - pointerRef.current.x) * 0.008;
  }, []);

  return (
    <div className="relative w-full aspect-square">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: viewMode === "heatmap"
            ? "radial-gradient(circle, rgba(255,80,0,0.2) 0%, transparent 70%)"
            : viewMode === "traffic"
            ? "radial-gradient(circle, rgba(0,100,255,0.15) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(147,210,255,0.3) 0%, transparent 70%)"
        }}
      />
      {/* Arc overlay lines */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        {[
          { rx: "47%", ry: "10%", rotate: -25, dur: 9 },
          { rx: "47%", ry: "16%", rotate: 18, dur: 12 },
          { rx: "47%", ry: "6%", rotate: 58, dur: 8 },
          { rx: "47%", ry: "21%", rotate: -65, dur: 15 },
          { rx: "47%", ry: "13%", rotate: 82, dur: 11 },
        ].map((arc, i) => (
          <motion.ellipse
            key={i}
            cx="50" cy="50"
            rx={arc.rx} ry={arc.ry}
            fill="none"
            stroke={viewMode === "heatmap" ? "#ff5500" : viewMode === "traffic" ? "#00ff88" : "#3b82f6"}
            strokeWidth="0.25"
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
        className="w-full h-full cursor-grab touch-none"
      />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Drag to rotate</p>
      </div>
    </div>
  );
}

// --- Main Exported Component ---
export function VisitorGlobe() {
  const [viewMode, setViewMode] = useState("globe");
  const [feedIndex, setFeedIndex] = useState(0);
  const [activeCount] = useState(847 + Math.floor(Math.random() * 60));

  useEffect(() => {
    const id = setInterval(() => setFeedIndex(i => (i + 1) % LIVE_FEED.length), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full bg-[var(--card)] rounded-[3rem] border border-[var(--border)] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 md:p-8 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
            <Globe2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">Live Visitor Globe</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{activeCount} active now</span>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-500/5 rounded-2xl border border-[var(--border)]">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              title={mode.label}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === mode.id
                  ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                  : "text-[var(--foreground)] opacity-40 hover:opacity-100"
              }`}
            >
              <mode.icon size={12} />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Globe Panel */}
        <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-[var(--border)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <InteractiveGlobe viewMode={viewMode} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Panel */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          {/* Live Feed */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4 flex items-center gap-2">
              <Wifi size={10} /> Live Visitors
            </p>
            <div className="relative h-14 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={feedIndex}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 absolute inset-0"
                >
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-lg shrink-0">
                    {LIVE_FEED[feedIndex].flag}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[var(--foreground)]">
                      {LIVE_FEED[feedIndex].city}
                    </p>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                      {LIVE_FEED[feedIndex].country} • Just now
                    </p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Top Regions */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4 flex items-center gap-2">
              <MapPin size={10} /> Top Regions
            </p>
            <div className="space-y-3">
              {TOP_REGIONS.map((region, i) => (
                <div key={region.name} className="flex items-center gap-3">
                  <span className="text-[10px] font-black opacity-20 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-[var(--foreground)]">{region.name}</span>
                      <span className="text-emerald-500">{region.trend}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-500/10 rounded-full">
                      <motion.div
                        className="h-full bg-brand-blue rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(region.sessions / TOP_REGIONS[0].sessions) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-black opacity-40 w-10 text-right">{region.sessions.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4 flex items-center gap-2">
              <TrendingUp size={10} /> Traffic Sources
            </p>
            <div className="space-y-2.5">
              {TRAFFIC_SOURCES.map((src, i) => (
                <div key={src.source} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: src.color }} />
                  <span className="text-[10px] font-bold text-[var(--foreground)] flex-1">{src.source}</span>
                  <div className="w-24 h-1.5 bg-slate-500/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: src.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${src.percent}%` }}
                      transition={{ delay: i * 0.08 + 0.3, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-[10px] font-black opacity-40 w-7 text-right">{src.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {[
              { label: "Avg Session", value: "4:12", icon: Users },
              { label: "Bounce Rate", value: "24%", icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-500/5 rounded-2xl p-4 border border-[var(--border)]">
                <stat.icon size={14} className="text-brand-blue mb-2" />
                <p className="text-xl font-heading font-black text-[var(--foreground)]">{stat.value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
