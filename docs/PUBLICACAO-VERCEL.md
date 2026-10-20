# Publicação em produção — 19/10/2026

- URL pública: https://joelson-dev.vercel.app
- Equipe: joelsondevelopers-projects
- Projeto escolhido pelo proprietário: joelson-dev (`prj_C0mmAa0pKzM0c8SdCfTEDKlGL9Hu`).
- Deployment: `dpl_9sfNHXaYQY2gQyFf4VRCTpiiLuVx` — READY, production.
- Inspeção: https://vercel.com/joelsondevelopers-projects/joelson-dev/9sfNHXaYQY2gQyFf4VRCTpiiLuVx
- Fonte: checkout local, revisão base `6d1492a` com as nove mídias recém-integradas e configuração de publicação; não foi realizado push ao GitHub.
- Next.js 16.4.0, Node 22.x. Build remoto aprovado (32s, incluindo instalação); TypeScript aprovado.
- Pasta raiz ajustada de `joelson.dev` para a raiz deste aplicativo. Framework Next.js; comando `npm run build`.
- `NEXT_PUBLIC_SITE_URL` configurado em produção. Canonical, robots e sitemap conferidos no domínio público.
- Upload por arquivo compactado; backups, caches, arquivos .env e documentação local excluídos por `.vercelignore`.
- Deployment preparado com `--prod --skip-domain`; mídia e robots conferidos com acesso autenticado antes de promover ao domínio principal. Proteção dos deployments temporários preservada.

## Verificação pública
Chrome desktop e celular: preloader, navegação Sobre/Projetos/Experiência/Contato, acesso aos contatos e versão em texto aprovados; nenhum erro JavaScript ou resposta HTTP de erro nos fluxos observados. Capturas da Hero estabilizada e Contatos examinadas. API confirmou duas imagens e um vídeo disponíveis para cada projeto. Os três MP4 responderam HTTP 206 às requisições parciais.

`npm audit --omit=dev`: zero vulnerabilidades reportadas nesta execução. Não representa auditoria completa de segurança.

Consulta de logs do novo deployment: zero registros de nível error nos últimos cinco minutos. A consulta de uma hora excedeu a retenção do plano Hobby; não foi usada como prova de ausência de erros.

Evidências: `docs/qa-preproduction/deployed-*.json` e `deploy-audit.json`.

## Continuidade
As mudanças locais de mídia ainda não foram enviadas ao GitHub. Esta entrega publica o checkout local diretamente. Antes de adotar publicação automática por push, revisar e sincronizar o vínculo Git existente na Vercel; ele não foi alterado nesta entrega.

Monitoramento: consulta de Drains do projeto retornou zero integrações. Verificação pontual de logs e testes de navegador realizados; monitoramento externo contínuo não configurado.
