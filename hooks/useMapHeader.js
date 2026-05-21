"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

export function useMapSearch(locations = [], communities = []) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Merge locations and communities into a single searchable dataset
  const dataset = useMemo(
    () => [
      ...locations.map((l) => ({ ...l, category: "Infrastructure" })),
      ...communities.map((c) => ({ ...c, category: "Community" })),
    ],
    [locations, communities],
  );

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      setShowResults(false);
      return;
    }
    const filtered = dataset
      .filter((item) =>
        [item.name, item.district, item.region, item.type]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q)),
      )
      .slice(0, 8);
    setResults(filtered);
    setShowResults(true);
  }, [query, dataset]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setShowResults(false);
  }, []);

  const handleSelect = useCallback((location, onSelectLocation) => {
    onSelectLocation(location);
    setQuery("");
    setShowResults(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    showResults,
    setShowResults,
    searchRef,
    clearSearch,
    handleSelect,
  };
}

export function useShare(activeLocation) {
  const [shareState, setShareState] = useState("idle");
  const [showTooltip, setShowTooltip] = useState(false);

  const handleShare = useCallback(async () => {
    if (!activeLocation) return;
    const [lat, lng] = activeLocation.coords;
    const url = `${window.location.origin}/maps?lat=${lat.toFixed(5)}&lng=${lng.toFixed(5)}&name=${encodeURIComponent(activeLocation.name)}`;
    const payload = {
      title: `SaniTrack — ${activeLocation.name}`,
      text: `View ${activeLocation.name} on SaniTrack`,
      url,
    };
    try {
      if (navigator.share && navigator.canShare?.(payload)) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(url);
        setShowTooltip(true);
      }
      setShareState("copied");
    } catch {
      setShareState("idle");
    }
    setTimeout(() => {
      setShareState("idle");
      setShowTooltip(false);
    }, 2000);
  }, [activeLocation]);

  return { shareState, showTooltip, handleShare };
}

export function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return { open, setOpen, ref };
}
