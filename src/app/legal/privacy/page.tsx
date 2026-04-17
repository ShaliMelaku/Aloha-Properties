"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6 max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-blue mb-12 hover:opacity-70 transition-opacity">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight">Privacy Policy</h1>
        <p className="text-sm opacity-50 uppercase tracking-widest font-black">Last Updated: April 2026</p>
        
        <div className="prose prose-invert max-w-none space-y-6 opacity-80 leading-relaxed">
          <p>At Aloha Properties, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard the data you provide to us when using our platform.</p>
          
          <h2 className="text-xl font-black text-brand-blue mt-8 mb-4">1. Information We Collect</h2>
          <p>We may collect personal information such as your name, email address, phone number, and investment interests when you register, inquire about a property, or subscribe to our market intelligence updates.</p>
          
          <h2 className="text-xl font-black text-brand-blue mt-8 mb-4">2. How We Use Your Data</h2>
          <p>Your data is used exclusively to provide personalized real estate curation, send relevant market updates, and improve your experience on our platform. We do not sell your personal information to third parties.</p>
          
          <h2 className="text-xl font-black text-brand-blue mt-8 mb-4">3. Data Security</h2>
          <p>We leverage industry-standard security protocols, including secure database hosting via Supabase, to ensure your information is protected against unauthorized access.</p>

          <h2 className="text-xl font-black text-brand-blue mt-8 mb-4">4. Your Rights</h2>
          <p>You reserve the right to request the deletion of your personal data from our CRM at any time. Simply contact us or use the unsubscription links provided in our communications.</p>
        </div>
      </motion.div>
    </main>
  );
}
