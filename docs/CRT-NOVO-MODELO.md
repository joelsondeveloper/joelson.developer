# Atualização do personagem CRT

O arquivo `tv+head+character+3d+model.glb` foi copiado, sem alterações, para `public/models/crt-character-parts.glb` (6.470.588 bytes). O arquivo em Downloads foi preservado.

A inspeção encontrou 66 nós, 65 malhas e 65 materiais, sem skins, ossos, atributos de esqueleto ou animações. Portanto, esta exportação contém peças separadas, não rigging por ossos.

Em `CrtCharacter.tsx`, as peças inteiras da televisão e das antenas são agrupadas em um pivô na base da cabeça. Não há cortes na geometria. Gola, conector do pescoço e ombros permanecem no grupo do corpo. Texturas e proporções do novo arquivo foram preservadas.

Em `ExperienceScene.tsx`, o mouse é capturado na janela enquanto a seção está ativa, inclusive quando passa sobre camadas que não pertencem diretamente ao personagem. O olhar retorna ao neutro fora da seção. Os listeners são removidos ao sair e durante a abertura de memórias.

Com movimento reduzido, o personagem permanece neutro por padrão. O botão “Ativar olhar interativo” permite habilitar e pausar a interação sem mudar o sistema. Não é uma janela de permissão.

## Validação real

Chrome com renderização do novo GLB: 1440×900, 390×844 e 1280×800 com movimento reduzido.

- Requisição do arquivo novo confirmada.
- Capturas mostram a televisão virando para os dois lados, com corpo parado.
- Rotação horizontal medida aproximadamente −0,299 a +0,198 radianos; retorno próximo de zero.
- Rotação do grupo do corpo: 0,0,0.
- Quatro memórias abertas e fechadas em cada cenário.
- Renderer desmontado e remontado ao sair/voltar pelo scroll.
- Um pin, sem overflow horizontal e sem erros de página ou console.
- Movimento reduzido inicialmente neutro; controle de ativar olhar testado.
- Lint e build passaram.

Evidências: `crt-parts-validation.json` e capturas `crt-parts-1440-left.png`, `crt-parts-1440-right.png`, `crt-parts-390-left.png` e `crt-parts-390-right.png` nesta pasta. O relatório anterior descreve o modelo antigo, agora substituído.
