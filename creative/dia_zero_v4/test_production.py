import unittest
from PIL import Image
from story import FPS, SECONDS, SCENE_DURATION, CAPTIONS, TIMECODE, LINES
from render_video import extract_panels_from_image

class TimelineTests(unittest.TestCase):
 def test_exact_two_minutes(self):
  self.assertEqual(32*SCENE_DURATION,SECONDS)
  self.assertEqual(int(SECONDS*FPS),2880)
 def test_every_shot_is_distinct(self):
  self.assertEqual(len(CAPTIONS),32)
  self.assertEqual(len(TIMECODE),32)
  self.assertEqual(len(LINES),16)
 def test_panel_extraction_order(self):
  source=Image.new('RGB',(200,400),(1,1,1))
  colors=[(255,0,0),(0,255,0),(0,0,255),(255,255,0)]
  for i,c in enumerate(colors):
   x=(i%2)*100;y=(i//2)*200
   source.paste(c,(x,y,x+100,y+200))
  panels=extract_panels_from_image(source, margin=0)
  self.assertEqual(len(panels),4)
  for i,p in enumerate(panels):
   self.assertEqual(p.getpixel((p.width//2,p.height//2)),colors[i])

if __name__=='__main__':unittest.main()
