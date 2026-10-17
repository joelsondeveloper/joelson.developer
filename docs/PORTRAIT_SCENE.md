# Cena 02 — retrato no CRT

A seção é revelada nos últimos 12% da timeline existente, dentro de CinematicIntro. Não existe outro pin ou ScrollTrigger. Retrato, título e detalhes entram entre 90% e 100%; a rolagem reversa desfaz a entrada. A moldura escura cobre o cenário apenas durante essa transição.

A fotografia fornecida pelo proprietário está em public/images/joelson-portrait.png, com transparência preservada. PortraitScene.tsx reúne a identidade e a composição responsiva. portrait-scene.css controla cores, moldura, scanlines, foto e nome.

InteractiveSmoke.tsx desenha um campo orgânico terracota/malva usando smoke-shader.ts. Pointer Events permitem mouse, caneta e toque, sem impedir o scroll nativo. smoke-fluid.ts simula transporte de velocidade, projeção de pressão e advecção do pigmento em uma grade de até 112 células por lado. Gestos injetam impulso direcional proporcional ao deslocamento, com velocidade limitada. A fumaça continua evoluindo sem novos eventos, perde força por arrasto e retorna gradualmente ao campo de base. Parar, segurar ou soltar o cursor não cria um vórtice fixo. O render é limitado a 30 quadros por segundo e resolução de 1400 pixels; pausa quando a seção está oculta ou a aba está em segundo plano. Ao desmontar, remove listeners, observadores e libera buffers, shaders e programa. Sem WebGL, usa gradientes estáticos.

A animação permanece ativa por padrão conforme a preferência explícita do usuário para o portfólio. Não há nova solicitação de permissão. O conteúdo é HTML semântico, o efeito é decorativo, e a seção oculta fica inert e aria-hidden até a transição.

Validação: Chrome desktop (1366 × 768) e móvel (390 × 844), progressos 0%, 20%, 40%, 70%, 87%, 94% e 100%, retorno ao topo, mouse, toque via eventos nativos, imagem carregada, ausência de overflow e erros de console. Campo visual comparado com tempo do shader congelado: 278111 pixels alterados após movimento do mouse. Três ciclos de montagem/desmontagem em Strict Mode confirmaram que o render para e os programas são liberados. Alternativa sem WebGL testada. Lint e build passaram.


Correção da física: testada com mouse pressionado, liberação e toque. Com o tempo procedural congelado, o campo continua mudando após o gesto e dissipa sem novos eventos. Verificados novamente Strict Mode e fallback. Arrastar a seção não seleciona acidentalmente os textos.


Composição para os próximos conteúdos: no desktop, foto e nome ocupam a metade direita (47,5% da área CRT), com nome reduzido e centrado na foto. A esquerda fica disponível para os conteúdos que o proprietário fornecerá. Não foi acrescentado conteúdo nem novo pin nesta etapa. No celular, a composição e a rolagem existentes foram preservadas. Camadas: foto (2), fumaça translúcida com multiply e opacidade 0,62 (3), textos (4), acabamento CRT (5). Testado em 1366×768, 1920×1080, 1024×500 e 390×844, incluindo largura real do texto e retorno ao topo.


Nome interativo: SlotName.tsx cria sete rolos independentes. Pointer enter/down inicia um giro breve, e movimento sobre o nome renova uma janela de 260 ms. Sem movimento, os rolos desaceleram e alinham alternadamente VICENTE ou JOELSON. Sair, soltar ou cancelar encerra o giro; redimensionar ou ocultar a cena consolida a palavra. Enter/Espaço oferecem alternativa por teclado. A identidade acessível permanece Joelson Vicente, sem anúncios das letras intermediárias. O gesto de toque é capturado apenas na área do nome; o restante da página mantém sua rolagem. Timers, listeners, observadores e tweens são encerrados no cleanup. Validado em Chrome desktop e mobile, com movimentos nativos, ponteiro imóvel, alternância, teclado, scroll reverso e três remontagens Strict Mode. Lint e build passaram.


Seção Sobre completa: about-content.ts contém os três textos fornecidos. No desktop, about-motion.ts estende a mesma timeline: primeiro texto à esquerda (1,10–1,91), foto e nome atravessam para a esquerda (1,91–2,33), segundo texto à direita (2,27–3,08), retorno da foto (3,08–3,50), terceiro texto à esquerda (3,44–4,31). Cada etapa inclui intervalo de leitura. O end do único ScrollTrigger escala com a duração total, preservando quatro viewports de scroll para a aproximação original. gsap.matchMedia reconstrói a configuração ao cruzar 768 px. Os painéis invisíveis ficam inert/aria-hidden. No celular, AboutParagraphs mobile vem após a cena em fluxo normal, com os três textos legíveis sem troca lateral.

Correção da piscada: SlotName mantém a última linha no transform final ao encerrar o giro. A normalização dos rolos ocorre somente no começo da próxima interação ou quando a cena está oculta/redimensionada, sem reset no callback final. Verificados os transforms no instante de encerramento e depois dele. Testes Chrome desktop e tela baixa, móvel, roda nativa, reverso, troca de breakpoint e montagem/desmontagem. Lint e build passaram.


Conteúdo atualizado: Quem sou, Minha trajetória e Meus objetivos usam o texto final fornecido pelo proprietário. Cada etapa tem três Polaroids configuradas em about-content.ts: Curiosidade/Ciência/Criatividade, Formação/Desenvolvimento/Experimentos e Evolução/Colaboração/Futuro. PolaroidCard aceita variant about para cards em fluxo, proporção 3:4, legendas manuscritas e alt descritivo. Fotos fornecidas pelo proprietário estão em public/images/about-polaroids; sources.json registra os URLs originais. As entradas dos cards usam a mesma timeline (stagger), e a saída segue o fade do painel; reversível. Não foi criado novo ScrollTrigger. CSS compacto cobre janelas de 768×500 sem cortes; celular de 320×568 validado. Nove imagens decodificadas, três por etapa, posicionamento abaixo dos textos e legendas verificadas. Regressão de scroll reverso e nome estável passou. Lint e build passaram.

