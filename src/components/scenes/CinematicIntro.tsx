"use client";

import { useCallback, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGsap } from "@/hooks/use-gsap";
import {
  INTRO_FRAME_COUNT,
  useImageSequence,
} from "@/hooks/use-image-sequence";
import { ExperienceScene } from "./ExperienceScene";
import { ProjectsScene } from "./ProjectsScene";
import { IntroOverlay } from "./IntroOverlay";
import { PortraitScene } from "./PortraitScene";
import { addAboutMotion } from "./about-motion";
import { addIntroOverlayMotion, animateIntroElements } from "./intro-motion";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

/** Existing frame sequence and hero share exactly one pinned scroll timeline. */
export function CinematicIntro() {
  useSmoothScroll();
  const overlayRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const ambientRef = useRef<ReturnType<typeof animateIntroElements> | null>(null);
  const configureTimeline = useCallback((timeline: gsap.core.Timeline) => {
    if (overlayRef.current) addIntroOverlayMotion(timeline, overlayRef.current);
    const portrait = portraitRef.current;
    if (!portrait) return;
    timeline.fromTo(portrait.parentElement!.querySelector(".portrait-bezel"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, ease: "none" }, 0.88);
    timeline.fromTo(portrait, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, ease: "none" }, 0.88);
    timeline.fromTo(portrait.querySelector("[data-portrait-photo]"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.10, ease: "power2.out" }, 0.90);
    timeline.fromTo(portrait.querySelector("[data-portrait-name]"), { y: 38, opacity: 0 }, { y: 0, opacity: 1, duration: 0.08, ease: "power2.out" }, 0.92);
    timeline.fromTo(portrait.querySelectorAll("[data-portrait-entry]"), { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "none" }, 0.92);
    addAboutMotion(timeline, portrait);
    const projects = projectsRef.current;
    if (projects) {
      timeline.to(portrait, { autoAlpha: 0, duration: .15, ease: "none" }, 4.31);
      timeline.fromTo(projects, { autoAlpha: 0 }, { autoAlpha: 1, duration: .18, ease: "none" }, 4.46);
      timeline.fromTo(projects.querySelectorAll(".projects-heading, .projects-header, .projects-interface, .projects-footer"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .14, ease: "none" }, 4.56);
      const route = { progress: 0 };
      timeline.to(route, { progress: 1, duration: 2.4, ease: "none", onUpdate: () => { projects.dataset.pathProgress = route.progress.toFixed(4); } }, 4.7);
    }
    const experience = experienceRef.current;
    if (experience && projects) {
      const noise = experience.parentElement!.querySelector(".experience-transition");
      timeline.to(projects, { autoAlpha: 0, duration: .12, ease: "none" }, 7.18);
      timeline.fromTo(noise, { autoAlpha: 0 }, { autoAlpha: .88, duration: .07, ease: "none" }, 7.18);
      timeline.to(noise, { autoAlpha: 0, duration: .12, ease: "none" }, 7.32);
      timeline.fromTo(experience, { autoAlpha: 0 }, { autoAlpha: 1, duration: .18, ease: "none" }, 7.32);
      timeline.fromTo(experience.querySelectorAll("[data-experience-entry]"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .18, stagger: .025, ease: "power2.out" }, 7.38);
      timeline.fromTo(experience.querySelectorAll(".experience-polaroid"), { opacity: 0 }, { opacity: 1, duration: .18, stagger: .025, ease: "none" }, 7.4);
      timeline.to({}, { duration: 1.65 }, 7.75);
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
      <div className="experience-transition vhs-static" aria-hidden="true"><span>CH 04 ▶</span></div>
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

