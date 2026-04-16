"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PortfolioGallery } from "@/components/portfolio-gallery";
import { CompareBar } from "@/components/compare-bar";
import { motion } from "framer-motion";

export default function PortfolioPage() {
   return (
      <main className="min-h-screen bg-[var(--background)]">
         <Navbar />

         {/* Dynamic Header */}
         <section className="relative pt-40 pb-12 px-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 blur-[120px] rounded-full -mr-64 -mt-64" />
            <div className="max-w-6xl mx-auto relative">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
                  <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter leading-[0.85] mb-8 text-[var(--foreground)]">
                     OUR SELECTED <span className="opacity-30 italic">PORTFOLIO.</span>
                  </h1>
                  <p className="text-lg md:text-xl font-medium opacity-60 leading-relaxed max-w-xl">
                     Explore our curated high-performance units across Addis Ababa's most prestigious developments.
                  </p>
               </motion.div>
            </div>
         </section>

         <PortfolioGallery />

         <CompareBar />
         <Footer />
      </main>
   );
}
