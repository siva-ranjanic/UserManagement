# Testing: RBAC (Sprint 4)

This document provides instructions for testing the Role-Based Access Control features implemented in Sprint 4.

## Prerequisites
1. Restart the server (`npm run start:dev`). The `SeederService` will automatically generate the default roles (`Admin`, `Manager`, `User`) and permissions (`user:create`, `user:update`, `user:view`).
2. Login as the administrative user you created in Sprint 3 to get an `access_token`.

## 1. Manage Permissions

**Get All Permissions:**
```bash
curl -X GET http://localhost:3000/admin/permissions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Create a New Custom Permission:**
```bash
curl -X POST http://localhost:3000/admin/permissions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "report:generate",
    "description": "Can generate financial reports"
  }'
```

## 2. Manage Roles

**Get All Roles:**
```bash
curl -X GET http://localhost:3000/admin/roles \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
*Note down the ObjectId for the "Manager" role and the new "report:generate" permission.*

**Assign Permission to Role:**
```bash
curl -X POST http://localhost:3000/admin/roles/ROLE_ID/permissions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionIds": ["PERMISSION_ID"]
  }'
```

## 3. Verify Guard Behavior

By default, the `@RequirePermissions()` decorator can now be used on any endpoint to restrict access based on the logged-in user's roles.

1. Create a normal user via the public `POST /users/register` endpoint (they will automatically receive the `User` role).
2. Create another user as an Admin via `POST /admin/users` and assign them the `Manager` role ObjectId in the `roles` array.
3. Login as both to get their respective tokens and verify they cannot access endpoints protected by `PermissionsGuard` if they lack the matrix requirement.
