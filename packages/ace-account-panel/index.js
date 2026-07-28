const HTMLElementBase = globalThis.HTMLElement || class {};

const APP_LABELS = Object.freeze({
  'npc-forge': 'NPC Forge',
  'scribe-notes': 'Scribe Notes',
  'item-forge': 'Item Forge',
  'dq-characters': 'DQ Characters',
  'dq-rumours': 'DQ Rumours',
  'seagate-troubles': 'Seagate Troubles',
  'dq-gm-mentor': 'DQ GM Mentor',
});

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function number(value) {
  const safe = Number(value || 0);
  return Number.isFinite(safe) && safe >= 0 ? safe.toLocaleString() : '0';
}

function numeric(value) {
  const safe = Number(value || 0);
  return Number.isFinite(safe) && safe >= 0 ? safe : 0;
}

function initials(name, email) {
  const source = String(name || email || 'ACE').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts.at(-1)[0]}` : source.slice(0, 2))
    .toUpperCase();
}

function providerLabel(provider) {
  return provider === 'xai' ? 'xAI' : `${provider[0].toUpperCase()}${provider.slice(1)}`;
}

function statusLabel(status) {
  if (status === 'connected') return 'Connected';
  if (status === 'needs_attention') return 'Needs attention';
  return 'Not connected';
}

export function renderAceAccountPanelHtml(summary) {
  const identity = summary.identity || {};
  const balance = summary.balance || {};
  const usage = summary.usage || {};
  const avatar = identity.avatarUrl
    ? `<img src="${escapeHtml(identity.avatarUrl)}" alt="" referrerpolicy="no-referrer">`
    : `<span>${escapeHtml(initials(identity.displayName, identity.email))}</span>`;
  const alerts = (summary.alerts || []).map((alert) => `
    <div class="alert ${escapeHtml(alert.level)}" role="${alert.level === 'error' ? 'alert' : 'status'}">
      ${escapeHtml(alert.message)}
    </div>`).join('');
  const apps = (summary.appAccess || []).map((app) => `
    <li><span>${escapeHtml(APP_LABELS[app.appId] || app.appId)}</span>
      <strong class="${app.enabled ? 'enabled' : 'disabled'}">${app.enabled ? 'Enabled' : 'Not enabled'}</strong>
    </li>`).join('');
  const providers = (summary.providerConnections || []).map((connection) => `
    <li><span>${escapeHtml(providerLabel(connection.provider))}</span>
      <strong class="${escapeHtml(connection.status)}">${escapeHtml(statusLabel(connection.status))}</strong>
    </li>`).join('');

  return `
    <section class="account" aria-labelledby="ace-account-title">
      <header>
        <div class="avatar">${avatar}</div>
        <div class="identity">
          <p class="eyebrow">Your ACE account - shared across all apps</p>
          <h2 id="ace-account-title">${escapeHtml(identity.displayName || 'ACE account')}</h2>
          <p>${escapeHtml(identity.email || '')}</p>
        </div>
        <span class="plan">${escapeHtml(summary.plan?.name || 'Plan')}</span>
      </header>
      ${alerts}
      <div class="grid">
        <article>
          <p class="label">Credits available</p>
          <p class="total">${number(balance.total)}</p>
          <dl>
            <div><dt>Monthly</dt><dd>${number(balance.monthly)}</dd></div>
            <div><dt>Purchased</dt><dd>${number(balance.purchased)}</dd></div>
            <div><dt>Promotional</dt><dd>${number(balance.promotional)}</dd></div>
          </dl>
        </article>
        <article>
          <p class="label">Current usage</p>
          <p class="total">${number(numeric(usage.inputTokens) + numeric(usage.outputTokens))} <small>tokens</small></p>
          <dl>
            <div><dt>Input</dt><dd>${number(usage.inputTokens)}</dd></div>
            <div><dt>Output</dt><dd>${number(usage.outputTokens)}</dd></div>
            <div><dt>Credits used</dt><dd>${number(usage.credits)}</dd></div>
          </dl>
        </article>
      </div>
      <div class="lists">
        <article><h3>App access</h3><ul>${apps || '<li>No app access information.</li>'}</ul></article>
        <article><h3>AI connections</h3><ul>${providers || '<li>No connection information.</li>'}</ul></article>
      </div>
      <footer>
        <span>Updated ${escapeHtml(summary.updatedAt || '')}</span>
        <button type="button" data-action="manage">Manage ACE account</button>
      </footer>
    </section>`;
}

const styles = `
  :host { display:block; color:var(--ace-text,#f7ead7); font:14px/1.45 Inter,ui-sans-serif,system-ui,sans-serif; }
  * { box-sizing:border-box; }
  .account { background:linear-gradient(145deg,var(--ace-panel,#351d14),var(--ace-panel-2,#1e1210)); border:1px solid var(--ace-border,#68402e); border-radius:16px; padding:20px; box-shadow:0 16px 40px #0003; }
  header { display:flex; align-items:center; gap:12px; }
  .avatar { width:48px; height:48px; flex:0 0 48px; display:grid; place-items:center; overflow:hidden; border:2px solid var(--ace-accent,#f09a32); border-radius:50%; background:#fff; color:#3a2118; font-weight:800; }
  .avatar img { width:100%; height:100%; object-fit:cover; }
  .identity { min-width:0; flex:1; }
  h2,h3,p { margin:0; } h2 { font-size:20px; } h3 { font-size:14px; margin-bottom:8px; }
  .identity>p:last-child { color:var(--ace-muted,#d1bda8); overflow:hidden; text-overflow:ellipsis; }
  .eyebrow,.label { color:var(--ace-accent,#f6a13b); font-size:11px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
  .plan { border:1px solid var(--ace-border,#68402e); border-radius:999px; padding:5px 10px; font-weight:800; }
  .grid,.lists { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-top:16px; }
  article { background:#ffffff08; border:1px solid var(--ace-border,#68402e); border-radius:12px; padding:14px; }
  .total { margin:3px 0 8px; font-size:28px; font-weight:850; } small { font-size:12px; color:var(--ace-muted,#d1bda8); }
  dl { margin:0; } dl div,li { display:flex; justify-content:space-between; gap:10px; padding:4px 0; }
  dt,li span { color:var(--ace-muted,#d1bda8); } dd { margin:0; font-weight:750; }
  ul { list-style:none; margin:0; padding:0; }
  .enabled,.connected { color:#75d49a; } .disabled,.not_connected { color:var(--ace-muted,#d1bda8); } .needs_attention { color:#ffc56e; }
  .alert { margin-top:12px; border-radius:9px; padding:9px 11px; } .alert.warning { background:#ffc10718; border:1px solid #ffc10755; } .alert.error { background:#ef444418; border:1px solid #ef444466; }
  footer { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:16px; color:var(--ace-muted,#d1bda8); font-size:11px; }
  button { min-height:40px; border:1px solid var(--ace-accent,#f09a32); border-radius:9px; padding:8px 14px; background:var(--ace-accent,#f09a32); color:#24140f; font:inherit; font-weight:850; cursor:pointer; }
  button:focus-visible { outline:3px solid #fff; outline-offset:3px; }
  .state { min-height:160px; display:grid; place-items:center; text-align:center; border:1px solid var(--ace-border,#68402e); border-radius:16px; padding:24px; background:var(--ace-panel,#351d14); }
  @media(max-width:600px) { .grid,.lists { grid-template-columns:1fr; } header { align-items:flex-start; } .plan { margin-left:auto; } footer { align-items:stretch; flex-direction:column; } button { width:100%; } }
`;

export class AceAccountPanel extends HTMLElementBase {
  #summary = null;
  #loading = true;
  #error = null;

  constructor() {
    super();
    if (this.attachShadow) this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  set summary(value) {
    this.#summary = value;
    this.#loading = false;
    this.#error = null;
    this.render();
  }

  get summary() {
    return this.#summary;
  }

  set loading(value) {
    this.#loading = Boolean(value);
    this.render();
  }

  set error(value) {
    this.#error = value ? String(value) : null;
    this.#loading = false;
    this.render();
  }

  render() {
    if (!this.shadowRoot) return;
    const content = this.#loading
      ? '<div class="state" role="status">Loading ACE account...</div>'
      : this.#error
        ? `<div class="state" role="alert"><div><p>${escapeHtml(this.#error)}</p><button type="button" data-action="retry">Retry</button></div></div>`
        : this.#summary
          ? renderAceAccountPanelHtml(this.#summary)
          : '<div class="state" role="status">ACE account details are unavailable.</div>';
    this.shadowRoot.innerHTML = `<style>${styles}</style>${content}`;
    this.shadowRoot.querySelector('[data-action="retry"]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ace-retry', { bubbles: true, composed: true }));
    });
    this.shadowRoot.querySelector('[data-action="manage"]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ace-manage', { bubbles: true, composed: true }));
    });
  }
}

if (globalThis.customElements && !globalThis.customElements.get('ace-account-panel')) {
  globalThis.customElements.define('ace-account-panel', AceAccountPanel);
}
