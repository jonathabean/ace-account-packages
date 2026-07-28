export const ACE_ACCOUNT_API_VERSION = '2026-07-29.1';
export const ACE_ACCOUNT_DEFAULT_BASE_URL = 'https://app.npc-forge.com';

export const ACE_ACCOUNT_APPS = Object.freeze({
  'npc-forge': 'https://app.npc-forge.com',
  'scribe-notes': 'https://notes.npc-forge.com',
  'item-forge': 'https://items.npc-forge.com',
  'dq-characters': 'https://characters.npc-forge.com',
  'dq-rumours': 'https://rumours.npc-forge.com',
  'seagate-troubles': 'https://troubles.npc-forge.com',
  'dq-gm-mentor': 'https://mentor.npc-forge.com',
});

export class AceAccountClientError extends Error {
  constructor(code, message, status = 0) {
    super(message);
    this.name = 'AceAccountClientError';
    this.code = code;
    this.status = status;
  }
}

function requiredFunction(value, label) {
  if (typeof value !== 'function') {
    throw new TypeError(`${label} must be a function.`);
  }
  return value;
}

function safeBaseUrl(value) {
  const url = new URL(value || ACE_ACCOUNT_DEFAULT_BASE_URL);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new TypeError('ACE account base URL must use HTTPS.');
  }
  return url.origin;
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AceAccountClientError('ACE_INVALID_RESPONSE', `${label} is invalid.`);
  }
  return value;
}

export function validateAceAccountSummary(value) {
  const summary = assertObject(value, 'ACE account summary');
  const identity = assertObject(summary.identity, 'ACE account identity');
  const plan = assertObject(summary.plan, 'ACE account plan');
  const balance = assertObject(summary.balance, 'ACE account balance');
  const usage = assertObject(summary.usage, 'ACE account usage');
  if (typeof identity.uid !== 'string' || !identity.uid) {
    throw new AceAccountClientError('ACE_INVALID_RESPONSE', 'ACE account UID is missing.');
  }
  if (typeof plan.name !== 'string' || typeof plan.status !== 'string') {
    throw new AceAccountClientError('ACE_INVALID_RESPONSE', 'ACE account plan is invalid.');
  }
  for (const key of ['monthly', 'purchased', 'promotional', 'total']) {
    if (!Number.isFinite(Number(balance[key])) || Number(balance[key]) < 0) {
      throw new AceAccountClientError('ACE_INVALID_RESPONSE', `ACE balance ${key} is invalid.`);
    }
  }
  if (!Array.isArray(summary.appAccess)
    || !Array.isArray(summary.providerConnections)
    || !Array.isArray(summary.alerts)
    || !Array.isArray(usage.byApp)) {
    throw new AceAccountClientError('ACE_INVALID_RESPONSE', 'ACE summary lists are invalid.');
  }
  return summary;
}

async function parseResponse(response) {
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new AceAccountClientError(
      'ACE_INVALID_RESPONSE',
      'ACE returned an unreadable response.',
      response.status,
    );
  }
  if (!response.ok || payload?.ok !== true) {
    const code = String(payload?.error?.code || 'ACE_REQUEST_FAILED');
    const message = String(payload?.error?.message || 'ACE account request failed.');
    throw new AceAccountClientError(code, message, response.status);
  }
  return payload;
}

export function createAceAccountClient(options) {
  const appId = String(options?.appId || '');
  if (!Object.hasOwn(ACE_ACCOUNT_APPS, appId)) {
    throw new TypeError(`Unknown ACE suite app: ${appId || '(missing)'}.`);
  }
  const getIdToken = requiredFunction(options?.getIdToken, 'getIdToken');
  const fetchImpl = requiredFunction(options?.fetch || globalThis.fetch, 'fetch');
  const baseUrl = safeBaseUrl(options?.baseUrl);

  async function authenticatedFetch(path, init = {}, forceRefresh = false) {
    const token = await getIdToken(forceRefresh);
    if (typeof token !== 'string' || !token.trim()) {
      throw new AceAccountClientError(
        'ACE_AUTH_REQUIRED',
        'A valid signed-in suite account is required.',
        401,
      );
    }
    return fetchImpl(`${baseUrl}${path}`, {
      ...init,
      cache: 'no-store',
      credentials: 'omit',
      headers: {
        Accept: 'application/json',
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async function requestWithTokenRefresh(path, init) {
    let response = await authenticatedFetch(path, init, false);
    if (response.status === 401) {
      response = await authenticatedFetch(path, init, true);
    }
    return parseResponse(response);
  }

  return Object.freeze({
    appId,
    baseUrl,
    async loadSummary(options = {}) {
      const payload = await requestWithTokenRefresh('/api/ace/account/summary', {
        method: 'GET',
        signal: options.signal,
      });
      return validateAceAccountSummary(payload.summary);
    },
    async createHandoff(input = {}) {
      const destination = String(input.destination || '/forge/account');
      const returnTo = String(input.returnTo || ACE_ACCOUNT_APPS[appId]);
      const payload = await requestWithTokenRefresh('/api/ace/account/handoff', {
        method: 'POST',
        signal: input.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, destination, returnTo }),
      });
      if (typeof payload.handoffUrl !== 'string') {
        throw new AceAccountClientError(
          'ACE_INVALID_RESPONSE',
          'ACE handoff URL is missing.',
        );
      }
      const url = new URL(payload.handoffUrl);
      if (url.origin !== baseUrl) {
        throw new AceAccountClientError(
          'ACE_INVALID_RESPONSE',
          'ACE handoff URL has an unexpected origin.',
        );
      }
      return url.toString();
    },
  });
}
