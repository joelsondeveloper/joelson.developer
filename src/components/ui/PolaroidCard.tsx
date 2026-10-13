import Image from "next/image";
import type { CSSProperties } from "react";

export interface PolaroidCardData {
  id: string;
  label: string;
  image: string;
  rotation: number;
  href?: string;
}

export function PolaroidCard({ card }: { card: PolaroidCardData }) {
  const print = (
    <div className="polaroid-print">
      <span className="polaroid-tape" aria-hidden="true" />
      <div className="polaroid-image">
        <Image src={card.image} alt="" width={420} height={360} sizes="(max-width: 767px) 68px, 110px" />
      </div>
    </div>
  );
  return (
    <figure className={`polaroid polaroid--${card.id}`} style={{ "--polaroid-rotation": `${card.rotation}deg` } as CSSProperties}>
      <div className="polaroid-float">
        <div className="polaroid-entry" data-entry>
          {card.href ? <a href={card.href} className="polaroid-link" aria-label={card.label}>{print}</a> : print}
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
