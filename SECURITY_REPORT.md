# Security report
2026-11-25: frontend-only prototype, no secrets, no auth, no user data. `poweredByHeader` off. Recent searches stored in localStorage (non-sensitive, try/catch). Pending: CSP, dependency audit in CI, API security (milestone 08+).

2026-11-25 (API): helmet headers, CORS allowlist with credentials, global rate limit 300/min + 10/min on auth, zod validation on every input, Prisma (parameterised SQL), scrypt N=2^15 password hashing, session tokens stored as SHA-256 hashes, httpOnly SameSite=Lax cookies (Secure in production), HMAC-SHA256 webhook verification with timing-safe compare, idempotent webhooks/orders, AES-256-GCM activation material at rest, owner checks on eSIM reads, order lookups require an access token (sent in URL fragment, not to servers). Open: CSRF tokens for state-changing cookie-auth routes beyond SameSite=Lax, email verification, MFA for admin roles, dependency audit in CI, CSP on web.

## Back office (2026-11-25)
- Every `/v1/admin/*` route checks the role server-side (401 anonymous, 403 wrong role); tests cover each route.
- Activation codes are never returned by admin routes (test asserts no LPA/SM-DP+ in order detail). Responses are `Cache-Control: no-store`.
- Every change (plan price/active, supplier enabled, user role, retry provisioning) writes an AuditLog row with actor, IP and before/after.
- Role changes revoke the target's sessions. Admins can't change their own role. Price can't go below wholesale.
- Retry provisioning flips PROVISIONING_FAILED → PAID atomically, so double clicks can't provision twice.
- Open: MFA for staff accounts (schema has `mfaSecret`), IP allow-listing for /admin, admin session lifetime shorter than 30 days.
