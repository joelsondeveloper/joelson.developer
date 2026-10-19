import type { RefObject } from "react";
import { PolaroidCard, type PolaroidCardData } from "@/components/ui/PolaroidCard";
import { ViewfinderCorners } from "@/components/ui/ViewfinderCorners";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";

/** Local thumbnails from the existing sections, sharing the portfolio navigation. */
export const introPolaroids: PolaroidCardData[] = [
  { id: "projects", label: "PROJETOS", image: "/images/navigation/projects.webp", href: "#projetos", alt: "Fitas VHS no ambiente da coleção de projetos", rotation: -12 },
  { id: "experience", label: "EXPERIÊNCIA", image: "/images/navigation/experience.webp", href: "#experiencias", alt: "Personagem com cabeça CRT da seção Experiências", rotation: 12 },
  { id: "about", label: "SOBRE MIM", image: "/images/navigation/about.webp", href: "#sobre", alt: "Retrato de Joelson", rotation: -15 },
  { id: "contact", label: "CONTATO", image: "/images/navigation/contact.webp", href: "#contatos", alt: "Cabine telefônica iluminada da seção Contatos", rotation: 10 },
];



export function IntroOverlay({ overlayRef }: { overlayRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={overlayRef} className="intro-overlay" data-scene-overlay>
      <div className="intro-atmosphere" data-intro-layer="atmosphere" aria-hidden="true" />
      <div className="intro-analog" data-intro-layer="graphics" aria-hidden="true">
        <div className="intro-analog-entry" data-entry>
        <ViewfinderCorners />
        <span className="vhs-record">SP <span>●</span> 00:00:00</span>
        </div>
      </div>
      <div className="intro-presentation" data-intro-layer="presentation">
        <div data-entry>
          <p className="intro-eyebrow">OLÁ, EU SOU</p>
          <h1 className="intro-name"><span>Joelson.</span></h1>
          <p className="intro-description">DESENVOLVEDOR, CRIATIVO E APRENDIZ<br className="desktop-line-break" /> EM CONSTANTE EVOLUÇÃO.</p>
        </div>
      </div>
      <div className="intro-polaroids" data-intro-layer="polaroids">
        {introPolaroids.map(card => <PolaroidCard key={card.id} card={card} />)}
      </div>
      <aside className="intro-editorial" data-intro-layer="editorial">
        <div data-entry>
          <p>TRANSFORMANDO IDEIAS<br />EM EXPERIÊNCIAS DIGITAIS<br />COM PROPÓSITO.</p>
          <span className="editorial-rule" aria-hidden="true" />
        </div>
      </aside>
      <div className="intro-signature" data-intro-layer="signature" aria-hidden="true">
        <p data-entry>Mais que<br />código,<br />histórias.</p>
      </div>
      <div className="intro-scroll" data-intro-layer="scroll"><ScrollIndicator /></div>
    </div>
  );
}
