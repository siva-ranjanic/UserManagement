# Testing Guide: Sprint 5 — Sessions & Security

## Prerequisites
- Server running (`npm run start:dev`)
- A registered user account (login to get tokens)

---

## 1. Login & Session Creation

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "Password123!"}'
```

**Expected Response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "session_id": "...",
  "user": { ... }
}
```
> Save all three returned values for subsequent tests.

---

## 2. View Active Sessions

```bash
curl -X GET http://localhost:3000/auth/sessions \
  -H "Authorization: Bearer ACCESS_TOKEN"
```
> Should return a list of active sessions with `device`, `ipAddress`, and `lastActivity`.

---

## 3. Refresh Access Token (Token Rotation)

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
```

> Returns a **new** `access_token` and `refresh_token`. The old refresh token is now invalid.

**Replay Attack Test:**
- Send the same old `refresh_token` again.
- Expected: **401 Unauthorized** — and all sessions in that token family will be revoked.

---

## 4. Revoke a Specific Session

```bash
curl -X DELETE http://localhost:3000/auth/sessions/SESSION_ID \
  -H "Authorization: Bearer ACCESS_TOKEN"
```
> That session is now marked as revoked.

---

## 5. Logout All Devices

```bash
curl -X DELETE http://localhost:3000/auth/sessions \
  -H "Authorization: Bearer ACCESS_TOKEN"
```
> All sessions for the user are revoked. Refresh tokens from any device become invalid.

---

## 6. Rate Limiting Test

Simulate brute force against the login endpoint:
```bash
for i in {1..10}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "user@example.com", "password": "wrongpass"}';
done
```
> After 5 attempts in 60 seconds, further requests return **429 Too Many Requests**.
