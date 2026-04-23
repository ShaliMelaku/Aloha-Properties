import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { PartnerSlider } from "@/components/partner-slider";
import { 
  VisionTeaser, 
  PortfolioTeaser, 
  TrendsTeaser, 
  ContactTeaser 
} from "@/components/home-teasers";
import { NewsletterSection } from "@/components/newsletter-section";
import { SocialPulse } from "@/components/social-pulse";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        <HeroSection />
        <PartnerSlider />
        <VisionTeaser />
        <PortfolioTeaser />
        <TrendsTeaser />
        <ContactTeaser />
        <NewsletterSection />
        <SocialPulse />
      </main>
      <Footer />
    </div>
  );
}
