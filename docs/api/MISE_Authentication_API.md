# MISE — Authentication API

**Project:** MISE — Smart Pantry & Cooking  
**Deliverable:** D3 · Backend / Flutter integration  
**Version:** 1.0 · 27 November 2026  
**Status:** Local authentication integration tests passed (reported by backend developer).

## 1. Connecting to the backend

| Environment | Base URL |
|---|---|
| Postman / backend computer | `http://localhost:5000` |
| Standard Android Studio emulator | `http://10.0.2.2:5000` |
| Physical Android device on same LAN | `http://<backend-computer-LAN-IP>:5000` |
| Deployed backend | HTTPS URL to be supplied later |

The backend must be running with MySQL, Redis and its SMTP configuration available. The physical device requires network reachability and an appropriate local firewall rule. Android debug builds may need a development-only cleartext HTTP configuration and the internet permission. Use HTTPS for deployed builds; never disable certificate verification. Do not hardcode a production URL until deployment is agreed.

Use `Content-Type: application/json` for JSON requests. On protected endpoints, supply `Authorization: Bearer <accessToken>`. Authentication responses use `Cache-Control: no-store`.

Health checks: `GET /api/health` checks server liveness; `GET /api/health/ready` checks MySQL and Redis readiness (200 if ready, 503 otherwise). SMTP delivery is not covered by readiness.

## 2. API conventions

Success:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Failure:

```json
{
  "success": false,
  "message": "Request validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "body.email", "message": "Invalid email address" }
    ]
  }
}
```

`error.details` is optional and may be an array or object depending on the code. Use `error.code` for program logic, not the English message. All returned database IDs are strings. Dates are ISO 8601 strings (or null where applicable). Never store a password or log credentials, tokens or OTPs.

## 3. Endpoint overview

All paths below are relative to the base URL.

| Method | Path | Authorization | Success |
|---|---|---|---:|
| POST | `/api/auth/register` | Public | 201 |
| POST | `/api/auth/verify-email` | OTP | 200 |
| POST | `/api/auth/resend-otp` | Public | 200 |
| POST | `/api/auth/login` | Credentials | 200 |
| POST | `/api/auth/forgot-password` | Public | 200 |
| POST | `/api/auth/verify-reset-otp` | OTP | 200 |
| POST | `/api/auth/reset-password` | Reset token | 200 |
| POST | `/api/auth/refresh` | Refresh token | 200 |
| POST | `/api/auth/logout` | Bearer access token | 200 |
| GET | `/api/auth/me` | Bearer access token | 200 |

## 4. Endpoint reference

Examples show the JSON request body and the contents of the success response's `data` property unless explicitly indicated otherwise. Example tokens are placeholders and not valid credentials.

### 4.1 Register

`POST /api/auth/register`

```json
{
  "firstName": "Alex",
  "lastName": "Morgan",
  "username": "alex_morgan",
  "email": "alex@example.com",
  "password": "MisePassword123!",
  "confirmPassword": "MisePassword123!"
}
```

HTTP 201 data:

```json
{
  "userId": "1",
  "email": "alex@example.com",
  "verificationRequired": true,
  "expiresInSeconds": 600,
  "resendAfterSeconds": 60
}
```

Navigate to email verification, retaining the email address. User, preferences and personal workspace are created in a transaction. If OTP delivery fails after the transaction commits, the account remains unverified; use the resend endpoint instead of repeatedly registering. Duplicate username/email returns 409.

### 4.2 Verify email

`POST /api/auth/verify-email`

```json
{ "email": "alex@example.com", "code": "048291" }
```

HTTP 200 data: the authenticated session object in section 5, plus `nextScreen: "ONBOARDING"`. Store the session securely and show the onboarding choices. OTP must be a string to preserve leading zeros.

### 4.3 Resend registration OTP

`POST /api/auth/resend-otp`

```json
{ "email": "alex@example.com" }
```

HTTP 200 data:

```json
{ "expiresInSeconds": 600, "resendAfterSeconds": 60 }
```

For unverified accounts. Generic success intentionally does not guarantee that an account exists or an email was sent. Honor the countdown; use the newest delivered code. This endpoint does not resend password reset codes.

### 4.4 Login

`POST /api/auth/login`

```json
{ "identifier": "alex_morgan", "password": "MisePassword123!" }
```

`identifier` may be a username or email address. HTTP 200 data: authenticated session object (section 5). HTTP 401 `INVALID_CREDENTIALS` means credentials were rejected. HTTP 403 `EMAIL_NOT_VERIFIED` includes `error.details.email`; take the user to verification and offer resend.

### 4.5 Forgot password

`POST /api/auth/forgot-password`

```json
{ "email": "alex@example.com" }
```

HTTP 200 data:

```json
{ "expiresInSeconds": 600, "resendAfterSeconds": 60 }
```

Generic response for privacy. Proceed to the password reset OTP screen; use this same endpoint for password reset OTP resend. Do not imply that an email was definitely delivered.

