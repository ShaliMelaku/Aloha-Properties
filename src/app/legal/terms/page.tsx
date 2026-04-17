"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-blue mb-12 hover:opacity-70 transition-opacity">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight">Terms of Service</h1>
        <p className="text-sm opacity-50 uppercase tracking-widest font-black">Last Updated: April 2026</p>
        
        <div className="prose prose-invert max-w-none space-y-6 opacity-80 leading-relaxed">
          <p>Welcome to Aloha Properties. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.</p>
          
          <h2 className="text-xl font-black text-brand-blue mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>Your access to and use of Aloha Properties is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
          
          <h2 className="text-xl font-black text-brand-blue mt-8 mb-4">2. Platform Usage</h2>
          <p>You agree to use our platform solely for legitimate real estate inquiries and market research. Any abuse, reverse engineering, or unauthorized collection of proprietary market data is strictly prohibited.</p>
          
          <h2 className="text-xl font-black text-brand-blue mt-8 mb-4">3. Intellectual Property</h2>
          <p>All content on this platform, including but not limited to branding, images, analytics, and software logic, is the exclusive property of Aloha Properties and protected by intellectual property laws.</p>

          <h2 className="text-xl font-black text-brand-blue mt-8 mb-4">4. Limitation of Liability</h2>
          <p>Market intelligence and analytics provided on this platform are for informational purposes only. Aloha Properties shall not be held liable for any investment decisions made based on the data presented herein.</p>
        </div>
      </motion.div>
    </main>
  );
}
