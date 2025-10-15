"use client";

import React, { useEffect, useRef } from "react";

interface GoogleMapComponentProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markerPosition: { lat: number; lng: number };
  markerTitle?: string;
  mapId?: string;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  center,
  zoom = 15,
  markerPosition,
  markerTitle = "Location",
  mapId = "DEMO_MAP_ID",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // ตรวจสอบว่า script ถูกโหลดแล้วหรือยัง
    if (scriptLoadedRef.current) {
      return;
    }

    // ตรวจสอบว่ามี API Key หรือไม่
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API Key is not configured");
      return;
    }

    // โหลด Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=console.debug&libraries=maps,marker&v=beta`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      scriptLoadedRef.current = true;
      console.log("Google Maps script loaded successfully");
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };

    // เพิ่ม script เข้า head ถ้ายังไม่มี
    if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      document.head.appendChild(script);
    } else {
      scriptLoadedRef.current = true;
    }

    return () => {
      // ไม่ต้อง cleanup script เพราะจะใช้ร่วมกันทั้ง app
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      dangerouslySetInnerHTML={{
        __html: `
          <gmp-map 
            center="${center.lat},${center.lng}" 
            zoom="${zoom}" 
            map-id="${mapId}"
            style="width: 100%; height: 100%; display: block;"
          >
            <gmp-advanced-marker 
              position="${markerPosition.lat},${markerPosition.lng}" 
              title="${markerTitle}"
            ></gmp-advanced-marker>
          </gmp-map>
        `,
      }}
    />
  );
};

export default GoogleMapComponent;
