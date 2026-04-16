import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { StatusProvider } from "@/context/status-context";
import { CurrencyProvider } from "@/context/currency-context";
import { ComparisonProvider } from "@/context/comparison-context";

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
  description: "Bespoke property marketing and acquisition services for the visionary investor in Ethiopia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${plusJakarta.variable} noise-bg`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <StatusProvider>
            <CurrencyProvider>
              <ComparisonProvider>
                {children}
              </ComparisonProvider>
            </CurrencyProvider>
          </StatusProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
