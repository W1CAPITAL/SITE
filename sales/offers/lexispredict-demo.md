# LexisPredict — demonstração comercial de 12 minutos

**Versão:** 04/11/2026. **Finalidade:** reunião assistida com escritório jurídico interessado. **Pré-requisito obrigatório:** tenant de demonstração separado, com apenas dados sintéticos. **Não é prova de execução de teste E2E.**

## Preparar antes de convidar interessados

1. Abrir `https://lexispredict.vercel.app` e verificar se a sessão de **demonstração isolada** realmente existe. **Não usar a base operacional de clientes**; não transmitir dados, números, telefone, documentos, contratos ou partes reais.
2. Cadastrar dados fictícios com formato reconhecível para demonstrar apenas comportamento: `ESCRITÓRIO DEMONSTRAÇÃO`; cliente `CLIENTE FICTÍCIO A`; referência processual `0000000-00.0000.0.00.0000` **marcada explicitamente como exemplo, nunca CNPJ/CNJ válido**; tarefas `REVISAR DOCUMENTOS` e `RETORNO SIMULADO`.
3. Conferir perfil e permissões de exportação. Testar a ação antes da chamada. Se o ambiente de teste não estiver pronto, mostrar apenas material de marketing conceitual e informar que a demonstração ao vivo está indisponível.
4. Mostrar quais recursos são centrais e quais dependem de configuração. Não ativar WA.Auto, scanner ou IA durante a chamada para simular disponibilidade. Checar que a página de planos ainda não encaminha para checkout como se a assinatura estivesse pronta.

## Roteiro de reunião

| Tempo | O que mostrar | O que dizer | Evidência e limite |
| --- | --- | --- | --- |
| 0–2 min | Primeiro quadro e pergunta | “Onde sua equipe perde mais tempo: procurar informações, lembrar retornos ou consolidar relatórios?” | Ouvir a resposta antes de mostrar módulos |
| 2–4 min | `/processos` | “Aqui a equipe encontra a carteira, pesquisa um registro e acessa a situação cadastrada.” | Usar caso fictício; movimentação externa só se houver confirmação |
| 4–6 min | `/tarefas`, `/agenda` e retornos | “O acompanhamento fica vinculado a uma tarefa, com responsabilidade e próximo passo.” | Salvar tarefa de teste e confirmar leitura; não criar atendimento fictício real |
| 6–8 min | `/fases-provas` | “A triagem ajuda a localizar referências de fases processuais. O resultado precisa ser conferido nos autos.” | Não afirmar certeza, decisão ou prognóstico judicial |
| 8–10 min | Exportação de carteira ou `/report/completo` | “Você pode consolidar dados e relatórios com permissões adequadas.” | Mostrar XLSX/CSV e PDF **somente se funcionarem** com conjunto completo e perfil autorizado |
| 10–11 min | `/planos` e perguntas sobre módulos | “Existem pacotes com funções jurídicas, financeiras e integrações. Vamos selecionar o necessário.” | DataJud/DJEN, IA e WA.Auto dependem de validação e configuração; não vender indiscriminadamente |
| 11–12 min | Proposta e encaminhamento | “Se fizer sentido, preparo uma proposta com escopo, preço e implantação confirmados pela W1.” | Pedir autorização para retorno e registro no CRM comercial separado |

## Perguntas de fechamento

- Quantos profissionais precisam acompanhar a carteira?
- Qual ferramenta usam hoje e qual problema ocorre com mais frequência?
- Quantos registros pretendem acompanhar ou migrar? (Estimativa não é limite técnico prometido.)
- Existe uma rotina semanal de revisão dos casos e retorno ao cliente?
- Quem decide pela contratação e quando poderia revisar uma proposta?

## Respostas honestas para objeções

**“O sistema atualiza automaticamente tudo nos tribunais?”**  
“Há componentes de consulta DataJud/DJEN, mas eles dependem da cobertura e disponibilidade das fontes. Não vendemos atualização universal ou em tempo real sem validação.”

**“O WhatsApp já envia sozinho?”**  
“Há uma integração WA.Auto, mas na última verificação o aparelho não estava vinculado. O uso deve ser demonstrado e autorizado antes de entrar em qualquer contrato.”

**“Vocês garantem que a IA não erra?”**  
“Não. Análises e triagens são auxiliares e exigem revisão humana. Não substituem o profissional responsável.”

**“Posso pagar e acessar imediatamente?”**  
“O produto tem cadastro e tela de planos, mas o fluxo de assinatura e ativação automática ainda está sob revisão. Uma implantação assistida depende de confirmação de contrato, pagamento e validação técnica.”

**“Já existem escritórios clientes pagantes?”**  
“Temos dados de uso operacional no banco, mas essa auditoria não verificou contratos ou recebimentos de assinantes; não vamos inventar uma quantidade de clientes.”

## Proposta de encerramento, para uso humano

“Pelo que você descreveu, o desafio principal é **[problema informado]**. Minha sugestão inicial é o **[plano compatível]**, porque ele contempla **[funcionalidades realmente demonstradas]**. Posso preparar uma proposta com implantação, condições, limites e acompanhamento; a W1 confirma tudo antes de contratar. Você prefere receber esse resumo para análise?”

## Gatilhos de NÃO demonstrar

- Conta com acesso à carteira real de terceiros, ou pessoa/organização sem autorização.
- Qualquer papel com acesso maior do que o previsto em teste com dois tenants.
- Informação sensível ou documento de cliente na tela.
- Exportação falhando, relatório parcial sem aviso ou banco indisponível.
- Interface de pagamento/cadastro que aparenta funcionar, mas depende de tabelas ausentes.
- Qualquer módulo externo desativado apresentado como ativo.
