"""Dia Zero: storyline and timed narration for a 120-second portrait graphic novel.
32 unique panels, one per 3.75-second shot. No reused source-video frames.
"""
FPS=24
SECONDS=120
SCENE_DURATION=3.75
TITLE="DIA ZERO · 18:00"
LINES=[
"Seis da tarde. Eu só queria terminar o expediente e ir pra casa.",
"Foi quando chegou um alerta em todos os celulares. Mandava ninguém sair do prédio.",
"No começo, achei que fosse um teste. Até ouvir um estrondo na avenida.",
"As luzes piscaram. Um colega gritou. E o escritório inteiro ficou em silêncio.",
"Olhei pela janela. Um ônibus atravessou o sinal... e bateu de frente.",
"Então vi um homem caído na rua. Ele levantou, mas de um jeito errado.",
"Na televisão falavam em surto. Só que a imagem caiu antes de explicarem o que era.",
"O elevador parou. Todo mundo correu pra escada. Eu fui junto.",
"Quando empurrei a porta de saída, veio um cheiro de fumaça e gasolina.",
"Na rua, as pessoas corriam de alguma coisa. Outras... corriam atrás delas.",
"Vi um homem atacar outro. Não era uma briga. Eu corri sem olhar pra trás.",
"Me escondi atrás de um ônibus. Um helicóptero vasculhava os prédios com um holofote.",
"Meu telefone tocou. Minha mãe. Atendi... mas só ouvi uma respiração muito lenta.",
"Eu tentei o metrô. Estava fechado. E as luzes da cidade começaram a morrer.",
"Subi nove andares no escuro. Atrás da minha porta, uma voz chamou: filho, abre. Era ela.",
"Mas meu celular vibrou com uma mensagem da minha mãe: não abre. Eu tô dentro do apartamento."
]
# 32 short animated on-screen captions, each timed to a separate original drawing.
CAPTIONS=[
"18:00. FIM DO EXPEDIENTE","SÓ QUERIA IR PRA CASA",
"UM ALERTA NO CELULAR","NÃO SAIA DO PRÉDIO",
"ACHEI QUE ERA UM TESTE","ATÉ OUVIR O ESTRONDO",
"AS LUZES PISCARAM","O ESCRITÓRIO PAROU",
"UM ÔNIBUS AVANÇOU O SINAL","E A RUA VIROU CAOS",
"ALGUÉM CAIU NO ASFALTO","E LEVANTOU... ERRADO",
"NOTÍCIAS INTERROMPIDAS","NINGUÉM TINHA RESPOSTAS",
"O ELEVADOR TRAVOU","A ESCADA ERA A ÚNICA SAÍDA",
"CHEIRO DE FUMAÇA","SIRENES POR TODA PARTE",
"ELES CORRIAM ATRÁS DE NÓS","NÃO ERA UMA BRIGA",
"EU SÓ CORRI","ME ESCONDI ATRÁS DE UM ÔNIBUS",
"UM HOLOFOTE VARREU A RUA","UM TELEFONEMA",
"MINHA MÃE LIGANDO","SÓ UMA RESPIRAÇÃO",
"O METRÔ ESTAVA FECHADO","A CIDADE APAGOU",
"NONO ANDAR. SEM LUZ","ALGUÉM ESTAVA NA MINHA PORTA",
"ERA A VOZ DELA","MAS ELA JÁ ESTAVA LÁ DENTRO."
]
TIMECODE=["18:00","18:00","18:01","18:01","18:02","18:02","18:02","18:03","18:03","18:04","18:04","18:05","18:05","18:06","18:06","18:07","18:08","18:09","18:09","18:10","18:11","18:12","18:13","18:14","18:15","18:15","18:16","18:17","18:18","18:19","18:19","18:19"]
assert len(LINES)==16 and len(CAPTIONS)==32 and len(TIMECODE)==32
