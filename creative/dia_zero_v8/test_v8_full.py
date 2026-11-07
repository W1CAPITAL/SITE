"""V8 full cinematic video regression gates. Designed to fail before implementation."""
import unittest
from edit_plan_v5 import SCENES,LOCATIONS
from video_shots_v8 import SHOTS,build_prompt,BEAT_CHOICES,BEAT_ZONES

class DiaZeroV8GenuineVideoTests(unittest.TestCase):
    def test_exact_120_seconds_with_only_two_real_video_shots_per_beat(self):
        self.assertEqual(len(SHOTS),32)
        self.assertEqual(len(BEAT_CHOICES),16)
        self.assertEqual(len(BEAT_ZONES),16)
        self.assertEqual(sum(x["duration"] for x in SHOTS),120.0)
        self.assertEqual(len(set((s["beat"],s["pos"]) for s in SHOTS)),32)
        self.assertTrue(all(s["duration"]==3.75 for s in SHOTS))
    def test_every_first_last_frame_is_from_a_real_story_chapter(self):
        for s in SHOTS:
            self.assertTrue(0<=s["pos"]<len(SCENES[s["beat"]]))
            self.assertEqual(s["source_asset"],SCENES[s["beat"]][s["pos"]])
    def test_no_interior_exterior_magic(self):
        for s in SHOTS:
            self.assertEqual(s["zone"],LOCATIONS[s["beat"]])
            prompt=build_prompt(s)
            self.assertIn("smooth continuous",prompt)
            self.assertIn("not a slideshow",prompt)
            self.assertIn("NO artificial geometric shapes",prompt)
            if s["zone"]=="office":
                self.assertIn("OUTSIDE THE WINDOW",prompt)
                self.assertIn("No outdoor rain, fire, smoke or cars INSIDE",prompt)
            elif s["zone"]=="residence":
                self.assertIn("indoors",prompt)
    def test_actions_and_geography_of_story_are_preserved(self):
        for beat,first,last in [
            (5,1,2), (7,1,3), (8,0,2), (14,1,3), (15,0,3)]:
            self.assertEqual(BEAT_CHOICES[beat],(first,last))
        titles=[x["title"] for x in SHOTS]
        self.assertIn("O infectado na água",titles)
        self.assertIn("A presença atrás dele",titles)
    def test_no_still_image_filters_as_animation_substitute(self):
        import pathlib
        script=(pathlib.Path(__file__).parent/"generate_v8_full.py").read_text()
        self.assertIn("/gradio_api/call/generate_video",script)
        self.assertIn("duration_seconds",script)
        self.assertNotIn("zoompan=",script)
        self.assertNotIn("drawtext=",script)

if __name__=="__main__":unittest.main()
