import assert from 'node:assert/strict';
import {
  AceAccountClientError,
  createAceAccountClient,
  validateAceAccountSummary,
} from './index.js';

const validSummary = {
  identity: { uid: 'uid-1', displayName: 'Test', email: 'test@example.com', avatarUrl: null },
  plan: { name: 'Free', status: 'active', monthlyAllowance: 250 },
  balance: { monthly: 200, purchased: 0, promotional: 0, total: 200 },
  usage: {
    windowStart: '2026-07-01',
    windowEnd: '2026-07-30',
    credits: 0,
    inputTokens: 10,
    outputTokens: 5,
    byApp: [],
  },
  appAccess: [],
  providerConnections: [],
  alerts: [],
  updatedAt: '2026-07-30T00:00:00.000Z',
};

assert.equal(validateAceAccountSummary(validSummary), validSummary);
assert.throws(
  () => validateAceAccountSummary({ ...validSummary, balance: { total: -1 } }),
  AceAccountClientError,
);

const calls = [];
const client = createAceAccountClient({
  appId: 'scribe-notes',
  getIdToken: async (refresh) => refresh ? 'fresh-token' : 'stale-token',
  fetch: async (url, init) => {
    calls.push({ url, init });
    if (calls.length === 1) {
      return new Response(
        JSON.stringify({ ok: false, error: { code: 'ACE_AUTH_REQUIRED', message: 'Refresh.' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }
    return new Response(
      JSON.stringify({ ok: true, summary: validSummary }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  },
});

assert.deepEqual(await client.loadSummary(), validSummary);
assert.equal(calls.length, 2);
assert.equal(calls[0].init.credentials, 'omit');
assert.equal(calls[0].init.headers.Authorization, 'Bearer stale-token');
assert.equal(calls[1].init.headers.Authorization, 'Bearer fresh-token');
assert.equal(calls[1].url, 'https://app.npc-forge.com/api/ace/account/summary');

assert.throws(
  () => createAceAccountClient({ appId: 'unknown', getIdToken: async () => 'token' }),
  /Unknown ACE suite app/,
);

console.log('ACE account client package tests passed.');
