import test from 'node:test';
import assert from 'node:assert/strict';
import {cloneVoiceProfile, requestVoice, listVoices} from './studio.mjs';

test('VoiceStudio creates a consensual local clone over the real /profiles API', async () => {
  const ref = Buffer.alloc(2048);
  ref.write('RIFF', 0); ref.write('WAVE', 8);
  let called=0;
  const res=await cloneVoiceProfile({
    base:'http://127.0.0.1:3900',
    name:'W1 Robo Feminina',
    reference:ref,
    consentConfirmed:true,
    apiKey:'secret-test',
    fetcher:async (url,opts) => {
      called++;
      assert.equal(url,'http://127.0.0.1:3900/profiles');
      assert.equal(opts.headers.authorization,'Bearer secret-test');
      assert.equal(opts.method,'POST');
      assert.equal(opts.body.get('kind'),'clone');
      assert.equal(opts.body.get('name'),'W1 Robo Feminina');
      assert.equal(opts.body.get('language'),'pt-BR');
      assert.equal(opts.body.get('ref_audio').name,'reference.wav');
      return Response.json({id:'w1-voice'});
    }
  });
  assert.equal(res.id,'w1-voice');
  assert.equal(called,1);
});

test('VoiceStudio clone refuses reference without consent, non-WAV and remote host', async () => {
  let count=0;
  const fetcher=async()=>{count++;return Response.json({id:'wrong'});};
  const ref=Buffer.alloc(2048);ref.write('RIFF',0);ref.write('WAVE',8);
  await assert.rejects(cloneVoiceProfile({
    base:'http://127.0.0.1:3900',name:'Robo',reference:ref,consentConfirmed:false,fetcher
  }));
  await assert.rejects(cloneVoiceProfile({
    base:'http://127.0.0.1:3900',name:'Robo',reference:Buffer.alloc(2048),consentConfirmed:true,fetcher
  }));
  await assert.rejects(cloneVoiceProfile({
    base:'https://fake.example',name:'Robo',reference:ref,consentConfirmed:true,fetcher
  }));
  assert.equal(count,0);
});

test('VoiceStudio TTS accepts saved profile and optional local bearer key',async()=>{
  let called=0;
  await requestVoice({
    base:'http://127.0.0.1:3900',text:'Uma narração para o Reels.',voice:'w1-voice',apiKey:'secret-test',
    fetcher:async(url,opts)=>{
      called++;assert.equal(url,'http://127.0.0.1:3900/v1/audio/speech');
      assert.equal(opts.headers.authorization,'Bearer secret-test');
      assert.equal(JSON.parse(opts.body).voice,'w1-voice');
      return new Response(new Uint8Array([82,73,70,70,0]),{headers:{'content-type':'audio/wav'}});
    }
  });
  assert.equal(called,1);
});

test('VoiceStudio profile list uses the current local port',async()=>{
  const voices=await listVoices({
    base:'http://127.0.0.1:3900',
    fetcher:async(url)=>{
      assert.equal(url,'http://127.0.0.1:3900/v1/audio/voices');
      return Response.json({voices:[{voice_id:'w1-voice',type:'profile',name:'W1 robo',language:'pt-BR'}]});
    }
  });
  assert.equal(voices[0].id,'w1-voice');
});
