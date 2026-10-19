import { getReducedMotionPreference } from "@/hooks/use-prefers-reduced-motion";
import { gsap } from "@/lib/gsap";

export function addAboutMotion(
  timeline: gsap.core.Timeline,
  portrait: HTMLElement,
) {
  const reduced = getReducedMotionPreference();
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const panels = [
    ...portrait.querySelectorAll<HTMLElement>("[data-about-panel]"),
  ];
  const photo = portrait.querySelector<HTMLElement>(".portrait-photo")!;
  const name = portrait.querySelector<HTMLElement>(".portrait-name")!;
  const shift = () => -portrait.clientWidth * 0.475;
  if (mobile) {
    timeline.to(
      portrait.querySelector(".portrait-index"),
      { autoAlpha: 0, duration: 0.16 },
      1.02,
    );
    timeline.to(
      [photo, name, portrait.querySelector(".portrait-interact")],
      { autoAlpha: 0, duration: 0.18, ease: "none" },
      1.04,
    );
    [1.25, 2.25, 3.25].forEach((start, index) => {
      timeline.fromTo(
        panels[index],
        { autoAlpha: 0, y: reduced ? 0 : 28 },
        { autoAlpha: 1, y: 0, duration: 0.18, ease: "power2.out" },
        start,
      );
      timeline.fromTo(
        panels[index].querySelectorAll(".polaroid-entry"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.16, stagger: 0.025 },
        start + 0.04,
      );
      if (index < 2)
        timeline.to(
          panels[index],
          { autoAlpha: 0, y: reduced ? 0 : -22, duration: 0.16 },
          start + 0.75,
        );
    });
  } else {
    timeline.to(
      portrait.querySelector(".portrait-index"),
      { autoAlpha: 0, duration: 0.16 },
      1.02,
    );
    timeline.fromTo(
      panels[0],
      { autoAlpha: 0, y: reduced ? 0 : 55 },
      { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" },
      1.1,
    );
    timeline.to(
      panels[0],
      { autoAlpha: 0, y: reduced ? 0 : -45, duration: 0.16, ease: "power2.in" },
      1.75,
    );
    timeline.to(
      [photo, name],
      { x: shift, duration: reduced ? 0.01 : 0.42, ease: "power2.inOut" },
      1.91,
    );
    timeline.fromTo(
      panels[1],
      { autoAlpha: 0, y: reduced ? 0 : 55 },
      { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" },
      2.27,
    );
    timeline.to(
      panels[1],
      { autoAlpha: 0, y: reduced ? 0 : -45, duration: 0.16, ease: "power2.in" },
      2.92,
    );
    timeline.to(
      [photo, name],
      { x: 0, duration: reduced ? 0.01 : 0.42, ease: "power2.inOut" },
      3.08,
    );
    timeline.fromTo(
      panels[2],
      { autoAlpha: 0, y: reduced ? 0 : 55 },
      { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" },
      3.44,
    );
    [1.13, 2.3, 3.47].forEach((start, i) => {
      timeline.fromTo(
        panels[i].querySelectorAll(".polaroid-entry"),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.18,
          stagger: 0.035,
          ease: "power2.out",
        },
        start,
      );
    });
  }
  // Reading interval for the last paragraph; one shared pin throughout.
  timeline.to({}, { duration: 0.65 }, 3.66);
  timeline.to(
    portrait.querySelectorAll(
      ".portrait-smoke, .portrait-photo, .portrait-name, [data-about-panel], [data-portrait-entry]",
    ),
    { autoAlpha: 0, duration: 0.25, ease: "none" },
    4.31,
  );
  timeline.eventCallback("onUpdate", () => {
    panels.forEach((panel) => {
      const visible = Number(gsap.getProperty(panel, "opacity")) > 0.01;
      panel.inert = !visible;
      panel.setAttribute("aria-hidden", String(!visible));
    });
    const active = timeline.time() >= 0.88 && timeline.time() < 4.56;
    portrait.dataset.active = String(active);
    portrait.inert = !active;
    portrait.setAttribute("aria-hidden", String(!active));
    portrait.dataset.aboutTime = timeline.time().toFixed(3);
  });
}
