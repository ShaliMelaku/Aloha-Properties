"use client";

import { useState } from "react";
import { X, Send, CheckCircle2, User, Phone, Mail, MessageSquare, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
}

export function InquiryModal({ isOpen, onClose, propertyName }: InquiryModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: `I am interested in ${propertyName}. Please provide more details.`
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call to /api/contact
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          interest: propertyName
        })
      });
      
      if (res.ok) {
        setSuccess(true);
      } else {
        throw new Error("Failed to send inquiry");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[var(--card)] rounded-[3rem] border border-[var(--border)] w-full max-w-xl p-12 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl" />

            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-3 hover:bg-slate-500/10 rounded-2xl transition-all opacity-40 hover:opacity-100"
            >
              <X size={20} />
            </button>

            {success ? (
              <div className="text-center py-12 space-y-8">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 size={48} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-heading font-black tracking-tighter uppercase">Inquiry Sent</h3>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest leading-relaxed">
                    Our luxury consultants will reach out to you shortly regarding <span className="text-brand-blue">{propertyName}</span>.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-12 py-5 bg-brand-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Close Securely
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-10 relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-px bg-brand-blue" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue">Private Inquery</span>
                  </div>
                  <h3 className="text-4xl font-heading font-black tracking-tighter uppercase">
                    Secure <span className="opacity-30 italic">Request.</span>
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-relaxed max-w-sm">
                    Enter your details to receive an exclusive brief and private viewing schedule for {propertyName}.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-blue opacity-40 group-focus-within:opacity-100 transition-opacity" size={16} />
                      <input
                        required
                        type="text"
                        placeholder="FULL NAME"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-slate-500/5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border border-[var(--border)] focus:border-brand-blue transition-all"
                      />
                    </div>
                    <div className="relative group">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-blue opacity-40 group-focus-within:opacity-100 transition-opacity" size={16} />
                      <input
                        required
                        type="tel"
                        placeholder="PHONE NUMBER"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-slate-500/5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border border-[var(--border)] focus:border-brand-blue transition-all"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-blue opacity-40 group-focus-within:opacity-100 transition-opacity" size={16} />
                    <input
                      required
                      type="email"
                      placeholder="EMAIL ADDRESS"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-14 pr-6 py-5 bg-slate-500/5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border border-[var(--border)] focus:border-brand-blue transition-all"
                    />
                  </div>

                  <div className="relative group">
                    <MessageSquare className="absolute left-6 top-6 text-brand-blue opacity-40 group-focus-within:opacity-100 transition-opacity" size={16} />
                    <textarea
                      required
                      rows={4}
                      placeholder="YOUR MESSAGE"
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full pl-14 pr-6 py-5 bg-slate-500/5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border border-[var(--border)] focus:border-brand-blue transition-all resize-none"
                    />
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-6 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Submit Inquiry
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
