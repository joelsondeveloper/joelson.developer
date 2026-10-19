import { gsap } from "@/lib/gsap";

/** Timeline units map to four viewport heights; ~4 seconds of visual time/unit. */
export const CONTACT = {
  prepare: 8.5, enter: 9.35, play: 9.55, reveal: 1.55,
  videoStart: .25, videoEnd: 6.167,
  zoom: 11.10, zoomDuration: .16,
  glitch: 11.235, cut: 11.26, clear: 11.29, finish: 11.8,
  focal: { x: .786, y: .718 },
} as const;

/** Object-fit cover coordinates, including the mobile pan toward the distant booth. */
export function contactFraming(width: number, height: number) {
  const cover = Math.max(width / 1280, height / 720);
  const imageWidth = 1280 * cover, imageHeight = 720 * cover;
  const position = width / height < 1 ? .85 : .5;
  const x = (width - imageWidth) * position + imageWidth * CONTACT.focal.x;
  const y = (height - imageHeight) / 2 + imageHeight * CONTACT.focal.y;
  return { x, y, position, scale: width / height < 1 ? 6 : 7.5,
    translateX: width * (width / height < 1 ? .48 : .38) - x,
    translateY: height * .53 - y };
}

export function addContactMotion(timeline: gsap.core.Timeline, scene: HTMLElement, experience: HTMLElement) {
  const flight = scene.querySelector<HTMLElement>(".contact-flight")!;
  const video = scene.querySelector("video")!;
  const still = scene.querySelector(".contact-zoom-still");
  const photo = scene.querySelector(".contact-final");
  const noise = scene.querySelector(".contact-interference");
  const frame = () => contactFraming(scene.clientWidth, scene.clientHeight);
  timeline.fromTo(scene, { autoAlpha: 0 }, { autoAlpha: 1, duration: .20, ease: "none" }, CONTACT.enter);
  timeline.to(experience, { autoAlpha: 0, duration: .20, ease: "none" }, CONTACT.enter);
  timeline.to(scene.parentElement!.querySelector(".portrait-bezel"), { autoAlpha: 0, duration: .20, ease: "none" }, CONTACT.enter);
  timeline.fromTo(video, { objectPosition: "50% 50%" }, { objectPosition: () => `${frame().position * 100}% 50%`, duration: .55, ease: "power1.inOut" }, CONTACT.zoom - .55);
  timeline.set(still, { objectPosition: () => `${frame().position * 100}% 50%` }, CONTACT.zoom);
  timeline.fromTo(still, { autoAlpha: 0 }, { autoAlpha: 1, duration: .008, ease: "none" }, CONTACT.zoom);
  timeline.set(flight, { transformOrigin: () => `${frame().x}px ${frame().y}px` }, CONTACT.zoom);
  timeline.fromTo(flight, { scale: 1, x: 0, y: 0 }, {
    scale: () => frame().scale, x: () => frame().translateX, y: () => frame().translateY,
    duration: CONTACT.zoomDuration, ease: "power3.in",
  }, CONTACT.zoom);
  timeline.fromTo(flight, { filter: "blur(0px)" }, { filter: "blur(1.4px)", duration: .06, ease: "power2.in" }, CONTACT.glitch - .025);
  // Fixed offsets/noise seed and timeline values: no timers or random glitches.
  timeline.fromTo(noise, { autoAlpha: 0, xPercent: -1 }, { autoAlpha: .97, xPercent: 1, duration: CONTACT.cut - CONTACT.glitch, ease: "none" }, CONTACT.glitch);
  timeline.set(flight, { filter: "blur(1.4px) url(#contact-rgb)" }, CONTACT.glitch + .008);
  timeline.fromTo(photo, { autoAlpha: 0 }, { autoAlpha: 1, duration: .002, ease: "none" }, CONTACT.cut);
  timeline.fromTo(photo, { x: 5, scale: 1.008 }, { x: 0, scale: 1, duration: .07, ease: "power2.out" }, CONTACT.cut);
  timeline.to(noise, { autoAlpha: 0, xPercent: -.6, duration: CONTACT.clear - CONTACT.cut, ease: "none" }, CONTACT.cut);
  timeline.to(flight, { autoAlpha: 0, duration: .01, ease: "none" }, CONTACT.clear);
  const overlay = scene.querySelector(".contact-overlay");
  timeline.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: .03, ease: "none" }, 11.34);
  timeline.fromTo(scene.querySelectorAll(".contact-header,.contact-analog"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .08, ease: "none" }, 11.36);
  timeline.fromTo(scene.querySelector(".contact-title"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .10, ease: "power2.out" }, 11.34);
  timeline.fromTo(scene.querySelector(".contact-subtitle"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .09, ease: "none" }, 11.38);
  timeline.fromTo(scene.querySelectorAll(".contact-channel-entry"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .10, stagger: .025, ease: "power2.out" }, 11.42);
  timeline.fromTo(scene.querySelectorAll("[data-contact-decor]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .12, ease: "none" }, 11.50);
  timeline.fromTo(scene.querySelector(".contact-return"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .10, ease: "none" }, 11.55);
  timeline.to({}, { duration: CONTACT.finish - CONTACT.clear }, CONTACT.clear);
}
