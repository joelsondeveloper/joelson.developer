# Refinamento e preparação para produção

Atualização de 19/10/2026. Nenhuma publicação foi realizada.

## Interface e navegação
- Polaroids de Experiências redistribuídas para preservar título, personagem e legendas dentro da moldura CRT. Composição própria para celular e telas baixas; nestas últimas o personagem decorativo é ocultado para preservar os controles.
- Um único cabeçalho permanece em todas as cenas, fora dos overlays que desaparecem. O nome/indicador VHS retorna ao topo. Os quatro destinos reutilizam a timeline e a navegação suave existentes.
- Menu móvel com controle de expansão, fechamento por Escape, clique externo e seleção; foco visível e indicação da seção atual.
- Retorno de Contatos alterado para **TOQUE PARA VOLTAR**, com ação real de retorno ao início.
- Removida a disputa entre o controlador proporcional de rolagem e as animações de navegação do Lenis. Um único loop controla a rolagem; não há novo ScrollTrigger de pin.

## Acessibilidade
- Atalho de teclado para pular a apresentação; preferência explícita de movimento reduzido disponível no cabeçalho.
- Escape fecha a memória imediatamente e devolve o foco à Polaroid. Dialog de imagem ampliada com nome acessível.
- Controles principais com área de toque de 44 px, foco visível e cores de texto mais legíveis.
- `/versao-texto` oferece conteúdo real, projetos e contatos em HTML renderizado no servidor, sem WebGL ou scroll fixado. A página inicial oferece esse acesso mesmo com JavaScript desativado.
- As verificações são funcionais e visuais; não constituem certificação WCAG nem auditoria automatizada completa com axe.

## Preparação técnica
- Metadados em português, identificação real, Open Graph condicional, favicon próprio, páginas 404 e erro com recuperação.
- `.env.example`: configurar **NEXT_PUBLIC_SITE_URL** com a origem real antes de compilar para produção. Sem domínio, o site permanece `noindex`, robots bloqueia indexação e sitemap fica vazio. Previews Vercel permanecem fora da indexação.
- Cabeçalhos: nosniff, referrer policy, bloqueio de iframe e desativação de câmera/microfone/geolocalização. Identificação X-Powered-By removida.
- Rastreamento dos arquivos de `public/projects` para a rota que verifica a disponibilidade das mídias. Script `typecheck` acrescentado sem novas dependências.

## Arquivos principais
- `src/components/ui/PortfolioHeader.tsx`
- `src/components/scenes/{CinematicIntro,IntroOverlay,PortraitScene,ProjectsScene,ExperienceScene,ContactOverlay,MemoryViewer,ProjectPlayer}.tsx`
- `src/hooks/use-smooth-scroll.ts`
- `src/styles/site-refinements.css` e `src/app/globals.css`
- `src/app/{layout,page,error,not-found,robots,sitemap}.tsx` (robots e sitemap usam extensão `.ts`)
- `src/app/versao-texto/page.tsx`, `src/app/icon.svg`, `src/app/favicon.ico`
- `src/lib/site.ts`, `next.config.ts`, `package.json`, `.env.example`, `.gitignore`

## Verificações
- Lint: aprovado.
- Build de produção e TypeScript: aprovados.
- Layout dos cards: desktop 1350×635, 1440×900, 1024×768; celular 390×844 e 320×640; telas baixas 844×390, 720×450 e 320×320. Capturas e medidas dos cards sem cortes laterais ou overflow horizontal.
- Navegação, retorno ao topo, abertura de memória por teclado, Escape e restauração do foco verificados em navegador Chrome real em modo automatizado.
- Versão sem JavaScript: aprovada em 1350 px e 320 px, inclusive acesso ao e-mail e ausência de overflow.
- Evidências da rodada final ficam em `docs/qa-preproduction/`.

## Antes da publicação
1. Definir o domínio real e refazer o build para gerar canonical, robots e sitemap públicos.
2. Repetir a auditoria de dependências: a tentativa de `npm audit --omit=dev` falhou com DNS `ENOTFOUND registry.npmjs.org`. O resultado de vulnerabilidades permanece desconhecido.
3. Revisar as mídias de demonstração dos três projetos: as pastas ainda possuem `.gitkeep` e o site informa prévia em preparação. Instituições, datas e certificados também podem ser preenchidos nos dados de Experiências, quando disponíveis.
4. Validar a URL de preview no provedor escolhido antes de publicar o domínio. Recursos externos e entrega real de e-mail não foram testados como envios.
