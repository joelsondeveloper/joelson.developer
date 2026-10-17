"use client";

import { DeferredImage } from "@/components/ui/DeferredImage";
import type { RefObject } from "react";
import { InteractiveSmoke } from "./InteractiveSmoke";
import { SlotName } from "./SlotName";
import { AboutParagraphs } from "./AboutParagraphs";

export function PortraitScene({ sceneRef }: { sceneRef: RefObject<HTMLElement | null> }) {
  return (
    <section ref={sceneRef} id="sobre" className="portrait-scene" aria-labelledby="portrait-name" aria-hidden="true" inert data-active="false">
      <InteractiveSmoke sceneRef={sceneRef} />
      <div className="portrait-orbit" aria-hidden="true" />
      <header className="portrait-header" data-portrait-entry>
        <span className="portrait-brand">JOELSON<span aria-hidden="true">®</span></span>
        <span className="portrait-channel">CANAL 02 <span aria-hidden="true">/</span> SOBRE MIM</span>
      </header>
      <div className="portrait-index" data-portrait-entry>
        <span className="portrait-index-label">SOBRE MIM</span>
        <span className="portrait-number" aria-hidden="true">02</span>
        <p>CRIATIVO POR NATUREZA.<br />DESENVOLVEDOR POR ESCOLHA.</p>
      </div>
      <div className="portrait-photo" data-portrait-photo>
        <DeferredImage activation="portrait" src="/images/joelson-portrait.png" alt="Retrato em preto e branco de Joelson" width={1174} height={1339} sizes="(max-width: 767px) 95vw, 48vw" />
      </div>
      <SlotName />
      <AboutParagraphs />
      <footer className="portrait-footer" data-portrait-entry>
        <span><i aria-hidden="true" /> AO VIVO · EM CONSTANTE EVOLUÇÃO</span>
        <span className="portrait-interact">MOVA O MOUSE <span aria-hidden="true">↗</span><span className="portrait-touch">TOQUE PARA EXPLORAR</span></span>
      </footer>
      <div className="portrait-crt" aria-hidden="true" />
    </section>
  );
}


