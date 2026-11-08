# Os 7 sistemas do PDF — adaptação real à W1 Capital
**Fonte:** “7 sistemas pra montar com o Claude em 2 dias”, Matheus Tilli, 11 páginas, material datado de 23/10/2026, anexado pelo proprietário em 08/11/2026.
**Estado:** matriz de decisão e operação. Não há afirmação de que os sete sistemas foram implantados.

O material separa quatro ideias que podem ser iniciadas com recursos simples de três que exigem ferramenta, verificação ou geração externa; os tempos indicados são estimativas promocionais da fonte e não compromissos da W1. A fonte recomenda **terminar um sistema antes do próximo**, transformar prompts em instruções reaproveitáveis e não inventar lacunas.

## Sistema 1 — Máquina de carrossel
**Uso W1:** produzir conteúdo educativo que prove competência, com calendário de ideias e arte consistente.
**Entradas reais:** público, tema, prova, captura de projeto autorizada, referência visual, CTA, fatos confirmados.
**Etapas:** medir referência (cores/tipografia/margens/grade/slide a slide) → três opções de capa → copy enxuta → ilustrações/prints → revisão ortográfica e factual → aprovação → agendamento/publicação permitida.
**Artefato principal:** `creative/carrosseis/PLAYBOOK_W1.md`.
**Limite:** criar texto não equivale a operar um design real; não atribuir alta conversão apenas a uma capa bonita.
**Status:** método documentado, sem implantação de um editor automático validado neste registro.

## Sistema 2 — Segundo cérebro da empresa
**Uso W1:** uma fonte única de decisões, padrões, serviços, contextos e aprendizados para reduzir repetição entre engenharia, conteúdo e comercial.
**Estrutura sugerida:**
- `README.md`: mapa e índice de leitura;
- `creative/knowledge/`: decisões editoriais, benchmark, repertório e políticas;
- `creative/reels/`, `creative/carrosseis/`: padrões por formato;
- `scripts/creative-lab/`: ferramentas já existentes, dependências e como executar;
- `docs/operacao/` (se já houver, aproveitar; senão criar quando necessário): ofertas, jornadas, fluxo comercial e critérios de confirmação;
- `docs/decisoes/` e `docs/aprendizados/` (quando criados): registros datados, fonte, decisão, responsável, status, evidência.

**Regra:** instrução de setor mais específica prevalece sobre uma orientação genérica quando ambas são aplicáveis; não usar “memória” como licença para inventar dados.
**Segurança:** jamais transformar o repositório público em CRM de clientes, histórico de WhatsApp, chave de API, contrato ou documento pessoal; segredos em gerenciador apropriado e dados autorizados no Supabase.
**Status:** iniciada a camada documental persistente, NÃO um mecanismo de recuperação automática para todos os agentes.

## Sistema 3 — Criador de site
**Uso W1:** gerar página demonstrativa de empresa que deseja orçamento; apoiar venda dos serviços W1 com uma amostra coerente.
**Entradas:** serviço, público, dados públicos comprovados, cores, fotos com autorização, informações de contato e posicionamento.
**Saída:** uma landing mobile-first, manchete ligada ao benefício, formulário de até cinco campos, prova concreta e CTA visível no celular.
**Revisão:** fluxo do formulário testado, mensagem direcionada ao endereço empresarial correto quando configurado; rotas existentes preservadas; performance e acessibilidade verificadas; apontar conteúdo fictício como demo.
**Status:** deve reutilizar galeria e modelos do site W1, não implantar página duplicada por esta documentação.

## Sistema 4 — Máquina de anúncio
**Uso W1:** preparar e testar variações da oferta W1 e do LexisPredict.
**Fonte de pesquisa:** Biblioteca de Anúncios da Meta, respeitando termos de uso e informações efetivamente visíveis.
**Método:** anotar anúncio, data de início verificada, primeiro gancho, promessa, objeção e CTA; formar hipóteses; criar variações mudando **um aspecto de cada vez**.
**Limite importante:** tempo no ar é **indício de persistência**, não prova de lucratividade, ROI ou conversões. Não copiar frase/imagem alheia nem inventar métricas.
**Status:** estratégia documentada; campanha nova exige orçamento, aprovação e permissão de conta.

