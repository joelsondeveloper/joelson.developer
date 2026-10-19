"use client";
import { DeferredImage } from "./DeferredImage";
import type { CSSProperties } from "react";
import { navigatePortfolio, portfolioSections } from "@/lib/portfolio-navigation";
import { imageAssets } from "@/lib/image-assets";

export interface PolaroidCardData {
  id: string;
  label: string;
  image: string;
  rotation: number;
  href?: string;
  alt?: string;
}

export function PolaroidCard({ card, variant = "hero" }: { card: PolaroidCardData; variant?: "hero" | "about" }) {
  const asset = imageAssets[card.image];
  const ratio = variant === "about" && asset ? (asset.width / asset.height) / (3 / 4) : 1;
  const sizes = variant === "about"
    ? `(max-width: 767px) ${30 * ratio}vw, (max-height: 650px) ${78 * ratio}px, ${112 * ratio}px`
    : "(max-width: 767px) 68px, 110px";
  const print = (
    <div className="polaroid-print">
      <span className="polaroid-tape" aria-hidden="true" />
      <div className="polaroid-image">
        <DeferredImage activation={variant === "about" ? "nearby" : "immediate"} src={card.image} alt={card.alt ?? ""} width={420} height={360} sizes={sizes} />
      </div>
    </div>
  );
  return (
    <figure className={`polaroid polaroid--${card.id}${variant === "about" ? " polaroid--inline" : ""}`} style={{ "--polaroid-rotation": `${card.rotation}deg` } as CSSProperties}>
      <div className="polaroid-float">
        <div className="polaroid-entry" data-entry={variant === "hero" ? "" : undefined}>
          {card.href ? <a href={card.href} className="polaroid-link" aria-label={`Ir para ${card.label}`} onClick={event => { const target = portfolioSections.find(section => `#${section.id}` === card.href); if (target && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); navigatePortfolio(target.id); } }}>{print}</a> : print}
          <span className="polaroid-caption" aria-hidden="true">
            <span>{card.label}</span>
            <svg className="polaroid-arrow" viewBox="0 0 64 48" fill="none">
              <path d="M57 41C49 21 33 13 10 15M10 15l8-6M10 15l8 7" />
            </svg>
          </span>
        </div>
      </div>
      <figcaption className="sr-only">{card.label}</figcaption>
    </figure>
  );
}

