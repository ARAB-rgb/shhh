# SNNS 365 — REVIEW ONLY / NOT PRODUCTION READY

Source: user-provided `snns.pro-windows-11 (11).zip`.

## Changes in server.ts
- Removed in-memory `internalMessagesDB` and fake send/receive endpoints.
- Mail routes now fail closed with 503 unless explicitly configured to proxy to an independently implemented secure mail API. This ZIP does **not** implement IMAP/SMTP; no live email claim.
- Require a bearer header on mail routes. **Upstream must verify the token and mailbox ownership**; forwarding a token alone does not guarantee security.
- Removed static admin-passcode and unverified-email admin access. Admin routes fail closed until a trusted backend identity verifier is implemented. Some admin features will not work.
- Removed fake Daily.co fallback room success.
- Return JSON 404 for unknown API routes before the SPA fallback.

## Deployment blockers
1. Implement and test Firebase ID token verification on a trusted backend and secure admin membership lookup.
2. Implement authenticated IMAP/SMTP-backed mail API with mailbox isolation on VPS, without changing working Postfix/Dovecot configuration.
3. Confirm independent upstream host (avoid proxy loop), verify all mail endpoints and CORS.
4. Test two authorized accounts, mail send/receive, external delivery, and Daily.co two-person call.
5. Run `npm install`, `npm run lint`, `npm run build` in an isolated environment before deployment. These tests have not been run here.

No production services, databases, or mail settings were changed.
