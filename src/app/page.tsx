import Link from "next/link";
import { CinematicIntro } from "@/components/scenes/CinematicIntro";

/** The entire CRT experience shares one pinned viewport on desktop and mobile. */
export default function Home() {
  return <main className="bg-background"><CinematicIntro /><noscript><style>{".cinematic-intro,.signal-preloader{display:none!important}"}</style><div className="site-message"><p>JOELSON VICENTE / PORTFÓLIO</p><h1>Uma história para conhecer.</h1><p>A experiência cinematográfica utiliza JavaScript. Você também pode conhecer meu trabalho na versão em texto.</p><Link href="/versao-texto" prefetch={false}>Ler o portfólio em texto ↗</Link></div></noscript></main>;
}