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

/** Server / pre-hydration snapshot — defaults to reduced motion until the browser preference is known. */
function getServerSnapshot(): boolean {
  return true;
}

/**
 * Tracks the user's `prefers-reduced-motion` OS/browser setting reactively.
 *
 * Implemented with `useSyncExternalStore` so it is hydration-safe (the
 * server snapshot is a stable `true`) and never triggers cascading renders.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
