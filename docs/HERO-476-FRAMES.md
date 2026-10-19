# Hero — integração dos 476 frames

## Correções

A Hero já é renderizada por canvas/WebP; useVideoScrub e currentTime não controlam esta cena. O MP4 fornecido foi verificado por FFprobe: H.264, 1280×720, 60 fps, 476 frames, 7,933 s, 9.680.729 bytes. Os frames desktop fornecidos foram preservados; não houve interpolação nem aumento de FPS.

- Configuração única em src/lib/intro-sequence.ts: pastas, dimensões e quantidade usadas pelo hook, pôster e preparação antecipada.
- Pôster e prefetch deixaram de apontar para desktop/192 frames; ambos usam desktop-60fps/476. Mobile agora usa uma cópia responsiva com os mesmos 476 frames.
- Removido scrub:0.4, que acrescentava atraso à timeline. A relação com o scroll permanece linear, com scrub:true, sem tween de catch-up.
- Corrigido descarte do frame zero: ele era solicitado novamente depois de ser expulso do cache cheio. Início, meio e fim agora são âncoras protegidas, prontas para retornos e saltos.
- O cache mantém um bitmap disponível e avança até um frame intermediário válido quando o destino ainda não chegou, sem ultrapassar o frame pedido ou oscilar para trás.
- Uma vaga de carregamento permanece reservada para o frame solicitado. Frames já decodificados são desenhados na própria atualização do ScrollTrigger; decodificações assíncronas usam RAF.
- Limites de bitmaps: 96 MiB desktop e 32 MiB mobile. Bitmaps descartados são fechados; o quadro pintado é conservado ao redimensionar/trocar a variante.
- Módulos 3D aguardam a saída da Hero para serem avaliados, salvo intenção explícita de navegação. Downloads e preparação das próximas cenas continuam na fila.
- Corrigidos o pedido de frame zero no modo reduzido e o início da timeline após mudanças de viewport/preferência. A sequência continua mapeada de 0 a 475.

## Recursos

| Variante | Frames | Resolução | Peso |
|---|---:|---|---:|
| Desktop fornecido | 476 | 1280×720 | 29.179.128 bytes |
| Mobile gerado | 476 | 768×432 | 15.295.892 bytes |

Mobile usa WebP qualidade 86, com compressão com perdas e redução de resolução; foi inspecionado visualmente. As antigas pastas desktop e mobile de 192 frames e os vídeos originais continuam preservados. Somente a variante correspondente à viewport é utilizada.

## Testes e resultados

- Build com TypeScript e lint: passaram.
- Chrome headless real, 1440×900 e 390×844: sequência ativa de 476 frames, sem erros JavaScript ou respostas HTTP quebradas nos testes concluídos.
- Comparação controlada de scroll lento (frames 0–70, ida e volta, 65 ms entre pedidos): erro médio desktop antes 0.284 frame; depois 0.050 frame. Mobile depois 0.000 frame. Estes valores medem a diferença entre pedido e desenho, não FPS sustentado.
- Saltos para 0, 119, 238, 356 e 475, reversão, retorno ao topo: destinos atingidos. Âncoras de início/meio/fim chegaram em cerca de 23–103 ms no teste final; um primeiro salto frio para 119 levou 632 ms no desktop e 452 ms no mobile. Decodificação/rede fria ainda podem exigir espera; não foi inserido atraso artificial para mascará-la.
- Bitmaps desktop observados: 199.065.600 bytes antes; 99.532.800 depois, redução de 50%. Mobile: 33.177.600 bytes. São estimativas de pixels RGBA do cache, não a memória total do navegador/GPU.
- Modo reduzido mantém frame zero; restauração de movimento e troca desktop/mobile no meio da cena funcionaram.
- Navegação da Polaroid Contato, após trocar a viewport, chegou à timeline correta. Um único pin continuou presente.
- Capturas inicial e intermediária da Hero foram inspecionadas em desktop/mobile.

Resultados e amostras completos em docs/qa-hero476/. A fluidez final ainda depende do dispositivo e de recursos estarem disponíveis; o teste não garante 60 fps constantes em qualquer hardware.

## Arquivos

Criado: src/lib/intro-sequence.ts.

Modificados: src/hooks/use-image-sequence.ts, src/components/scenes/CinematicIntro.tsx, src/lib/scene-preparation.ts, public/images/tv-zoom/manifest.json.

Gerados: public/images/tv-zoom/mobile-60fps/frame-0001.webp até frame-0476.webp. Nenhuma dependência foi instalada.

