import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative pt-32 pb-16 overflow-hidden border-t border-[var(--border)]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="relative w-8 h-8 group-hover:scale-105 transition-transform">
                <Image
                  src="/images/brand/aloha-logo.png"
                  alt="Aloha Real Estate Logo"
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
              <span className="font-heading text-2xl font-black tracking-tighter">
                ALOHA<span className="text-brand-blue">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
              Aloha Real Estate Marketing &amp; Events Comm P.L.C — a full-service, market-leading company changing the way you find, achieve, and maintain the greatest value of home in Addis and beyond.
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue italic">
              Excellence. Integrity. Best Service.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Quick Links</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link href="/" className="hover:text-brand-blue transition-colors">Home</Link></li>
                <li><Link href="/portfolio" className="hover:text-brand-blue transition-colors">Portfolio</Link></li>
                <li><Link href="/market-trends" className="hover:text-brand-blue transition-colors">News Desk</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Corporate</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link href="/about" className="hover:text-brand-blue transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-brand-blue transition-colors">Inquire</Link></li>
                <li><Link href="/admin" className="hover:text-brand-blue transition-colors">Admin Hub</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Legal</h4>
              <ul className="space-y-4 text-sm font-bold opacity-70">
                <li><Link href="/legal/privacy" className="hover:text-brand-blue transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-brand-blue transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Contact</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><a href="tel:+251911258981" className="hover:text-brand-blue transition-colors">+251 911 258981</a></li>
                <li><a href="tel:+251118220992" className="hover:text-brand-blue transition-colors">+251 118 220992</a></li>
                <li><a href="mailto:Alohaethiopia@gmail.com" className="hover:text-brand-blue transition-colors">Alohaethiopia@gmail.com</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-500/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-30 text-center md:text-left">
            © {new Date().getFullYear()} Aloha Real Estate Marketing &amp; Events Comm P.L.C
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-50 text-center">
            Bole Medhanialem · Gulf Aziz Building, 1st Floor, Office 123 · Addis Ababa
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-brand-blue opacity-80">
            Ethiopia
          </div>
        </div>
      </div>
    </footer>
  );
}
