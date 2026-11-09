import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseHookDuration,formatPredictorCommand} from './virality-hook.mjs';
test('clips stop at fifteen seconds',()=>{
  assert.equal(chooseHookDuration(40.933),15);
  assert.equal(chooseHookDuration(8.4),8.4);
});
test('rejects invalid durations and an excessive limit',()=>{
  assert.throws(()=>chooseHookDuration(-1),/duração/);
  assert.throws(()=>chooseHookDuration(40,16),/15 segundos/);
});
test('returns scoring command without running external service',()=>{
  assert.match(formatPredictorCommand('/tmp/hook.mp4'),/brain_activity --video/);
});
