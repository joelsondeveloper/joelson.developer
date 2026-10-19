"use client";

import { Component, type ReactNode, type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { projects } from "@/data/projects";
import { ProjectPlayer } from "./ProjectPlayer";
import { sceneLayout } from "./scene-layout";
import type { TapeMode, VhsController, Handlers } from "./VhsScene";

const VhsScene = dynamic(() => import("./VhsScene"), { ssr: false });
class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export function ProjectsScene({ sceneRef }: { sceneRef: RefObject<HTMLElement | null> }) {
  const root = sceneRef;
  const controller = useRef<VhsController>({ tapes: {} }), hits = useRef<(HTMLButtonElement | null)[]>([]), progress = useRef(0);
  const returnFocus = useRef<number | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [near, setNear] = useState(false), [active, setActive] = useState(false), [fallback, setFallback] = useState(false);
  const [selected, setSelected] = useState<number | null>(null), [mode, setMode] = useState<TapeMode>("collection");
  const [drag, setDrag] = useState(false), [rotation, setRotation] = useState(0);
  const reduced = usePrefersReducedMotion();
  // The parent scene owns the single pin; this layer only observes its timeline.
  useLayoutEffect(() => {
    const node = root.current!;
    const resize = () => {
      const b = node.querySelector(".projects-screen")!.getBoundingClientRect(), layout = sceneLayout(b.width, b.height);
      node.style.setProperty("--slot-left", `${b.width / 2 + layout.slotX * layout.zoom}px`);
      node.style.setProperty("--slot-top", `${b.height / 2 - layout.slotY * layout.zoom}px`);
      node.style.setProperty("--slot-width", `${layout.slotWidth * layout.zoom}px`);
      node.style.setProperty("--slot-height", `${layout.slotHeight * layout.zoom}px`);
    };
    const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(node); resize();
    const syncProgress = () => { progress.current = Number(node.dataset.pathProgress || 0); controller.current.invalidate?.(); };
    const pathObserver = new MutationObserver(syncProgress); pathObserver.observe(node, { attributes: true, attributeFilter: ["data-path-progress"] }); syncProgress();
    const portrait = node.parentElement!.querySelector<HTMLElement>(".portrait-scene")!;
    const sync = () => { const time = Number(portrait.dataset.aboutTime || 0); setNear(time >= 3.65 && time < 7.45); setActive(time >= 4.46 && time < 7.30); };
    const aboutObserver = new MutationObserver(sync);
    aboutObserver.observe(portrait, { attributes: true, attributeFilter: ["data-about-time"] }); sync();
    return () => { aboutObserver.disconnect(); sizeObserver.disconnect(); pathObserver.disconnect(); if (timer.current) clearTimeout(timer.current); };
  }, [root]);
  useEffect(() => {
    if (mode === "collection" && returnFocus.current !== null) { root.current?.querySelectorAll<HTMLButtonElement>(".project-collection button")[returnFocus.current]?.focus({ preventScroll: true }); returnFocus.current = null; }
  }, [mode, root]);
  const register = useCallback((index: number, handlers: Handlers | null) => {
    if (handlers) controller.current.tapes[index] = handlers; else delete controller.current.tapes[index];
  }, []);
  const ready = useCallback((invalidate?: () => void) => { controller.current.invalidate = invalidate; }, []);
  const updateHit = useCallback((index: number, width: number, height: number, x: number, y: number, rotation: number, enabled: boolean) => {
    const hit = hits.current[index]; if (!hit) return;
    hit.style.width = `${width}px`; hit.style.height = `${height}px`;
    hit.style.transform = `translate(${x}px,${y}px) rotate(${rotation}rad)`;
    hit.style.pointerEvents = enabled ? "auto" : "none";
    hit.dataset.x = String(x + width / 2); hit.dataset.y = String(y + height / 2);
  }, []);
  const failed = useCallback(() => { setFallback(true); setSelected(null); setMode("collection"); setDrag(false); }, []);
  const inserted = useCallback(() => { setMode("tuning"); }, []);
  const ejected = useCallback(() => { setSelected(null); setMode("collection"); setDrag(false); }, []);
  useEffect(() => {
    if (mode !== "tuning") return;
    timer.current = setTimeout(() => setMode("playing"), reduced ? 70 : 480);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [mode, reduced]);
  const select = (index: number) => { if (!active) return; returnFocus.current = index; setSelected(index); setMode("inspect"); setRotation(0); setDrag(false); };
  const grab = (index: number) => { returnFocus.current = index; setSelected(index); setMode("dragging"); };
  const insert = (index: number) => { setSelected(index); setMode(fallback ? "tuning" : "inserting"); };
  const eject = () => { if (fallback) ejected(); else setMode("ejecting"); };
  return <section id="projetos" className="projects-section projects-embedded" ref={root} data-fallback={fallback} data-path-progress="0" data-mode={mode} data-selected={selected !== null} data-active={active} aria-hidden={!active} inert={!active} aria-labelledby="projects-heading">
    <div className="projects-screen">
      <div className="projects-room" aria-hidden="true" style={near ? { backgroundImage: "url('/images/projects/liminal-vhs.webp')" } : undefined} />
      <div className="projects-heading"><p className="projects-kicker">IDEIAS GRAVADAS. EXPERIÊNCIAS REAIS.</p><h2 id="projects-heading">Escolha<br /><em>uma história.</em></h2><p>Role para descobrir as fitas.<br />Selecione para girar ou arraste direto ao tocador.</p></div>
      <div className="projects-dimmer" aria-hidden="true" />
      <div className="vcr-stage" data-vcr-stage data-mode={mode} aria-hidden="true">
        {near && !fallback && <SceneBoundary onError={failed}><VhsScene selected={selected} mode={mode} drag={drag} rotation={rotation} reduced={reduced} progress={progress} onReady={ready} onRegister={register} onHit={updateHit} onSelect={select} onGrab={grab} onInsert={insert} onInserted={inserted} onEjected={ejected} onReturn={ejected} /></SceneBoundary>}
        <div className="tape-hit-layer">{projects.map((p, i) => <button key={p.id} type="button" tabIndex={-1} className="tape-hit" data-tape-hit={i} ref={node => { hits.current[i] = node; }} aria-label={`Explorar ${p.title}`} onPointerDown={e => controller.current.tapes[i]?.down(e)} onPointerMove={e => controller.current.tapes[i]?.move(e)} onPointerUp={e => controller.current.tapes[i]?.up(e)} onPointerCancel={() => controller.current.tapes[i]?.cancel()} onClick={e => { if (e.detail === 0) select(i); }} />)}</div>
        <div className="vcr-slot-target" /><span className="vcr-slot-hint">SOLTE A FITA PARA REPRODUZIR</span>
      </div>
      <div className="projects-interface">
        <div className="project-collection" aria-label="Escolher projeto">{projects.map((p, index) => <button key={p.id} type="button" disabled={!["collection", "inspect"].includes(mode)} aria-pressed={selected === index} onClick={() => select(index)}><span>0{index + 1}</span><strong>{p.title}</strong></button>)}</div>
        <div className="tape-controls" aria-live="polite">
          {selected !== null && mode === "inspect" ? <><p>{drag ? "Arraste até a entrada do tocador." : "Arraste sobre a fita para girar."}</p><div><button type="button" onClick={() => insert(selected)}>REPRODUZIR ▶</button>{!fallback && <><button type="button" aria-pressed={drag} onClick={() => setDrag(value => !value)}>{drag ? "GIRAR FITA" : "ENCAIXAR FITA"}</button><button type="button" aria-label="Girar fita à esquerda" onClick={() => setRotation(value => value - .3)}>↶</button><button type="button" aria-label="Girar fita à direita" onClick={() => setRotation(value => value + .3)}>↷</button></>}<button type="button" onClick={ejected}>VOLTAR</button></div></> : <p>{mode === "dragging" ? "Leve a fita até o tocador." : mode === "inserting" || mode === "tuning" ? "Sintonizando…" : mode === "ejecting" ? "Ejetando…" : fallback ? "Escolha um projeto abaixo para reproduzir." : "ROLE PARA EXPLORAR ↓"}</p>}
        </div>
      </div>
      <footer className="projects-footer"><span>SP · ESTÉREO · 03 FITAS</span><a href="https://sketchfab.com/3d-models/vhs-cassette-free-model-fc7d79e6ce5a463093e24925c7518c93" target="_blank" rel="noopener noreferrer">VHS: Brian Fox · CC BY 4.0 ↗</a></footer>
      <div className="projects-crt" aria-hidden="true" />
      <div className="vhs-static" aria-hidden="true"><span>PLAY ▶</span></div>
    </div>
    {mode === "playing" && selected !== null && <ProjectPlayer key={projects[selected].id} project={projects[selected]} index={selected} onEject={eject} />}
  </section>;
}

