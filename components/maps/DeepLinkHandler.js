"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function DeepLinkHandler({ setActiveLocation }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const lat  = parseFloat(searchParams.get("lat"));
    const lng  = parseFloat(searchParams.get("lng"));
    const name = searchParams.get("name");

    if (!isNaN(lat) && !isNaN(lng)) {
      setActiveLocation({
        id:     `shared-${lat}-${lng}`,
        name:   name ? decodeURIComponent(name) : "Shared Location",
        coords: [lat, lng],
        color:  "#4285F4",
      });
    }
  }, [searchParams, setActiveLocation]);

  return null;
}
