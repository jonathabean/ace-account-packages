# ACE Account Packages Handover

Snapshot: 2026-08-13

## Purpose

This repository publishes the suite's secret-free Account & Settings browser packages. It is shared infrastructure for authenticated account summaries and secure cross-app handoff, not a standalone user-facing application.

## What It Owns

- `packages/ace-account-client`: authenticated account-summary and handoff client.
- `packages/ace-account-panel`: framework-neutral `<ace-account-panel>` web component.
- Versioned tarballs consumed by suite applications through pinned release URLs and lockfile integrity.

Host apps remain responsible for Firebase configuration and for supplying the signed-in user's `getIdToken` callback. This repository must never contain credentials, provider keys, billing secrets, or user data.

## Local Workflow

```powershell
npm ci
npm test
npm run pack:client
npm run pack:panel
```

Tests run directly against both packages. Packing creates the release artifacts used by consumers.

## Repository Snapshot

- Branch: `main`
- Commit: `759ca19` (`Add idempotent ACE account provisioning client`, 2026-07-29)
- Worktree before this handover: clean
- Remote: `jonathabean/ace-account-packages`

## Next Actions

1. Run `npm test` before changing either public package contract.
2. Audit current consumer versions before publishing a release.
3. Pack both packages and validate the tarball contents remain secret-free.
4. Update package versions and consumer lockfiles together when changing the handoff contract.

## Guardrails

- Do not embed Firebase project configuration or credentials.
- Preserve compatibility between the client and panel packages.
- Treat tarballs as release artifacts; do not hand-edit generated archives.
- Verify package consumers before removing or renaming exports.

## Key References

- `README.md`
- `package.json`
- `packages/ace-account-client/`
- `packages/ace-account-panel/`
