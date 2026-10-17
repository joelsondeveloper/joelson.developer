# Projetos — sala liminar e fitas VHS

Implementação no projeto local `C:/Users/vicen/OneDrive/Documentos/GitHub/joelson.developer`.

## Comportamento

- No desktop, Sobre e Projetos agora compartilham a mesma cena fixada e o mesmo contorno CRT. O conteúdo do Sobre desaparece antes da apresentação dos textos de Projetos; não existe outra tela empilhada abaixo.
- O cenário foi criado com o Runway: sala vazia com luz de fim de tarde, sombras lavanda e tocador à direita. As fitas continuam sendo o GLB fornecido, com etiquetas independentes.
- As três fitas avançam do canto inferior esquerdo ao superior direito por um percurso curvo e reversível, determinado pelo scroll.
- Um clique aproxima suavemente a fita ao centro, escurece o ambiente e libera rotação e Play.
- Também é possível arrastar uma fita diretamente da coleção ao tocador, sem selecioná-la antes. A entrada recebe um destaque quando o encaixe é válido.
- A inserção termina com um breve chuvisco e a apresentação do projeto. EJECT restaura a coleção.
- No mobile, a foto desaparece e dá lugar a cada um dos três parágrafos, um por vez, dentro da mesma TV fixa. Projetos aparece depois do último parágrafo. Gestos sobre as fitas manipulam os modelos; gestos fora delas permitem rolar.

## Arquivos principais

| Arquivo | Mudança |
| --- | --- |
| `src/components/scenes/CinematicIntro.tsx` | Projetos incorporado à timeline existente no desktop. |
| `src/components/scenes/about-motion.ts` | Saída do Sobre e suspensão dos efeitos quando ele deixa de estar ativo. |
| `src/components/scenes/ProjectsScene.tsx` | Estados da interação, sensores de toque, alternativa sem WebGL, transição com chuvisco e pin mobile com limpeza anterior à remoção do DOM. |
| `src/components/scenes/VhsScene.tsx` | GLB compartilhado, materiais por instância, aproximação, giro, arraste direto, inserção e ejeção. Renderização sob demanda. |
| `src/components/scenes/scene-layout.ts` | Curva das fitas e calibração da entrada do tocador conforme o recorte do cenário. |
| `src/components/scenes/IntroOverlay.tsx` | Acesso de Projetos direcionado ao ponto correto da experiência. |
| `src/styles/projects.css` | Cenário, escurecimento, interface, chuvisco, CRT e responsividade. |
| `public/images/projects/liminal-vhs.webp` | Cenário otimizado, 2752 × 1536, 516.100 bytes. |

O arquivo original do Runway e os componentes anteriores foram preservados em `.image-backups/2026-10-15-vhs-room/`. O cenário usa compressão WebP com perdas, qualidade 92; o PNG original tem 5.751.850 bytes. A redução é de aproximadamente 91%, sem alegação de preservação matematicamente sem perdas.

Geração Runway: `87a65bdc-73b5-4cb3-b547-3a7f290f8ecf`.

Modelo: [VHS Cassette, Brian Fox](https://sketchfab.com/3d-models/vhs-cassette-free-model-fc7d79e6ce5a463093e24925c7518c93), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). A atribuição continua no rodapé da cena.

## Mídias dos projetos

Os dados reais e as URLs continuam centralizados em `src/data/projects.ts`. Para completar as prévias, adicione em cada pasta abaixo `image-1.webp`, `image-2.webp` e `demo.mp4`:

```
public/projects/employee-routes/
public/projects/corinthians-premium/
public/projects/nike-ui-clone/
```

Enquanto essas mídias não existem, a apresentação informa “Prévia em preparação”. Nenhuma imagem fictícia ou vídeo artificial foi acrescentado aos projetos.

## Validação

- Lint e build completos aprovados.
- Chrome real, em desktop 1440 × 900 e viewport mobile 390 × 844.
- Seleção pelo modelo, aproximação com posição intermediária medida, giro, Play, arraste direto, chuvisco e EJECT.
- Scroll de ida e volta: progresso das fitas 10% → 80% → 10%, com posição e altura da moldura estáveis.
- Desktop e mobile mantêm um único pin compartilhado entre introdução, foto, três parágrafos e Projetos.
- Sem erros de execução, respostas HTTP com falha ou overflow horizontal nos fluxos normais testados.
- Movimento reduzido: três projetos abertos por teclado, EJECT e foco devolvido à seleção.
- WebGL indisponível: os três projetos continuam acessíveis pelos controles HTML.
- Strict Mode: três ciclos de montagem, giro por toque, reprodução, EJECT e desmontagem, sem erros e sem canvas ou espaçadores de pin remanescentes.
- Alternância entre tamanhos desktop e mobile verificada.

As medições são de funcionamento e geometria. Não foi atribuído um ganho de FPS ou uma redução de memória sem medição específica.

Evidências: `liminal-validation.json`, `liminal-strict.json`, `liminal-extra.json` e capturas `liminal-*.png` nesta pasta de entrega.


## Correção de 16/10/2026

As três fitas começam e terminam integralmente fora do recorte da TV, com margens calculadas para a fita inteira. A passagem completa permanece reversível. As cópias dos parágrafos e a seção de Projetos fora da cena foram removidas da página; a mesma timeline controla toda a experiência também no mobile. O carregamento gradual das Polaroids foi habilitado para os capítulos dentro da TV no celular.

Lint e build aprovados. Validação real em Chrome nas resoluções 1440×900, 390×844 e 320×640: um único pin; nenhum parágrafo sobreposto; três Polaroids carregadas por capítulo; fitas fora da tela em 0% e 100%; fitas visíveis no meio; rolagem reversa; Play e EJECT; sem erros de execução, downloads falhos ou overflow horizontal. Evidências: complete-sequence-validation.json e capturas complete-*.png na pasta de entrega.
