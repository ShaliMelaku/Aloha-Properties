"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ContactSection } from "@/components/contact-section";
import { SocialPulse } from "@/components/social-pulse";
import { motion } from "framer-motion";
import { MessageSquare, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
   return (
      <main className="min-h-screen bg-[var(--background)]">
         <Navbar />

         {/* Immersive Header */}
         <section className="relative pt-40 pb-20 px-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/5 blur-[150px] rounded-full -mr-96 -mt-96" />

            <div className="max-w-6xl mx-auto relative text-center">
               <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                  <h1 className="text-6xl md:text-9xl font-heading font-black tracking-tighter leading-[0.8] mb-12 text-[var(--foreground)]">
                     DIRECT <span className="opacity-30 italic">CHANNEL.</span>
                  </h1>
                  <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pb-20 border-b border-[var(--border)]">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20 rotate-3">
                           <MessageSquare size={20} />
                        </div>
                        <div className="text-left">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Email</p>
                           <p className="text-sm font-bold">Alohaethiopia@gmail.com</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20 -rotate-3">
                           <Phone size={20} />
                        </div>
                        <div className="text-left">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Call Us</p>
                           <p className="text-sm font-bold">+251 911 258981 / +251 118 220992</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20 rotate-6">
                           <MapPin size={20} />
                        </div>
                        <div className="text-left">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Office</p>
                           <p className="text-sm font-bold">Bole Medhanialem · Alemnesh Plaza, 12th Fl, Office 1204</p>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         </section>

         <div className="bg-[var(--card)] py-20 border-y border-[var(--border)]">
            <ContactSection />
         </div>

         <SocialPulse />

         <Footer />
      </main>
   );
}
