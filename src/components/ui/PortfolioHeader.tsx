"use client";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { VhsIndicator } from "./VhsIndicator";
import { portfolioSections, navigatePortfolio, type PortfolioDestination } from "@/lib/portfolio-navigation";
import { usePrefersReducedMotion, setReducedMotionPreference } from "@/hooks/use-prefers-reduced-motion";

const channels = { inicio: "UMA HISTÓRIA PARA EXPLORAR", sobre: "CANAL 02 / SOBRE MIM", projetos: "CANAL 03 / PROJETOS", experiencias: "CANAL 04 / EXPERIÊNCIAS", contatos: "CANAL 05 / CONTATO" };
/** One persistent banner outside the fading/inert scene overlays. */
export function PortfolioHeader() {
  const root = useRef<HTMLElement>(null), toggle = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<PortfolioDestination>("inicio"), [open, setOpen] = useState(false);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const portrait = root.current!.parentElement!.querySelector<HTMLElement>(".portrait-scene")!;
    let previous: PortfolioDestination = "inicio";
    const sync = () => {
      const time = Number(portrait.dataset.aboutTime || 0);
      const next = time < .88 ? "inicio" : time < 4.46 ? "sobre" : time < 7.3 ? "projetos" : time < 9.55 ? "experiencias" : "contatos";
      if (next !== previous) { previous = next; setActive(next); setOpen(false); }
    };
    const observer = new MutationObserver(sync); observer.observe(portrait, { attributes:true, attributeFilter:["data-about-time"] }); sync();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    const desktop = matchMedia("(min-width: 768px)");
    const resize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape); desktop.addEventListener("change", resize);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); desktop.removeEventListener("change", resize); };
  }, [open]);
  const go = (id: PortfolioDestination) => { setOpen(false); navigatePortfolio(id); };
  const ordinaryClick = (event: MouseEvent<HTMLAnchorElement>, id: PortfolioDestination) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); go(id);
  };
  const scenery = active === "inicio" || active === "contatos";
  return <header ref={root} className="portfolio-header" role="banner" onBlur={event => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} data-section={active} data-tone={scenery ? "scenery" : "paper"} data-open={open}>
    <a className="skip-presentation" href="#sobre" onClick={event => ordinaryClick(event,"sobre")}>Pular apresentação e ir para Sobre</a>
    <a className="portfolio-brand" href="#cinematic-intro" aria-label="Joelson — voltar ao topo" onClick={event => ordinaryClick(event,"inicio")}>
      {scenery ? <VhsIndicator /> : <><strong>JOELSON<span aria-hidden="true">®</span></strong><small>{channels[active]}</small></>}
    </a>
    <nav className="portfolio-nav" aria-label="Navegação principal">
      <button ref={toggle} className="portfolio-menu-toggle" type="button" aria-controls="portfolio-links" aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? "FECHAR ×" : "MENU +"}</button>
      <div className="portfolio-menu-panel" id="portfolio-links">
        <ul>{portfolioSections.map(section => <li key={section.id}><a href={"#"+section.id} aria-current={active === section.id ? "location" : undefined} onClick={event => ordinaryClick(event,section.id)}>{section.label}</a></li>)}</ul>
        <div className="portfolio-tools"><button className="portfolio-motion-toggle" type="button" aria-pressed={reduced} onClick={() => setReducedMotionPreference(!reduced)}>Movimento reduzido: {reduced ? "ligado" : "desligado"}</button><Link href="/versao-texto" prefetch={false} className="portfolio-text-link">VERSÃO EM TEXTO ↗</Link></div>
      </div>
    </nav>
  </header>;
}
