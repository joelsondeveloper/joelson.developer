"use client";

import { prioritizeScene } from "@/lib/scene-preparation";
import type Lenis from "lenis";
import { ScrollTrigger } from "@/lib/gsap";
import { getReducedMotionPreference } from "@/hooks/use-prefers-reduced-motion";

export const portfolioSections = [
  { id: "sobre", label: "SOBRE", time: .97 },
  { id: "projetos", label: "PROJETOS", time: 5.9 },
  { id: "experiencias", label: "EXPERIÊNCIA", time: 8.1 },
  { id: "contatos", label: "CONTATO", time: 11.74 },
] as const;
export type PortfolioDestination = typeof portfolioSections[number]["id"] | "inicio";
let scroller: Lenis | null = null;
export function registerPortfolioScroller(instance: Lenis) {
  scroller = instance;
  return () => { if (scroller === instance) scroller = null; };
}
export function navigatePortfolio(id: PortfolioDestination, options: { immediate?: boolean; history?: boolean } = {}) {
  prioritizeScene(id);
  const section = portfolioSections.find(section => section.id === id);
  const time = section?.time ?? 0;
  const trigger = ScrollTrigger.getAll().find(trigger => trigger.trigger?.id === "cinematic-intro");
  const duration = trigger?.animation?.duration() || 11.8;
  const target = trigger ? trigger.start + (trigger.end - trigger.start) * time / duration : innerHeight * 4 * time;
  const hash = id === "inicio" ? "#cinematic-intro" : `#${id}`;
  if (options.history !== false && location.hash !== hash) history.pushState(null, "", hash);
  const focus = () => {
    const destination = document.getElementById(id === "inicio" ? "cinematic-intro" : id);
    if (destination) { destination.setAttribute("tabindex", "-1"); destination.focus({ preventScroll: true }); }
  };
  const immediate = options.immediate || getReducedMotionPreference();
  const travel = Math.abs(target - window.scrollY) / window.innerHeight;
  const seconds = Math.min(1.35, Math.max(.65, travel / 22));
  const complete = () => requestAnimationFrame(focus);
  if (scroller) scroller.scrollTo(target, { immediate, duration: seconds, easing: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, force: true, onComplete: complete });
  else { window.scrollTo({ top: target, behavior: immediate ? "instant" : "smooth" }); if (immediate) complete(); }
}
