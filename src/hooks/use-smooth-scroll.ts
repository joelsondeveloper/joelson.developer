"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";
import {
  navigatePortfolio,
  portfolioSections,
  registerPortfolioScroller,
} from "@/lib/portfolio-navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** One scroll animation shared by wheel input and section navigation. */
export function useSmoothScroll() {
  const reduced = usePrefersReducedMotion();
  const restored = useRef(false);

  useEffect(() => {
    // Let one Lenis animation own scroll, including programmatic navigation.
    const lenis = new Lenis({
      respectReducedMotion: false,
      lerp: .12,
      autoRaf: false,
      smoothWheel: !reduced,
      allowNestedScroll: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });
    const unregister = registerPortfolioScroller(lenis);
    const advance = (time: number) => lenis.raf(time * 1000);

    const lock = () => lenis.stop();

    const unlock = () => {
      lenis.start();
      window.setTimeout(restore, 50);
    };

    if (document.querySelector(".signal-preloader")) {
      lock();
    }

    window.addEventListener("portfolio:loading", lock);
    window.addEventListener("portfolio:ready", unlock);

    const navigateHash = () => {
      const id =
        portfolioSections.find((section) => `#${section.id}` === location.hash)
          ?.id ?? (location.hash === "#cinematic-intro" ? "inicio" : undefined);

      if (id) {
        navigatePortfolio(id, {
          immediate: true,
          history: false,
        });
      }
    };

    const restore = () => {
      if (
        document.documentElement.dataset.signalLoading === "true" ||
        restored.current ||
        !ScrollTrigger.getAll().some(
          (trigger) =>
            trigger.trigger?.id === "cinematic-intro" && trigger.animation,
        )
      ) {
        return;
      }

      restored.current = true;
      navigateHash();
    };

    const initial = window.setTimeout(restore, 150);

    window.addEventListener("hashchange", navigateHash);

    const update = () => {
      ScrollTrigger.update();
    };

    const resize = () => {
      lenis.resize();
      restore();
    };

    lenis.on("scroll", update);

    ScrollTrigger.addEventListener("refresh", resize);

    gsap.ticker.add(advance);

    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(advance);

      ScrollTrigger.removeEventListener("refresh", resize);

      lenis.off("scroll", update);

      window.removeEventListener("portfolio:loading", lock);
      window.removeEventListener("portfolio:ready", unlock);

      unregister();

      window.clearTimeout(initial);

      window.removeEventListener("hashchange", navigateHash);

      lenis.destroy();
    };
  }, [reduced]);
}
