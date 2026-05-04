"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type Theme = "dark" | "light";

interface ScopedThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ScopedThemeContext = createContext<ScopedThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

function getStorageKey(isAdmin: boolean) {
  return isAdmin ? "aloha_admin_theme" : "aloha_visitor_theme";
}

export function ScopedThemeProvider({
  children,
  isAdmin,
}: {
  children: ReactNode;
  isAdmin: boolean;
}) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // On mount, read the scoped key from localStorage in a single state update
  useEffect(() => {
    const key = getStorageKey(isAdmin);
    const saved = localStorage.getItem(key) as Theme | null;
    const resolved: Theme = saved === "light" ? "light" : "dark";
    
    // Defer state updates to avoid synchronous setState in effect warning
    const timeout = setTimeout(() => {
      setTheme(resolved);
      setMounted(true);
    }, 0);

    return () => clearTimeout(timeout);
  }, [isAdmin]);

  // Apply theme class to <html> ONLY when this component's page is active.
  // We debounce slightly so navigating between pages doesn't flicker.
  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      const key = getStorageKey(isAdmin);
      localStorage.setItem(key, next);
      return next;
    });
  }, [isAdmin]);

  if (!mounted) return null; // prevent SSR mismatch

  return (
    <ScopedThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ScopedThemeContext.Provider>
  );
}

export function useScopedTheme() {
  return useContext(ScopedThemeContext);
}
