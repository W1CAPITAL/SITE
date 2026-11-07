"""Narrative film editing plan V4. Each of 16 voice beats lasts 7.5 seconds."""
FPS=24
TOTAL_SECONDS=120
BEATS=[
 "Fim do expediente",
 "Alerta no telefone",
 "Estrondo e fumaça ao longe",
 "Lâmpada quebra e papéis voam",
 "Ônibus derrapa e colide",
 "O infectado se ergue da água",
 "Notícia de surto e sinal cortado",
 "Pânico e escadaria de emergência",
 "Porta para a rua e incêndio",
 "Multidão corre no asfalto molhado",
 "Infectado persegue o protagonista",
 "Abrigo atrás do ônibus e helicóptero",
 "Telefonema da mãe",
 "Metrô fechado e blecaute",
 "Subida ao apartamento e voz na porta",
 "Mensagem contraditória e presença dentro do apartamento"
]
# Source indices match the real V3 shot sequence. Every shot is distinct.
SHOT_PLAN=[
 [0,1,3,4],
 [6,8,10],
 [12,13,16,17],
 [20,19,18,21],
 [14,24,25,29],
 [30,31,54],
 [33,34,23,38],
 [41,43,44,45],
 [46,51,52,49],
 [55,56,57,58],
 [64,50,59,63],
 [66,67,68,69],
 [65,70,71],
 [62,79,81],
 [75,76,84,86],
 [90,92,94,95],
]
def shot_timeline():
    result=[]
    for beat,shots in enumerate(SHOT_PLAN):
        duration=round(7.5*FPS/len(shots))
        for pos,original_index in enumerate(shots):
            start=beat*180+pos*duration
            end=beat*180+(pos+1)*duration
            result.append({"beat":beat,"source":original_index,"start_frame":start,"end_frame":end,
                           "start":start/FPS,"end":end/FPS})
    assert len(result)==60 and result[-1]["end_frame"]==TOTAL_SECONDS*FPS
    return result
