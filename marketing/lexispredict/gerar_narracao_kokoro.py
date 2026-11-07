"""Narracao scene-by-scene for two 28-second Brazilian Portuguese LexisPredict Reels."""
import subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro import KPipeline

SCENES = {
 '01': [
  (0.0, 4.0, 'Seu escritório parece um jogo no modo difícil?'),
  (4.0, 6.0, 'Cliente aqui, processo ali, e o retorno? Sumiu na conversa.'),
  (10.0, 4.0, 'Enquanto você procura, o tempo vai embora.'),
  (14.0, 4.0, 'Bora ativar um novo checkpoint!'),
  (18.0, 5.0, 'Organize clientes, processos e retornos com o LexisPredict.'),
  (23.0, 5.0, 'Conheça o LexisPredict. Peça uma demonstração!')
 ],
 '02': [
  (0.0, 4.0, 'Três erros que fazem seu escritório perder tempo!'),
  (4.0, 5.0, 'Primeiro: esquecer retornos importantes no chat.'),
  (9.0, 5.0, 'Segundo: espalhar informações em dezenas de lugares.'),
  (14.0, 5.0, 'Terceiro: começar o dia sem prioridades.'),
  (19.0, 5.0, 'Pra virar esse jogo, organize clientes, processos e retornos.'),
  (24.0, 4.0, 'Conheça o LexisPredict. Peça uma demonstração!')
 ]
}
out=Path('generated-voices')
out.mkdir(exist_ok=True)
pipeline=KPipeline(lang_code='p')
for video, scenes in SCENES.items():
 for index,(start,window,txt) in enumerate(scenes,1):
    segments=[]
    for i,(gs,ps,audio) in enumerate(pipeline(txt,voice='pm_alex',speed=1.09)):
      chunk=np.asarray(audio,dtype=np.float32).flatten()
      if chunk.size:segments.append(chunk)
    if not segments:raise RuntimeError('No audio for '+txt)
    joined=np.concatenate(segments)
    wav=out/f'{video}_cena_{index:02d}.wav'
    mp3=out/f'{video}_cena_{index:02d}.mp3'
    sf.write(wav,joined,24000,subtype='PCM_16')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-af',
      'highpass=f=75,acompressor=threshold=-19dB:ratio=2:attack=6:release=110,loudnorm=I=-16:TP=-1.7:LRA=9',
      '-ar','48000','-c:a','libmp3lame','-b:a','192k',str(mp3)],check=True)
    print(video,index,'at',start,'length',round(len(joined)/24000,2),'window',window,flush=True)
