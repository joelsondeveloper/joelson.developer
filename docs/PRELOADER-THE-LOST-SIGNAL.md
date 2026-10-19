# The Lost Signal — entrega e validação

> Atualização: a Hero usa agora 476 frames em desktop e mobile. Consulte [HERO-476-FRAMES.md](HERO-476-FRAMES.md); os números de 192 frames abaixo descrevem a entrega anterior.

Implementado em 19/10/2026. Nenhuma dependência, imagem externa, modelo ou vídeo novo foi adicionado. Arquivos de mídia originais preservados.

## Experiência

Prólogo fullscreen com céu azul-acinzentado/rosa, horizonte abstrato, névoa em transform, vinheta, scanlines e linhas analógicas. Estados SEARCHING FOR A LOST SIGNAL, TUNING INTO A MEMORY e SIGNAL FOUND dependem de marcos de preparação. A dissolução de 650 ms revela diretamente o canvas real da colina já desenhado, sem tela preta intermediária. A entrada da interface só começa após a liberação, evitando uma piscada de elementos já visíveis. Foram inspecionados 80 frames reais da transição via screencast do Chrome.

## Cinco marcos críticos

1. Pôster responsivo da Hero carregado com dimensões válidas.
2. Pelo menos um quadro real decodificado e desenhado no canvas.
3. Fontes da identidade e do cabeçalho disponíveis (ou fallback em caso de falha).
4. Quatro miniaturas da navegação carregadas e decodificadas (ou tratamento da falha).
5. Timeline e ScrollTrigger principal criados.

O indicador anuncia “N de 5 etapas preparadas”. Não representa bytes nem porcentagem de download. Foi testado com frame-0001.webp atrasado por 4,5 s: o indicador aguardou em 4/5. Cache quente pode concluir vários marcos no mesmo frame; não há contador artificial para alongar a espera.

## Fila e prioridades

- Após a saída, imagens do retrato, dos nove Polaroids, ambiente de Projetos, alternativa estática do CRT e imagens de Contatos têm prioridade.
- São usados srcset/sizes e qualidade iguais aos componentes Next Image para reutilizar variantes responsivas.
- Sequência da Hero: cobertura espaçada a cada 12 quadros primeiro; depois demais quadros. Somente a variante desktop ou mobile atual é aquecida no cache HTTP. O cache decodificado existente continua limitado a 48 MiB.
- Módulos dinâmicos, GLBs e vídeo são preparados em segundo plano, sem criar renderizadores invisíveis. O carregamento e a decodificação 3D existentes continuam próximos à cena; sua imagem alternativa permanece disponível durante a preparação.
- Até dois trabalhos da fila no desktop; um em mobile ou economia de dados/2G. Isso limita a fila adicional, não todos os pedidos nativos do navegador.
- Clique nas Polaroids/menu promove os trabalhos do destino. A timeline também promove Projetos em 2,5, Experiências em 5,5 e Contatos em 7,2, antes de suas entradas.
- Save-Data/2G adia os recursos pesados até haver intenção de navegação/aproximação. O teste confirmou zero pedidos GLB/vídeo durante a permanência inicial na Hero nesse modo.
- Com movimento reduzido explícito, o aquecimento integral dos quadros e do vídeo é evitado. O prólogo também respeita a preferência do sistema; as demais cenas preservam o controle explícito já existente no site.

## Falhas e limpeza

Opção de continuar após 4,5 s ou em falhas detectadas; liberação automática após 12 s mais a curta saída visual. Falha crítica do cenário mantém identidade, Polaroids, navegação e fundo atmosférico funcional. Fontes/miniaturas têm fallback. Um trabalho secundário com erro não cancela a fila.

Fetches de preparação têm timeout de 20 s; imagens têm limite de 15 s. Ao desmontar, observadores/listeners são removidos e fetches da fila são abortados. Animações GSAP do prólogo são canceladas. O bloqueio de wheel/toque/teclado é removido na liberação ou na desmontagem. Lenis volta ao estado ativo. Links diretos são restaurados depois da liberação.

## Gargalos identificados

Hero: 192 WebPs, 10.08 MB desktop ou 4.61 MB mobile; não é mais vídeo. O canvas conserva uma imagem já pintada enquanto um salto rápido busca/decodifica seu destino.

