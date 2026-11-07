"""Dia Zero V8 full-temporal shot plan.

32 genuine image-to-video shots, 3.75s each = 120 seconds. Every shot has
one primary physical action and a strict location-zone. Original V5 stills
are continuity anchors, not slides. Wan2.2 (or equivalent temporal model)
is explicitly required to synthesize motion within each shot.
"""
from edit_plan_v5 import SCENES,LOCATIONS

BEAT_CHOICES=[
 (0,3),(0,2),(0,2),(0,2),
 (1,2),(1,2),(0,2),(1,3),
 (0,2),(0,2),(0,2),(0,1),
 (0,2),(0,2),(1,3),(0,3)
]
BEAT_ZONES=LOCATIONS

BEATS=[
 ("18h no escritório",
  "A regular Brazilian office employee finishing a normal work day: his fingers physically type on the keyboard, his shoulders relax and he turns his head toward the office clock. His sleeve folds and jaw changes subtly, natural blinking.",
  "The same employee pulls his messenger bag toward him, stands up from the chair with shifting weight, turns his torso and reaches for his jacket; coworkers in the background change posture naturally."),
 ("O alerta toca",
  "A smartphone physically vibrates on an office desk, screen lights with an emergency alert but no readable words, hand approaches slowly, fingers articulate and grip its edges; fluorescent light reflects from glass surface.",
  "Holding the real phone, the man reads with widening eyes and a genuinely concerned face, his thumb moves on the glass and red alert light pulses on his knuckles; his colleague looks toward him."),
 ("O estrondo distante",
  "In the office, the man hears a distant exterior explosion through intact windows and turns his head toward street below. Outside behind glass smoke begins to curl above the city blocks, while all objects inside remain indoors.",
  "Close view through the intact office window: distant black smoke twists and rises naturally outside above traffic; siren flashes remain down on the street; the man at the glass recoils in alarm."),
 ("Pane e papéis voando",
  "Office fluorescent lamp fails with irregular real electrical pulses, then bursts, realistic electric sparks eject from the tube and glass fragments fall on a desk; ceiling light physically illuminates ceiling and nearby faces before going dim.",
  "Air pressure from open office doorway causes individual office papers to lift, flex, spin and scatter, coworkers recoil and building alarm fixture pulses red light onto their faces and walls; no triangles or fake shapes."),
 ("Colisão do ônibus",
  "The main character watches through the rain-streaked office window as a real bus outside skids on the wet avenue, its wheels rotate and lose grip, the nose swings and horn sounds; people inside remain stationary behind glass.",
  "Outside seen from above the intersection, the same bus physically collides with a stopped car: metal crumples, tires spray water, steam rises from the damaged engine; believable momentum, no fiery explosion indoors."),
 ("O infectado na água",
  "High floor office point of view to flooded avenue below: a distinct pale bald stranger with dark brown coat lies in the puddle and lifts his head, elbows and torso slowly, rain water runs off his clothing, wet asphalt reflects city lights. He is NOT the male office worker.",
  "Same distinct bald infected stranger on the street rises from hands and knees to standing, his legs support his weight gradually, wet clothing hangs and drips, rain ripples in puddle; the camera stays inside the office window, absolutely not a teleported protagonist."),
 ("Notícia e sinal falhando",
  "Back INSIDE the office, concerned coworkers gather and turn toward the news television, a real human presenter talks and moves her lips and head subtly, the main man points toward screen.",
  "The news TV image glitches and freezes in place with real screen interference patterns, then cuts to emergency text blurred by light; colleagues start moving away toward the exits and the office lighting dims."),
 ("Escadaria de emergência",
  "The employee taps a stuck elevator button, a small real indicator flickers, doors do not open, he turns and pushes into the emergency stairwell while other people rush past.",
  "People including the same employee run down the enclosed emergency stairs at realistic speed with articulated legs, hands gripping the rail, clothes reacting to motion and shadows changing under alarm lighting."),
 ("A saída para rua",
  "The main man pushes open the building emergency exit, his hand and shoulder move it on hinges against the rainy exterior wind. The office interior remains dry until the door physically opens.",
  "He steps INTO the exterior street: burning vehicles are OUTSIDE at the curb, organic flame tongues curl and flicker with smoke flowing upward into the outdoor wind, orange reflections ripple in puddles as rain falls."),
 ("Fuga pela avenida",
  "Outside in the heavy rain, he runs across a deep street puddle, shoes displace physical water and droplets arc then fall, arms and legs alternate naturally, bag swings with momentum.",
  "Terrified crowds and the employee flee along the same avenue past wrecked vehicles, human legs and arms move smoothly with footfalls, car tires rotate and rain refracts street lights."),
 ("Perseguição do infectado",
  "A distinct infected stranger advances through rainy street with stiff but natural articulated steps, raising both hands toward a fleeing passerby; the protagonist notices and turns in fear.",
  "The protagonist flees to a narrow urban alley, pushes an iron gate on hinges and slips through, glances back as the infected silhouette approaches; jacket and bag sway naturally."),
 ("Helicóptero no céu",
  "A man crouches behind an actual city bus on the wet avenue and leans to look out, breath visible in cold rain, fearful eyes tracking distant movement.",
  "Outside above street only: a real helicopter moves across the stormy night sky, rotor blades visibly spin, its searchlight cone moves across wet building facades and road; the protagonist hides under its sweep."),
 ("Ligação da mãe",
  "The man crouches in shelter and receives a phone call; he removes the phone, taps accept and brings it to ear, fingers and facial muscles naturally moving, rain patters beyond the shelter.",
  "He listens and grows increasingly afraid as the call becomes garbled, he swallows, lips move, eyes tear and fingers tighten on the device; sound remains muted beneath the outside wind."),
 ("Metrô fechado e blecaute",
  "Outside a subway station entrance, he approaches the iron shutter and tries the locked gate, metal rattles physically and his shoulder drops in disappointment, rain continues outside.",
  "From the wet city street, building windows go dark in staggered sequence as the power grid fails, smoke drifts only outside, the man turns away and starts running toward the apartment building."),
 ("Escada e porta de casa",
  "Inside the residential stairwell, exhausted employee climbs concrete steps with heavy breathing, hand slides along railing, wet clothes drip realistically onto floor.",
  "At the apartment doorway, the same employee puts a brass key in the lock, rotates wrist, latch retracts, then opens the door slowly on hinges, hearing another person in the corridor; geometry of hallway stable."),
 ("Mensagem e presença",
  "Inside his dark apartment, he sets messenger bag on the ground, checks illuminated smartphone and reads a notification; his face changes from relief to alarm and light reflects in his eyes.",
  "A physically coherent shadowy female silhouette slowly emerges in the DARK BEDROOM DOORWAY BEHIND the man while he looks at his smartphone, head slowly turns toward her, fingers freeze, clothing shifts with real motion; suspenseful ending, no gore."),
]

