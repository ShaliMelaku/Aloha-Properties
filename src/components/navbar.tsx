"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/context/currency-context";
import Image from "next/image";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency, usdRate } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Market Trends", href: "/market-trends" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const currentTheme = theme === 'system' ? 'dark' : theme;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4 md:p-6 transition-all duration-500">
        <motion.nav 
           initial={{ y: -100, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className={`
             relative flex items-center justify-between w-full max-w-6xl px-6 py-3 rounded-full 
             transition-all duration-500 border
             ${scrolled 
               ? "glass-nav shadow-2xl py-3 border-[var(--border)]" 
               : "bg-transparent border-transparent py-4"}
           `}
         >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group relative z-10" aria-label="Aloha Properties Home">
              <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
                <img 
                  src="/images/brand/aloha-logo.png" 
                  alt="Aloha Properties Logo" 
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <span className={`font-heading text-xl font-black tracking-tighter transition-all duration-500 ${scrolled ? "text-[var(--foreground)]" : "text-white drop-shadow-md"}`}>
                ALOHA<span className="text-brand-blue">.</span>
              </span>
            </Link>
 
           {/* Desktop Links */}
           <div className="hidden md:flex items-center gap-10">
             {navLinks.map((link) => (
               <Link 
                 key={link.name} 
                 href={link.href} 
                 className={`text-sm font-bold tracking-tight transition-all duration-500 relative group ${scrolled ? "text-[var(--foreground)]/60 hover:text-brand-blue" : "text-white/80 hover:text-white"}`}
               >
                 {link.name}
                 <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-blue transition-all duration-300 group-hover:w-full`} />
               </Link>
             ))}
           </div>
 
           {/* Actions */}
           <div className="hidden md:flex items-center gap-4">
              {/* Currency Toggle */}
               <button
                onClick={() => setCurrency(currency === "ETB" ? "USD" : "ETB")}
                suppressHydrationWarning
                className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-500 border font-black text-[9px] uppercase tracking-tighter 
                  ${scrolled 
                    ? "bg-slate-200 dark:bg-slate-800 border-[var(--border)] text-[var(--foreground)]" 
                    : "bg-white/10 border-white/20 text-white backdrop-blur-md"
                  }
                `}
                title={`Switch to ${currency === 'ETB' ? 'USD' : 'ETB'}`}
              >
                <div className="flex items-center gap-1.5">
                  <Coins size={12} className="text-brand-blue" />
                  {currency}
                </div>
                <span className="opacity-40 text-[7px] font-medium leading-none">1 USD = {usdRate} ETB</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                suppressHydrationWarning
                className={`relative w-14 h-8 rounded-full p-1 transition-all duration-500 flex items-center group overflow-hidden border ${scrolled ? "bg-slate-200 dark:bg-slate-800 border-[var(--border)]" : "bg-white/10 border-white/20 backdrop-blur-md"}`}
                aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
              >
               <motion.div 
                 animate={{ x: currentTheme === "dark" ? 24 : 0 }}
                 transition={{ type: "spring", stiffness: 500, damping: 30 }}
                 className="w-6 h-6 bg-white dark:bg-brand-blue rounded-full shadow-md flex items-center justify-center relative z-10"
               >
                 {currentTheme === "dark" ? <Moon size={12} className="text-white" /> : <Sun size={12} className="text-amber-500" />}
               </motion.div>
             </button>
 
             <Link href="#contact" className="btn-premium-primary text-xs tracking-wider uppercase">
               Inquire
             </Link>
           </div>
 
           {/* Mobile Menu Toggle */}
           <button 
             className={`md:hidden p-2 transition-all duration-500 ${scrolled ? "text-[var(--foreground)]" : "text-white"}`} 
             onClick={() => setIsOpen(true)}
             aria-label="Open navigation menu"
             title="Open Menu"
           >
             <Menu size={24} />
           </button>
         </motion.nav>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 z-[110] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 w-4/5 max-w-sm h-full bg-[var(--background)] shadow-2xl z-[120] p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-heading font-black text-2xl">ALOHA<span className="text-brand-blue">.</span></span>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 border border-[var(--border)] rounded-full text-[var(--foreground)]"
                  aria-label="Close navigation menu"
                  title="Close Menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    onClick={() => setIsOpen(false)}
                    className="text-3xl font-heading font-bold text-[var(--foreground)] hover:text-brand-blue transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

               <div className="mt-auto space-y-4">
                <div className="flex justify-between items-center bg-slate-500/5 p-5 rounded-3xl border border-[var(--border)]">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-400">Currency</span>
                    <span className="text-[10px] uppercase tracking-widest font-black text-brand-blue">1 USD = {usdRate} ETB</span>
                  </div>
                  <button
                    onClick={() => setCurrency(currency === "ETB" ? "USD" : "ETB")}
                    className="px-6 py-3 rounded-xl bg-brand-blue text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-blue/20"
                  >
                    {currency}
                  </button>
                </div>

                <div className="pt-6 border-t border-[var(--border)] flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-400">Current Theme</span>
                    <span className="text-xs uppercase tracking-widest font-black text-brand-blue">{currentTheme}</span>
                  </div>
                  <button
                    onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                    className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-brand-blue border border-[var(--border)]"
                    aria-label={`Toggle to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
                  >
                    {currentTheme === "dark" ? <Moon size={24} /> : <Sun size={24} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
