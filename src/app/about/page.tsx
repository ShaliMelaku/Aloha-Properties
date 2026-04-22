"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AboutSection } from "@/components/about-section";
import { PartnerSlider } from "@/components/partner-slider";
import { motion } from "framer-motion";
import { Globe, Shield } from "lucide-react";

export default function AboutPage() {
   return (
      <main className="min-h-screen bg-[var(--background)]">
         <Navbar />

         {/* Hero Header */}
         <section className="relative pt-40 pb-20 px-6 overflow-hidden border-b border-[var(--border)]">
            <div className="absolute top-0 left-0 w-full h-full noise-bg opacity-10 pointer-events-none" />
            <div className="max-w-6xl mx-auto relative">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
                  <h1 className="text-6xl md:text-9xl font-heading font-black tracking-tighter leading-[0.8] mb-12 text-[var(--foreground)]">
                     OUR <span className="opacity-30 italic">STORY.</span>
                  </h1>
                  <p className="text-lg text-[var(--foreground)]/60 font-medium leading-relaxed max-w-2xl mb-12">
                     A well-established marketing agency with over 14 years of experience in the Ethiopian real estate industry. At Aloha, you are number one — whether you are a property owner, tenant, or buyer.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
                     <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                           <Globe size={24} />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">Market-Leading Reach</h3>
                        <p className="opacity-60 font-medium">Bringing world-class real estate marketing and investment expertise to Addis Ababa and beyond.</p>
                     </div>
                     <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                           <Shield size={24} />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">Strict Code of Ethics</h3>
                        <p className="opacity-60 font-medium">We believe in integrity, commitment to excellence, a professional attitude, and personalized care for every client.</p>
                     </div>
                  </div>
               </motion.div>
            </div>
         </section>

         <AboutSection />

         <div className="py-20 border-t border-[var(--border)]">
            <PartnerSlider />
         </div>

         <Footer />
      </main>
   );
}
