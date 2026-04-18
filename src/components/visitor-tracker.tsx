"use client";

import { useEffect } from "react";
import { supabaseClient } from "@/lib/supabase";

export function VisitorTracker() {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // 1. Unique Visitor ID (localStorage)
        let visitorId = localStorage.getItem("aloha_visitor_id");
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem("aloha_visitor_id", visitorId);
        }

        // 2. Silent IP-based Geolocation (Fallback)
        let geoData = {
          city: "Unknown",
          country_name: "Unknown",
          region: "Unknown",
          latitude: 0,
          longitude: 0
        };

        try {
          const res = await fetch("https://ipapi.co/json/");
          if (res.ok) geoData = await res.json();
        } catch (e) {
          console.warn("IP-Geo silent fail:", e);
        }

        // 3. Browser High-Accuracy Geolocation (Prompted on Access)
        const getBrowserGeo = (): Promise<GeolocationPosition | null> => {
           return new Promise((resolve) => {
              if (!navigator.geolocation) {
                 resolve(null);
                 return;
              }
              navigator.geolocation.getCurrentPosition(
                 (pos) => resolve(pos),
                 () => resolve(null),
                 { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
              );
           });
        };

        const browserPos = await getBrowserGeo();
        const hasBrowserPermission = !!browserPos;

        // 4. Persistence to Supabase
        await supabaseClient.from("visitor_logs").insert({
          visitor_id: visitorId,
          country: geoData.country_name,
          city: browserPos ? "High-Accuracy Verified" : geoData.city,
          region: geoData.region,
          latitude: browserPos ? browserPos.coords.latitude : geoData.latitude,
          longitude: browserPos ? browserPos.coords.longitude : geoData.longitude,
          browser_geolocated: hasBrowserPermission,
          user_agent: navigator.userAgent,
          session_id: sessionStorage.getItem("aloha_session_id") || (() => {
            const sid = crypto.randomUUID();
            sessionStorage.setItem("aloha_session_id", sid);
            return sid;
          })()
        });

      } catch (error) {
        console.error("Tracking fault:", error);
      }
    };

    trackVisitor();
  }, []);

  return null; // Invisible component
}
