"use client";

import React, { createContext, useContext, useState } from "react";

type Currency = "ETB" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (etbPrice: number) => string;
  convertPrice: (etbPrice: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Default conversion rate: 1 USD = 120 ETB
const USD_RATE = 120;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aloha-currency") as Currency;
      if (saved && (saved === "ETB" || saved === "USD")) return saved;
    }
    return "ETB";
  });

  const handleSetCurrency = (curr: Currency) => {
    setCurrency(curr);
    localStorage.setItem("aloha-currency", curr);
  };

  const convertPrice = (etbPrice: number) => {
    if (currency === "USD") return etbPrice / USD_RATE;
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
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, convertPrice }}>
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
