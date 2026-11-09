# W1 Capital — política e proveniência da voz do titular (09/11/2026)

## Fato confirmado pelo titular
O titular **Davi Alves Figueredo** declarou explicitamente nesta conversa que as gravações originais fornecidas são de sua própria voz e que a amostra limpa de aproximadamente **9,07 segundos**, utilizada como referência de clonagem em uma produção anterior, é **dele também**. O titular autoriza o uso da própria voz para a recriação de seus vídeos W1. Isso é uma declaração do proprietário e não uma avaliação biométrica independente.

## Referências privadas de áudio
O acervo privado da W1, fora do GitHub público, contém:
`/Central W1 Capital - ChatGPT/Materiais de vídeo/Referencias privadas de voz/W1_REFERENCIAS_PRIVADAS_DE_VOZ_VERIFICADAS.zip`.

O pacote foi inspecionado, gerado com amostras originais e possui manifesto de integridade. Inclui:
- `00_VOZ_USUARIO_REFERENCIA_9s.wav`: voz limpa original confirmada, **9,073 segundos**, mono, 48 kHz PCM 24 bits. **Referência principal** para o próximo modelo de voice cloning.
- `01_VOZ_USUARIO_ADICIONAL_4s.wav`: arquivo novo `PTT-20261108-WA0004.zip`, **4,513 segundos**, convertido de OPUS para WAV sem alteração intencional de pitch/formantes.
- `02_VOZ_USUARIO_ADICIONAL_9s.wav`: arquivo novo `PTT-20261108-WA0005.zip`, **9,354 segundos**, convertido de OPUS para WAV sem alteração intencional de pitch/formantes.

**NÃO** mover amostras para repositório público, dependência web, logs, artifacts públicos, site hospedado ou bases de treinamento de terceiros sem análise de privacidade/autorização específica. O ZIP privado tem o manifesto SHA-256 para confirmar bytes na preparação da locução; não representa uma identidade biométrica comprovada.

## Master do Reels — status de 09/11/2026
`/Central W1 Capital - ChatGPT/Materiais de vídeo/W1_VoiceStudio_Contraste_41s_NAO_DUBLADO.mp4` é o vídeo com o contraste corrigido (aprox. **40,933 s**, **720×1280**, H.264/AAC), com branco, preto, laranja e detalhes azul/oliva. **Ele NÃO contém narração nova clonada com a voz do titular**; a trilha/efeitos presentes não justificam dizer que sua voz já está no MP4. A próxima versão final só será considerada dublada depois de gerar, montar e **auditar** a voz no próprio arquivo exportado.

## Caminho obrigatório para dublagem (não pular)
1. Buscar primeiro motor já implantado na infraestrutura privada da W1. Os fluxos anteriores mencionaram Chatterbox Multilingual e VoiceStudio, mas **um workflow/código no GitHub não equivale a serviço gerador em execução**. Registrar motor real, modelo/versão e hora da geração.
2. Usar a amostra principal de 9,07s (ou outra das fontes privadas autorizadas mediante validação acústica). Clonar/sintetizar novas falas em pt-BR para o roteiro completo da cena; não concatenar mensagens de voz aleatórias e anunciar como narração do roteiro.
3. Preservar todos os cortes do master; substituir apenas a fala; checar se a antiga narração foi realmente removida; manter foley/trilha em volume adequado. Escutar o arquivo completo e comparar o timbre com a referência fornecida.
4. Validar pronunciamentos, inteligibilidade no celular e duração; registrar se há problemas ou diferenças de voz; só publicar após aprovação humana e confirmação de direitos.

**Regra de qualidade:** nunca afirmar “voz clonada”, “mesma voz”, “narrado por Davi” ou “final com voz” sem áudio efetivamente gerado, inserido, ouvido e validado. Dizer “referência vocal de Davi recuperada” é correto. Caso o motor esteja inacessível, informar **PENDENTE**, sem criar promessa de arquivo pronto.

## Memória e continuidade
Este arquivo é o registro durável, versionado, para todos os fluxos da W1 Capital, Reel Studio, AI Lab e aba Projetos. Ele **não é** um botão que altera o resumo de Memória do ChatGPT; o usuário pode revisar esse resumo em **Configurações → Personalização → Memória → Gerenciar**. Referências brutas ficam apenas no acervo privado e não nos documentos GitHub.
