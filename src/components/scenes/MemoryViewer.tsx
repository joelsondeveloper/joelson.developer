"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import type { Experience } from "@/data/experiences";

export interface Origin { left: number; top: number; width: number; height: number }
export function MemoryViewer({ memory, origin, reduced, onClose }: { memory: Experience; origin: Origin; reduced: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null), sheet = useRef<HTMLDivElement>(null), closing = useRef(false);
  useEffect(() => {
    const node = dialog.current!, element = sheet.current!; node.showModal();
    const previous = document.body.style.overflow; document.body.style.overflow = "hidden";
    const rect = node.getBoundingClientRect();
    const clip = `inset(${Math.max(0,origin.top-rect.top)}px ${Math.max(0,rect.right-origin.left-origin.width)}px ${Math.max(0,rect.bottom-origin.top-origin.height)}px ${Math.max(0,origin.left-rect.left)}px round 4px)`;
    const animation = gsap.fromTo(element, { clipPath: reduced ? "inset(0%)" : clip }, { clipPath: "inset(0% round 0px)", duration: reduced ? .01 : .65, ease: "power3.inOut" });
    return () => { animation.kill(); gsap.killTweensOf(element); node.close(); document.body.style.overflow = previous; };
  }, [origin, reduced]);
  const close = () => {
    if (closing.current) return; closing.current = true;
    gsap.to(sheet.current, { opacity: 0, y: reduced ? 0 : 18, duration: reduced ? .01 : .22, onComplete: onClose });
  };
  return <dialog ref={dialog} className={`memory-viewer memory-${memory.tone}`} aria-labelledby="memory-title" data-lenis-prevent onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="memory-sheet" ref={sheet}>
      <header><span>ARQUIVO PESSOAL / {memory.eyebrow}</span><button type="button" onClick={close} autoFocus>← VOLTAR ÀS MEMÓRIAS</button></header>
      <div className="memory-composition">
        <figure className="memory-photo"><Image src={memory.image} alt={memory.alt} fill sizes="(max-width:767px) 88vw, 42vw" quality={90} /><figcaption>IMAGEM CONCEITUAL · ARQUIVO VISUAL</figcaption></figure>
        <article><p className="memory-eyebrow">{memory.category}</p><h2 id="memory-title">{memory.title}</h2><p className="memory-intro">{memory.intro}</p>{memory.paragraphs.map(text => <p key={text}>{text}</p>)}<ul>{memory.facts.map(fact => <li key={fact}>{fact}</li>)}</ul>{memory.links.length > 0 && <nav aria-label="Repositórios dos projetos">{memory.links.map(link => <a href={link.href} key={link.href} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>)}</nav>}{memory.pending && <p className="memory-pending">{memory.pending}</p>}</article>
      </div>
      <footer>REC · APRENDER, CONSTRUIR, CONTINUAR.</footer>
    </div>
  </dialog>;
}