### 4.6 Verify password reset OTP

`POST /api/auth/verify-reset-otp`

```json
{ "email": "alex@example.com", "code": "048291" }
```

HTTP 200 data:

```json
{ "resetToken": "<64-lowercase-hex-characters>", "expiresInSeconds": 600 }
```

Keep the reset token temporarily in memory for the new password screen. This is not an access or refresh token and cannot authenticate normal API calls.

### 4.7 Reset password

`POST /api/auth/reset-password`

```json
{
  "email": "alex@example.com",
  "resetToken": "<64-lowercase-hex-characters>",
  "password": "NewMisePassword456!",
  "confirmPassword": "NewMisePassword456!"
}
```

HTTP 200 data: `{"passwordReset":true}`. All existing sessions are revoked. Clear any local session and reset token and navigate to login. If the reset token is expired or consumed, restart password recovery.

### 4.8 Refresh session

`POST /api/auth/refresh`

```json
{ "refreshToken": "<64-lowercase-hex-characters>" }
```

HTTP 200 data: authenticated session object (section 5). Replace both stored tokens together. The old refresh token is no longer valid. The original session expiration remains unchanged. Do not send concurrent refresh requests. HTTP 401 `INVALID_REFRESH_TOKEN` requires clearing local credentials and signing in again.

### 4.9 Logout

`POST /api/auth/logout`

Bearer access token required; no request body required.

HTTP 200 data: `{"loggedOut":true}`. The current session is revoked. Clear stored tokens and account/workspace state. If the access token has expired, refresh once and retry logout if possible. If offline, local logout is still possible but server revocation cannot be guaranteed.

### 4.10 Current account

`GET /api/auth/me`

Bearer access token required; no request body.

HTTP 200 data: the `user` and `workspace` objects shown in section 5, without `session` or `nextScreen`. Use this to retrieve current account and workspace information without issuing new tokens.

## 5. Authenticated response model

