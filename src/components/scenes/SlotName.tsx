"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const NAMES = ["JOELSON", "VICENTE"] as const;
const SYMBOLS = "JOELSONVICENTE";
const randomLetter = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

/** Independent letter reels; movement renews the spin, stationary hover never does. */
export function SlotName() {
  const reduced = usePrefersReducedMotion();
  const nameRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const name = nameRef.current;
    if (!name || reduced) return;
    const tracks = [...name.querySelectorAll<HTMLElement>(".name-reel-track")];
    let loops: gsap.core.Tween[] = [], endings: gsap.core.Tween[] = [];
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let displayed = 0, destination = 0, spinning = false;
    let previous: { x: number; y: number } | null = null;
    const letter = (track: HTMLElement, index: number) => track.children[index] as HTMLElement;
    const stopTweens = () => {
      loops.forEach(tween => tween.kill()); endings.forEach(tween => tween.kill());
      loops = []; endings = [];
    };
    const normalize = () => {
      tracks.forEach((track, i) => {
        while (track.children.length > 2) track.lastElementChild!.remove();
        letter(track, 0).textContent = NAMES[displayed][i];
        letter(track, 1).textContent = randomLetter();
        gsap.set(track, { y: 0 });
      });
    };
    const commit = () => {
      clearTimeout(timeout); spinning = false; displayed = destination;
      // Leave the final row exactly where it landed. Resetting its DOM/transform
      // inside the last tween's render caused a one-frame flash.
      name.dataset.spinning = "false"; name.dataset.word = NAMES[displayed];
    };
    const settle = () => {
      clearTimeout(timeout);
      if (!spinning) return;
      loops.forEach(tween => tween.kill()); loops = []; spinning = false;
      name.dataset.spinning = "settling";
      tracks.forEach((track, i) => {
        const final = document.createElement("span");
        final.textContent = NAMES[destination][i]; track.append(final);
        const height = letter(track, 0).getBoundingClientRect().height;
        endings.push(gsap.to(track, {
          y: -height * 2, duration: .36 + i * .035, ease: "power3.out",
          onComplete: i === tracks.length - 1 ? commit : undefined,
        }));
      });
    };
    const renew = () => {
      if (!spinning) {
        // Finish a partially settled word before launching the next interaction.
        if (endings.length) commit();
        stopTweens(); normalize(); destination = 1 - displayed; spinning = true;
        name.dataset.spinning = "true";
        tracks.forEach((track, i) => {
          const height = letter(track, 0).getBoundingClientRect().height;
          loops.push(gsap.to(track, {
            y: -height, duration: .13 + i * .012, repeat: -1, ease: "none",
            onRepeat: () => { letter(track, 0).textContent = letter(track, 1).textContent; letter(track, 1).textContent = randomLetter(); },
          }));
        });
      }
      clearTimeout(timeout); timeout = setTimeout(settle, 260);
    };
    const enter = (event: PointerEvent) => { previous = { x: event.clientX, y: event.clientY }; renew(); };
    const move = (event: PointerEvent) => {
      if (previous && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > .5) renew();
      previous = { x: event.clientX, y: event.clientY };
    };
    const leave = () => { previous = null; settle(); };
    const keyboard = (event: KeyboardEvent) => {
      if (["Enter", " "].includes(event.key) && !event.repeat) { event.preventDefault(); renew(); clearTimeout(timeout); timeout = setTimeout(settle, 400); }
    };
    const scene = name.closest(".portrait-scene");
    const observer = new MutationObserver(() => { if (scene?.getAttribute("data-active") !== "true") { previous = null; stopTweens(); commit(); normalize(); } });
    if (scene) observer.observe(scene, { attributes: true, attributeFilter: ["data-active"] });
    const resize = new ResizeObserver(() => { if (spinning || endings.length) { stopTweens(); commit(); normalize(); } });
    resize.observe(name);
    name.addEventListener("pointerenter", enter);
    name.addEventListener("pointerdown", enter);
    name.addEventListener("pointermove", move);
    for (const type of ["pointerleave", "pointerup", "pointercancel", "blur"]) name.addEventListener(type, leave);
    name.addEventListener("keydown", keyboard);
    return () => {
      clearTimeout(timeout); stopTweens(); observer.disconnect(); resize.disconnect();
      name.removeEventListener("pointerenter", enter); name.removeEventListener("pointerdown", enter); name.removeEventListener("pointermove", move);
      for (const type of ["pointerleave", "pointerup", "pointercancel", "blur"]) name.removeEventListener(type, leave);
      name.removeEventListener("keydown", keyboard);
      tracks.forEach(track => { gsap.set(track, { clearProps: "transform" }); while (track.children.length > 2) track.lastElementChild!.remove(); });
    };
  }, [reduced]);

  return (
    <h2 ref={nameRef} id="portrait-name" className="portrait-name" data-portrait-name data-word="JOELSON" data-spinning="false" aria-label="Joelson Vicente" tabIndex={0}>
      <span className="name-reels" aria-hidden="true">
        {[...NAMES[0]].map((letter, index) => <span className="name-reel" key={index}><span className="name-reel-track"><span>{letter}</span><span>{NAMES[1][index]}</span></span></span>)}
        <span className="name-dot">.</span>
      </span>
    </h2>
  );
}


