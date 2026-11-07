import unittest
from PIL import Image

class PacingTests(unittest.TestCase):
    def test_two_minute_timeline_has_64_unique_cuts(self):
        from render_video_v2 import shot_schedule
        s=shot_schedule()
        self.assertEqual(len(s),64)
        self.assertEqual(len(set(s)),64)
        self.assertAlmostEqual(120/len(s),1.875)
    def test_interleaves_original_and_new_scenes(self):
        from render_video_v2 import shot_schedule
        s=shot_schedule()
        self.assertEqual(s[0],("old",0,0))
        self.assertEqual(s[1],("new",0,0))
        self.assertEqual(s[2],("old",0,1))
    def test_subtitles_do_not_have_rectangular_background(self):
        from render_video_v2 import caption_layer
        rgba=caption_layer(1)
        self.assertEqual(rgba.mode,"RGBA")
        self.assertEqual(rgba.getpixel((50,1465))[3],0)
        self.assertLess(rgba.getpixel((70,1690))[3],10)
    def test_every_event_is_tied_to_a_story_beat(self):
        from render_audio_v2 import EVENTS
        self.assertGreaterEqual(len(EVENTS),12)
        for when,name,gain,pan in EVENTS:
            self.assertTrue(0<=when<=120)
            self.assertIn(name,{
                "office","traffic","rain","alert","electrical","collision","siren",
                "crowd","stairs","footsteps","helicopter","call","metro","door","heartbeat"
            })
            self.assertTrue(0<=gain<=1)
            self.assertTrue(-1<=pan<=1)
    def test_no_continuous_artificial_tonal_background(self):
        from render_audio_v2 import CONTINUOUS_SYNTH_TONE
        self.assertFalse(CONTINUOUS_SYNTH_TONE)

if __name__=="__main__":unittest.main()
