import unittest
from PIL import Image

class DiaZeroV3Tests(unittest.TestCase):
    def test_ninety_six_distinct_storyboard_cuts_exactly_120_seconds(self):
        from render_video_v3 import schedule, FPS, TOTAL_SECONDS
        s=schedule()
        self.assertEqual(len(s),96)
        self.assertEqual(len(set(s)),96)
        self.assertEqual(FPS*TOTAL_SECONDS,2880)
        self.assertAlmostEqual(TOTAL_SECONDS/len(s),1.25)
        self.assertEqual(s[:3],[("old",0,0),("new",0,0),("extra",0,0)])

    def test_bus_collision_precedes_infected_reaction_on_screen(self):
        from render_video_v3 import schedule
        segment=schedule()[24:30]
        self.assertEqual(segment,[("old",2,0),("new",2,0),("extra",2,0),("new",2,1),("extra",2,1),("old",2,2)])

    def test_phone_call_visuals_start_when_mother_calls(self):
        from render_video_v3 import schedule
        self.assertEqual(schedule()[72],("extra",6,0))
        self.assertEqual(schedule()[73],("extra",6,1))

    def test_camera_has_no_shake_and_moves_smoothly(self):
        from render_video_v3 import get_camera_transform
        one=[get_camera_transform(4,i/30.0) for i in range(30)]
        pan=[t[1] for t in one]
        self.assertLess(max(abs(pan[i+1]-pan[i]) for i in range(29)),4.0)
        self.assertLess(max(abs(x) for x in pan),65)
        self.assertTrue(all(t[3]==0 for t in one)) # rotation always zero

    def test_subtitles_are_not_black_rectangle(self):
        from render_video_v3 import subtitle_overlay
        im=subtitle_overlay("A luz acabou.",1080,1920)
        self.assertEqual(im.mode,"RGBA")
        self.assertEqual(im.getpixel((46,1550))[3],0)
        self.assertEqual(im.getpixel((108,1780))[3],0)

    def test_caption_uses_real_script_phrases_not_generic_titles(self):
        from captions_v3 import create_caption_cues
        from story import LINES
        cues=create_caption_cues(LINES,word_timings=None,durations=[6.3]*16)
        self.assertGreaterEqual(len(cues),32)
        self.assertLessEqual(len(cues),65)
        self.assertTrue(all(0<=cue["start"]<cue["end"]<=120 for cue in cues))
        self.assertTrue(any("expediente" in cue["text"].lower() for cue in cues))
        self.assertTrue(any("mãe" in cue["text"].lower() for cue in cues))
        self.assertTrue(all(cue["end"]-cue["start"]<=2.8 for cue in cues))

    def test_event_sounds_land_in_story_scene(self):
        from audio_v3 import EVENTS
        self.assertGreaterEqual(len(EVENTS),14)
        E={kind:[t for t,k,v,p in EVENTS if k==kind] for _,kind,_,_ in EVENTS}
        self.assertTrue(any(7<=t<=15 for t in E["alert"]))
        self.assertTrue(any(22<=t<=30 for t in E["electrical"]))
        self.assertTrue(any(30<=t<=38 for t in E["collision"]))
        self.assertTrue(any(81<=t<=90 for t in E["helicopter"]))
        self.assertTrue(any(90<=t<=98 for t in E["call"]))
        self.assertTrue(any(108<=t<=119 for t in E["door"]))

    def test_live_recorded_beds_are_continuous_and_spatially_consistent(self):
        from audio_v3 import BEDS
        self.assertEqual(set(BEDS),{"office","rain_inside","traffic","rain_outside","corridor"})
        for key,(start,end,level,pan) in BEDS.items():
            self.assertTrue(start<end and level>0)
            self.assertTrue(-1<=pan<=1)
        self.assertLessEqual(BEDS["office"][1],60)
        self.assertGreaterEqual(BEDS["rain_outside"][1],100)

if __name__=="__main__":unittest.main()
