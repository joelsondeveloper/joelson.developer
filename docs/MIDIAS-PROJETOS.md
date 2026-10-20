# Mídias dos projetos

Integração dos arquivos fornecidos em 19/10/2026, na ordem Employee Routes, Corinthians Premium e Nike UI Clone. Os arquivos de origem permanecem intactos nos caminhos enviados. Os caminhos já configurados em `src/data/projects.ts` foram preenchidos, sem alterar o layout ou adicionar carregamento antecipado dos vídeos.

| Projeto / arquivo | Original MB | Final MB | Redução |
|---|---:|---:|---:|
| employee-routes / image-1.webp | 0.07 | 0.03 | 58.2% |
| employee-routes / image-2.webp | 0.48 | 0.15 | 68.3% |
| employee-routes / demo.mp4 | 24.51 | 4.73 | 80.7% |
| corinthians-premium / image-1.webp | 1.05 | 0.55 | 47.2% |
| corinthians-premium / image-2.webp | 0.33 | 0.18 | 46.9% |
| corinthians-premium / demo.mp4 | 37.65 | 20.92 | 44.4% |
| nike-ui-clone / image-1.webp | 0.42 | 0.19 | 54.7% |
| nike-ui-clone / image-2.webp | 0.68 | 0.33 | 51.0% |
| nike-ui-clone / demo.mp4 | 17.01 | 6.83 | 59.8% |

Total: 82,20 MB → 33,92 MB (58,7% de redução).

As capturas WebP usam compressão sem perdas e preservam as dimensões. Os vídeos H.264 CRF20 usam compressão com perdas, resolução original e 30 fps, sem interpolação; áudio AAC copiado. Faststart permite iniciar a reprodução antes de transferir o arquivo completo. Durações: Employee 52,33s, Corinthians 80,60s e Nike 37,37s. O player existente carrega metadados somente ao abrir a fita e libera a fonte ao fechar.

Validação: build/TypeScript aprovados. Chrome desktop 1350×800 e celular 390×844: três fitas abertas pelo fluxo real; seis vídeos reproduzidos/avançados até 5s; duas capturas por fita carregadas e ampliação/fechamento testados; nenhum erro JavaScript. Requisição parcial do MP4 retornou HTTP 206. Evidências em docs/qa-preproduction/project-media-browser.json. Nenhuma alteração de código ou dependência foi necessária: os nove arquivos preenchem os caminhos existentes.
