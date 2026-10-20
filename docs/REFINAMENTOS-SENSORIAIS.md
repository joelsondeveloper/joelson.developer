# Retrato, textura CRT, fitas e fluido — 20/10/2026

Implementação local; esta rodada não foi publicada na Vercel.

- Novo retrato fornecido, convertido para WebP sem perdas (1174×1339, transparência preservada, 1057596 bytes). O arquivo anterior e o PNG de origem foram preservados. O carregamento antecipado aponta para a nova imagem.
- Textura procedural local de 128×128 (26229 bytes), opacidade 3,5%, sem captura de ponteiro. Um observador reutiliza o tempo da timeline: ativa do início do Sobre (0,88) até a saída de Experiências (9,55), sem grão na Hero ou em Contatos. Diálogos de projetos e memórias recebem acabamento de 2,5%. Movimento reduzido deixa o grão estático.
- Sons mecânicos sintetizados com Web Audio, sem arquivos externos: pequeno motor, ruído filtrado e dois cliques. Somente após interação, nos callbacks reais de inserção (botão ou arraste) e ejetar. Um contexto reutilizado e fechado ao desmontar; nós desconectados ao terminar. Controle de som independente, acessível e posicionado abaixo da apresentação de Projetos.
- Fluido com difusão implícita de velocidade, menor impulso, resistência maior e relaxamento mais lento do pigmento. Movimento ambiental desacelerado e formas mais largas/cremosas. Sem vínculo rígido ao ponteiro. A simulação pausa fora do Sobre e retoma na volta; fallback estático com movimento reduzido ou sem WebGL. O resultado é uma aproximação visual viscosa, não uma simulação científica de leite condensado.

## Arquivos

Novos: src/hooks/use-vhs-sounds.ts, src/components/ui/CrtGrain.tsx, public/images/joelson-portrait-new.webp, public/images/crt-grain.png.
Modificados: PortraitScene.tsx, CinematicIntro.tsx, ProjectsScene.tsx, InteractiveSmoke.tsx, smoke-fluid.ts, smoke-shader.ts, src/lib/scene-preparation.ts e src/styles/site-refinements.css.

## Validação

- Lint, build e TypeScript: aprovados.
- Chrome real automatizado, desktop 1350×800 e mobile 390×844: retrato, movimento do fluido por mouse/toque, escopo do grão, reprodução e ejeção, silêncio e navegação reversa aprovados, sem erros JavaScript.
- Áudio: medição do sinal real da saída do grafo, com picos de amplitude diferentes de zero para os dois efeitos; sem saída automática no carregamento e sem novos sons quando silenciado. A verificação não inclui avaliação auditiva humana dos alto-falantes.
- O teste mobile identificou uma sobreposição inicial entre o botão de som no rodapé e REPRODUZIR; corrigida e o fluxo por toque repetido com sucesso.
- Movimento reduzido: grão estático, simulação em fallback e conteúdo acessível.
- Teste numérico de 30s com o mesmo gesto: campos finitos e limitados; norma da velocidade em 1s caiu de 440,55 para 126,08 e em 2s de 111,38 para 1,57. São unidades internas da malha, sem equivalência física a viscosidade real. Capturas examinadas em desktop e mobile.

Evidências em docs/qa-sensory/.
