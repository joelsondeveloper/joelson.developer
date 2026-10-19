# Transição cinematográfica — Contatos

Implementada em 18/10/2026 no projeto `C:/Users/vicen/OneDrive/Documentos/GitHub/joelson.developer`.

A seção contém exclusivamente o cenário e os efeitos visuais. Não foram adicionados textos visíveis, formulários, botões sociais ou informações de contato.

## Arquivos

Criados:
- `src/components/scenes/ContactScene.tsx`: apresentação das mídias, carregamento próximo da cena, seeks do vídeo e destino visual final.
- `src/components/scenes/contact-motion.ts`: fases, enquadramento responsivo e animações adicionadas à timeline principal.
- `src/styles/contacts.css`: composição em tela cheia, interferência e comportamento de movimento reduzido.
- `public/videos/contacts/hill-reversed.mp4`.
- `public/images/contacts/telephone-sunset.png`, `hill-poster.webp` e `hill-zoom.webp`.

Modificados:
- `CinematicIntro.tsx`: integra a cena depois de Experiências no mesmo pin/ScrollTrigger.
- `ExperienceScene.tsx`: encerra a atividade e o preload do personagem ao sair para Contatos.
- `IntroOverlay.tsx`: transforma o item CONTATO existente em navegação funcional para a cena final.
- `globals.css`: importa os estilos da nova cena.

## Mídias e enquadramento

| Recurso | Características | Bytes |
|---|---|---:|
| Vídeo original | H.264, 1280×720, 24 fps, 8 s, com faixa AAC | 6.121.074 |
| Vídeo integrado | H.264, 1280×720, 24 fps, 8 s, ordem temporal invertida, sem áudio | 13.592.607 |
| Foto final | PNG, sRGB, 1671×941, sem alteração dos pixels | 2.225.302 |
| Poster do vídeo | WebP extraído do próprio arquivo | 35.108 |
| Quadro para o zoom | WebP extraído do próprio arquivo | 95.872 |

O original aproximava a câmera da televisão. A derivação inverte a ordem dos quadros, retornando da televisão à colina. Não foi aplicada inversão horizontal ou vertical.

O vídeo derivado usa CRF 17, keyframes em todos os quadros e faststart. O arquivo ficou maior para favorecer buscas rápidas e reversíveis. Há compressão com perdas: não é uma cópia matematicamente idêntica. Comparação SSIM com o original invertido: **0,987741**. A foto final tem o mesmo SHA-256 do arquivo enviado: `94023FAF98828BD19A72EE9656C939AF502E898D94EE63DC9385C5BFFF9483DA`.

Originais em Downloads preservados; cópias adicionais em `.image-backups/2026-10-18-contacts/`.

Foram examinados quadros distribuídos pelo vídeo e os enquadramentos em 0 s, 1,8 s, 6,5 s e 7,95 s da fonte. O quadro de aproximadamente 1,8 s da fonte mostra a cabine maior e legível; corresponde a aproximadamente 6,167 s da versão invertida. A sequência para nesse enquadramento, em vez de usar automaticamente o último quadro.

A cabine foi localizada aproximadamente em **78,6% da largura e 71,8% da altura**. O cálculo de object-fit cover considera o recorte real da viewport. Em telas verticais, o vídeo faz uma panorâmica discreta para a direita antes do zoom. A foto final usa enquadramento de 37% na horizontal em orientação vertical, mantendo a cabine visível à esquerda.

## Timeline e parâmetros editáveis

Todos ficam em `contact-motion.ts`, no objeto `CONTACT` e em `contactFraming()`.

| Parâmetro/fase | Valor |
|---|---|
| Preparação das mídias | 8,5 |
| Entrada após Experiências | 9,35 |
| Início da revelação pelo vídeo | 9,55 |
| Duração da revelação na timeline | 1,55 |
| Intervalo do vídeo invertido | 0,25 → 6,167 s |
| Início/duração do zoom | 11,10 / 0,16 |
| Escala final | 7,5× desktop / 6× retrato |
| Foco normalizado da cabine | x 0,786 / y 0,718 |
| Início da interferência | 11,235 |
| Troca para a foto | 11,260 |
| Fim da interferência | 11,290 |
| Final da timeline | 11,8 |