Contatos: H.264 1280×720, 24 fps, 8 s, 13.59 MB, 192 keyframes em 192 quadros. O arquivo já é adequado a seeks frequentes; não foi recomprimido. O hook existente mantém um seek pendente e elimina buscas redundantes. A foto final é preparada antes da entrada.

GLB VHS: 5.78 MB, 4 imagens embutidas, cerca de 33.25 MiB de pixels RGBA sem mipmaps. GLB CRT: 6.47 MB, 195 imagens embutidas, cerca de 49.24 MiB de pixels RGBA. O custo de primeira inicialização não é só rede: inclui geometria, texturas e GPU. Não foram mantidos dois mundos 3D renderizando fora de vista, nem reduzida a qualidade das texturas sem necessidade.

Corrigido um conflito observado no teste: ocultar o overlay inteiro por visibility antes da construção da timeline fazia o GSAP capturar estados invisíveis na volta ao topo. Agora apenas os wrappers de entrada aguardam a saída do prólogo, sem afetar a timeline de scroll.

## Testes executados

- Build de produção com TypeScript: passou.
- Lint: passou.
- Chrome real headless, desktop 1440×900 e mobile 390×844: liberação com canvas pintado, wheel livre, um único pin, quatro destinos pelas Polaroids, ida/volta e Contatos. Sem erros JavaScript nos cenários normais.
- Seek reverso em Contatos: currentTime 2.731 s, readyState 4, em desktop/mobile.
- Personagem CRT: data-model-ready=true confirmado após abrir Experiências no desktop.
- Movimento reduzido explícito e sistema: prólogo simplificado, navegação funcional, Hero estática no quadro zero e vídeo de Contatos desativado.
- Falha intencional de todos os quadros da Hero: saída manual e automática funcionais, destinos continuam acessíveis.
- Conexão emulada a 200.000 bytes/s com 120 ms de latência: prólogo liberado sobre quadro real, sem erro JavaScript.
- Cache frio/quente: uma medição local registrou 5.363/4.065 s do início da navegação à saída do prólogo. Varia conforme CPU/rede; não é benchmark de produção. No acesso aquecido os dois modelos consultados tiveram transferSize=0, confirmando reutilização do cache.
- Strict Mode isolado: três ciclos de montagem/desmontagem, um interrompido durante o prólogo; zero pins após desmontar, Lenis removido, bloqueio liberado e contagens dos listeners monitorados estáveis entre ciclos.
- Inspeção visual: estados inicial, sinal encontrado, dissolução sobre a colina, Hero completa, mobile e alternativa em falha.

Evidências JSON e capturas foram preservadas na pasta outputs desta tarefa do Codex; os JSON relevantes acompanham este documento em docs/qa-preloader/.

## Arquivos

Criados: src/components/scenes/SignalPreloader.tsx, src/lib/scene-preparation.ts, src/styles/signal-preloader.css e esta documentação.

Modificados: src/components/scenes/CinematicIntro.tsx; src/hooks/use-smooth-scroll.ts; src/lib/portfolio-navigation.ts; src/components/ui/DeferredImage.tsx; src/components/scenes/ExperienceScene.tsx; src/components/scenes/ContactScene.tsx; src/app/globals.css.

## Limites práticos

Prefetch reduz atrasos evitáveis, mas não garante ausência de engasgos em toda GPU ou rede. A primeira renderização 3D ainda envolve upload de texturas; as alternativas visuais existentes cobrem a preparação. Saltos para recursos que ainda não chegaram podem manter o último frame disponível até a decodificação. Não houve medição de FPS/memória GPU em aparelhos físicos. A estimativa de texturas acima é RGBA básico, sem cópias internas do navegador nem mipmaps.

## Parâmetros de ajuste

SignalPreloader.tsx: botão em 4500 ms, limite em 12000 ms, leitura de SIGNAL FOUND por 220 ms e dissolução em 650 ms (reduzidos no modo acessível). scene-preparation.ts: concorrência em limit(), ordem em enqueue(), prioridades de navegação em prioritizeScene() e antecipação pela timeline em observe().
