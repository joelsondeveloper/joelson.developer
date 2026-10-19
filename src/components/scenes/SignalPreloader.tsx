"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { startScenePreparation } from "@/lib/scene-preparation";
import { getReducedMotionPreference } from "@/hooks/use-prefers-reduced-motion";

const total = 5;
/** Preparation milestones, never an invented byte/download percentage. */
export function SignalPreloader({ onRelease }: { onRelease: () => void }) {
  const root = useRef<HTMLDivElement>(null), release = useRef<(() => void) | null>(null);
  const [count, setCount] = useState(0), [slow, setSlow] = useState(false), [failed, setFailed] = useState(false);
  const [found, setFound] = useState(false), [hidden, setHidden] = useState(false);
  useEffect(() => {
    const overlay = root.current!, hero = document.getElementById("cinematic-intro")!;
    const reduced = getReducedMotionPreference() || matchMedia("(prefers-reduced-motion: reduce)").matches;
    overlay.dataset.reduced = String(reduced);
    let alive = true, exiting = false, raf = 0, finishTimer = 0;
    let exitAnimation: gsap.core.Timeline | undefined;
    let decodingThumbnails = false;
    const milestones = new Set<string>();
    hero.inert = true;
    document.documentElement.dataset.signalLoading = "true";
    window.dispatchEvent(new Event("portfolio:loading"));
    const block = (event: Event) => { if (event.cancelable) event.preventDefault(); };
    const keys = (event: KeyboardEvent) => { if (["ArrowDown","ArrowUp","PageDown","PageUp","Home","End"," "].includes(event.key) && !(event.target instanceof HTMLButtonElement)) event.preventDefault(); };
    window.addEventListener("wheel", block, { passive: false, capture: true });
    window.addEventListener("touchmove", block, { passive: false, capture: true });
    window.addEventListener("keydown", keys, true);
    const context = gsap.context(() => {
      if (!reduced) gsap.to(".signal-fog", { xPercent: 5, yPercent: -3, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, overlay);
    const done = (name: string) => { if (alive && !milestones.has(name)) { milestones.add(name); setCount(milestones.size); } };
    const finish = (fallback = false) => {
      if (!alive || exiting) return;
      exiting = true;
      if (fallback && hero.querySelector<HTMLCanvasElement>("canvas")?.dataset.frame === undefined) hero.dataset.signalFallback = "true";
      setFound(!fallback);
      const timeline = exitAnimation = gsap.timeline({ onComplete: () => {
        if (!alive) return;
        window.removeEventListener("wheel", block, true); window.removeEventListener("touchmove", block, true); window.removeEventListener("keydown", keys, true);
        clearTimeout(slowTimer); clearTimeout(deadline); context.revert(); setHidden(true); hero.inert = false;
        document.documentElement.dataset.signalLoading = "false";
        window.dispatchEvent(new Event("portfolio:ready"));
        onRelease(); startScenePreparation();
      } });
      if (!reduced) timeline.to(overlay.querySelector(".signal-horizon"), { opacity: .2, duration: .15 });
      timeline.to(overlay.querySelector(".signal-copy"), { opacity: 0, y: reduced ? 0 : -8, duration: reduced ? .12 : .25 }, reduced ? .12 : .25)
        .to(overlay, { opacity: 0, duration: reduced ? .2 : .65, ease: "power2.inOut" }, reduced ? .18 : .35);
    };
    release.current = () => finish(true);
    // Fonts are real font faces already declared/preloaded by next/font.
    void (async () => {
      await document.fonts.ready;
      const sample = hero.querySelector(".intro-name"), mono = hero.querySelector(".intro-header");
      await Promise.all([sample, mono].filter(Boolean).map(element => {
        const css = getComputedStyle(element!); return document.fonts.load(css.fontSize + " " + css.fontFamily);
      }));
      done("fonts");
    })().catch(() => { if (alive) setFailed(true); done("fonts"); });
    const inspect = () => {
      if (!alive || exiting) return;
      const poster = hero.querySelector<HTMLImageElement>(".scene-sequence-poster img");
      if (poster?.complete && poster.naturalWidth) done("poster");
      const canvas = hero.querySelector<HTMLCanvasElement>(".scene-sequence-canvas");
      if (canvas?.dataset.frame !== undefined) done("painted");
      const images = [...hero.querySelectorAll<HTMLImageElement>(".intro-overlay .polaroid-image img")];
      if (!decodingThumbnails && images.length === 4 && images.every(image => image.complete)) {
        decodingThumbnails = true;
        void Promise.all(images.map(image => image.decode())).then(() => done("thumbnails"), () => { if (alive) setFailed(true); done("thumbnails"); });
      }
      if (ScrollTrigger.getAll().some(trigger => trigger.trigger === hero && trigger.animation)) done("timeline");
      overlay.style.setProperty("--signal-recovery", String(milestones.size / total));
      if (milestones.size === total) { setFound(true); finishTimer = window.setTimeout(() => finish(), reduced ? 80 : 220); return; }
      raf = requestAnimationFrame(inspect);
    };
    raf = requestAnimationFrame(inspect);
    const slowTimer = window.setTimeout(() => { if (alive) setSlow(true); }, 4500);
    const deadline = window.setTimeout(() => { if (alive && !exiting) { setFailed(true); finish(true); } }, 12000);
    return () => {
      alive = false; exitAnimation?.kill(); cancelAnimationFrame(raf); clearTimeout(slowTimer); clearTimeout(deadline); clearTimeout(finishTimer); context.revert();
      release.current = null; hero.inert = false;
      window.removeEventListener("wheel", block, true); window.removeEventListener("touchmove", block, true); window.removeEventListener("keydown", keys, true);
      document.documentElement.dataset.signalLoading = "false";
    };
  }, [onRelease]);
  // Wheel/touch guards stop blocking immediately when the overlay is released.

  const title = found ? "SIGNAL FOUND." : count > 1 ? "TUNING INTO A MEMORY..." : "SEARCHING FOR A LOST SIGNAL...";
  const subtitle = found ? "Welcome back." : count > 1 ? "Recovering fragments of a forgotten transmission." : "Somewhere between memory and reality.";
  return hidden ? null : <div ref={root} className="signal-preloader" data-stage={found ? "found" : count > 1 ? "tuning" : "lost"} role="region" aria-label="Preparação da transmissão" aria-busy={!found}>
    <div className="signal-sky" aria-hidden="true" /><div className="signal-fog" aria-hidden="true" /><div className="signal-horizon" aria-hidden="true" /><div className="signal-texture" aria-hidden="true" />
    <header className="signal-top"><span>VHS ▶</span><span>JOELSON / A MEMORY IN TRANSMISSION</span><span>CH 01</span></header>
    <div className="signal-copy"><span className="signal-coordinate" aria-hidden="true">— THE LOST SIGNAL —</span><h1>{title}</h1><p>{subtitle}</p>
      <div className="signal-progress" role="progressbar" aria-label="Etapas de preparação" aria-valuemin={0} aria-valuemax={total} aria-valuenow={count} aria-valuetext={count + " de 5 etapas preparadas"}><span style={{transform: "scaleX(" + count / total + ")"}} /></div>
      <small>{String(count).padStart(2,"0")} / 05 · PREPARING THE TRANSMISSION</small>
      <p className="sr-only" role="status" aria-live="polite">{title} {count} de 5 etapas preparadas.</p>
      {(slow || failed) && <div className="signal-recovery"><p>{failed ? "Alguns fragmentos não chegaram. Você pode continuar." : "A transmissão está demorando um pouco mais."}</p><button type="button" onClick={() => release.current?.()}>Continuar com os recursos disponíveis ↗</button></div>}
    </div><footer className="signal-bottom"><span>Some memories are waiting to be found.</span><span>SP · STEREO · RECOVERING</span></footer>
  </div>;
}
