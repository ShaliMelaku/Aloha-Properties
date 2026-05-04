"use client";

import React, { createContext, useContext, useState } from "react";
import { SupabaseProperty } from "@/hooks/use-properties";

interface ComparisonContextType {
  compared: SupabaseProperty[];
  toggleCompare: (property: SupabaseProperty) => void;
  clearCompare: () => void;
  activePulse: SupabaseProperty | null;
  setActivePulse: (property: SupabaseProperty | null) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [compared, setCompared] = useState<SupabaseProperty[]>([]);
  const [activePulse, setActivePulse] = useState<SupabaseProperty | null>(null);

  const toggleCompare = (property: SupabaseProperty) => {
    setCompared(prev => {
      const exists = prev.find(p => p.id === property.id);
      if (exists) {
        return prev.filter(p => p.id !== property.id);
      }
      if (prev.length >= 3) return prev; // Limit to 3 for UI clarity
      return [...prev, property];
    });
  };

  const clearCompare = () => setCompared([]);

  return (
    <ComparisonContext.Provider value={{ 
      compared, 
      toggleCompare, 
      clearCompare, 
      activePulse, 
      setActivePulse 
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
