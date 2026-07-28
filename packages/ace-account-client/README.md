# ACE Account Client

Framework-neutral, secret-free browser client for the NPC Forge suite ACE account
summary and central account handoff.

The host application supplies its existing Firebase user's `getIdToken` callback.
No Firebase configuration, provider credential, or shared service secret is
stored by this package.
