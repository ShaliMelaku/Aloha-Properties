"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
      // If we are on the home page but have an auth token, move to admin
      if (window.location.pathname === '/') {
        router.push(`/admin${hash}`);
      }
    }
  }, [router]);

  return null;
}
