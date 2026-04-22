import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ScopedThemeProvider } from "@/components/scoped-theme-provider";
import { StatusProvider } from "@/context/status-context";
import { CurrencyProvider } from "@/context/currency-context";
import { ComparisonProvider } from "@/context/comparison-context";
import { VisitorTracker } from "@/components/visitor-tracker";
import { BackToTop } from "@/components/back-to-top";
import { ScrollProgress } from "@/components/scroll-progress";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aloha Properties | Modern Luxury Real Estate Addis Ababa",
  description: "Bespoke property marketing and acquisition services for the visionary investor in Ethiopia. Expert real estate insights and luxury listings.",
  keywords: ["Luxury Real Estate Addis Ababa", "Ethiopia Property Investment", "Addis Ababa Apartments for sale", "Real Estate Market Trends Ethiopia", "Aloha Properties"],
  authors: [{ name: "Aloha Properties" }],
  creator: "Aloha Properties",
  publisher: "Aloha Properties",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://alohaproperties.net",
    siteName: "Aloha Properties",
    title: "Aloha Properties | High-Fidelity Real Estate in Ethiopia",
    description: "Secure your future with premium real estate investments in Addis Ababa.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Aloha Properties Luxury Listing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aloha Properties | Modern Luxury Real Estate",
    description: "Premium property marketing for the visionary investor in Ethiopia.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${plusJakarta.variable} noise-bg`} suppressHydrationWarning>
        <ScopedThemeProvider isAdmin={false}>
          <StatusProvider>
            <CurrencyProvider isAdmin={false}>
              <ComparisonProvider>
                <VisitorTracker />
                <BackToTop />
                <ScrollProgress />
                {children}
              </ComparisonProvider>
            </CurrencyProvider>
          </StatusProvider>
        </ScopedThemeProvider>
      </body>
    </html>
  );
}
