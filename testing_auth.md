# Testing: Authentication Module

Testing instructions for User Registration and JWT Login.

## 🧪 Test Case 1: User Registration
**Endpoint:** `POST /api/users/register`

1. Open Swagger: `http://localhost:9000/api/docs`
2. Locate `Users` -> `register`.
3. Body:
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john.auth@example.com",
     "password": "SecurePassword123!"
   }
   ```
4. **Expected:** `201 Created`.

---

## 🧪 Test Case 2: User Login
**Endpoint:** `POST /api/auth/login`

1. Locate `Authentication` -> `login`.
2. Body:
   ```json
   {
     "email": "john.auth@example.com",
     "password": "SecurePassword123!"
   }
   ```
3. **Expected:** `200 OK` with `access_token`.
4. **Action:** Copy the token for subsequent tests.

---

## 🧪 Test Case 3: Change Password (Authenticated)
**Endpoint:** `POST /api/auth/change-password`

1. **Authorize** in Swagger using the `access_token` from Test Case 2.
2. Locate `Authentication` -> `change-password`.
3. Body:
   ```json
   {
     "oldPassword": "SecurePassword123!",
     "newPassword": "NewSecurePass888!"
   }
   ```
4. **Expected:** `200 OK`. You can verify by logging in again with the new password.

---

## 🧪 Test Case 4: Forgot Password
**Endpoint:** `POST /api/auth/forgot-password`

1. Locate `Authentication` -> `forgot-password`.
2. Body:
   ```json
   {
     "email": "john.auth@example.com"
   }
   ```
3. **Execute**.
4. **Expected:** `200 OK`. 
5. **Check Terminal/Console**: Look for the `[MAIL MOCK]` output. Copy the `Reset Token` printed there.

---

## 🧪 Test Case 5: Reset Password
**Endpoint:** `POST /api/auth/reset-password`

1. Locate `Authentication` -> `reset-password`.
2. Body (using the token from terminal):
   ```json
   {
     "token": "YOUR_TOKEN_FROM_CONSOLE",
     "newPassword": "FinalResetPass999!"
   }
   ```
3. **Expected:** `200 OK`. The password has been reset successfully.
