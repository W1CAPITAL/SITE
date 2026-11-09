# Projetos de vídeo — W1 Capital — 08/11/2026

## Onde estão os arquivos
Acervo privado persistente no ChatGPT: `/Central W1 Capital - ChatGPT/Materiais de vídeo`.

- `W1_Automacao_30s_Voz_Davi_Projeto.mp4` — cópia de trabalho do vídeo de 30s que já existia no acervo. Arquivado como “Voz Davi” na biblioteca; não declarar identidade vocal natural comprovada ou aprovação de publicação.
- `VoiceStudio_Referencia_75369_revisao.mp4` — original fornecido pelo responsável (aprox. 41s, H.264/AAC, 720x1280) sobre VoiceStudio. A dublagem solicitada com a voz de Davi **não está concluída**.
- `VoiceStudio_75369_Status_De_Dublagem.txt` — status da entrega e origem da mídia.
- As amostras privadas de voz **não foram colocadas no repositório público**.

## Situação técnica
- `scripts/reel-studio/studio.mjs` tem adaptador de VoiceStudio via localhost; PR #48 adicionou clonagem de perfis, mas não constitui execução de um servidor/modelo de voz.
- O ambiente desta sessão não possui backend acessível em `http://127.0.0.1:3900/health`; geração em nuvem gratuita também não foi demonstrada. É incorreto entregar um MP4 com a narração antiga dizendo ser voz de Davi.
- Não criar link `sandbox:/` dentro da página pública: sandbox é restrito à conversa, não é hospedagem.
- Apenas exibir os cartões desses dois itens na página pública de Projetos com rótulos honestos. A liberação de vídeo na página depende de arquivo final publicado com licença e direito de uso confirmados.
- A nova dublagem deve preservar cada quadro e seus cortes; substituir a narração por faixa pt-BR natural aprovada por Davi. Sons de interface e música só podem ser preservados se houver trilhas separadas ou separação sonora revisada; jamais preservar voz original misturada atrás da nova.
- A nova versão deve seguir as referências de ritmo, tipografia e motion design do `75369.mp4`, sem copiar a reivindicação de resultados ou identidade de terceiros como se fossem da W1.

## Verificações
- Testes estáticos em `projetos/page.test.mjs` exigem ambos os cartões e impedem links locais falsos.
- A atualização não altera a aba Projetos do portfólio pessoal; preserva suas sete abas.

## Referências vocais confirmadas (09/11/2026)
O titular confirmou, em primeira pessoa, que a referência limpa de cerca de **9 segundos** e as duas gravações adicionais `PTT-20261108-WA0004.zip` e `PTT-20261108-WA0005.zip` são sua própria voz. Os três arquivos foram convertidos/conferidos e preservados no acervo privado da W1, em `Materiais de vídeo/Referencias privadas de voz`. Consulte [política de voz/proveniência](../creative/reels/VOZ_DAVI_REFERENCIAS_PRIVADAS.md) para fontes, estados e cuidados de uso.

O Reels `W1_VoiceStudio_Contraste_41s_NAO_DUBLADO.mp4` mantém o visual de 41 s com contraste corrigido e trilha, **não contém clonagem de voz gerada**. Não listar o item como narrado pelo titular nem pronto para publicação antes de produzir e escutar a nova narração. O vínculo da referência no acervo não é evidência de sua presença no vídeo.