Cada unidade continua usando quatro alturas de viewport, conforme a arquitetura existente. Na equivalência editorial de quatro segundos por unidade, o zoom dura aproximadamente **0,64 s**, e a interferência **0,22 s**. A duração real depende da velocidade do scroll.

O zoom usa `power3.in`, transform-origin na cabine e deslocamento em direção a 38% da largura em desktop ou 48% em retrato. No trecho de aceleração, um quadro extraído do próprio vídeo evita alterações do enquadramento por seeks pendentes. O corte ocorre sob o pico de ruído. Depois, a foto estabiliza e permanece em tela cheia.

O efeito usa ruído com semente fixa, bandas horizontais, pequenos deslocamentos, separação RGB e blur transitório. Não há sorteios ou timers de glitch. Todos os valores são derivados da timeline e voltam junto com o scroll.

## Carregamento, acessibilidade e manutenção

- Nenhuma mídia de Contatos é baixada na primeira tela; verificado por registro de requisições.
- Foto e quadros auxiliares são preparados antes da entrada. A cena anterior permanece visível se a foto ainda não terminou de carregar.
- O vídeo é pausado, sem autoplay e sem áudio. Seeks são agrupados: quando há uma busca em andamento, seu término aplica o destino mais recente.
- Estados React mudam apenas ao entrar/sair dos intervalos de carregamento; a progressão contínua usa refs, eventos nativos e GSAP.
- O vídeo é descarregado após a passagem para a foto; filtros caros ficam no curto trecho de interferência.
- Um único ScrollTrigger/pin continua controlando a página.
- Com movimento reduzido, a foto entra por fade discreto, sem zoom ou interferência e sem download do vídeo.
- O item CONTATO do menu existente leva à cena final. `#contatos` também funciona após recarregar. A tecla End alcança o final da sequência.
- Nenhuma dependência nova foi instalada.

## Testes executados

Lint, TypeScript e build de produção passaram.

Chrome real com viewports emuladas: **1440×900, 2560×1080, 768×1024, 390×844, 320×640** e **1280×800 com movimento reduzido**.

Em cada configuração foram verificados 14 estados, avançando e retrocedendo: entrada, vídeo intermediário, cabine antes do zoom, aproximação, antes/depois do corte, foto estabilizada e retorno. Capturas dos principais estados foram examinadas. A cabine permaneceu dentro do enquadramento antes do zoom, a foto ficou carregada e visível no final, sem overflow horizontal ou conteúdo de contatos.

- Sem exceções de página, erros de console ou respostas de recurso com falha nos testes.
- Um único pin em todas as configurações.
- Refresh e acesso direto por hash funcionaram.
- Roda do mouse: tempo real do vídeo passou de **1,968 s para 2,602 s** e voltou a **1,968 s**.
- Requisições parciais do vídeo retornaram **HTTP 206**.
- Strict Mode: três montagens/desmontagens terminaram com zero vídeos, canvases ou pins remanescentes e sem exceções de página.
- Regressão de Sobre e Projetos em três larguras: leitura e reversão dos três parágrafos mobile, fitas fora da tela nos extremos e presentes no meio, reprodução e retorno passaram.

Evidências em `outputs`: `contact-validation.json`, `contact-navigation-validation.json`, `contact-strict-validation.json`, `complete-sequence-validation.json` e `contact-*.png`.

## Limites

O zoom digital amplia uma fonte de 720p; sua perda de detalhe é disfarçada pela curta aceleração e pelo glitch. O derivado de 13,59 MB privilegia seeks; o custo de transferência é maior que o original. Não foi medido FPS em aparelho físico ou em rede móvel lenta. Os testes de celular usaram emulação de viewport e toque no Chrome, não Safari/iPhone físico. O teste de desmontagem verifica o ciclo de vida, sem constituir uma medição completa de memória do navegador.
