# W1 Capital · AI Lab criativo (08/11/2026)

Registro permanente das ferramentas e caminhos de integração para o **AI Lab já existente no LexisPredict** e para o **W1 Reel Studio** neste repositório. Este catálogo não é uma nova instalação do Next.js nem substitui a aba **Projetos** do portfólio, que permanece em `/portfolio/?tab=projetos`.

## Situação verificada

| Ferramenta | Situação no projeto W1 | O que pode fazer |
| --- | --- | --- |
| Open-Higgsfield | Gateway do AI Lab existente, geração condicionada à configuração e autorização | Gerar cenas; exportar MP4 para edição |
| Open Genjutsu ×3 | Código upstream estudado; serviço externo privado | Transferência de movimento, exportação e revisão de clipe |
| VoiceStudio | Cliente localhost do Reel Studio existente; serviço de voz separado | Fornecer WAV de narração revisada |
| **Hypit** | **Instalador privado incluído**; executável não implantado no Render/Vercel | Compor vídeos, animações, legendas, efeitos e templates |
| **AI YouTube Shorts Generator** | **Instalador privado incluído**; execução depende de API ou recursos locais | Extrair cortes de vídeo autorizado, transcrever e formatar 9:16 |
| **MotionSmith MCP** | URL registrada, **endpoint não verificado/conectado** | Não invocar antes de confirmar documentação, autenticação e ferramentas |
| **MotionSmith Pro V2** | **Instalação manual fora do site** | Plugin para Unreal Engine 5.8 Sequencer; Windows 64-bit e CUDA |

O código fonte do MotionSmith Pro V2 **não** está no repositório indicado, que apresenta o produto do Fab. O endpoint `https://motionsmith.miftahul.com/api/mcp` foi informado separadamente; **não foi possível demonstrar** que pertence ao mesmo produto nem validar suas capacidades. Não há chaves ou tokens publicados no código W1.

## Instalação opcional em um worker **privado**

O site no Render é estático. A Vercel do LexisPredict não deve baixar modelos, executáveis ou bibliotecas de edição durante seu build. Execute o seguinte **somente** em máquina, VM ou container privado de sua organização, depois de revisar os repositórios e as licenças:

```bash
# Requer: git; Node >= 22.15, pnpm e FFmpeg para Hypit;
# Python >= 3.10 para AI YouTube Shorts Generator.
export W1_CREATIVE_INSTALL=yes
bash scripts/creative-lab/install-private.sh all

# Para adicionar o modo local pesado de Shorts, execute em worker capaz de
# usar ffmpeg/Whisper; pode exigir grande espaço em disco e memória:
W1_SHORTS_LOCAL=yes bash scripts/creative-lab/install-private.sh shorts
```

O instalador usa os commits exatos identificados em 08/11/2026:
- Hypit `2d31e88765e297f0795348b460c77a6067f12261`
- AI YouTube Shorts Generator `13451d439b71643bd3e9df091e0f3ca786610dc9`

O script recusa sobrescrever instalação existente de versão diferente. Por padrão, instala o Shorts em modo API leve, **sem ativar créditos** ou gerar um vídeo. O modo local exige dependências Python adicionais e FFmpeg; mesmo nele, a seleção de trechos pode usar API LLM. Hipit/Hypit usa serviços de modelos opcionais, que podem cobrar. Não armazenar chaves em GitHub ou arquivos públicos.

### Licenças e limites

- Hypit: licença Apache 2.0 **modificada**. Permite uso interno e trabalhos próprios/para clientes dentro da organização; **proíbe redistribuição comercial e SaaS multiusuário com o código** sem licença comercial.
- Shorts Generator: MIT; respetivos fornecedores de transcrição, vídeo e modelos têm termos/custos próprios.
- VoiceStudio: AGPL-3.0, mantido como serviço independente.
- MotionSmith Unreal: instalar pelo Fab, conforme regras próprias; requer Windows 64-bit, UE5.8 e NVIDIA CUDA.

## Fluxo para Reels W1, inclusive aba Projetos

1. Planeje e registre no **projeto autoral W1 Reel Studio**, agora listado na aba **Projetos** do portfólio sem remover os demais projetos.
2. Capture o site/serviço **real** W1 com dados sensíveis ocultados. Use vídeos reais para qualquer trecho que prove funcionalidades.
3. Para composição ou geração, use Hypit/Open-Higgsfield/Genjutsu apenas onde houver acesso válido e exporte MP4 licenciado. O MotionSmith Pro pode entregar vídeo 3D exportado manualmente do Unreal.
4. Para cortes curtos, processe somente vídeo próprio/licenciado no Shorts Generator e registre o resultado como fonte de vídeo real quando couber.
5. No `scripts/reel-studio/studio.mjs`, marque `sourceTool: "Anil-matcha/AI-Youtube-Shorts-Generator"` para cortes reais aprovados, ou `provider: "hypit-ai/hypit"` com `kind: "generated"`, `fullClipReviewed: true`, direitos e legenda indicando "Cena ilustrativa".
6. Finalize a edição real no FFmpeg com narração pt-BR aprovada, música e Foley autorizados, e revise no celular antes de qualquer publicação.

Validação:

```bash
bash -n scripts/creative-lab/install-private.sh
node --test scripts/creative-lab/registry.test.mjs
node --test scripts/reel-studio/studio.test.mjs
node --test portfolio/site.test.mjs
```

Nenhum comando do catálogo executa geração paga, conecta MCP externo, publica vídeo ou acessa dados jurídicos. O registro é utilizável como ponto de partida persistente; **não equivale a instalar dependências em um servidor que não esteja provisionado**.
