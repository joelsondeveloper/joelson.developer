import { aboutContent } from "./about-content";
import { PolaroidCard } from "@/components/ui/PolaroidCard";

/** Desktop panels share the CRT timeline; mobile copy stays in normal document flow. */
export function AboutParagraphs({ mobile = false }: { mobile?: boolean }) {
  return <div className={mobile ? "about-mobile" : "portrait-about-panels"}>
    {aboutContent.map((item, i) => <article className={mobile ? "about-mobile-panel" : "portrait-about"} key={item.title} data-about-panel={mobile ? undefined : i} aria-hidden={mobile ? undefined : true} inert={mobile ? undefined : true}>
      <p className="about-eyebrow">Um pouco sobre mim.</p>
      <h3><span>{String(i + 1).padStart(2, "0")} — </span>{item.title}</h3>
      <p className="about-copy">{item.text}</p>
      <div className="about-polaroids" aria-label={`Fotografias: ${item.title}`}>
        {item.photos.map(photo => <PolaroidCard key={photo.id} variant="about" card={{ ...photo, image: `/images/about-polaroids/${photo.id}.jpg` }} />)}
      </div>
    </article>)}
  </div>;
}
