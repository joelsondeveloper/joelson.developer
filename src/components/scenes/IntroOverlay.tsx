import type { RefObject } from "react";
import { PolaroidCard, type PolaroidCardData } from "@/components/ui/PolaroidCard";
import { VhsIndicator } from "@/components/ui/VhsIndicator";
import { ScrollIndicator } from "@/components/ui/ScrollIndicator";

/** Decorative crops of our existing footage, pending the owner's final photographs. */
export const introPolaroids: PolaroidCardData[] = [
  { id: "projects", label: "PROJETOS", image: "/images/intro-polaroids/projects.webp", rotation: -12 },
  { id: "experience", label: "EXPERIÊNCIA", image: "/images/intro-polaroids/experience.webp", rotation: 12 },
  { id: "about", label: "SOBRE MIM", image: "/images/intro-polaroids/about.webp", rotation: -15 },
  { id: "contact", label: "CONTATO", image: "/images/intro-polaroids/contact.webp", rotation: 10 },
];

const sections = ["SOBRE", "PROJETOS", "EXPERIÊNCIA", "CONTATO"];

export function IntroOverlay({ overlayRef }: { overlayRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={overlayRef} className="intro-overlay" data-scene-overlay>
      <div className="intro-atmosphere" data-intro-layer="atmosphere" aria-hidden="true" />
      <div className="intro-analog" data-intro-layer="graphics" aria-hidden="true">
        <div className="intro-analog-entry" data-entry>
        <i className="viewfinder-corner corner-tl" /><i className="viewfinder-corner corner-tr" />
        <i className="viewfinder-corner corner-bl" /><i className="viewfinder-corner corner-br" />
        <i className="tracking-line tracking-line--top" /><i className="tracking-line tracking-line--bottom" />
        <span className="vhs-record">SP <span>●</span> 00:00:00</span>
        </div>
      </div>
      <header className="intro-header" data-intro-layer="header">
        <div data-entry><VhsIndicator /></div>
        <nav aria-label="Seções do portfólio" data-entry>
          {/* Labels become links when their real destinations are implemented. */}
          <ul className="intro-navigation">{sections.map(section => <li key={section}><span>{section}</span></li>)}</ul>
        </nav>
      </header>
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
