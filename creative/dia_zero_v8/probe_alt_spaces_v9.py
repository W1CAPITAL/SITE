import requests,json
SPACES=[
"yuknassty-wan2-2-image-to-video",
"zerogpu-aoti-wan2-2-fp8da-aoti-faster",
"lightricks-ltx-video-distilled",
"upsampler-wan-2-2-14b-image-to-video",
"kulkas2pintu-wan2-2-fp8da-aoti-preview2",
"r3gm-wan2-2-fp8da-aoti-preview2"
]
for name in SPACES:
    base="https://"+name+".hf.space"
    try:
        r=requests.get(base+"/gradio_api/info",timeout=13)
        print("SPACE",name,"HTTP",r.status_code,"bytes",len(r.content),flush=True)
        if r.ok:
            data=r.json()
            print("ENDPOINTS",json.dumps({k: {"parameters":[x.get("label") for x in v.get("parameters",[])]} for k,v in data.get("named_endpoints",{}).items()})[:1800],flush=True)
    except Exception as e:
        print("SPACE",name,"UNAVAILABLE",repr(e)[:170],flush=True)
