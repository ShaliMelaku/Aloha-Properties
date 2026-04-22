import { useEffect, useState, Suspense } from "react";
import { MapPin, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useStatus } from "@/context/status-context";
import { useSearchParams } from "next/navigation";

function ContactForm() {
  const { notify } = useStatus();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interest: "",
    message: ""
  });

  useEffect(() => {
    const interest = searchParams.get('interest');
    if (interest) {
      setFormData(prev => ({ ...prev, interest: decodeURIComponent(interest) }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        notify('success', "Your inquiry has been safely transmitted.");
        setFormData({ name: "", email: "", interest: "", message: "" });
      } else {
        notify('error', `Transmission failed: ${data.error}`);
      }
    } catch {
      notify('error', "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const { name, email, interest, message } = formData;
    if (!name || !email) {
      notify('info', "Identity verified: Please provide Name and Email first.");
      return;
    }
    
    const text = encodeURIComponent(`*Aloha Properties Inquiry*\nName: ${name}\nEmail: ${email}\nInterest: ${interest}\nMessage: ${message}`);
    window.open(`https://wa.me/251934132115?text=${text}`, "_blank");
  };

  return (
     <div className="bg-[var(--card)] p-8 md:p-12 rounded-[2.4rem] border border-[var(--border)] relative overflow-hidden">
        <h3 className="font-heading text-2xl font-black tracking-tight mb-8 text-[var(--foreground)]">Send a Message</h3>
        
        <form className="space-y-6" onSubmit={handleEmailSubmit}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2 text-[var(--foreground)]">Name</label>
                <input 
                 id="name" 
                 type="text" 
                 value={formData.name}
                 onChange={handleChange}
                 placeholder="John Doe" 
                 required 
                 className="w-full px-6 py-4 rounded-2xl bg-slate-500/5 border border-transparent focus:border-brand-blue outline-none transition-all font-bold text-sm text-[var(--foreground)]" 
               />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2 text-[var(--foreground)]">Email</label>
                <input 
                 id="email" 
                 type="email" 
                 value={formData.email}
                 onChange={handleChange}
                 placeholder="john@example.com" 
                 required 
                 className="w-full px-6 py-4 rounded-2xl bg-slate-500/5 border border-transparent focus:border-brand-blue outline-none transition-all font-bold text-sm text-[var(--foreground)]" 
               />
             </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2 text-[var(--foreground)]">Area of Interest</label>
              <div className="relative">
                <input 
                  id="interest" 
                  type="text"
                  value={formData.interest}
                  onChange={handleChange}
                  placeholder="e.g. Residential Acquisition" 
                  required 
                  title="Your area of interest"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-500/5 border border-transparent focus:border-brand-blue outline-none transition-all font-bold text-sm text-[var(--foreground)]"
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2 text-[var(--foreground)]">Message</label>
              <textarea 
               id="message" 
               rows={4} 
               value={formData.message}
               onChange={handleChange}
               placeholder="Tell us about your requirements..." 
               className="w-full px-6 py-4 rounded-2xl bg-slate-500/5 border border-transparent focus:border-brand-blue outline-none transition-all font-bold text-sm resize-none text-[var(--foreground)]" 
             />
           </div>

           <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                 type="button" 
                 onClick={handleWhatsApp}
                 className="flex-1 px-8 py-5 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all"
              >
                 WhatsApp
              </button>
              <button 
                 type="submit" 
                 disabled={loading}
                 className="flex-1 px-8 py-5 rounded-2xl bg-brand-blue text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 hover:bg-brand-blue-deep disabled:opacity-50 active:scale-95 transition-all"
              >
                 {loading ? "Transmitting..." : "Send Email"}
              </button>
           </div>
        </form>
     </div>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="py-32 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Content Block */}
          <div>
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="flex items-center gap-2 mb-6"
            >
              <div className="w-8 h-px bg-brand-blue" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue">Contact Us</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-4xl md:text-6xl font-black tracking-tighter mb-8"
            >
              SECURE YOUR <br />
              <span className="text-[var(--foreground)]/40 italic">INVESTMENT.</span>
            </motion.h2>

            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="text-lg text-slate-500 font-medium leading-relaxed mb-12"
            >
              Our specialists are ready to coordinate your private viewing or developer partnership consultation.
            </motion.p>

            <div className="space-y-6">
              {[
                { icon: Phone, label: "Direct & WhatsApp", value: "+251 934 132115", color: "text-emerald-500" },
                { icon: Mail, label: "Official Inquiry", value: "hello@alohaproperties.com", color: "text-brand-blue" },
                { icon: MapPin, label: "Headquarters", value: "Addis Ababa, Ethiopia", color: "text-slate-400" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-center gap-6 p-4 rounded-3xl border border-transparent hover:border-[var(--border)] hover:bg-slate-500/5 transition-all group cursor-default"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 text-[var(--foreground)]">{item.label}</div>
                    <div className="font-heading font-bold text-lg text-[var(--foreground)]">{item.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Form Block */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-1 w-full rounded-[2.5rem] bg-gradient-to-br from-brand-blue/20 to-transparent shadow-2xl"
          >
            <Suspense fallback={<div className="bg-[var(--card)] p-12 rounded-[2.4rem] border border-[var(--border)] h-[600px] animate-pulse" />}>
              <ContactForm />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
