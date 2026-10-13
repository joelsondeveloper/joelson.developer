"use client";

import { useCallback, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGsap } from "@/hooks/use-gsap";
import {
  INTRO_FRAME_COUNT,
  useImageSequence,
} from "@/hooks/use-image-sequence";
import { IntroOverlay } from "./IntroOverlay";
import { addIntroOverlayMotion, animateIntroElements } from "./intro-motion";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

/** Existing frame sequence and hero share exactly one pinned scroll timeline. */
export function CinematicIntro() {
  useSmoothScroll();
  const overlayRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<ReturnType<typeof animateIntroElements> | null>(null);
  const configureTimeline = useCallback((timeline: gsap.core.Timeline) => {
    if (overlayRef.current) addIntroOverlayMotion(timeline, overlayRef.current);
  }, []);
  const onProgress = useCallback((progress: number) => {
    ambientRef.current?.update(progress);
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.inert = progress >= 0.4;
    if (progress >= 0.4) overlay.setAttribute("aria-hidden", "true");
    else overlay.removeAttribute("aria-hidden");
  }, []);
  const { containerRef, canvasRef, isReady, hasError } =
    useImageSequence(4, configureTimeline, onProgress);

  useGsap(
    () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      ambientRef.current = animateIntroElements(overlay, Number(containerRef.current?.dataset.scrollProgress || 0));
    },
    { scope: overlayRef, respectReducedMotion: false },
  );

  return (
    <section
      id="cinematic-intro"
      ref={containerRef}
      aria-label="Apresentação de Joelson"
      data-motion="scroll"
      data-ambient-motion="enabled"
      className="cinematic-intro bg-background relative h-dvh w-full overflow-hidden"
    >
      <picture className="scene-sequence-poster">
        <source
          media="(max-width: 767px)"
          srcSet="/images/tv-zoom/mobile/frame-0001.webp"
        />
        <img
          src="/images/tv-zoom/desktop/frame-0001.webp"
          alt=""
          width={1280}
          height={720}
          fetchPriority="high"
        />
      </picture>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-frame-count={INTRO_FRAME_COUNT}
        className={
          "scene-sequence-canvas " + (isReady ? "opacity-100" : "opacity-0")
        }
      />
      <IntroOverlay overlayRef={overlayRef} />
      {/* Essential identity remains available to assistive technology after the visual exit. */}
      <p className="sr-only">
        Joelson. Desenvolvedor, criativo e aprendiz em constante evolução.
        Transformando ideias em experiências digitais com propósito.
      </p>
      {hasError && (
        <p role="status" className="scene-sequence-error">
          Alguns quadros não puderam ser carregados. A introdução continua
          disponível.
        </p>
      )}
    </section>
  );
}
