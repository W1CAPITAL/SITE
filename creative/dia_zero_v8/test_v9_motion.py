import unittest
from pathlib import Path

class V9Consistency(unittest.TestCase):
    def test_all_24_missing_shots_covered_once(self):
        from generate_missing_v9 import select_two_shots
        selected=[i["id"] for b in range(4,16) for i in select_two_shots(b)]
        expected=[f"clip_{beat:02d}_{half}" for beat in range(4,16) for half in (0,1)]
        self.assertEqual(selected,expected)
        self.assertEqual(len(set(selected)),24)
    def test_no_random_lip_sync_during_offscreen_narration(self):
        from generate_missing_v9 import NO_MOUTH_MOTION,select_two_shots
        self.assertIn("closed",NO_MOUTH_MOTION.lower())
        self.assertIn("voiceover",NO_MOUTH_MOTION.lower())
        for b in range(4,16):
            for item in select_two_shots(b):
                self.assertIn(NO_MOUTH_MOTION,item["prompt"])
                self.assertIn("INSIDE",item["prompt"] if item["zone"]=="office" else "INSIDE")
    def test_later_scenes_start_at_30_seconds_and_end_120(self):
        from generate_missing_v9 import select_two_shots
        scene=[i for b in range(4,16) for i in select_two_shots(b)]
        self.assertEqual(scene[0]["start"],30.)
        self.assertEqual(scene[-1]["start"]+scene[-1]["duration"],120.)
    def test_no_static_frames_fallback(self):
        from generate_missing_v9 import select_two_shots
        for b in range(4,16):
            self.assertTrue(all(s["id"].startswith("clip_") for s in select_two_shots(b)))
if __name__=='__main__':
    unittest.main()
