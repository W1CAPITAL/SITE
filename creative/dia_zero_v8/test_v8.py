import unittest
from probe_wan_video import check_zone,PROMPT

class GenuineVideoConstraints(unittest.TestCase):
    def test_do_not_generate_rain_fire_or_smoke_inside_office(self):
        for external in ("rain_falling","cars","fire","smoke","helicopter","crowd","street_puddle"):
            with self.assertRaises(ValueError):
                check_zone(["office_desk",external],"office")
    def test_allow_real_indoor_office_props(self):
        self.assertTrue(check_zone(["office_desk","keyboard","phone","lamp"],"office"))
    def test_dont_move_office_keyboard_to_street(self):
        with self.assertRaises(ValueError):
            check_zone(["keyboard","street_puddle"],"street")
    def test_prompt_requires_actual_temporal_video_and_fixed_environment(self):
        for phrase in ("fingers","phone","smooth and continuous","camera remain absolutely stationary","Rainfall","ONLY outside","no slideshow"):
            self.assertIn(phrase,PROMPT)
if __name__=="__main__":unittest.main()
