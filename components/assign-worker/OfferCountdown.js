"use client";

import { useState, useEffect, useCallback } from "react";
import { Timer } from "lucide-react";
import { OFFER_TIMEOUT_MS } from "./constants";

export function OfferCountdown({ createdAt, onExpire }) {
  const calc = useCallback(() => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, OFFER_TIMEOUT_MS - elapsed);
  }, [createdAt]);

  const [remaining, setRemaining] = useState(calc);

  useEffect(() => {
    if (remaining <= 0) { onExpire?.(); return; }
    const tick = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1000;
        if (next <= 0) { clearInterval(tick); onExpire?.(); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []); // run once on mount

  const pct = (remaining / OFFER_TIMEOUT_MS) * 100;
  const isUrgent = remaining < 5 * 60 * 1000;
  const min = Math.floor(remaining / 60000);
  const sec = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Timer className={`w-3 h-3 ${isUrgent ? "text-red-500" : "text-yellow-500"}`} />
          <span className={`text-[10px] font-medium ${isUrgent ? "text-red-600" : "text-yellow-700"}`}>
            Awaiting response
          </span>
        </div>
        <span className={`text-[10px] font-mono font-bold tabular-nums ${isUrgent ? "text-red-600" : "text-gray-600"}`}>
          {min}:{sec.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? "bg-red-400" : "bg-yellow-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
