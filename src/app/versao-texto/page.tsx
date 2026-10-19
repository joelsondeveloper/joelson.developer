import type { Metadata } from "next";
import Link from "next/link";
import { aboutContent } from "@/components/scenes/about-content";
import { experiences } from "@/data/experiences";
import { projects } from "@/data/projects";
import { contactChannels, contactDetails } from "@/data/contacts";
export const metadata: Metadata = { title:"Versão em texto | Joelson Vicente", robots:{ index:false, follow:true } };
/** Server-rendered reading alternative: no WebGL, pinned sections or image sequence. */
export default function TextPortfolio() { return <div className="text-portfolio" id="texto-inicio">
  <header><Link href="/" prefetch={false}>JOELSON® · EXPERIÊNCIA VISUAL ↗</Link><nav aria-label="Seções da versão em texto"><a href="#texto-sobre">Sobre</a><a href="#texto-formacao">Formação</a><a href="#texto-projetos">Projetos</a><a href="#texto-contato">Contato</a></nav></header>
  <main><p className="text-eyebrow">O MESMO PORTFÓLIO, EM PALAVRAS.</p><h1>Joelson Vicente.</h1><p className="text-lead">Desenvolvedor, criativo e aprendiz em constante evolução.</p>
  <section id="texto-sobre"><h2>Um pouco sobre mim</h2>{aboutContent.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</section>
  <section id="texto-formacao"><h2>Formação e ferramentas</h2>{experiences.filter(item => item.id === "education" || item.id === "stack").map(item => <article key={item.id}><h3>{item.category}</h3><p>{item.intro}</p><ul>{item.facts.map(fact => <li key={fact}>{fact}</li>)}</ul></article>)}</section>
  <section id="texto-projetos"><h2>Projetos</h2>{projects.map(project => <article key={project.id}><h3>{project.title}</h3><p>{project.description}</p><p><strong>Tecnologias:</strong> {project.technologies.join(", ")}</p><div className="text-project-links"><a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Visitar {project.title} (nova aba) ↗</a><a href={project.githubUrl} target="_blank" rel="noopener noreferrer">Código no GitHub (nova aba) ↗</a></div></article>)}</section>
  <section id="texto-contato"><h2>Vamos conversar?</h2><ul className="text-contacts">{contactChannels.map(channel => { const value=contactDetails[channel.id]; return value ? <li key={channel.id}><a href={channel.id === "email" ? "mailto:"+value : value} target={channel.id === "email" ? undefined : "_blank"} rel={channel.id === "email" ? undefined : "noopener noreferrer"}>{channel.name}{channel.id === "email" ? "" : " (nova aba)"} ↗</a></li> : null; })}</ul></section>
  </main><footer><a href="#texto-inicio">Voltar ao topo ↑</a><Link href="/" prefetch={false}>Voltar à experiência visual ↗</Link></footer>
  </div>; }
