export interface PortfolioProject {
  id: string; title: string; subtitle: string; description: string;
  technologies: string[]; features: string[]; technicalDetails: string[];
  liveUrl: string; githubUrl: string; tapeLabel: string; accent: string;
  media: { images: [string, string]; video: string };
}

export const projects: PortfolioProject[] = [
  {
    id: "employee-routes", title: "Employee Routes API", subtitle: "Transporte organizado, decisões claras.",
    description: "Aplicação para cadastrar funcionários, organizar grupos de transporte e visualizar rotas após o expediente. Reúne um painel operacional React e uma API com geocodificação e otimização de trajetos.",
    technologies: ["TypeScript", "React", "Node.js", "Express", "PostgreSQL", "Leaflet", "Vite", "Tailwind CSS"],
    features: ["Cadastro, edição e exclusão de funcionários.", "Seleção explícita dos funcionários para otimização.", "Prévia de localização com ajuste do ponto no mapa.", "Grupos, métricas e alertas acompanhados por mapas de rotas.", "Login Google e modo visitante com dados locais."],
    technicalDetails: ["Frontend e API separados; dados operacionais filtrados por organização.", "Sessão autenticada com cookie HttpOnly; credenciais LocationIQ permanecem no backend.", "Testes de contratos HTTP, agrupamento e componentes; SQLite restrito ao fallback local/teste."],
    liveUrl: "https://employee-routes-api.vercel.app/", githubUrl: "https://github.com/joelsondeveloper/employee-routes-api",
    tapeLabel: "EMPLOYEE ROUTES — SYSTEM 001", accent: "#9a5b37",
    media: { images: ["/projects/employee-routes/image-1.webp", "/projects/employee-routes/image-2.webp"], video: "/projects/employee-routes/demo.mp4" },
  },
  {
    id: "corinthians-premium", title: "Corinthians Premium", subtitle: "Identidade esportiva em movimento.",
    description: "Experiência visual dedicada ao Corinthians, com narrativa por rolagem, momentos históricos e composição gráfica marcante. O projeto combina vídeo, animações e elementos interativos para apresentar a identidade do clube.",
    technologies: ["React", "TypeScript", "GSAP", "ScrollTrigger", "Three.js", "React Three Fiber", "Drei", "Lenis", "Tailwind CSS", "Vite"],
    features: ["Hero com vídeo e shader de fumaça.", "Transições responsivas sincronizadas ao scroll.", "Apresentação de momentos históricos do clube.", "Partículas de confete que reagem ao ponteiro."],
    technicalDetails: ["Componentes separados para Hero, The Arena e Glory Moments.", "GSAP matchMedia adapta as composições ao desktop e celular.", "Canvas 3D no hero e Canvas 2D para o sistema de confetes."],
    liveUrl: "https://corinthians-premium.vercel.app/", githubUrl: "https://github.com/joelsondeveloper/corinthians-premium",
    tapeLabel: "CORINTHIANS PREMIUM — WEB 002", accent: "#494842",
    media: { images: ["/projects/corinthians-premium/image-1.webp", "/projects/corinthians-premium/image-2.webp"], video: "/projects/corinthians-premium/demo.mp4" },
  },
  {
    id: "nike-ui-clone", title: "Nike UI Clone", subtitle: "Interface, cor e experimentação.",
    description: "Estudo de front-end inspirado em um conceito de e-commerce de tênis. Explora hierarquia visual e transições entre produtos, com cores, descrições e características que acompanham a seleção do visitante.",
    technologies: ["React", "JavaScript", "CSS", "React Icons", "Vite"],
    features: ["Carrossel com navegação anterior e próxima.", "Tema, nome, descrição e características atualizados por produto.", "Transições visuais direcionais entre os tênis.", "Layout adaptado a diferentes tamanhos de tela."],
    technicalDetails: ["Catálogo centralizado em data.jsx e apresentação separada no componente Carousel.", "Estado React controla produto atual, anterior e direção de navegação.", "Animações definidas por classes CSS. Projeto de interface: não foi identificado fluxo real de checkout."],
    liveUrl: "https://nike-ui-clone-pratica-2p7q.vercel.app/", githubUrl: "https://github.com/joelsondeveloper/nike-ui-clone-pratica",
    tapeLabel: "NIKE UI CLONE — DESIGN 003", accent: "#a95b3d",
    media: { images: ["/projects/nike-ui-clone/image-1.webp", "/projects/nike-ui-clone/image-2.webp"], video: "/projects/nike-ui-clone/demo.mp4" },
  },
];
