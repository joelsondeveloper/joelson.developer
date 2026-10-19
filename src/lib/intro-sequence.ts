/** One source of truth for the supplied 476-frame Hero and its responsive copy. */
export const introSequence = {
  desktop: { folder: "desktop-60fps", frameCount: 476, width: 1280, height: 720 },
  mobile: { folder: "mobile-60fps", frameCount: 476, width: 768, height: 432 },
} as const;
export type IntroVariant = keyof typeof introSequence;
export function introFrameUrl(index: number, variant: IntroVariant) {
  return "/images/tv-zoom/" + introSequence[variant].folder + "/frame-" + String(index + 1).padStart(4, "0") + ".webp";
}
