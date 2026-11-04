# W1 Capital — SEO, GEO e conteúdo comercial verificável

Base no guia fornecido \`Guia_Claude_SEO_Agent_Skill.pdf\` / \`.docx\` (4 páginas) e na referência original [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo). Como o projeto original evolui rapidamente, **números de agentes, versões, requisitos e comandos do PDF podem estar defasados**; verificar o README atual antes de instalar.

## O que já foi implementado no SITE

- Descrição e título editorial, Open Graph, idioma \`pt-BR\`, estrutura semântica e links internos.
- JSON-LD estruturado do tipo \`Organization\` e \`SoftwareApplication\` (LexisPredict), sem avaliações, receitas, preços ou dados empresariais não verificados.
- [Auditoria offline](../sales/seo/audit.mjs) com verificações refutáveis: título, descrição, H1, âncoras, contexto do produto, Schema.org, acessibilidade básica.
- [Testes](../sales/seo/audit.test.mjs) que falham com âncoras inválidas, marcação não parseável ou falta de título.
- Gerador de sitemap **somente com URL HTTPS que a W1 tenha confirmado**. Não publicar \`example.org\` nem inventar um domínio. O sitemap só inclui a homepage; \`/sales/prospecting/\` e outras ferramentas manuais não são conteúdo orgânico.
- SEO sem dependências npm, navegador headless, Claude Code ou APIs pagas.

### Validação local

Com Node 22+ na raiz:

    node sales/seo/audit.mjs
    node --test sales/seo/audit.test.mjs

Esse script é uma **checagem de código-fonte**, não uma auditoria ao vivo. Não mede Google Search Console, indexação, Core Web Vitals, ranking ou citações por IA.

## Pendências que dependem da publicação real

1. **Domínio e deploy:** comprovar endereço público HTTPS e página correspondente à \`main\`.
2. **Canonical / sitemap:** adicionar URL canônica à homepage e gerar sitemap somente com domínio verificado.
3. **Robots / indexação:** revisar robots.txt e noindex da homepage e das ferramentas manuais; verificar o que realmente está servido no provedor.
4. **Performance:** medir Lighthouse, LCP, CLS e INP em dispositivos reais, especialmente celulares modestos.
5. **Search Console / analytics:** conectar somente após autorização, política de cookies/privacidade adequada e controle de credenciais.
6. **Conteúdo:** organizar clusters com páginas reais sobre processos jurídicos, CRM, automação, indicadores e demonstração do LexisPredict; sem páginas artificiais em escala para manipular resultados.
7. **GEO / IA:** melhorar clareza de entidades, perguntas objetivas e explicações verificáveis. Não prometer citação por IA.
8. **E-E-A-T:** incluir autoria/credenciais e dados institucionais somente quando confirmados; depoimentos e cases apenas com comprovação e autorização.

## Plano refutável, inspirado no guia

| Achado potencial | Dependência | Teste de falha | Indicador |
| --- | --- | --- | --- |
| Links internos quebrados | HTML e JS | Teste offline retorna \`BROKEN_ANCHOR\` | Erros de âncora = 0 |
| Schema.org não confiável | Dados reais de produto | JSON-LD não parseia ou contém avaliação inventada | Blocos válidos sem alegações falsas |
| Baixa descoberta orgânica | Domínio indexável e conteúdo útil | Nenhuma página indexada no Search Console | Impressões e páginas indexadas reais |
| Carregamento lento | Site implantado | Métricas reais de CWV fora do alvo | LCP, INP e CLS medidos |
| Baixa conversão | Funil e consentimento reais | Visitantes não entendem CTA ou abandonam a consulta | Conclusão da consulta sem números simulados |
| GEO deficiente | Conteúdo verificável e atribuição | Respostas de IA citam informações incorretas | Revisão manual de citações com fonte |

## Opcional: execução do Claude SEO original

O guia descreve os comandos \`/seo audit <url>\`, \`/seo technical <url>\`, \`/seo schema <url>\`, \`/seo geo <url>\` e \`/seo plan saas\` usando **Claude Code**. Eles não foram instalados nem executados na W1. Mesmo que o plugin seja open source, o uso de modelos Claude/serviços e infraestrutura pode ter custos e não é garantido gratuito ou leve para o PC da empresa.

O material fornecido deve orientar o checklist e as prioridades, mas um relatório completo precisa do site publicado e das ferramentas reais de medição.
