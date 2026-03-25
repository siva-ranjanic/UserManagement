# Sprint 5 — Sessions & Security

Goal: implement advanced session tracking and security layers.

## Authorization
- [x] Backend permission guards (via PermissionsGuard from Sprint 4)
- [ ] Frontend route protection hooks (Sprint 6+)

## Session Management
- [x] Track device information
- [x] Track IP address
- [x] View active sessions endpoint
- [x] Logout specific device
- [x] Logout all sessions (Revoke tokens)

## Security
- [x] Rate limiting implementation (5 req/min on login, forgot-password, refresh)
- [x] Token expiration / Refresh token rotation with replay attack detection
- [x] Session timeout (access token: 15m, refresh token: 30d)

## Deliverable:
Enterprise security layer with session control.
