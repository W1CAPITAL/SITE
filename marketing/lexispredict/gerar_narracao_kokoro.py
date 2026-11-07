"""Sintetiza narrações em português brasileiro para Reels LexisPredict."""
import os
import subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro import KPipeline

SCRIPTS = {
  '01_modo_dificil': 'Advogado, seu escritório virou um jogo no modo difícil? Cliente aqui, processo ali, retorno perdido no WhatsApp. E o tempo? Sumindo. Agora imagine tudo organizado, sem caça ao tesouro. Com o LexisPredict, acompanhe clientes, processos e tarefas num só lugar. Quer mudar de fase? Peça uma demonstração.',
  '02_tres_erros': 'Três erros que roubam tempo do seu escritório. Um: esquecer retornos importantes. Dois: espalhar informações por dezenas de conversas. Três: começar o dia sem prioridades. Parece familiar? Você não precisa trabalhar assim. Conheça o LexisPredict e organize clientes, processos e tarefas. Peça uma demonstração.'
}
out=Path('generated-voices')
out.mkdir(exist_ok=True)
pipeline=KPipeline(lang_code='p')
voice='pm_alex'
for name,txt in SCRIPTS.items():
    print('Rendering', name, flush=True)
    segments=[]
    for i,(gs,ps,audio) in enumerate(pipeline(txt,voice=voice,speed=1.09)):
        chunk=np.asarray(audio,dtype=np.float32).flatten()
        if chunk.size: segments.append(chunk)
    if not segments: raise RuntimeError('No audio for '+name)
    joined=np.concatenate(segments)
    wav=out/(name+'.wav')
    mp3=out/(name+'.mp3')
    sf.write(wav,joined,24000,subtype='PCM_16')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),
      '-af','highpass=f=75,acompressor=threshold=-19dB:ratio=2:attack=6:release=110,loudnorm=I=-16:TP=-1.7:LRA=9',
      '-ar','48000','-c:a','libmp3lame','-b:a','192k',str(mp3)],check=True)
    print(name,round(len(joined)/24000,2),'seconds',flush=True)