SHOTS=[]
for beat,(a,b) in enumerate(BEAT_CHOICES):
    for half,position in enumerate((a,b)):
        title=BEATS[beat][0] if not(beat==15 and half==1) else "A presença atrás dele"
        if beat==5 and half==0:title="O infectado na água"
        SHOTS.append({
            "id":f"clip_{beat:02d}_{half}","beat":beat,"half":half,"pos":position,
            "start":beat*7.5+half*3.75,"duration":3.75,
            "zone":LOCATIONS[beat],"title":title,
            "source_asset":SCENES[beat][position],
            "action":BEATS[beat][1+half]
        })

def build_prompt(shot):
    pre=("Generate a REAL physically continuous animated movie clip from the given source art. "
         "Maintain identical human identities, clothing, props and location. "
         "Every change between frames must follow smooth continuous physical motion, "
         "not a slideshow or slideshow morph; natural inertia, anatomically plausible "
         "movements, organic fluids and smoke, believable reactions and no abrupt jumps. "
         "Stable tripod camera throughout; no zoom, pan or shake. "
         "Keep hand-inked high-end cinematic graphic novel styling, rainy Brazilian "
         "city under indigo dusk and restrained emergency amber. "
         "NO artificial geometric shapes, no flat polygons, no cartoon stickers, "
         "no scribble overlays, no random lightning or violence, no text, "
         "no captions, no logos. "
         "Sound FX are externally mixed and MUST NOT be depicted as flying shapes. ")
    if shot["zone"]=="office":
        pre+=("INSIDE THE OFFICE: only office furniture, people, papers, ceiling lamps, "
              "monitors, phone, doors. Any explosion, bus crash, fire, smoke, rain, "
              "street crowd or helicopter exists exclusively OUTSIDE THE WINDOW "
              "behind intact glass. No outdoor rain, fire, smoke or cars INSIDE. "
              "Rain visible only on window surfaces beyond the indoor air volume. ")
    elif shot["zone"]=="street":
        pre+=("OUTSIDE on real wet city streets: rain, cars, fire and smoke are "
              "exterior street phenomena, lit by natural reflection in asphalt. "
              "Do not add any office ceiling lamps/furniture or foreground geometric fx. ")
    elif shot["zone"]=="metro":
        pre+=("OUTSIDE the closed metro entrance or on wet street; no floating "
              "emergency fixture, no office props. ")
    elif shot["zone"]=="residence":
        pre+=("We are indoors in residential stairwell, corridor or apartment. "
              "Ambient outdoor weather or smoke must remain exclusively OUTSIDE "
              "through physical windows; no indoor rain, fire or smoke. ")
    return pre+shot["action"]

if __name__=="__main__":
    for s in SHOTS:
        print(s["id"],s["start"],s["zone"],s["source_asset"],s["title"])
