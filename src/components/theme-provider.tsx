"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Use a SINGLE stable key to prevent re-mounting the entire app tree during navigation.
  // This eliminates the "glitch" where the theme flashes or resets.
  return (
    <NextThemesProvider 
      {...props} 
      storageKey="aloha-v3-theme"
      forcedTheme={undefined}
    >
      {children}
    </NextThemesProvider>
  );
}
