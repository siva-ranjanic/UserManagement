# Testing Guide: Sprint 6 — Audit Logs & Analytics

## Prerequisites
- Server running (`npm run start:dev`)
- Logged in as an **Admin** user.

---

## 1. Triggering Audit Logs

### A. Login Success/Failure
- Perform a login (success or failure).
- Check the `auditlogs` collection in MongoDB or via the API.

### B. User Management Action
- Create or Update a user via the Admin API.
- Verify a log entry with action `USER_CREATE` or `USER_UPDATE` is created.

---

## 2. Viewing Audit Logs

```bash
curl -X GET http://localhost:3000/admin/audit-logs \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Filter by Action:**
```bash
curl -X GET "http://localhost:3000/admin/audit-logs?action=LOGIN" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 3. Dashboard Analytics

```bash
curl -X GET http://localhost:3000/admin/dashboard/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response Structure:**
```json
{
  "success": true,
  "data": {
    "overview": { "totalUsers": 10, "activeUsers": 8, ... },
    "roleDistribution": [ { "name": "Admin", "count": 2 }, ... ],
    "recentActivity": [ { "_id": "2023-10-27", "count": 5 }, ... ],
    "latestAuditLogs": [ ... ]
  }
}
```

---

## 4. Exporting to CSV

```bash
curl -X GET http://localhost:3000/admin/audit-logs/export \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  --output audit_logs.csv
```
- Open `audit_logs.csv` and verify it contains the correct columns and data entries.

---

## 5. Security Check
- Try to access these endpoints with a **regular user token**.
- Expected: **403 Forbidden** (RolesGuard enforcement).
