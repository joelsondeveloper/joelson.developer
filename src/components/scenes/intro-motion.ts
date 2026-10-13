import { gsap } from "@/lib/gsap";

/** Scroll exits share the frame sequence's normalized 0..1 timeline. */
export function addIntroOverlayMotion(timeline: gsap.core.Timeline, overlay: HTMLElement) {
  const layer = (name: string) => overlay.querySelector(`[data-intro-layer="${name}"]`);
  const fade = (name: string, start: number, end: number, y = 0) => {
    const target = layer(name);
    if (target) timeline.fromTo(target, { autoAlpha: 1, y: 0 }, {
      autoAlpha: 0, y, duration: end - start, ease: "none", immediateRender: false,
    }, start);
  };
  const graphics = layer("graphics");
  if (graphics) {
    timeline.fromTo(graphics, { autoAlpha: 1 }, { autoAlpha: 0.85, duration: 0.1, ease: "none", immediateRender: false }, 0);
    timeline.to(graphics, { autoAlpha: 0, duration: 0.15, ease: "none" }, 0.1);
  }
  fade("scroll", 0.02, 0.12, 12);
  fade("polaroids", 0.1, 0.25, -16);
  fade("editorial", 0.1, 0.25, 14);
  fade("signature", 0.1, 0.25, 12);
  fade("presentation", 0.25, 0.4, -18);
  fade("header", 0.25, 0.4, -12);
  fade("atmosphere", 0.1, 0.4);
  timeline.set(overlay, { autoAlpha: 0 }, 0.4);
}

/** Independent inner wrappers keep entrances, floating, and scroll exits additive. */
export function animateIntroElements(overlay: HTMLElement, initialProgress: number) {
  gsap.fromTo(overlay.querySelectorAll("[data-entry]"), { autoAlpha: 0, y: 12 }, {
    autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.045, ease: "power2.out",
  });
  gsap.fromTo(overlay.querySelector(".intro-name span"), {
    clipPath: "inset(0% 0% 100% 0%)",
  }, {
    clipPath: "inset(-20% -20% -45% -20%)", duration: 1.1, delay: 0.1, ease: "power2.out",
  });

  const cards = [...overlay.querySelectorAll<HTMLElement>(".polaroid-float")].map((card, index) => {
    gsap.fromTo(card.querySelector(".polaroid-entry"), { rotation: index % 2 ? 3 : -3 }, {
      rotation: 0, duration: 1, delay: index * 0.06, ease: "power2.out",
    });
    return gsap.fromTo(card, { y: 3 + index, x: index % 2 ? -1.5 : 1.5, rotation: -0.7 }, {
      y: -6 - index % 3, x: index % 2 ? 1.5 : -1.5, rotation: 0.9,
      duration: 3.2 + index * 0.45, delay: 0.7 + index * 0.1,
      repeat: -1, yoyo: true, ease: "sine.inOut",
    });
  });
  overlay.querySelectorAll<SVGPathElement>(".polaroid-arrow path").forEach(path => {
    const length = path.getTotalLength();
    gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, {
      strokeDashoffset: 0, duration: 0.9, delay: 0.35, ease: "power2.out",
    });
  });
  const indicators = [
    gsap.fromTo(overlay.querySelector(".scroll-wheel"), { y: 0, opacity: 1 }, {
      y: 5, opacity: 0.15, duration: 1.1, repeat: -1, repeatDelay: 0.25, ease: "power2.inOut",
    }),
    gsap.to(overlay.querySelector(".scroll-chevron"), { y: 4, duration: 0.9, repeat: -1, yoyo: true, ease: "sine.inOut" }),
  ];
  const update = (progress: number) => {
    for (const tween of cards) if (tween.paused() !== (progress >= 0.25)) tween.paused(progress >= 0.25);
    for (const tween of indicators) if (tween.paused() !== (progress >= 0.12)) tween.paused(progress >= 0.12);
  };
  update(initialProgress);
  return { update };
}
