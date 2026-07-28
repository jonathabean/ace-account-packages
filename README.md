# ACE Account Packages

Canonical, versioned, secret-free browser packages for the shared NPC Forge
suite Account & Settings hub.

## Packages

- `@npc-forge/ace-account-client`: authenticated account-summary and secure
  handoff client.
- `@npc-forge/ace-account-panel`: framework-neutral `<ace-account-panel>` web
  component.

The packages contain no Firebase configuration, credentials, provider keys,
service secrets, billing secrets, or user data. Host applications provide their
existing Firebase user's `getIdToken` callback.

Releases attach npm tarballs. Consumer applications pin the release URL and
integrity through their package lock.
