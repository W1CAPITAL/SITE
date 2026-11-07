import requests
from bs4 import BeautifulSoup
pages=['glass','glass-breaking','paper','rustle','fire','explosion','splash','water','steps','footsteps','car','crash','alarm','siren','keys','door','wind','typing','keyboard','phone','electrical','static','crowd','horror','impact','ambulance']
s=requests.Session();s.headers['User-Agent']='Mozilla/5.0'
for page in pages:
 try:
  res=s.get('https://mixkit.co/free-sound-effects/'+page+'/',timeout=16);res.raise_for_status()
  soup=BeautifulSoup(res.text,'html.parser')
  items=[]
  for el in soup.select('h2.item-grid-card__title'):
   pl=el.find_previous(attrs={'data-audio-player-preview-url-value':True})
   if pl:
    title=el.get_text(' ',strip=True)
    if title not in items:items.append(title)
  print('PAGE',page,'COUNT',len(items),'TITLES',repr(items[:65]),flush=True)
 except Exception as e:print('PAGE',page,'ERROR',str(e)[:120],flush=True)
