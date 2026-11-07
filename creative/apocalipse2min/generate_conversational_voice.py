import asyncio
from pathlib import Path
import edge_tts

VOICE="pt-BR-AntonioNeural"
LINES=[
("00","São seis. Finalmente acabou o expediente."),
("08","Pera aí... que alerta é esse?"),
("16","Como assim, não pode sair do prédio?"),
("24","Caramba! Que barulho foi esse?"),
("32","Meu Deus... olha aquela fumaça."),
("40","Mãe? Mãe, me atende, por favor!"),
("48","A luz apagou! Não, não, não..."),
("56","O elevador travou! Tem gente na escada!"),
("64","Corre! Sai da frente!"),
("72","Por que essas pessoas tão atacando todo mundo?"),
("80","Não olha pra trás. Só corre!"),
("88","Meu Deus, a cidade inteira tá assim?"),
("96","Tem alguém me seguindo. Tenho certeza."),
("104","Mãe, responde, por favor!"),
("112","Se eu tô sozinho... quem tá batendo na porta?!")
]
out=Path('out-voice-v2');out.mkdir(exist_ok=True)
async def main():
 sem=asyncio.Semaphore(2)
 async def one(idx,txt):
  async with sem:
   print('Synthesizing',idx,flush=True)
   tts=edge_tts.Communicate(text=txt,voice=VOICE,rate='+6%',pitch='-3Hz')
   await tts.save(str(out/f'{idx}.mp3'))
   print('Completed',idx,flush=True)
 await asyncio.gather(*(one(k,v) for k,v in LINES))
asyncio.run(main())
