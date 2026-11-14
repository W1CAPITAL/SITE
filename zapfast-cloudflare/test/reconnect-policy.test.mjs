import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldRecover, wakeAfter } from '../src/reconnect-policy.js';

test('recovers cloud session after idle eviction or completed cooldown',()=>{
  assert.equal(shouldRecover({socket:undefined,state:'closed',now:60000,retryAfter:20000}),true);
  assert.equal(shouldRecover({socket:undefined,state:'stopped',now:60000,retryAfter:0}),true);
});
test('does not duplicate a live connection or pair a logged out session',()=>{
  assert.equal(shouldRecover({socket:{},state:'connected',now:60000,retryAfter:0}),false);
  assert.equal(shouldRecover({socket:undefined,state:'logged_out',now:60000,retryAfter:0}),false);
  assert.equal(shouldRecover({socket:undefined,state:'closed',now:10000,retryAfter:40000}),false);
});
test('prioritizes pending history before idle maintenance',()=>{
  assert.equal(wakeAfter(true),1000);
  assert.equal(wakeAfter(false),60000);
});
