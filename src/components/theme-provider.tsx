"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { usePathname } from "next/navigation";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname();
  
  // Isolate admin interface from the global generic visitor theme explicitly
  const isServerAdmin = pathname?.startsWith('/admin');

  return (
    <NextThemesProvider 
      {...props} 
      forcedTheme={isServerAdmin ? "dark" : undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
