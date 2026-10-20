"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { stopScenePreparation } from "@/lib/scene-preparation";
import { SignalPreloader } from "./SignalPreloader";
import { introFrameUrl } from "@/lib/intro-sequence";
import { CrtGrain } from "@/components/ui/CrtGrain";
import { PortfolioHeader } from "@/components/ui/PortfolioHeader";
import { gsap } from "@/lib/gsap";
import { useGsap } from "@/hooks/use-gsap";
import {
  INTRO_FRAME_COUNT,
  useImageSequence,
} from "@/hooks/use-image-sequence";
import { ContactScene } from "./ContactScene";
import { addContactMotion } from "./contact-motion";
import { ExperienceScene } from "./ExperienceScene";
import { ProjectsScene } from "./ProjectsScene";
import { IntroOverlay } from "./IntroOverlay";
import { PortraitScene } from "./PortraitScene";
import { addAboutMotion } from "./about-motion";
import { addIntroOverlayMotion, animateIntroElements } from "./intro-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

/** Existing frame sequence and hero share exactly one pinned scroll timeline. */
export function CinematicIntro() {
  useSmoothScroll();
  useEffect(() => () => stopScenePreparation(), []);
  const [released, setReleased] = useState(false);
  const releaseSignal = useCallback(() => setReleased(true), []);
  const reduced = usePrefersReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const ambientRef = useRef<ReturnType<typeof animateIntroElements> | null>(
    null,
  );
  const configureTimeline = useCallback((timeline: gsap.core.Timeline) => {
    if (overlayRef.current) addIntroOverlayMotion(timeline, overlayRef.current);
    const portrait = portraitRef.current;
    if (!portrait) return;
    timeline.fromTo(
      portrait.parentElement!.querySelector(".portrait-bezel"),
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.12, ease: "none" },
      0.88,
    );
    timeline.fromTo(
      portrait,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.12, ease: "none" },
      0.88,
    );
    timeline.fromTo(
      portrait.querySelector("[data-portrait-photo]"),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.1, ease: "power2.out" },
      0.9,
    );
    timeline.fromTo(
      portrait.querySelector("[data-portrait-name]"),
      { y: 38, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.08, ease: "power2.out" },
      0.92,
    );
    timeline.fromTo(
      portrait.querySelectorAll("[data-portrait-entry]"),
      { opacity: 0 },
      { opacity: 1, duration: 0.08, ease: "none" },
      0.92,
    );
    addAboutMotion(timeline, portrait);
    const projects = projectsRef.current;
    if (projects) {
      timeline.to(
        portrait,
        { autoAlpha: 0, duration: 0.15, ease: "none" },
        4.31,
      );
      timeline.fromTo(
        projects,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.18, ease: "none" },
        4.46,
      );
      timeline.fromTo(
        projects.querySelectorAll(
          ".projects-heading, .projects-header, .projects-interface, .projects-footer",
        ),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.14, ease: "none" },
        4.56,
      );
      const route = { progress: 0 };
      timeline.to(
        route,
        {
          progress: 1,
          duration: 2.4,
          ease: "none",
          onUpdate: () => {
            projects.dataset.pathProgress = route.progress.toFixed(4);
          },
        },
        4.7,
      );
    }
    const experience = experienceRef.current;
    if (experience && projects) {
      const noise = experience.parentElement!.querySelector(
        ".experience-transition",
      );
      timeline.to(
        projects,
        { autoAlpha: 0, duration: 0.12, ease: "none" },
        7.18,
      );
      timeline.fromTo(
        noise,
        { autoAlpha: 0 },
        { autoAlpha: 0.88, duration: 0.07, ease: "none" },
        7.18,
      );
      timeline.to(noise, { autoAlpha: 0, duration: 0.12, ease: "none" }, 7.32);
      timeline.fromTo(
        experience,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.18, ease: "none" },
        7.32,
      );
      timeline.fromTo(
        experience.querySelectorAll("[data-experience-entry]"),
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.18,
          stagger: 0.025,
          ease: "power2.out",
        },
        7.38,
      );
      timeline.fromTo(
        experience.querySelectorAll(".experience-polaroid"),
        { opacity: 0 },
        { opacity: 1, duration: 0.18, stagger: 0.025, ease: "none" },
        7.4,
      );
      timeline.to({}, { duration: 1.65 }, 7.75);
      if (contactRef.current)
        addContactMotion(timeline, contactRef.current, experience);
    }
  }, []);
  const onProgress = useCallback((progress: number) => {
    ambientRef.current?.update(progress);
    const portrait = portraitRef.current;
    if (portrait) {
      const active = progress >= 0.88;
      if (portrait.dataset.active !== String(active)) {
        portrait.dataset.active = String(active);
        portrait.inert = !active;
        portrait.setAttribute("aria-hidden", String(!active));
      }
    }
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.inert = progress >= 0.4;
    if (progress >= 0.4) overlay.setAttribute("aria-hidden", "true");
    else overlay.removeAttribute("aria-hidden");
  }, []);
  const { containerRef, canvasRef, isReady, hasError } = useImageSequence(
    4,
    configureTimeline,
    onProgress,
  );

  useGsap(
    () => {
      const overlay = overlayRef.current;
      if (!overlay || !released) return;
      ambientRef.current = animateIntroElements(
        overlay,
        Number(containerRef.current?.dataset.scrollProgress || 0),
        reduced,
      );
    },
    { scope: overlayRef, respectReducedMotion: false, dependencies: [reduced, released] },
  );

  return (
    <>
    <SignalPreloader onRelease={releaseSignal} />
    <noscript><style>{".signal-preloader{display:none}"}</style></noscript>
    <section
      id="cinematic-intro"
      ref={containerRef}
      aria-label="Apresentação de Joelson"
      data-signal-pending={!released}
      data-motion="scroll"
      data-ambient-motion="enabled"
      className="cinematic-intro bg-background relative h-dvh w-full overflow-hidden"
    >
      <PortfolioHeader />
      <picture className="scene-sequence-poster">
        <source
          media="(max-width: 767px)"
          srcSet={introFrameUrl(0, "mobile")}
        />
        <img
          src={introFrameUrl(0, "desktop")}
          alt=""
          width={1280}
          height={720}
          fetchPriority="high"
          decoding="async"
          loading="eager"
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
      <div className="portrait-bezel" aria-hidden="true" />
      <PortraitScene sceneRef={portraitRef} />
      <ProjectsScene sceneRef={projectsRef} />
      <ExperienceScene sceneRef={experienceRef} />
      <ContactScene sceneRef={contactRef} />
      <CrtGrain />
      <div className="experience-transition vhs-static" aria-hidden="true">
        <span>CH 04 ▶</span>
      </div>
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
    </>
  );
}
