# 1. Realize Auth Module with Role Bindings & Refresh Tokens

This step covers the complete realization of standard, enterprise-grade authentication for the CaspX platform. It includes the database schema definition for users, user roles, and refresh tokens, as well as the implementation of JWT-based authentication, token rotation, rate-limiting, custom guards, unit tests, and integration (E2E) tests.

## 1. Database Schema (`prisma/schema.prisma`)
Define models:
- `UserRole` enum: `CLIENT`, `CARRIER`, `ADMIN`.
- `User`: Handles accounts for all roles (with fields like email, passwordHash, role, firstName, lastName, phone, avatarUrl, companyName, companyLogo, city, country, createdAt, updatedAt).
- `RefreshToken`: Enables secure token rotation, tracking users, agent details, IPs, and active status.

## 2. Dependencies & Environment Settings
- Install dependencies: `bcrypt`, `@types/bcrypt`.
- Configure `.env` with:
  - `DATABASE_URL`
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
  - `JWT_ACCESS_TTL="15m"`, `JWT_REFRESH_TTL="30d"`
  - `BCRYPT_SALT_ROUNDS=12`
  - `REGISTRATION_RATE_LIMIT_MAX=5`, `REGISTRATION_RATE_LIMIT_WINDOW_SEC=60`
  - `ME_RATE_LIMIT_MAX=120`, `ME_RATE_LIMIT_WINDOW_SEC=60`

## 3. Core Modules & Services
- **Prisma Module:** `PrismaService` extending `PrismaClient` to handle database connections.
- **Common Utils & Decorators:**
  - `password.util.ts` for safe hashing and verification.
  - `token.util.ts` for hashing refresh tokens.
  - `duration.util.ts` for parsing JWT lifetimes.
  - `request-meta.util.ts` for extracting IP/UserAgent.
  - `user-response.util.ts` to sanitize and serialize User objects before output.
  - Decorators: `@CurrentUser()`, `@Public()`, `@Roles(...)`.
- **Repositories:**
  - `UsersRepository` in `users/repositories/users.repository.ts`
  - `RefreshTokenRepository` in `auth/repositories/refresh-token.repository.ts`
- **Guards:**
  - `JwtAuthGuard` - authenticates JWT tokens, sets `request.authUser`.
  - `RolesGuard` - restricts access by user roles.
  - `RegisterRateLimitGuard` & `MeRateLimitGuard` - prevents brute-force / DDoS.
- **Services:**
  - `TokenService` - handles issuing, checking and verifying JWT access & refresh tokens.
  - `AuthService` - registers accounts, processes login, manages rotation of refresh tokens, handles logout, retrieves profile `/auth/me`.
- **Controller:**
  - `AuthController` exposing endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`.

## 4. Testing Framework Integration
- **Unit Tests:**
  - For `AuthService` covering successful login, invalid credentials, and profile retrieval.
  - For `TokenService` checking correct JWT issuing.
- **End-to-End (E2E) Tests:**
  - Test registration, login, refresh tokens, rate limiting, and profile endpoint with bearer token.
- Add scripting under `package.json`:
  - `test:auth` to run auth specific tests.
