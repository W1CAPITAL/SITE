"""TTS PT-BR male narrative - original fictional apocalypse film."""
from pathlib import Path
import numpy as np
import soundfile as sf
import subprocess
from kokoro import KPipeline
SCENES=[
("00","Sábado. Sete de novembro. Dezoito horas. Eu só queria fechar o computador e ir pra casa."),
("10","O escritório já estava vazio. Meu chefe tinha ido embora. Aí meu celular vibrou com um alerta que eu nunca tinha visto."),
("20","Na tela dizia: permaneça dentro do prédio. Achei que era um teste. Até ouvir a primeira sirene."),
("30","A luz piscou. Depois tudo apagou. Lá fora, um ônibus passou direto pelo sinal e bateu em três carros."),
("40","Olhei pela janela. Ninguém entendia nada. Um homem caiu no asfalto, e as pessoas continuaram filmando."),
("50","Ele se levantou de um jeito errado. Uma mulher gritou. O resto aconteceu tão rápido que eu não consegui pensar."),
("60","Desci correndo pelas escadas de serviço. Todo mundo gritava. Eu só queria encontrar algum caminho pra sair dali."),
("70","Quando cheguei à rua, o barulho era insuportável. Sirenes. Buzinas. Gente correndo. E passos vindo atrás de mim."),
("80","Peguei a moto e dei partida, sem nem ajeitar a mochila. No retrovisor, vi dois olhos brilhando na chuva."),
("90","O celular tocou. Era minha mãe. Atendi. Não ouvi a voz dela. Só a televisão. E uma batida muito forte."),
("100","Tentei chegar em casa pelo caminho de sempre. A avenida estava bloqueada. No meio da pista, dezenas de pessoas paradas."),
("110","Às seis e dezenove, chegou a última mensagem: não abra a porta. Então alguém bateu na minha janela. Eu moro no nono andar.")
]
out=Path('out');out.mkdir(exist_ok=True)
p=KPipeline(lang_code='p')
for offset,txt in SCENES:
 chunks=[]
 for (_,_,a) in p(txt,voice='pm_alex',speed=1.17):
  arr=np.asarray(a,dtype=np.float32).reshape(-1)
  if arr.size:chunks.append(arr)
 if not chunks:raise RuntimeError('empty output for '+offset)
 a=np.concatenate(chunks)
 wav=out/f'narracao_{offset}.wav';sf.write(wav,a,24000)
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-af','highpass=f=75,acompressor=threshold=-21dB:ratio=2:attack=8:release=120,loudnorm=I=-17:TP=-1.4:LRA=9','-ar','48000','-b:a','160k',str(out/f'narracao_{offset}.mp3')],check=True)
 print(offset,len(a)/24000,flush=True)