The following is the full response shape for login and refresh. Email verification also includes `data.nextScreen` with value `ONBOARDING`.

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "1",
      "username": "alex_morgan",
      "firstName": "Alex",
      "lastName": "Morgan",
      "email": "alex@example.com",
      "emailVerified": true,
      "createdAt": "2026-11-27T12:00:00.000Z",
      "lastLoginAt": "2026-11-27T13:00:00.000Z"
    },
    "workspace": {
      "mode": "PERSONAL",
      "workspaceId": "1",
      "personalWorkspaceId": "1",
      "household": null
    },
    "session": {
      "id": "1",
      "accessToken": "<JWT>",
      "refreshToken": "<64-lowercase-hex-characters>",
      "tokenType": "Bearer",
      "expiresInSeconds": 900,
      "refreshTokenExpiresAt": "2026-12-27T13:00:00.000Z"
    }
  }
}
```

For household users, the existing authentication service is designed to return workspace data in this shape (household integration tests are pending):

```json
{
  "mode": "HOUSEHOLD",
  "workspaceId": "8",
  "personalWorkspaceId": "1",
  "household": {
    "id": "3",
    "name": "Our Household",
    "role": "MEMBER"
  }
}
```

Role values: `ADMIN` or `MEMBER`. `personalWorkspaceId` remains available after joining a household. Active workspace and permissions are controlled by backend logic; client-supplied IDs or roles are not proof of authorization.

## 6. Input validation

| Field | Rule |
|---|---|
| `firstName`, `lastName` | Trimmed, 1–80 characters |
| `username` | Trimmed, 3–30 characters, ASCII letters, numbers and underscore |
| `email` | Trimmed, lowercase, valid email, max 254 characters |
| `password` (new) | At least 12 Unicode code points, at most 72 UTF-8 bytes |
| `password` (login) | Nonempty, at most 72 UTF-8 bytes |
| `confirmPassword` | Exact match; do not trim passwords |
| `code` | String containing exactly 6 digits |
| `refreshToken`, `resetToken` | Exactly 64 lowercase hexadecimal characters |

Unknown request fields are rejected. Mirror validation in Flutter for immediate feedback, but treat the server as authoritative. Username uniqueness is enforced by the database. Map `body.<field>` validation errors to the corresponding form field.

## 7. Error handling

| HTTP | Code | Suggested client action |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | Show field errors |
| 400 | `INVALID_JSON`, `INVALID_PASSWORD` | Correct request |
| 400 | `INVALID_OTP`, `OTP_EXPIRED` | Retry valid code or request a new one |
| 400 | `INVALID_RESET_TOKEN`, `RESET_TOKEN_EXPIRED` | Restart password recovery |
| 401 | `INVALID_CREDENTIALS` | Show login error |
| 401 | `AUTHENTICATION_REQUIRED`, `INVALID_AUTHORIZATION_HEADER` | Check client authorization header / local session |
| 401 | `TOKEN_EXPIRED` | Refresh once and retry protected request |
| 401 | `INVALID_TOKEN`, `INVALID_SESSION` | Discard invalid session and return to login |
| 401 | `INVALID_REFRESH_TOKEN`, `UNAUTHORIZED` | Return to login |
| 403 | `EMAIL_NOT_VERIFIED` | Navigate to email verification (use email in details if supplied) |
| 409 | `USERNAME_ALREADY_EXISTS`, `EMAIL_ALREADY_EXISTS` | Show duplicate field error |
| 409 | `EMAIL_ALREADY_VERIFIED` | Return to login |
| 409 | `DUPLICATE_RECORD`, `RELATIONSHIP_CONFLICT` | Display conflict and retry only if appropriate |
| 404 | `ROUTE_NOT_FOUND` | Check API path and version |
| 413 | `PAYLOAD_TOO_LARGE` | Reduce request size |
| 429 | `OTP_COOLDOWN`, `OTP_REQUEST_LIMIT`, `OTP_ATTEMPTS_EXCEEDED` | Wait or request a new code as appropriate |
| 429 | `RATE_LIMIT_EXCEEDED` | Honor `Retry-After` and `error.details.retryAfterSeconds` |
| 503 | `EMAIL_DELIVERY_FAILED`, `OTP_SERVICE_UNAVAILABLE`, `RESET_TOKEN_SERVICE_UNAVAILABLE`, `RATE_LIMIT_SERVICE_UNAVAILABLE` | Temporary service issue; retry later as appropriate |
| 500 | `INTERNAL_SERVER_ERROR` | Show generic error; do not expose internal details |

The global error middleware masks 5xx messages to `Internal server error` while retaining applicable error codes. On resend and forgot-password routes, certain OTP/delivery errors are deliberately suppressed and a generic 200 is returned. Error details are optional.

## 8. Flutter session lifecycle

1. After successful login or email verification, save the access and refresh tokens using platform-backed secure storage (for example, flutter_secure_storage). Store the pair consistently. Do not persist passwords or OTPs.
2. At app launch, load stored credentials. If no usable session exists, show login. Otherwise request `/api/auth/me` with the access token; on `TOKEN_EXPIRED`, perform a single refresh and retry. Network failure should be distinguished from invalid credentials; do not clear a valid session merely because the device is offline.
3. Use a shared API client and a single in-flight refresh operation across requests. Replace both tokens on refresh success; retry the original protected request at most once. Do not recursively refresh the refresh endpoint. A lost refresh response may require signing in again because rotation invalidates the previous token.
4. On invalid/revoked session, clear secure storage and user-specific cached data. On successful logout or password reset do the same. The backend checks the MySQL session on protected requests, so a revoked access token is rejected even before its JWT expiry.
5. Use `/api/auth/me` and future workspace endpoints to update navigation and workspace state. Do not infer that onboarding has been completed solely from `workspace.mode`.

Default lifetimes: access token 900 seconds; refresh session 30 days from creation (not sliding); email OTP 600 seconds; resend cooldown 60 seconds; reset token 600 seconds. OTP verification allows five failed attempts per challenge and issuance is limited to five requests per hour per user and purpose. Runtime configuration can override defaults. Use returned lifetimes rather than hardcoding timers where possible.

## 9. Rate limiting

| Scope | Limit / window |
|---|---|
| Registration (IP) | 10 / 15 min |
| Login (IP) | 30 / 15 min |
| Login identifier | 20 / 15 min |
| Resend + forgot password (shared IP counter) | 20 / 15 min |
| Email + reset OTP verification (shared IP counter) | 30 / 15 min |
| Password reset (IP) | 10 / 15 min |
| Refresh (IP) | 60 / 5 min |

These are fixed-window limits. A username and an email address currently have distinct identifier counters. Shared networks may reach IP limits during team testing. Redis unavailability blocks requests protected by the rate limiter.

## 10. Integration testing and outstanding work

Use `docs/postman/MISE_Authentication.postman_collection.json` for the tested flows. Import it into Postman, set the base URL and an unused controlled email, run the numbered requests in order, and enter the two emailed OTPs when prompted. The optional resend request belongs before registration verification. Use test credentials only; never commit actual emails, OTPs, tokens or secrets. Tests create persistent local records.

**Confirmed by backend developer:** all Postman tests passed locally, including registration, login, refresh rotation, password reset, previous-session revocation and logout. This is not a claim of independent test execution or production readiness.

**Not yet part of this API contract:** persisted onboarding completion; household creation/joining/invitations/permissions; profile, email and password changes while logged in; SMS preferences; account deletion; pantry, recipes and shopping. Personal workspaces currently initialize with UTC. Onboarding timezone and persisted completion need implementation before the final session-restoration navigation is fixed. HTTPS deployment, trusted proxy configuration and production security remain pending.

## 11. Repository placement

```text
MISE/
  docs/
    api/
      MISE_Authentication_API.md
    postman/
      MISE_Authentication.postman_collection.json
```

This contract reflects the implemented authentication service, validation schemas, middleware, controller and route definitions supplied during development, cross-checked against the Postman collection. Update the document when request/response contracts change.
