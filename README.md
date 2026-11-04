# W1 Capital — W1 Sales Studio

Site institucional e comercial premium da W1 Capital em HTML, CSS e JavaScript nativos. Sem frameworks, bibliotecas de animação, Ollama ou API paga de IA.

## Entrega

- Página principal do antigo portfólio substituída integralmente por uma experiência comercial. A versão anterior é recuperável pelo histórico Git.
- Visual autoral vinho, marfim, coral e dourado, composição editorial geométrica e transições suaves.
- Catálogo: LexisPredict, CRM, integrações/automações e indicadores.
- Destaque LexisPredict com acesso à plataforma e painel conceitual claramente identificado, sem expor dados reais.
- Fluxo interativo de metodologia, menu mobile acessível e navegação por teclado.
- Consulta guiada por regras: necessidade, tamanho da equipe, recomendação; resumo TXT sem pedir dados pessoais.
- Formulário de lead com consentimento preparado, mas **inativo** até configurar um Supabase comercial independente e proteção anti-spam.
- FAQ, SEO social, favicon original e respeito à preferência de movimento reduzido.

## Arquitetura

| Arquivo | Responsabilidade |
| --- | --- |
| index.html | Página pública principal |
| sales/styles.css | Estilos estruturais |
| sales/studio.css | Camada visual da primeira versão |
| sales/premium.css | Design premium e responsividade |
| sales/core.js | Recomendações e validações |
| sales/app.js | Catálogo, consulta e exportação TXT |
| sales/premium.js | Mobile, animações acessíveis e método interativo |
| sales/config.js | Configuração pública vazia por padrão |
| sales/supabase/001_sales_leads.sql | Migração para banco comercial separado |
| sales/index.html | Redirecionamento da antiga rota /sales/ |
| .github/workflows/w1-sales.yml | Testes e checagem de sintaxe |

## Validar

Executar na raiz, com Node.js 22 ou superior:

    node --check sales/core.js
    node --check sales/app.js
    node --check sales/premium.js
    node --test sales/core.test.mjs sales/site.test.mjs

Para visualizar localmente:

    python3 -m http.server 8080

Abrir http://localhost:8080/ .

## Publicação

É uma aplicação estática. Uma hospedagem com plano gratuito que permita **uso comercial**, como Cloudflare Pages dentro de suas cotas, pode servir o conteúdo. Conecte o repositório W1CAPITAL/SITE na branch main, sem framework ou build, configurando o **diretório raiz do repositório** e output ".". A pasta sales deixou de ser a raiz de deploy. Um domínio próprio pode custar à parte.

Fazer merge não significa que exista hospedagem pública vinculada. Nenhum domínio público será considerado publicado sem confirmação do provedor.

## Privacidade e escopo

A configuração Supabase continua vazia, portanto a experiência está em modo demonstração. Nenhum lead é salvo; as duas perguntas do assistente funcionam apenas no navegador. O banco jurídico do LexisPredict não é usado.

Para captação real, validar projeto Supabase comercial distinto, executar a migração apenas nele, testar RLS e adicionar proteção contra spam, política de privacidade e canal comercial real. Nunca inserir chaves privadas na página pública.

As soluções são apresentadas sem preço fixo, garantias ou depoimentos fictícios. As recomendações são determinísticas, não respostas de um modelo GPT integrado. Contratação e atendimento humano exigem confirmação da equipe.
