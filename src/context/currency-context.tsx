"use client";

import React, { createContext, useContext, useState } from "react";

type Currency = "ETB" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (etbPrice: number) => string;
  convertPrice: (etbPrice: number) => number;
  usdRate: number;
  lastUpdated: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);


export function CurrencyProvider({ 
  children,
  isAdmin = false
}: { 
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const getStorageKey = () => isAdmin ? "aloha-admin-currency" : "aloha-visitor-currency";

  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(getStorageKey()) as Currency;
      if (saved && (saved === "ETB" || saved === "USD")) return saved;
    }
    return "ETB";
  });

  const [usdRate, setUsdRate] = useState(157.00); // Updated Baseline
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch dynamic NBE rate on mount
  React.useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch('/api/exchange-rate');
        const data = await res.json();
        if (data.rate) {
          setUsdRate(data.rate);
          setLastUpdated(data.timestamp || new Date().toISOString());
          console.log(`[Currency] Live NBE Rate Sync: 1 USD = ${data.rate} ETB`);
        }
      } catch {
        console.error("[Currency] NBE Sync Failed, using local fallback.");
      }
    }
    fetchRate();
  }, []);

  const handleSetCurrency = (curr: Currency) => {
    setCurrency(curr);
    localStorage.setItem(getStorageKey(), curr);
  };

  const convertPrice = (etbPrice: number) => {
    if (currency === "USD") return etbPrice / usdRate;
    return etbPrice;
  };

  const formatPrice = (etbPrice: number) => {
    const converted = convertPrice(etbPrice);
    
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(converted);
    }

    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      maximumFractionDigits: 0,
    }).format(converted).replace("ETB", "Birr");
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, convertPrice, usdRate, lastUpdated }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
