# Experiências — entrega e validação

Implementada no projeto `C:/Users/vicen/OneDrive/Documentos/GitHub/joelson.developer`, em 17/10/2026.

## Recursos

- Canal 04 integrado à timeline e ao único pin existente, depois de Projetos. Interferência VHS curta e reversível.
- Ambiente em creme, rosa envelhecido e marrom, com profundidade, iluminação de janela e textura CRT.
- Personagem enquadrado do peito para cima, com antenas e gola visíveis.
- Cabeça acompanha o cursor com amortecimento, limites de aproximadamente 12,6° na horizontal e 5,4° na vertical. Corpo não gira. Idle corporal menor que um pixel.
- Tela original preservada, com emissão suave, scanlines e reação ao explorar Polaroids, sem plano adicional sobre a moldura.
- Quatro Polaroids acessíveis por teclado e toque; expansão a partir da posição da fotografia, conteúdo detalhado, Escape/retorno e restauração do foco.
- Memórias de experiência profissional, formação, ferramentas e projetos. Conteúdo baseado no texto do proprietário e nos projetos existentes.
- Layout específico para celular; alternativa estática renderizada do próprio modelo quando WebGL não está disponível.

## Arquivos principais

Criados:
- `src/components/scenes/ExperienceScene.tsx`: composição, interações e ativação pela seção.
- `src/components/scenes/CrtCharacter.tsx`: renderização, cabeça e materiais.
- `src/components/scenes/MemoryViewer.tsx`: exploração acessível das memórias.
- `src/data/experiences.ts`: textos, imagens, referências e dados editáveis.
- `src/styles/experiences.css`: ambiente, composição, responsividade e memórias.
- `public/models/crt-character-articulated.glb`: derivado articulado.
- `public/images/experiences/crt-character.webp`: fallback de 93.162 bytes.

Integração em `CinematicIntro.tsx`, `ProjectsScene.tsx`, `IntroOverlay.tsx` e `globals.css`. Sem novas dependências.

## Inspeção e preservação do GLB

O original possui uma malha, um material, 28.935 vértices e 49.964 triângulos, sem ossos ou animações. A televisão e o corpo compartilhavam geometria e atlas. Uma cópia foi dividida na ligação estreita do pescoço (Y = 0,6505), mantendo coordenadas e UVs e fechando o corte. A cabeça gira rigidamente em um pivô independente; não há deformação do pescoço.

| Modelo | Bytes | Tamanho decimal |
|---|---:|---:|
| Original | 9.514.924 | 9,51 MB |
| Derivado utilizado | 6.628.676 | 6,63 MB |
| Economia | 2.886.248 | 30,33% |

A textura de cor de 4096 px foi preservada byte a byte. Normal e metalness/roughness foram reduzidos para 2048 px. Portanto, o derivado não é matematicamente sem perdas. A comparação de capturas reais, com iluminação/câmera iguais e pose neutra, apresentou diferença absoluta média de 0,086 por canal na escala de 0 a 255; isso mede essa captura, não garante igualdade em todos os ângulos.

Original em Downloads intocado. Cópia preservada em `.image-backups/2026-10-17-crt-source/tv-head-original.glb`. O processo de derivação ficou nos scripts de trabalho da entrega.

## Carregamento e recursos

- Nenhuma requisição do GLB na primeira tela, confirmado em navegador.
- Importação e preload próximos ao final de Projetos; Canvas montado somente na seção Experiências.
- Renderer sob demanda, invalidado a aproximadamente 30 fps enquanto ativo, visível e com janela em foco; DPR limitado a 1,25.
- Movimento reduzido: cabeça neutra e sem loop de idle; conteúdo continua acessível.
- Saída da seção desmonta Canvas, remove listeners/timer e libera geometria, materiais e texturas do personagem após pequena tolerância para remontagem.
- Projetos descarrega seu renderer antes da entrada do personagem.
- Estimativa das três texturas com mipmaps: aproximadamente 128 MiB, contra 256 MiB no original. Não é uma medição de VRAM ou heap do navegador.
- Não foi realizado benchmark de FPS do site inteiro em aparelho físico.

## Testes executados em Chrome real

- Produção: desktop 1440×900, celulares emulados 390×844 e 320×640.
- Movimento reduzido: 1280×800. Zero frames de idle no intervalo medido.
- WebGL indisponível: 1280×800. Fallback estático e quatro memórias navegáveis. A falha WebGL esperada é capturada pelo componente; não houve exceção de página não tratada.
- Todas as quatro memórias: abertura, conteúdo, rolagem interna, fechamento e foco restaurado, nos cinco cenários.
- Cabeça: esquerda, direita, interpolação e retorno ao neutro. Rotação do objeto Body permaneceu `0,0,0`.
- Desktop ativo: 32 frames no intervalo de um segundo; valores dos demais cenários constam do JSON, sem promessa de FPS constante.
- Scroll reverso, descarregamento e recarregamento do personagem; único pin, sem overflow horizontal.
- Transição: Projetos visível em 7,1; interferência 0,88 em 7,25; Experiências totalmente visível em 7,5; mesmos valores ao voltar.
- Strict Mode em desenvolvimento: três montagens/desmontagens, terminando com zero canvases, pins ou diálogos e sem exceções de página. É uma verificação de ciclo de vida, não prova de ausência de todo vazamento de memória.
- Regressão de Sobre/Projetos: três larguras, sete etapas/reversões do Sobre mobile, três fitas fora da tela nos dois extremos e visíveis no meio, reprodução e retorno.
- Sem erros de página/console nos cenários com WebGL. Sem respostas de recurso com erro nos testes de regressão.
- Lint e build de produção passaram.

Evidências JSON e capturas na pasta `outputs` desta entrega: `experience-validation.json`, `experience-transition-validation.json`, `experience-strict-validation.json`, `complete-sequence-validation.json`, `crt-model-validation.json` e `experience-verified-*.png`.

## Conteúdo a completar

Instituições, datas, certificados e futuras experiências em empresas ainda precisam de informação do proprietário. Esses campos estão centralizados em `src/data/experiences.ts`. Nenhum empregador, cargo, prêmio ou resultado comercial foi inventado.

As quatro fotografias conceituais reutilizam recursos locais de Sobre. Para substituí-las, altere `image` e `alt` no mesmo arquivo. Não há vídeo ou novo ambiente 3D obrigatório pendente para a implementação atual.
