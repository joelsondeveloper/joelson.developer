"use client";
import { useSyncExternalStore } from "react";

const KEY = "portfolio:reduced-motion";
const listeners = new Set<() => void>();
let fallback = false;

/** Explicit site preference: animations start enabled, independently of the OS. */
export function getReducedMotionPreference(): boolean {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(KEY) === "true"; } catch { return fallback; }
}
function syncAttribute() { document.documentElement.dataset.reducedMotion = String(getReducedMotionPreference()); }
function notify() { syncAttribute(); listeners.forEach(listener => listener()); }
function storage(event: StorageEvent) { if (event.key === KEY || event.key === null) notify(); }
function subscribe(listener: () => void) {
  if (!listeners.size) window.addEventListener("storage", storage);
  listeners.add(listener); syncAttribute();
  return () => { listeners.delete(listener); if (!listeners.size) window.removeEventListener("storage", storage); };
}
export function setReducedMotionPreference(value: boolean) {
  fallback = value;
  try { window.localStorage.setItem(KEY, String(value)); } catch { /* Session preference still works without storage. */ }
  notify();
}
const getServerSnapshot = () => false;
/** Kept as a shared hook for existing consumers; reads the site's explicit choice. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getReducedMotionPreference, getServerSnapshot);
}
