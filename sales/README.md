# W1 Sales — componentes comerciais

A versão principal agora é o arquivo ../index.html, na raiz do repositório. A rota /sales/ redireciona para a principal. Para hospedagem, a raiz do projeto deve ser /, não sales/.

## Visual e experiência

- styles.css e studio.css são os fundamentos visuais.
- premium.css aplica o novo sistema de design vinho, marfim, coral e dourado, geometria e responsividade.
- premium.js gerencia a navegação mobile, metodologia interativa, acessibilidade e efeitos de entrada.
- favicon.svg é uma marca original, renderizada sem bibliotecas externas.
- app.js e core.js implementam o catálogo e o guia comercial por regras locais.

O design foi inspirado em padrões de composição e microinterações de Code and Chill, CodeXR e BuildIndex. Não houve cópia de componentes pagos. Respeita a redução de movimento preferida pelo usuário.

## Banco comercial — não ativado

sales/config.js permanece vazio. O assistente recomenda soluções e gera um resumo TXT sem coletar dados pessoais.

Para um formulário funcional:
1. Confirmar um projeto Supabase independente para leads comerciais.
2. Aplicar sales/supabase/001_sales_leads.sql apenas nesse projeto, nunca no LexisPredict.
3. Testar leitura bloqueada e inserção limitada por RLS.
4. Implantar rate limiting ou antispam do lado servidor, política de privacidade e retenção de dados.
5. Preencher apenas URL e chave pública do projeto em sales/config.js; nunca usar service_role.

O formulário não envia mensagens WhatsApp nem campanhas e não promete registro enquanto o banco estiver desconectado.

## Testes

    node --check sales/app.js
    node --check sales/premium.js
    node --test sales/core.test.mjs sales/site.test.mjs

Consulte ../README.md para publicação e demais detalhes.

## Pesquisa futura de empresas

O módulo `prospecting/` oferece pesquisa manual por CNPJ e CNAE + UF + cidade no Fichário, com validação local, sem coletar contatos nem acessar o Supabase. A arquitetura futura para uso da API/MCP, regras de privacidade e modelo de banco privado estão em [prospecting/README.md](prospecting/README.md). Sua publicação não equivale à ativação de um CRM de prospecção.
