import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdminConfigError } from '../src/admin-config.js';

test('explains how to configure a missing admin password', () => {
  assert.match(getAdminConfigError(undefined), /ADMIN_PASSWORD/);
  assert.match(getAdminConfigError(undefined), /Secret/);
});
test('rejects a short password without exposing its value', () => {
  const secret = 'dont-print-this';
  const err = getAdminConfigError(secret);
  assert.match(err, /20 caracteres/);
  assert.ok(!err.includes(secret));
});
test('accepts a sufficiently strong secret without requesting a paid plan', () => {
  assert.equal(getAdminConfigError('A'.repeat(20)), null);
});
