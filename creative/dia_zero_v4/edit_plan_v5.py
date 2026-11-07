"""Dia Zero V5: hand-edited chronological shot list, not interpolated/shuffled pages.
Sixteen uninterrupted narrative beats of 7.5 seconds matched to previously approved
Brazilian Portuguese narration. 59 unique clean comic drawings (43 existing + 16 inserts).
"""
FPS=24
BEAT_FRAMES=180
TOTAL_FRAMES=120*FPS
LOCATIONS=("office",)*8+("street",)*5+("metro",)+("residence",)*2
SCENES=[
 [("orig",0),("orig",2),("orig",1),("orig",3)],
 [("orig",7),("orig",6),("orig",10)],
 [("orig",12),("orig",15),("orig",16)],
 [("orig",20),("orig",19),("orig",18),("orig",21)],
 [("orig",17),("orig",14),("orig",24),("orig",25)],
 [("new",0),("new",1),("new",2),("new",3)],
 [("orig",33),("orig",23),("orig",34)],
 [("orig",38),("orig",41),("orig",43),("orig",44)],
 [("orig",45),("new",4),("orig",51),("orig",52)],
 [("new",5),("orig",55),("orig",57),("orig",58)],
 [("new",6),("orig",64),("new",7)],
 [("orig",66),("orig",67),("orig",68)],
 [("orig",53),("orig",70),("orig",71)],
 [("new",8),("new",9),("orig",82),("new",10)],
 [("new",11),("orig",75),("new",12),("new",13),("new",14)],
 [("orig",90),("orig",92),("orig",94),("new",15)]
]
SHOT_ACTIONS={}
for beat,actions in enumerate([
 [("keyboard",),("clock",),("click",),("bag",)],
 [("phone",),("alert",),("alert",)],
 [("window",),("boom",),("siren",)],
 [("electric",),("glass",),("papers",),("alarm",)],
 [("window",),("horn",),("crash",),("splash",)],
 [("window",),("splash",),("zombie","wetsteps"),("reaction",)],
 [("tv",),("tv","crowd"),("static",)],
 [("footsteps",),("elevator",),("stairs",),("stairs",)],
 [("door",),("rain_enter",),("fire",),("traffic",)],
 [("splash",),("crowd",),("footsteps",),("splash",)],
 [("zombie","crowd"),("footsteps",),("gate","footsteps")],
 [("footsteps",),("helicopter",),("helicopter",)],
 [("phone",),("phone",),("breath",)],
 [("metro",),("metal",),("electric",),("footsteps",)],
 [("door",),("stairs",),("keys",),("door",),("knock",)],
 [("phone",),("heartbeat",),("floor",),("floor",)]
]):
 for index,flags in enumerate(actions):SHOT_ACTIONS[(beat,index)]=flags

def shots():
    sequence=[]
    for beat,scene in enumerate(SCENES):
        length=BEAT_FRAMES//len(scene)
        assert length*len(scene)==BEAT_FRAMES
        for i,asset in enumerate(scene):
            start=BEAT_FRAMES*beat+length*i
            sequence.append(dict(
                beat=beat,pos=i,asset=asset,location=LOCATIONS[beat],
                start_frame=start,end_frame=start+length,
                start=round(start/FPS,4),end=round((start+length)/FPS,4),
                visible=SHOT_ACTIONS[(beat,i)]
            ))
    assert sequence[-1]["end_frame"]==TOTAL_FRAMES
    return sequence
