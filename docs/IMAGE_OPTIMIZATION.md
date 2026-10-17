# Otimização de imagens — 14/10/2026

Implementada e validada no projeto joelson.developer. Inventário: **399 arquivos de imagem**, sem duplicatas exatas (SHA-256), além dos SVGs pequenos embutidos em componentes/CSS. Nenhuma imagem utilizada foi descartada. Os originais estão em .image-backups/2026-10-14-originals, fora de public e da distribuição.

Peso dos assets ativos: **17.988 MB → 17.131 MB**. Economia: **0.858 MB (4.77%)**. MB decimal; backup e candidatos de teste não entram no peso distribuído.

## Tabela resumida

| Imagem | Formato original → final | Antes | Depois | Redução | Resolução final |
|---|---|---:|---:|---:|---|
| TV desktop — 192 quadros | WebP → WebP | 10.081 MB | 10.081 MB | 0% | 1280×720 |
| TV mobile — 192 quadros | WebP → WebP | 4.608 MB | 4.608 MB | 0% | 768×432 |
| collaboration.jpg | jpeg → jpg | 126.24 KB | 126.24 KB | 0.00% | 1290×860 |
| creativity.jpg | jpeg → jpg | 216.88 KB | 216.88 KB | 0.00% | 1024×1024 |
| curiosity.jpg | jpeg → jpg | 143.42 KB | 143.42 KB | 0.00% | 1024×1024 |
| development.jpg | jpeg → jpg | 146.64 KB | 146.64 KB | 0.00% | 1024×1024 |
| education.jpg | jpeg → jpg | 139.54 KB | 139.54 KB | 0.00% | 1024×1024 |
| experiments.jpg | jpeg → jpg | 107.20 KB | 107.20 KB | 0.00% | 1529×860 |
| future.jpg | jpeg → jpg | 100.80 KB | 100.80 KB | 0.00% | 1024×1024 |
| growth.jpg | jpeg → jpg | 112.80 KB | 112.80 KB | 0.00% | 1024×1280 |
| science.jpg | jpeg → jpg | 40.78 KB | 40.78 KB | 0.00% | 1024×1024 |
| about.webp | webp → webp | 7.81 KB | 7.81 KB | 0.00% | 420×360 |
| contact.webp | webp → webp | 30.02 KB | 30.02 KB | 0.00% | 420×360 |
| experience.webp | webp → webp | 16.80 KB | 16.80 KB | 0.00% | 420×360 |
| projects.webp | webp → webp | 27.68 KB | 27.68 KB | 0.00% | 420×360 |
| joelson-portrait.png | png → webp | 2067.49 KB | 1209.97 KB | 41.48% | 1174×1339 |
| favicon.ico | ico → ico | 15.09 KB | 15.09 KB | 0.00% | 48×48, 32×32, 16×16 |

A tabela CSV anexa lista **cada um dos 399 arquivos**, inclusive cada quadro, com bytes, usos e decisão.

## Qualidade e decisões

- Retrato: PNG → WebP lossless, mantendo 1174×1339. Verificação direta confirmou **0 diferenças no alpha e 0 diferenças nos pixels com alpha > 0**. Valores RGB em regiões totalmente transparentes podem ser normalizados pelo encoder; não foi alegada identidade binária.
- Sequência: dimensões e arquivos preservados. Testes em quadros representativos de início/meio/fim, desktop/mobile, com WebP 88/94, lossless e AVIF 75/85: candidatos de alta qualidade ficaram maiores; AVIF também decodificou mais lentamente no ensaio Sharp. Esses tempos são diagnósticos locais, não FPS do navegador. Não se recomprimiu a sequência com perda adicional.
- Polaroids: WebP, AVIF e JPEG foram avaliados. A comparação final usa pixels originais redimensionados diretamente, sem JPEG intermediário. Nenhum candidato que atingiu o limite conservador de SSIM e ficou menor foi adotado; as fotos originais foram mantidas. O recorte 3:4 existente continua feito pelo CSS.
- SSIM auxiliar: blocos RGB 8×8, constantes padrão para 8 bits, limite 0,995. É uma triagem conservadora e não substitui inspeção visual nem garante equivalência perceptual absoluta. Comparações visuais realizadas com os assets e no Chrome.
- Versões responsivas do Next usam AVIF/WebP **com perdas**, qualidade 90; não são chamadas de lossless. A qualidade configurada antes era o padrão 75. Sizes foi corrigido para considerar o recorte de fotos largas, evitando falta de detalhes em Retina.

