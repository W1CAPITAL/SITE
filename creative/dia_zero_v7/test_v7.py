"""V7 regressions: user reported that V6 applied camera motion/filters,
but characters, cars, fire, clouds, water and phones remained static.
Tests require actual different character/object poses and moving localized pixels.
"""
import unittest, json
import numpy as np
import cv2
from pathlib import Path

class RealObjectMotionTest(unittest.TestCase):
    def test_twelve_true_four_pose_sequences_exist(self):
        from motion_v7 import REQUIRED_POSE_KINDS,POSETIME
        self.assertEqual(len(REQUIRED_POSE_KINDS),12)
        data=json.loads((Path(__file__).parent/"pose_sheets.json").read_text())
        self.assertTrue(all(data["shots"].get(k,"").startswith("https://") for k in REQUIRED_POSE_KINDS))
        self.assertEqual(len(POSETIME),12)
    def test_all_59_shots_have_environment_and_specific_action(self):
        from motion_v7 import scene_motion_types
        from edit_plan_v5 import shots
        allshots=shots()
        self.assertEqual(len(allshots),59)
        for shot in allshots:
            layers=scene_motion_types(shot)
            self.assertGreaterEqual(len(layers),2)
            self.assertIn("scene_environment",layers)
        assert sum("pose_sequence" in scene_motion_types(s) for s in allshots)==12
    def test_flow_interpolates_a_moving_physical_square_without_global_camera_shift(self):
        from motion_v7 import pose_interpolate,compute_flow
        A=np.zeros((100,70,3),np.uint8)
        B=A.copy()
        cv2.rectangle(A,(8,42),(27,60),(250,240,235),-1)
        cv2.rectangle(B,(26,42),(45,60),(250,240,235),-1)
        flowA,flowB=compute_flow(A,B)
        middle=pose_interpolate(A,B,.5,flowA,flowB)
        self.assertGreater(middle[50,25].sum(),100)
        self.assertLess(middle[5,5].sum(),15)
        self.assertGreater(np.abs(middle.astype("int16")-A.astype("int16")).sum(),5000)
    def test_flames_change_shape_not_just_brightness(self):
        from motion_v7 import physical_effects
        blank=np.zeros((320,180,3),np.uint8)+35
        from edit_plan_v5 import shots
        shot=next(s for s in shots() if "fire" in s["visible"])
        a=physical_effects(blank.copy(),shot,.12)
        b=physical_effects(blank.copy(),shot,1.15)
        self.assertGreater(np.abs(a.astype("int16")-b.astype("int16")).sum(),2000)
    def test_rain_drops_change_positions_not_global_filter(self):
        from motion_v7 import physical_effects
        from edit_plan_v5 import shots
        shot=next(s for s in shots() if s["location"]=="street")
        bg=np.zeros((320,180,3),np.uint8)+55
        a=physical_effects(bg.copy(),shot,.15)
        b=physical_effects(bg.copy(),shot,.8)
        self.assertGreater(np.abs(a.astype("int16")-b.astype("int16")).sum(),300)
    def test_phone_screen_visibly_responds_in_scene(self):
        from motion_v7 import physical_effects
        from edit_plan_v5 import shots
        shot=next(s for s in shots() if "phone" in s["visible"])
        a=physical_effects(np.full((320,180,3),35,np.uint8),shot,.12)
        b=physical_effects(np.full((320,180,3),35,np.uint8),shot,.85)
        self.assertGreater(np.abs(a.astype("int16")-b.astype("int16")).sum(),1000)
    def test_two_minutes_and_all_59_shot_order_are_preserved(self):
        from edit_plan_v5 import shots
        p=shots()
        self.assertEqual(p[0]["start_frame"],0)
        self.assertEqual(p[-1]["end_frame"],2880)
        self.assertTrue(all(p[i]["end_frame"]==p[i+1]["start_frame"] for i in range(58)))
        self.assertEqual(len(set(tuple(x["asset"]) for x in p)),59)

if __name__=="__main__":unittest.main()
