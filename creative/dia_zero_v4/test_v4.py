import unittest

class DiaZeroV4Tests(unittest.TestCase):
    def test_16_beats_are_story_aligned_and_60_distinct_shots(self):
        from plan_v4 import BEATS, SHOT_PLAN
        self.assertEqual(len(BEATS),16)
        self.assertEqual(len(SHOT_PLAN),16)
        flat=[s for shots in SHOT_PLAN for s in shots]
        self.assertEqual(len(flat),60)
        self.assertEqual(len(set(flat)),60)
        self.assertTrue(all(len(x) in (3,4) for x in SHOT_PLAN))
        self.assertEqual(sum(len(x) for x in SHOT_PLAN),60)
        self.assertEqual(SHOT_PLAN[3][0],20)
        self.assertEqual(SHOT_PLAN[4][-1],29)
        self.assertEqual(SHOT_PLAN[5][0],30)
        self.assertEqual(SHOT_PLAN[11][1],67)
    def test_timeline_has_exactly_2880_frames(self):
        from plan_v4 import shot_timeline
        cuts=shot_timeline()
        self.assertEqual(len(cuts),60)
        self.assertEqual(cuts[0]['start_frame'],0)
        self.assertEqual(cuts[-1]['end_frame'],2880)
        self.assertTrue(all(cuts[i]['end_frame']==cuts[i+1]['start_frame'] for i in range(59)))
        self.assertTrue(all(45<=c['end_frame']-c['start_frame']<=60 for c in cuts))
    def test_cut_plan_matches_nearby_voice_beat(self):
        from plan_v4 import shot_timeline
        cuts=shot_timeline()
        self.assertTrue(all(c['start_frame']>=c['beat']*180 for c in cuts))
        self.assertTrue(all(c['end_frame']<=(c['beat']+1)*180 for c in cuts))
    def test_captions_do_not_overlap(self):
        from render_v4 import normalize_cues
        source=[{'start':0,'end':2.5,'text':'Primeiro'},{'start':2.4,'end':3.7,'text':'Segundo'},{'start':6.3,'end':7.2,'text':'Terceiro'}]
        fixed=normalize_cues(source)
        self.assertTrue(all(a['end']<b['start'] for a,b in zip(fixed,fixed[1:])))
    def test_camera_is_stable(self):
        from render_v4 import stable_transform
        values=[stable_transform(8,frame) for frame in range(60)]
        self.assertTrue(all(v[3]==0 for v in values))
        self.assertLess(max(abs(values[i+1][1]-values[i][1]) for i in range(59)),1.6)
    def test_foley_actions_precisely_match_visible_beats(self):
        from audio_v4 import SFX_EVENTS
        found={}
        for beat,offset,sound,gain,pan in SFX_EVENTS:
            found.setdefault(beat,set()).add(sound)
            self.assertTrue(0<=beat<16)
            self.assertTrue(0<=offset<7.5)
            self.assertTrue(-1<=pan<=1 and 0<gain<=1)
        self.assertIn('electric',found[3])
        self.assertIn('glass',found[3])
        self.assertIn('papers',found[3])
        self.assertIn('alarm',found[3])
        self.assertIn('crash',found[4])
        self.assertIn('splash',found[5])
        self.assertIn('splash',found[9])
        self.assertIn('fire',found[8])
        self.assertIn('helicopter',found[11])
        self.assertIn('phone',found[12])
        self.assertIn('door',found[14])
        self.assertIn('phone',found[15])

if __name__=='__main__':unittest.main()