## Carregamento e memória

- Apenas poster do primeiro quadro com prioridade alta; decodificação assíncrona.
- Hero com srcset/sizes. Retrato aquece a partir de 65% da aproximação; Polaroids de cada capítulo começam a carregar antes de sua entrada. No celular, IntersectionObserver aquece fotos próximas, sem carregar os painéis desktop ocultos.
- Placeholders inline de 24 px ajudam a manter continuidade em saltos rápidos.
- Sequência deixou de baixar todos os 192 quadros ao abrir. Usa demanda, cache comprimido de até 48 entradas após estabilizar, look-ahead curto e duas decodificações concorrentes.
- Cache decodificado: até 13 quadros desktop / 24 mobile, teto de 48 MiB no modelo RGBA. Medido no teste: pico desktop 47.923.200 bytes (45,70 MiB); mobile 31.850.496 bytes (30,38 MiB). O limite anterior desktop de 24 quadros equivalia a 88.473.600 bytes (84,38 MiB).
- Durante os textos ficam apenas primeiro/quadro atual: aproximadamente 7,37 MB desktop. No celular fora da tela: aproximadamente 2,65 MB. São estimativas dos bitmaps RGBA, não medições do processo inteiro nem da GPU.
- Bitmaps descartados são fechados; listeners/observadores/fetches são limpos. Troca de breakpoint seleciona a resolução correta e conserva a pintura anterior até o novo quadro.
- A fumaça usa textura procedimental pequena, reutilizada e descartada; não havia grandes texturas de imagem ou Three.js para reduzir.

## Medição antes/depois

Chrome local, contextos novos, viewport 1366×768 e 390×844, dez segundos parado no topo. Uma amostra por modo, sem throttling. Volume abaixo é a soma de **encodedBodySize** dos recursos de imagem registrados pelo navegador: inclui corpos reaproveitados do cache e não representa bytes TCP exatos.

| Modo | Volume antes | Volume depois | Redução | Recursos antes → depois |
|---|---:|---:|---:|---:|
| desktop | 10.320 MB | 0.523 MB | 94.93% | 207 → 11 |
| mobile | 4.728 MB | 0.411 MB | 91.31% | 204 → 16 |

Heap JS foi registrado nos JSONs, mas não se atribuiu melhoria geral: a amostra mobile variou para cima, e heap JS não mede os bitmaps/GPU. Não foram alegados ganhos de Lighthouse, FPS ou Core Web Vitals de produção. Saltos diretos para quadros distantes levaram 19–402 ms nos testes locais; o canvas manteve um quadro pintado enquanto o alvo decodificava.

## Validação

- Lint limpo; build Next.js/TypeScript aprovado.
- Todos os 399 arquivos inventariados e seus usos classificados; nenhum duplicado exato nem asset não utilizado identificado.
- Fotos das três etapas carregadas e decodificadas; desktop e mobile; zero respostas HTTP de erro e zero erros de console nos testes.
- Scroll 0%, 20%, 40%, 70%, 100% e retorno ao topo; quadro correto, um único pin, sem overflow, limites de cache verificados.
- Três capítulos preservados, fotos e nome alternando lados. Smoke e reels não tiveram seu design alterado.
- Originais com SHA-256 preservados e imagem do retrato validada pixel a pixel.
- Corrigidos: download integral antecipado, fotos ocultas baixando cedo, desperdício de cache durante leitura e sizes inadequado para recortes largos.

## Automação

O projeto já tinha Sharp via Next; nenhuma dependência foi instalada. Scripts em scripts/optimize-images.mjs e scripts/image-quality.mjs.

- npm run images:audit: inventário e ensaios conservadores, relatório em docs/image-optimization-current.json.
- npm run images:optimize: aplica apenas candidatos menores com SSIM >=0,995, criando backup e atualizando aliases. A sequência está explicitamente protegida pelas decisões de qualidade.

O backup original permanece em .image-backups/2026-10-14-originals, incluindo os arquivos de integração anteriores.


Verificação de descarte: instrumentação do createImageBitmap confirmou 14 bitmaps criados e todos fechados após desmontagem. Três remontagens em React Strict Mode confirmaram ausência de pins e animações residuais. Troca desktop/mobile e roda nativa passaram. A comparação visual no Chrome confirmou composição, transparência e fotografias preservadas.

