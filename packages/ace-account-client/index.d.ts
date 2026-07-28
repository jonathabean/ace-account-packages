export type AceAccountAppId =
  | 'npc-forge'
  | 'scribe-notes'
  | 'item-forge'
  | 'dq-characters'
  | 'dq-rumours'
  | 'seagate-troubles'
  | 'dq-gm-mentor';

export type AceAccountSummary = {
  identity: { uid: string; displayName: string | null; email: string | null; avatarUrl: string | null };
  plan: { name: string; status: string; monthlyAllowance: number };
  balance: { monthly: number; purchased: number; promotional: number; total: number };
  usage: {
    windowStart: string;
    windowEnd: string;
    credits: number;
    inputTokens: number;
    outputTokens: number;
    byApp: Array<{ appId: string; credits: number; inputTokens: number; outputTokens: number }>;
  };
  appAccess: Array<{ appId: AceAccountAppId; enabled: boolean }>;
  providerConnections: Array<{
    provider: 'google' | 'openai' | 'xai';
    status: 'connected' | 'not_connected' | 'needs_attention';
  }>;
  alerts: Array<{ code: string; level: 'info' | 'warning' | 'error'; message: string }>;
  updatedAt: string;
};

export declare const ACE_ACCOUNT_API_VERSION: string;
export declare const ACE_ACCOUNT_DEFAULT_BASE_URL: string;
export declare const ACE_ACCOUNT_APPS: Readonly<Record<AceAccountAppId, string>>;
export declare class AceAccountClientError extends Error {
  code: string;
  status: number;
}
export declare function validateAceAccountSummary(value: unknown): AceAccountSummary;
export declare function createAceAccountClient(options: {
  appId: AceAccountAppId;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
  fetch?: typeof fetch;
  baseUrl?: string;
}): {
  appId: AceAccountAppId;
  baseUrl: string;
  ensureAccount(options?: { signal?: AbortSignal }): Promise<{
    ready: boolean;
    created: boolean;
  }>;
  loadSummary(options?: { signal?: AbortSignal }): Promise<AceAccountSummary>;
  createHandoff(input?: {
    destination?: string;
    returnTo?: string;
    signal?: AbortSignal;
  }): Promise<string>;
};
