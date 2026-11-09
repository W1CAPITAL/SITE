# W1 Capital / AI Lab — Higgsfield Skills e Virality Predictor
Atualização: 09/11/2026. Escopo: preparação e análise de ganchos de vídeo sem publicar, subir mídia privada ou consumir créditos automaticamente.

## O que a Higgsfield realmente oferece
- Repositório oficial de habilidades: https://github.com/higgsfield-ai/skills
- Habilidade de análise/generation: higgsfield-generate, que mapeia Virality Predictor para o modelo de análise brain_activity.
- Página da ferramenta: https://higgsfield.ai/apps/virality-predictor
- Input: vídeo final ou abertura de até 15 segundos. Output: estimativas de engajamento, momento do gancho, retenção (hold rate) e relatório de atenção. O score é modelado; não garante alcance nem viralização.
- A habilidade e o CLI não são modelos locais nem autorização automática de API. Requer conta/sessão Higgsfield válida; chamadas podem ter custo.

## Fluxo W1 — antes de publicar
1. Validar legendas palavra por palavra contra a NARRAÇÃO que foi realmente sintetizada, e checar cada trecho no MP4. Não reutilizar roteiro antigo com voz nova.
2. Conferir contraste de elementos brancos/cinzas, legibilidade móvel e cenas de movimento natural. Nunca usar GIF/slide como substituto da prévia real.
3. Manter voz humana natural, com pausas corretas, efeitos pontuais, música baixa e sem loop percussivo repetitivo. Verificar volume final.
4. Exportar os 15 segundos iniciais do MP4 final por:
   
       node scripts/reel-studio/virality-hook.mjs ./private/reels/final.mp4 ./private/reels/hook-15s.mp4

   O script NÃO envia o vídeo para serviços externos.
5. Para análise real, após autenticar o Higgsfield CLI em um ambiente privado e concordar com eventual custo, executar:

       higgsfield generate create brain_activity --video ./private/reels/hook-15s.mp4 --wait

   Ou enviar o trecho manualmente em https://higgsfield.ai/apps/virality-predictor.
6. Revisar engajamento modelado, ponto mais forte da abertura, perda de retenção, legibilidade, ritmo e divergência entre o que é dito e mostrado; criar uma segunda abertura somente com provas e recursos verdadeiros. Comparar clips de 15s no mesmo contexto.
7. Publicar somente com aprovação humana, direitos de mídia/voz, revisão das alegações e CTA atendível.

## Reels W1 de 09/11/2026 — rastreabilidade
- Vídeo de voz e dublagem com sete cenas e 21 legendas reconstruídas para o roteiro efetivamente submetido ao Chatterbox Multilingual.
- A última frase gerada era 6,02s para uma janela de 4,63s no job privado: a montagem local removeu 1,54s de pausas sem acelerar as sílabas. A terceira frase usou ajuste de tempo de aproximadamente 1,039x preservando pitch.
- Final H.264/AAC, 40,93s, 720x1280, medição local -14 LUFS e pico verdadeiro -1,6 dBFS.
- O MP4 e a voz gerada são materiais PRIVADOS entregues ao titular. Não armazenar arquivos ou links de conversa em GitHub público nem apresentar como publicados.
- Score do Virality Predictor: NÃO EXECUTADO. Avaliação por olho humano e teste automatizado NÃO são resultado de brain_activity.
- Alegações como “catorze motores” ou “roda direto no computador” precisam ser verificadas na ferramenta retratada antes de publicar; título interrogativo “Clonaram a ElevenLabs?” não constitui prova de clonagem da plataforma.

A aba Projetos organiza metodologia e produtos reais. A integração da skills não implica instalação de modelos, autenticação Higgsfield, habilitação de cobrança, geração de vídeo ou avaliação de alcance em produção.
