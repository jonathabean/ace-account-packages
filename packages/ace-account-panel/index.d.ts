import type { AceAccountSummary } from '@npc-forge/ace-account-client';

export declare function renderAceAccountPanelHtml(summary: AceAccountSummary): string;
export declare class AceAccountPanel extends HTMLElement {
  summary: AceAccountSummary | null;
  loading: boolean;
  error: string | null;
}

declare global {
  interface HTMLElementTagNameMap {
    'ace-account-panel': AceAccountPanel;
  }
}