## Sistema 5 — Assistente pessoal/operacional
**Uso W1:** resumo do dia com prioridade para vendas, respostas de clientes, engenharia, marketing, eventos e candidaturas.
**Formato:** três prioridades com próxima ação, compromissos confirmados, até cinco respostas urgentes e contagem dos itens que podem aguardar.
**Fonte confiável:** Gmail, Calendar, registros e status conectados; declarar quando mensagens/dados não foram abertos.
**Integração existente:** já há automações de frentes W1/engenharia/conteúdo; **não criar rotina duplicada** sem verificar título, escopo, horário e consentimento.
**Status:** modelo de briefing documentado; não alterar automações por esta análise.

## Sistema 6 — Vídeo de imóvel
**Uso W1:** possível serviço futuro, não prioridade para vendas do LexisPredict.
**Método de produção:** organizar fotos por percurso natural (entrada → ambientes sociais → diferencial), um movimento de câmera por foto, duração e objetos que devem permanecer estáveis.
**Limite:** jamais adicionar móveis, pessoas, reflexos, vista da janela ou atributos ausentes da fonte. Seleção e geração de clipes podem exigir modelo pago por uso; não prometer gratuito ilimitado.
**Status:** oportunidade de serviço catalogada, não implementada.

## Sistema 7 — Agente de WhatsApp
**Uso W1:** atendimento e triagem comercial com regras claras; para operação jurídica, preservar revisão humana, sigilo e normas profissionais.
**Entradas:** canal autorizado, horários, serviços, limites de atuação, responsável por transferência, disponibilidade real de agenda e consentimentos.
**Método:** declaração transparente do que o agente pode/não pode; três perguntas de qualificação **uma por vez**; horário consultado antes de oferta; passagem para humano em situações complexas; recontato com limites.
**Dependências:** WhatsApp Business Platform/Cloud API oficial, requisitos vigentes de conta/número, templates e janelas de mensagem conforme documentação atual da Meta. A janela de 24h referida no PDF não substitui validação regulatória contemporânea.
**Restrições:** sem envio automático ao cliente até integração validada, autorização e registro. Sem prometer prazo, valor, resultado financeiro ou jurídico.
**Status:** especificação de alto nível documentada; API/webhook e automação real NÃO declarados ativos.

## Ordem de execução conforme o negócio W1
1. **Segundo cérebro documental:** fixa fonte e reduz recomeço.
2. **Carrosséis e Reels:** conteúdo e demonstração com qualidade de produção.
3. **Criador de site/demos:** evidência comercial para abordar clientes.
4. **Máquina de anúncio:** testar ofertas somente com orçamento/conta aprovados.
5. **Resumo operacional:** aproveitar automações existentes e reduzir redundância.
6. **WhatsApp oficial:** configurar apenas quando credenciais, consentimento e regras estiverem prontos.
7. **Imóveis:** opcional, quando houver demanda real.

**Importante:** esta ordem é uma adaptação estratégica da W1; o PDF original apresenta as sete ideias de forma independente.

## Perguntas verificáveis para cada sistema antes de chamar de “funcional”
- A fonte real dos dados está conectada e autorizada?
- O input é um contrato claro (campos obrigatórios e faltantes)?
- Há **uma saída testada** com caso real ou amostra permitida?
- Existe fluxo de falha e revisão humana?
- Custos, direitos e política de acesso estão conhecidos?
- Um log confirma o que foi executado, e o que ficou como hipótese?
- A pessoa consegue acessar o resultado pela **aba Projetos**, pelo painel correto ou por link efetivo?

## Restrições comuns, próprias da W1
- Meta principal: conseguir clientes e receita de serviços reais.
- Preserve repositório principal, site, AI Lab e aba Projetos; não duplicar funcionalidades.
- Manter a identidade W1 (vinho, prata e marfim) no site institucional.
- Não inventar trabalhos de clientes, depoimentos, estatísticas, resultados de decisões judiciais nem integrações técnicas.
- Sem publicação, alteração externa, contato ou candidaturas automáticas sem autorização no fluxo aplicável.
