"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Native page scrolling, smoothed on the same animation clock as GSAP. */
export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    });
    const update = () => ScrollTrigger.update();
    const resize = () => lenis.resize();
    const advance = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", update);
    ScrollTrigger.addEventListener("refresh", resize);
    gsap.ticker.add(advance);

    return () => {
      gsap.ticker.remove(advance);
      ScrollTrigger.removeEventListener("refresh", resize);
      lenis.off("scroll", update);
      lenis.destroy();
    };
  }, []);
}
