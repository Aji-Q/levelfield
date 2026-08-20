"use client";

import { useEffect, useState } from "react";
import { formatRelativeToNow } from "@/lib/format";

export function ExpiryState({ expiry }: { expiry: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (now === null) return <span className="expiry-state">checking window…</span>;

  const expired = new Date(expiry).getTime() <= now;
  return (
    <span className={`expiry-state ${expired ? "expiry-state--expired" : "expiry-state--open"}`}>
      {formatRelativeToNow(expiry, now)}
    </span>
  );
}
