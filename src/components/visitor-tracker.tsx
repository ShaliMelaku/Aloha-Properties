"use client";

import { useEffect } from "react";
import { supabaseClient } from "@/lib/supabase";

export function VisitorTracker() {
  useEffect(() => {
    // Unique session check using sessionStorage
    const SESSION_KEY = "aloha_visit_tracked";
    const hasTracked = sessionStorage.getItem(SESSION_KEY);

    if (hasTracked) return;

    const trackVisit = async () => {
      try {
        // 1. Fetch Geolocation Data (High Fidelity over HTTPS)
        const geoRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
        const geoData = await geoRes.json();

        // 2. Identify Device/Browser (Simple parsing)
        const ua = navigator.userAgent;
        let deviceType = "Desktop";
        if (/tablet|ipad|playbook|silk/i.test(ua)) deviceType = "Tablet";
        else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) deviceType = "Mobile";

        let browser = "Other";
        if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
        else if (ua.includes("Edge")) browser = "Edge";

        // 3. Log to Supabase
        const { error } = await supabaseClient.from("visitors").insert({
          country: geoData.country || 'Unknown',
          country_code: geoData.country_code || 'UN',
          city: geoData.city || '',
          region: geoData.region || '',
          lat: parseFloat(geoData.latitude) || 0,
          lng: parseFloat(geoData.longitude) || 0,
          device_type: deviceType,
          browser: browser
        });

        if (!error) {
          sessionStorage.setItem(SESSION_KEY, "true");
        }
      } catch (err) {
        console.error("Aloha Analytics Error:", err);
      }
    };

    // Delay slightly to prioritize core LCP
    const timer = setTimeout(trackVisit, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null; // Invisible component
}
