# Portfólio profissional — Davi Alves Figueredo

Redesign das sete abas do portfólio existente em `/portfolio/`, com identidade vinho, grafite, marfim e champanhe. Textos e controles são HTML; a imagem editorial é somente decorativa. O currículo original permanece em `assets/Curriculo_Davi_Alves_Figueredo.pdf`.

## Navegação e contato

- As abas usam `?tab=...`, com navegação progressiva pelo histórico do navegador e links que também funcionam ao abrir em outra guia.
- Navegação móvel com menu, foco visível, atalho para conteúdo e fechamento pelo Escape.
- Animações de entrada respeitam `prefers-reduced-motion`.
- Formulário valida os campos e prepara uma URL `mailto:` codificada. O usuário revisa e envia a mensagem no seu aplicativo de e-mail; não há endpoint de coleta.
- Contatos e experiência mantidos do portfólio anterior. O perfil descreve operações jurídicas, backoffice e tecnologia, sem apresentar registro de advogado ou qualificações não informadas.

## Verificação

`node --check portfolio/script.js`

`node --test portfolio/site.test.mjs`

Conferência manual no navegador: sete abas, seleção da aba ativa, histórico, menu móvel, campos de contato e download do currículo. Prévia responsiva em viewport de iframe com 320, 390, 768 e 1024 pixels, além do desktop.

## Imagem editorial

`assets/portfolio-sculpture.webp`: imagem criada com geração de imagem integrada, 1536 × 1024, convertida para WebP (aproximadamente 150 KB). Tema: arcos metálicos escovados, pedra vinho, vidro e papel, sem pessoas, marcas ou texto. A imagem não representa um escritório real ou retrato pessoal.
