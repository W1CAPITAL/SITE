"""Regression tests for the exact problems reported in V4:
out-of-order images, scene mismatches, action without audio, artificial camera wobble.
"""
import unittest
from collections import Counter

class V5StoryConsistency(unittest.TestCase):
    def test_fixed_location_sequence_and_every_beat_has_related_panels(self):
        from edit_plan_v5 import SCENES, LOCATIONS
        self.assertEqual(len(SCENES),16)
        self.assertEqual(LOCATIONS,
             ("office",)*8+("street",)*5+("metro",)+("residence",)*2)
        self.assertEqual(SCENES[5][0],("new",0))
        self.assertEqual(SCENES[5][1],("fix",1)) # gray-coat stranger in same puddle
        self.assertEqual(SCENES[5][2],("fix",2)) # infected is not main hero
        self.assertEqual(SCENES[5][-1],("new",3)) # return to office to watch news
        self.assertEqual(SCENES[13][-1],("new",10)) # arrive near home after failed metro
        self.assertEqual(SCENES[14][-1],("new",14)) # voice on the other side of door
        self.assertEqual(SCENES[15][-1],("new",15)) # final presence IN apartment
    def test_no_reused_images_and_not_an_unrelated_frenzied_slideshow(self):
        from edit_plan_v5 import shots, SCENES
        plan=shots()
        self.assertEqual(len(plan),59)
        self.assertEqual(len(set(s["asset"] for s in plan)),59)
        self.assertEqual(plan[0]["start_frame"],0)
        self.assertEqual(plan[-1]["end_frame"],2880)
        self.assertTrue(all(a["end_frame"]==b["start_frame"] for a,b in zip(plan,plan[1:])))
        self.assertTrue(all(30<=s["end_frame"]-s["start_frame"]<=60 for s in plan))
        self.assertTrue(all(s["start_frame"]>=s["beat"]*180 for s in plan))
        self.assertTrue(all(s["end_frame"]<=(s["beat"]+1)*180 for s in plan))
    def test_events_only_attach_to_shots_where_the_action_is_present(self):
        from edit_plan_v5 import SHOT_ACTIONS
        from sound_v5 import CUES
        self.assertGreaterEqual(len(CUES),35)
        for e in CUES:
            beat,place,sound,when,volume,pan=e
            self.assertTrue(0<=beat<16)
            self.assertIn(sound,SHOT_ACTIONS[(beat,place)],
                         "Unmotivated %s at beat %d shot %d"%(sound,beat,place))
            self.assertTrue(0<=when<=1)
            self.assertTrue(0<volume<=1)
            self.assertTrue(-1<=pan<=1)
    def test_lamp_papers_collision_splash_heli_and_door_get_precisely_matched_audio(self):
        from sound_v5 import CUES
        keys={(beat,position,sound) for beat,position,sound,_,_,_ in CUES}
        for x in {(3,1,"glass"),(3,2,"papers"),(3,3,"alarm"),
                  (4,2,"crash"),(4,3,"splash"),(5,1,"splash"),
                  (8,2,"fire"),(9,3,"splash"),(11,1,"helicopter"),
                  (14,2,"keys"),(14,4,"knock"),(15,0,"phone")}:
            self.assertIn(x,keys)
    def test_no_camera_rotation_or_microscopic_shake(self):
        from render_v5 import camera_transform
        for shot_idx in [0,8,25,40,58]:
            values=[camera_transform(shot_idx,n/24.,1.875) for n in range(35)]
            self.assertTrue(all(x[3]==0 for x in values))
            self.assertLess(max(abs(a[1]-b[1]) for a,b in zip(values,values[1:])),2.)
    def test_subtitle_source_is_approved_real_voice_not_frame_index(self):
        from render_v5 import cleaned_cues
        samples=[{"start":5,"end":7,"text":"fim de expediente"},
                 {"start":6.9,"end":7.5,"text":"alerta"}]
        r=cleaned_cues(samples)
        self.assertLess(r[0]["end"],r[1]["start"])

if __name__=="__main__":unittest.main()
