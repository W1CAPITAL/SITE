# W1 Sales Studio — site comercial leve

Uma experiência comercial da W1 Capital com navegação responsiva, identidade vinho/creme/coral, cartões e escritório estilizado em CSS, microanimações e uma consulta guiada em três etapas. **Zero bibliotecas e zero requisições a modelos de IA.**

## Onde está

- Pasta `sales/` do repositório `W1CAPITAL/SITE`.
- O portfólio pessoal na raiz (`index.html`) foi **preservado**.
- O arquivo `sales/index.html` serve como entrada estática em um servidor HTTPS. Os arquivos são relativos, então a aplicação funciona na raiz de um domínio próprio ou no caminho `/sales/`.
- Para conferir localmente, use `python3 -m http.server 8080` a partir da raiz e abra `http://localhost:8080/sales/`. Não abra o HTML via `file://`: módulos JavaScript locais podem ser bloqueados pelo navegador.
- Para testes automáticos sem dependências: `node --test sales/core.test.mjs sales/site.test.mjs` e `node --check sales/app.js`.

## Padrões visuais

Referências consultadas: https://codeandchill.store, https://topmate.io/code_xr, https://buildindex.dev.

Todas as formas, tipografia CSS, microinterações e personagens geométricos foram implementados do zero, **sem copiar componentes pagos**. O texto da página evita depoimentos fictícios, números de vendas inventados e garantias de resultado. Transições obedecem `prefers-reduced-motion` e entradas em scroll não exigem processamento de IA.

## O que funciona agora

- Catálogo inicial de quatro linhas: LexisPredict, gestão comercial, automações e indicadores, **sujeito a disponibilidade e confirmação humana**.
- Assistente por regras locais para entender necessidade e porte, explicar a indicação e apresentar um próximo passo.
- Modo demonstração: caso o banco comercial ainda não esteja configurado, **nenhum dado pessoal é solicitado ou enviado**. É possível baixar um resumo de triagem em TXT.
- Modo formulário: somente se `sales/config.js` tiver credenciais públicas de um Supabase **comercial e separado**, a pessoa poderá, após consentimento explícito, informar nome, e-mail e contexto resumido.
- Os dados de leads não são lidos no navegador; a tabela tem RLS de `INSERT` anônimo e não concede `SELECT`, `UPDATE` nem `DELETE`.

## Banco comercial — ainda não ativado

**Não executar o SQL no Supabase do LexisPredict.** Os projetos Supabase encontrados como possíveis candidatos estavam inativos e não puderam ter seu conteúdo inspecionado; nada foi alterado neles.

1. Escolher ou ativar projeto Supabase exclusivo para marketing/vendas, validando existência de dados e cota gratuita.
2. Executar `sales/supabase/001_sales_leads.sql` **somente nesse projeto**.
3. Testar RLS com usuário anônimo e confirmar que a API aceita exclusivamente `POST` de lead com consentimento; `GET` não deve retornar dados.
4. Antes de liberar publicamente o formulário, adicionar proteção anti-spam / rate-limit no servidor ou edge (honeypot do cliente sozinho não basta). Validar a política de privacidade e retenção de dados.
5. Configurar **apenas** a URL do projeto e sua chave **publishable pública** em `sales/config.js`. Nunca inserir chave `service_role`, token privado ou dados jurídicos.

Enquanto isso, o modo demonstrativo está pronto e é deliberadamente honesto sobre a ausência de backend.

## Hospedagem sem licença adicional

A Cloudflare Pages oferece plano gratuito para hospedar assets estáticos com limites de builds. Para um projeto conectado ao GitHub, configurar:

- Repositório: `W1CAPITAL/SITE`
- Branch: `main`
- Diretório raiz: `sales`
- Comando de build: deixar vazio, se o painel permitir; caso exija, usar `echo static`
- Diretório de saída: `.`
- Rota pública: raiz do domínio fornecido pela Cloudflare

O GitHub Pages não deve hospedar este site comercial: a documentação do GitHub restringe uso como hospedagem gratuita de negócios e e-commerce. É possível usar a infraestrutura de Cloudflare Pages ou Workers Static Assets dentro das cotas gratuitas. Um domínio próprio pode ter custo separado.

## Limites e próximos passos

A consulta é **determinística**, não uma integração automática ao ChatGPT. Os três “agentes” são papéis do fluxo, não três IA externas autônomas. Para criar envio de propostas, operação de vendas ou painel interno de leads, integrar o backend comercial de maneira autenticada após definir usuários e permissões. Não há envio autônomo de WhatsApp, disparos em massa ou aprovação automática de propostas.
