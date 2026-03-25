# Testing: Security & Global Features

Testing instructions for Global Prefix, Headers, and Rate Limiting.

## 🧪 Test Case 1: Global Prefix Verification
1. Try accessing `http://localhost:9000/users/register` (without `/api`).
2. **Expected:** `404 Not Found`.
3. Try accessing `http://localhost:9000/api/users/register`.
4. **Expected:** Standard response (201 or 400).

---

## 🧪 Test Case 2: Unauthorized Access
1. Try `GET /api/users/profile` without a token.
2. **Expected:** `401 Unauthorized` with standardized JSON error.

---

## 🧪 Test Case 3: Rate Limiting (Throttler)
1. Rapidly execute the Login endpoint (more than 10 times in a minute).
2. **Expected:** `429 Too Many Requests`.
