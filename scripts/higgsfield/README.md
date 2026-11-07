# W1 Capital — cliente Open-Higgsfield para Reels

Cliente de linha de comando em `scripts/higgsfield/render.mjs`. Não adiciona modelos grandes ao site, não mistura o backend de geração com páginas públicas e não promete vídeo gerado se não há provedor.

Origem e licença: https://github.com/TechBeme/open-higgsfield (MIT, Copyright 2026 TechBe). O código W1 usa endpoints públicos upstream, sem redistribuir seus componentes.

## Configurar
O upstream Open-Higgsfield é um workspace sem login próprio. Hospede em instância **privada** protegida por Cloudflare Access e provedor com orçamento/cotas. Configure seu host conforme https://github.com/TechBeme/open-higgsfield/blob/main/docs/production.md com armazenamento e worker duráveis, `APP_ORIGIN`, `GENERATION_ENABLED` e credencial do provedor. 

Em seu runner/terminal autorizado (NUNCA no JavaScript público ou no GitHub):
```sh
export OPEN_HIGGSFIELD_BASE_URL="https://studio.suaempresa.com.br"
export OPEN_HIGGSFIELD_ACCESS_CLIENT_ID="<service-token-id>"
export OPEN_HIGGSFIELD_ACCESS_CLIENT_SECRET="<service-token-secret>"
export OPEN_HIGGSFIELD_GENERATION_ENABLED=false
```
Não use chaves de API no código, issues, commits, argumentos ou nos logs. Um hostname remoto sem Cloudflare Access configurado é recusado pelo cliente. Use HTTPS.

## Comandos
```sh
node scripts/higgsfield/render.mjs doctor
node scripts/higgsfield/render.mjs models
# Após validar credenciais, cotas e permissões e ativar a geração no upstream:
OPEN_HIGGSFIELD_GENERATION_ENABLED=true node scripts/higgsfield/render.mjs generate "ID_DO_MODELO" "Uma cena documental com cortes rápidos, sem texto na imagem" 5 9:16
node scripts/higgsfield/render.mjs status "TASK_ID"
node scripts/higgsfield/render.mjs download "TASK_ID" "./reel.mp4"
node --test scripts/higgsfield/render.test.mjs
```

Geração explícita pode ter custo no provedor. Não há reenvio automático. O MP4 gerado é B-roll e não prova funcionalidades do LexisPredict; para mostrar a plataforma ou sites, use captura real. Editar e adicionar narração natural, legendas corretas e som com mixagem apropriada são etapas separadas.

O cliente só se torna executável pelo ChatGPT em um ambiente com processo/runner autorizado e credenciais provisionadas. Criar arquivos no GitHub não cria automaticamente ferramenta de execução nem saldo de geração.
