# Testing: User & Profile Module

Testing instructions for Profile retrieval and updates.

## 🧪 Test Case 1: Get Profile
**Endpoint:** `GET /api/users/profile`

1. Authorize in Swagger using a valid JWT token.
2. Locate `Users` -> `profile` (GET).
3. **Expected:** `200 OK` with user details (ID, Email, Names).

---

## 🧪 Test Case 2: Update Profile
**Endpoint:** `PATCH /api/users/profile`

1. Ensure Authorization is set.
2. Locate `Users` -> `profile` (PATCH).
3. Body:
   ```json
   {
     "firstName": "Senior",
     "lastName": "Developer"
   }
   ```
4. **Expected:** `200 OK` with updated details.

---

## 🧪 Test Case 3: Upload Profile Image
**Endpoint:** `POST /api/users/avatar`

1. Ensure Authorization is set.
2. Locate `Users` -> `avatar`.
3. Upload a small image file (JPG/PNG).
4. **Expected:** `200 OK` with the `avatar` path (e.g., `/uploads/avatars/...`).
5. Open `http://localhost:9000/uploads/avatars/<filename>` to verify the file is served.

---

## 🧪 Test Case 4: View Last Login
1. Login via `POST /api/auth/login`.
2. Check the `user` object in the response or call `GET /api/users/profile`.
3. **Expected:** A `lastLogin` timestamp should be visible and match your current activity.
