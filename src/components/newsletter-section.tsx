"use client";

import { useState } from "react";
import { Send, CheckCircle2, ShieldClose as ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStatus } from "@/context/status-context";

export function NewsletterSection() {
  const { notify } = useStatus();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: "Newsletter Subscriber", 
          email, 
          interest: "Market Intelligence", 
          message: "Opted-in for Market Trends newsletter from the footer section.",
          source: "newsletter"
        })
      });

      if (res.ok) {
        setSubscribed(true);
        notify("success", "Intelligence Secured: You are now on the exclusive list.");
      } else {
        notify("error", "Network issue. Please try again.");
      }
    } catch {
      notify("error", "Connectivity lost.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-blue/5 -z-10" />
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-[100px] -z-10" />
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-6"
              >
                <div className="w-8 h-px bg-brand-blue" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue">Market Intelligence</span>
              </motion.div>
              
              <h2 className="font-heading text-4xl md:text-5xl font-black tracking-tighter mb-6">
                STAY AHEAD OF THE <br />
                <span className="text-brand-blue italic text-3xl md:text-4xl">CURVE.</span>
              </h2>
              
              <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                Receive exclusive quarterly briefings on Addis Ababa's most lucrative real estate appreciation zones and developer insider reports.
              </p>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                {!subscribed ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-2">
                      <label htmlFor="newsletter-email" className="text-[10px] font-black uppercase tracking-widest text-brand-blue/60 ml-2">Email Address</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input 
                          id="newsletter-email"
                          type="email"
                          required
                          placeholder="Your professional email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 px-8 py-5 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--border)] focus:border-brand-blue outline-none transition-all font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                        <button 
                          type="submit"
                          disabled={loading}
                          className="px-10 py-5 rounded-2xl bg-brand-blue text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                          {loading ? "Decrypting..." : <>Join List <Send size={14}/></>}
                        </button>
                      </div>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="text-xl font-heading font-black tracking-tight mb-2">Access Granted</h4>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Welcome to the inner circle of Aloha Intelligence.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 flex items-center gap-2 text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] justify-center lg:justify-start">
                <ShieldCheck size={14} className="text-emerald-500" /> Secure Data • No Spam • VIP Only
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
