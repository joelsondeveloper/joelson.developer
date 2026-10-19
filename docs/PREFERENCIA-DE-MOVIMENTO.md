# Preferência global de movimento

As animações começam ativadas, independentemente da preferência do sistema operacional. Na primeira seção, o botão **Movimento reduzido: desligado/ligado** controla a opção para todo o portfólio. A escolha é salva no navegador em `portfolio:reduced-motion` e pode ser revertida pelo mesmo botão.

O hook compartilhado `src/hooks/use-prefers-reduced-motion.ts` agora lê a preferência explícita do site. CSS e JavaScript usam o mesmo estado, através de `html[data-reduced-motion]`. Foram removidas as regras e consultas que ativavam o modo automaticamente pelo sistema, além do controle separado do personagem.

O controle alcança: movimentos da introdução, flutuação, fumaça, letras do nome, personagem CRT, interações das fitas, suavização do scroll e a transição de Contatos. A navegação continua disponível no modo reduzido; Contatos mostra a foto com transição discreta e sem vídeo/glitch.

Validação em Chrome desktop e mobile, ambos com a preferência do sistema em “reduce”: as animações permaneceram ligadas por padrão. O vídeo avançou de 1,204 s para 3,877 s e retornou a 1,204 s. O botão ativou o modo reduzido, a escolha sobreviveu ao refresh e pôde ser desativada. Introdução ficou no primeiro quadro, fumaça parou, cabeça ficou neutra e o vídeo de Contatos foi descarregado no modo reduzido. Um único pin, sem overflow ou erros de console/página. Lint e build passaram.

Evidências: `site-motion-validation.json` e `motion-default-*.png` nesta pasta.
