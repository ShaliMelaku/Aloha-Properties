"use client";

import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useProperties, SupabaseProperty } from "@/hooks/use-properties";
import { PropertyCard } from "./property-card";
import { motion, AnimatePresence } from "framer-motion";
import { PDFViewerModal } from "@/app/admin/_components/PDFViewerModal";
import { MapModal } from "./map-modal";
import { getSecurePropertyPdfUrl } from "@/lib/pdf-utils";

export function ProductsGallery() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [bedsFilter, setBedsFilter] = useState("all");
  const [devFilter, setDevFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<{ id: string, title: string } | null>(null);
  const [viewingMap, setViewingMap] = useState<SupabaseProperty | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const { properties, loading } = useProperties();

  const filteredProperties = useMemo(() => {
    if (!mounted || loading) return []; // Prevent SSR flicker
    return properties.filter((prop: SupabaseProperty) => {
      if (devFilter !== "all" && prop.developer !== devFilter) return false;
      const searchLower = search.toLowerCase();
      if (searchLower && !prop.name.toLowerCase().includes(searchLower) && !prop.location.toLowerCase().includes(searchLower)) {
        return false;
      }
      if (bedsFilter !== "all") {
        if (!prop.units || prop.units.length === 0) return false;
        const maxBeds = Math.max(...prop.units.map((u) => u.beds || 0));
        if (maxBeds < parseInt(bedsFilter)) return false;
      }
      if (priceFilter !== "all") {
        if (!prop.units || prop.units.length === 0) return false;
        const maxPrice = Math.max(...prop.units.map((u) => u.price || 0));
        const [min, max] = priceFilter.split("-");
        if (max && maxPrice > parseInt(max)) return false;
        if (!max && maxPrice < parseInt(min)) return false;
      }
      return true;
    });
  }, [search, priceFilter, bedsFilter, devFilter, mounted, properties, loading]);

  const clearFilters = () => {
    setSearch("");
    setPriceFilter("all");
    setBedsFilter("all");
    setDevFilter("all");
  };

  const isFiltered = search || priceFilter !== "all" || bedsFilter !== "all" || devFilter !== "all";

  if (!mounted) return null;

  return (
    <>
    <section id="catalog" className="py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="flex items-center gap-2 mb-4"
            >
              <div className="w-8 h-px bg-brand-blue" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue">Our Collection</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-4xl md:text-6xl font-black tracking-tighter"
            >
              CURATED <br />
              <span className="text-[var(--foreground)]/40 italic">REAL ESTATE.</span>
            </motion.h2>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border
                ${showFilters 
                  ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                  : 'bg-[var(--card)] border-[var(--border)] hover:border-brand-blue/40'}
              `}
            >
              <SlidersHorizontal size={16} />
              {showFilters ? 'Hide Filters' : 'Filter Collections'}
            </button>
          </motion.div>
        </div>

        {/* Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="p-8 rounded-[2.5rem] bg-slate-500/5 border border-[var(--border)] grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Search Registry</label>
                    <div className="relative">
                       <input 
                          type="text"
                          placeholder="Project name..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full px-6 py-4 bg-[var(--background)] rounded-2xl border border-transparent focus:border-brand-blue outline-none text-sm font-bold transition-all"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Developer</label>
                    <select 
                      value={devFilter} 
                      onChange={(e) => setDevFilter(e.target.value)}
                      title="Filter by Developer"
                      className="w-full bg-[var(--background)] rounded-2xl px-6 py-4 border border-transparent focus:border-brand-blue outline-none text-sm font-bold transition-all cursor-pointer appearance-none"
                    >
                      <option value="all">Any Developer</option>
                      <option value="Getas Real Estate">Getas</option>
                      <option value="Enyi Real Estate">Enyi</option>
                      <option value="Metro Real Estate">Metro</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Budget Range</label>
                    <select 
                      value={priceFilter} 
                      onChange={(e) => setPriceFilter(e.target.value)}
                      title="Filter by Budget Range"
                      className="w-full bg-[var(--background)] rounded-2xl px-6 py-4 border border-transparent focus:border-brand-blue outline-none text-sm font-bold transition-all cursor-pointer appearance-none"
                    >
                      <option value="all">Any Price</option>
                      <option value="0-3000000">Under 3M ETB</option>
                      <option value="3000000-7000000">3M - 7M ETB</option>
                      <option value="7000000+">7M+ ETB</option>
                    </select>
                 </div>

                 <div className="flex items-end justify-end pb-2">
                    {isFiltered && (
                      <button 
                        onClick={clearFilters}
                        className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:opacity-70 transition-opacity underline underline-offset-4"
                      >
                         Reset Filters
                      </button>
                    )}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-32 text-center text-[var(--foreground)]/40 font-bold tracking-widest uppercase text-sm">
                 Decrypting Registry...
              </motion.div>
            ) : filteredProperties.length > 0 ? (
              filteredProperties.map((prop) => (
                <PropertyCard 
                  key={prop.id} 
                  property={prop} 
                  onViewPdf={(id, title) => setViewingPdf({ id, title })}
                  onViewMap={(p) => setViewingMap(p)}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-32 text-center"
              >
                <h3 className="text-2xl font-heading font-black tracking-tight mb-2">No Properties Found</h3>
                <p className="text-slate-500 font-medium">Try broadening your search or adjusting filters.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>

    {viewingPdf && (
      <PDFViewerModal 
        isOpen={!!viewingPdf}
        onClose={() => setViewingPdf(null)}
        url={getSecurePropertyPdfUrl(viewingPdf.id)}
        title={viewingPdf.title}
      />
    )}

    {viewingMap && (
      <MapModal 
        isOpen={!!viewingMap}
        onClose={() => setViewingMap(null)}
        lat={viewingMap.lat}
        lng={viewingMap.lng}
        name={viewingMap.name}
        location={viewingMap.location}
      />
    )}
    </>
  );
}
