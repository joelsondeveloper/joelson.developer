/**
 * Centralized site metadata.
 *
 * Single source of truth for the branding copy reused across layout
 * metadata and UI components. Keeping it here avoids scattering string
 * literals and makes future changes (real name, copy tweaks) trivial.
 */
export const site = {
  /** Provisional project name shown while the experience is being built. */
  name: "Cinematic Portfolio",
  /** Provisional tagline shown on the placeholder home page. */
  tagline: "The experience begins soon.",
  description:
    "A retro VHS-inspired cinematic portfolio. The experience begins soon.",
} as const;

export type Site = typeof site;
