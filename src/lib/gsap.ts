import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP core instance and one-time plugin registration.
 *
 * Import this module from Client Components only. On import it registers
 * `ScrollTrigger` exactly once. The registration is guarded by a
 * `typeof window` check so it is a no-op during SSR and safe under HMR
 * (repeated imports won't double-register).
 *
 * Consuming code (e.g. the `useGsap` hook) imports `gsap` from here to
 * guarantee plugins are available before any animation runs.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
