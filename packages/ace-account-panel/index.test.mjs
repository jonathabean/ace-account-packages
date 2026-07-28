import assert from 'node:assert/strict';
import { renderAceAccountPanelHtml } from './index.js';

const html = renderAceAccountPanelHtml({
  identity: {
    uid: 'must-not-render',
    displayName: '<img src=x onerror=alert(1)>',
    email: 'person@example.com',
    avatarUrl: null,
  },
  plan: { name: 'Free', status: 'active', monthlyAllowance: 250 },
  balance: { monthly: 200, purchased: 10, promotional: 5, total: 215 },
  usage: {
    windowStart: '2026-07-01',
    windowEnd: '2026-07-30',
    credits: 3,
    inputTokens: 100,
    outputTokens: 50,
    byApp: [],
  },
  appAccess: [{ appId: 'npc-forge', enabled: true }],
  providerConnections: [{ provider: 'xai', status: 'connected' }],
  alerts: [{ code: 'TEST', level: 'warning', message: '<script>bad()</script>' }],
  updatedAt: '2026-07-30T00:00:00.000Z',
});

assert.match(html, /Your ACE account - shared across all apps/);
assert.match(html, /NPC Forge/);
assert.match(html, /xAI/);
assert.match(html, /215/);
assert.doesNotMatch(html, /must-not-render/);
assert.doesNotMatch(html, /<script>bad/);
assert.doesNotMatch(html, /<img src=x onerror/);
assert.match(html, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
assert.match(html, /Manage ACE account/);

console.log('ACE account panel package tests passed.');
