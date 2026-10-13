"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const timer = window.setInterval(callback, 30_000);
  return () => window.clearInterval(timer);
}
const getSnapshot = () => Math.floor(Date.now() / 60_000);
const getServerSnapshot = () => 0;

export function VhsIndicator() {
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const date = new Date(minute * 60_000);
  const options = { timeZone: "America/Fortaleza" };
  const time = new Intl.DateTimeFormat("en-US", { ...options, hour: "2-digit", minute: "2-digit", hour12: true }).format(date);
  const calendar = new Intl.DateTimeFormat("en-US", { ...options, month: "short", day: "2-digit", year: "numeric" }).format(date).replace(",", "").toUpperCase();
  const [clock, period] = time.split(" ");

  return (
    <div className="vhs-indicator" aria-label="Identidade VHS">
      <span className="vhs-play">VHS <span aria-hidden="true">▶</span></span>
      <div className="vhs-clock" aria-hidden="true">
        <span>{minute ? `${period} ${clock}` : "PM --:--"}</span>
        <span>{minute ? calendar : "OCT 13 2026"}</span>
      </div>
    </div>
  );
}
