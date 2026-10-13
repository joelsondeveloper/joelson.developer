"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => {
    mediaQuery.removeEventListener("change", callback);
  };
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** Server / pre-hydration snapshot — defaults to motion enabled. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Tracks the user's `prefers-reduced-motion` OS/browser setting reactively.
 *
 * Implemented with `useSyncExternalStore` so it is hydration-safe (the
 * server snapshot is a stable `false`) and never triggers cascading renders.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
