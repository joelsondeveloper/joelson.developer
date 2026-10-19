"use client";

import { Component, type ReactNode, type RefObject, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { gsap } from "@/lib/gsap";
import { usePreparedResource } from "@/lib/scene-preparation";
import { experiences, type Experience } from "@/data/experiences";
import { MemoryViewer, type Origin } from "./MemoryViewer";
import type { Gaze } from "./CrtCharacter";

const Character = dynamic(() => import("./CrtCharacter"), { ssr: false });
class CharacterBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export function ExperienceScene({ sceneRef }: { sceneRef: RefObject<HTMLElement | null> }) {
  const prepared = usePreparedResource("character-fallback");
  const gaze = useRef<Gaze>({ x: 0, y: 0, events: new EventTarget() }), buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(false), [near, setNear] = useState(false), [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null), [selection, setSelection] = useState<{ memory: Experience; origin: Origin } | null>(null);
  const reduced = usePrefersReducedMotion();
  const motionReduced = reduced;
  const opening = useRef<gsap.core.Tween | null>(null), previous = useRef<number | null>(null);
  const moveGaze = useCallback((x: number, y: number) => {
    gaze.current.x = x; gaze.current.y = y; gaze.current.events.dispatchEvent(new Event("change"));
  }, []);
  useEffect(() => {
    const root = sceneRef.current!, portrait = root.parentElement!.querySelector<HTMLElement>(".portrait-scene")!;
    const sync = () => { const time = Number(portrait.dataset.aboutTime || 0); setNear(time >= 6.55 && time < 9.7); setActive(time >= 7.38 && time < 9.55); };
    const observer = new MutationObserver(sync); observer.observe(portrait, { attributes: true, attributeFilter: ["data-about-time"] }); sync();
    const neutral = () => { if (document.hidden) moveGaze(0, 0); }; document.addEventListener("visibilitychange", neutral);
    const unfocus = () => { moveGaze(0, 0); }; window.addEventListener("blur", unfocus);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", neutral); window.removeEventListener("blur", unfocus); opening.current?.kill(); };
  }, [sceneRef, moveGaze]);
  useEffect(() => { if (near && !failed) void import("./CrtCharacter").then(module => module.preloadCharacter()); }, [near, failed]);
  useEffect(() => {
    if (!active || motionReduced || selection) return;
    const track = (event: PointerEvent) => {
      const rect = sceneRef.current!.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) { moveGaze(0, 0); setHovered(null); return; }
      if (event.target instanceof Element && event.target.closest(".experience-polaroid")) return;
      setHovered(null);
      moveGaze((event.clientX - rect.left - rect.width * .68) / (rect.width * .45), -(event.clientY - rect.top - rect.height * .42) / (rect.height * .5));
    };
    const leave = () => { moveGaze(0, 0); setHovered(null); };
    window.addEventListener("pointermove", track, { capture: true, passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointercancel", leave);
    return () => { window.removeEventListener("pointermove", track, true); document.documentElement.removeEventListener("pointerleave", leave); window.removeEventListener("pointercancel", leave); };
  }, [active, motionReduced, selection, sceneRef, moveGaze]);
  const disposed = useCallback(() => setReady(false), []);
  useEffect(() => {
    if (!selection && previous.current !== null) {
      buttons.current[previous.current]?.focus({ preventScroll: true }); previous.current = null;
    }
  }, [selection]);
  const loaded = useCallback(() => setReady(true), []), unavailable = useCallback(() => { setFailed(true); setReady(false); }, []);
  const aim = (index: number) => {
    const root = sceneRef.current!.getBoundingClientRect(), card = buttons.current[index]!.getBoundingClientRect();
    moveGaze(Math.max(-1, Math.min(1, (card.left + card.width / 2 - root.left - root.width * .7) / (root.width * .4))), -(card.top + card.height / 2 - root.top - root.height * .45) / (root.height * .5));
    setHovered(experiences[index].id);
  };
  const open = (index: number) => {
    if (selection || opening.current?.isActive()) return;
    const button = buttons.current[index]!, rect = button.getBoundingClientRect(); previous.current = index;
    const origin = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    opening.current = gsap.to(button, { scale: reduced ? 1 : 1.1, duration: reduced ? .01 : .16, onComplete: () => { gsap.set(button, { clearProps: "transform" }); setSelection({ memory: experiences[index], origin }); } });
  };
  const close = () => {
    setSelection(null); setHovered(null); moveGaze(0, 0);
  };
  return <section id="experiencias" ref={sceneRef} className="experience-scene" aria-labelledby="experience-title" aria-hidden={!active} inert={!active} data-active={active} data-model-ready={ready} data-reduced={motionReduced}>
    <div className="experience-room" aria-hidden="true"><i /><i /><i /></div>
    <div className="experience-editorial" data-experience-entry><p>APRENDER. CONSTRUIR. CONTINUAR.</p><h2 id="experience-title">Experiências<span>& memórias.</span></h2><div>Um arquivo vivo do que aprendo<br />e construo pelo caminho.</div><small>ESCOLHA UMA POLAROID PARA EXPLORAR ↗</small></div>
    <div className="experience-character" aria-hidden="true">
      {(near || prepared) && <Image className={ready && active && !failed ? "character-fallback character-fallback-hidden" : "character-fallback"} src="/images/experiences/crt-character.webp" alt="" fill sizes="(max-width:767px) 100vw, 55vw" quality={90} />}
      {active && !failed && <CharacterBoundary onError={unavailable}><Character gaze={gaze} reduced={motionReduced} reaction={hovered !== null || selection !== null} onReady={loaded} onDispose={disposed} /></CharacterBoundary>}
      <div className="experience-character-fade" />
    </div>
    <div className="experience-polaroids" aria-label="Memórias para explorar">{experiences.map((memory, index) => <button key={memory.id} ref={node => { buttons.current[index] = node; }} type="button" className={`experience-polaroid experience-polaroid-${memory.id}`} aria-label={`Explorar ${memory.category}`} aria-haspopup="dialog" aria-expanded={selection?.memory.id === memory.id} onMouseEnter={() => aim(index)} onMouseLeave={() => { setHovered(null); moveGaze(0, 0); }} onFocus={() => aim(index)} onBlur={() => { setHovered(null); moveGaze(0, 0); }} onClick={() => open(index)}>
      <span className="experience-print-sway"><span className="experience-print"><span className="experience-photo">{near && <Image src={memory.image} alt={memory.alt} fill sizes="(max-width:767px) 90px, 140px" quality={90} />}</span><span className="experience-print-caption">{memory.label}</span></span><span className="experience-card-note">{memory.category} ↗</span></span>
    </button>)}</div>
    <footer className="experience-footer"><span>● REC · UMA TRAJETÓRIA EM CONSTRUÇÃO</span><span>QUATRO MEMÓRIAS / UM CAMINHO</span></footer>
    <div className="experience-crt" aria-hidden="true" />
    {selection && <MemoryViewer memory={selection.memory} origin={selection.origin} reduced={reduced} onClose={close} />}
  </section>;
}
