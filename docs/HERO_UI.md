# Hero cinematográfica — manutenção

A cena usa a sequência WebP já existente. `useImageSequence` cria uma única timeline com ScrollTrigger, pin e scrub. `intro-motion.ts` adiciona os fades da interface a essa mesma timeline (duração normalizada de 0 a 1). Não adicionar um segundo pin à cena.

## Faixas de desaparecimento

- 0–10%: identidade e Polaroids visíveis; detalhes analógicos perdem apenas um pouco de opacidade.
- 10–25%: Polaroids, frase lateral, assinatura e detalhes analógicos desaparecem.
- 25–40%: apresentação, cabeçalho e tratamento de contraste desaparecem.
- A partir de 40%: overlay invisível e `inert`; só os frames continuam visíveis. A rolagem reversa restaura tudo.

As animações de entrada atuam apenas nos wrappers internos. O estado de saída depende exclusivamente do progresso do scroll. A rolagem cinematográfica fica ativa por padrão, conforme a preferência explícita do usuário. Entradas, flutuação e indicador de rolagem ficam ativos por padrão, inclusive quando o sistema indica movimento reduzido, conforme a preferência explícita atual do usuário. Alterar a preferência durante a sessão não recria a timeline da sequência. Nenhum controle de permissão ou botão de pular é exibido nesta etapa.

## Fotografias e navegação

Os quatro arquivos em `public/images/intro-polaroids/` são placeholders decorativos recortados do próprio cenário. Não são retratos do proprietário nem imagens de projetos reais. Substitua `projects.webp`, `experience.webp`, `about.webp`, `contact.webp` por fotografias definitivas. Use proporção aproximadamente quadrada, resolução de pelo menos 420 × 360 e licença apropriada.

Os dados configuráveis estão em `introPolaroids`, em `IntroOverlay.tsx`. Cada card aceita `id`, `label`, `image`, `rotation` e `href` opcional. Configure `href` apenas quando a seção ou página de destino existir. O componente renderiza links acessíveis por teclado quando há destino real.

O menu é uma lista semântica de rótulos. Não contém href fictício, botão vazio ou páginas adicionais. Converta seus rótulos em links junto com a implementação das futuras seções.

## Fontes

La Belle Aurore (nome) e Caveat (legendas e assinatura) são locais, carregadas via `next/font/local`. Geist Mono mantém a identidade monoespaçada existente. Fontes obtidas do repositório oficial Google Fonts; licenças SIL OFL estão em `public/fonts/*-OFL.txt`.

## Responsividade

Desktop segue a distribuição editorial da referência. Tablet em retrato redistribui fotos e texto lateral. Celular usa uma apresentação superior, cards menores abaixo da TV e rodapé compacto. Em viewports de pouca altura, detalhes decorativos podem ser omitidos. A imagem de referência não é usada como background nem como asset de interface.

## Movimento e rolagem suave

Lenis é sincronizado ao ticker do GSAP, sem segundo ScrollTrigger. A roda recebe suavização; toque mantém o comportamento nativo. As Polaroids flutuam em wrappers separados dos fades de scroll. Os loops das fotos e do indicador pausam quando ficam invisíveis e retomam ao voltar. Ao desmontar, o contexto GSAP é revertido, o ticker e listeners são removidos e Lenis é destruído.

