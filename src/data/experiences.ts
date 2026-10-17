import { projects } from "./projects";

/** Career facts come from the owner's About copy and the existing project records. */
export const experiences = [
  { id: "career", category: "Experiência profissional", label: "Próximo capítulo", eyebrow: "01 / EM CONSTRUÇÃO", title: "O próximo capítulo começa com uma oportunidade.",
    intro: "Busco minha primeira oportunidade profissional como desenvolvedor, para aplicar meus conhecimentos, colaborar com equipes e evoluir tecnicamente.",
    paragraphs: ["Meu objetivo é construir soluções eficientes, aprender com desafios reais e contribuir para projetos que gerem resultados."],
    facts: ["Interesse em desenvolvimento de aplicações web e APIs.", "Aprendizado por meio de projetos e experimentação."],
    image: "/images/about-polaroids/growth.jpg", alt: "Imagem conceitual de uma estrada entre colinas ao amanhecer", tone: "rose", pending: "Experiências em empresas, cargos e períodos ainda não informados.", links: [] as { label: string; href: string }[] },
  { id: "education", category: "Formação acadêmica", label: "Formação", eyebrow: "02 / REPERTÓRIO", title: "Uma base para continuar descobrindo.",
    intro: "Sou formado em Análise e Desenvolvimento de Sistemas e técnico em Desenvolvimento de Sistemas.",
    paragraphs: ["Tenho interesse por tecnologia, ciência, inteligência artificial e filosofia. Gosto de compreender como as coisas funcionam e transformar conhecimento em projetos reais."],
    facts: ["Análise e Desenvolvimento de Sistemas.", "Formação técnica em Desenvolvimento de Sistemas."],
    image: "/images/about-polaroids/education.jpg", alt: "Imagem conceitual de diploma e livros sobre uma mesa", tone: "cream", pending: "Instituições, datas e certificados podem ser acrescentados posteriormente.", links: [] as { label: string; href: string }[] },
  { id: "stack", category: "Stack tecnológica", label: "Ferramentas", eyebrow: "03 / NA PRÁTICA", title: "Ferramentas para dar forma às ideias.",
    intro: "Trabalho principalmente com JavaScript, TypeScript, React e Node.js, desenvolvendo aplicações web, APIs e projetos experimentais.",
    paragraphs: ["Também exploro desenvolvimento de jogos, simulações e inteligência artificial. A prática, os erros e a investigação fazem parte do meu processo de aprendizado."],
    facts: ["JavaScript · TypeScript", "React · Next.js · HTML · CSS", "Node.js · APIs", "GSAP · Three.js, utilizados neste portfólio"],
    image: "/images/about-polaroids/development.jpg", alt: "Imagem conceitual de uma estação de programação com monitor CRT", tone: "brown", pending: "", links: [] as { label: string; href: string }[] },
  { id: "projects", category: "Projetos e conquistas", label: "O que construí", eyebrow: "04 / ARQUIVO ABERTO", title: "Ideias que saíram do papel.",
    intro: "Projetos reais fazem parte da minha trajetória de aprendizado e mostram diferentes formas de criar experiências digitais.",
    paragraphs: ["Employee Routes API, Corinthians Premium e Nike UI Clone estão disponíveis para explorar. As descrições completas e demonstrações ficam na coleção de fitas da seção Projetos."],
    facts: projects.map(project => project.title),
    image: "/images/about-polaroids/experiments.jpg", alt: "Imagem conceitual de uma simulação de organismos digitais", tone: "rose", pending: "",
    links: projects.map(project => ({ label: project.title, href: project.githubUrl })) },
] as const;
export type Experience = typeof experiences[number];
