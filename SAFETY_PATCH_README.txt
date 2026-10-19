SNNS 365 - SAFETY PATCH (REVIEW ONLY, DO NOT DEPLOY)

Changed: server.ts, src/components/apps/TeamsApp.tsx

Security changes:
- Disabled insecure admin identity based on caller-provided headers and hardcoded passcodes. Admin routes FAIL CLOSED pending real server-side identity verification.
- Disabled unauthenticated in-memory internal mail endpoints pending integration with the actual VPS authenticated mail API. Existing production mailbox data untouched.
- Removed fake successful Daily.co room fallback; errors return 503.
- Prevented SPA HTML fallback for unknown /api paths (JSON 404).
- Added guard against mail proxy self-loop when hosted on api.snns.pro.
- Removed fake success fallback in meeting creation UI.

IMPORTANT: This is NOT a finished production integration. It intentionally disables unsafe admin/internal mail routes until secure backend routes and Firebase Admin SDK validation are available. Do not deploy without completing those integrations, regression tests, and explicit approval. No external API calls or real-account tests were performed.
