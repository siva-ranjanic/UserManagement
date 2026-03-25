# Testing: Admin User Management (Sprint 3)

Testing instructions for the Admin User Management module.

## Prerequisites
1. Ensure you have a user with the `role` set to `admin` in the database.
2. Login with this admin user via `POST /api/auth/login` and copy the `access_token`.
3. Set Authorization header in Swagger/Postman to use this Bearer token.

---

## 🧪 Test Case 1: Create User (Admin)
**Endpoint:** `POST /api/admin/users`

1. Provide an admin-level JWT.
2. Body:
   ```json
   {
     "firstName": "Test",
     "lastName": "User",
     "email": "test.user@example.com",
     "password": "Password123!",
     "role": "user",
     "isActive": true
   }
   ```
3. **Expected:** `201 Created` with the new user's structured data (excluding password hash).

---

## 🧪 Test Case 2: List Users (Admin)
**Endpoint:** `GET /api/admin/users`

1. Provide an admin-level JWT.
2. Append query parameters (e.g., `?page=1&limit=5&search=Test`).
3. **Expected:** `200 OK` returning a paginated list of users (`users` array, `total` count) matching the filters.

---

## 🧪 Test Case 3: Update User (Admin)
**Endpoint:** `PATCH /api/admin/users/:id`

1. Use an existing user ID.
2. Provide an admin-level JWT.
3. Body:
   ```json
   {
     "firstName": "UpdatedName"
   }
   ```
4. **Expected:** `200 OK` with the updated user details.

---

## 🧪 Test Case 4: Change User Status
**Endpoint:** `PATCH /api/admin/users/:id/status`

1. Use an existing user ID.
2. Body:
   ```json
   {
     "isActive": false
   }
   ```
3. **Expected:** `200 OK`. The user's `isActive` flag should become `false`.

---

## 🧪 Test Case 5: Explicit Password Reset
**Endpoint:** `POST /api/admin/users/:id/reset-password`

1. Use an existing user ID.
2. Body:
   ```json
   {
     "newPassword": "NewPassword123!"
   }
   ```
3. **Expected:** `200 OK`. The user can now log in with the new password.

---

## 🧪 Test Case 6: Soft Delete User
**Endpoint:** `DELETE /api/admin/users/:id`

1. Use an existing user ID.
2. **Expected:** `200 OK`.
3. Call `GET /api/admin/users` and ensure the soft-deleted user is no longer returned in the list.
4. (Optional) Check the database directly; the `deletedAt` field should now have a timestamp instead of `null`.
