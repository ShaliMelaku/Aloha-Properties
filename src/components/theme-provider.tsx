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
      // Use different storage keys to prevent theme bleeding between portals
      storageKey={isServerAdmin ? "aloha-admin-theme" : "aloha-visitor-theme"}
      // Remove forcedTheme to allow independent toggling if desired
      forcedTheme={undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
