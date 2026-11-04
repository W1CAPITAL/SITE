# W1 Sales + Fichário — estudo e integração futura para prospecção

**Referência solicitada:** https://cnpj.genesisinnovation.io/cnpj/48659344000133

Fornecedor: [Fichário — Genesis Innovation](https://cnpj.genesisinnovation.io/), **não** é API oficial da Receita Federal. Esse endereço é exemplo de pesquisa, **não** um lead importado ou uma autorização de contato.

## O que a fonte oferece

Documentação: https://cnpj.genesisinnovation.io/api  
Termos: https://cnpj.genesisinnovation.io/termos

Em 04/11/2026, a documentação informava:

- Consulta por CNPJ: `GET /api/v1/cnpj/{cnpj}`.
- Pesquisa por nome: `GET /api/v1/busca?q=...`.
- Pesquisa avançada: `GET /api/v1/busca-avancada?uf=SP&cnae=4781400`, com cidade e porte.
- CSV na busca avançada: `formato=csv`, sujeito a cotas próprias.
- Servidor MCP: `https://cnpj.genesisinnovation.io/mcp`.
- Cota gratuita anunciada: **60 requisições por minuto e 3.000 por dia, por IP**. Exportação CSV também tem limites; consultar a página da API antes de qualquer automatização.
- Dados cadastrais podem estar desatualizados. O fornecedor informa base de Receita de outubro de 2026. Confirme na fonte oficial quando necessário.

**Crédito obrigatório nas consultas derivadas:**

> Fonte: Fichário (cnpj.genesisinnovation.io), dados abertos da Receita Federal

Os termos atuais proíbem raspagem em massa, redistribuição comercial da base, contorno de limites, spam e telemarketing abusivo. Não assumir que um registro público pode ser usado para envio de mensagens. Respeitar LGPD, pedidos de oposição e política de privacidade.

## O que foi implementado agora

- `sales/prospecting/index.html`: ferramenta de **pesquisa manual**, com interface vinho/creme e formulários por CNPJ ou CNAE + UF + cidade + porte. É uma página estática e não autenticada; não deve ser tratada como painel privado.
- `sales/prospecting/fichario.js`: verificação dos dígitos de CNPJ, URLs documentadas e estrutura de registro de empresa em **estado de pesquisa**, com consentimento/contato sempre desabilitados.
- `sales/prospecting/workspace.js`: abre a consulta no Fichário em nova aba. Sem fetch, scraping, cookies, localStorage, contatos ou persistência.
- `sales/prospecting/fichario.test.mjs`: valida CNPJ, filtros, segurança e ausência de coleta automática.
- `sales/supabase/002_company_research_future.sql`: **modelo preparado, não executado**. Tabela com RLS ativa e **nenhuma permissão pública**; acesso privado dependerá de autenticação e backend apropriados.

O exemplo de CNPJ fornecido pelo usuário é usado apenas como teste de validação da estrutura. **Não identifiquei nem salvei a empresa associada ao CNPJ.**

## Próxima fase (somente após ativação do banco comercial)

1. Identificar e ativar um projeto Supabase independente para o W1 Sales, sem ligação com o LexisPredict.
2. Aplicar os esquemas em um projeto novo e testar os controles RLS e papéis internos, sem acesso público à pesquisa.
3. Criar um backend autenticado de consultas pontuais à API, com cache, limites abaixo das cotas publicadas, tratamento de HTTP 429 e atribuição da fonte.
4. Registrar no CRM a origem, data e base dos dados públicos, distinguindo **empresa pesquisada**, **oportunidade qualificada**, **lead que solicitou contato** e **cliente**.
5. Revisar cada empresa e adequação do produto antes de apresentar proposta. Contato por e-mail/WhatsApp somente com fundamento apropriado e respeito a opt-out; nada de disparos não solicitados.
6. Adicionar métricas reais (pesquisadas, qualificadas, em contato, demonstrações, vendas efetivas) sem simular conversões ou fabricar resultados.

## Uso local sem computador potente

Inicie um servidor estático na raiz:

    python3 -m http.server 8080

Acesse http://localhost:8080/sales/prospecting/

A pesquisa é aberta no próprio site externo do fornecedor e não exige Ollama, API paga de IA nem processamento local pesado. Sem acesso a uma hospedagem comercial vinculada ao repositório, **não há URL de produção confirmada**.

## Limites

Esta implementação **não é um robô de captação automática**; é a preparação técnica e uma estação de pesquisa manual. Não redistribui dados do Fichário, não armazena dados de pessoas, não simula aprovação jurídica e não utiliza o banco processual.
