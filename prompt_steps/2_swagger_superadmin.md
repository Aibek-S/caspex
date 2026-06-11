# 2. Swagger Integration & Superadmin Control Layer

This step documents the API documentation setup and the first platform-owner control layer. The goal is to keep `ADMIN` as a dashboard/analytics role for Akimat users, while introducing `SUPERADMIN` as a technical owner role with full user-management capabilities.

## 1. Current Readiness Checklist

- Auth module is implemented with JWT access tokens, refresh tokens, token rotation and logout.
- User roles exist in Prisma: `CLIENT`, `CARRIER`, `ADMIN`, `SUPERADMIN`.
- Public auth endpoints exist: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`.
- Public registration is restricted to non-administrative roles. `ADMIN` and `SUPERADMIN` cannot be registered through `/auth/register`.
- Swagger UI is enabled at `/docs`, and OpenAPI JSON is available at `/docs-json`.
- Swagger Bearer auth is configured with persisted authorization for easier local debugging.
- Global request validation is enabled through Nest `ValidationPipe`.
- Superadmin bootstrap is implemented from environment variables.
- Superadmin user-management endpoints are implemented under `/superadmin/users`.
- Unit/build/e2e checks pass in the codebase. E2E may need elevated local permissions because Supertest opens a local listener.

## 2. Database Schema & Migration

- `UserRole` enum now includes:
  - `CLIENT`
  - `CARRIER`
  - `ADMIN`
  - `SUPERADMIN`
- Migration file:
  - `prisma/migrations/20260611000000_add_superadmin_role/migration.sql`
- Migration operation:
  - `ALTER TYPE "UserRole" ADD VALUE 'SUPERADMIN';`

Important database note:

- The migration requires the existing PostgreSQL enum type `"UserRole"` to already exist.
- If the local database is empty or was created manually without Prisma migrations, use `npx prisma db push` for local synchronization or create/apply the initial migration before this role migration.

## 3. Environment Configuration

Development `.env` includes long-lived access tokens for Swagger debugging:

- `JWT_ACCESS_TTL="2d"`
- `JWT_REFRESH_TTL="30d"`

Production recommendation:

- Use a short access token TTL, for example `JWT_ACCESS_TTL="15m"`.

Bootstrap superadmin environment variables:

- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD`
- `SUPERADMIN_FIRST_NAME`
- `SUPERADMIN_LAST_NAME`
- `SUPERADMIN_PHONE`

Bootstrap behavior:

- If all superadmin env values are missing, no bootstrap user is created.
- If some values are present but not all required values are set, application startup fails.
- If `SUPERADMIN_EMAIL` already exists with role `SUPERADMIN`, startup continues without changing the password.
- If `SUPERADMIN_EMAIL` already exists with another role, startup fails to avoid hidden privilege conflicts.
- Bootstrap is skipped in `NODE_ENV=test`.

## 4. Swagger Setup

- Swagger is configured in `src/main.ts`.
- UI path: `/docs`.
- JSON path: `/docs-json`.
- Bearer auth scheme name: `bearer`.
- `persistAuthorization` is enabled.
- Common error response DTO is defined in `src/common/dto/error-response.dto.ts`.

Auth controller Swagger coverage includes:

- request body DTOs
- response DTOs
- `400 Bad Request`
- `401 Unauthorized`
- `409 Conflict`
- `429 Too Many Requests`
- Bearer auth on protected endpoints

## 5. Superadmin Access Pattern

Added decorator:

- `@SuperAdminOnly()`

The decorator combines:

- `JwtAuthGuard`
- `RolesGuard`
- `@Roles(UserRole.SUPERADMIN)`

Recommended future pattern:

- Do not duplicate every domain endpoint under `/superadmin`.
- Keep domain logic in its own modules.
- Let `SUPERADMIN` bypass ownership checks where appropriate inside domain services/guards.
- Use `/superadmin/*` only for platform-owner operations that do not naturally belong to a domain endpoint.

## 6. Superadmin User Endpoints

Controller:

- `src/superadmin/controllers/superadmin-users.controller.ts`

Endpoints:

- `POST /superadmin/users`
  - Create a user with any platform role.
- `GET /superadmin/users`
  - List users with pagination and filters.
  - Supported filters: `page`, `limit`, `role`, `isActive`, `search`.
- `GET /superadmin/users/:id`
  - Get user by id.
- `PATCH /superadmin/users/:id/role`
  - Change user role.
  - A superadmin cannot demote their own account.
- `PATCH /superadmin/users/:id/status`
  - Activate or disable a user account.
  - A superadmin cannot disable their own account.
- `PATCH /superadmin/users/:id/password`
  - Reset a user password.

## 7. Repository Support

`UsersRepository` now supports:

- `findMany`
- `count`
- `update`

Filtering supports:

- role
- active status
- case-insensitive search by email, first name, last name, phone and company name.

## 8. Tests & Verification

Verified commands:

- `npx prisma generate`
- `npm run build`
- `npm test`
- `npm run test:auth`
- `npm run test:e2e`

Current test coverage added/updated:

- Public `ADMIN` registration is rejected.
- Superadmin service can create users.
- Duplicate user creation is rejected.
- Superadmin cannot demote own account.
- Bootstrap superadmin is created from env when missing.

Known local setup note:

- `npx prisma migrate dev` needs a reachable PostgreSQL database.
- During implementation, local PostgreSQL at `localhost:5432` was not reachable, so the migration file was created but not applied.
